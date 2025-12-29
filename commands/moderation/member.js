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
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const LogConfig = require('../../models/serverLogs/LogConfig');
const logHandlersIcons = require('../../UI/icons/loghandlers');
const checkPermissions = require('../../utils/checkPermissions');

async function logModerationAction(action, executor, target, reason, guild, extra = {}) {
    try {

        const config = await LogConfig.findOne({
            guildId: guild.id,
            eventType: 'moderationLogs'
        });

        if (!config || !config.channelId) return;

        const logChannel = guild.channels.cache.get(config.channelId);
        if (!logChannel) return;

       
        const actionConfig = {
            'ban': {
                emoji: '🔨', color: 0xe74c3c,
                title: 'Member Banned', description: 'User permanently removed from server'
            },
            'unban': {
                emoji: '🔓', color: 0x27ae60,
                title: 'Member Unbanned', description: 'User ban removed, can rejoin'
            },
            'kick': {
                emoji: '👢', color: 0xf39c12,
                title: 'Member Kicked', description: 'User removed from server'
            },
            'timeout': {
                emoji: '⏰', color: 0x9b59b6,
                title: 'Member Timed Out', description: 'Communication restrictions applied'
            },
            'removetimeout': {
                emoji: '🔊', color: 0x2ecc71,
                title: 'Timeout Removed', description: 'Communication restrictions lifted'
            },
            'nickname': {
                emoji: '🏷️', color: 0x3498db,
                title: 'Nickname Changed', description: 'Member nickname modified'
            },
            'warn': {
                emoji: '⚠️', color: 0xf1c40f,
                title: 'Warning Issued', description: 'Official warning sent to member'
            },
            'softban': {
                emoji: '🧹', color: 0xff6b6b,
                title: 'Member Softbanned', description: 'Messages cleaned, user can rejoin'
            },
            'dm': {
                emoji: '📨', color: 0x3498db,
                title: 'DM Sent', description: 'Official message delivered'
            },
            'massban': {
                emoji: '🔨', color: 0x8b0000,
                title: 'Mass Ban Operation', description: 'Multiple users banned simultaneously'
            }
        };

        const actionData = actionConfig[action] || {
            emoji: '⚖️', color: 0x95a5a6,
            title: 'Moderation Action', description: 'Moderation action executed'
        };

    
        const logContainer = new ContainerBuilder()
            .setAccentColor(actionData.color)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${actionData.emoji} ${actionData.title}\n## ${actionData.description}\n\n> Executed by ${executor.tag}\n> Action: ${action.toUpperCase()}`)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(buildActionDetails(action, executor, target, reason, extra))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(logHandlersIcons.modIcon)
                            .setDescription('Moderation action notification')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Moderation Logs System • <t:${Math.floor(Date.now() / 1000)}:R>*`)
            );

     
        await logChannel.send({
            components: [logContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Moderation logging error:', error);
    }
}

function buildActionDetails(action, executor, target, reason, extra) {
    const baseDetails = [
        `**👤 Target User**`,
        target ? target.tag : (extra.userId || 'Unknown User'),
        ``,
        `**🛡️ Moderator**`,
        executor.tag,
        ``,
        `**📝 Reason**`,
        reason || 'No reason provided',
        ``,
        `**🕒 Timestamp**`,
        `<t:${Math.floor(Date.now() / 1000)}:F>`
    ];

  
    switch (action) {
        case 'ban':
            if (extra.days !== undefined) {
                baseDetails.push('', '**📅 Messages Deleted**', `${extra.days} days`);
            }
            break;
        case 'unban':
            if (extra.previousReason) {
                baseDetails.push('', '**📋 Previous Ban Reason**', extra.previousReason);
            }
            break;
        case 'timeout':
            if (extra.duration) {
                baseDetails.push('', '**⏱️ Duration**', extra.duration);
                baseDetails.push('', '**⏰ Expires**', `<t:${Math.floor((Date.now() + extra.durationMs) / 1000)}:F>`);
            }
            break;
        case 'removetimeout':
            if (extra.previousTimeout) {
                baseDetails.push('', '**⏰ Previous Timeout**', `<t:${Math.floor(extra.previousTimeout / 1000)}:F>`);
            }
            break;
        case 'nickname':
            if (extra.oldNickname || extra.newNickname) {
                baseDetails.push('', '**📛 Previous**', extra.oldNickname || 'No nickname');
                baseDetails.push('', '**🏷️ New**', extra.newNickname || 'No nickname');
                baseDetails.push('', '**🔄 Action**', extra.nicknameAction || 'Modified');
            }
            break;
        case 'warn':
            if (extra.severity) {
                const severityEmojis = { low: '🟡', medium: '🟠', high: '🔴', critical: '🚨' };
                baseDetails.push('', '**⚠️ Severity**', `${severityEmojis[extra.severity]} ${extra.severity.toUpperCase()}`);
            }
            if (extra.dmStatus) {
                baseDetails.push('', '**📬 DM Status**', extra.dmStatus);
            }
            break;
        case 'softban':
            if (extra.days !== undefined) {
                baseDetails.push('', '**🧹 Messages Cleaned**', `${extra.days} days`);
            }
            break;
        case 'dm':
            if (extra.messageType) {
                const typeEmojis = { info: '📢', warning: '⚠️', announcement: '📣', support: '🆘' };
                baseDetails.push('', '**📤 Message Type**', `${typeEmojis[extra.messageType]} ${extra.messageType.toUpperCase()}`);
            }
            if (extra.messagePreview) {
                baseDetails.push('', '**💬 Preview**', extra.messagePreview);
            }
            break;
        case 'massban':
            if (extra.attempted && extra.successful !== undefined && extra.failed !== undefined) {
                baseDetails.push('', '**📊 Results**', `${extra.successful}/${extra.attempted} successful`);
                baseDetails.push('', '**❌ Failed**', `${extra.failed} users`);
            }
            break;
    }


    if (target) {
        baseDetails.push('', '**🔍 User ID**', `\`${target.id}\``);
    } else if (extra.userId) {
        baseDetails.push('', '**🔍 User ID**', `\`${extra.userId}\``);
    }

    return baseDetails.join('\n');
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('member')
        .setDescription('🛡️ Advanced server member management and moderation tools')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Ban a user from the server with advanced options')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to ban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the ban')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Delete messages from last X days (0-7)')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(7)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Unban a user via their ID with detailed logging')
                .addStringOption(option =>
                    option.setName('userid')
                        .setDescription('User ID to unban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the unban')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Kick a user from the server with logging')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to kick')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the kick')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timeout')
                .setDescription('Put a user in timeout with flexible duration')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to timeout')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('Duration (e.g., 5m, 1h, 2d)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the timeout')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removetimeout')
                .setDescription('Remove timeout from a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to remove timeout from')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing timeout')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nickname')
                .setDescription('Advanced nickname management')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to manage')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Set Nickname', value: 'set' },
                            { name: 'Remove Nickname', value: 'remove' },
                            { name: 'View Info', value: 'info' }
                        ))
                .addStringOption(option =>
                    option.setName('nickname')
                        .setDescription('New nickname (required for set action)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Issue a warning to a user with logging')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to warn')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the warning')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('severity')
                        .setDescription('Warning severity level')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Low', value: 'low' },
                            { name: 'Medium', value: 'medium' },
                            { name: 'High', value: 'high' },
                            { name: 'Critical', value: 'critical' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('softban')
                .setDescription('Softban a user (ban + unban to delete messages)')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to softban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for softban')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Delete messages from last X days (0-7)')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(7)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dm')
                .setDescription('Send a professional DM to a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to message')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to send')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Message type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Information', value: 'info' },
                            { name: 'Warning', value: 'warning' },
                            { name: 'Announcement', value: 'announcement' },
                            { name: 'Support', value: 'support' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get detailed information about a member')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('Member to analyze')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List members with filters')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter criteria')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Recently Joined', value: 'recent' },
                            { name: 'In Timeout', value: 'timeout' },
                            { name: 'Boosters', value: 'boosters' },
                            { name: 'Bots', value: 'bots' },
                            { name: 'No Avatar', value: 'no_avatar' }
                        ))
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Maximum number of results (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Show detailed help for member commands'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('massban')
                .setDescription('Mass ban multiple users (Admin only)')
                .addStringOption(option =>
                    option.setName('userids')
                        .setDescription('User IDs separated by spaces')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for mass ban')
                        .setRequired(false))),

    async execute(interaction) {
          if (!await checkPermissions(interaction, 'moderator')) return;
        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;


        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply();
            subcommand = interaction.options.getSubcommand();
        } else {
 
            const message = interaction;
            sender = message.author;
            const args = message.content.split(' ');
            args.shift(); 
            subcommand = args[0] || 'help';
        }

   
        const sendReply = async (content) => {
            if (isSlashCommand) {
                return interaction.editReply(content);
            } else {
                return interaction.reply(content);
            }
        };

  
        const parseDuration = (duration) => {
            const match = duration.match(/^(\d+)([mhd])$/);
            if (!match) return null;

            const [, amount, unit] = match;
            const multipliers = { m: 60000, h: 3600000, d: 86400000 };
            return parseInt(amount) * multipliers[unit];
        };


        const hasPermission = (permission) => {
            const member = isSlashCommand ? interaction.member : interaction.member;
            return member.permissions.has(permission);
        };


        const getOption = (name, type = 'string') => {
            if (isSlashCommand) {
                switch (type) {
                    case 'user': return interaction.options.getUser(name);
                    case 'integer': return interaction.options.getInteger(name);
                    default: return interaction.options.getString(name);
                }
            } else {
              
                const args = interaction.content.split(' ');
                const index = args.indexOf(`--${name}`);
                if (index !== -1 && index + 1 < args.length) {
                    return args[index + 1];
                }
                return null;
            }
        };

    
        if (subcommand === 'help') {
            const helpContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🛡️ ADVANCED MEMBER MANAGEMENT SYSTEM**')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**📋 Available Commands:**\nUse `/member <subcommand>` for moderation actions')
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**⚔️ Moderation Actions**\n• `ban` - Ban user with advanced options\n• `unban` - Unban user with logging\n• `kick` - Kick user from server\n• `softban` - Clean ban (removes messages)\n• `massban` - Mass ban multiple users')
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('Moderation tools')
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**⏰ Timeout Management**\n• `timeout` - Flexible timeout system\n• `removetimeout` - Remove timeout\n• Duration formats: 5m, 1h, 2d')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**👤 User Management**\n• `nickname` - Advanced nickname system\n• `warn` - Multi-level warning system\n• `dm` - Professional messaging\n• `info` - Detailed member analysis\n• `list` - Member filtering tools')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🔧 Help requested by ${sender.tag} | Advanced Moderation v3.0**`)
                );

            return sendReply({
                components: [helpContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

 
        const moderationCommands = ['ban', 'unban', 'kick', 'timeout', 'removetimeout', 'softban', 'massban'];
        const nicknameCommands = ['nickname'];
        const messageCommands = ['dm', 'warn'];

        if (moderationCommands.includes(subcommand) && !hasPermission(PermissionFlagsBits.ModerateMembers)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔒 ACCESS DENIED**\nRequired Permission: MODERATE_MEMBERS\nContact server administrators for access.')
                );

            return sendReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true
            });
        }

        if (nicknameCommands.includes(subcommand) && !hasPermission(PermissionFlagsBits.ManageNicknames)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔒 ACCESS DENIED**\nRequired Permission: MANAGE_NICKNAMES\nContact server administrators for access.')
                );

            return sendReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true
            });
        }

        if (messageCommands.includes(subcommand) && !hasPermission(PermissionFlagsBits.ManageMessages)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔒 ACCESS DENIED**\nRequired Permission: MANAGE_MESSAGES\nContact server administrators for access.')
                );

            return sendReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true
            });
        }

  
        if (subcommand === 'ban') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const days = getOption('days', 'integer') || 0;
            const member = interaction.guild.members.cache.get(target.id);

            if (!member) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ USER NOT FOUND**\n**${target.tag}** is not in this server.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            if (!member.bannable) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ CANNOT BAN USER**\nCannot ban **${target.tag}**. Check role hierarchy and permissions.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            try {
                await member.ban({
                    reason: `${reason} | Banned by ${sender.tag}`,
                    deleteMessageDays: days
                });

                const banContainer = new ContainerBuilder()
                    .setAccentColor(0xe74c3c)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔨 USER BANNED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Messages Deleted:** ${days} days\n**Ban ID:** ${target.id}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ Action completed successfully**')
                    );
      
                await logModerationAction('ban', sender, target, reason, interaction.guild, {
                    days: days
                });
                return sendReply({
                    components: [banContainer],
                    flags: MessageFlags.IsComponentsV2
                });



            } catch (error) {
                console.error('Ban error:', error);
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ BAN FAILED**\nFailed to ban **${target.tag}**. Please check permissions and try again.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }

   
        if (subcommand === 'unban') {
            const userId = getOption('userid');
            const reason = getOption('reason') || 'No reason provided';

            try {
                const bannedUser = await interaction.guild.bans.fetch(userId);
                await interaction.guild.members.unban(userId, `${reason} | Unbanned by ${sender.tag}`);

                const unbanContainer = new ContainerBuilder()
                    .setAccentColor(0x27ae60)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔓 USER UNBANNED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**User ID:** ${userId}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(bannedUser.user.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${bannedUser.user.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Previous Ban:** ${bannedUser.reason || 'No reason recorded'}\n**Reason:** ${reason}\n**Unban ID:** ${userId}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ User can now rejoin the server**')
                    );
                await logModerationAction('unban', sender, bannedUser.user, reason, interaction.guild, {
                    previousReason: bannedUser.reason,
                    userId: userId
                });
                return sendReply({
                    components: [unbanContainer],
                    flags: MessageFlags.IsComponentsV2
                });


            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ UNBAN FAILED**\nNo banned user found with ID **${userId}**.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }

     
        if (subcommand === 'kick') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.kickable) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ CANNOT KICK USER**\nCannot kick **${target.tag}**. Check permissions and role hierarchy.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            try {
                await member.kick(`${reason} | Kicked by ${sender.tag}`);

                const kickContainer = new ContainerBuilder()
                    .setAccentColor(0xf39c12)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**👢 USER KICKED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Kick ID:** ${target.id}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ User has been removed from the server**')
                    );
                await logModerationAction('kick', sender, target, reason, interaction.guild);
                return sendReply({
                    components: [kickContainer],
                    flags: MessageFlags.IsComponentsV2
                });
             


            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ KICK FAILED**\nFailed to kick **${target.tag}**. Please try again.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }


        if (subcommand === 'timeout') {
            const target = getOption('target', 'user');
            const durationStr = getOption('duration');
            const reason = getOption('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.moderatable) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ CANNOT TIMEOUT USER**\nCannot timeout **${target.tag}**. Check permissions and role hierarchy.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            const duration = parseDuration(durationStr);
            if (!duration) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**❌ INVALID DURATION FORMAT**\nUse: 5m, 1h, 2d\n\n**Examples:**\n• 5m = 5 minutes\n• 1h = 1 hour\n• 2d = 2 days')
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            try {
                await member.timeout(duration, `${reason} | Timed out by ${sender.tag}`);

                const timeoutContainer = new ContainerBuilder()
                    .setAccentColor(0x9b59b6)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**⏰ USER TIMED OUT**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Duration:** ${durationStr}\n**Moderator:** ${sender.tag}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Expires:** <t:${Math.floor((Date.now() + duration) / 1000)}:F>\n**Timeout ID:** ${target.id}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ User has been muted**')
                    );
                await logModerationAction('timeout', sender, target, reason, interaction.guild, {
                    duration: durationStr,
                    durationMs: duration
                });

                return sendReply({
                    components: [timeoutContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            

            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ TIMEOUT FAILED**\nFailed to timeout **${target.tag}**. Please try again.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }

    
        if (subcommand === 'removetimeout') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.communicationDisabledUntilTimestamp) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ USER NOT IN TIMEOUT**\n**${target.tag}** is not currently in timeout.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            try {
                await member.timeout(null, `${reason} | Timeout removed by ${sender.tag}`);

                const removeTimeoutContainer = new ContainerBuilder()
                    .setAccentColor(0x2ecc71)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔓 TIMEOUT REMOVED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Removal ID:** ${target.id}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ User can now speak again**')
                    );
                const previousTimeout = member.communicationDisabledUntilTimestamp;
                await logModerationAction('removetimeout', sender, target, reason, interaction.guild, {
                    previousTimeout: previousTimeout
                });
                return sendReply({
                    components: [removeTimeoutContainer],
                    flags: MessageFlags.IsComponentsV2
                });
              


            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ TIMEOUT REMOVAL FAILED**\nFailed to remove timeout for **${target.tag}**. Please try again.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }

    
        if (subcommand === 'nickname') {
            const target = getOption('target', 'user');
            const action = getOption('action');
            const nickname = getOption('nickname');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.manageable) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ CANNOT MANAGE NICKNAME**\nCannot manage nickname for **${target.tag}**. Check permissions and role hierarchy.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            if (action === 'set') {
                if (!nickname) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**❌ NICKNAME REQUIRED**\nPlease provide a nickname to set.')
                        );

                    return sendReply({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true
                    });
                }

                try {
                    const oldNickname = member.nickname || member.user.username;
                    await member.setNickname(nickname);

                    const nicknameContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🏷️ NICKNAME UPDATED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addSectionComponents(
                            section => section
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                                )
                                .setThumbnailAccessory(
                                    thumbnail => thumbnail
                                        .setURL(target.displayAvatarURL({ dynamic: true }))
                                        .setDescription(`${target.tag} avatar`)
                                )
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Old Nickname:** ${oldNickname}\n**New Nickname:** ${nickname}\n**Nickname ID:** ${target.id}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**✅ Nickname successfully updated**')
                        );
                    await logModerationAction('nickname', sender, target, `Nickname ${action}ed`, interaction.guild, {
                        oldNickname: oldNickname,
                        newNickname: action === 'set' ? nickname : null,
                        nicknameAction: action
                    });

                    return sendReply({
                        components: [nicknameContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                  

                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ NICKNAME UPDATE FAILED**\nFailed to set nickname for **${target.tag}**. Please try again.`)
                        );

                    return sendReply({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true
                    });
                }
            }

            if (action === 'remove') {
                try {
                    const oldNickname = member.nickname || 'No nickname';
                    await member.setNickname(null);

                    const removeNicknameContainer = new ContainerBuilder()
                        .setAccentColor(0xe74c3c)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🗑️ NICKNAME REMOVED**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addSectionComponents(
                            section => section
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                                )
                                .setThumbnailAccessory(
                                    thumbnail => thumbnail
                                        .setURL(target.displayAvatarURL({ dynamic: true }))
                                        .setDescription(`${target.tag} avatar`)
                                )
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Previous Nickname:** ${oldNickname}\n**Removal ID:** ${target.id}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**✅ Nickname successfully removed**')
                        );
                    await logModerationAction('nickname', sender, target, `Nickname ${action}ed`, interaction.guild, {
                        oldNickname: oldNickname,
                        newNickname: action === 'set' ? nickname : null,
                        nicknameAction: action
                    });

                    return sendReply({
                        components: [removeNicknameContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                   

                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ NICKNAME REMOVAL FAILED**\nFailed to remove nickname for **${target.tag}**. Please try again.`)
                        );

                    return sendReply({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true
                    });
                }
            }

            if (action === 'info') {
                const nicknameInfoContainer = new ContainerBuilder()
                    .setAccentColor(0x95a5a6)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📋 NICKNAME INFORMATION**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Current Nickname:** ${member.nickname || 'No nickname set'}\n**Display Name:** ${member.displayName}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Username:** ${target.username}\n**Can Modify:** ${member.manageable ? '✅ Yes' : '❌ No'}\n**Hierarchy:** ${interaction.member.roles.highest.position > member.roles.highest.position ? '✅ Above' : '❌ Below/Equal'}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Info for ${target.id}**`)
                    );

                return sendReply({
                    components: [nicknameInfoContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        }

       
        if (subcommand === 'warn') {
            const target = getOption('target', 'user');
            const reason = getOption('reason');
            const severity = getOption('severity') || 'medium';

            const severityColors = {
                low: 0xf1c40f,
                medium: 0xe67e22,
                high: 0xe74c3c,
                critical: 0x8e44ad
            };

            const severityEmojis = {
                low: '⚠️',
                medium: '🔸',
                high: '🔴',
                critical: '🚨'
            };

          
            const warnDMContainer = new ContainerBuilder()
                .setAccentColor(severityColors[severity])
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**${severityEmojis[severity]} OFFICIAL WARNING**`)
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Server:** ${interaction.guild.name}\n**Severity:** ${severity.toUpperCase()}\n**Issued by:** ${sender.tag}`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(interaction.guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('Server warning')
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**⚠️ Important Notice:**\nThis is an official warning. Continued violations may result in further disciplinary action including timeout, kick, or ban.\n\nPlease review the server rules and adjust your behavior accordingly.')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Warning ID:** ${target.id} | ${interaction.guild.name}`)
                );

            try {
                await target.send({
                    components: [warnDMContainer],
                    flags: MessageFlags.IsComponentsV2
                });

             
                const confirmContainer = new ContainerBuilder()
                    .setAccentColor(severityColors[severity])
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📨 WARNING ISSUED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Severity:** ${severity.toUpperCase()}\n**Moderator:** ${sender.tag}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Status:** ✅ Successfully delivered\n**Warning confirmed for ${target.id}**`)
                    );
                await logModerationAction('warn', sender, target, reason, interaction.guild, {
                    severity: severity,
                    dmStatus: dmSent ? '✅ Delivered' : '❌ DMs Closed'
                });
                return sendReply({
                    components: [confirmContainer],
                    flags: MessageFlags.IsComponentsV2
                });
               


            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**⚠️ WARNING ISSUED (DM FAILED)**\n**${target.tag}** was warned, but their DMs are closed.\nWarning has been logged in the system.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        }

       
        if (subcommand === 'softban') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const days = getOption('days', 'integer') || 7;
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.bannable) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ CANNOT SOFTBAN USER**\nCannot softban **${target.tag}**. Check permissions and role hierarchy.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            try {
                await member.ban({
                    reason: `Softban: ${reason} | By ${sender.tag}`,
                    deleteMessageDays: days
                });
                await interaction.guild.members.unban(target.id, 'Softban unban');

                const softbanContainer = new ContainerBuilder()
                    .setAccentColor(0xff6b6b)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🧹 USER SOFTBANNED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Moderator:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Messages Deleted:** ${days} days\n**Softban ID:** ${target.id}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**ℹ️ Status:** ✅ Messages cleaned, user can rejoin\n**Softban completed successfully**')
                    );
                await logModerationAction('softban', sender, target, reason, interaction.guild, {
                    days: days
                });
                return sendReply({
                    components: [softbanContainer],
                    flags: MessageFlags.IsComponentsV2
                });



            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ SOFTBAN FAILED**\nFailed to softban **${target.tag}**. Please try again.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }

     
        if (subcommand === 'dm') {
            const target = getOption('target', 'user');
            const message = getOption('message');
            const type = getOption('type') || 'info';

            const typeColors = {
                info: 0x3498db,
                warning: 0xf39c12,
                announcement: 0x9b59b6,
                support: 0x2ecc71
            };

            const typeEmojis = {
                info: '📢',
                warning: '⚠️',
                announcement: '📣',
                support: '🆘'
            };

       
            const dmContainer = new ContainerBuilder()
                .setAccentColor(typeColors[type])
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**${typeEmojis[type]} MESSAGE FROM ${interaction.guild.name.toUpperCase()}**`)
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Message Type:** ${type.toUpperCase()}\n**From:** ${sender.tag}\n**Server:** ${interaction.guild.name}`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(interaction.guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('Server message')
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Date:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n**📝 Message:**\n${message}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('This is an official message from the server staff.')
                );

            try {
                await target.send({
                    components: [dmContainer],
                    flags: MessageFlags.IsComponentsV2
                });

             
                const confirmContainer = new ContainerBuilder()
                    .setAccentColor(typeColors[type])
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📨 MESSAGE SENT**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Recipient:** ${target.tag}\n**Type:** ${type.toUpperCase()}\n**Sender:** ${sender.tag}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Status:** ✅ Successfully delivered\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>\n**DM ID:** ${target.id}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Message Preview:**\n${message.length > 100 ? message.substring(0, 100) + '...' : message}`)
                    );
                await logModerationAction('dm', sender, target, `Official ${type} message sent`, interaction.guild, {
                    messageType: type,
                    messagePreview: message.length > 100 ? message.substring(0, 100) + '...' : message
                });
                return sendReply({
                    components: [confirmContainer],
                    flags: MessageFlags.IsComponentsV2
                });
        


            } catch (error) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ DM FAILED**\nCould not DM **${target.tag}**. They may have DMs disabled.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }
        }


        if (subcommand === 'info') {
            const target = getOption('target', 'user');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ MEMBER NOT FOUND**\n**${target.tag}** is not in this server.`)
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            const roles = member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => role.toString())
                .slice(0, 10);

            const memberInfoContainer = new ContainerBuilder()
                .setAccentColor(0x34495e)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**👤 MEMBER INFORMATION**')
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Username:** ${target.username}\n**Display Name:** ${member.displayName}\n**ID:** ${target.id}`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(target.displayAvatarURL({ dynamic: true, size: 512 }))
                                .setDescription(`${target.tag} avatar`)
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🔍 Basic Information:**\n• **Nickname:** ${member.nickname || 'None'}\n• **Bot:** ${target.bot ? '✅ Yes' : '❌ No'}\n• **Account Created:** <t:${Math.floor(target.createdTimestamp / 1000)}:F>`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**📅 Server Information:**\n• **Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n• **Days in Server:** ${Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24))}\n• **Boosting:** ${member.premiumSince ? `Since <t:${Math.floor(member.premiumSince / 1000)}:F>` : 'No'}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**⚖️ Moderation Status:**\n• **Timeout:** ${member.communicationDisabledUntilTimestamp ? `<t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:F>` : 'None'}\n• **Kickable:** ${member.kickable ? '✅ Yes' : '❌ No'}\n• **Bannable:** ${member.bannable ? '✅ Yes' : '❌ No'}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🎭 Server Presence:**\n• **Status:** ${member.presence?.status || 'Offline'}\n• **Highest Role:** ${member.roles.highest.name}\n• **Role Count:** ${member.roles.cache.size - 1}\n• **Manageable:** ${member.manageable ? '✅ Yes' : '❌ No'}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🛡️ Roles:** ${roles.length ? roles.join(', ') : 'No roles'}${roles.length > 10 ? `\n*+${member.roles.cache.size - 11} more roles...*` : ''}\n\n**Information for ${target.id}**`)
                );

            return sendReply({
                components: [memberInfoContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

    
        if (subcommand === 'list') {
            const filter = getOption('filter') || 'recent';
            const limit = getOption('limit', 'integer') || 10;
            let members = [];

            switch (filter) {
                case 'recent':
                    members = Array.from(interaction.guild.members.cache.values())
                        .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
                        .slice(0, limit);
                    break;
                case 'timeout':
                    members = Array.from(interaction.guild.members.cache.values())
                        .filter(member => member.communicationDisabledUntilTimestamp)
                        .slice(0, limit);
                    break;
                case 'boosters':
                    members = Array.from(interaction.guild.members.cache.values())
                        .filter(member => member.premiumSince)
                        .slice(0, limit);
                    break;
                case 'bots':
                    members = Array.from(interaction.guild.members.cache.values())
                        .filter(member => member.user.bot)
                        .slice(0, limit);
                    break;
                case 'no_avatar':
                    members = Array.from(interaction.guild.members.cache.values())
                        .filter(member => !member.user.avatar)
                        .slice(0, limit);
                    break;
            }

            const filterEmojis = {
                recent: '🆕',
                timeout: '⏰',
                boosters: '💎',
                bots: '🤖',
                no_avatar: '👤'
            };

            const listContainer = new ContainerBuilder()
                .setAccentColor(0x2c3e50)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**${filterEmojis[filter]} MEMBER LIST - ${filter.toUpperCase()}**`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Filter:** ${filter.toUpperCase()}\n**Results:** ${members.length}/${limit}\n**Total Members:** ${interaction.guild.memberCount}\n**Generated:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**📋 Member List:**')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(
                        members.length > 0
                            ? members.map((member, index) => {
                                const joinedDays = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
                                const status = member.communicationDisabledUntilTimestamp ? '⏰' :
                                    member.premiumSince ? '💎' :
                                        member.user.bot ? '🤖' : '👤';
                                return `**${index + 1}.** ${status} ${member.displayName} \`${member.user.tag}\` (${joinedDays}d ago)`;
                            }).join('\n')
                            : 'No members found with this filter.'
                    )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Page 1 | Filter: ${filter}**`)
                );

            return sendReply({
                components: [listContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

     
        if (subcommand === 'massban') {
            if (!hasPermission(PermissionFlagsBits.Administrator)) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔒 INSUFFICIENT PERMISSIONS**\nYou need **Administrator** permission for mass ban operations.')
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            const userIds = getOption('userids').split(' ').filter(id => id.length > 0);
            const reason = getOption('reason') || 'Mass ban operation';

            if (userIds.length > 10) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**❌ TOO MANY USERS**\nMaximum 10 users can be banned at once for safety.')
                    );

                return sendReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true
                });
            }

            const results = { success: [], failed: [] };

            for (const userId of userIds) {
                try {
                    await interaction.guild.members.ban(userId, {
                        reason: `Mass ban: ${reason} | By ${sender.tag}`
                    });
                    results.success.push(userId);
                } catch (error) {
                    results.failed.push(userId);
                }
            }

            const massbanContainer = new ContainerBuilder()
                .setAccentColor(0xdc3545)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔨 MASS BAN RESULTS**')
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Moderator:** ${sender.tag}\n**Attempted:** ${userIds.length}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(sender.displayAvatarURL({ dynamic: true }))
                                .setDescription(`${sender.tag} avatar`)
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Successful:** ${results.success.length}\n**Failed:** ${results.failed.length}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**✅ Successfully Banned:**\n${results.success.map(id => `• \`${id}\``).join('\n') || 'None'}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**❌ Failed to Ban:**\n${results.failed.map(id => `• \`${id}\``).join('\n') || 'None'}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**⚠️ Mass ban operation by ${sender.tag}**`)
                );
            await logModerationAction('massban', sender, null, reason, interaction.guild, {
                attempted: userIds.length,
                successful: results.success.length,
                failed: results.failed.length,
                userId: 'Multiple Users'
            });
            return sendReply({
                components: [massbanContainer],
                flags: MessageFlags.IsComponentsV2
            });


        }


        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent('**❌ INVALID SUBCOMMAND**\nInvalid subcommand. Use `/member help` for available commands.')
            );

        return sendReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true
        });
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