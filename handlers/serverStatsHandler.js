const ServerStatsService = require('../services/serverStatsService'); // Adjust path

/**
 * Server Stats Events Handler
 * Handles Discord events that should trigger stats updates
 */
module.exports = (client) => {
  const statsService = new ServerStatsService(client);
  
  //console.log('[StatsEvents] Initializing server stats event handlers...');

  // Debounce mechanism to prevent spam updates
  const updateQueue = new Map();
  const DEBOUNCE_TIME = 10000; // 10 seconds

  /**
   * Queue an update for a guild with debouncing
   * @param {Guild} guild - Discord guild
   * @param {string} reason - Reason for update
   */
  function queueGuildUpdate(guild, reason = 'Event triggered') {
    if (!guild) return;
    
    const guildId = guild.id;
    
    // Clear existing timeout
    if (updateQueue.has(guildId)) {
      clearTimeout(updateQueue.get(guildId).timeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        //console.log(`[StatsEvents] Updating stats for ${guild.name} (${reason})`);
        await statsService.updateGuildStats(guild);
        updateQueue.delete(guildId);
      } catch (error) {
       // console.error(`[StatsEvents] Failed to update stats for ${guild.name}:`, error);
        updateQueue.delete(guildId);
      }
    }, DEBOUNCE_TIME);
    
    updateQueue.set(guildId, {
      timeout,
      reason,
      queuedAt: Date.now()
    });
  }

  // Member Events - Affect member count, bot count, and total count
  client.on('guildMemberAdd', (member) => {
    queueGuildUpdate(member.guild, `Member joined: ${member.user.tag}`);
  });

  client.on('guildMemberRemove', (member) => {
    queueGuildUpdate(member.guild, `Member left: ${member.user.tag}`);
  });

  // Channel Events - Affect channel counts
  client.on('channelCreate', (channel) => {
    if (channel.guild) {
      queueGuildUpdate(channel.guild, `Channel created: ${channel.name}`);
    }
  });

  client.on('channelDelete', (channel) => {
    if (channel.guild) {
      queueGuildUpdate(channel.guild, `Channel deleted: ${channel.name}`);
    }
  });

  // Role Events - Affect role count
  client.on('roleCreate', (role) => {
    queueGuildUpdate(role.guild, `Role created: ${role.name}`);
  });

  client.on('roleDelete', (role) => {
    queueGuildUpdate(role.guild, `Role deleted: ${role.name}`);
  });

  // Guild Events - Update guild info and trigger full refresh
  client.on('guildUpdate', (oldGuild, newGuild) => {
    queueGuildUpdate(newGuild, 'Guild updated');
  });

  // Bot joins a new guild - Setup detection
  client.on('guildCreate', async (guild) => {
    console.log(`[StatsEvents] Bot joined new guild: ${guild.name} (${guild.id})`);
    
    try {
      // Wait a bit for guild to be fully loaded
      setTimeout(async () => {
        await statsService.updateGuildStats(guild);
      }, 5000);
    } catch (error) {
      console.error(`[StatsEvents] Error handling new guild ${guild.name}:`, error);
    }
  });

  // Bot leaves a guild - Cleanup
  client.on('guildDelete', async (guild) => {
    console.log(`[StatsEvents] Bot left guild: ${guild.name} (${guild.id})`);
    
    try {
      // Optional: Clean up database entries for left guilds
      // const ServerStats = require('../models/ServerStats');
      // await ServerStats.findOneAndUpdate(
      //   { guildId: guild.id },
      //   { isActive: false },
      //   { new: true }
      // );
    } catch (error) {
      console.error(`[StatsEvents] Error handling guild leave ${guild.name}:`, error);
    }
  });

  // Handle button interactions for stats view
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const { customId, guild } = interaction;
    
    if (customId === 'stats_force_update') {
      await interaction.deferUpdate();
      
      try {
        const results = await statsService.updateGuildStats(guild);
        
        const embed = interaction.message.embeds[0];
        embed.setFooter({ 
          text: `Force updated: ${new Date().toLocaleString()} | Updated: ${results.updated}/${results.total}` 
        });
        
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error('[StatsEvents] Failed to force update stats:', error);
        await interaction.followUp({ 
          content: '❌ Failed to update stats. Please try again later.',
          ephemeral: true 
        });
      }
    }
    
    if (customId === 'stats_settings') {
      await interaction.deferUpdate();
      
      const embed = new (require('discord.js').EmbedBuilder)()
        .setTitle('⚙️ Server Stats Settings')
        .setColor('#3498db')
        .setDescription('Use `/serverstats settings` command to modify these settings:')
        .addFields(
          {
            name: 'Available Settings',
            value: [
              '• **interval** - Update frequency (1-60 minutes)',
              '• **autoupdate** - Enable/disable automatic updates',
              '• **timezone** - Timezone for date formatting'
            ].join('\n')
          },
          {
            name: 'Example Usage',
            value: '`/serverstats settings interval:10 autoupdate:true timezone:America/New_York`'
          }
        )
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  });

  // Date change detection for date stats
  let lastDateCheck = new Date().toDateString();
  setInterval(() => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastDateCheck) {
      lastDateCheck = currentDate;
      console.log('[StatsEvents] Date changed, updating all guilds with date stats');
      
      // Update all guilds that have date stats
      client.guilds.cache.forEach(guild => {
        queueGuildUpdate(guild, 'Date changed');
      });
    }
  }, 60000); // Check every minute

  // Cleanup function
  const cleanup = () => {
    //console.log('[StatsEvents] Cleaning up pending updates...');
    for (const [guildId, data] of updateQueue) {
      clearTimeout(data.timeout);
    }
    updateQueue.clear();
  };

  process.on('SIGINT', () => {
    cleanup();
   // console.log('[StatsEvents] Shutdown complete. Exiting...');
    process.exit(0); // <- Make sure the process actually ends
  });
  
  process.on('SIGTERM', () => {
    cleanup();
   // console.log('[StatsEvents] Shutdown complete. Exiting...');
    process.exit(0);
  });

  // Start the automatic updater when ready
  if (client.isReady()) {
    statsService.startStatsUpdater();
  } else {
    client.once('ready', () => {
      //console.log('[StatsEvents] Client ready, starting stats updater...');
      statsService.startStatsUpdater();
    });
  }

  // Status logging
  setInterval(() => {
    if (updateQueue.size > 0) {
     // console.log(`[StatsEvents] Pending updates: ${updateQueue.size}`);
    }
  }, 300000); // Every 5 minutes

  //console.log('[StatsEvents] Server stats event handlers initialized successfully!');
  
  return {
    statsService,
    queueGuildUpdate,
    cleanup,
    getQueueStatus: () => ({
      pendingUpdates: updateQueue.size,
      guilds: Array.from(updateQueue.keys())
    })
  };
};