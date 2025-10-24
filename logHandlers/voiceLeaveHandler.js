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

module.exports = async function voiceLeaveHandler(client) {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (!oldState.channel || oldState.channelId === newState.channelId) return;

        const config = await LogConfig.findOne({ guildId: oldState.guild.id, eventType: 'voiceLeave' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const logContainer = new ContainerBuilder()
                .setAccentColor(0xFF9900)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎤 Voice Channel Left\n## User Disconnected from Voice\n\n> Voice activity ended\n> User left voice communication`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**User**\n${oldState.member.user.tag}\n\n**User ID**\n\`${oldState.member.id}\`\n\n**Channel**\n${oldState.channel.name}\n\n**Channel ID**\n\`${oldState.channel.id}\`\n\n**Channel Category**\n${oldState.channel.parent ? oldState.channel.parent.name : 'No Category'}\n\n**Left At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(logHandlersIcons.leaveIcon)
                                .setDescription(`Voice channel leave notification`)
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
