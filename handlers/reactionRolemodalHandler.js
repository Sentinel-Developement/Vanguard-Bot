// handlers/modalHandler.js
const { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require('discord.js');
  const ReactionRole = require('../models/reactionroles/schema');
  
  class ModalHandler {
    constructor(client) {
      this.client = client;
      this.setupListeners();
    }
  
    setupListeners() {
      this.client.on('interactionCreate', async (interaction) => {
        if (interaction.isModalSubmit()) {
          await this.handleModalSubmit(interaction);
        } else if (interaction.isButton()) {
          await this.handleButtonInteraction(interaction);
        }
      });
    }
  
    async handleModalSubmit(interaction) {
      try {
        if (interaction.customId.startsWith('rr_add_role_modal_')) {
          await this.handleAddRoleModal(interaction);
        } else if (interaction.customId.startsWith('rr_edit_info_modal_')) {
          await this.handleEditInfoModal(interaction);
        }
      } catch (error) {
        console.error('Error handling modal submission:', error);
        if (!interaction.replied) {
          await interaction.reply({
            content: '❌ An error occurred while processing your request.',
            ephemeral: true
          });
        }
      }
    }
  
    async handleButtonInteraction(interaction) {
      try {
        if (interaction.customId.startsWith('rr_add_role_')) {
          await this.showAddRoleModal(interaction);
        } else if (interaction.customId.startsWith('rr_remove_role_')) {
          await this.showRemoveRoleMenu(interaction);
        } else if (interaction.customId.startsWith('rr_edit_info_')) {
          await this.showEditInfoModal(interaction);
        } else if (interaction.customId.startsWith('rr_finish_setup_')) {
          await this.finishSetup(interaction);
        } else if (interaction.customId.startsWith('rr_cancel_setup_')) {
          await this.cancelSetup(interaction);
        } else if (interaction.customId.startsWith('rr_rebuild_')) {
          await this.rebuildSetup(interaction);
        }
      } catch (error) {
        console.error('Error handling button interaction:', error);
        if (!interaction.replied) {
          await interaction.reply({
            content: '❌ An error occurred while processing your request.',
            ephemeral: true
          });
        }
      }
    }
  
    async showAddRoleModal(interaction) {
      const setupId = interaction.customId.replace('rr_add_role_', '');
      const setup = await ReactionRole.findOne({ setupId });
  
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          ephemeral: true
        });
      }
  
      if (setup.roles.length >= 5) {
        return interaction.reply({
          content: '❌ Maximum of 5 roles allowed per setup.',
          ephemeral: true
        });
      }
  
      const modal = new ModalBuilder()
        .setCustomId(`rr_add_role_modal_${setupId}`)
        .setTitle('Add Role to Reaction Role Setup');
  
      const roleInput = new TextInputBuilder()
        .setCustomId('role_id')
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
  
      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description (for menus)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setRequired(false)
        .setPlaceholder('Get the Member role');
  
      const emojiInput = new TextInputBuilder()
        .setCustomId('emoji')
        .setLabel('Emoji (optional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('👤 or :custom_emoji: or emoji ID');
  
      const styleInput = new TextInputBuilder()
        .setCustomId('style')
        .setLabel('Button Style (Primary/Secondary/Success/Danger)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Secondary')
        .setValue('Secondary');
  
      modal.addComponents(
        new ActionRowBuilder().addComponents(roleInput),
        new ActionRowBuilder().addComponents(labelInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(emojiInput),
        new ActionRowBuilder().addComponents(styleInput)
      );
  
      await interaction.showModal(modal);
    }
  
    async handleAddRoleModal(interaction) {
      const setupId = interaction.customId.replace('rr_add_role_modal_', '');
      const setup = await ReactionRole.findOne({ setupId });
  
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          ephemeral: true
        });
      }
  
      const roleInput = interaction.fields.getTextInputValue('role_id');
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
          ephemeral: true
        });
      }
  
      // Check if role already exists
      if (setup.roles.some(r => r.roleId === role.id)) {
        return interaction.reply({
          content: '❌ This role is already in the setup.',
          ephemeral: true
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
          // Emoji ID provided
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
          // Unicode emoji
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
  
      // Update the message embed
      await this.updateSetupMessage(setup);
  
      await interaction.reply({
        content: `✅ Added role **${role.name}** to the setup!`,
        ephemeral: true
      });
    }
  
    async showRemoveRoleMenu(interaction) {
      const setupId = interaction.customId.replace('rr_remove_role_', '');
      const setup = await ReactionRole.findOne({ setupId });
  
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          ephemeral: true
        });
      }
  
      if (setup.roles.length === 0) {
        return interaction.reply({
          content: '❌ No roles to remove.',
          ephemeral: true
        });
      }
  
      const options = setup.roles.map(role => ({
        label: `${role.label} (@${role.roleName})`,
        value: role.roleId,
        description: `Remove the ${role.roleName} role`,
        emoji: role.emoji && !role.emoji.unicode ? {
          id: role.emoji.id,
          name: role.emoji.name
        } : undefined
      }));
  
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`rr_remove_role_select_${setupId}`)
        .setPlaceholder('Select a role to remove')
        .addOptions(options);
  
      const row = new ActionRowBuilder().addComponents(selectMenu);
  
      await interaction.reply({
        content: '**Select a role to remove:**',
        components: [row],
        ephemeral: true
      });
    }
  
    async finishSetup(interaction) {
      const setupId = interaction.customId.replace('rr_finish_setup_', '');
      const setup = await ReactionRole.findOne({ setupId });
  
      if (!setup) {
        return interaction.reply({
          content: '❌ Setup not found.',
          ephemeral: true
        });
      }
  
      if (setup.roles.length === 0) {
        return interaction.reply({
          content: '❌ Please add at least one role before finishing the setup.',
          ephemeral: true
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
        content: `✅ Reaction role setup completed! The message has been updated with the final ${setup.type}.`,
        ephemeral: true
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
  
    async updateSetupMessage(setup) {
      const channel = this.client.channels.cache.get(setup.channelId);
      const message = await channel.messages.fetch(setup.messageId);
      
      const embed = new EmbedBuilder()
        .setTitle(setup.title)
        .setDescription(setup.description)
        .setColor(setup.color)
        .setFooter({
          text: `Setup ID: ${setup.setupId} • ${setup.roles.length}/5 roles configured`,
          iconURL: message.guild.iconURL()
        })
        .setTimestamp();
  
      if (setup.roles.length > 0) {
        const rolesText = setup.roles.map(role => 
          `• **${role.label}** - <@&${role.roleId}> ${role.emoji && !role.emoji.unicode ? `<:${role.emoji.name}:${role.emoji.id}>` : role.emoji?.unicode ? role.emoji.name : ''}`
        ).join('\n');
        
        embed.addFields({
          name: 'Configured Roles',
          value: rolesText
        });
      }
  
      // Keep management buttons
      const managementRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`rr_add_role_${setup.setupId}`)
            .setLabel('Add Role')
            .setStyle(ButtonStyle.Success)
            .setEmoji('➕')
            .setDisabled(setup.roles.length >= 5),
          new ButtonBuilder()
            .setCustomId(`rr_remove_role_${setup.setupId}`)
            .setLabel('Remove Role')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('➖')
            .setDisabled(setup.roles.length === 0),
          new ButtonBuilder()
            .setCustomId(`rr_finish_setup_${setup.setupId}`)
            .setLabel('Finish Setup')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅')
            .setDisabled(setup.roles.length === 0),
          new ButtonBuilder()
            .setCustomId(`rr_cancel_setup_${setup.setupId}`)
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );
  
      await message.edit({
        embeds: [embed],
        components: [managementRow]
      });
    }
  
    async cancelSetup(interaction) {
      const setupId = interaction.customId.replace('rr_cancel_setup_', '');
      
      // Delete from database
      await ReactionRole.deleteOne({ setupId });
      
      // Delete the message
      await interaction.message.delete();
      
      await interaction.reply({
        content: '✅ Setup cancelled and message deleted.',
        ephemeral: true
      });
    }
  }
  
  module.exports = ModalHandler;
  