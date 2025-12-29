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

module.exports = async function voiceJoinHandler(client) {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (!newState.channel || oldState.channelId === newState.channelId) return;

        const config = await LogConfig.findOne({ guildId: newState.guild.id, eventType: 'voiceJoin' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const logContainer = new ContainerBuilder()
                .setAccentColor(0x00FFFF)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎤 Voice Channel Joined\n## User Connected to Voice\n\n> Voice activity detected\n> User entered voice communication`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**User**\n${newState.member.user.tag}\n\n**User ID**\n\`${newState.member.id}\`\n\n**Channel**\n${newState.channel.name}\n\n**Channel ID**\n\`${newState.channel.id}\`\n\n**Channel Category**\n${newState.channel.parent ? newState.channel.parent.name : 'No Category'}\n\n**Joined At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(logHandlersIcons.joinIcon)
                                .setDescription(`Voice channel join notification`)
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
