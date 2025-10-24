const GiveawayController = require('../models/giveaway/Controller');
const { 
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

module.exports = (client) => {
  // Load giveaways on bot ready
  client.once('ready', async () => {
    //console.log('🎉 Giveaway system initialized');
    
    // Start giveaway checker
    setInterval(async () => {
      await checkExpiredGiveaways(client);
    }, 10000); // Check every 10 seconds
    
    // Clean up old ended giveaways (optional)
    setInterval(async () => {
      await cleanupOldGiveaways();
    }, 3600000); // Every hour
  });

  // Handle button interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, type, messageId] = interaction.customId.split('_');
    
    if (action !== 'giveaway') return;

    try {
      switch (type) {
        case 'enter':
          await handleEnterGiveaway(interaction, messageId);
          break;
        case 'participants':
          await handleViewParticipants(interaction, messageId);
          break;
      }
    } catch (error) {
      console.error('Error handling giveaway interaction:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        const errorContainer = new ContainerBuilder()
          .setAccentColor(0xFF0000)
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent('# ❌ Interaction Error\nAn error occurred while processing your request.')
          );

        await interaction.reply({ 
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
          ephemeral: true 
        });
      }
    }
  });

  async function handleEnterGiveaway(interaction, messageId) {
    await interaction.deferReply({ ephemeral: true });

    const { success, giveaway } = await GiveawayController.getGiveaway(messageId);
    
    if (!success || !giveaway) {
      const notFoundContainer = new ContainerBuilder()
        .setAccentColor(0xFF0000)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent('# ❌ Giveaway Not Found\nGiveaway not found or has been deleted.')
        );

      return interaction.editReply({ 
        components: [notFoundContainer],
        flags: MessageFlags.IsComponentsV2 
      });
    }

    if (giveaway.status !== 'active') {
      const inactiveContainer = new ContainerBuilder()
        .setAccentColor(0xFFAA00)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# ⚠️ Giveaway ${giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}\nThis giveaway is currently ${giveaway.status}.`)
        );

      return interaction.editReply({ 
        components: [inactiveContainer],
        flags: MessageFlags.IsComponentsV2 
      });
    }

    if (new Date() >= new Date(giveaway.endTime)) {
      const endedContainer = new ContainerBuilder()
        .setAccentColor(0x555555)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent('# ⏰ Giveaway Ended\nThis giveaway has already ended.')
        );

      return interaction.editReply({ 
        components: [endedContainer],
        flags: MessageFlags.IsComponentsV2 
      });
    }

    // Check if user is already entered
    const existingEntry = giveaway.entries.find(entry => entry.userId === interaction.user.id);
    if (existingEntry && !giveaway.settings.allowMultipleEntries) {
      const alreadyEnteredContainer = new ContainerBuilder()
        .setAccentColor(0xFFAA00)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent('# 🎯 Already Entered\nYou are already entered in this giveaway!')
        );

      return interaction.editReply({ 
        components: [alreadyEnteredContainer],
        flags: MessageFlags.IsComponentsV2 
      });
    }

    // Validate requirements
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const validation = await GiveawayController.validateRequirements(member, giveaway);
    
    if (!validation.valid) {
      const requirementContainer = new ContainerBuilder()
        .setAccentColor(0xFF0000)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# ❌ Requirements Not Met\nYou cannot enter this giveaway: ${validation.reason}`)
        );

      return interaction.editReply({ 
        components: [requirementContainer],
        flags: MessageFlags.IsComponentsV2 
      });
    }

    // Add participant WITH AUTO-UPDATE
    const addResult = await GiveawayController.addParticipant(
      messageId, 
      interaction.user.id, 
      interaction.user.username,
      interaction.client // AUTO-UPDATE
    );

    if (!addResult.success) {
      const failedContainer = new ContainerBuilder()
        .setAccentColor(0xFF0000)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# ❌ Entry Failed\nFailed to enter giveaway: ${addResult.error}`)
        );

      return interaction.editReply({ 
        components: [failedContainer],
        flags: MessageFlags.IsComponentsV2 
      });
    }

    // SUCCESS MESSAGE - Button counter automatically updated!
    const successContainer = new ContainerBuilder()
      .setAccentColor(0x00FF00)
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent('# ✅ Successfully Entered\nYou have successfully entered the giveaway!')
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**🎁 Prize:** ${addResult.giveaway.prize}\n**🎯 Total Entries:** ${addResult.giveaway.entries.length}\n**🔄 Auto-Updated:** Button counter refreshed`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`*Good luck! • ${new Date().toLocaleString()}*`)
      );

    await interaction.editReply({ 
      components: [successContainer],
      flags: MessageFlags.IsComponentsV2 
    });
  }

  async function handleViewParticipants(interaction, messageId) {
    const { success, giveaway } = await GiveawayController.getGiveaway(messageId);
    
    if (!success || !giveaway) {
      const notFoundContainer = new ContainerBuilder()
        .setAccentColor(0xFF0000)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent('# ❌ Giveaway Not Found\nGiveaway not found or has been deleted.')
        );

      return interaction.reply({ 
        components: [notFoundContainer],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true 
      });
    }

    if (!giveaway.settings.showParticipants) {
      const hiddenContainer = new ContainerBuilder()
        .setAccentColor(0xFFAA00)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent('# 🔒 Participants Hidden\nParticipants list is not available for this giveaway.')
        );

      return interaction.reply({ 
        components: [hiddenContainer],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true 
      });
    }

    let participantsList = 'No participants yet.';
    
    if (giveaway.entries.length > 0) {
      const maxDisplay = 20;
      const participants = giveaway.entries
        .slice(0, maxDisplay)
        .map((entry, index) => `${index + 1}. <@${entry.userId}>`)
        .join('\n');
      
      participantsList = participants;
      
      if (giveaway.entries.length > maxDisplay) {
        participantsList += `\n\n...and ${giveaway.entries.length - maxDisplay} more participants.`;
      }
    }

    const participantsContainer = new ContainerBuilder()
      .setAccentColor(0x7289DA)
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# 👥 Participants - ${giveaway.title}\nCurrent participants in the giveaway`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(participantsList)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**Total Entries:** ${giveaway.entries.length}\n**Winners:** ${giveaway.winners}\n**Status:** ${giveaway.status}`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`*Giveaway ID: ${messageId} • ${new Date().toLocaleString()}*`)
      );

    await interaction.reply({ 
      components: [participantsContainer],
      flags: MessageFlags.IsComponentsV2,
      ephemeral: true 
    });
  }

  async function checkExpiredGiveaways(client) {
    try {
      const { success, giveaways } = await GiveawayController.getExpiredGiveaways();
      
      if (!success || !giveaways.length) return;

      for (const giveaway of giveaways) {
        try {
          const result = await GiveawayController.endGiveaway(giveaway.messageId, client);
          
          if (result.success) {
            // Send winner announcement
            const channel = await client.channels.fetch(giveaway.channelId);

            const winnerText = result.winners.length > 0 
              ? result.winners.map(w => `<@${w.userId}>`).join(', ')
              : 'No valid entries';

            const winnerContainer = new ContainerBuilder()
              .setAccentColor(0x00FF00)
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`# 🎉 Giveaway Ended!\n**${result.giveaway.title}**`)
              )
              .addSeparatorComponents(
                new SeparatorBuilder()
                  .setSpacing(SeparatorSpacingSize.Small)
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`**🎁 Prize:** ${result.giveaway.prize}\n**🏆 Winners:** ${winnerText}`)
              )
              .addSeparatorComponents(
                new SeparatorBuilder()
                  .setSpacing(SeparatorSpacingSize.Small)
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`*Automatically ended • ${new Date().toLocaleString()}*`)
              );

            await channel.send({
              components: [winnerContainer],
              flags: MessageFlags.IsComponentsV2
            });

            console.log(`✅ Giveaway ${giveaway.messageId} ended automatically with auto-update`);
          }
        } catch (error) {
          console.error(`Error ending giveaway ${giveaway.messageId}:`, error);
          
          // Handle missing channels/messages
          if (error.code === 10003 || error.code === 50001) {
            await GiveawayController.deleteGiveaway(giveaway.messageId);
            console.log(`🗑️ Cleaned up orphaned giveaway ${giveaway.messageId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking expired giveaways:', error);
    }
  }

  async function cleanupOldGiveaways() {
    try {
      const Giveaway = require('../models/giveaway/schema');
      
      // Delete giveaways ended more than 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await Giveaway.deleteMany({
        status: 'ended',
        endTime: { $lt: thirtyDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} old giveaways`);
      }
    } catch (error) {
      console.error('Error cleaning up old giveaways:', error);
    }
  }
};
