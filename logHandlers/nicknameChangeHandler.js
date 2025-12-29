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

module.exports = async function nicknameChangeHandler(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const guildId = newMember.guild.id;

        // Fetch config
        const config = await LogConfig.findOne({ guildId, eventType: 'nicknameChange' });
        if (!config || !config.channelId) return;

        const logChannel = newMember.guild.channels.cache.get(config.channelId);

        if (logChannel && oldMember.nickname !== newMember.nickname) {
            const logContainer = new ContainerBuilder()
                .setAccentColor(0x00FFFF)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📝 Nickname Changed\n## Member Display Name Updated\n\n> Profile customization event\n> Display name modification detected`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**User**\n${newMember.user.tag}\n\n**User ID**\n\`${newMember.id}\`\n\n**Previous Nickname**\n${oldMember.nickname || '*No nickname set*'}\n\n**New Nickname**\n${newMember.nickname || '*Nickname cleared*'}\n\n**Current Display Name**\n${newMember.displayName}\n\n**Changed At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(logHandlersIcons.nickIcon)
                                .setDescription(`Nickname change notification`)
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
