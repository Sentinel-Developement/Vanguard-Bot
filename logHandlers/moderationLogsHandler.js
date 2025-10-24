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

module.exports = async function moderationLogsHandler(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const guildId = newMember.guild.id;

        // Fetch config
        const config = await LogConfig.findOne({ guildId, eventType: 'moderationLogs' });
        if (!config || !config.channelId) return;

        const logChannel = newMember.guild.channels.cache.get(config.channelId);

        // Check for timeout updates
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            const isTimedOut = newMember.communicationDisabledUntilTimestamp > Date.now();
            const wasTimedOut = oldMember.communicationDisabledUntilTimestamp > Date.now();
            
            let actionType = '';
            let actionColor = 0xFF9900;
            
            if (isTimedOut && !wasTimedOut) {
                actionType = 'Applied';
                actionColor = 0xFF0000;
            } else if (!isTimedOut && wasTimedOut) {
                actionType = 'Removed';
                actionColor = 0x00FF00;
            } else if (isTimedOut && wasTimedOut) {
                actionType = 'Modified';
                actionColor = 0xFF9900;
            }

            const logContainer = new ContainerBuilder()
                .setAccentColor(actionColor)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏳ Timeout ${actionType}\n## Member Communication Status Updated\n\n> Moderation action executed\n> User communication restrictions ${actionType.toLowerCase()}`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**User**\n${newMember.user.tag}\n\n**User ID**\n\`${newMember.id}\`\n\n**Action Type**\nTimeout ${actionType}\n\n**Previous Timeout**\n${oldMember.communicationDisabledUntil ? `<t:${Math.floor(oldMember.communicationDisabledUntilTimestamp / 1000)}:F>` : '*No timeout active*'}\n\n**Current Timeout**\n${newMember.communicationDisabledUntil ? `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>` : '*No timeout active*'}\n\n**Status**\n${isTimedOut ? '🔇 Communication restricted' : '🔊 Communication allowed'}\n\n**Updated At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(logHandlersIcons.modIcon)
                                .setDescription(`Moderation action notification`)
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
