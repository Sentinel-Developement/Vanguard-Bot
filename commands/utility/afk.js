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
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const afkHandler = require('../../events/afkHandler');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Manage AFK statuses with advanced features.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set your AFK status with advanced options.')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for going AFK.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('Duration of AFK (e.g., 30m, 2h, 1d).')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('dm_notifications')
                        .setDescription('Receive DM notifications (default: true)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('public_notifications')
                        .setDescription('Show public return notifications (default: true)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('show_duration')
                        .setDescription('Show AFK duration to others (default: true)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your AFK status.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Show AFK users in the server.')
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number to view')
                        .setMinValue(1)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View AFK statistics for this server.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('auto-response')
                .setDescription('Set up auto-response messages when mentioned while AFK.')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Auto-response message (leave empty to disable)')
                        .setMaxLength(500)
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('cooldown')
                        .setDescription('Cooldown between responses in minutes (default: 5)')
                        .setMinValue(1)
                        .setMaxValue(60)
                        .setRequired(false))),

    async execute(interaction) {
        if (!interaction.isCommand?.()) {
            const slashOnlyContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔄 Slash Commands Only\nThis command requires slash command usage`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Usage Required:**\nPlease use \`/afk\` instead of prefix commands\n\n**Reason:**\nAFK management requires precise parameter handling only available through slash commands`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(cmdIcons.dotIcon)
                                .setDescription('Alert icon')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Slash commands provide better security and validation*`)
                );

            return interaction.reply({ 
                components: [slashOnlyContainer], 
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const { 
            setAFK, 
            removeAFK, 
            getAFK, 
            getAllAFKs, 
            getGuildStats, 
            parseDuration 
        } = afkHandler(interaction.client);

        try {
            switch (subcommand) {
                case 'set':
                    await this.handleSetAFK(interaction, { setAFK, getAFK, parseDuration });
                    break;
                case 'remove':
                    await this.handleRemoveAFK(interaction, { removeAFK, getAFK });
                    break;
                case 'list':
                    await this.handleListAFK(interaction, { getAllAFKs });
                    break;
                case 'stats':
                    await this.handleStatsAFK(interaction, { getGuildStats });
                    break;
                case 'auto-response':
                    await this.handleAutoResponse(interaction, { getAFK, setAFK });
                    break;
            }
        } catch (error) {
            console.error('Error executing AFK command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Command Error\nAn error occurred while processing your request. Please try again.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Error reported by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    components: [errorContainer], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    components: [errorContainer], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            }
        }
    },

    async handleSetAFK(interaction, { setAFK, getAFK, parseDuration }) {
        const reason = interaction.options.getString('reason');
        const durationStr = interaction.options.getString('duration');
        const dmNotifications = interaction.options.getBoolean('dm_notifications') ?? true;
        const publicNotifications = interaction.options.getBoolean('public_notifications') ?? true;
        const showDuration = interaction.options.getBoolean('show_duration') ?? true;

    
        const existingAFK = await getAFK(interaction.user.id, interaction.guild.id);
        if (existingAFK) {
            const alreadyAfkContainer = new ContainerBuilder()
                .setAccentColor(0xFFAA00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚠️ Already AFK\nYou are already AFK with reason: **${existingAFK.reason}**\n\nUse \`/afk remove\` first to change your status.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [alreadyAfkContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }

        let duration = null;
        if (durationStr) {
            duration = parseDuration(durationStr);
            if (!duration) {
                const invalidDurationContainer = new ContainerBuilder()
                    .setAccentColor(0xFF0000)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Duration\nInvalid duration format. Use formats like:`)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**Examples:**\n• \`30s\` - 30 seconds\n• \`15m\` - 15 minutes\n• \`2h\` - 2 hours\n• \`1d\` - 1 day`)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                    );

                return interaction.reply({ 
                    components: [invalidDurationContainer], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            }

      
            if (duration > 30 * 24 * 60 * 60 * 1000) {
                const tooLongContainer = new ContainerBuilder()
                    .setAccentColor(0xFF0000)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⏰ Duration Too Long\nMaximum AFK duration is 30 days.`)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                    );

                return interaction.reply({ 
                    components: [tooLongContainer], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            }
        }

        const options = {
            duration,
            dmNotifications,
            publicNotifications,
            showDuration
        };

        const afk = await setAFK(interaction.user.id, interaction.guild.id, reason, options);

        let durationText = 'Indefinite - until you send a message';
        if (duration) {
            const expiresTimestamp = Math.floor((Date.now() + duration) / 1000);
            durationText = `Until <t:${expiresTimestamp}:f> (<t:${expiresTimestamp}:R>)`;
        }

        const successContainer = new ContainerBuilder()
            .setAccentColor(0x00FF00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🌙 AFK Status Set\n**Reason:** ${reason}`)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⏰ Duration:** ${durationText}\n**Settings:** DM ${dmNotifications ? '✅' : '❌'} | Public ${publicNotifications ? '✅' : '❌'} | Duration ${showDuration ? '✅' : '❌'}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true }))
                            .setDescription(`${interaction.user.username} AFK status`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*AFK status activated • ${new Date().toLocaleString()}*`)
            );

   
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`afk_setup_${interaction.user.id}`)
                    .setLabel('Set Auto-Response')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🤖'),
                new ButtonBuilder()
                    .setCustomId(`afk_remove_${interaction.user.id}`)
                    .setLabel('Remove AFK')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );

        await interaction.reply({ 
            components: [successContainer], 
            flags: MessageFlags.IsComponentsV2,
            components: [...([successContainer]), row],
            ephemeral: true 
        });

       
        if (dmNotifications) {
            try {
                const dmContainer = new ContainerBuilder()
                    .setAccentColor(0x00FF00)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🌙 AFK Status Confirmed\nYou are now AFK in **${interaction.guild.name}**\n\n**Reason:** ${reason}`)
                    );

                if (duration) {
                    const expiresTimestamp = Math.floor((Date.now() + duration) / 1000);
                    dmContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**Returns:** <t:${expiresTimestamp}:R>`)
                    );
                }

                dmContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*AFK notification • ${new Date().toLocaleString()}*`)
                );

                await interaction.user.send({ 
                    components: [dmContainer], 
                    flags: MessageFlags.IsComponentsV2 
                });
            } catch (error) {
               
            }
        }
    },

    async handleRemoveAFK(interaction, { removeAFK, getAFK }) {
        const afk = await getAFK(interaction.user.id, interaction.guild.id);

        if (!afk) {
            const notAfkContainer = new ContainerBuilder()
                .setAccentColor(0xFFAA00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚠️ Not AFK\nYou are not currently AFK.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [notAfkContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }

        await removeAFK(interaction.user.id, interaction.guild.id);

        const totalTime = Date.now() - afk.setAt.getTime();
        const duration = this.formatDuration(totalTime);

        const removedContainer = new ContainerBuilder()
            .setAccentColor(0x00FF7F)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ AFK Status Removed\nYour AFK status has been successfully removed.`)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**Previous Reason:** ${afk.reason}\n**AFK Duration:** ${duration}\n**Mentions Received:** ${afk.mentions.count}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true }))
                            .setDescription(`${interaction.user.username} returned from AFK`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Welcome back! • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [removedContainer], 
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true 
        });
    },

    async handleListAFK(interaction, { getAllAFKs }) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const permissionContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Permission Required\nYou need the **Manage Channels** permission to use this command.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [permissionContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }

        const page = interaction.options.getInteger('page') || 1;
        const { afks, pagination } = await getAllAFKs(interaction.guild.id, { page, limit: 10 });

        if (!afks.length) {
            const noUsersContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🌙 AFK Users\nNo users are currently AFK in this server.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [noUsersContainer], 
                flags: MessageFlags.IsComponentsV2 
            });
        }

        let description = '';
        for (const afk of afks) {
            try {
                const user = await interaction.guild.members.fetch(afk.userId).catch(() => null);
                const userName = user ? user.displayName : `Unknown User (${afk.userId})`;
                const afkDuration = this.formatDuration(Date.now() - new Date(afk.setAt).getTime());
                
                description += `**${userName}**\n`;
                description += `└ *${afk.reason}*\n`;
                description += `└ AFK for ${afkDuration}`;
                
                if (afk.mentions.count > 0) {
                    description += ` • ${afk.mentions.count} mentions`;
                }
                
                if (afk.expiresAt) {
                    const expiresTimestamp = Math.floor(new Date(afk.expiresAt).getTime() / 1000);
                    description += ` • Until <t:${expiresTimestamp}:R>`;
                }
                
                description += '\n\n';
            } catch (error) {
                console.error('Error processing AFK user:', error);
            }
        }

        const listContainer = new ContainerBuilder()
            .setAccentColor(0xFFCC00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🌙 AFK Users\nCurrently AFK users in ${interaction.guild.name}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(description.trim() || 'No AFK users found.')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Page ${pagination.current} of ${pagination.total} • ${afks.length} users shown*`)
            );

   
        const components = [listContainer];
        if (pagination.total > 1) {
            const row = new ActionRowBuilder();
            
            if (pagination.hasPrev) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`afk_list_${page - 1}`)
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⬅️')
                );
            }
            
            if (pagination.hasNext) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`afk_list_${page + 1}`)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('➡️')
                );
            }
            
            if (row.components.length > 0) {
                components.push(row);
            }
        }

        await interaction.reply({ 
            components: components, 
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleStatsAFK(interaction, { getGuildStats }) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const permissionContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Permission Required\nYou need the **Manage Channels** permission to use this command.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [permissionContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }

        const stats = await getGuildStats(interaction.guild.id);
        const totalSessions = stats.active + stats.expired + stats.removed;
        const activeRate = Math.round((stats.active / Math.max(1, totalSessions)) * 100);

        const statsContainer = new ContainerBuilder()
            .setAccentColor(0x3498DB)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📊 AFK Statistics - ${interaction.guild.name}\nComprehensive AFK usage statistics`)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🟢 Currently AFK:** ${stats.active}\n**🟡 Expired:** ${stats.expired}\n**🔴 Manually Removed:** ${stats.removed}\n**📝 Total Mentions:** ${stats.totalMentions}\n**📈 Total Sessions:** ${totalSessions}\n**🎯 Active Rate:** ${activeRate}%`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.guild.iconURL() || interaction.client.user.displayAvatarURL())
                            .setDescription(`${interaction.guild.name} AFK statistics`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Statistics generated • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [statsContainer], 
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleAutoResponse(interaction, { getAFK, setAFK }) {
        const message = interaction.options.getString('message');
        const cooldownMinutes = interaction.options.getInteger('cooldown') || 5;
        
        const afk = await getAFK(interaction.user.id, interaction.guild.id);
        
        if (!afk) {
            const notAfkContainer = new ContainerBuilder()
                .setAccentColor(0xFFAA00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚠️ Not AFK\nYou need to be AFK to set up auto-responses.\nUse \`/afk set\` first.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [notAfkContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }

        if (!message) {
        
            afk.autoResponses.enabled = false;
            await afk.save();
            
            const disabledContainer = new ContainerBuilder()
                .setAccentColor(0xFF6B6B)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤖 Auto-Response Disabled\nAuto-response has been disabled for your AFK status.`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Updated by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                );

            return interaction.reply({ 
                components: [disabledContainer], 
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true 
            });
        }

       
        afk.autoResponses.enabled = true;
        afk.autoResponses.message = message;
        afk.autoResponses.cooldown = cooldownMinutes * 60000; 
        await afk.save();

        const enabledContainer = new ContainerBuilder()
            .setAccentColor(0x4ECDC4)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🤖 Auto-Response Set\nAuto-response has been configured for your AFK status.`)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**Message:** ${message}\n**Cooldown:** ${cooldownMinutes} minute(s)\n\n*This message will be sent automatically when you are mentioned*`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true }))
                            .setDescription(`${interaction.user.username} auto-response setup`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Auto-response configured • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [enabledContainer], 
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true 
        });
    },

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
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