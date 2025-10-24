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

module.exports = async function memberBanHandler(client) {
    client.on('guildBanAdd', async (ban) => {
        const config = await LogConfig.findOne({ guildId: ban.guild.id, eventType: 'memberBan' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const logContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔨 Member Banned\n## User Permanently Removed\n\n> Ban enforcement action executed\n> User access terminated`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Username**\n${ban.user.tag}\n\n**User ID**\n\`${ban.user.id}\`\n\n**Account Created**\n<t:${Math.floor(ban.user.createdTimestamp / 1000)}:F>\n\n**Ban Reason**\n${ban.reason || 'No reason provided'}\n\n**Banned At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(ban.user.displayAvatarURL({ dynamic: true, size: 256 }))
                                .setDescription(`Avatar of banned user ${ban.user.tag}`)
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
