const LogConfig = require('../models/serverLogs/LogConfig');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const logHandlersIcons = require('../UI/icons/loghandlers');

module.exports = async function roleRemovedHandler(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        if (removedRoles.size === 0) return;

        const config = await LogConfig.findOne({ guildId: newMember.guild.id, eventType: 'roleRemoved' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            removedRoles.forEach(role => {
                const logContainer = new ContainerBuilder()
                    .setAccentColor(0xFF0000)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🔴 Role Removed\n## Member Permission Revoked\n\n> Role assignment changed\n> User access level modified`)
                    )
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`**User**\n${newMember.user.tag}\n\n**User ID**\n\`${newMember.id}\`\n\n**Removed Role**\n${role.name}\n\n**Role ID**\n\`${role.id}\`\n\n**Role Color**\n${role.hexColor || '#000000'}\n\n**Role Position**\nPosition ${role.position}\n\n**Removed At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(logHandlersIcons.removedIcon)
                                    .setDescription(`Role removal notification`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Logs System • <t:${Math.floor(Date.now() / 1000)}:R>*`)
                    );

                logChannel.send({
                    components: [logContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            });
        }
    });
};
