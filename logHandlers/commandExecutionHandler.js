const CommandLogsConfig = require('../models/commandLogs/commandlogs'); // Adjust path as needed
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

module.exports = async function commandExecutionHandler(client) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        const user = interaction.user || {};
        const guild = interaction.guild || {};
        const channel = interaction.channel || {};

    
        if (!guild.id) return;

        try {
            const config = await CommandLogsConfig.findOne({ guildId: guild.id });
            if (!config?.enabled || !config?.channelId) return;

            const logChannel = client.channels.cache.get(config.channelId);
            if (!logChannel) return;

        
            let fullCommandName = `/${commandName}`;
            try {
                const subcommand = interaction.options.getSubcommand();
                if (subcommand) {
                    fullCommandName += ` ${subcommand}`;
                }
            } catch (error) {
              
            }

      
            const options = interaction.options.data || [];
            const optionsText = options.length > 0 
                ? options.map(opt => {
                
                    if (opt.type === 1) return null; 
                    return `**${opt.name}:** ${opt.value || opt.user?.tag || opt.channel?.name || opt.role?.name || 'N/A'}`;
                }).filter(Boolean).join('\n')
                : 'No options provided';

            const logContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📜 Command Executed\n## Slash Command Activity\n\n> User interaction detected\n> Application command processed`)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**User**\n${user.tag || 'Unknown User'}\n\n**User ID**\n\`${user.id || 'Unknown'}\`\n\n**Command**\n\`${fullCommandName}\`\n\n**Channel**\n${channel.id ? `<#${channel.id}>` : 'Unknown Channel'}\n\n**Server**\n${guild.name || 'Unknown Server'}\n\n**Executed At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(user.displayAvatarURL?.({ dynamic: true, size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png')
                                .setDescription(`Avatar of ${user.tag || 'Unknown User'}`)
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚙️ **Command Details**\n\n**Full Command**\n\`${fullCommandName}\`\n\n**Command Options**\n${optionsText}\n\n**Interaction Type**\nSlash Command\n\n**Response Status**\n${interaction.replied ? 'Responded' : interaction.deferred ? 'Deferred' : 'Pending'}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Command Logs • <t:${Math.floor(Date.now() / 1000)}:R>*`)
                );

            await logChannel.send({
                components: [logContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('❌ Error sending command log:', error);
        }
    });
};
