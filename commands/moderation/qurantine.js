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
    PermissionFlagsBits,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    EmbedBuilder
} = require('discord.js');
const QuarantineConfig = require('../../models/qurantine/quarantineConfig');
const UserQuarantine = require('../../models/qurantine/userQuarantine');
const LogConfig = require('../../models/serverLogs/LogConfig');
const logHandlersIcons = require('../../UI/icons/loghandlers');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quarantine')
        .setDescription('🚨 Advanced quarantine system management')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Put a user in quarantine with role isolation')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('User to quarantine')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for quarantine')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Release a user from quarantine and restore roles')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('User to release')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('status')
                .setDescription('Check quarantine status of a user')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('User to check')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('List all quarantined users in the server')
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Maximum users to show (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('help')
                .setDescription('Show comprehensive quarantine system help')
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
if (!await checkPermissions(interaction, 'admin')) return;
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const member = target ? interaction.guild.members.cache.get(target.id) : null;
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const guild = interaction.guild;
        const sender = interaction.user;

   
        const sendReply = async (components) => {
            return interaction.editReply({ 
                components: components, 
                flags: MessageFlags.IsComponentsV2 
            });
        };

    
        const sendModerationLog = async (action, targetMember, reason, moderator) => {
            try {
                const logConfig = await LogConfig.findOne({ guildId, eventType: 'moderationLogs' });
                if (!logConfig || !logConfig.channelId) return;

                const logChannel = guild.channels.cache.get(logConfig.channelId);
                if (!logChannel) return;

                let embedTitle, embedColor, actionIcon;
                
                if (action === 'quarantine') {
                    embedTitle = '🚨 User Quarantined';
                    embedColor = '#FF0000';
                    actionIcon = '🚨';
                } else if (action === 'release') {
                    embedTitle = '✅ User Released from Quarantine';
                    embedColor = '#00FF00';
                    actionIcon = '✅';
                }

                const embed = new EmbedBuilder()
                    .setTitle(embedTitle)
                    .setColor(embedColor)
                    .setThumbnail(logHandlersIcons.modIcon)
                    .addFields(
                        { name: 'User', value: `${targetMember.user.tag} (${targetMember.id})`, inline: true },
                        { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
                        { name: 'Action', value: `${actionIcon} ${action === 'quarantine' ? 'Quarantined' : 'Released'}`, inline: true },
                        { name: 'Reason', value: reason || 'No reason provided', inline: false },
                        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error sending moderation log:', error);
            }
        };

       
        const config = await QuarantineConfig.findOne({ guildId });
        if (!config || !config.quarantineEnabled) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🚨 QUARANTINE SYSTEM DISABLED**\nThe quarantine system is not enabled for this server.\n\nContact administrators to enable the quarantine system.')
                );

            return sendReply([errorContainer]);
        }

  
        if (subcommand === 'help') {
            const helpContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🚨 ADVANCED QUARANTINE SYSTEM**')
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🔒 Comprehensive User Isolation**\nAdvanced quarantine system with role preservation and automated management')
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('Quarantine help')
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🚨 Core Commands:**\n• `add` - Quarantine user with role isolation\n• `remove` - Release user and restore roles\n• `status` - Check user quarantine status\n• `list` - View all quarantined users')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔧 System Features:**\n• **Role Preservation** - Stores and restores user roles\n• **Automatic DM Notifications** - Users are informed of status\n• **Database Tracking** - Persistent quarantine records\n• **Moderation Logging** - Actions logged to mod channel\n• **Permission Protection** - Requires MANAGE_GUILD permission')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**💡 Usage Examples:**\n• `/quarantine add @user "Spam violation"`\n• `/quarantine remove @user`\n• `/quarantine status @user`\n• `/quarantine list 10`')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**⚠️ Important Notes:**\n• Quarantine removes all roles and applies isolation role\n• Previous roles are automatically restored upon release\n• All actions are logged and tracked in database\n• Moderation logs are sent if channel is configured\n• Users receive DM notifications when possible\n\n**Help by ${sender.tag} | Quarantine System v3.0**`)
                );

            return sendReply([helpContainer]);
        }

   
        if (subcommand === 'status') {
            if (!member) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ MEMBER NOT FOUND**\n**${target.tag}** is not in this server.`)
                    );
                return sendReply([errorContainer]);
            }

            const userQuarantine = await UserQuarantine.findOne({ userId: target.id, guildId });
            const isQuarantined = userQuarantine && userQuarantine.isQuarantined;

            const statusContainer = new ContainerBuilder()
                .setAccentColor(isQuarantined ? 0xff4757 : 0x2ecc71)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🔍 QUARANTINE STATUS CHECK**`)
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Status:** ${isQuarantined ? '🚨 QUARANTINED' : '✅ FREE'}\n**Checked By:** ${sender.tag}\n**Check Time:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(target.displayAvatarURL({ dynamic: true }))
                                .setDescription(`${target.tag} avatar`)
                        )
                )
                .addSeparatorComponents(separator => separator);

            if (isQuarantined) {
                statusContainer.addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🚨 Quarantine Details:**\n• **Reason:** ${userQuarantine.reason || 'No reason provided'}\n• **Quarantined Since:** <t:${Math.floor(userQuarantine.quarantinedAt / 1000)}:F>\n• **Duration:** <t:${Math.floor(userQuarantine.quarantinedAt / 1000)}:R>\n• **Stored Roles:** ${config.userRoles.get(target.id)?.length || 0} roles preserved`)
                );
            } else {
                statusContainer.addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**✅ Freedom Status:**\n• **Current Roles:** ${member.roles.cache.size - 1} active roles\n• **Last Quarantine:** ${userQuarantine ? '<t:' + Math.floor(userQuarantine.quarantinedAt / 1000) + ':F>' : 'Never quarantined'}\n• **Account Standing:** Good`)
                );
            }

            statusContainer.addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Status for ${target.id}**`)
                );

            return sendReply([statusContainer]);
        }

      
        if (subcommand === 'list') {
            const limit = interaction.options.getInteger('limit') || 10;
            const quarantinedUsers = await UserQuarantine.find({ 
                guildId, 
                isQuarantined: true 
            }).limit(limit);

            const listContainer = new ContainerBuilder()
                .setAccentColor(0xf39c12)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🚨 QUARANTINED USERS LIST**')
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Server:** ${guild.name}\n**Quarantined Users:** ${quarantinedUsers.length}\n**Showing:** ${Math.min(quarantinedUsers.length, limit)} users\n**Generated:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('Quarantine list')
                        )
                )
                .addSeparatorComponents(separator => separator);

            if (quarantinedUsers.length === 0) {
                listContainer.addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🎉 NO QUARANTINED USERS**\nThere are currently no users in quarantine.\n\n**Server Status:** All clear - no active quarantines')
                );
            } else {
                const userList = await Promise.all(quarantinedUsers.map(async (userData, index) => {
                    try {
                        const user = await guild.members.fetch(userData.userId);
                        const quarantineDuration = Math.floor((Date.now() - userData.quarantinedAt) / (1000 * 60 * 60 * 24));
                        return `**${index + 1}.** ${user.user.tag}\n   └ **Reason:** ${userData.reason || 'No reason'}\n   └ **Duration:** ${quarantineDuration} days ago\n   └ **ID:** ${userData.userId}`;
                    } catch (error) {
                        return `**${index + 1}.** Unknown User (${userData.userId})\n   └ **Reason:** ${userData.reason || 'No reason'}\n   └ **Status:** User left server`;
                    }
                }));

                listContainer.addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**📋 Active Quarantines:**\n${userList.join('\n\n')}`)
                );
            }

            listContainer.addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**📊 Statistics:**\n• **Total Checked:** ${quarantinedUsers.length} users\n• **System Status:** ${config.quarantineEnabled ? '✅ Active' : '❌ Disabled'}\n• **Quarantine Role:** ${guild.roles.cache.get(config.quarantineRoleId)?.name || 'Not Found'}\n\n**List by ${sender.tag}**`)
                );

            return sendReply([listContainer]);
        }

    
        if (subcommand === 'add') {
            if (!member) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ MEMBER NOT FOUND**\n**${target.tag}** is not in this server.`)
                    );
                return sendReply([errorContainer]);
            }

            const reason = interaction.options.getString('reason') || 'No reason provided';
            const quarantineRole = interaction.guild.roles.cache.get(config.quarantineRoleId);
            
            if (!quarantineRole) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🚨 QUARANTINE ROLE NOT FOUND**\nThe configured quarantine role no longer exists.\n\nContact administrators to reconfigure the quarantine system.')
                    );
                return sendReply([errorContainer]);
            }

           
            const existingQuarantine = await UserQuarantine.findOne({ userId: target.id, guildId });
            if (existingQuarantine && existingQuarantine.isQuarantined) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xffa500)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**⚠️ ALREADY QUARANTINED**\n**${target.tag}** is already in quarantine.\n\n**Current Reason:** ${existingQuarantine.reason || 'No reason provided'}\n**Since:** <t:${Math.floor(existingQuarantine.quarantinedAt / 1000)}:R>`)
                    );
                return sendReply([errorContainer]);
            }

            try {
            
                const userRoles = member.roles.cache.map(role => role.id);
                await member.roles.set([quarantineRole]);

      
                await UserQuarantine.findOneAndUpdate(
                    { userId: target.id, guildId },
                    { isQuarantined: true, quarantinedAt: new Date(), reason },
                    { upsert: true }
                );

                config.userRoles.set(target.id, userRoles);
                await config.save();

           
                await sendModerationLog('quarantine', member, reason, sender);

             
                const dmContainer = new ContainerBuilder()
                    .setAccentColor(0xff0000)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🚨 QUARANTINE NOTIFICATION**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Server:** ${interaction.guild.name}\n**Status:** Quarantined\n**Effective:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(interaction.guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Quarantine notice')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Reason:** ${reason}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**Important Information:**\n• Your roles have been temporarily removed and preserved\n• You are restricted to quarantine channels only\n• Contact server staff for clarification or appeals\n• Your roles will be restored upon release')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Quarantine ID:** ${target.id} | ${interaction.guild.name}`)
                    );

                try {
                    await member.send({ 
                        components: [dmContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    console.log(`❌ Failed to send DM to ${target.tag}. They might have DMs disabled.`);
                }

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🚨 USER QUARANTINED SUCCESSFULLY**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Quarantined By:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>\n**Role:** ${quarantineRole.name}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Quarantine Details:**\n• **Reason:** ${reason}\n• **Roles Preserved:** ${userRoles.length - 1} roles stored\n• **DM Status:** ${member.dmChannel ? '✅ Notification sent' : '⚠️ DM failed'}\n• **Database:** ✅ Record created\n• **Mod Logs:** ✅ Logged to channel`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Security Action:** User has been isolated with quarantine role\n**Operation ID:** ${target.id} | Quarantine system`)
                    );

                return sendReply([successContainer]);
            } catch (error) {
                console.error('Quarantine add error:', error);
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ QUARANTINE FAILED**\nFailed to quarantine **${target.tag}**.\n\n**Possible causes:** Role hierarchy issues, missing permissions, or database error.`)
                    );
                return sendReply([errorContainer]);
            }
        }

   
        if (subcommand === 'remove') {
            if (!member) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ MEMBER NOT FOUND**\n**${target.tag}** is not in this server.`)
                    );
                return sendReply([errorContainer]);
            }

            const userQuarantine = await UserQuarantine.findOne({ userId: target.id, guildId });

            if (!userQuarantine || !userQuarantine.isQuarantined) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xffa500)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**⚠️ USER NOT QUARANTINED**\n**${target.tag}** is not currently in quarantine.\n\nUse \`/quarantine status @user\` to check their current status.`)
                    );
                return sendReply([errorContainer]);
            }

            try {
      
                await UserQuarantine.findOneAndUpdate(
                    { userId: target.id, guildId },
                    { isQuarantined: false }
                );

             
                const previousRoleIds = config.userRoles.get(target.id) || [];
                const validRoles = previousRoleIds
                    .map(roleId => interaction.guild.roles.cache.get(roleId))
                    .filter(role => role);

      
                const quarantineRole = interaction.guild.roles.cache.get(config.quarantineRoleId);
                if (quarantineRole) {
                    await member.roles.remove(quarantineRole);
                }

                if (validRoles.length > 0) {
                    await member.roles.set(validRoles);
                }

             
                config.userRoles.delete(target.id);
                await config.save();

           
                await sendModerationLog('release', member, userQuarantine.reason, sender);

             
                const dmContainer = new ContainerBuilder()
                    .setAccentColor(0x00ff00)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ QUARANTINE RELEASE NOTIFICATION**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Server:** ${interaction.guild.name}\n**Status:** Released\n**Effective:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(interaction.guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Release notice')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**Welcome Back:**\nYou have been released from quarantine and your previous roles have been restored.')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Restoration Details:**\n• **Roles Restored:** ${validRoles.length} roles returned\n• **Access Level:** Full server access restored\n• **Status:** Account in good standing\n• **Duration:** Quarantined for <t:${Math.floor(userQuarantine.quarantinedAt / 1000)}:R>`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Release ID:** ${target.id} | ${interaction.guild.name}`)
                    );

                try {
                    await member.send({ 
                        components: [dmContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    });
                } catch (error) {
                    console.log(`❌ Failed to send DM to ${target.tag}. They might have DMs disabled.`);
                }

          
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x2ecc71)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**✅ USER RELEASED FROM QUARANTINE**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Released By:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>\n**Duration:** <t:${Math.floor(userQuarantine.quarantinedAt / 1000)}:R>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(target.displayAvatarURL({ dynamic: true }))
                                    .setDescription(`${target.tag} avatar`)
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Release Details:**\n• **Original Reason:** ${userQuarantine.reason || 'No reason provided'}\n• **Roles Restored:** ${validRoles.length} roles returned\n• **DM Status:** ${member.dmChannel ? '✅ Notification sent' : '⚠️ DM failed'}\n• **Database:** ✅ Record updated\n• **Mod Logs:** ✅ Logged to channel`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Freedom Restored:** User has full access and all previous roles\n**Operation ID:** ${target.id} | Quarantine system`)
                    );

                return sendReply([successContainer]);
            } catch (error) {
                console.error('Quarantine remove error:', error);
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ RELEASE FAILED**\nFailed to release **${target.tag}** from quarantine.\n\n**Possible causes:** Role hierarchy issues, missing permissions, or database error.`)
                    );
                return sendReply([errorContainer]);
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