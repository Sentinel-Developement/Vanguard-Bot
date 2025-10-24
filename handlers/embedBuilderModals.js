const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Embed = require('../models/embed/embed');

class EmbedBuilderModalHandler {
    constructor(client) {
        this.client = client;
        this.activeBuilders = new Map(); // Store active builder sessions
        this.init();
    }

    init() {
        //console.log('🛠️ Embed Builder Modal Handler loaded!');
        
        // Handle button interactions
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;
            
            if (interaction.customId.startsWith('builder_')) {
                await this.handleBuilderButton(interaction);
            }
        });

        // Handle modal submissions
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isModalSubmit()) return;
            
            if (interaction.customId.startsWith('modal_')) {
                await this.handleModalSubmit(interaction);
            }
        });

        // Handle select menu interactions
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;
            
            if (interaction.customId.startsWith('select_')) {
                await this.handleSelectMenu(interaction);
            }
        });
    }

    async handleBuilderButton(interaction) {
        const [action, property, embedId] = interaction.customId.split('_');
        
        if (!embedId) return;

        try {
            const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });
            if (!embed) {
                return interaction.reply({
                    content: '❌ Embed not found.',
                    ephemeral: true
                });
            }

            // Check permissions
            if (embed.createdBy !== interaction.user.id) {
                return interaction.reply({
                    content: '❌ You can only edit embeds you created.',
                    ephemeral: true
                });
            }

            switch (property) {
                case 'title':
                    await this.showTitleModal(interaction, embed);
                    break;
                case 'description':
                    await this.showDescriptionModal(interaction, embed);
                    break;
                case 'color':
                    await this.showColorModal(interaction, embed);
                    break;
                case 'author':
                    await this.showAuthorModal(interaction, embed);
                    break;
                case 'footer':
                    await this.showFooterModal(interaction, embed);
                    break;
                case 'fields':
                    await this.showFieldsMenu(interaction, embed);
                    break;
                case 'images':
                    await this.showImagesModal(interaction, embed);
                    break;
                case 'advanced':
                    await this.showAdvancedModal(interaction, embed);
                    break;
                case 'save':
                    await this.saveEmbed(interaction, embed);
                    break;
                case 'cancel':
                    await this.cancelBuilder(interaction, embed);
                    break;
                case 'addfield':
                    await this.showAddFieldModal(interaction, embed);
                    break;
                case 'editfield':
                    await this.showEditFieldModal(interaction, embed);
                    break;
                case 'removefield':
                    await this.showRemoveFieldMenu(interaction, embed);
                    break;
                default:
                    await interaction.reply({
                        content: '❌ Unknown builder action.',
                        ephemeral: true
                    });
            }
        } catch (error) {
            console.error('Error handling builder button:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                ephemeral: true
            });
        }
    }

    async showTitleModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_title_${embed.embedId}`)
            .setTitle('Edit Embed Title');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('Embed Title (max 256 characters)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.title || '')
            .setMaxLength(256)
            .setRequired(false);

        const urlInput = new TextInputBuilder()
            .setCustomId('url')
            .setLabel('Title URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.url || '')
            .setRequired(false)
            .setPlaceholder('https://example.com');

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(urlInput)
        );

        await interaction.showModal(modal);
    }

    async showDescriptionModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_description_${embed.embedId}`)
            .setTitle('Edit Embed Description');

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Embed Description (max 4096 characters)')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(embed.description || '')
            .setMaxLength(4000)
            .setRequired(false)
            .setPlaceholder('Enter your embed description here...');

        modal.addComponents(
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    }

    async showColorModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_color_${embed.embedId}`)
            .setTitle('Edit Embed Color');

        const colorInput = new TextInputBuilder()
            .setCustomId('color')
            .setLabel('Hex Color (e.g., #FF5733)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.color || '#3498db')
            .setMaxLength(7)
            .setRequired(true)
            .setPlaceholder('#3498db');

        const timestampInput = new TextInputBuilder()
            .setCustomId('timestamp')
            .setLabel('Add Timestamp? (yes/no)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.timestamp ? 'yes' : 'no')
            .setMaxLength(3)
            .setRequired(false)
            .setPlaceholder('yes or no');

        modal.addComponents(
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(timestampInput)
        );

        await interaction.showModal(modal);
    }

    async showAuthorModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_author_${embed.embedId}`)
            .setTitle('Edit Embed Author');

        const authorNameInput = new TextInputBuilder()
            .setCustomId('author_name')
            .setLabel('Author Name (max 256 characters)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.author?.name || '')
            .setMaxLength(256)
            .setRequired(false)
            .setPlaceholder('Author name');

        const authorUrlInput = new TextInputBuilder()
            .setCustomId('author_url')
            .setLabel('Author URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.author?.url || '')
            .setRequired(false)
            .setPlaceholder('https://example.com');

        const authorIconInput = new TextInputBuilder()
            .setCustomId('author_icon')
            .setLabel('Author Icon URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.author?.iconURL || '')
            .setRequired(false)
            .setPlaceholder('https://example.com/icon.png');

        modal.addComponents(
            new ActionRowBuilder().addComponents(authorNameInput),
            new ActionRowBuilder().addComponents(authorUrlInput),
            new ActionRowBuilder().addComponents(authorIconInput)
        );

        await interaction.showModal(modal);
    }

    async showFooterModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_footer_${embed.embedId}`)
            .setTitle('Edit Embed Footer');

        const footerTextInput = new TextInputBuilder()
            .setCustomId('footer_text')
            .setLabel('Footer Text (max 2048 characters)')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(embed.footer?.text || '')
            .setMaxLength(2048)
            .setRequired(false)
            .setPlaceholder('Footer text');

        const footerIconInput = new TextInputBuilder()
            .setCustomId('footer_icon')
            .setLabel('Footer Icon URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.footer?.iconURL || '')
            .setRequired(false)
            .setPlaceholder('https://example.com/icon.png');

        modal.addComponents(
            new ActionRowBuilder().addComponents(footerTextInput),
            new ActionRowBuilder().addComponents(footerIconInput)
        );

        await interaction.showModal(modal);
    }

    async showImagesModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_images_${embed.embedId}`)
            .setTitle('Edit Embed Images');

        const thumbnailInput = new TextInputBuilder()
            .setCustomId('thumbnail')
            .setLabel('Thumbnail Image URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.thumbnail || '')
            .setRequired(false)
            .setPlaceholder('https://example.com/thumbnail.png');

        const imageInput = new TextInputBuilder()
            .setCustomId('image')
            .setLabel('Main Image URL (optional)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.image || '')
            .setRequired(false)
            .setPlaceholder('https://example.com/image.png');

        modal.addComponents(
            new ActionRowBuilder().addComponents(thumbnailInput),
            new ActionRowBuilder().addComponents(imageInput)
        );

        await interaction.showModal(modal);
    }

    async showAdvancedModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_advanced_${embed.embedId}`)
            .setTitle('Advanced Embed Settings');

        const categoryInput = new TextInputBuilder()
            .setCustomId('category')
            .setLabel('Category')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.category || 'general')
            .setRequired(false)
            .setPlaceholder('announcements, events, information, etc.');

        const tagsInput = new TextInputBuilder()
            .setCustomId('tags')
            .setLabel('Tags (comma-separated)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.tags ? embed.tags.join(', ') : '')
            .setRequired(false)
            .setPlaceholder('tag1, tag2, tag3');

        const publicInput = new TextInputBuilder()
            .setCustomId('public')
            .setLabel('Make Public? (yes/no)')
            .setStyle(TextInputStyle.Short)
            .setValue(embed.isPublic ? 'yes' : 'no')
            .setMaxLength(3)
            .setRequired(false)
            .setPlaceholder('yes or no');

        modal.addComponents(
            new ActionRowBuilder().addComponents(categoryInput),
            new ActionRowBuilder().addComponents(tagsInput),
            new ActionRowBuilder().addComponents(publicInput)
        );

        await interaction.showModal(modal);
    }

    async showFieldsMenu(interaction, embed) {
        const fieldManagementEmbed = new EmbedBuilder()
            .setTitle('📋 Field Management')
            .setDescription(`Managing fields for embed **${embed.name}**\nCurrent fields: ${embed.fields.length}/25`)
            .setColor('#9b59b6');

        if (embed.fields.length > 0) {
            embed.fields.forEach((field, index) => {
                fieldManagementEmbed.addFields({
                    name: `Field ${index + 1}: ${field.name}`,
                    value: `${field.value.length > 50 ? field.value.substring(0, 50) + '...' : field.value}\n**Inline:** ${field.inline}`,
                    inline: true
                });
            });
        }

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`builder_addfield_${embed.embedId}`)
                .setLabel('Add Field')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕')
                .setDisabled(embed.fields.length >= 25)
        );

        const components = [row1];

        if (embed.fields.length > 0) {
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`builder_editfield_${embed.embedId}`)
                    .setLabel('Edit Field')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️'),
                new ButtonBuilder()
                    .setCustomId(`builder_removefield_${embed.embedId}`)
                    .setLabel('Remove Field')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('➖')
            );
            components.push(row2);
        }

        // Add back button
        const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`builder_back_${embed.embedId}`)
                .setLabel('Back to Builder')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );
        components.push(backRow);

        await interaction.update({
            embeds: [fieldManagementEmbed],
            components
        });
    }

    async showAddFieldModal(interaction, embed) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_addfield_${embed.embedId}`)
            .setTitle('Add New Field');

        const nameInput = new TextInputBuilder()
            .setCustomId('field_name')
            .setLabel('Field Name (max 256 characters)')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(256)
            .setRequired(true)
            .setPlaceholder('Field name');

        const valueInput = new TextInputBuilder()
            .setCustomId('field_value')
            .setLabel('Field Value (max 1024 characters)')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1024)
            .setRequired(true)
            .setPlaceholder('Field value');

        const inlineInput = new TextInputBuilder()
            .setCustomId('field_inline')
            .setLabel('Display Inline? (yes/no)')
            .setStyle(TextInputStyle.Short)
            .setValue('no')
            .setMaxLength(3)
            .setRequired(false)
            .setPlaceholder('yes or no');

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(valueInput),
            new ActionRowBuilder().addComponents(inlineInput)
        );

        await interaction.showModal(modal);
    }

    async showEditFieldModal(interaction, embed) {
        if (embed.fields.length === 0) {
            return interaction.reply({
                content: '❌ No fields to edit.',
                ephemeral: true
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_editfield_${embed.embedId}`)
            .setPlaceholder('Select a field to edit')
            .addOptions(
                embed.fields.map((field, index) => ({
                    label: `Field ${index + 1}: ${field.name}`,
                    description: field.value.length > 50 ? field.value.substring(0, 50) + '...' : field.value,
                    value: index.toString()
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.update({
            content: '**Select a field to edit:**',
            components: [row],
            embeds: []
        });
    }

    async showRemoveFieldMenu(interaction, embed) {
        if (embed.fields.length === 0) {
            return interaction.reply({
                content: '❌ No fields to remove.',
                ephemeral: true
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_removefield_${embed.embedId}`)
            .setPlaceholder('Select a field to remove')
            .addOptions(
                embed.fields.map((field, index) => ({
                    label: `Field ${index + 1}: ${field.name}`,
                    description: field.value.length > 50 ? field.value.substring(0, 50) + '...' : field.value,
                    value: index.toString()
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.update({
            content: '⚠️ **Select a field to remove:**',
            components: [row],
            embeds: []
        });
    }

    async handleModalSubmit(interaction) {
        const [action, property, embedId] = interaction.customId.split('_');
        
        if (!embedId) return;

        try {
            const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });
            if (!embed) {
                return interaction.reply({
                    content: '❌ Embed not found.',
                    ephemeral: true
                });
            }

            switch (property) {
                case 'title':
                    await this.handleTitleModal(interaction, embed);
                    break;
                case 'description':
                    await this.handleDescriptionModal(interaction, embed);
                    break;
                case 'color':
                    await this.handleColorModal(interaction, embed);
                    break;
                case 'author':
                    await this.handleAuthorModal(interaction, embed);
                    break;
                case 'footer':
                    await this.handleFooterModal(interaction, embed);
                    break;
                case 'images':
                    await this.handleImagesModal(interaction, embed);
                    break;
                case 'advanced':
                    await this.handleAdvancedModal(interaction, embed);
                    break;
                case 'addfield':
                    await this.handleAddFieldModal(interaction, embed);
                    break;
                case 'editfield':
                    await this.handleEditFieldModal(interaction, embed);
                    break;
                default:
                    await interaction.reply({
                        content: '❌ Unknown modal action.',
                        ephemeral: true
                    });
            }
        } catch (error) {
            console.error('Error handling modal submit:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                ephemeral: true
            });
        }
    }

    async handleTitleModal(interaction, embed) {
        const title = interaction.fields.getTextInputValue('title').trim();
        const url = interaction.fields.getTextInputValue('url').trim();

        const updates = {
            title: title || undefined,
            url: url || undefined,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Title and URL updated successfully!');
    }

    async handleDescriptionModal(interaction, embed) {
        const description = interaction.fields.getTextInputValue('description').trim();

        const updates = {
            description: description || undefined,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Description updated successfully!');
    }

    async handleColorModal(interaction, embed) {
        const color = interaction.fields.getTextInputValue('color').trim();
        const timestampInput = interaction.fields.getTextInputValue('timestamp').trim().toLowerCase();

        // Validate hex color
        if (!/^#([0-9A-F]{6})$/i.test(color)) {
            return interaction.reply({
                content: '❌ Invalid hex color format. Please use format like #FF5733',
                ephemeral: true
            });
        }

        const timestamp = timestampInput === 'yes' || timestampInput === 'true';

        const updates = {
            color,
            timestamp,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Color and timestamp updated successfully!');
    }

    async handleAuthorModal(interaction, embed) {
        const authorName = interaction.fields.getTextInputValue('author_name').trim();
        const authorUrl = interaction.fields.getTextInputValue('author_url').trim();
        const authorIcon = interaction.fields.getTextInputValue('author_icon').trim();

        let author = null;
        if (authorName) {
            author = {
                name: authorName,
                url: authorUrl || undefined,
                iconURL: authorIcon || undefined
            };
        }

        const updates = {
            author,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Author updated successfully!');
    }

    async handleFooterModal(interaction, embed) {
        const footerText = interaction.fields.getTextInputValue('footer_text').trim();
        const footerIcon = interaction.fields.getTextInputValue('footer_icon').trim();

        let footer = null;
        if (footerText) {
            footer = {
                text: footerText,
                iconURL: footerIcon || undefined
            };
        }

        const updates = {
            footer,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Footer updated successfully!');
    }

    async handleImagesModal(interaction, embed) {
        const thumbnail = interaction.fields.getTextInputValue('thumbnail').trim();
        const image = interaction.fields.getTextInputValue('image').trim();

        const updates = {
            thumbnail: thumbnail || undefined,
            image: image || undefined,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Images updated successfully!');
    }

    async handleAdvancedModal(interaction, embed) {
        const category = interaction.fields.getTextInputValue('category').trim();
        const tagsInput = interaction.fields.getTextInputValue('tags').trim();
        const publicInput = interaction.fields.getTextInputValue('public').trim().toLowerCase();

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
        const isPublic = publicInput === 'yes' || publicInput === 'true';

        const updates = {
            category: category || 'general',
            tags,
            isPublic,
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        await Embed.updateOne({ embedId: embed.embedId }, updates);
        await this.refreshBuilder(interaction, embed.embedId, '✅ Advanced settings updated successfully!');
    }

    async handleAddFieldModal(interaction, embed) {
        const fieldName = interaction.fields.getTextInputValue('field_name').trim();
        const fieldValue = interaction.fields.getTextInputValue('field_value').trim();
        const fieldInlineInput = interaction.fields.getTextInputValue('field_inline').trim().toLowerCase();

        const fieldInline = fieldInlineInput === 'yes' || fieldInlineInput === 'true';

        if (embed.fields.length >= 25) {
            return interaction.reply({
                content: '❌ Maximum of 25 fields allowed.',
                ephemeral: true
            });
        }

        embed.fields.push({
            name: fieldName,
            value: fieldValue,
            inline: fieldInline
        });

        embed.updatedBy = interaction.user.id;
        embed.updatedAt = new Date();
        await embed.save();

        await this.refreshBuilder(interaction, embed.embedId, `✅ Field "${fieldName}" added successfully!`);
    }

    async handleEditFieldModal(interaction, embed) {
        // This will be called after field selection from handleSelectMenu
        const fieldName = interaction.fields.getTextInputValue('field_name').trim();
        const fieldValue = interaction.fields.getTextInputValue('field_value').trim();
        const fieldInlineInput = interaction.fields.getTextInputValue('field_inline').trim().toLowerCase();
        const fieldIndex = parseInt(interaction.fields.getTextInputValue('field_index'));

        const fieldInline = fieldInlineInput === 'yes' || fieldInlineInput === 'true';

        if (fieldIndex >= 0 && fieldIndex < embed.fields.length) {
            embed.fields[fieldIndex] = {
                name: fieldName,
                value: fieldValue,
                inline: fieldInline
            };

            embed.updatedBy = interaction.user.id;
            embed.updatedAt = new Date();
            await embed.save();

            await this.refreshBuilder(interaction, embed.embedId, `✅ Field "${fieldName}" updated successfully!`);
        } else {
            await interaction.reply({
                content: '❌ Invalid field index.',
                ephemeral: true
            });
        }
    }

    async handleSelectMenu(interaction) {
        const [action, property, embedId] = interaction.customId.split('_');
        
        if (!embedId) return;

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });
        if (!embed) return;

        const fieldIndex = parseInt(interaction.values[0]);

        if (property === 'editfield') {
            const field = embed.fields[fieldIndex];
            
            const modal = new ModalBuilder()
                .setCustomId(`modal_editfield_${embed.embedId}`)
                .setTitle(`Edit Field ${fieldIndex + 1}`);

            const nameInput = new TextInputBuilder()
                .setCustomId('field_name')
                .setLabel('Field Name (max 256 characters)')
                .setStyle(TextInputStyle.Short)
                .setValue(field.name)
                .setMaxLength(256)
                .setRequired(true);

            const valueInput = new TextInputBuilder()
                .setCustomId('field_value')
                .setLabel('Field Value (max 1024 characters)')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(field.value)
                .setMaxLength(1024)
                .setRequired(true);

            const inlineInput = new TextInputBuilder()
                .setCustomId('field_inline')
                .setLabel('Display Inline? (yes/no)')
                .setStyle(TextInputStyle.Short)
                .setValue(field.inline ? 'yes' : 'no')
                .setMaxLength(3)
                .setRequired(false);

            const indexInput = new TextInputBuilder()
                .setCustomId('field_index')
                .setLabel('Field Index (DO NOT CHANGE)')
                .setStyle(TextInputStyle.Short)
                .setValue(fieldIndex.toString())
                .setMaxLength(2)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(valueInput),
                new ActionRowBuilder().addComponents(inlineInput),
                new ActionRowBuilder().addComponents(indexInput)
            );

            await interaction.showModal(modal);

        } else if (property === 'removefield') {
            embed.fields.splice(fieldIndex, 1);
            embed.updatedBy = interaction.user.id;
            embed.updatedAt = new Date();
            await embed.save();

            await this.refreshBuilder(interaction, embed.embedId, `✅ Field ${fieldIndex + 1} removed successfully!`);
        }
    }

    async refreshBuilder(interaction, embedId, message = '') {
        const embed = await Embed.findOne({ embedId });
        if (!embed) return;

        const previewEmbed = this.buildEmbedFromData(embed);
        
        const builderEmbed = new EmbedBuilder()
            .setTitle('🛠️ Interactive Embed Builder')
            .setDescription(`Building embed: **${embed.name}** (${embedId})\n\nUse the buttons below to customize your embed. The preview updates in real-time.${message ? `\n\n${message}` : ''}`)
            .addFields(
                { name: 'Current Properties', value: this.getSetProperties(embed), inline: false }
            )
            .setColor('#9b59b6')
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`builder_title_${embedId}`)
                .setLabel('Edit Title')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId(`builder_description_${embedId}`)
                .setLabel('Edit Description')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📄'),
            new ButtonBuilder()
                .setCustomId(`builder_color_${embedId}`)
                .setLabel('Change Color')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎨'),
            new ButtonBuilder()
                .setCustomId(`builder_author_${embedId}`)
                .setLabel('Set Author')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👤'),
            new ButtonBuilder()
                .setCustomId(`builder_footer_${embedId}`)
                .setLabel('Set Footer')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📌')
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`builder_fields_${embedId}`)
                .setLabel(`Manage Fields (${embed.fields.length}/25)`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId(`builder_images_${embedId}`)
                .setLabel('Set Images')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🖼️'),
            new ButtonBuilder()
                .setCustomId(`builder_advanced_${embedId}`)
                .setLabel('Advanced')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId(`builder_save_${embedId}`)
                .setLabel('Save & Finish')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId(`builder_cancel_${embedId}`)
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        const updateMethod = interaction.replied || interaction.deferred ? 'editReply' : 'update';
        
        await interaction[updateMethod]({
            content: '**Live Preview:**',
            embeds: [previewEmbed, builderEmbed],
            components: [row1, row2]
        });
    }

    async saveEmbed(interaction, embed) {
        // Validate embed has minimum content
        if (!embed.title && !embed.description && embed.fields.length === 0) {
            return interaction.reply({
                content: '❌ Embed must have at least a title, description, or fields.',
                ephemeral: true
            });
        }

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Embed Saved Successfully!')
            .setDescription(`Your embed **${embed.name}** has been saved and is ready to use.`)
            .addFields(
                { name: 'Embed ID', value: `\`${embed.embedId}\``, inline: true },
                { name: 'Properties Set', value: this.getSetProperties(embed), inline: false },
                { name: 'Next Steps', value: 'Use `/embed send` to send it or `/embed schedule` to schedule it!', inline: false }
            )
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.update({
            content: '🎉 **Embed creation complete!**',
            embeds: [this.buildEmbedFromData(embed), successEmbed],
            components: []
        });
    }

    async cancelBuilder(interaction, embed) {
        // Delete the embed if it was just created
        const timeDiff = new Date() - embed.createdAt;
        if (timeDiff < 300000) { // 5 minutes
            await Embed.deleteOne({ embedId: embed.embedId });
        }

        await interaction.update({
            content: '❌ Embed builder cancelled.',
            embeds: [],
            components: []
        });
    }

    getSetProperties(embed) {
        const properties = [];
        if (embed.title) properties.push('Title');
        if (embed.description) properties.push('Description');
        if (embed.url) properties.push('URL');
        if (embed.author?.name) properties.push('Author');
        if (embed.footer?.text) properties.push('Footer');
        if (embed.thumbnail) properties.push('Thumbnail');
        if (embed.image) properties.push('Image');
        if (embed.fields?.length > 0) properties.push(`Fields (${embed.fields.length})`);
        if (embed.timestamp) properties.push('Timestamp');
        if (embed.color !== '#3498db') properties.push('Color');
        
        return properties.length > 0 ? properties.join(', ') : 'None';
    }

    buildEmbedFromData(embedData) {
        const embed = new EmbedBuilder();
        
        if (embedData.title) embed.setTitle(embedData.title);
        if (embedData.description) embed.setDescription(embedData.description);
        if (embedData.url) embed.setURL(embedData.url);
        if (embedData.color) {
            try {
                embed.setColor(embedData.color.startsWith('#') ? 
                    parseInt(embedData.color.replace('#', ''), 16) : 
                    embedData.color);
            } catch (e) {
                embed.setColor(0x3498db);
            }
        }
        if (embedData.timestamp) embed.setTimestamp();
        
        if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
        if (embedData.image) embed.setImage(embedData.image);
        
        if (embedData.author?.name) {
            embed.setAuthor({
                name: embedData.author.name,
                iconURL: embedData.author.iconURL || null,
                url: embedData.author.url || null
            });
        }
        
        if (embedData.footer?.text) {
            embed.setFooter({
                text: embedData.footer.text,
                iconURL: embedData.footer.iconURL || null
            });
        }
        
        if (embedData.fields?.length) {
            embed.addFields(embedData.fields.map(f => ({
                name: f.name,
                value: f.value,
                inline: f.inline || false
            })));
        }
        
        return embed;
    }
}

module.exports = (client) => {
    return new EmbedBuilderModalHandler(client);
};
