const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const afkHandler = require('../events/afkHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const self = module.exports;
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;
    
        const { getAFK, removeAFK, setAFK } = afkHandler(interaction.client);
    
        try {
            if (interaction.isButton()) {
                const [action, type, targetUserId] = interaction.customId.split('_');
                if (action !== 'afk') return;
    
                switch (type) {
                    case 'remove':
                        await self.handleRemoveButton(interaction, targetUserId, { getAFK, removeAFK });
                        break;
                    case 'setup':
                        await self.handleSetupButton(interaction, targetUserId);
                        break;
                    case 'list':
                        await self.handleListNavigation(interaction, targetUserId);
                        break;
                }
            }
    
            if (interaction.isModalSubmit()) {
                const [action, type] = interaction.customId.split('_');
                if (action !== 'afk') return;
    
                switch (type) {
                    case 'autoresponse':
                        await self.handleAutoResponseModal(interaction, { getAFK });
                        break;
                }
            }
    
        } catch (error) {
            console.error('Error handling AFK interaction:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('An error occurred while processing your request.')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            }
        }
    },

    async handleRemoveButton(interaction, targetUserId, { getAFK, removeAFK }) {
        // Only the AFK user can remove their own status via button
        if (interaction.user.id !== targetUserId) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ You can only remove your own AFK status.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const afk = await getAFK(targetUserId, interaction.guild.id);
        if (!afk) {
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setDescription('❌ You are not currently AFK.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await removeAFK(targetUserId, interaction.guild.id);

        const totalTime = Date.now() - afk.setAt.getTime();
        const duration = this.formatDuration(totalTime);

        const embed = new EmbedBuilder()
            .setTitle('✅ AFK Status Removed')
            .setDescription('Your AFK status has been successfully removed.')
            .addFields([
                { name: 'Previous Reason', value: afk.reason, inline: false },
                { name: 'AFK Duration', value: duration, inline: true },
                { name: 'Mentions Received', value: afk.mentions.count.toString(), inline: true }
            ])
            .setColor(0x00ff7f)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async handleSetupButton(interaction, targetUserId) {

        if (!targetUserId || interaction.user.id !== targetUserId) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ You can only set up auto-response for your own AFK status.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        

        const modal = new ModalBuilder()
            .setCustomId(`afk_autoresponse_${targetUserId}`)
            .setTitle('Set AFK Auto-Response');

        const messageInput = new TextInputBuilder()
            .setCustomId('message')
            .setLabel('Auto-Response Message')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the message to send when you are mentioned...')
            .setMaxLength(500)
            .setRequired(false);

        const cooldownInput = new TextInputBuilder()
            .setCustomId('cooldown')
            .setLabel('Cooldown (minutes)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('5')
            .setValue('5')
            .setMaxLength(2)
            .setRequired(false);

        const firstRow = new ActionRowBuilder().addComponents(messageInput);
        const secondRow = new ActionRowBuilder().addComponents(cooldownInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    },

    async handleAutoResponseModal(interaction, { getAFK }) {
        const message = interaction.fields.getTextInputValue('message')?.trim();
        const cooldownStr = interaction.fields.getTextInputValue('cooldown')?.trim() || '5';
        const cooldownMinutes = parseInt(cooldownStr) || 5;

        if (cooldownMinutes < 1 || cooldownMinutes > 60) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('Invalid Cooldown')
                .setDescription('Cooldown must be between 1 and 60 minutes.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const afk = await getAFK(interaction.user.id, interaction.guild.id);
        if (!afk) {
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('Not AFK')
                .setDescription('You are not currently AFK.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!message) {
            // Disable auto-response
            afk.autoResponses.enabled = false;
            await afk.save();

            const embed = new EmbedBuilder()
                .setTitle('🤖 Auto-Response Disabled')
                .setDescription('Auto-response has been disabled for your AFK status.')
                .setColor(0xff6b6b)
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Enable/update auto-response
        afk.autoResponses.enabled = true;
        afk.autoResponses.message = message;
        afk.autoResponses.cooldown = cooldownMinutes * 60000;
        await afk.save();

        const embed = new EmbedBuilder()
            .setTitle('🤖 Auto-Response Set')
            .setDescription('Auto-response has been configured for your AFK status.')
            .addFields([
                { name: 'Message', value: message, inline: false },
                { name: 'Cooldown', value: `${cooldownMinutes} minute(s)`, inline: true }
            ])
            .setColor(0x4ecdc4)
            .setFooter({ text: 'This message will be sent automatically when you are mentioned' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async handleListNavigation(interaction, page) {
        const { getAllAFKs } = afkHandler(interaction.client);
        const { afks, pagination } = await getAllAFKs(interaction.guild.id, { page: parseInt(page), limit: 10 });

        if (!afks.length) {
            const embed = new EmbedBuilder()
                .setTitle('🌙 AFK Users')
                .setDescription('No users are currently AFK in this server.')
                .setColor(0x3498db)
                .setTimestamp();
            return interaction.update({ embeds: [embed], components: [] });
        }

        const embed = new EmbedBuilder()
            .setTitle('🌙 AFK Users')
            .setColor(0xffcc00)
            .setFooter({ 
                text: `Page ${pagination.current} of ${pagination.total} • ${afks.length} users shown`
            })
            .setTimestamp();

        let description = '';
        for (const afk of afks) {
            try {
                const user = await interaction.guild.members.fetch(afk.userId).catch(() => null);
                const userName = user ? user.displayName : `Unknown User (${afk.userId})`;
                const afkDuration = this.formatDuration(Date.now() - new Date(afk.setAt).getTime());
                
                description += `**${userName}**\n`;
                description += `└ *${afk.reason}*\n`;
                description += `└ AFK for ${afkDuration}`;
                
                if (afk.mentions.count > 0) {
                    description += ` • ${afk.mentions.count} mentions`;
                }
                
                if (afk.expiresAt) {
                    const expiresTimestamp = Math.floor(new Date(afk.expiresAt).getTime() / 1000);
                    description += ` • Until <t:${expiresTimestamp}:R>`;
                }
                
                description += '\n\n';
            } catch (error) {
                console.error('Error processing AFK user:', error);
            }
        }

        embed.setDescription(description.trim() || 'No AFK users found.');

        // Navigation buttons
        const components = [];
        if (pagination.total > 1) {
            const row = new ActionRowBuilder();
            
            if (pagination.hasPrev) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`afk_list_${parseInt(page) - 1}`)
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⬅️')
                );
            }
            
            if (pagination.hasNext) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`afk_list_${parseInt(page) + 1}`)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('➡️')
                );
            }
            
            if (row.components.length > 0) {
                components.push(row);
            }
        }

        await interaction.update({ embeds: [embed], components });
    },

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }
};