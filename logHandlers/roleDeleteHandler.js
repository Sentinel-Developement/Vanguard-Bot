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

module.exports = async function roleDeleteHandler(client) {
    client.on('roleDelete', async (role) => {
        const config = await LogConfig.findOne({ guildId: role.guild.id, eventType: 'roleDelete' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const logContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔴 Role Deleted\n## Server Role Removed\n\n> Role management event detected\n> Permission structure modified`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Role Name**\n${role.name}\n\n**Role ID**\n\`${role.id}\`\n\n**Role Color**\n${role.hexColor || '#000000'}\n\n**Previous Position**\nPosition ${role.position}\n\n**Was Mentionable**\n${role.mentionable ? 'Yes' : 'No'}\n\n**Was Hoisted**\n${role.hoist ? 'Yes (Displayed separately)' : 'No'}\n\n**Deleted At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(logHandlersIcons.badgeIcon)
                                .setDescription(`Role deletion notification`)
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
        }
    });
};
