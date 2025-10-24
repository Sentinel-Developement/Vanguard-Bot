/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    ButtonStyle,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('🔧 Advanced channel management and administration tools')
        .addSubcommand(sub =>
            sub.setName('info')
                .setDescription('📊 Get comprehensive channel information and analytics')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel to analyze').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('slowmode')
                .setDescription('⏳ Configure channel slowmode with precise control')
                .addIntegerOption(o => o.setName('duration').setDescription('Duration in seconds (0–21600)').setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('removeslowmode')
                .setDescription('🚀 Remove slowmode from channel')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('lock')
                .setDescription('🔒 Lock channel to prevent messaging')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false))
                .addStringOption(o => o.setName('reason').setDescription('Reason for locking').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('unlock')
                .setDescription('🔓 Unlock channel to allow messaging')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false))
                .addStringOption(o => o.setName('reason').setDescription('Reason for unlocking').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('rename')
                .setDescription('✏️ Rename channel with validation')
                .addStringOption(o => o.setName('name').setDescription('New channel name').setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('topic')
                .setDescription('📝 Set or update channel topic')
                .addStringOption(o => o.setName('text').setDescription('Topic text (max 1024 characters)').setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('clone')
                .setDescription('📁 Create an exact copy of channel')
                .addChannelOption(o => o.setName('channel').setDescription('Channel to clone (default: current)').setRequired(false))
                .addStringOption(o => o.setName('name').setDescription('Name for cloned channel').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('🗑️ Delete channel with confirmation')
                .addChannelOption(o => o.setName('channel').setDescription('Channel to delete').setRequired(true))
                .addStringOption(o => o.setName('reason').setDescription('Reason for deletion').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('➕ Create new channel with advanced options')
                .addStringOption(o => o.setName('name').setDescription('Channel name').setRequired(true))
                .addStringOption(o => o.setName('type').setDescription('Channel type').addChoices(
                    { name: '💬 Text Channel', value: 'GUILD_TEXT' },
                    { name: '🔊 Voice Channel', value: 'GUILD_VOICE' },
                    { name: '🎭 Stage Channel', value: 'GUILD_STAGE_VOICE' },
                    { name: '📂 Category', value: 'GUILD_CATEGORY' },
                    { name: '📰 News Channel', value: 'GUILD_NEWS' },
                    { name: '🏛️ Forum Channel', value: 'GUILD_FORUM' }
                ).setRequired(true))
                .addChannelOption(o => o.setName('category').setDescription('Parent category').addChannelTypes(ChannelType.GuildCategory).setRequired(false))
                .addStringOption(o => o.setName('topic').setDescription('Channel topic').setRequired(false))
                .addBooleanOption(o => o.setName('nsfw').setDescription('Mark as NSFW').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('nsfw')
                .setDescription('🔞 Toggle NSFW status')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('permissions')
                .setDescription('🔐 Analyze channel permissions')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
                .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false))
                .addRoleOption(o => o.setName('role').setDescription('Role to check').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('hide')
                .setDescription('🙈 Hide channel from @everyone')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('unhide')
                .setDescription('👁️ Show channel to @everyone')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('move')
                .setDescription('📦 Move channel to different category')
                .addChannelOption(o => o.setName('category').setDescription('Target category').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Channel to move (default: current)').setRequired(false))
                .addIntegerOption(o => o.setName('position').setDescription('Position in category').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('stats')
                .setDescription('📊 Advanced channel statistics')
                .addChannelOption(o => o.setName('channel').setDescription('Channel to analyze (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('📋 List all channels with details')
                .addStringOption(o => o.setName('type').setDescription('Filter by type').addChoices(
                    { name: 'All Channels', value: 'all' },
                    { name: 'Text Channels', value: 'text' },
                    { name: 'Voice Channels', value: 'voice' },
                    { name: 'Categories', value: 'category' },
                    { name: 'Stage Channels', value: 'stage' }
                ).setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('purge')
                .setDescription('🧹 Advanced message purging')
                .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true))
                .addUserOption(o => o.setName('user').setDescription('Filter by user').setRequired(false))
                .addStringOption(o => o.setName('content').setDescription('Filter by content').setRequired(false))
                .addBooleanOption(o => o.setName('bots').setDescription('Only bot messages').setRequired(false))),

    async execute(interaction) {
        if (!await checkPermissions(interaction, 'admin')) return;

        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;
        let args = [];

        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply();
            subcommand = interaction.options.getSubcommand();
        } else {
            const message = interaction;
            sender = message.author;
            const messageArgs = message.content.split(' ');
            messageArgs.shift();
            subcommand = messageArgs[0] || 'help';
            args = messageArgs.slice(1);
        }

        const sendReply = async (options) => {
            if (isSlashCommand) {
                return interaction.editReply(options);
            } else {
                return interaction.reply(options);
            }
        };

        const getChannelOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getChannel(optionName);
            } else {
                const channelArg = args.find(arg => arg.startsWith('<#') && arg.endsWith('>'));
                if (channelArg) {
                    const channelId = channelArg.slice(2, -1);
                    return interaction.guild.channels.cache.get(channelId);
                }
                return null;
            }
        };

        const getStringOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getString(optionName);
            } else {
                return args.join(' ') || null;
            }
        };

        const getIntegerOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getInteger(optionName);
            } else {
                const num = parseInt(args[0]);
                return isNaN(num) ? null : num;
            }
        };

        const getUserOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getUser(optionName);
            } else {
                const userArg = args.find(arg => arg.startsWith('<@') && arg.endsWith('>'));
                if (userArg) {
                    const userId = userArg.replace(/[<@!>]/g, '');
                    return interaction.guild.members.cache.get(userId)?.user;
                }
                return null;
            }
        };

        const member = isSlashCommand ? interaction.member : interaction.member;
        const channel = isSlashCommand ? interaction.channel : interaction.channel;
        const guild = isSlashCommand ? interaction.guild : interaction.guild;

        if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔒 ACCESS DENIED**\nRequired Permission: MANAGE_CHANNELS\nContact server administrators for access.')
                );

            return sendReply({ 
                components: [errorContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }
        
        switch (subcommand) {
            case 'info': {
                const targetChannel = getChannelOption('channel') || channel;
                if (!targetChannel) {
                    return sendReply({ content: '❌ Please specify a valid channel.', ephemeral: true });
                }

                const slowmode = targetChannel.rateLimitPerUser || 0;
                const members = targetChannel.members?.size || 0;

                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0x3498db)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 CHANNEL ANALYTICS DASHBOARD**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Channel ID:** ${targetChannel.id}\n**Type:** ${ChannelType[targetChannel.type]}\n**Position:** ${targetChannel.position + 1}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Created:** <t:${Math.floor(targetChannel.createdTimestamp / 1000)}:F>\n**Category:** ${targetChannel.parent ? targetChannel.parent.name : 'None'}\n**NSFW Status:** ${targetChannel.nsfw ? '🔞 Enabled' : '✅ Disabled'}`)
                    );

                if (targetChannel.topic) {
                    infoContainer.addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel Topic:**\n${targetChannel.topic}`)
                        );
                }

                if (slowmode > 0) {
                    infoContainer.addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Slowmode:** ${slowmode} seconds active\n**Effect:** Users must wait ${slowmode}s between messages`)
                        );
                }

                if (targetChannel.type === ChannelType.GuildVoice || targetChannel.type === ChannelType.GuildStageVoice) {
                    infoContainer.addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Voice Channel Details:**\n**Connected Users:** ${members}\n**User Limit:** ${targetChannel.userLimit || 'Unlimited'}\n**Bitrate:** ${targetChannel.bitrate / 1000}kbps\n**Quality:** ${targetChannel.bitrate >= 96000 ? 'High' : targetChannel.bitrate >= 64000 ? 'Standard' : 'Basic'}`)
                        );
                }

             
                const permissions = targetChannel.permissionsFor(guild.roles.everyone);
                const canSend = permissions?.has(PermissionFlagsBits.SendMessages) ?? false;
                const canView = permissions?.has(PermissionFlagsBits.ViewChannel) ?? false;

                infoContainer.addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Permissions Overview:**\n**@everyone can view:** ${canView ? '✅ Yes' : '❌ No'}\n**@everyone can send:** ${canSend ? '✅ Yes' : '❌ No'}\n**Permission Overrides:** ${targetChannel.permissionOverwrites.cache.size} configured`)
                    );

                return sendReply({ 
                    components: [infoContainer], 
                    flags: MessageFlags.IsComponentsV2 
                });
            }

            case 'slowmode': {
                const duration = getIntegerOption('duration');
                const targetChannel = getChannelOption('channel') || channel;

                if (duration === null || duration < 0 || duration > 21600) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ INVALID DURATION**\nDuration must be between 0–21600 seconds\n\n**Quick Examples:**\n• 0 seconds = Disable slowmode\n• 5 seconds = Basic chat control\n• 60 seconds = Slow discussion\n• 3600 seconds = 1 hour lockdown')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                try {
                    await targetChannel.setRateLimitPerUser(duration);

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**⏳ SLOWMODE CONFIGURATION UPDATED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**New Duration:** ${duration === 0 ? 'Disabled' : `${duration} seconds`}\n**Modified By:** ${sender}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Impact:** ${duration === 0 ? 'Users can now message freely without restrictions' : `Users must wait ${duration}s between messages. This helps maintain order and prevents spam flooding.`}`)
                        );

                    return sendReply({ 
                        components: [successContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ SLOWMODE OPERATION FAILED**\nUnable to apply slowmode configuration to the target channel.\n\n**Possible Causes:**\n• Insufficient bot permissions\n• Channel type not supported\n• Discord API rate limiting\n• Network connectivity issues')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'removeslowmode': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    await targetChannel.setRateLimitPerUser(0);

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🚀 SLOWMODE SUCCESSFULLY REMOVED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Status:** Slowmode Completely Disabled\n**Modified By:** ${sender}\n**Action Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Result:** Users can now send messages freely without any time restrictions. Chat flow has been restored to normal speed and conversation can proceed naturally.')
                        );

                    return sendReply({ 
                        components: [successContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ SLOWMODE REMOVAL FAILED**\nUnable to remove slowmode restrictions from the channel.\n\n**Possible Causes:**\n• Bot lacks Manage Channels permission\n• Channel already has no slowmode active\n• Discord API temporarily unavailable\n• Rate limit protection engaged')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'lock': {
                const targetChannel = getChannelOption('channel') || channel;
                const reason = getStringOption('reason') || 'No specific reason provided';

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false,
                        SendMessagesInThreads: false
                    });

                    const lockContainer = new ContainerBuilder()
                        .setAccentColor(0xe74c3c)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔒 CHANNEL SUCCESSFULLY LOCKED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Lock Status:** Fully Secured\n**Locked By:** ${sender}\n**Lock Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Reason for Lock:**\n${reason}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Security Restrictions Applied:**\n• Send Messages: Disabled\n• Add Reactions: Disabled\n• Create Public Threads: Disabled\n• Create Private Threads: Disabled\n• Send Messages in Threads: Disabled\n\nOnly staff members with override permissions can now interact in this channel.')
                        );

                    return sendReply({ 
                        components: [lockContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL LOCK OPERATION FAILED**\nUnable to apply security restrictions to the target channel.\n\n**Possible Issues:**\n• Insufficient bot permissions for permission management\n• Channel already has conflicting permission overrides\n• Permission hierarchy conflicts with role setup\n• Discord API rate limiting or temporary service issues')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'unlock': {
                const targetChannel = getChannelOption('channel') || channel;
                const reason = getStringOption('reason') || 'No specific reason provided';

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: null,
                        AddReactions: null,
                        CreatePublicThreads: null,
                        CreatePrivateThreads: null,
                        SendMessagesInThreads: null
                    });

                    const unlockContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔓 CHANNEL SUCCESSFULLY UNLOCKED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Security Status:** Fully Accessible\n**Unlocked By:** ${sender}\n**Unlock Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Reason for Unlock:**\n${reason}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Permissions Restored:**\n• Send Messages: Re-enabled\n• Add Reactions: Re-enabled\n• Create Public Threads: Re-enabled\n• Create Private Threads: Re-enabled\n• Send Messages in Threads: Re-enabled\n\nAll members can now interact normally according to their role permissions.')
                        );

                    return sendReply({ 
                        components: [unlockContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL UNLOCK OPERATION FAILED**\nUnable to restore normal permissions to the target channel.\n\n**Possible Issues:**\n• Bot lacks permission management capabilities\n• Channel permissions are not currently locked\n• Complex permission override conflicts\n• Discord API connectivity or rate limiting issues')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'rename': {
                const newName = getStringOption('name');
                const targetChannel = getChannelOption('channel') || channel;

                if (!newName || newName.length < 1 || newName.length > 100) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ INVALID CHANNEL NAME**\nChannel name must be between 1-100 characters long.\n\n**Naming Requirements:**\n• Letters, numbers, dashes, and underscores allowed\n• Spaces will be automatically converted to dashes\n• Must be unique within the server\n• Cannot contain special characters or symbols')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                const oldName = targetChannel.name;

                try {
                    await targetChannel.setName(newName);

                    const renameContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**✏️ CHANNEL SUCCESSFULLY RENAMED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Renamed By:** ${sender}\n**Operation Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Name Change Details:**\n**Previous Name:** ${oldName}\n**New Name:** ${newName}\n**Character Count:** ${newName.length}/100`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Impact:** Channel name has been updated across all interfaces. Members will see the new name immediately in their channel list and navigation.')
                        );

                    return sendReply({ 
                        components: [renameContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL RENAME FAILED**\nUnable to change the channel name as requested.\n\n**Possible Causes:**\n• Name already exists in this server\n• Contains invalid or restricted characters\n• Discord API rate limit exceeded (try again in a moment)\n• Insufficient bot permissions for channel management')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'topic': {
                const text = getStringOption('text');
                const targetChannel = getChannelOption('channel') || channel;

                if (!text || text.length > 1024) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ INVALID TOPIC TEXT**\nTopic must be between 1-1024 characters. Current: ${text?.length || 0} characters\n\n**Topic Guidelines:**\n• Use topics to describe channel purpose\n• Include relevant rules or guidelines\n• Mention related channels or resources\n• Keep it concise but informative\n\n**Note:** Topics are only supported in text and announcement channels.`)
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(targetChannel.type)) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ UNSUPPORTED CHANNEL TYPE**\nTopics are only supported in text and announcement channels.\n\n**Current Channel Type:** ${ChannelType[targetChannel.type] || 'Unknown'}\n**Supported Types:** Text Channels, Announcement Channels\n\n**Alternative:** Consider using channel name or category description for other channel types.`)
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                try {
                    await targetChannel.setTopic(text);

                    const topicContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**📝 CHANNEL TOPIC UPDATED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Updated By:** ${sender}\n**Update Time:** <t:${Math.floor(Date.now() / 1000)}:F>\n**Character Count:** ${text.length}/1024`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**New Channel Topic:**\n${text}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Visibility:** The new topic is now displayed at the top of the channel for all members to see. It helps orient new users and provides context for discussions.')
                        );

                    return sendReply({ 
                        components: [topicContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ TOPIC UPDATE FAILED**\nUnable to update the channel topic as requested.\n\n**Possible Causes:**\n• Bot lacks Manage Channels permission\n• Topic contains forbidden content or links\n• Discord API rate limiting active\n• Network connectivity issues or service outage')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'clone': {
                const targetChannel = getChannelOption('channel') || channel;
                const newName = getStringOption('name') || `${targetChannel.name}-copy`;

                try {
                    const clonedChannel = await targetChannel.clone({
                        name: newName,
                        reason: `Channel cloned by ${sender.tag} using advanced channel management`
                    });

                    const cloneContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**📁 CHANNEL SUCCESSFULLY CLONED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Original Channel:** ${targetChannel}\n**Cloned Channel:** ${clonedChannel}\n**Cloned By:** ${sender}\n**Clone Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Clone Details:**\n**Original Name:** ${targetChannel.name}\n**Clone Name:** ${newName}\n**Channel Type:** ${ChannelType[targetChannel.type]}\n**Category:** ${targetChannel.parent?.name || 'None'}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Cloned Elements:**\n• Channel settings and configuration\n• Permission overrides and security rules\n• Channel topic and description\n• Slowmode and NSFW settings\n• Position within category structure\n\n**Note:** Message history is not cloned for privacy and performance reasons.')
                        );

                    return sendReply({ 
                        components: [cloneContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL CLONING FAILED**\nUnable to create a clone of the specified channel.\n\n**Possible Causes:**\n• Server channel limit reached (500 channel maximum)\n• Bot lacks Create Channels permission\n• Clone name conflicts with existing channel\n• Discord API rate limiting or temporary service issues\n• Category channel limit exceeded (50 channels per category)')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'delete': {
                const targetChannel = getChannelOption('channel');
                const reason = getStringOption('reason') || 'No specific reason provided';

                if (!targetChannel) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL SPECIFICATION REQUIRED**\nFor safety, you must explicitly specify which channel to delete.\n\n**Safety Measures:**\n• Cannot delete the current channel to prevent accidental loss\n• Requires explicit channel mention or selection\n• Confirmation process prevents immediate deletion\n• Deletion reason logging for audit trails')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                const confirmButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm_delete')
                            .setLabel('🗑️ Confirm Deletion')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('cancel_delete')
                            .setLabel('❌ Cancel Operation')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const confirmContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**⚠️ CRITICAL DELETION CONFIRMATION**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Target Channel:** ${targetChannel}\n**Channel Type:** ${ChannelType[targetChannel.type]}\n**Requested By:** ${sender}\n**Request Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Deletion Reason:**\n${reason}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**⚠️ PERMANENT ACTION WARNING**\nThis operation cannot be undone or reversed. All content will be permanently lost:\n\n• Complete message history and attachments\n• Channel-specific permissions and settings\n• Member access and notification preferences\n• Integration connections and webhooks\n\n**Confirm only if you are absolutely certain.**')
                    );

                const response = await sendReply({ 
                    components: [confirmContainer, confirmButton], 
                    flags: MessageFlags.IsComponentsV2 
                });

                const filter = i => i.user.id === sender.id;
                const collector = response.createMessageComponentCollector({ filter, time: 30000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm_delete') {
                        try {
                            const channelName = targetChannel.name;
                            const channelId = targetChannel.id;
                            await targetChannel.delete(reason);

                            const deleteContainer = new ContainerBuilder()
                                .setAccentColor(0x2ecc71)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**🗑️ CHANNEL DELETION COMPLETED**')
                                )
                                .addSeparatorComponents(separator => separator)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Deleted Channel:** ${channelName}\n**Channel ID:** ${channelId}\n**Deleted By:** ${sender}\n**Completion Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                                )
                                .addSeparatorComponents(separator => separator)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Deletion Reason:**\n${reason}`)
                                )
                                .addSeparatorComponents(separator => separator)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**Operation Result:** Channel and all associated data have been permanently removed from the server. Members have automatically lost access and the channel is no longer visible in any interface.')
                                );

                            await i.update({ 
                                components: [deleteContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                        } catch (error) {
                            const errorContainer = new ContainerBuilder()
                                .setAccentColor(0xff4757)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**❌ DELETION OPERATION FAILED**\nUnable to delete the specified channel despite confirmation.\n\n**Possible Issues:**\n• Bot lacks Delete Channels permission\n• Channel has active voice connections preventing deletion\n• Discord API rate limiting or service outage\n• Channel was already deleted by another administrator')
                                );

                            await i.update({ 
                                components: [errorContainer], 
                                flags: MessageFlags.IsComponentsV2 
                            });
                        }
                    } else if (i.customId === 'cancel_delete') {
                        const cancelContainer = new ContainerBuilder()
                            .setAccentColor(0x95a5a6)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ DELETION OPERATION CANCELLED**')
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Preserved Channel:** ${targetChannel}\n**Cancelled By:** ${sender}\n**Cancellation Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**Safety Result:** Channel has been preserved and remains fully functional. No changes have been made to permissions, content, or settings. Deletion operation was safely aborted.')
                            );

                        await i.update({ 
                            components: [cancelContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                    }
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        const timeoutContainer = new ContainerBuilder()
                            .setAccentColor(0x95a5a6)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**⏰ DELETION CONFIRMATION TIMEOUT**\nChannel ${targetChannel} has been automatically preserved due to no response within 30 seconds.\n\n**Safety Protocol:** All deletion requests require active confirmation within the time limit. The channel remains unchanged and fully functional.`)
                            );

                        response.edit({ 
                            components: [timeoutContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                    }
                });
                break;
            }

            case 'create': {
                const name = getStringOption('name');
                const type = getStringOption('type');
                const category = getChannelOption('category');
                const topic = getStringOption('topic');
                const nsfw = isSlashCommand ? interaction.options.getBoolean('nsfw') : false;

                if (!name || !type) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ INCOMPLETE CHANNEL CREATION PARAMETERS**\nBoth channel name and type are required for channel creation.\n\n**Required Parameters:**\n• **Name:** Channel identifier (1-100 characters)\n• **Type:** Channel functionality (text, voice, category, etc.)\n\n**Optional Enhancements:**\n• **Category:** Organizational parent container\n• **Topic:** Channel description and purpose\n• **NSFW:** Adult content flag for appropriate channels')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                try {
                    const channelOptions = {
                        name: name,
                        type: ChannelType[type],
                        parent: category?.id || null,
                        nsfw: nsfw || false,
                        reason: `Advanced channel creation by ${sender.tag}`
                    };

                    if (topic && (type === 'GUILD_TEXT' || type === 'GUILD_NEWS')) {
                        channelOptions.topic = topic;
                    }

                    const newChannel = await guild.channels.create(channelOptions);

                    const createContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**➕ CHANNEL CREATION SUCCESSFUL**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**New Channel:** ${newChannel}\n**Channel ID:** ${newChannel.id}\n**Created By:** ${sender}\n**Creation Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel Configuration:**\n**Name:** ${name}\n**Type:** ${ChannelType[newChannel.type]}\n**Category:** ${category?.name || 'None (Top Level)'}\n**NSFW Status:** ${nsfw ? '🔞 Enabled' : '✅ Disabled'}`)
                        );

                    if (topic) {
                        createContainer.addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel Topic:**\n${topic}`)
                        );
                    }

                    createContainer.addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Channel Status:** Fully operational and accessible to members according to server permission settings. The channel is immediately available for use and will appear in member channel lists.')
                        );

                    return sendReply({ 
                        components: [createContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL CREATION FAILED**\nUnable to create the new channel with the specified parameters.\n\n**Common Issues:**\n• Server channel limit reached (500 channel maximum)\n• Channel name already exists or contains invalid characters\n• Bot lacks Create Channels permission\n• Invalid channel type selection\n• Category channel limit exceeded (50 per category)')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'nsfw': {
                const targetChannel = getChannelOption('channel') || channel;

                if (targetChannel.type !== ChannelType.GuildText && targetChannel.type !== ChannelType.GuildNews) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ INCOMPATIBLE CHANNEL TYPE**\nNSFW settings are only supported in text and news channels.\n\n**Current Channel Type:** ${ChannelType[targetChannel.type]}\n**Supported Types:** Text Channels, Announcement Channels\n\n**Reason:** NSFW content warnings and age verification are specifically designed for text-based communication channels where content sharing occurs.`)
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                try {
                    const newNsfwStatus = !targetChannel.nsfw;
                    await targetChannel.setNSFW(newNsfwStatus);

                    const nsfwContainer = new ContainerBuilder()
                        .setAccentColor(newNsfwStatus ? 0xff4757 : 0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**🔞 NSFW STATUS ${newNsfwStatus ? 'ENABLED' : 'DISABLED'}**`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Modified By:** ${sender}\n**Status Change:** ${targetChannel.nsfw ? 'Enabled' : 'Disabled'} → ${newNsfwStatus ? 'Enabled' : 'Disabled'}\n**Update Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Impact and Restrictions:**\n${newNsfwStatus ? '🔞 **NSFW ENABLED**\n• Adult content is now permitted\n• Access restricted to verified 18+ users\n• Warning displayed before channel entry\n• Enhanced content moderation recommended\n• Age verification required for all participants' : '✅ **NSFW DISABLED**\n• Family-friendly content only\n• Available to all server members\n• No age restrictions or warnings\n• Standard content moderation applies\n• Safe for all audiences and age groups'}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Member Experience:** ${newNsfwStatus ? 'Users will see an explicit content warning before accessing this channel and must confirm they are 18+ to proceed.' : 'Channel is now accessible to all members without age verification or content warnings.'}`)
                        );

                    return sendReply({ 
                        components: [nsfwContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ NSFW CONFIGURATION FAILED**\nUnable to modify the NSFW status of the specified channel.\n\n**Possible Issues:**\n• Bot lacks Manage Channels permission\n• Channel type does not support NSFW settings\n• Discord API rate limiting or service interruption\n• Conflicting permission configurations')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'permissions': {
                const targetChannel = getChannelOption('channel');
                const user = getUserOption('user') || (isSlashCommand ? interaction.options.getUser('user') : null);
                const role = isSlashCommand ? interaction.options.getRole('role') : null;

                if (!targetChannel) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL SPECIFICATION REQUIRED**\nPlease specify a channel to analyze permission configurations.\n\n**Analysis Options:**\n• **Channel Only:** View all permission overrides\n• **Channel + User:** View specific user permissions\n• **Channel + Role:** View specific role permissions\n\n**Use Cases:** Security audits, troubleshooting access issues, permission verification')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                const target = user || role;

                if (target) {
                    const permissions = targetChannel.permissionsFor(target);
                    const permArray = permissions ? permissions.toArray() : [];

                    const permContainer = new ContainerBuilder()
                        .setAccentColor(0x9b59b6)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔐 INDIVIDUAL PERMISSION ANALYSIS**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Analysis Target:** ${target}\n**Target Type:** ${user ? 'User Account' : 'Server Role'}\n**Total Effective Permissions:** ${permArray.length}`)
                        )
                        .addSeparatorComponents(separator => separator);

                    if (permArray.length > 0) {
                    
                        const permissionCategories = {
                            'General': ['ViewChannel', 'ManageChannels', 'ManageRoles', 'ManageWebhooks'],
                            'Text': ['SendMessages', 'EmbedLinks', 'AttachFiles', 'AddReactions', 'UseExternalEmojis', 'MentionEveryone'],
                            'Voice': ['Connect', 'Speak', 'Stream', 'UseVAD', 'MuteMembers', 'DeafenMembers', 'MoveMembers'],
                            'Advanced': ['Administrator', 'ManageGuild', 'KickMembers', 'BanMembers', 'CreateInstantInvite']
                        };

                        for (const [category, categoryPerms] of Object.entries(permissionCategories)) {
                            const matchingPerms = permArray.filter(perm => categoryPerms.includes(perm));
                            if (matchingPerms.length > 0) {
                                permContainer.addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**${category} Permissions:**\n${matchingPerms.join(', ')}`)
                                ).addSeparatorComponents(separator => separator);
                            }
                        }

                        permContainer.addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Permission Source:** These permissions are calculated from role hierarchy, channel overrides, and server-wide settings. Higher roles and explicit overrides take precedence.')
                        );
                    } else {
                        permContainer.addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Permission Status:** No explicit permissions granted\n\n**Default Behavior:** Target relies on @everyone role permissions and server defaults. Consider adding specific permissions if enhanced access is needed.')
                        );
                    }

                    return sendReply({ 
                        components: [permContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } else {
                    const overrides = targetChannel.permissionOverwrites.cache;
                    
                    const overrideContainer = new ContainerBuilder()
                        .setAccentColor(0x9b59b6)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔐 COMPREHENSIVE PERMISSION OVERVIEW**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Channel Type:** ${ChannelType[targetChannel.type]}\n**Permission Overrides:** ${overrides.size} configured\n**Analysis Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        );

                    if (overrides.size === 0) {
                        overrideContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**Override Status:** No custom permission overrides configured\n\n**Default Behavior:** Channel uses server-wide @everyone permissions and role hierarchy. All members have access according to their highest role permissions.')
                            );
                    } else {
                        overrideContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**PERMISSION OVERRIDE DETAILS**')
                            );

                        let overrideCount = 0;
                        overrides.forEach((override, index) => {
                            if (overrideCount < 5) { 
                                const target = override.type === 0 ? guild.roles.cache.get(override.id) : guild.members.cache.get(override.id);
                                const allowed = override.allow.toArray();
                                const denied = override.deny.toArray();

                                overrideContainer.addSeparatorComponents(separator => separator)
                                    .addTextDisplayComponents(
                                        textDisplay => textDisplay.setContent(`**${override.type === 0 ? '🎭 ROLE' : '👤 USER'}: ${target?.name || target?.user?.username || 'Unknown Entity'}**\n\n**Explicitly Allowed:**\n${allowed.length > 0 ? allowed.join(', ') : 'None specified'}\n\n**Explicitly Denied:**\n${denied.length > 0 ? denied.join(', ') : 'None specified'}\n\n**Override Effect:** ${allowed.length + denied.length > 0 ? 'Custom permissions active' : 'No permission changes'}`)
                                    );
                                overrideCount++;
                            }
                        });

                        if (overrides.size > 5) {
                            overrideContainer.addSeparatorComponents(separator => separator)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Display Note:** Showing first 5 of ${overrides.size} permission overrides\n\n**View More:** Use user or role-specific permission analysis for detailed individual breakdowns`)
                                );
                        }

                        overrideContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**Permission Hierarchy:** Explicit denies override allows. User overrides supersede role overrides. Higher roles take precedence over lower roles.')
                            );
                    }

                    return sendReply({ 
                        components: [overrideContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                }
            }

            case 'hide': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });

                    const hideContainer = new ContainerBuilder()
                        .setAccentColor(0x95a5a6)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🙈 CHANNEL SUCCESSFULLY HIDDEN**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Hidden By:** ${sender}\n**Visibility Status:** Hidden from @everyone\n**Action Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Access Control:** Channel is now invisible to @everyone role\n\n**Who Can Access:**\n• Members with specific View Channel permissions\n• Roles with explicit channel access overrides\n• Server administrators and moderators\n• Bot accounts with appropriate permissions')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Member Experience:** The channel will disappear from channel lists for most users. Only members with explicit permissions will see and can access the channel content.')
                        );

                    return sendReply({ 
                        components: [hideContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL HIDING FAILED**\nUnable to modify channel visibility settings as requested.\n\n**Possible Issues:**\n• Bot lacks Manage Roles or Manage Channels permissions\n• Channel already has conflicting permission overrides\n• Discord API rate limiting or service interruption\n• Permission hierarchy conflicts with existing role structure')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'unhide': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: null });

                    const unhideContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**👁️ CHANNEL VISIBILITY RESTORED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Unhidden By:** ${sender}\n**Visibility Status:** Visible to @everyone\n**Restoration Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Access Restoration:** Channel is now visible to all server members\n\n**Who Can Access:**\n• All server members (according to role permissions)\n• @everyone role has default view access\n• Individual role permissions still apply\n• Channel-specific overrides remain active')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Member Experience:** The channel will reappear in channel lists for all members. Access and interaction depend on individual role permissions and any remaining channel-specific overrides.')
                        );

                    return sendReply({ 
                        components: [unhideContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL UNHIDING FAILED**\nUnable to restore channel visibility as requested.\n\n**Possible Issues:**\n• Bot lacks Manage Roles or Manage Channels permissions\n• Channel visibility was not previously restricted\n• Complex permission override conflicts\n• Discord API rate limiting or connectivity issues')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'move': {
                const targetChannel = getChannelOption('channel') || channel;
                const targetCategory = isSlashCommand ? interaction.options.getChannel('category') : null;
                const position = isSlashCommand ? interaction.options.getInteger('position') : null;

                if (!targetCategory) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ TARGET CATEGORY REQUIRED**\nPlease specify a target category for the channel move operation.\n\n**Move Options:**\n• **Category:** Required destination category\n• **Position:** Optional specific position within category\n\n**Benefits:** Better organization, improved navigation, logical channel grouping')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                try {
                    const previousCategory = targetChannel.parent?.name || 'None (Top Level)';
                    await targetChannel.setParent(targetCategory.id);
                    if (position !== null) {
                        await targetChannel.setPosition(position);
                    }

                    const moveContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**📦 CHANNEL SUCCESSFULLY MOVED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Moved By:** ${sender}\n**Move Operation:** Category Transfer\n**Completion Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Category Movement:**\n**Previous Location:** ${previousCategory}\n**New Location:** ${targetCategory.name}\n**Position Setting:** ${position !== null ? `Position ${position}` : 'Default (bottom of category)'}\n**Channel Type:** ${ChannelType[targetChannel.type]}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Organization Impact:** Channel has been reorganized for better structure and navigation. Members will see the channel in its new category location. All permissions and settings remain unchanged.')
                        );

                    return sendReply({ 
                        components: [moveContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ CHANNEL MOVE OPERATION FAILED**\nUnable to relocate the channel to the specified category.\n\n**Possible Issues:**\n• Bot lacks Manage Channels permission\n• Target category does not exist or was deleted\n• Position value out of valid range\n• Discord API rate limiting or temporary service issues\n• Category channel limit exceeded (50 channels maximum per category)')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'stats': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    let messages, userMessages = {}, totalMessages = 0, botMessages = 0, humanMessages = 0;
                    let analysisError = false;

                    try {
                        messages = await targetChannel.messages.fetch({ limit: 100 });
                        totalMessages = messages.size;

                        messages.forEach(msg => {
                            if (msg.author.bot) {
                                botMessages++;
                            } else {
                                humanMessages++;
                                userMessages[msg.author.id] = (userMessages[msg.author.id] || 0) + 1;
                            }
                        });
                    } catch (error) {
                        analysisError = true;
                    }

                    const topUsers = Object.entries(userMessages)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5);

                    const statsContainer = new ContainerBuilder()
                        .setAccentColor(0xf39c12)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**📊 COMPREHENSIVE CHANNEL STATISTICS**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${targetChannel}\n**Channel Type:** ${ChannelType[targetChannel.type]}\n**Analysis Date:** <t:${Math.floor(Date.now() / 1000)}:F>\n**Channel Created:** <t:${Math.floor(targetChannel.createdTimestamp / 1000)}:R>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Basic Information:**\n**Channel ID:** ${targetChannel.id}\n**Category:** ${targetChannel.parent?.name || 'None (Top Level)'}\n**Position:** ${targetChannel.position + 1} in ${targetChannel.parent ? 'category' : 'server'}\n**NSFW Status:** ${targetChannel.nsfw ? '🔞 Enabled' : '✅ Disabled'}`)
                        );

                    if (!analysisError) {
                        statsContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Message Activity (Last 100):**\n**Total Messages:** ${totalMessages}\n**Human Messages:** ${humanMessages}\n**Bot Messages:** ${botMessages}\n**Human/Bot Ratio:** ${humanMessages}:${botMessages}`)
                            );

                        if (topUsers.length > 0) {
                            const topContributors = topUsers.map(([userId, count], i) => {
                                const user = guild.members.cache.get(userId);
                                return `${i + 1}. ${user ? user.displayName : 'Unknown User'}: ${count} messages`;
                            });

                            statsContainer.addSeparatorComponents(separator => separator)
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent('**🏆 TOP CONTRIBUTORS (Recent Activity)**')
                                )
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(topContributors.join('\n'))
                                );
                        }
                    } else {
                        statsContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**Message Analysis:** Unable to fetch message data\n**Reason:** Channel type does not support message history or insufficient permissions')
                            );
                    }

                    if (targetChannel.type === ChannelType.GuildVoice || targetChannel.type === ChannelType.GuildStageVoice) {
                        const members = targetChannel.members?.size || 0;
                        statsContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Voice Channel Statistics:**\n**Currently Connected:** ${members} users\n**User Limit:** ${targetChannel.userLimit || 'Unlimited'}\n**Audio Quality:** ${targetChannel.bitrate / 1000}kbps\n**Quality Rating:** ${targetChannel.bitrate >= 96000 ? 'High (96kbps+)' : targetChannel.bitrate >= 64000 ? 'Standard (64kbps)' : 'Basic (<64kbps)'}`)
                            );
                    }

                    if (targetChannel.topic) {
                        statsContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Channel Topic:**\n${targetChannel.topic}`)
                            );
                    }

                    if (targetChannel.rateLimitPerUser > 0) {
                        statsContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Slowmode Configuration:**\n**Duration:** ${targetChannel.rateLimitPerUser} seconds\n**Impact:** Users must wait between messages`)
                            );
                    }

                    const permissionOverrides = targetChannel.permissionOverwrites.cache.size;
                    statsContainer.addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Permission Configuration:**\n**Custom Overrides:** ${permissionOverrides}\n**Access Control:** ${permissionOverrides > 0 ? 'Custom permissions active' : 'Using server defaults'}\n**Security Level:** ${permissionOverrides > 0 ? 'Enhanced (custom rules)' : 'Standard (server roles)'}`)
                        );

                    return sendReply({ 
                        components: [statsContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ STATISTICS ANALYSIS FAILED**\nUnable to compile comprehensive channel statistics.\n\n**Possible Issues:**\n• Bot lacks Read Message History permission\n• Channel type does not support statistical analysis\n• Discord API rate limiting or service unavailability\n• Network connectivity issues preventing data retrieval')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            case 'list': {
                const filterType = getStringOption('type') || 'all';
            
                let channels = guild.channels.cache;
            
                switch (filterType) {
                    case 'text':
                        channels = channels.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildNews);
                        break;
                    case 'voice':
                        channels = channels.filter(c => c.type === ChannelType.GuildVoice);
                        break;
                    case 'category':
                        channels = channels.filter(c => c.type === ChannelType.GuildCategory);
                        break;
                    case 'stage':
                        channels = channels.filter(c => c.type === ChannelType.GuildStageVoice);
                        break;
                    default:
                        break;
                }
            
                const sortedChannels = channels.sort((a, b) => a.position - b.position);
                const totalChannels = sortedChannels.size;
            
                if (totalChannels === 0) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ NO CHANNELS FOUND**\nNo channels match your filter criteria.')
                        );
                    return sendReply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
                }
            
           
                const CHANNELS_PER_PAGE = 30;
                const totalPages = Math.ceil(totalChannels / CHANNELS_PER_PAGE);
                let currentPage = 0;
            
                const generateSimplePage = (page) => {
                    const startIndex = page * CHANNELS_PER_PAGE;
                    const endIndex = Math.min(startIndex + CHANNELS_PER_PAGE, totalChannels);
                    const pageChannels = sortedChannels.slice(startIndex, endIndex);
            
                  
                    const categorizedChannels = new Map();
                    const uncategorizedChannels = [];
            
                    pageChannels.forEach(channel => {
                        if (channel.parent) {
                            if (!categorizedChannels.has(channel.parent.id)) {
                                categorizedChannels.set(channel.parent.id, {
                                    category: channel.parent,
                                    channels: []
                                });
                            }
                            categorizedChannels.get(channel.parent.id).channels.push(channel);
                        } else {
                            uncategorizedChannels.push(channel);
                        }
                    });
            
                  
                    const headerContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**📋 ${guild.name} - Channel Directory**\n**Page ${page + 1}/${totalPages}** • **${totalChannels} total channels** • **Filter:** ${filterType}`)
                        );
            
                    const components = [headerContainer];
            
                
                    const channelListContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**📂 CHANNELS**')
                        );
            
                  
                    if (uncategorizedChannels.length > 0) {
                        const uncategorizedList = uncategorizedChannels.map(channel => {
                            const typeEmoji = {
                                [ChannelType.GuildText]: '💬',
                                [ChannelType.GuildVoice]: '🔊',
                                [ChannelType.GuildCategory]: '📂',
                                [ChannelType.GuildNews]: '📰',
                                [ChannelType.GuildStageVoice]: '🎭',
                                [ChannelType.GuildForum]: '🏛️'
                            };
                            return `${typeEmoji[channel.type] || '❓'} ${channel}`;
                        });
            
                        channelListContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**🗂️ Uncategorized (${uncategorizedChannels.length})**\n${uncategorizedList.join('\n')}`)
                            );
                    }
            
               
                    for (const [categoryId, categoryData] of categorizedChannels) {
                        const categoryChannelList = categoryData.channels.map(channel => {
                            const typeEmoji = {
                                [ChannelType.GuildText]: '💬',
                                [ChannelType.GuildVoice]: '🔊',
                                [ChannelType.GuildNews]: '📰',
                                [ChannelType.GuildStageVoice]: '🎭',
                                [ChannelType.GuildForum]: '🏛️'
                            };
                            return `${typeEmoji[channel.type] || '❓'} ${channel}`;
                        });
            
                        channelListContainer.addSeparatorComponents(separator => separator)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**📁 ${categoryData.category.name} (${categoryData.channels.length})**\n${categoryChannelList.join('\n')}`)
                            );
                    }
            
                    components.push(channelListContainer);
            
                 
                    if (totalPages > 1) {
                        const paginationRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('page_prev')
                                    .setLabel('◀️ Previous')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(currentPage === 0),
                                new ButtonBuilder()
                                    .setCustomId('page_info')
                                    .setLabel(`Page ${currentPage + 1}/${totalPages}`)
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId('page_next')
                                    .setLabel('Next ▶️')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(currentPage === totalPages - 1)
                            );
            
                        components.push(paginationRow);
                    }
            
                    return components;
                };
            
                const updateSimplePage = async (newPage, interaction = null) => {
                    currentPage = newPage;
                    const components = generateSimplePage(currentPage);
                    
                    const options = {
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    };
            
                    if (interaction) {
                        return await interaction.update(options);
                    } else {
                        return await sendReply(options);
                    }
                };
            
             
                const response = await updateSimplePage(0);
            
             
                if (totalPages > 1) {
                    const filter = i => i.user.id === sender.id;
                    const collector = response.createMessageComponentCollector({ filter, time: 300000 });
            
                    collector.on('collect', async i => {
                        let newPage = currentPage;
            
                        switch (i.customId) {
                            case 'page_prev':
                                newPage = Math.max(0, currentPage - 1);
                                break;
                            case 'page_next':
                                newPage = Math.min(totalPages - 1, currentPage + 1);
                                break;
                        }
            
                        if (newPage !== currentPage) {
                            await updateSimplePage(newPage, i);
                        }
                    });
            
                    collector.on('end', () => {
                        const expiredContainer = new ContainerBuilder()
                            .setAccentColor(0x95a5a6)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**⏰ Channel list expired**\nUse `/channel list` to refresh.')
                            );
            
                        response.edit({ 
                            components: [expiredContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        }).catch(() => {});
                    });
                }
            
                return;
            }
            

            case 'purge': {
                const amount = getIntegerOption('amount');
                const targetUser = getUserOption('user') || (isSlashCommand ? interaction.options.getUser('user') : null);
                const content = getStringOption('content');
                const botsOnly = isSlashCommand ? interaction.options.getBoolean('bots') : false;

                if (!amount || amount < 1 || amount > 100) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ INVALID PURGE AMOUNT**\nAmount must be between 1 and 100. Provided: ${amount || 'None'}\n\n**Quick Examples:**\n• 10 - Remove last 10 messages\n• 50 - Standard cleanup operation\n• 100 - Maximum bulk deletion`)
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }

                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    let messagesToDelete = messages.filter(msg => {
                        const now = Date.now();
                        const messageAge = now - msg.createdTimestamp;
                        return messageAge < 14 * 24 * 60 * 60 * 1000; 
                    });

                   
                    if (targetUser) {
                        messagesToDelete = messagesToDelete.filter(msg => msg.author.id === targetUser.id);
                    }

                    if (content) {
                        messagesToDelete = messagesToDelete.filter(msg => 
                            msg.content.toLowerCase().includes(content.toLowerCase())
                        );
                    }

                    if (botsOnly) {
                        messagesToDelete = messagesToDelete.filter(msg => msg.author.bot);
                    }

                    messagesToDelete = messagesToDelete.first(amount);

                    if (messagesToDelete.size === 0) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff4757)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**❌ NO MESSAGES TO PURGE**\nNo messages match your criteria or all messages are older than 14 days.\n\n**Applied Filters:**\n• **Amount:** ${amount}\n• **User:** ${targetUser ? targetUser.tag : 'All users'}\n• **Content:** ${content || 'Any content'}\n• **Bots Only:** ${botsOnly ? 'Yes' : 'No'}`)
                            );

                        return sendReply({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2,
                            ephemeral: true 
                        });
                    }

                    await channel.bulkDelete(messagesToDelete, true);

                    const purgeContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🧹 MESSAGE PURGE COMPLETED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Channel:** ${channel}\n**Purged By:** ${sender}\n**Messages Deleted:** ${messagesToDelete.size}\n**Operation Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Filter Summary:**\n**Requested Amount:** ${amount}\n**User Filter:** ${targetUser ? targetUser.tag : 'All users'}\n**Content Filter:** ${content || 'Any content'}\n**Bot Messages Only:** ${botsOnly ? 'Yes' : 'No'}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**Cleanup Result:** Selected messages have been permanently removed. Channel history has been cleaned according to your specifications.')
                        );

                    return sendReply({ 
                        components: [purgeContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ PURGE OPERATION FAILED**\nUnable to complete the message purge operation.\n\n**Common Issues:**\n• Messages older than 14 days cannot be bulk deleted\n• Bot lacks Manage Messages permission\n• Discord API rate limiting active\n• Network connectivity or service issues')
                        );

                    return sendReply({ 
                        components: [errorContainer], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            }

            default: {
                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x9b59b6)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔧 ADVANCED CHANNEL MANAGEMENT SYSTEM**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Unknown Command:** ${subcommand}\n**Help:** Use one of the available subcommands below`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 Information Commands:**\n• `info` - Comprehensive channel analytics\n• `stats` - Activity statistics and metrics\n• `list` - Interactive channel directory\n• `permissions` - Security analysis')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**⚙️ Management Commands:**\n• `create` - Advanced channel creation\n• `clone` - Duplicate channels with settings\n• `rename` - Update channel names\n• `topic` - Set channel descriptions\n• `move` - Organize channel structure')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔒 Security Commands:**\n• `lock/unlock` - Control messaging permissions\n• `hide/unhide` - Manage channel visibility\n• `nsfw` - Toggle adult content settings\n• `slowmode` - Rate limiting configuration')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🧹 Maintenance Commands:**\n• `purge` - Advanced message cleanup\n• `delete` - Safe channel removal\n\n**Example:** `/channel info #general`')
                    );

                return sendReply({ 
                    components: [helpContainer], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            }
        }
    }
};

/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/