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

module.exports = async function memberUnbanHandler(client) {
    client.on('guildBanRemove', async (ban) => {
        const config = await LogConfig.findOne({ guildId: ban.guild.id, eventType: 'memberUnban' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const logContainer = new ContainerBuilder()
                .setAccentColor(0x00FF00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔓 Member Unbanned\n## User Access Restored\n\n> Ban removal action executed\n> User can rejoin the server`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Username**\n${ban.user.tag}\n\n**User ID**\n\`${ban.user.id}\`\n\n**Account Created**\n<t:${Math.floor(ban.user.createdTimestamp / 1000)}:F>\n\n**Previous Ban Reason**\n${ban.reason || 'No reason was recorded'}\n\n**Unbanned At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(ban.user.displayAvatarURL({ dynamic: true, size: 256 }))
                                .setDescription(`Avatar of unbanned user ${ban.user.tag}`)
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
