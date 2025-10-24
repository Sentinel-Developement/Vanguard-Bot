/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Embed = require('../../models/embed/embed');
const EmbedSchedule = require('../../models/embed/schedule');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Advanced embed creation and management system.')
        
      
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create and save a new embed with all properties.')
                .addStringOption(option => option.setName('name').setDescription('Unique embed name').setRequired(true))
                .addStringOption(option => option.setName('title').setDescription('Embed title (max 256 chars)').setRequired(false))
                .addStringOption(option => option.setName('description').setDescription('Embed description (max 4096 chars)').setRequired(false))
                .addStringOption(option => option.setName('color').setDescription('Hex color (e.g., #ff5733)').setRequired(false))
                .addStringOption(option => option.setName('url').setDescription('Embed URL').setRequired(false))
                .addStringOption(option => option.setName('author').setDescription('Author JSON: {"name":"Name","url":"URL","iconURL":"Icon"}').setRequired(false))
                .addStringOption(option => option.setName('footer').setDescription('Footer JSON: {"text":"Text","iconURL":"Icon"}').setRequired(false))
                .addStringOption(option => option.setName('thumbnail').setDescription('Thumbnail image URL').setRequired(false))
                .addStringOption(option => option.setName('image').setDescription('Main image URL').setRequired(false))
                .addStringOption(option => option.setName('fields').setDescription('Fields JSON: [{"name":"Name","value":"Value","inline":true}] (max 25)').setRequired(false))
                .addBooleanOption(option => option.setName('timestamp').setDescription('Add current timestamp').setRequired(false))
                .addStringOption(option => option.setName('category').setDescription('Embed category').setRequired(false)
                    .addChoices(
                        { name: 'Announcements', value: 'announcements' },
                        { name: 'Events', value: 'events' },
                        { name: 'Information', value: 'information' },
                        { name: 'Rules', value: 'rules' },
                        { name: 'Welcome', value: 'welcome' },
                        { name: 'General', value: 'general' }
                    ))
                .addBooleanOption(option => option.setName('public').setDescription('Make embed public for all server members').setRequired(false)))

       
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit specific embed properties.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID to edit')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option => option.setName('title').setDescription('New title (max 256 chars)').setRequired(false))
                .addStringOption(option => option.setName('description').setDescription('New description (max 4096 chars)').setRequired(false))
                .addStringOption(option => option.setName('color').setDescription('New hex color').setRequired(false))
                .addStringOption(option => option.setName('url').setDescription('New embed URL').setRequired(false))
                .addStringOption(option => option.setName('author').setDescription('Author JSON: {"name":"Name","url":"URL","iconURL":"Icon"}').setRequired(false))
                .addStringOption(option => option.setName('footer').setDescription('Footer JSON: {"text":"Text","iconURL":"Icon"}').setRequired(false))
                .addStringOption(option => option.setName('thumbnail').setDescription('New thumbnail URL').setRequired(false))
                .addStringOption(option => option.setName('image').setDescription('New image URL').setRequired(false))
                .addStringOption(option => option.setName('fields').setDescription('Fields JSON: [{"name":"Name","value":"Value","inline":true}]').setRequired(false))
                .addBooleanOption(option => option.setName('timestamp').setDescription('Add/remove timestamp').setRequired(false)))

     
        .addSubcommand(subcommand =>
            subcommand
                .setName('addfield')
                .setDescription('Add a field to an embed.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option => option.setName('name').setDescription('Field name (max 256 chars)').setRequired(true))
                .addStringOption(option => option.setName('value').setDescription('Field value (max 1024 chars)').setRequired(true))
                .addBooleanOption(option => option.setName('inline').setDescription('Display field inline').setRequired(false)))

      
        .addSubcommand(subcommand =>
            subcommand
                .setName('removefield')
                .setDescription('Remove a field from an embed.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addIntegerOption(option => option.setName('index').setDescription('Field index (1-based)').setRequired(true).setMinValue(1).setMaxValue(25)))

     
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear specific embed properties.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option => option.setName('property').setDescription('Property to clear').setRequired(true)
                    .addChoices(
                        { name: 'Title', value: 'title' },
                        { name: 'Description', value: 'description' },
                        { name: 'URL', value: 'url' },
                        { name: 'Author', value: 'author' },
                        { name: 'Footer', value: 'footer' },
                        { name: 'Thumbnail', value: 'thumbnail' },
                        { name: 'Image', value: 'image' },
                        { name: 'All Fields', value: 'fields' },
                        { name: 'Timestamp', value: 'timestamp' }
                    )))


        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View saved embeds.')
                .addStringOption(option =>
                    option.setName('embed_id')
                        .setDescription('Specific embed ID to view')
                        .setRequired(false)
                        .setAutocomplete(true))
                .addStringOption(option => option.setName('category').setDescription('Filter by category').setRequired(false)
                    .addChoices(
                        { name: 'Announcements', value: 'announcements' },
                        { name: 'Events', value: 'events' },
                        { name: 'Information', value: 'information' },
                        { name: 'Rules', value: 'rules' },
                        { name: 'Welcome', value: 'welcome' },
                        { name: 'General', value: 'general' }
                    )))


        .addSubcommand(subcommand =>
            subcommand
                .setName('clone')
                .setDescription('Clone an existing embed.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID to clone')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addStringOption(option => option.setName('new_name').setDescription('Name for the cloned embed').setRequired(true)))

   
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a saved embed.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID to delete')
                        .setRequired(true)
                        .setAutocomplete(true)))

   
        .addSubcommand(subcommand =>
            subcommand
                .setName('send')
                .setDescription('Send an embed to a channel.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID to send')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel to send to').setRequired(true))
                .addRoleOption(option => option.setName('mention_role').setDescription('Role to mention').setRequired(false))
                .addStringOption(option => option.setName('message').setDescription('Additional message content').setRequired(false))
                .addIntegerOption(option => option.setName('delay').setDescription('Delay in seconds').setRequired(false)
                    .setMinValue(0).setMaxValue(3600)))


        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Schedule recurring embed announcements.')
                .addStringOption(option => 
                    option.setName('embed_id')
                        .setDescription('Embed ID to schedule')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel to send to').setRequired(true))
                .addStringOption(option => option.setName('frequency').setDescription('Schedule frequency').setRequired(true)
                    .addChoices(
                        { name: 'Every Hour', value: 'hourly' },
                        { name: 'Daily', value: 'daily' },
                        { name: 'Weekly - Monday', value: 'weekly_monday' },
                        { name: 'Weekly - Tuesday', value: 'weekly_tuesday' },
                        { name: 'Weekly - Wednesday', value: 'weekly_wednesday' },
                        { name: 'Weekly - Thursday', value: 'weekly_thursday' },
                        { name: 'Weekly - Friday', value: 'weekly_friday' },
                        { name: 'Weekly - Saturday', value: 'weekly_saturday' },
                        { name: 'Weekly - Sunday', value: 'weekly_sunday' },
                        { name: 'Monthly', value: 'monthly' }
                    ))
                .addStringOption(option => option.setName('time').setDescription('Time to send (HH:MM format)').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Schedule name').setRequired(false))
                .addRoleOption(option => option.setName('mention_role').setDescription('Role to mention').setRequired(false))
                .addStringOption(option => option.setName('message').setDescription('Additional message content').setRequired(false))
                .addIntegerOption(option => option.setName('max_runs').setDescription('Maximum number of runs (optional)').setRequired(false)))

   
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedules')
                .setDescription('Manage scheduled embeds.')
                .addStringOption(option => option.setName('action').setDescription('Action to perform').setRequired(true)
                    .addChoices(
                        { name: 'List All', value: 'list' },
                        { name: 'View Details', value: 'view' },
                        { name: 'Toggle Status', value: 'toggle' },
                        { name: 'Delete', value: 'delete' }
                    ))
                .addStringOption(option => 
                    option.setName('schedule_id')
                        .setDescription('Schedule ID (required for view/toggle/delete)')
                        .setRequired(false)
                        .setAutocomplete(true)))


        .addSubcommand(subcommand =>
            subcommand
                .setName('builder')
                .setDescription('Interactive embed builder with live preview.')
                .addStringOption(option => option.setName('name').setDescription('Embed name').setRequired(true))),

    async autocomplete(interaction) {
        if (!await checkPermissions(interaction)) return;
        
        const focusedOption = interaction.options.getFocused(true);
        let choices = [];

        if (focusedOption.name === 'embed_id') {
            const embeds = await Embed.find({ 
                guildId: interaction.guild.id 
            }, { 
                embedId: 1, 
                name: 1, 
                category: 1 
            }).limit(25);
            
            choices = embeds.map(embed => ({ 
                name: `${embed.name} (${embed.embedId}) - ${embed.category}`, 
                value: embed.embedId 
            }));
        } 
        else if (focusedOption.name === 'schedule_id') {
            const schedules = await EmbedSchedule.find({ 
                guildId: interaction.guild.id 
            }, { 
                scheduleId: 1, 
                name: 1, 
                isActive: 1 
            }).limit(25);
            
            choices = schedules.map(schedule => ({ 
                name: `${schedule.name} (${schedule.scheduleId}) - ${schedule.isActive ? 'Active' : 'Inactive'}`, 
                value: schedule.scheduleId 
            }));
        }

        const filtered = choices.filter(choice => 
            choice.name.toLowerCase().includes(focusedOption.value.toLowerCase())
        );

        await interaction.respond(filtered.slice(0, 25));
    },

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ 
                content: '🚫 You need the "Manage Messages" permission to use this command.',
                ephemeral: true 
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create':
                    await this.handleCreate(interaction);
                    break;
                case 'edit':
                    await this.handleEdit(interaction);
                    break;
                case 'addfield':
                    await this.handleAddField(interaction);
                    break;
                case 'removefield':
                    await this.handleRemoveField(interaction);
                    break;
                case 'clear':
                    await this.handleClear(interaction);
                    break;
                case 'view':
                    await this.handleView(interaction);
                    break;
                case 'clone':
                    await this.handleClone(interaction);
                    break;
                case 'delete':
                    await this.handleDelete(interaction);
                    break;
                case 'send':
                    await this.handleSend(interaction);
                    break;
                case 'schedule':
                    await this.handleSchedule(interaction, client);
                    break;
                case 'schedules':
                    await this.handleSchedules(interaction, client);
                    break;
                case 'builder':
                    await this.handleBuilder(interaction);
                    break;
                default:
                    await interaction.reply({ 
                        content: '❌ Unknown subcommand.',
                        ephemeral: true 
                    });
            }
        } catch (error) {
            console.error(`Error executing embed ${subcommand}:`, error);
            
            const errorReply = {
                content: `❌ An error occurred while executing the ${subcommand} command. Please try again.`,
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorReply);
            } else {
                await interaction.reply(errorReply);
            }
        }
    },


    async handleCreate(interaction) {
        const name = interaction.options.getString('name');
        const guildId = interaction.guild.id;

    
        const existingEmbed = await Embed.findOne({ name: name.toLowerCase(), guildId });
        if (existingEmbed) {
            return interaction.reply({
                content: `❌ An embed with the name **${name}** already exists. (ID: ${existingEmbed.embedId})`,
                ephemeral: true
            });
        }

  
        let embedId;
        do {
            embedId = Embed.generateEmbedId();
        } while (await Embed.findOne({ embedId }));

     
        const author = this.parseJSON(interaction.options.getString('author'));
        const footer = this.parseJSON(interaction.options.getString('footer'));
        const fields = this.parseJSON(interaction.options.getString('fields'));

     
        if (fields && (!Array.isArray(fields) || fields.length > 25)) {
            return interaction.reply({
                content: '❌ Fields must be an array with maximum 25 elements.',
                ephemeral: true
            });
        }

   
        if (fields) {
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                if (!field.name || !field.value) {
                    return interaction.reply({
                        content: `❌ Field ${i + 1} is missing required "name" or "value" property.`,
                        ephemeral: true
                    });
                }
                if (field.name.length > 256) {
                    return interaction.reply({
                        content: `❌ Field ${i + 1} name exceeds 256 characters.`,
                        ephemeral: true
                    });
                }
                if (field.value.length > 1024) {
                    return interaction.reply({
                        content: `❌ Field ${i + 1} value exceeds 1024 characters.`,
                        ephemeral: true
                    });
                }
            }
        }

 
        const embedData = {
            embedId,
            name: name.toLowerCase(),
            guildId,
            title: interaction.options.getString('title'),
            description: interaction.options.getString('description'),
            color: interaction.options.getString('color') || '#3498db',
            url: interaction.options.getString('url'),
            thumbnail: interaction.options.getString('thumbnail'),
            image: interaction.options.getString('image'),
            timestamp: interaction.options.getBoolean('timestamp') || false,
            category: interaction.options.getString('category') || 'general',
            isPublic: interaction.options.getBoolean('public') || false,
            createdBy: interaction.user.id,
            author,
            footer,
            fields: fields || []
        };

      
        if (!embedData.title && !embedData.description && (!embedData.fields || embedData.fields.length === 0)) {
            return interaction.reply({
                content: '❌ Please provide at least a title, description, or fields for your embed.',
                ephemeral: true
            });
        }


        if (embedData.title && embedData.title.length > 256) {
            return interaction.reply({
                content: '❌ Title exceeds 256 characters.',
                ephemeral: true
            });
        }

        if (embedData.description && embedData.description.length > 4096) {
            return interaction.reply({
                content: '❌ Description exceeds 4096 characters.',
                ephemeral: true
            });
        }

        try {
            const embed = new Embed(embedData);
            await embed.save();

            const previewEmbed = this.buildEmbedFromData(embed);
            
            const infoEmbed = new EmbedBuilder()
                .setTitle('✅ Embed Created Successfully!')
                .setDescription(`Your embed **${name}** has been created with all specified properties.`)
                .addFields(
                    { name: 'Embed ID', value: `\`${embedId}\``, inline: true },
                    { name: 'Category', value: embedData.category, inline: true },
                    { name: 'Fields Count', value: `${embedData.fields.length}/25`, inline: true },
                    { name: 'Properties Set', value: this.getSetProperties(embedData), inline: false }
                )
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({
                content: `**Preview of your new embed:**`,
                embeds: [previewEmbed, infoEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error creating embed:', error);
            
            if (error.name === 'ValidationError') {
                const errorMessages = Object.values(error.errors).map(err => err.message);
                return interaction.reply({
                    content: `❌ Validation Error:\n${errorMessages.join('\n')}`,
                    ephemeral: true
                });
            }
            
            return interaction.reply({
                content: '❌ Failed to create embed. Please check your input and try again.',
                ephemeral: true
            });
        }
    },

    async handleEdit(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

  
        if (embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only edit embeds you created, unless you have Administrator permission.',
                ephemeral: true
            });
        }

        const updates = {};
        let hasUpdates = false;

 
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color');
        const url = interaction.options.getString('url');
        const thumbnail = interaction.options.getString('thumbnail');
        const image = interaction.options.getString('image');
        const timestamp = interaction.options.getBoolean('timestamp');
        const authorJSON = interaction.options.getString('author');
        const footerJSON = interaction.options.getString('footer');
        const fieldsJSON = interaction.options.getString('fields');

  
        if (title !== null) {
            if (title.length > 256) {
                return interaction.reply({
                    content: '❌ Title exceeds 256 characters.',
                    ephemeral: true
                });
            }
            updates.title = title;
            hasUpdates = true;
        }

        if (description !== null) {
            if (description.length > 4096) {
                return interaction.reply({
                    content: '❌ Description exceeds 4096 characters.',
                    ephemeral: true
                });
            }
            updates.description = description;
            hasUpdates = true;
        }

        if (color !== null) {
            updates.color = color;
            hasUpdates = true;
        }

        if (url !== null) {
            updates.url = url;
            hasUpdates = true;
        }

        if (thumbnail !== null) {
            updates.thumbnail = thumbnail;
            hasUpdates = true;
        }

        if (image !== null) {
            updates.image = image;
            hasUpdates = true;
        }

        if (timestamp !== null) {
            updates.timestamp = timestamp;
            hasUpdates = true;
        }

   
        if (authorJSON !== null) {
            const author = this.parseJSON(authorJSON);
            if (author === null && authorJSON.trim() !== '') {
                return interaction.reply({
                    content: '❌ Invalid author JSON format. Expected: {"name":"Name","url":"URL","iconURL":"Icon"}',
                    ephemeral: true
                });
            }
            updates.author = author;
            hasUpdates = true;
        }

        if (footerJSON !== null) {
            const footer = this.parseJSON(footerJSON);
            if (footer === null && footerJSON.trim() !== '') {
                return interaction.reply({
                    content: '❌ Invalid footer JSON format. Expected: {"text":"Text","iconURL":"Icon"}',
                    ephemeral: true
                });
            }
            updates.footer = footer;
            hasUpdates = true;
        }

        if (fieldsJSON !== null) {
            const fields = this.parseJSON(fieldsJSON);
            if (fields === null && fieldsJSON.trim() !== '') {
                return interaction.reply({
                    content: '❌ Invalid fields JSON format. Expected: [{"name":"Name","value":"Value","inline":true}]',
                    ephemeral: true
                });
            }
            
            if (fields && (!Array.isArray(fields) || fields.length > 25)) {
                return interaction.reply({
                    content: '❌ Fields must be an array with maximum 25 elements.',
                    ephemeral: true
                });
            }

            
            if (fields) {
                for (let i = 0; i < fields.length; i++) {
                    const field = fields[i];
                    if (!field.name || !field.value) {
                        return interaction.reply({
                            content: `❌ Field ${i + 1} is missing required "name" or "value" property.`,
                            ephemeral: true
                        });
                    }
                }
            }

            updates.fields = fields || [];
            hasUpdates = true;
        }

        if (!hasUpdates) {
            return interaction.reply({
                content: '❌ Please specify at least one property to update.',
                ephemeral: true
            });
        }

        try {
            updates.updatedBy = interaction.user.id;
            updates.updatedAt = new Date();

            await Embed.updateOne({ embedId }, updates);
            
            const updatedEmbed = await Embed.findOne({ embedId });
            const previewEmbed = this.buildEmbedFromData(updatedEmbed);
            
            const changesEmbed = new EmbedBuilder()
                .setTitle('✅ Embed Updated Successfully!')
                .setDescription(`Embed **${embed.name}** (${embedId}) has been updated.`)
                .addFields({
                    name: 'Updated Properties',
                    value: Object.keys(updates).filter(key => key !== 'updatedBy' && key !== 'updatedAt').join(', ') || 'None',
                    inline: false
                })
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({
                content: `**Updated embed preview:**`,
                embeds: [previewEmbed, changesEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error updating embed:', error);
            return interaction.reply({
                content: '❌ Failed to update embed. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleAddField(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const name = interaction.options.getString('name');
        const value = interaction.options.getString('value');
        const inline = interaction.options.getBoolean('inline') || false;

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

        if (embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only edit embeds you created.',
                ephemeral: true
            });
        }

        if (embed.fields.length >= 25) {
            return interaction.reply({
                content: '❌ Embed already has the maximum of 25 fields.',
                ephemeral: true
            });
        }

        if (name.length > 256) {
            return interaction.reply({
                content: '❌ Field name exceeds 256 characters.',
                ephemeral: true
            });
        }

        if (value.length > 1024) {
            return interaction.reply({
                content: '❌ Field value exceeds 1024 characters.',
                ephemeral: true
            });
        }

        try {
            embed.fields.push({ name, value, inline });
            embed.updatedBy = interaction.user.id;
            embed.updatedAt = new Date();
            await embed.save();

            const previewEmbed = this.buildEmbedFromData(embed);
            
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Field Added Successfully!')
                .setDescription(`Field added to embed **${embed.name}** (${embedId})`)
                .addFields(
                    { name: 'Field Name', value: name, inline: true },
                    { name: 'Field Value', value: value.length > 100 ? value.substring(0, 100) + '...' : value, inline: true },
                    { name: 'Inline', value: inline.toString(), inline: true },
                    { name: 'Total Fields', value: `${embed.fields.length}/25`, inline: true }
                )
                .setColor('#00ff00');

            await interaction.reply({
                content: `**Updated embed with new field:**`,
                embeds: [previewEmbed, successEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error adding field:', error);
            return interaction.reply({
                content: '❌ Failed to add field. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleRemoveField(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const index = interaction.options.getInteger('index') - 1; 

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

        if (embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only edit embeds you created.',
                ephemeral: true
            });
        }

        if (embed.fields.length === 0) {
            return interaction.reply({
                content: '❌ This embed has no fields to remove.',
                ephemeral: true
            });
        }

        if (index < 0 || index >= embed.fields.length) {
            return interaction.reply({
                content: `❌ Field index must be between 1 and ${embed.fields.length}.`,
                ephemeral: true
            });
        }

        try {
            const removedField = embed.fields[index];
            embed.fields.splice(index, 1);
            embed.updatedBy = interaction.user.id;
            embed.updatedAt = new Date();
            await embed.save();

            const previewEmbed = this.buildEmbedFromData(embed);
            
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Field Removed Successfully!')
                .setDescription(`Field removed from embed **${embed.name}** (${embedId})`)
                .addFields(
                    { name: 'Removed Field Name', value: removedField.name, inline: true },
                    { name: 'Total Fields', value: `${embed.fields.length}/25`, inline: true }
                )
                .setColor('#ff6b6b');

            await interaction.reply({
                content: `**Updated embed after field removal:**`,
                embeds: [previewEmbed, successEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error removing field:', error);
            return interaction.reply({
                content: '❌ Failed to remove field. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleClear(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const property = interaction.options.getString('property');

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

        if (embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only edit embeds you created.',
                ephemeral: true
            });
        }

        const updates = {
            updatedBy: interaction.user.id,
            updatedAt: new Date()
        };

        switch (property) {
            case 'title':
                updates.title = undefined;
                break;
            case 'description':
                updates.description = undefined;
                break;
            case 'url':
                updates.url = undefined;
                break;
            case 'author':
                updates.author = undefined;
                break;
            case 'footer':
                updates.footer = undefined;
                break;
            case 'thumbnail':
                updates.thumbnail = undefined;
                break;
            case 'image':
                updates.image = undefined;
                break;
            case 'fields':
                updates.fields = [];
                break;
            case 'timestamp':
                updates.timestamp = false;
                break;
            default:
                return interaction.reply({
                    content: '❌ Invalid property specified.',
                    ephemeral: true
                });
        }

        try {
            await Embed.updateOne({ embedId }, { $unset: updates });
            if (property === 'fields' || property === 'timestamp') {
                await Embed.updateOne({ embedId }, updates);
            }

            const updatedEmbed = await Embed.findOne({ embedId });
            const previewEmbed = this.buildEmbedFromData(updatedEmbed);
            
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Property Cleared Successfully!')
                .setDescription(`${property.charAt(0).toUpperCase() + property.slice(1)} cleared from embed **${embed.name}** (${embedId})`)
                .setColor('#ff9800');

            await interaction.reply({
                content: `**Updated embed after clearing ${property}:**`,
                embeds: [previewEmbed, successEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error clearing property:', error);
            return interaction.reply({
                content: '❌ Failed to clear property. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleView(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const category = interaction.options.getString('category');

        if (embedId) {
           
            const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });
            
            if (!embed) {
                return interaction.reply({
                    content: `❌ Embed with ID **${embedId}** not found.`,
                    ephemeral: true
                });
            }

            const previewEmbed = this.buildEmbedFromData(embed);
            const detailsEmbed = new EmbedBuilder()
                .setTitle('📋 Embed Details')
                .setDescription(`Information for embed **${embed.name}**`)
                .addFields(
                    { name: 'ID', value: `\`${embed.embedId}\``, inline: true },
                    { name: 'Category', value: embed.category, inline: true },
                    { name: 'Type', value: embed.type, inline: true },
                    { name: 'Created By', value: `<@${embed.createdBy}>`, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(embed.createdAt.getTime() / 1000)}:R>`, inline: true },
                    { name: 'Usage Count', value: embed.usageCount.toString(), inline: true },
                    { name: 'Properties Set', value: this.getSetProperties(embed), inline: false },
                    { name: 'Fields', value: `${embed.fields.length}/25`, inline: true },
                    { name: 'Public', value: embed.isPublic ? 'Yes' : 'No', inline: true },
                    { name: 'Last Used', value: embed.lastUsed ? `<t:${Math.floor(embed.lastUsed.getTime() / 1000)}:R>` : 'Never', inline: true }
                )
                .setColor('#3498db')
                .setTimestamp();

            return interaction.reply({
                content: `**Embed Preview:**`,
                embeds: [previewEmbed, detailsEmbed],
                ephemeral: true
            });

        } else {
       
            const filter = { guildId: interaction.guild.id };
            if (category) {
                filter.category = category;
            }

            const embeds = await Embed.find(filter)
                .sort({ updatedAt: -1 })
                .limit(10)
                .select('embedId name category type usageCount createdBy createdAt isPublic');

            if (embeds.length === 0) {
                return interaction.reply({
                    content: category ? 
                        `❌ No embeds found in the **${category}** category.` : 
                        '❌ No embeds found in this server.',
                    ephemeral: true
                });
            }

            const listEmbed = new EmbedBuilder()
                .setTitle(`📋 Server Embeds ${category ? `(${category.charAt(0).toUpperCase() + category.slice(1)})` : ''}`)
                .setDescription(`Showing ${embeds.length} most recent embeds`)
                .setColor('#3498db')
                .setTimestamp();

            embeds.forEach((embed, index) => {
                listEmbed.addFields({
                    name: `${index + 1}. ${embed.name}`,
                    value: `**ID:** \`${embed.embedId}\`\n**Category:** ${embed.category}\n**Type:** ${embed.type}\n**Usage:** ${embed.usageCount}\n**Public:** ${embed.isPublic ? 'Yes' : 'No'}`,
                    inline: true
                });
            });

            return interaction.reply({
                embeds: [listEmbed],
                ephemeral: true
            });
        }
    },

    async handleClone(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const newName = interaction.options.getString('new_name').toLowerCase();

        const originalEmbed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!originalEmbed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

     
        const existingEmbed = await Embed.findOne({ name: newName, guildId: interaction.guild.id });
        if (existingEmbed) {
            return interaction.reply({
                content: `❌ An embed with the name **${newName}** already exists.`,
                ephemeral: true
            });
        }

   
        let newEmbedId;
        do {
            newEmbedId = Embed.generateEmbedId();
        } while (await Embed.findOne({ embedId: newEmbedId }));

        try {
            const clonedEmbedData = {
                ...originalEmbed.toObject(),
                _id: undefined,
                embedId: newEmbedId,
                name: newName,
                createdBy: interaction.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: undefined,
                usageCount: 0,
                lastUsed: undefined
            };

            const clonedEmbed = new Embed(clonedEmbedData);
            await clonedEmbed.save();

            const previewEmbed = this.buildEmbedFromData(clonedEmbed);
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Embed Cloned Successfully!')
                .setDescription(`Embed **${originalEmbed.name}** has been cloned as **${newName}**`)
                .addFields(
                    { name: 'Original ID', value: `\`${embedId}\``, inline: true },
                    { name: 'New ID', value: `\`${newEmbedId}\``, inline: true },
                    { name: 'Properties Copied', value: this.getSetProperties(clonedEmbed), inline: false }
                )
                .setColor('#00ff00');

            await interaction.reply({
                content: `**Cloned embed preview:**`,
                embeds: [previewEmbed, successEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error cloning embed:', error);
            return interaction.reply({
                content: '❌ Failed to clone embed. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleDelete(interaction) {
        const embedId = interaction.options.getString('embed_id');

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

        if (embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only delete embeds you created, unless you have Administrator permission.',
                ephemeral: true
            });
        }

  
        const scheduleCount = await EmbedSchedule.countDocuments({ embedId, guildId: interaction.guild.id });

        const confirmEmbed = new EmbedBuilder()
            .setTitle('⚠️ Confirm Deletion')
            .setDescription(`Are you sure you want to delete embed **${embed.name}** (${embedId})?`)
            .addFields(
                { name: 'Usage Count', value: embed.usageCount.toString(), inline: true },
                { name: 'Active Schedules', value: scheduleCount.toString(), inline: true }
            )
            .setColor('#ff9800');

        if (scheduleCount > 0) {
            confirmEmbed.addFields({
                name: '⚠️ Warning',
                value: `This embed is used in ${scheduleCount} schedule(s). Deleting it will disable those schedules.`,
                inline: false
            });
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId(`delete_embed_${embedId}`)
            .setLabel('Delete Embed')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️');

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_delete')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        const response = await interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            ephemeral: true
        });

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: i => i.user.id === interaction.user.id,
                time: 30000
            });

            if (confirmation.customId === `delete_embed_${embedId}`) {
              
                await Embed.deleteOne({ embedId });
                
          
                if (scheduleCount > 0) {
                    await EmbedSchedule.updateMany(
                        { embedId, guildId: interaction.guild.id },
                        { isActive: false, lastError: 'Embed was deleted' }
                    );
                }

                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Embed Deleted')
                    .setDescription(`Embed **${embed.name}** (${embedId}) has been deleted.`)
                    .setColor('#ff6b6b');

                if (scheduleCount > 0) {
                    successEmbed.addFields({
                        name: 'Schedules Updated',
                        value: `${scheduleCount} related schedule(s) have been disabled.`,
                        inline: false
                    });
                }

                await confirmation.update({
                    embeds: [successEmbed],
                    components: []
                });

            } else {
                await confirmation.update({
                    content: '❌ Deletion cancelled.',
                    embeds: [],
                    components: []
                });
            }

        } catch (error) {
            await interaction.editReply({
                content: '❌ Confirmation timed out. Deletion cancelled.',
                embeds: [],
                components: []
            });
        }
    },

    async handleSend(interaction) {
        const embedId = interaction.options.getString('embed_id');
        const channel = interaction.options.getChannel('channel');
        const mentionRole = interaction.options.getRole('mention_role');
        const message = interaction.options.getString('message');
        const delay = interaction.options.getInteger('delay') || 0;

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

        if (!embed.isPublic && embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only send public embeds or embeds you created.',
                ephemeral: true
            });
        }

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({
                content: `❌ I don't have permission to send messages in ${channel}.`,
                ephemeral: true
            });
        }

        try {
            const discordEmbed = this.buildEmbedFromData(embed);
            
            let content = message || '';
            if (mentionRole) {
                content = `${mentionRole.toString()} ${content}`.trim();
            }

            const sendMessage = async () => {
                await channel.send({
                    content: content || undefined,
                    embeds: [discordEmbed]
                });

          
                await Embed.updateOne(
                    { embedId },
                    {
                        $inc: { usageCount: 1 },
                        $set: { lastUsed: new Date() }
                    }
                );
            };

            if (delay > 0) {
                await interaction.reply({
                    content: `✅ Embed **${embed.name}** will be sent to ${channel} in ${delay} seconds.`,
                    ephemeral: true
                });

                setTimeout(sendMessage, delay * 1000);
            } else {
                await sendMessage();
                await interaction.reply({
                    content: `✅ Embed **${embed.name}** has been sent to ${channel}.`,
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Error sending embed:', error);
            return interaction.reply({
                content: '❌ Failed to send embed. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleSchedule(interaction, client) {
        const embedId = interaction.options.getString('embed_id');
        const channel = interaction.options.getChannel('channel');
        const frequency = interaction.options.getString('frequency');
        const time = interaction.options.getString('time');
        const scheduleName = interaction.options.getString('name');
        const mentionRole = interaction.options.getRole('mention_role');
        const message = interaction.options.getString('message');
        const maxRuns = interaction.options.getInteger('max_runs');

      
        if (!/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(time)) {
            return interaction.reply({
                content: '❌ Invalid time format. Please use HH:MM (24-hour format).',
                ephemeral: true
            });
        }

        const embed = await Embed.findOne({ embedId, guildId: interaction.guild.id });

        if (!embed) {
            return interaction.reply({
                content: `❌ Embed with ID **${embedId}** not found.`,
                ephemeral: true
            });
        }

        if (!embed.isPublic && embed.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You can only schedule public embeds or embeds you created.',
                ephemeral: true
            });
        }

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({
                content: `❌ I don't have permission to send messages in ${channel}.`,
                ephemeral: true
            });
        }

       
        let scheduleId;
        do {
            scheduleId = EmbedSchedule.generateScheduleId();
        } while (await EmbedSchedule.findOne({ scheduleId }));

        try {
            const scheduleData = {
                scheduleId,
                name: scheduleName || `${embed.name}_schedule`,
                guildId: interaction.guild.id,
                embedId,
                channelId: channel.id,
                frequency,
                time,
                mentionRoleId: mentionRole?.id,
                messageContent: message,
                maxRuns,
                createdBy: interaction.user.id
            };

            const schedule = new EmbedSchedule(scheduleData);
            await schedule.save();

           
            if (client.embedScheduler) {
                const result = await client.embedScheduler.addSchedule(scheduleData);
                if (!result.success) {
                    await EmbedSchedule.deleteOne({ scheduleId });
                    return interaction.reply({
                        content: `❌ Failed to create schedule: ${result.error}`,
                        ephemeral: true
                    });
                }
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Embed Scheduled Successfully!')
                .setDescription(`Embed **${embed.name}** has been scheduled for recurring announcements.`)
                .addFields(
                    { name: 'Schedule ID', value: `\`${scheduleId}\``, inline: true },
                    { name: 'Channel', value: channel.toString(), inline: true },
                    { name: 'Frequency', value: frequency.replace('_', ' '), inline: true },
                    { name: 'Time', value: time, inline: true },
                    { name: 'Max Runs', value: maxRuns ? maxRuns.toString() : 'Unlimited', inline: true },
                    { name: 'Mention Role', value: mentionRole ? mentionRole.toString() : 'None', inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error creating schedule:', error);
            return interaction.reply({
                content: '❌ Failed to create schedule. Please try again.',
                ephemeral: true
            });
        }
    },

    async handleSchedules(interaction, client) {
        const action = interaction.options.getString('action');
        const scheduleId = interaction.options.getString('schedule_id');

        if (action === 'list') {
            const schedules = await EmbedSchedule.find({ guildId: interaction.guild.id })
                .populate('embedId', 'name')
                .sort({ createdAt: -1 })
                .limit(10);

            if (schedules.length === 0) {
                return interaction.reply({
                    content: '❌ No scheduled embeds found in this server.',
                    ephemeral: true
                });
            }

            const listEmbed = new EmbedBuilder()
                .setTitle('📅 Scheduled Embeds')
                .setDescription(`Showing ${schedules.length} most recent schedules`)
                .setColor('#3498db')
                .setTimestamp();

            schedules.forEach((schedule, index) => {
                const embedName = schedule.embedId?.name || 'Unknown';
                const status = schedule.isActive ? '✅ Active' : '❌ Inactive';
                const nextRun = schedule.nextRun ? `<t:${Math.floor(schedule.nextRun.getTime() / 1000)}:R>` : 'Not scheduled';
                
                listEmbed.addFields({
                    name: `${index + 1}. ${schedule.name}`,
                    value: `**ID:** \`${schedule.scheduleId}\`\n**Embed:** ${embedName}\n**Status:** ${status}\n**Frequency:** ${schedule.frequency}\n**Next Run:** ${nextRun}`,
                    inline: true
                });
            });

            return interaction.reply({
                embeds: [listEmbed],
                ephemeral: true
            });

        } else {
            if (!scheduleId) {
                return interaction.reply({
                    content: '❌ Please provide a schedule ID for this action.',
                    ephemeral: true
                });
            }

            const schedule = await EmbedSchedule.findOne({ 
                scheduleId, 
                guildId: interaction.guild.id 
            });

            if (!schedule) {
                return interaction.reply({
                    content: `❌ Schedule with ID **${scheduleId}** not found.`,
                    ephemeral: true
                });
            }

            if (schedule.createdBy !== interaction.user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: '❌ You can only manage schedules you created.',
                    ephemeral: true
                });
            }

            switch (action) {
                case 'view':
                    const embed = await Embed.findOne({ embedId: schedule.embedId });
                    const channel = interaction.guild.channels.cache.get(schedule.channelId);
                    const role = schedule.mentionRoleId ? interaction.guild.roles.cache.get(schedule.mentionRoleId) : null;

                    const detailsEmbed = new EmbedBuilder()
                        .setTitle('📋 Schedule Details')
                        .setDescription(`Information for schedule **${schedule.name}**`)
                        .addFields(
                            { name: 'ID', value: `\`${schedule.scheduleId}\``, inline: true },
                            { name: 'Embed', value: embed?.name || 'Unknown', inline: true },
                            { name: 'Status', value: schedule.isActive ? '✅ Active' : '❌ Inactive', inline: true },
                            { name: 'Channel', value: channel?.toString() || 'Unknown', inline: true },
                            { name: 'Frequency', value: schedule.frequency.replace('_', ' '), inline: true },
                            { name: 'Time', value: schedule.time, inline: true },
                            { name: 'Mention Role', value: role?.toString() || 'None', inline: true },
                            { name: 'Run Count', value: schedule.runCount.toString(), inline: true },
                            { name: 'Max Runs', value: schedule.maxRuns?.toString() || 'Unlimited', inline: true },
                            { name: 'Created', value: `<t:${Math.floor(schedule.createdAt.getTime() / 1000)}:R>`, inline: true },
                            { name: 'Last Run', value: schedule.lastRun ? `<t:${Math.floor(schedule.lastRun.getTime() / 1000)}:R>` : 'Never', inline: true },
                            { name: 'Next Run', value: schedule.nextRun ? `<t:${Math.floor(schedule.nextRun.getTime() / 1000)}:R>` : 'Not scheduled', inline: true }
                        )
                        .setColor('#3498db');

                    if (schedule.lastError) {
                        detailsEmbed.addFields({
                            name: 'Last Error',
                            value: schedule.lastError,
                            inline: false
                        });
                    }

                    return interaction.reply({
                        embeds: [detailsEmbed],
                        ephemeral: true
                    });

                case 'toggle':
                    try {
                        const newStatus = !schedule.isActive;
                        await EmbedSchedule.updateOne(
                            { scheduleId },
                            { isActive: newStatus }
                        );

                        if (client.embedScheduler) {
                            if (newStatus) {
                                await client.embedScheduler.addSchedule(schedule);
                            } else {
                                client.embedScheduler.removeJob(scheduleId);
                            }
                        }

                        const statusEmbed = new EmbedBuilder()
                            .setTitle(`✅ Schedule ${newStatus ? 'Enabled' : 'Disabled'}`)
                            .setDescription(`Schedule **${schedule.name}** (${scheduleId}) is now ${newStatus ? 'active' : 'inactive'}.`)
                            .setColor(newStatus ? '#00ff00' : '#ff9800');

                        return interaction.reply({
                            embeds: [statusEmbed],
                            ephemeral: true
                        });

                    } catch (error) {
                        console.error('Error toggling schedule:', error);
                        return interaction.reply({
                            content: '❌ Failed to toggle schedule status.',
                            ephemeral: true
                        });
                    }

                case 'delete':
                    try {
                        await EmbedSchedule.deleteOne({ scheduleId });
                        
                        if (client.embedScheduler) {
                            client.embedScheduler.removeJob(scheduleId);
                        }

                        const deleteEmbed = new EmbedBuilder()
                            .setTitle('✅ Schedule Deleted')
                            .setDescription(`Schedule **${schedule.name}** (${scheduleId}) has been deleted.`)
                            .setColor('#ff6b6b');

                        return interaction.reply({
                            embeds: [deleteEmbed],
                            ephemeral: true
                        });

                    } catch (error) {
                        console.error('Error deleting schedule:', error);
                        return interaction.reply({
                            content: '❌ Failed to delete schedule.',
                            ephemeral: true
                        });
                    }

                default:
                    return interaction.reply({
                        content: '❌ Invalid action specified.',
                        ephemeral: true
                    });
            }
        }
    },

    async handleBuilder(interaction) {
        const name = interaction.options.getString('name');


        const existingEmbed = await Embed.findOne({ 
            name: name.toLowerCase(), 
            guildId: interaction.guild.id 
        });

        if (existingEmbed) {
            return interaction.reply({
                content: `❌ An embed with the name **${name}** already exists. Use \`/embed edit\` to modify it.`,
                ephemeral: true
            });
        }


        let embedId;
        do {
            embedId = Embed.generateEmbedId();
        } while (await Embed.findOne({ embedId }));

        const embedData = {
            embedId,
            name: name.toLowerCase(),
            guildId: interaction.guild.id,
            title: `New Embed: ${name}`,
            description: 'Use the buttons below to customize this embed.',
            color: '#3498db',
            category: 'general',
            type: 'normal',
            createdBy: interaction.user.id,
            fields: []
        };

        try {
            const embed = new Embed(embedData);
            await embed.save();

            const previewEmbed = this.buildEmbedFromData(embed);
            
    
            const builderEmbed = new EmbedBuilder()
                .setTitle('🛠️ Interactive Embed Builder')
                .setDescription(`Building embed: **${name}** (${embedId})\n\nUse the buttons below to customize your embed. The preview will update in real-time.`)
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
                    .setLabel('Manage Fields')
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

            await interaction.reply({
                content: '**Live Preview:**',
                embeds: [previewEmbed, builderEmbed],
                components: [row1, row2],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error starting builder:', error);
            return interaction.reply({
                content: '❌ Failed to start embed builder. Please try again.',
                ephemeral: true
            });
        }
    },


    parseJSON(jsonString) {
        if (!jsonString || jsonString.trim() === '') return null;
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return null;
        }
    },

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
    },

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
};

/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/