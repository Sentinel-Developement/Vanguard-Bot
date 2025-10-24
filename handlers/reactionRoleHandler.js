// handlers/reactionRoleHandler.js
const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    StringSelectMenuBuilder, 
    EmbedBuilder, 
    ButtonStyle,
    PermissionFlagsBits,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
  } = require('discord.js');
  const ReactionRole = require('../models/reactionroles/schema');
  
  class ReactionRoleHandler {
    constructor(client) {
      this.client = client;
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      this.client.on('interactionCreate', this.handleInteraction.bind(this));
      this.client.on('messageDelete', this.handleMessageDelete.bind(this));
      this.client.on('channelDelete', this.handleChannelDelete.bind(this));
      this.client.on('guildDelete', this.handleGuildDelete.bind(this));
      this.client.on('roleDelete', this.handleRoleDelete.bind(this));
      this.client.once('ready', this.rebuildReactionRoles.bind(this));
    }
  
    async handleInteraction(interaction) {
      try {
        if (interaction.isButton()) {
          if (interaction.customId.startsWith('rr_role_')) {
            await this.handleRoleButton(interaction);
          } else if (interaction.customId.startsWith('rr_setup_')) {
            await this.handleSetupButtons(interaction);
          }
        } else if (interaction.isStringSelectMenu()) {
          if (interaction.customId.startsWith('rr_menu_')) {
            await this.handleRoleMenu(interaction);
          } else if (interaction.customId.startsWith('rr_select_')) {
            await this.handleSetupSelects(interaction);
          }
        } else if (interaction.isModalSubmit()) {
          await this.handleModalSubmit(interaction);
        }
      } catch (error) {
        console.error('Error handling reaction role interaction:', error);
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ An error occurred while processing your request.',
            flags: MessageFlags.Ephemeral
          }).catch(() => {});
        }
      }
    }
  
    async handleSetupButtons(interaction) {
      const [, , action, setupId] = interaction.customId.split('_');
      
      switch (action) {
        case 'title':
          await this.showTitleModal(interaction, setupId);
          break;
        case 'description':
          await this.showDescriptionModal(interaction, setupId);
          break;
        case 'type':
          await this.showTypeSelect(interaction, setupId);
          break;
        case 'addrole':
          await this.showAddRoleModal(interaction, setupId);
          break;
        case 'finish':
          await this.finishSetup(interaction, setupId);
          break;
        case 'cancel':
          await this.cancelSetup(interaction, setupId);
          break;
      }
    }
  
    async handleModalSubmit(interaction) {
      if (interaction.customId.startsWith('rr_modal_')) {
        const [, , type, setupId] = interaction.customId.split('_');
        
        switch (type) {
          case 'title':
            await this.handleTitleModal(interaction, setupId);
            break;
          case 'description':
            await this.handleDescriptionModal(interaction, setupId);
            break;
          case 'addrole':
            await this.handleAddRoleModal(interaction, setupId);
            break;
        }
      }
    }
  
    async showTitleModal(interaction, setupId) {
      const modal = new ModalBuilder()
        .setCustomId(`rr_modal_title_${setupId}`)
        .setTitle('Set Embed Title');
  
      const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Embed Title')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setRequired(true)
        .setPlaceholder('Choose your roles!')
        .setValue('Choose your roles!');
  
      const colorInput = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('Embed Color (Hex)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(7)
        .setRequired(false)
        .setPlaceholder('#6366f1')
        .setValue('#6366f1');
  
      modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(colorInput)
      );
  
      await interaction.showModal(modal);
    }
  
    async handleTitleModal(interaction, setupId) {
      const setup = await ReactionRole.findOne({ setupId });
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      const title = interaction.fields.getTextInputValue('title');
      const color = interaction.fields.getTextInputValue('color') || '#6366f1';
  
      setup.title = title;
      setup.color = color;
      await setup.save();
  
      await this.updateSetupMessage(setup);
      await interaction.reply({
        content: '✅ Title and color updated!',
        flags: MessageFlags.Ephemeral
      });
    }
  
    async showDescriptionModal(interaction, setupId) {
      const modal = new ModalBuilder()
        .setCustomId(`rr_modal_description_${setupId}`)
        .setTitle('Set Embed Description');
  
      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Embed Description')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(4000)
        .setRequired(true)
        .setPlaceholder('Select the roles you want by clicking the buttons below.')
        .setValue('Select the roles you want by clicking the buttons below.');
  
      modal.addComponents(
        new ActionRowBuilder().addComponents(descriptionInput)
      );
  
      await interaction.showModal(modal);
    }
  
    async handleDescriptionModal(interaction, setupId) {
      const setup = await ReactionRole.findOne({ setupId });
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      const description = interaction.fields.getTextInputValue('description');
      setup.description = description;
      await setup.save();
  
      await this.updateSetupMessage(setup);
      await interaction.reply({
        content: '✅ Description updated!',
        flags: MessageFlags.Ephemeral
      });
    }
  
    async showTypeSelect(interaction, setupId) {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`rr_select_type_${setupId}`)
        .setPlaceholder('Choose interaction type')
        .addOptions([
          {
            label: 'Buttons',
            value: 'buttons',
            description: 'Use buttons for role selection',
            emoji: '🔘'
          },
          {
            label: 'Dropdown Menu',
            value: 'menu',
            description: 'Use dropdown menu for role selection',
            emoji: '📋'
          }
        ]);
  
      const row = new ActionRowBuilder().addComponents(selectMenu);
  
      await interaction.reply({
        content: '**Select the interaction type:**',
        components: [row],
        flags: MessageFlags.Ephemeral
      });
    }
  
    async handleSetupSelects(interaction) {
      const [, , type, setupId] = interaction.customId.split('_');
      
      if (type === 'type') {
        const selectedType = interaction.values[0];
        const setup = await ReactionRole.findOne({ setupId });
        
        if (!setup) {
          return interaction.reply({
            content: '❌ Setup not found.',
            flags: MessageFlags.Ephemeral
          });
        }
  
        setup.type = selectedType;
        if (selectedType === 'menu') {
          setup.menuConfig = {
            placeholder: 'Select your roles...',
            minValues: 1,
            maxValues: 1
          };
        }
        await setup.save();
  
        await this.updateSetupMessage(setup);
        await interaction.reply({
          content: `✅ Type set to **${selectedType}**!`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  
    async showAddRoleModal(interaction, setupId) {
      const setup = await ReactionRole.findOne({ setupId });
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      if (setup.roles.length >= 5) {
        return interaction.reply({
          content: '❌ Maximum of 5 roles allowed per setup.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      const modal = new ModalBuilder()
        .setCustomId(`rr_modal_addrole_${setupId}`)
        .setTitle(`Add Role ${setup.roles.length + 1}/5`);
  
      const roleInput = new TextInputBuilder()
        .setCustomId('role')
        .setLabel('Role ID or @mention')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('123456789012345678 or @RoleName');
  
      const labelInput = new TextInputBuilder()
        .setCustomId('label')
        .setLabel('Button/Menu Label')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(80)
        .setRequired(true)
        .setPlaceholder('Member');
  
      const emojiInput = new TextInputBuilder()
        .setCustomId('emoji')
        .setLabel('Emoji (optional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('👤 or :custom_emoji: or 123456789');
  
      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description (for menus)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setRequired(false)
        .setPlaceholder('Get the Member role');
  
      const styleInput = new TextInputBuilder()
        .setCustomId('style')
        .setLabel('Button Style (Primary/Secondary/etc.)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Secondary')
        .setValue('Secondary');
  
      modal.addComponents(
        new ActionRowBuilder().addComponents(roleInput),
        new ActionRowBuilder().addComponents(labelInput),
        new ActionRowBuilder().addComponents(emojiInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(styleInput)
      );
  
      await interaction.showModal(modal);
    }
  
    async handleAddRoleModal(interaction, setupId) {
      const setup = await ReactionRole.findOne({ setupId });
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      const roleInput = interaction.fields.getTextInputValue('role');
      const label = interaction.fields.getTextInputValue('label');
      const description = interaction.fields.getTextInputValue('description') || null;
      const emojiInput = interaction.fields.getTextInputValue('emoji') || null;
      const style = interaction.fields.getTextInputValue('style') || 'Secondary';
  
      // Parse role ID
      let roleId = roleInput.replace(/[<@&>]/g, '');
      const role = interaction.guild.roles.cache.get(roleId);
  
      if (!role) {
        return interaction.reply({
          content: '❌ Role not found. Please provide a valid role ID or mention.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      // Check if role already exists
      if (setup.roles.some(r => r.roleId === role.id)) {
        return interaction.reply({
          content: '❌ This role is already in the setup.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      // Parse emoji
      let emoji = null;
      if (emojiInput) {
        const customEmojiMatch = emojiInput.match(/<(?:a)?:([a-zA-Z0-9_]+):(\d+)>/);
        if (customEmojiMatch) {
          emoji = {
            name: customEmojiMatch[1],
            id: customEmojiMatch[2],
            animated: emojiInput.startsWith('<a:'),
            unicode: false
          };
        } else if (emojiInput.match(/^\d+$/)) {
          const guildEmoji = interaction.guild.emojis.cache.get(emojiInput);
          if (guildEmoji) {
            emoji = {
              name: guildEmoji.name,
              id: guildEmoji.id,
              animated: guildEmoji.animated,
              unicode: false
            };
          }
        } else {
          emoji = {
            name: emojiInput,
            unicode: true
          };
        }
      }
  
      // Validate style
      const validStyles = ['Primary', 'Secondary', 'Success', 'Danger'];
      const finalStyle = validStyles.includes(style) ? style : 'Secondary';
  
      // Add role to setup
      setup.roles.push({
        roleId: role.id,
        roleName: role.name,
        label,
        description,
        emoji,
        style: finalStyle
      });
  
      setup.updatedBy = interaction.user.id;
      await setup.save();
  
      await this.updateSetupMessage(setup);
      await interaction.reply({
        content: `✅ Added role **${role.name}** to the setup! (${setup.roles.length}/5)`,
        flags: MessageFlags.Ephemeral
      });
    }
  
    async updateSetupMessage(setup) {
      const channel = this.client.channels.cache.get(setup.channelId);
      if (!channel) return;
      
      const message = await channel.messages.fetch(setup.messageId).catch(() => null);
      if (!message) return;
  
      const embed = new EmbedBuilder()
        .setTitle(setup.title || 'Reaction Role Setup')
        .setDescription(setup.description || 'Setup in progress...')
        .setColor(setup.color || '#6366f1')
        .setFooter({
          text: `Setup ID: ${setup.setupId} • ${setup.roles.length}/5 roles • Type: ${setup.type || 'Not set'}`,
          iconURL: message.guild.iconURL()
        })
        .setTimestamp();
  
      if (setup.roles.length > 0) {
        const rolesText = setup.roles.map((role, index) => {
          const emojiText = role.emoji 
            ? (role.emoji.unicode ? role.emoji.name : `<:${role.emoji.name}:${role.emoji.id}>`)
            : '•';
          return `${emojiText} **${role.label}** - <@&${role.roleId}>`;
        }).join('\n');
        
        embed.addFields({
          name: 'Configured Roles',
          value: rolesText
        });
      }
  
      // Create setup management buttons
      const setupButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`rr_setup_title_${setup.setupId}`)
            .setLabel('Title & Color')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝'),
          new ButtonBuilder()
            .setCustomId(`rr_setup_description_${setup.setupId}`)
            .setLabel('Description')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📄'),
          new ButtonBuilder()
            .setCustomId(`rr_setup_type_${setup.setupId}`)
            .setLabel('Type')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚙️'),
          new ButtonBuilder()
            .setCustomId(`rr_setup_addrole_${setup.setupId}`)
            .setLabel('Add Role')
            .setStyle(ButtonStyle.Success)
            .setEmoji('➕')
            .setDisabled(setup.roles.length >= 5)
        );
  
      const actionButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`rr_setup_finish_${setup.setupId}`)
            .setLabel('Finish Setup')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
            .setDisabled(!setup.title || !setup.description || !setup.type || setup.roles.length === 0),
          new ButtonBuilder()
            .setCustomId(`rr_setup_cancel_${setup.setupId}`)
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
        );
  
      await message.edit({
        embeds: [embed],
        components: [setupButtons, actionButtons]
      });
    }
  
    async finishSetup(interaction, setupId) {
      const setup = await ReactionRole.findOne({ setupId });
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      if (!setup.title || !setup.description || !setup.type || setup.roles.length === 0) {
        return interaction.reply({
          content: '❌ Please complete all setup steps before finishing.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      // Build final components
      const components = this.buildFinalComponents(setup);
      
      // Create final embed
      const embed = new EmbedBuilder()
        .setTitle(setup.title)
        .setDescription(setup.description)
        .setColor(setup.color)
        .setFooter({
          text: `React with the ${setup.type} below to get your roles!`,
          iconURL: interaction.guild.iconURL()
        })
        .setTimestamp();
  
      // Update the message
      const channel = interaction.guild.channels.cache.get(setup.channelId);
      const message = await channel.messages.fetch(setup.messageId);
      
      await message.edit({
        embeds: [embed],
        components
      });
  
      await interaction.reply({
        content: `✅ Reaction role setup completed! The message now has working ${setup.type}.`,
        flags: MessageFlags.Ephemeral
      });
    }
  
    async cancelSetup(interaction, setupId) {
      await ReactionRole.deleteOne({ setupId });
      await interaction.message.delete().catch(() => {});
      
      await interaction.reply({
        content: '✅ Setup cancelled and message deleted.',
        flags: MessageFlags.Ephemeral
      });
    }
  
    buildFinalComponents(setup) {
      if (setup.type === 'buttons') {
        const rows = [];
        let currentRow = new ActionRowBuilder();
        let buttonsInRow = 0;
  
        for (const roleConfig of setup.roles) {
          if (buttonsInRow >= 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
            buttonsInRow = 0;
          }
  
          const button = new ButtonBuilder()
            .setCustomId(`rr_role_${roleConfig.roleId}`)
            .setLabel(roleConfig.label)
            .setStyle(ButtonStyle[roleConfig.style] || ButtonStyle.Secondary);
  
          if (roleConfig.emoji) {
            if (roleConfig.emoji.unicode) {
              button.setEmoji(roleConfig.emoji.name);
            } else {
              button.setEmoji(roleConfig.emoji.id);
            }
          }
  
          currentRow.addComponents(button);
          buttonsInRow++;
        }
  
        if (buttonsInRow > 0) {
          rows.push(currentRow);
        }
  
        return rows;
      } else {
        const options = setup.roles.map(roleConfig => {
          const option = {
            label: roleConfig.label,
            value: roleConfig.roleId,
            description: roleConfig.description || `Toggle the ${roleConfig.roleName} role`
          };
  
          if (roleConfig.emoji) {
            if (roleConfig.emoji.unicode) {
              option.emoji = roleConfig.emoji.name;
            } else {
              option.emoji = {
                id: roleConfig.emoji.id,
                name: roleConfig.emoji.name
              };
            }
          }
  
          return option;
        });
  
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`rr_menu_${setup.setupId}`)
          .setPlaceholder(setup.menuConfig.placeholder || 'Select roles to toggle')
          .setMinValues(setup.menuConfig.minValues || 1)
          .setMaxValues(setup.menuConfig.maxValues || 1)
          .addOptions(options);
  
        return [new ActionRowBuilder().addComponents(selectMenu)];
      }
    }
  
    async handleRoleButton(interaction) {
      const roleId = interaction.customId.replace('rr_role_', '');
      const setup = await ReactionRole.findOne({ messageId: interaction.message.id });
      
      if (!setup) {
        return interaction.reply({
          content: '❌ This reaction role setup no longer exists.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      const roleConfig = setup.roles.find(r => r.roleId === roleId);
      if (!roleConfig) {
        return interaction.reply({
          content: '❌ This role is no longer available.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      await this.toggleRole(interaction, setup, roleConfig);
    }
  
    async handleRoleMenu(interaction) {
      const selectedRoleId = interaction.values[0];
      const setup = await ReactionRole.findOne({ messageId: interaction.message.id });
      
      if (!setup) {
        return interaction.reply({
          content: '❌ This reaction role setup no longer exists.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      const roleConfig = setup.roles.find(r => r.roleId === selectedRoleId);
      if (!roleConfig) {
        return interaction.reply({
          content: '❌ This role is no longer available.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      await this.toggleRole(interaction, setup, roleConfig);
    }
  
    async toggleRole(interaction, setup, roleConfig) {
      const { guild, member } = interaction;
      const role = guild.roles.cache.get(roleConfig.roleId);
  
      // Validation checks
      if (!role) {
        return interaction.reply({
          content: '❌ This role no longer exists.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({
          content: '❌ I don\'t have permission to manage roles.',
          flags: MessageFlags.Ephemeral
        });
      }
  
      if (role.position >= guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: `❌ I can't manage the role **${role.name}** because it's positioned higher than my highest role.`,
          flags: MessageFlags.Ephemeral
        });
      }
  
      // Handle role toggle
      const hasRole = member.roles.cache.has(role.id);
      
      try {
        if (hasRole) {
          await member.roles.remove(role);
          
          // Update stats
          await ReactionRole.updateOne(
            { _id: setup._id },
            { 
              $inc: { 
                'stats.totalInteractions': 1,
                'stats.rolesRemoved': 1
              }
            }
          );
  
          await interaction.reply({
            embeds: [this.createSuccessEmbed(`🗑️ Removed role **${role.name}**`, '#ef4444')],
            flags: MessageFlags.Ephemeral
          });
        } else {
          await member.roles.add(role);
          
          // Update stats
          await ReactionRole.updateOne(
            { _id: setup._id },
            { 
              $inc: { 
                'stats.totalInteractions': 1,
                'stats.rolesGiven': 1
              }
            }
          );
  
          await interaction.reply({
            embeds: [this.createSuccessEmbed(`✅ Added role **${role.name}**`, '#10b981')],
            flags: MessageFlags.Ephemeral
          });
        }
      } catch (error) {
        console.error('Error toggling role:', error);
        await interaction.reply({
          content: `❌ Failed to toggle role **${role.name}**. Please contact an administrator.`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  
    createSuccessEmbed(message, color) {
      return new EmbedBuilder()
        .setDescription(message)
        .setColor(color)
        .setTimestamp();
    }
  
    // Cleanup handlers
    async handleMessageDelete(message) {
      try {
        await ReactionRole.deleteMany({ messageId: message.id });
      } catch (error) {
        console.error('Error cleaning up deleted message:', error);
      }
    }
  
    async handleChannelDelete(channel) {
      try {
        await ReactionRole.deleteMany({ channelId: channel.id });
      } catch (error) {
        console.error('Error cleaning up deleted channel:', error);
      }
    }
  
    async handleGuildDelete(guild) {
      try {
        await ReactionRole.deleteMany({ guildId: guild.id });
      } catch (error) {
        console.error('Error cleaning up deleted guild:', error);
      }
    }
  
    async handleRoleDelete(role) {
      try {
        const setups = await ReactionRole.find({
          guildId: role.guild.id,
          'roles.roleId': role.id
        });
  
        for (const setup of setups) {
          setup.roles = setup.roles.filter(r => r.roleId !== role.id);
          
          if (setup.roles.length === 0) {
            const guild = this.client.guilds.cache.get(setup.guildId);
            const channel = guild?.channels.cache.get(setup.channelId);
            const message = await channel?.messages.fetch(setup.messageId).catch(() => null);
            
            if (message) {
              await message.delete().catch(() => {});
            }
            
            await ReactionRole.deleteOne({ _id: setup._id });
          } else {
            await setup.save();
            
            const guild = this.client.guilds.cache.get(setup.guildId);
            const channel = guild?.channels.cache.get(setup.channelId);
            const message = await channel?.messages.fetch(setup.messageId).catch(() => null);
            
            if (message) {
              const components = this.buildFinalComponents(setup);
              await message.edit({ components });
            }
          }
        }
      } catch (error) {
        console.error('Error handling deleted role:', error);
      }
    }
  
    async rebuildReactionRoles() {
      //console.log('🔄 Rebuilding reaction role components...');
      
      try {
        const setups = await ReactionRole.find({});
        
        for (const setup of setups) {
          try {
            const guild = this.client.guilds.cache.get(setup.guildId);
            if (!guild) {
              await ReactionRole.deleteOne({ _id: setup._id });
              continue;
            }
  
            const channel = guild.channels.cache.get(setup.channelId);
            if (!channel) {
              await ReactionRole.deleteOne({ _id: setup._id });
              continue;
            }
  
            const message = await channel.messages.fetch(setup.messageId).catch(() => null);
            if (!message) {
              await ReactionRole.deleteOne({ _id: setup._id });
              continue;
            }
  
            const components = this.buildFinalComponents(setup);
            await message.edit({ components });
            
          } catch (error) {
            console.error(`Error rebuilding setup ${setup.setupId}:`, error);
          }
        }
        
        //console.log('✅ Reaction role components rebuilt successfully');
      } catch (error) {
        console.error('Error rebuilding reaction roles:', error);
      }
    }
  }
  
  module.exports = ReactionRoleHandler;
  