const Giveaway = require('./schema');
const { 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const ms = require('ms');

class GiveawayController {
  
  // Auto-update message helper - CORE FUNCTIONALITY
  static async updateGiveawayMessage(client, giveaway) {
    try {
      const channel = await client.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(giveaway.messageId);
      
      const container = this.createGiveawayContainer(giveaway);
      const buttons = this.createGiveawayButtons(giveaway);
      
      await message.edit({ 
        components: buttons ? [container, buttons] : [container],
        flags: MessageFlags.IsComponentsV2 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating giveaway message:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new giveaway
  static async createGiveaway(options) {
    try {
      const {
        messageId, guildId, channelId, hostId, title, description, 
        prize, duration, winners = 1, requirements = {}, settings = {}
      } = options;

      const endTime = new Date(Date.now() + ms(duration));
      
      const giveaway = new Giveaway({
        messageId,
        guildId,
        channelId,
        hostId,
        title,
        description,
        prize,
        endTime,
        winners,
        requirements,
        settings
      });

      await giveaway.save();
      return { success: true, giveaway };
    } catch (error) {
      console.error('Error creating giveaway:', error);
      return { success: false, error: error.message };
    }
  }

  // Get giveaway by message ID
  static async getGiveaway(messageId) {
    try {
      const giveaway = await Giveaway.findOne({ messageId });
      return { success: true, giveaway };
    } catch (error) {
      console.error('Error fetching giveaway:', error);
      return { success: false, error: error.message };
    }
  }

  // Update giveaway WITH AUTO-UPDATE
  static async updateGiveaway(messageId, updates, client) {
    try {
      // Handle duration update
      if (updates.duration) {
        updates.endTime = new Date(Date.now() + ms(updates.duration));
        delete updates.duration;
      }
  
      // Get current giveaway to increment version
      const currentGiveaway = await Giveaway.findOne({ messageId });
      if (!currentGiveaway) {
        return { success: false, error: 'Giveaway not found' };
      }
  
      const giveaway = await Giveaway.findOneAndUpdate(
        { messageId },
        { 
          $set: { 
            ...updates,
            'metadata.lastUpdated': new Date(),
            'metadata.version': (currentGiveaway.metadata.version || 0) + 1
          }
        },
        { new: true, runValidators: true }
      );

      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }
  
      return { success: true, giveaway };
    } catch (error) {
      console.error('Error updating giveaway:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete giveaway
  static async deleteGiveaway(messageId) {
    try {
      const result = await Giveaway.deleteOne({ messageId });
      return { 
        success: result.deletedCount > 0, 
        message: result.deletedCount > 0 ? 'Giveaway deleted' : 'Giveaway not found' 
      };
    } catch (error) {
      console.error('Error deleting giveaway:', error);
      return { success: false, error: error.message };
    }
  }

  // Add participant WITH AUTO-UPDATE
  static async addParticipant(messageId, userId, username, client) {
    try {
      const giveaway = await Giveaway.findOne({ messageId });
      if (!giveaway) {
        return { success: false, error: 'Giveaway not found' };
      }

      if (giveaway.status !== 'active') {
        return { success: false, error: 'Giveaway is not active' };
      }

      if (giveaway.endTime <= new Date()) {
        return { success: false, error: 'Giveaway has ended' };
      }

      const existingEntry = giveaway.entries.find(entry => entry.userId === userId);
      if (existingEntry && !giveaway.settings.allowMultipleEntries) {
        return { success: false, error: 'Already entered' };
      }

      await giveaway.addEntry(userId, username);
      
      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }

      return { success: true, giveaway };
    } catch (error) {
      console.error('Error adding participant:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove participant WITH AUTO-UPDATE
  static async removeParticipant(messageId, userId, client) {
    try {
      const giveaway = await Giveaway.findOne({ messageId });
      if (!giveaway) {
        return { success: false, error: 'Giveaway not found' };
      }

      await giveaway.removeEntry(userId);
      
      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }

      return { success: true, giveaway };
    } catch (error) {
      console.error('Error removing participant:', error);
      return { success: false, error: error.message };
    }
  }

  // End giveaway and select winners WITH AUTO-UPDATE
  static async endGiveaway(messageId, client) {
    try {
      const giveaway = await Giveaway.findOne({ messageId });
      if (!giveaway) {
        return { success: false, error: 'Giveaway not found' };
      }

      const winners = giveaway.selectWinners();
      giveaway.status = 'ended';
      await giveaway.save();

      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }

      // Send DMs to winners if enabled
      if (giveaway.settings.dmWinners && winners.length > 0) {
        await this.dmWinners(client, winners, giveaway);
      }

      return { success: true, giveaway, winners };
    } catch (error) {
      console.error('Error ending giveaway:', error);
      return { success: false, error: error.message };
    }
  }

  // Reroll winners WITH AUTO-UPDATE
  static async rerollWinners(messageId, count, client) {
    try {
      const giveaway = await Giveaway.findOne({ messageId });
      if (!giveaway) {
        return { success: false, error: 'Giveaway not found' };
      }

      const winners = giveaway.selectWinners(count || giveaway.winners);
      await giveaway.save();

      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }

      if (giveaway.settings.dmWinners && winners.length > 0) {
        await this.dmWinners(client, winners, giveaway);
      }

      return { success: true, winners, giveaway };
    } catch (error) {
      console.error('Error rerolling winners:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all giveaways for a guild
  static async getGuildGiveaways(guildId, status = null) {
    try {
      const query = { guildId };
      if (status) query.status = status;
      
      const giveaways = await Giveaway.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
      
      return { success: true, giveaways };
    } catch (error) {
      console.error('Error fetching guild giveaways:', error);
      return { success: false, error: error.message };
    }
  }

  // Get expired giveaways
  static async getExpiredGiveaways() {
    try {
      const giveaways = await Giveaway.findExpiredGiveaways();
      return { success: true, giveaways };
    } catch (error) {
      console.error('Error fetching expired giveaways:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all participants WITH AUTO-UPDATE
  static async clearParticipants(messageId, client) {
    try {
      const giveaway = await Giveaway.findOneAndUpdate(
        { messageId },
        { 
          $set: { 
            entries: [],
            'metadata.totalEntries': 0,
            'metadata.lastUpdated': new Date()
          }
        },
        { new: true }
      );

      if (!giveaway) {
        return { success: false, error: 'Giveaway not found' };
      }

      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }

      return { success: true, giveaway };
    } catch (error) {
      console.error('Error clearing participants:', error);
      return { success: false, error: error.message };
    }
  }

  // Pause/Resume giveaway WITH AUTO-UPDATE
  static async toggleGiveawayStatus(messageId, status, client) {
    try {
      const giveaway = await Giveaway.findOneAndUpdate(
        { messageId },
        { 
          $set: { 
            status,
            'metadata.lastUpdated': new Date()
          }
        },
        { new: true }
      );

      if (!giveaway) {
        return { success: false, error: 'Giveaway not found' };
      }

      // AUTO-UPDATE THE MESSAGE
      if (client) {
        await this.updateGiveawayMessage(client, giveaway);
      }

      return { success: true, giveaway };
    } catch (error) {
      console.error('Error toggling giveaway status:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate user requirements
  static async validateRequirements(member, giveaway) {
    try {
      const { requirements } = giveaway;
      
      // Check required roles
      if (requirements.roles && requirements.roles.length > 0) {
        const hasRequiredRole = requirements.roles.some(roleId => 
          member.roles.cache.has(roleId)
        );
        if (!hasRequiredRole) {
          return { valid: false, reason: 'Missing required role' };
        }
      }

      // Check blacklisted roles
      if (requirements.blacklistedRoles && requirements.blacklistedRoles.length > 0) {
        const hasBlacklistedRole = requirements.blacklistedRoles.some(roleId => 
          member.roles.cache.has(roleId)
        );
        if (hasBlacklistedRole) {
          return { valid: false, reason: 'Has blacklisted role' };
        }
      }

      // Check account age
      if (requirements.minAccountAge > 0) {
        const accountAge = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
        if (accountAge < requirements.minAccountAge) {
          return { valid: false, reason: `Account must be at least ${requirements.minAccountAge} days old` };
        }
      }

      // Check server join age
      if (requirements.minServerAge > 0) {
        const serverAge = (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24);
        if (serverAge < requirements.minServerAge) {
          return { valid: false, reason: `Must be in server for at least ${requirements.minServerAge} days` };
        }
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating requirements:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }

  // Send DM to winners with v2 components
  static async dmWinners(client, winners, giveaway) {
    for (const winner of winners) {
      try {
        const user = await client.users.fetch(winner.userId);
        
        const winnerContainer = new ContainerBuilder()
          .setAccentColor(0x00FF00)
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`# 🎉 Congratulations! You Won!\nYou won **${giveaway.prize}** in the giveaway: **${giveaway.title}**`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`**🎁 Prize:** ${giveaway.prize}\n**🎪 Giveaway:** ${giveaway.title}`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`*Congratulations from the team! • ${new Date().toLocaleString()}*`)
          );

        await user.send({ 
          components: [winnerContainer],
          flags: MessageFlags.IsComponentsV2 
        });
      } catch (error) {
        console.error(`Failed to DM winner ${winner.userId}:`, error);
      }
    }
  }

  // Create giveaway container (v2 components)
  static createGiveawayContainer(giveaway) {
    const statusColors = {
      active: 0x7289DA,
      ended: 0x555555,
      paused: 0xFFAA00,
      cancelled: 0xFF0000
    };

    const container = new ContainerBuilder()
      .setAccentColor(statusColors[giveaway.status] || 0x7289DA)
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# 🎉 ${giveaway.title}\n${giveaway.description}`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**🎁 Prize:** ${giveaway.prize}\n**👥 Winners:** ${giveaway.winners}\n**🎯 Entries:** ${giveaway.entries.length}\n**📊 Status:** ${giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}`)
      );

    if (giveaway.status === 'active') {
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**⏰ Ends:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`)
      );
    } else if (giveaway.status === 'ended' && giveaway.winnersList.length > 0) {
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**🏆 Winners:** ${giveaway.winnersList.map(w => `<@${w.userId}>`).join(', ')}`)
      );
    } else if (giveaway.status === 'paused') {
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**⏸️ This giveaway is currently paused**`)
      );
    }

    return container;
  }

  // Create giveaway buttons
  static createGiveawayButtons(giveaway) {
    const buttons = [];

    if (giveaway.status === 'active') {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveaway.messageId}`)
          .setLabel(`🎉 Enter (${giveaway.entries.length})`)
          .setStyle(ButtonStyle.Success)
      );
    } else if (giveaway.status === 'paused') {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveaway.messageId}`)
          .setLabel(`⏸️ Paused (${giveaway.entries.length})`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    } else if (giveaway.status === 'ended') {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveaway.messageId}`)
          .setLabel(`🏁 Ended (${giveaway.entries.length})`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    }

    if (giveaway.settings.showParticipants) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`giveaway_participants_${giveaway.messageId}`)
          .setLabel('👥 Participants')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    return buttons.length > 0 ? new ActionRowBuilder().addComponents(buttons) : null;
  }
}

module.exports = GiveawayController;
