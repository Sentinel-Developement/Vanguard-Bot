const logHandlersIcons = require('../UI/icons/loghandlers');
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

module.exports = async function roleCreateHandler(client) {
    client.on('roleCreate', async (role) => {
        const config = await LogConfig.findOne({ guildId: role.guild.id, eventType: 'roleCreate' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const logContainer = new ContainerBuilder()
                .setAccentColor(0x00FF00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🟢 Role Created\n## New Server Role Added\n\n> Role management event detected\n> Permission structure updated`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Role Name**\n${role.name}\n\n**Role ID**\n\`${role.id}\`\n\n**Role Color**\n${role.hexColor || '#000000'}\n\n**Role Position**\nPosition ${role.position}\n\n**Mentionable**\n${role.mentionable ? 'Yes' : 'No'}\n\n**Hoisted**\n${role.hoist ? 'Yes (Displayed separately)' : 'No'}\n\n**Created At**\n<t:${Math.floor(role.createdTimestamp / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(logHandlersIcons.badgeIcon)
                                .setDescription(`Role creation notification`)
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
