const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionsBitField,
    ChannelType,
    AttachmentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const ModMailConfig = require('../models/modmail/ModMailConfig');
const ModMailThread = require('../models/modmail/ModMailThread');
const ModMailMessage = require('../models/modmail/ModMailMessage');
const ModMailStats = require('../models/modmail/ModMailStats');
const fs = require('fs').promises;
const path = require('path');

// Cache for configurations
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ModMailHandler {
    constructor(client) {
        this.client = client;
        this.setupEventListeners();
        this.startCleanupInterval();
    }

    setupEventListeners() {
        this.client.on('messageCreate', this.handleMessage.bind(this));
        this.client.on('interactionCreate', this.handleInteraction.bind(this));
        this.client.on('guildDelete', this.handleGuildDelete.bind(this));
    }

    startCleanupInterval() {
        // Auto-close inactive threads after 6 hours with user notification
        setInterval(async () => {
            try {
                const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
                const inactiveThreads = await ModMailThread.find({
                    status: 'open',
                    lastActivity: { $lt: sixHoursAgo }
                });

                for (const thread of inactiveThreads) {
                    //  console.log(`Auto-closing inactive thread ${thread._id} - no activity in 6 hours`);
                    await this.closeInactiveThread(thread);
                }
            } catch (error) {
                console.error('Error in auto-close inactive threads:', error);
            }
        }, 30 * 60 * 1000); // Check every 30 minutes

        // Cleanup stale threads every hour
        setInterval(() => this.cleanupStaleThreads(), 60 * 60 * 1000);

        // Clear cache every hour
        setInterval(() => {
            configCache.clear();
            //  console.log('ModMail cache cleared');
        }, 60 * 60 * 1000);
    }

    async getConfig(guildId) {
        const cached = configCache.get(guildId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        const config = await ModMailConfig.findOne({ guildId, status: true });
        configCache.set(guildId, {
            data: config,
            timestamp: Date.now()
        });

        return config;
    }

    // FIXED: More robust guild fetching with better fallbacks
    async fetchGuildAdvanced(guildId) {
        // CRITICAL FIX: Ensure guildId is always a string
        const cleanGuildId = Array.isArray(guildId) ? guildId[0] : guildId;
        // console.log(`[ADVANCED FETCH] Attempting to fetch guild: ${cleanGuildId} (was: ${guildId})`);

        // Method 1: Direct cache get
        let guild = this.client.guilds.cache.get(cleanGuildId);
        if (guild) {
            //    console.log(`[METHOD 1] Guild found in cache.get: ${guild.name}`);
            return guild;
        }

        // Method 2: Cache find (more thorough)
        guild = this.client.guilds.cache.find(g => g.id === cleanGuildId);
        if (guild) {
            // console.log(`[METHOD 2] Guild found in cache.find: ${guild.name}`);
            return guild;
        }

        // Method 3: Cache find by string comparison (in case of type mismatch)
        guild = this.client.guilds.cache.find(g => g.id.toString() === cleanGuildId.toString());
        if (guild) {
            //  console.log(`[METHOD 3] Guild found in cache.find (string): ${guild.name}`);
            return guild;
        }

        // Method 4: Direct fetch from API
        try {
            //  console.log(`[METHOD 4] Fetching guild from API...`);
            guild = await this.client.guilds.fetch(cleanGuildId);
            if (guild && guild.name) {
                //  console.log(`[METHOD 4] Successfully fetched guild from API: ${guild.name}`);
                return guild;
            }
        } catch (error) {
            console.error(`[METHOD 4] Failed to fetch guild ${cleanGuildId}:`, error.message);
        }

        // Method 5: Manual search through cache values
        //  console.log(`[METHOD 5] Manual search through cache values...`);
        for (const [id, g] of this.client.guilds.cache) {
            if (id === cleanGuildId || id.toString() === cleanGuildId.toString()) {
                //   console.log(`[METHOD 5] Found guild in manual search: ${g.name}`);
                return g;
            }
        }

        console.error(`[FINAL] Could not find guild ${cleanGuildId} using any method`);
        return null;
    }

    // FIXED: More robust channel fetching
    async fetchChannelAdvanced(guild, channelId) {
        if (!guild) {
            console.error(`[CHANNEL FETCH] No guild provided for channel ${channelId}`);
            return null;
        }

        // CRITICAL FIX: Ensure channelId is always a string
        const cleanChannelId = Array.isArray(channelId) ? channelId[0] : channelId;
        // console.log(`[CHANNEL FETCH] Attempting to fetch channel: ${cleanChannelId} in guild: ${guild.name}`);

        // Method 1: Direct cache get
        let channel = guild.channels.cache.get(cleanChannelId);
        if (channel) {
            //  console.log(`[CHANNEL METHOD 1] Channel found in cache: ${channel.name} (${channel.type})`);
            return channel;
        }

        // Method 2: Cache find
        channel = guild.channels.cache.find(c => c.id === cleanChannelId);
        if (channel) {
            //   console.log(`[CHANNEL METHOD 2] Channel found in cache.find: ${channel.name} (${channel.type})`);
            return channel;
        }

        // Method 3: Cache find with string comparison
        channel = guild.channels.cache.find(c => c.id.toString() === cleanChannelId.toString());
        if (channel) {
            //  console.log(`[CHANNEL METHOD 3] Channel found in cache.find (string): ${channel.name} (${channel.type})`);
            return channel;
        }

        // Method 4: Fetch from API
        try {
            // console.log(`[CHANNEL METHOD 4] Fetching channel from API...`);
            channel = await guild.channels.fetch(cleanChannelId);
            if (channel) {
                // console.log(`[CHANNEL METHOD 4] Successfully fetched channel: ${channel.name} (${channel.type})`);
                return channel;
            }
        } catch (error) {
            console.error(`[CHANNEL METHOD 4] Failed to fetch channel ${cleanChannelId}:`, error.message);
        }

        console.error(`[CHANNEL FINAL] Could not find channel ${cleanChannelId} in guild ${guild.name}`);
        return null;
    }

    async handleMessage(message) {
        if (message.author.bot) return;

        // Handle DM messages
        if (message.channel.type === ChannelType.DM) {
            return this.handleDMMessage(message);
        }

        // Handle thread replies
        if (message.channel.isThread()) {
            return this.handleThreadReply(message);
        }
    }

    async handleDMMessage(message) {
        const user = message.author;

        // Check for close command
        if (message.content.toLowerCase() === 'close') {
            const openThreads = await ModMailThread.find({ userId: user.id, status: 'open' });
            if (openThreads.length === 0) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setTitle('❌ No Open Threads')
                        .setDescription('You don\'t have any open modmail threads to close.')
                        .setTimestamp()]
                });
            }

            for (const thread of openThreads) {
                await this.closeModMailThread(thread, user, 'Closed by user');
            }

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Threads Closed')
                    .setDescription(`Successfully closed ${openThreads.length} open modmail thread(s).`)
                    .setFooter({ text: 'You can send a new message to create another modmail' })
                    .setTimestamp()]
            });
        }

        // Get user's mutual guilds with active modmail
        const validGuilds = await this.getValidGuilds(user.id);

        if (validGuilds.length === 0) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('❌ No Available Servers')
                    .setDescription('I couldn\'t find any servers where you can create a modmail ticket. Make sure you\'re in a server with me that has modmail enabled.')
                    .setFooter({ text: 'Type "close" to close any existing modmail threads' })
                    .setTimestamp()]
            });
        }

        // Check for existing threads
        const existingThreads = await ModMailThread.find({
            userId: user.id,
            status: 'open'
        });

        // Forward to existing threads
        if (existingThreads.length > 0) {
            for (const thread of existingThreads) {
                const guild = await this.fetchGuildAdvanced(thread.guildId);
                if (guild) {
                    const channel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);
                    if (channel) {
                        await this.forwardToStaff(message, channel, thread._id);
                    }
                }
            }

            // Send confirmation with close button
            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`user_close_all_${user.id}_${Date.now()}`)
                    .setLabel('Close All Modmail Threads')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Message Forwarded')
                    .setDescription('Your message has been forwarded to the staff team(s).')
                    .setFooter({ text: 'Type "close" or click the button below to close all threads' })
                    .setTimestamp()],
                components: [closeButton]
            });
        }
        // Server selection or direct creation
        if (validGuilds.length > 0) {
            return this.showServerSelection(message, validGuilds);
        }

    }

    async getValidGuilds(userId) {
        const validGuilds = [];


        for (const [guildId, guild] of this.client.guilds.cache) {
            try {
                // Check if user is in this guild
                let member = guild.members.cache.get(userId);
                if (!member) {
                    try {
                        member = await guild.members.fetch(userId);
                    } catch (error) {
                        // console.log(`[VALID GUILDS] User ${userId} not in guild ${guild.name}`);
                        continue; // User not in this guild
                    }
                }

                const config = await this.getConfig(guildId);
                if (!config) {
                    //console.log(`[VALID GUILDS] No config for guild ${guild.name}`);
                    continue;
                }

                // Check if user has reached max tickets
                const openTickets = await ModMailThread.countDocuments({
                    userId,
                    guildId,
                    status: 'open'
                });

                if (openTickets >= config.maxOpenTickets) {
                    //console.log(`[VALID GUILDS] User has reached max tickets in ${guild.name}`);
                    continue;
                }

                //console.log(`[VALID GUILDS] Added valid guild: ${guild.name}`);
                validGuilds.push({
                    guildId,
                    name: guild.name,
                    icon: guild.iconURL(),
                    memberCount: guild.memberCount
                });
            } catch (error) {
                console.error(`Error checking guild ${guildId}:`, error);
            }
        }

        //console.log(`[VALID GUILDS] Found ${validGuilds.length} valid guilds`);
        return validGuilds;
    }

    async showServerSelection(message, validGuilds) {
        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('🏰 Select Server')
            .setDescription('You\'re in multiple servers with modmail enabled. Please select which server you want to contact:')
            .addFields(
                validGuilds.map(guild => ({
                    name: guild.name,
                    value: `👥 ${guild.memberCount.toLocaleString()} members`,
                    inline: true
                }))
            )
            .setFooter({ text: 'Your message will be sent after selecting a server' })
            .setTimestamp();

        const options = validGuilds.map(guild => ({
            label: guild.name,
            description: `Create modmail in ${guild.name}`,
            value: guild.guildId,
            emoji: '📬'
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`modmail_server_select_${message.author.id}_${Date.now()}`)
            .setPlaceholder('Choose a server...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        return message.reply({
            embeds: [embed],
            components: [row]
        });
    }

    async createModMailThread(message, guildId, category = 'general', priority = 'medium') {
        try {
            // CRITICAL FIX: Ensure guildId is always a string, not array
            const cleanGuildId = Array.isArray(guildId) ? guildId[0] : guildId;
            // console.log(`[CREATE THREAD] Starting modmail thread creation for guild: ${cleanGuildId} (original: ${guildId})`);

            const guild = await this.fetchGuildAdvanced(cleanGuildId);
            if (!guild) {
                throw new Error(`Guild ${cleanGuildId} not found after advanced fetch`);
            }

            const config = await this.getConfig(cleanGuildId);
            if (!config) {
                throw new Error(`Config not found for guild ${cleanGuildId}`);
            }

            // console.log(`[CREATE THREAD] Guild: ${guild.name}, logChannelId: ${config.logChannelId}, categoryId: ${config.categoryId}`);

            const logChannel = await this.fetchChannelAdvanced(guild, config.logChannelId);
            if (!logChannel) {
                throw new Error(`Log channel ${config.logChannelId} not found after advanced fetch`);
            }

            // Create thread name
            const threadName = `modmail-${message.author.username}-${Date.now().toString().slice(-6)}`;
            let threadChannel;

            // CRITICAL FIX: Proper category vs thread logic
            if (config.categoryId && config.categoryId.trim() !== '') {
                //console.log(`[CREATE THREAD] Category ID found: ${config.categoryId}, attempting to create text channel`);

                // Try to create text channel in category
                const categoryChannel = await this.fetchChannelAdvanced(guild, config.categoryId);

                if (categoryChannel && categoryChannel.type === ChannelType.GuildCategory) {
                    //console.log('[CREATE THREAD] ✅ Creating TEXT CHANNEL in category');

                    try {
                        threadChannel = await guild.channels.create({
                            name: threadName,
                            type: ChannelType.GuildText,
                            parent: categoryChannel.id,
                            topic: `ModMail thread for ${message.author.tag} (${message.author.id})`,
                            permissionOverwrites: [
                                {
                                    id: guild.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel]
                                },
                                {
                                    id: config.adminRoleId,
                                    allow: [
                                        PermissionsBitField.Flags.ViewChannel,
                                        PermissionsBitField.Flags.SendMessages,
                                        PermissionsBitField.Flags.ManageMessages,
                                        PermissionsBitField.Flags.EmbedLinks,
                                        PermissionsBitField.Flags.AttachFiles
                                    ]
                                }
                            ]
                        });
                        //console.log(`[CREATE THREAD] ✅ TEXT CHANNEL created successfully: ${threadChannel.name}`);
                    } catch (channelCreateError) {
                        console.error(`[CREATE THREAD] ❌ Failed to create text channel:`, channelCreateError);
                        // Fallback to thread creation
                        //console.log('[CREATE THREAD] 🔄 Falling back to thread creation');
                        threadChannel = await logChannel.threads.create({
                            name: threadName,
                            autoArchiveDuration: 4320,
                            reason: `ModMail from ${message.author.tag} (category creation failed)`
                        });
                    }
                } else {
                    //console.log(`[CREATE THREAD] ❌ Category channel not found or invalid type, falling back to thread`);
                    // Category not found or invalid, fallback to thread
                    threadChannel = await logChannel.threads.create({
                        name: threadName,
                        autoArchiveDuration: 4320,
                        reason: `ModMail from ${message.author.tag} (category not found)`
                    });
                }
            } else {
                // No category configured, create thread in logChannel
                //console.log('[CREATE THREAD] 📋 No category configured, creating THREAD in logChannel');
                threadChannel = await logChannel.threads.create({
                    name: threadName,
                    autoArchiveDuration: 4320,
                    reason: `ModMail from ${message.author.tag}`
                });
            }

            //console.log(`[CREATE THREAD] ✅ Final result: ${threadChannel.isThread() ? 'THREAD' : 'TEXT CHANNEL'} created: ${threadChannel.name} (${threadChannel.id})`);

            // CRITICAL FIX: Create database record with clean string guildId
            const thread = new ModMailThread({
                userId: message.author.id,
                guildId: cleanGuildId.toString(), // ENSURE STRING
                threadChannelId: threadChannel.id,
                category,
                priority,
                openedBy: message.author.id,
                openedAt: new Date(),
                lastActivity: new Date()
            });

            await thread.save();
            //console.log(`[CREATE THREAD] Thread saved to database: ${thread._id}`);

            // Create initial embed
            const member = await guild.members.fetch(message.author.id).catch(() => null);
            const userEmbed = new EmbedBuilder()
                .setColor('#5865f2')
                .setAuthor({
                    name: `${message.author.tag} (${message.author.id})`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTitle(`📬 New ModMail - ${category.toUpperCase()}`)
                .setDescription('A new modmail thread has been created.')
                .addFields(
                    { name: '👤 User', value: `<@${message.author.id}>`, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(message.author.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '⚡ Priority', value: this.getPriorityEmoji(priority) + ' ' + priority.toUpperCase(), inline: true },
                    { name: '📋 Type', value: threadChannel.isThread() ? '🧵 Thread' : '📺 Text Channel', inline: true }
                );

            if (member) {
                userEmbed.addFields(
                    { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    {
                        name: '🏷️ Roles', value: member.roles.cache.size > 1 ?
                            member.roles.cache.filter(r => r.id !== guild.id)
                                .sort((a, b) => b.position - a.position)
                                .map(r => `<@&${r.id}>`)
                                .slice(0, 10)
                                .join(', ') : 'None', inline: false
                    }
                );
            }

            // Control buttons with unique IDs
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`reply_modmail_${thread._id}_${message.author.id}`)
                    .setLabel('Reply')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setCustomId(`anon_reply_${thread._id}_${message.author.id}`)
                    .setLabel('Anonymous Reply')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👤'),
                new ButtonBuilder()
                    .setCustomId(`priority_modmail_${thread._id}_${cleanGuildId}`)
                    .setLabel('Priority')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚡'),
                new ButtonBuilder()
                    .setCustomId(`add_note_${thread._id}_${cleanGuildId}`)
                    .setLabel('Note')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId(`close_modmail_${thread._id}_${cleanGuildId}`)
                    .setLabel('Close')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

            const controlMessage = await threadChannel.send({
                content: `<@&${config.adminRoleId}>`,
                embeds: [userEmbed],
                components: [buttons]
            });

            // Store control message ID for later updates
            await ModMailThread.findByIdAndUpdate(thread._id, {
                controlMessageId: controlMessage.id
            });

            // Forward initial message
            await this.forwardToStaff(message, threadChannel, thread._id);

            // Send confirmation to user with close button
            if (config.autoResponse) {
                const userCloseButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`user_close_${message.author.id}_${thread._id}`)
                        .setLabel('Close This Modmail')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

                const confirmEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ ModMail Created')
                    .setDescription(config.welcomeMessage)
                    .addFields(
                        { name: '🏰 Server', value: guild.name, inline: true },
                        { name: '🎫 Thread ID', value: thread._id.toString().slice(-8), inline: true },
                        { name: '⚡ Priority', value: priority.toUpperCase(), inline: true },
                        { name: '📋 Type', value: threadChannel.isThread() ? '🧵 Thread' : '📺 Text Channel', inline: true }
                    )
                    .setFooter({ text: 'Reply to continue • Type "close" or click button to close' })
                    .setTimestamp();

                await message.reply({
                    embeds: [confirmEmbed],
                    components: [userCloseButton]
                });
            }

            // Update stats
            await this.updateStats(cleanGuildId, 'new_thread');

        } catch (error) {
            console.error('[CREATE THREAD] Error creating modmail thread:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Error')
                .setDescription('Failed to create your modmail ticket. Please try again later or contact the server administrators directly.')
                .setTimestamp();

            await message.reply({ embeds: [errorEmbed] });
        }
    }


    async forwardToStaff(message, threadChannel, threadId) {
        const embed = new EmbedBuilder()
            .setColor('#36393f')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(message.content || (message.attachments.size > 0 ? '*Message with attachments only*' : '*No message content*'))
            .setFooter({ text: `ID: ${message.author.id}` })
            .setTimestamp();

        const files = Array.from(message.attachments.values()).map(att => att.url);

        const sent = await threadChannel.send({
            embeds: [embed],
            files: files.length > 0 ? files : undefined
        });

        // Save message to database - FIXED: Handle empty content
        const modmailMessage = new ModMailMessage({
            threadId,
            messageId: sent.id,
            authorId: message.author.id,
            content: message.content || (message.attachments.size > 0 ? '*Message with attachments only*' : '*No message content*'),
            attachments: Array.from(message.attachments.values()).map(att => ({
                name: att.name,
                url: att.url,
                size: att.size
            })),
            isStaff: false
        });

        await modmailMessage.save();

        // Update thread activity
        await ModMailThread.findByIdAndUpdate(threadId, {
            lastActivity: new Date(),
            $inc: { messageCount: 1 }
        });
    }

    async handleThreadReply(message) {
        if (message.author.bot) return;

        const thread = await ModMailThread.findOne({
            threadChannelId: message.channel.id,
            status: 'open'
        });

        if (!thread) return;

        const guild = await this.fetchGuildAdvanced(thread.guildId);
        const config = await this.getConfig(guild.id);

        if (!config) return;

        // Check staff permissions
        const member = message.member;
        const isStaff = member.roles.cache.has(config.adminRoleId) ||
            member.id === guild.ownerId ||
            member.permissions.has(PermissionsBitField.Flags.ManageGuild);

        if (!isStaff) {
            return message.delete().catch(() => { });
        }

        try {
            const user = await this.client.users.fetch(thread.userId);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: `${member.displayName} (Staff)`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(message.content || (message.attachments.size > 0 ? '*Message with attachments only*' : '*No message content*'))
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            const files = Array.from(message.attachments.values()).map(att => att.url);

            await user.send({
                embeds: [embed],
                files: files.length > 0 ? files : undefined
            });

            // Save message to database - FIXED: Handle empty content
            const modmailMessage = new ModMailMessage({
                threadId: thread._id,
                messageId: message.id,
                authorId: message.author.id,
                content: message.content || (message.attachments.size > 0 ? '*Message with attachments only*' : '*No message content*'),
                attachments: Array.from(message.attachments.values()).map(att => ({
                    name: att.name,
                    url: att.url,
                    size: att.size
                })),
                isStaff: true
            });

            await modmailMessage.save();

            // Update thread
            await ModMailThread.findByIdAndUpdate(thread._id, {
                lastActivity: new Date(),
                staffResponded: true,
                $inc: { messageCount: 1 }
            });

            await message.react('✅');

        } catch (error) {
            console.error('Error forwarding staff reply:', error);
            await message.react('❌');

            const errorEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Delivery Failed')
                .setDescription('Failed to deliver your message to the user. They may have blocked the bot or disabled DMs.')
                .setTimestamp();

            await message.reply({ embeds: [errorEmbed] });
        }
    }

    async handleInteraction(interaction) {
        try {
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId.startsWith('modmail_server_select_')) {
                    await this.handleServerSelection(interaction);
                } else if (interaction.customId.startsWith('priority_select_')) {
                    await this.handlePrioritySelection(interaction);
                }
            } else if (interaction.isButton()) {
                const customId = interaction.customId;

                if (customId.startsWith('reply_modmail_')) {
                    await this.handleNormalReply(interaction);
                } else if (customId.startsWith('anon_reply_')) {
                    await this.handleAnonymousReply(interaction);
                } else if (customId.startsWith('close_modmail_')) {
                    await this.handleCloseButton(interaction);
                } else if (customId.startsWith('priority_modmail_')) {
                    await this.handlePriorityButton(interaction);
                } else if (customId.startsWith('add_note_')) {
                    await this.handleAddNote(interaction);
                } else if (customId.startsWith('user_close_')) {
                    await this.handleUserClose(interaction);
                }
            } else if (interaction.isModalSubmit()) {
                if (interaction.customId.startsWith('reply_modal_')) {
                    await this.handleReplyModal(interaction);
                } else if (interaction.customId.startsWith('anon_modal_')) {
                    await this.handleAnonymousModal(interaction);
                } else if (interaction.customId.startsWith('note_modal_')) {
                    await this.handleNoteModal(interaction);
                } else if (interaction.customId.startsWith('close_modal_')) {
                    await this.handleCloseModal(interaction);
                }
            }
        } catch (error) {
            console.error('ModMail interaction error:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Error')
                .setDescription('An error occurred while processing your interaction.')
                .setTimestamp();

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], flags: 64 });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], flags: 64 });
                }
            } catch (err) {
                console.error('Error sending error message:', err);
            }
        }
    }

    // FIXED: Server selection with proper array-to-string conversion
    async handleServerSelection(interaction) {
        const parts = interaction.customId.split('_');
        const userId = parts[3];

        // CRITICAL FIX: Properly extract guildId as string
        const guildIdRaw = interaction.values;
        const guildId = Array.isArray(guildIdRaw) ? guildIdRaw : guildIdRaw;

        // console.log('[SERVER SELECTION] Server selection:', { 
        //     userId, 
        //     guildIdRaw, 
        //     guildId: guildId,
        //     values: interaction.values 
        // });

        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: '❌ This selection menu is not for you.',
                flags: 64
            });
        }

        await interaction.deferUpdate();

        try {
            const dmChannel = await interaction.user.createDM();
            const messages = await dmChannel.messages.fetch({ limit: 10 });
            const originalMessage = messages.find(m =>
                m.author.id === interaction.user.id &&
                !m.embeds.some(e => e.title?.includes('Select Server'))
            );

            if (originalMessage) {
                // CRITICAL FIX: Pass clean string guildId
                await this.createModMailThread(originalMessage, guildId);
            }

            // FIXED: Use advanced guild fetching
            const guild = await this.fetchGuildAdvanced(guildId);
            if (!guild) {
                throw new Error(`Guild ${guildId} not found after advanced fetch`);
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Server Selected')
                .setDescription(`Your modmail has been created in **${guild.name}**`)
                .setTimestamp();

            await interaction.editReply({
                embeds: [successEmbed],
                components: []
            });

        } catch (error) {
            console.error('[SERVER SELECTION] Error handling server selection:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ Error')
                .setDescription('Failed to create your modmail. Please try sending a new message.')
                .setTimestamp();

            await interaction.editReply({
                embeds: [errorEmbed],
                components: []
            });
        }
    }

    async handleNormalReply(interaction) {
        const threadId = interaction.customId.split('_')[2];

        const modal = new ModalBuilder()
            .setCustomId(`reply_modal_${threadId}_${interaction.user.id}`)
            .setTitle('Reply to User')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('reply_message')
                        .setLabel('Your reply message')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Enter your reply here...')
                        .setRequired(false)
                        .setMinLength(0)
                        .setMaxLength(3900)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('attachment_urls')
                        .setLabel('Attachment URLs (optional)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Paste image/file URLs here, one per line...')
                        .setRequired(false)
                        .setMaxLength(1000)
                )
            );

        await interaction.showModal(modal);
    }

    async handleReplyModal(interaction) {
        const threadId = interaction.customId.split('_')[2];
        const messageContent = interaction.fields.getTextInputValue('reply_message');
        const attachmentUrls = interaction.fields.getTextInputValue('attachment_urls');

        await interaction.deferReply({ flags: 64 });

        // Validate that either content or attachments are provided
        if (!messageContent.trim() && !attachmentUrls.trim()) {
            return interaction.followUp({
                content: '❌ Please provide either a message or attachment URLs.',
                flags: 64
            });
        }

        try {
            const thread = await ModMailThread.findById(threadId);
            if (!thread) {
                return interaction.followUp({ content: '❌ Thread not found.', flags: 64 });
            }

            const guild = await this.fetchGuildAdvanced(thread.guildId);
            if (!guild) {
                return interaction.followUp({ content: '❌ Guild not found.', flags: 64 });
            }

            const user = await this.client.users.fetch(thread.userId);
            if (!user) {
                return interaction.followUp({ content: '❌ User not found.', flags: 64 });
            }

            const member = guild.members.cache.get(interaction.user.id) ||
                await guild.members.fetch(interaction.user.id).catch(() => null);

            // Parse attachment URLs
            const files = [];
            if (attachmentUrls && attachmentUrls.trim()) {
                const urls = attachmentUrls.split('\n').map(url => url.trim()).filter(url => url);
                for (const url of urls) {
                    if (this.isValidUrl(url)) {
                        files.push(url);
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `${member?.displayName || interaction.user.username} (Staff)`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription(messageContent || (files.length > 0 ? '*Message with attachments only*' : '*No content*'))
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            await user.send({
                embeds: [embed],
                files: files.length > 0 ? files : undefined
            });

            // Log message in thread channel
            const threadChannel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);
            if (threadChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#36393f')
                    .setAuthor({
                        name: `Reply sent by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(messageContent || (files.length > 0 ? '*Message with attachments only*' : '*No content*'))
                    .setFooter({ text: files.length > 0 ? `Message sent with ${files.length} attachment(s)` : 'Message sent to user' })
                    .setTimestamp();

                await threadChannel.send({
                    embeds: [logEmbed],
                    files: files.length > 0 ? files : undefined
                });
            }

            // Save message to DB - FIXED: Handle empty content
            const modMailMsg = new ModMailMessage({
                threadId: thread._id,
                messageId: 'staff_reply_' + Date.now(),
                authorId: interaction.user.id,
                content: messageContent || (files.length > 0 ? '*Message with attachments only*' : '*No content*'),
                attachments: files.map(url => ({ name: 'Attachment', url: url, size: 0 })),
                isStaff: true
            });
            await modMailMsg.save();

            await ModMailThread.findByIdAndUpdate(thread._id, {
                lastActivity: new Date(),
                staffResponded: true,
                $inc: { messageCount: 1 }
            });

            const successMsg = files.length > 0 ?
                `✅ Reply sent to user with ${files.length} attachment(s).` :
                '✅ Reply sent to user.';

            await interaction.followUp({ content: successMsg, flags: 64 });
        } catch (error) {
            console.error('Error sending normal reply:', error);
            await interaction.followUp({ content: '❌ Failed to send reply.', flags: 64 });
        }
    }

    async handleAnonymousReply(interaction) {
        const threadId = interaction.customId.split('_')[2];

        const modal = new ModalBuilder()
            .setCustomId(`anon_modal_${threadId}_${interaction.user.id}`)
            .setTitle('Anonymous Reply')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('anon_message')
                        .setLabel('Your anonymous message')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Enter your anonymous reply here...')
                        .setRequired(false)
                        .setMinLength(0)
                        .setMaxLength(3900)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('anon_attachment_urls')
                        .setLabel('Attachment URLs (optional)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Paste image/file URLs here, one per line...')
                        .setRequired(false)
                        .setMaxLength(1000)
                )
            );

        await interaction.showModal(modal);
    }

    async handleAnonymousModal(interaction) {
        const threadId = interaction.customId.split('_')[2];
        const message = interaction.fields.getTextInputValue('anon_message');
        const attachmentUrls = interaction.fields.getTextInputValue('anon_attachment_urls');

        await interaction.deferReply({ flags: 64 });

        // Validate that either content or attachments are provided
        if (!message.trim() && !attachmentUrls.trim()) {
            return interaction.followUp({
                content: '❌ Please provide either a message or attachment URLs.',
                flags: 64
            });
        }

        try {
            const thread = await ModMailThread.findById(threadId);
            if (!thread) {
                return interaction.followUp({ content: '❌ Thread not found.', flags: 64 });
            }

            const user = await this.client.users.fetch(thread.userId);
            const guild = await this.fetchGuildAdvanced(thread.guildId);

            if (!user || !guild) {
                return interaction.followUp({ content: '❌ User or guild not found.', flags: 64 });
            }

            // Parse attachment URLs
            const files = [];
            if (attachmentUrls && attachmentUrls.trim()) {
                const urls = attachmentUrls.split('\n').map(url => url.trim()).filter(url => url);
                for (const url of urls) {
                    if (this.isValidUrl(url)) {
                        files.push(url);
                    }
                }
            }

            // Send anonymous message to user
            const anonEmbed = new EmbedBuilder()
                .setColor('#36393f')
                .setAuthor({
                    name: 'Server Staff',
                    iconURL: guild.iconURL()
                })
                .setDescription(message || (files.length > 0 ? '*Message with attachments only*' : '*No content*'))
                .setFooter({ text: `${guild.name} • Anonymous Reply`, iconURL: guild.iconURL() })
                .setTimestamp();

            await user.send({
                embeds: [anonEmbed],
                files: files.length > 0 ? files : undefined
            });

            // Log in thread
            const logEmbed = new EmbedBuilder()
                .setColor('#36393f')
                .setAuthor({
                    name: `Anonymous Reply by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription(message || (files.length > 0 ? '*Message with attachments only*' : '*No content*'))
                .setFooter({ text: files.length > 0 ? `Anonymous message sent with ${files.length} attachment(s)` : 'This message was sent anonymously to the user' })
                .setTimestamp();

            const threadChannel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);
            if (threadChannel) {
                await threadChannel.send({
                    embeds: [logEmbed],
                    files: files.length > 0 ? files : undefined
                });
            }

            // Save to database - FIXED: Handle empty content
            const modmailMessage = new ModMailMessage({
                threadId: thread._id,
                messageId: 'anonymous_' + Date.now(),
                authorId: interaction.user.id,
                content: message || (files.length > 0 ? '*Message with attachments only*' : '*No content*'),
                attachments: files.map(url => ({ name: 'Attachment', url: url, size: 0 })),
                isStaff: true,
                isAnonymous: true
            });
            await modmailMessage.save();

            // Update thread activity
            await ModMailThread.findByIdAndUpdate(thread._id, {
                lastActivity: new Date(),
                staffResponded: true,
                $inc: { messageCount: 1 }
            });

            const successMsg = files.length > 0 ?
                `✅ Anonymous reply sent successfully with ${files.length} attachment(s).` :
                '✅ Anonymous reply sent successfully.';

            await interaction.followUp({ content: successMsg, flags: 64 });

        } catch (error) {
            console.error('Error sending anonymous reply:', error);
            await interaction.followUp({ content: '❌ Failed to send anonymous reply. Please try again.', flags: 64 });
        }
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    async handleUserClose(interaction) {

        const parts = interaction.customId.split('_');


        const userId = parts[2];
        const threadId = parts[3];



        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: '❌ This button is not for you.',
                flags: 64
            });
        }

        await interaction.deferReply({ flags: 64 });

        try {

            const openThreads = await ModMailThread.find({
                userId: userId,
                status: 'open'
            });

            if (openThreads.length === 0) {
                return interaction.followUp({
                    content: '⚠️ You don\'t have any open modmail threads.',
                    flags: 64
                });
            }


            for (const thread of openThreads) {
                await this.closeModMailThread(thread, interaction.user, 'Closed by user');
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Modmail Closed')
                .setDescription(`Successfully closed **${openThreads.length}** modmail thread(s).`)
                .setFooter({ text: 'Send a new message to create another modmail' })
                .setTimestamp();

            await interaction.followUp({
                embeds: [embed],
                flags: 64
            });

        } catch (error) {
            console.error('Error closing user threads:', error);
            await interaction.followUp({
                content: '❌ Failed to close threads. Please try again later.',
                flags: 64
            });
        }
    }





    async closeInactiveThread(thread) {
        try {
            const user = await this.client.users.fetch(thread.userId);
            const guild = await this.fetchGuildAdvanced(thread.guildId);

            // Notify user about auto-closure
            const inactiveEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('⏰ ModMail Auto-Closed')
                .setDescription(`Your modmail with **${guild?.name || 'Unknown Server'}** has been automatically closed due to inactivity.`)
                .addFields(
                    { name: '📅 Opened', value: `<t:${Math.floor(thread.openedAt.getTime() / 1000)}:R>`, inline: true },
                    { name: '⏱️ Last Activity', value: `<t:${Math.floor(thread.lastActivity.getTime() / 1000)}:R>`, inline: true },
                    { name: '🔄 Need Help?', value: 'Send a new message to open another modmail!', inline: false }
                )
                .setFooter({ text: 'Auto-closed after 6 hours of inactivity' })
                .setTimestamp();

            await user.send({ embeds: [inactiveEmbed] }).catch(() => {
                //console.log(`Could not notify user ${thread.userId} about auto-closure`);
            });

            // Close the thread
            await this.closeModMailThread(thread, this.client.user, 'Auto-closed due to inactivity (6 hours)');

        } catch (error) {
            console.error('Error closing inactive thread:', error);
        }
    }

    async handleCloseButton(interaction) {
        const threadId = interaction.customId.split('_')[2];

        const modal = new ModalBuilder()
            .setCustomId(`close_modal_${threadId}_${interaction.user.id}`)
            .setTitle('Close ModMail Thread')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('close_reason')
                        .setLabel('Reason for closing (optional)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Enter reason for closing this modmail...')
                        .setRequired(false)
                        .setMaxLength(500)
                )
            );

        await interaction.showModal(modal);
    }

    async handlePriorityButton(interaction) {
        const threadId = interaction.customId.split('_')[2];

        const priorityMenu = new StringSelectMenuBuilder()
            .setCustomId(`priority_select_${threadId}_${interaction.user.id}`)
            .setPlaceholder('Select new priority level')
            .addOptions([
                {
                    label: 'Low Priority',
                    description: 'Non-urgent matter',
                    value: 'low',
                    emoji: '🟢'
                },
                {
                    label: 'Medium Priority',
                    description: 'Standard priority',
                    value: 'medium',
                    emoji: '🟡'
                },
                {
                    label: 'High Priority',
                    description: 'Important matter',
                    value: 'high',
                    emoji: '🟠'
                },
                {
                    label: 'Urgent Priority',
                    description: 'Requires immediate attention',
                    value: 'urgent',
                    emoji: '🔴'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(priorityMenu);

        await interaction.reply({
            content: 'Select the new priority level for this modmail:',
            components: [row],
            flags: 64
        });
    }

    async handleAddNote(interaction) {
        const threadId = interaction.customId.split('_')[2];

        const modal = new ModalBuilder()
            .setCustomId(`note_modal_${threadId}_${interaction.user.id}`)
            .setTitle('Add Internal Note')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('note_content')
                        .setLabel('Internal Note (Staff Only)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Add an internal note for staff reference...')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(1000)
                )
            );

        await interaction.showModal(modal);
    }

    async handleNoteModal(interaction) {
        const threadId = interaction.customId.split('_')[2];
        const noteContent = interaction.fields.getTextInputValue('note_content');

        await interaction.deferReply({ flags: 64 });

        try {
            const thread = await ModMailThread.findByIdAndUpdate(
                threadId,
                {
                    notes: noteContent,
                    lastActivity: new Date()
                },
                { new: true }
            );

            if (!thread) {
                return interaction.followUp({ content: '❌ Thread not found.', flags: 64 });
            }

            const guild = await this.fetchGuildAdvanced(thread.guildId);
            const threadChannel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);

            if (threadChannel) {
                const noteEmbed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setAuthor({
                        name: `Note added by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(noteContent)
                    .setFooter({ text: 'Internal Staff Note - Not visible to user' })
                    .setTimestamp();

                await threadChannel.send({ embeds: [noteEmbed] });
            }

            await interaction.followUp({ content: '✅ Internal note added successfully.', flags: 64 });

        } catch (error) {
            console.error('Error adding note:', error);
            await interaction.followUp({ content: '❌ Failed to add note. Please try again.', flags: 64 });
        }
    }

    async handlePrioritySelection(interaction) {
        const threadId = interaction.customId.split('_')[2];

        // ULTRA ROBUST FIX: Multiple fallback methods to extract string
        let newPriority;
        const rawValues = interaction.values;

        //console.log('[PRIORITY DEBUG] Raw values:', rawValues, typeof rawValues);

        if (Array.isArray(rawValues)) {
            newPriority = rawValues[0];
        } else {
            newPriority = rawValues;
        }

        // Additional safety checks
        if (Array.isArray(newPriority)) {
            newPriority = newPriority;
        }

        // Ensure it's definitely a string
        newPriority = String(newPriority);

        //console.log('[PRIORITY DEBUG] Final newPriority:', newPriority, typeof newPriority);

        // Validate the priority value
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(newPriority)) {
            console.error('[PRIORITY] Invalid priority value:', newPriority);
            return interaction.reply({
                content: '❌ Invalid priority value selected.',
                flags: 64
            });
        }

        await interaction.deferUpdate();

        try {
            const thread = await ModMailThread.findByIdAndUpdate(
                threadId,
                { priority: newPriority, lastActivity: new Date() },
                { new: true }
            );

            if (!thread) {
                return interaction.followUp({ content: '❌ Thread not found.', flags: 64 });
            }

            const guild = await this.fetchGuildAdvanced(thread.guildId);
            const threadChannel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);

            // FIXED: Update the original control message with new priority
            if (threadChannel && thread.controlMessageId) {
                try {
                    const controlMessage = await threadChannel.messages.fetch(thread.controlMessageId);
                    const originalEmbed = controlMessage.embeds[0];

                    // Update the priority field in the embed
                    const updatedEmbed = new EmbedBuilder()
                        .setColor(originalEmbed.color)
                        .setAuthor(originalEmbed.author)
                        .setTitle(originalEmbed.title)
                        .setDescription(originalEmbed.description)
                        .addFields(
                            originalEmbed.fields.map(field => {
                                if (field.name === '⚡ Priority') {
                                    // ULTRA SAFE: Ensure newPriority is string before calling toUpperCase
                                    const priorityString = String(newPriority);
                                    return {
                                        name: '⚡ Priority',
                                        value: this.getPriorityEmoji(priorityString) + ' ' + priorityString.toUpperCase(),
                                        inline: true
                                    };
                                }
                                return field;
                            })
                        )
                        .setTimestamp(originalEmbed.timestamp);

                    await controlMessage.edit({ embeds: [updatedEmbed], components: controlMessage.components });
                } catch (error) {
                    console.error('Error updating control message:', error);
                }
            }

            // ULTRA SAFE: Ensure newPriority is string before calling toUpperCase
            const priorityString = String(newPriority);
            const priorityEmbed = new EmbedBuilder()
                .setColor('#5865f2')
                .setTitle('⚡ Priority Updated')
                .setDescription(`Thread priority changed to **${priorityString.toUpperCase()}** ${this.getPriorityEmoji(priorityString)}`)
                .setFooter({ text: `Updated by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.editReply({
                embeds: [priorityEmbed],
                components: []
            });

        } catch (error) {
            console.error('Error updating priority:', error);
            await interaction.followUp({ content: '❌ Failed to update priority.', flags: 64 });
        }
    }



    async handleCloseModal(interaction) {
        const threadId = interaction.customId.split('_')[2];
        const reason = interaction.fields.getTextInputValue('close_reason') || 'No reason provided';

        await interaction.deferReply({ flags: 64 });

        try {
            const thread = await ModMailThread.findById(threadId);
            if (!thread) {
                return interaction.followUp({ content: '❌ Thread not found.', flags: 64 });
            }

            const guild = await this.fetchGuildAdvanced(thread.guildId);
            const config = await this.getConfig(guild.id);

            // Check permissions
            const member = interaction.member;
            const isStaff = member.roles.cache.has(config.adminRoleId) ||
                member.id === guild.ownerId ||
                member.permissions.has(PermissionsBitField.Flags.ManageGuild);

            if (!isStaff) {
                return interaction.followUp({ content: '❌ You do not have permission to close this modmail.', flags: 64 });
            }

            // Close the thread
            await this.closeModMailThread(thread, interaction.user, reason);

            await interaction.followUp({ content: '✅ ModMail thread closed successfully.', flags: 64 });

        } catch (error) {
            console.error('Error closing modmail:', error);
            await interaction.followUp({ content: '❌ Failed to close modmail thread.', flags: 64 });
        }
    }

    async closeModMailThread(thread, closedBy, reason = 'No reason provided') {
        try {
            const guild = await this.fetchGuildAdvanced(thread.guildId);
            const threadChannel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);

            // FIXED: Disable all buttons when closing
            if (threadChannel && thread.controlMessageId) {
                try {
                    const controlMessage = await threadChannel.messages.fetch(thread.controlMessageId);

                    // Create disabled buttons
                    const disabledButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('disabled_reply')
                            .setLabel('Reply')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('💬')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('disabled_anon')
                            .setLabel('Anonymous Reply')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('👤')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('disabled_priority')
                            .setLabel('Priority')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⚡')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('disabled_note')
                            .setLabel('Note')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('📝')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('disabled_close')
                            .setLabel('Closed')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒')
                            .setDisabled(true)
                    );

                    // Update the original embed to show closed status
                    const originalEmbed = controlMessage.embeds[0];
                    const closedEmbed = new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setAuthor(originalEmbed.author)
                        .setTitle('🔒 ModMail Closed - ' + originalEmbed.title.split(' - ')[1])
                        .setDescription('This modmail thread has been closed.')
                        .addFields(originalEmbed.fields)
                        .addFields(
                            { name: '🔒 Closed By', value: closedBy.tag, inline: true },
                            { name: '📝 Reason', value: reason, inline: true },
                            { name: '⏰ Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setTimestamp();

                    await controlMessage.edit({
                        embeds: [closedEmbed],
                        components: [disabledButtons]
                    });
                } catch (error) {
                    console.error('Error updating control message on close:', error);
                }
            }

            // Generate transcript
            const messages = await ModMailMessage.find({ threadId: thread._id }).sort({ createdAt: 1 });
            const transcript = messages.map(msg =>
                `[${msg.createdAt.toISOString()}] ${msg.isStaff ? 'Staff' : 'User'}: ${msg.content}`
            ).join('\n');

            // Create transcript file
            const transcriptPath = path.join(__dirname, '..', 'temp', `modmail-${thread._id}-${Date.now()}.txt`);
            await fs.mkdir(path.dirname(transcriptPath), { recursive: true });
            await fs.writeFile(transcriptPath, transcript);

            const transcriptAttachment = new AttachmentBuilder()
                .setFile(transcriptPath)
                .setName(`modmail-transcript-${thread._id.toString().slice(-8)}.txt`);

            // Notify user
            try {
                const user = await this.client.users.fetch(thread.userId);
                const closedEmbed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('🔒 ModMail Closed')
                    .setDescription(`Your modmail with **${guild.name}** has been closed.`)
                    .addFields(
                        { name: 'Closed by', value: closedBy.tag, inline: true },
                        { name: 'Reason', value: reason, inline: true }
                    )
                    .setFooter({ text: 'Send a new message to open another modmail!' })
                    .setTimestamp();

                await user.send({
                    embeds: [closedEmbed],
                    files: [transcriptAttachment]
                });
            } catch (error) {
                console.warn(`Could not notify user ${thread.userId}:`, error.message);
            }

            // Update database
            await ModMailThread.findByIdAndUpdate(thread._id, {
                status: 'closed',
                closedBy: closedBy.id,
                closedAt: new Date()
            });

            // Update stats
            const responseTime = thread.staffResponded ?
                Math.round((Date.now() - thread.openedAt.getTime()) / (1000 * 60)) : 0;
            await this.updateStats(thread.guildId, 'close_thread', { responseTime });

            // Archive thread
            if (threadChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('🔒 Thread Closed')
                    .addFields(
                        { name: 'Closed by', value: closedBy.tag, inline: true },
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Duration', value: `<t:${Math.floor(thread.openedAt.getTime() / 1000)}:R>`, inline: true }
                    )
                    .setTimestamp();

                await threadChannel.send({
                    embeds: [logEmbed],
                    files: [transcriptAttachment]
                });

                if (threadChannel.isThread()) {
                    await threadChannel.setArchived(true, `Closed by ${closedBy.tag}: ${reason}`);
                }
            }

            // Clean up transcript file
            setTimeout(async () => {
                try {
                    await fs.unlink(transcriptPath);
                } catch (err) {
                    console.warn('Failed to delete transcript file:', err.message);
                }
            }, 5000);

        } catch (error) {
            console.error('Error closing modmail thread:', error);
            throw error;
        }
    }

    async handleGuildDelete(guild) {
        try {
            await ModMailConfig.deleteOne({ guildId: guild.id });
            await ModMailThread.deleteMany({ guildId: guild.id });
            await ModMailStats.deleteOne({ guildId: guild.id });

            configCache.delete(guild.id);

            //console.log(`Cleaned up modmail data for deleted guild: ${guild.name} (${guild.id})`);
        } catch (error) {
            console.error(`Error cleaning up data for deleted guild ${guild.id}:`, error);
        }
    }

    async cleanupStaleThreads() {
        try {
            const staleThreads = await ModMailThread.find({
                status: 'open',
                lastActivity: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days
            });

            for (const thread of staleThreads) {
                const guild = await this.fetchGuildAdvanced(thread.guildId);
                if (!guild) {
                    await ModMailThread.deleteOne({ _id: thread._id });
                    continue;
                }

                const channel = await this.fetchChannelAdvanced(guild, thread.threadChannelId);
                if (!channel) {
                    await ModMailThread.deleteOne({ _id: thread._id });
                    // console.log(`Cleaned up stale thread for user ${thread.userId} in guild ${thread.guildId}`);
                }
            }
        } catch (error) {
            console.error('Error cleaning up stale threads:', error);
        }
    }

    // Helper methods
    getPriorityEmoji(priority) {
        const emojis = {
            low: '🟢',
            medium: '🟡',
            high: '🟠',
            urgent: '🔴'
        };
        return emojis[priority] || '🟡';
    }

    async updateStats(guildId, action, data = {}) {
        try {
            let stats = await ModMailStats.findOne({ guildId });
            if (!stats) {
                stats = new ModMailStats({ guildId });
            }

            switch (action) {
                case 'new_thread':
                    stats.totalThreads++;
                    stats.openThreads++;
                    break;
                case 'close_thread':
                    stats.openThreads = Math.max(0, stats.openThreads - 1);
                    stats.closedThreads++;
                    if (data.responseTime) {
                        stats.averageResponseTime = Math.round(
                            (stats.averageResponseTime * (stats.closedThreads - 1) + data.responseTime) / stats.closedThreads
                        );
                    }
                    break;
                case 'new_message':
                    stats.totalMessages++;
                    break;
            }

            stats.lastUpdated = new Date();
            await stats.save();
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
}

module.exports = ModMailHandler;
