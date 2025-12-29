const logHandlersIcons = require('../UI/icons/loghandlers');
const LogConfig = require('../models/serverLogs/LogConfig');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

module.exports = async function messageUpdateHandler(client) {
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (!oldMessage.guild || oldMessage.partial || newMessage.partial) return;

        // Ignore bot messages (including your own bot edits)
        if (oldMessage.author?.bot || newMessage.author?.bot) return;

        const config = await LogConfig.findOne({ guildId: oldMessage.guild.id, eventType: 'messageUpdate' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            
            const truncateContent = (content, maxLength = 800) => {
                if (!content) return '*No content*';
                return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
            };

            const logContainer = new ContainerBuilder()
                .setAccentColor(0xFFFF00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ✏️ Message Edited\n## Content Modification Detected\n\n> Message content updated\n> Edit event logged for moderation`)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Author**\n${oldMessage.author?.tag || 'Unknown User'}\n\n**Author ID**\n\`${oldMessage.author?.id || 'Unknown'}\`\n\n**Channel**\n<#${oldMessage.channel.id}>\n\n**Message ID**\n\`${oldMessage.id}\`\n\n**Message Link**\n[Jump to Message](https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id})\n\n**Edited At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📝 **Content Comparison**\n\n**Original Content**\n\`\`\`\n${truncateContent(oldMessage.content)}\n\`\`\`\n\n**Updated Content**\n\`\`\`\n${truncateContent(newMessage.content)}\n\`\`\`\n\n**Content Analysis**\nCharacter change: ${(newMessage.content?.length || 0) - (oldMessage.content?.length || 0)}`)
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
