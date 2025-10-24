const { ChannelType, PermissionsBitField } = require('discord.js');
const ServerStats = require('../models/serverstats/Schema'); 

class ServerStatsService {
  constructor(client) {
    this.client = client;
    this.updateQueue = new Map();
    this.rateLimitedChannels = new Set();
    this.isUpdating = false;
  }

  /**
   * Fetch comprehensive server statistics
   * @param {Guild} guild - Discord guild object
   * @returns {Object} Statistics object
   */
  async fetchServerStatistics(guild) {
    try {
     
      const [members, channels, roles] = await Promise.all([
        guild.members.fetch({ force: false, cache: true }).catch(() => guild.members.cache),
        guild.channels.fetch({ force: false, cache: true }).catch(() => guild.channels.cache),
        guild.roles.fetch({ force: false, cache: true }).catch(() => guild.roles.cache)
      ]);

      const stats = {
        all: members.size,
        members: members.filter(m => !m.user.bot).size,
        bots: members.filter(m => m.user.bot).size,
        textChannels: channels.filter(ch => ch.type === ChannelType.GuildText).size,
        voiceChannels: channels.filter(ch => ch.type === ChannelType.GuildVoice).size,
        categories: channels.filter(ch => ch.type === ChannelType.GuildCategory).size,
        roles: roles.size - 1, 
        date: this.formatDate(guild.preferredLocale || 'en-US'),
        timestamp: Date.now()
      };

      return stats;
    } catch (error) {
      console.error(`[StatsService] Failed to fetch stats for guild ${guild.id}:`, error);
      return null;
    }
  }

  /**
   * Format date based on locale
   * @param {string} locale - Locale string
   * @returns {string} Formatted date
   */
  formatDate(locale = 'en-US') {
    const date = new Date();
    const day = date.getDate();
    
    const ordinal = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    const month = date.toLocaleString(locale, { month: 'long' });
    const weekday = date.toLocaleString(locale, { weekday: 'short' });
    
    return `${day}${ordinal(day)} ${month} (${weekday})`;
  }

  /**
   * Create a stats channel
   * @param {Guild} guild - Discord guild
   * @param {Object} options - Channel creation options
   * @returns {Channel} Created channel
   */
  async createStatsChannel(guild, options) {
    const {
      type,
      nameFormat,
      categoryId = null,
      initialValue = 0
    } = options;

    try {
      const channelName = nameFormat.replace('{count}', initialValue);
      
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]
          }
        ],
        reason: `Server stats channel for ${type}`
      });

    
      await channel.setPosition(0).catch(console.warn);

      return channel;
    } catch (error) {
      console.error(`[StatsService] Failed to create channel for ${type}:`, error);
      throw error;
    }
  }

  /**
   * Update a single stats channel
   * @param {Guild} guild - Discord guild
   * @param {Object} statsChannel - Stats channel config
   * @param {Object} statsData - Current statistics
   * @returns {boolean} Success status
   */
  async updateStatsChannel(guild, statsChannel, statsData) {
    try {
      const { channelId, type, nameFormat } = statsChannel;
      
      
      if (this.rateLimitedChannels.has(channelId)) {
        return false;
      }

      const currentValue = statsData[type];
      if (currentValue === undefined) {
        console.warn(`[StatsService] No data for stat type: ${type}`);
        return false;
      }

  
      if (statsChannel.lastValue === currentValue) {
        return true; 
      }

  
      let channel = guild.channels.cache.get(channelId);
      if (!channel) {
        try {
          channel = await guild.channels.fetch(channelId);
        } catch (error) {
          //console.warn(`[StatsService] Channel ${channelId} not found, removing from database`);
          await this.removeStatsChannel(guild.id, channelId);
          return false;
        }
      }

     
      const botMember = guild.members.cache.get(this.client.user.id);
      if (!channel.permissionsFor(botMember)?.has(PermissionsBitField.Flags.ManageChannels)) {
        //console.warn(`[StatsService] No permission to update channel ${channelId}`);
        return false;
      }

   
      const newName = nameFormat.replace('{count}', currentValue);
      if (channel.name !== newName) {
        await channel.setName(newName);
        //console.log(`[StatsService] Updated ${type} channel: ${newName}`);
      }

      
      await this.updateChannelValue(guild.id, channelId, currentValue);
      
      return true;
    } catch (error) {
      if (error.code === 50013) {
        //console.warn(`[StatsService] Missing permissions for channel ${statsChannel.channelId}`);
      } else if (error.code === 30013 || error.message?.includes('rate limit')) {
       // console.warn(`[StatsService] Rate limited channel ${statsChannel.channelId}`);
        this.rateLimitedChannels.add(statsChannel.channelId);
       
        setTimeout(() => {
          this.rateLimitedChannels.delete(statsChannel.channelId);
        }, 10 * 60 * 1000);
      } else {
       // console.error(`[StatsService] Failed to update channel ${statsChannel.channelId}:`, error);
      }
      return false;
    }
  }

  /**
   * Update all stats for a guild
   * @param {Guild} guild - Discord guild
   * @returns {Object} Update results
   */
  async updateGuildStats(guild) {
    try {
      const serverStats = await ServerStats.findByGuildId(guild.id);
      if (!serverStats || !serverStats.activeStatsChannels.length) {
        return { success: true, updated: 0, message: 'No active stats channels' };
      }

      const statsData = await this.fetchServerStatistics(guild);
      if (!statsData) {
        return { success: false, error: 'Failed to fetch server statistics' };
      }

      let successCount = 0;
      let failCount = 0;

   
      for (const statsChannel of serverStats.activeStatsChannels) {
        const success = await this.updateStatsChannel(guild, statsChannel, statsData);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }

       
        if (serverStats.activeStatsChannels.length > 1) {
          await this.sleep(1000);
        }
      }

  
      serverStats.statistics.totalUpdates += successCount;
      serverStats.statistics.lastFullUpdate = new Date();
      if (failCount > 0) {
        serverStats.statistics.failedUpdates += failCount;
      }
      await serverStats.save();

      return {
        success: true,
        updated: successCount,
        failed: failCount,
        total: serverStats.activeStatsChannels.length
      };
    } catch (error) {
      console.error(`[StatsService] Failed to update guild stats for ${guild.id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup stats channels for a guild
   * @param {Guild} guild - Discord guild
   * @param {Array} statsTypes - Array of stat types to setup
   * @param {Object} options - Setup options
   * @returns {Object} Setup results
   */
  async setupStatsChannels(guild, statsTypes, options = {}) {
    const {
      categoryId = null,
      customFormats = {},
      active = true
    } = options;

    const results = {
      created: [],
      updated: [],
      errors: [],
      channels: []
    };

    try {

      let serverStats = await ServerStats.findByGuildId(guild.id);
      if (!serverStats) {
        serverStats = new ServerStats({
          guildId: guild.id,
          guildName: guild.name,
          statsChannels: []
        });
      }

     
      const currentStats = await this.fetchServerStatistics(guild);
      
      for (const statType of statsTypes) {
        try {
          const defaultFormats = {
            members: "👥 Members: {count}",
            bots: "🤖 Bots: {count}",
            textChannels: "💬 Text Channels: {count}",
            voiceChannels: "🔊 Voice Channels: {count}",
            categories: "📁 Categories: {count}",
            roles: "🏷️ Roles: {count}",
            date: "📅 Date: {count}",
            all: "📊 Total Members: {count}"
          };

          const nameFormat = customFormats[statType] || defaultFormats[statType] || `${statType}: {count}`;
          const initialValue = currentStats?.[statType] || 0;

      
          const existingChannelIndex = serverStats.statsChannels.findIndex(
            ch => ch.type === statType
          );

          if (existingChannelIndex !== -1) {
        
            const existingChannel = serverStats.statsChannels[existingChannelIndex];
            
            if (active) {
           
              existingChannel.nameFormat = nameFormat;
              existingChannel.categoryId = categoryId;
              existingChannel.active = active;
              existingChannel.lastUpdatedAt = new Date();
              results.updated.push(statType);
            } else {
            
              const discordChannel = guild.channels.cache.get(existingChannel.channelId);
              if (discordChannel) {
                await discordChannel.delete();
              }
              serverStats.statsChannels.splice(existingChannelIndex, 1);
              results.updated.push(`${statType} (deleted)`);
            }
          } else if (active) {
         
            const channel = await this.createStatsChannel(guild, {
              type: statType,
              nameFormat,
              categoryId,
              initialValue
            });

            serverStats.statsChannels.push({
              type: statType,
              channelId: channel.id,
              channelName: channel.name,
              nameFormat,
              categoryId,
              active: true,
              lastValue: initialValue,
              createdAt: new Date()
            });

            results.created.push(statType);
            results.channels.push(channel);
          }
        } catch (error) {
          console.error(`[StatsService] Error setting up ${statType}:`, error);
          results.errors.push({ type: statType, error: error.message });
        }
      }

      await serverStats.save();
      return results;
    } catch (error) {
      //console.error(`[StatsService] Failed to setup stats channels:`, error);
      throw error;
    }
  }

  /**
   * Remove stats channel
   * @param {string} guildId - Guild ID
   * @param {string} channelId - Channel ID
   */
  async removeStatsChannel(guildId, channelId) {
    try {
      const serverStats = await ServerStats.findByGuildId(guildId);
      if (serverStats) {
        await serverStats.removeStatsChannel(channelId);
      }
    } catch (error) {
     // console.error(`[StatsService] Failed to remove stats channel:`, error);
    }
  }

  /**
   * Update channel value in database
   * @param {string} guildId - Guild ID
   * @param {string} channelId - Channel ID
   * @param {*} value - New value
   */
  async updateChannelValue(guildId, channelId, value) {
    try {
      const serverStats = await ServerStats.findByGuildId(guildId);
      if (serverStats) {
        await serverStats.updateChannelValue(channelId, value);
      }
    } catch (error) {
    //  console.error(`[StatsService] Failed to update channel value:`, error);
    }
  }

  /**
   * Start automatic stats updater
   */
  startStatsUpdater() {
    //console.log('[StatsService] Starting automatic stats updater...');
    

    setTimeout(() => {
      this.runStatsUpdate();
    }, 10000); 


    setInterval(() => {
      this.runStatsUpdate();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Run stats update for all guilds
   */
  async runStatsUpdate() {
    if (this.isUpdating) {
     // console.log('[StatsService] Update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
   // console.log('[StatsService] Starting stats update cycle...');
    
    try {
      const activeGuilds = await ServerStats.findActiveGuilds();
      //console.log(`[StatsService] Updating stats for ${activeGuilds.length} guilds`);

      for (const serverStats of activeGuilds) {
        const guild = this.client.guilds.cache.get(serverStats.guildId);
        if (guild) {
          await this.updateGuildStats(guild);
          await this.sleep(2000); // 2 second delay between guilds
        }
      }

      //console.log('[StatsService] Stats update cycle completed');
    } catch (error) {
     // console.error('[StatsService] Error during stats update cycle:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Utility function to sleep
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get stats dashboard data
   * @param {string} guildId - Guild ID
   * @returns {Object} Dashboard data
   */
  async getDashboardData(guildId) {
    try {
      const serverStats = await ServerStats.findByGuildId(guildId);
      const guild = this.client.guilds.cache.get(guildId);
      
      if (!serverStats || !guild) {
        return null;
      }

      const currentStats = await this.fetchServerStatistics(guild);
      
      return {
        guild: {
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL(),
          memberCount: guild.memberCount
        },
        statsChannels: serverStats.statsChannels.map(channel => ({
          ...channel.toObject(),
          currentValue: currentStats?.[channel.type] || 0
        })),
        settings: serverStats.settings,
        statistics: serverStats.statistics,
        lastUpdate: serverStats.updatedAt
      };
    } catch (error) {
      console.error(`[StatsService] Failed to get dashboard data:`, error);
      return null;
    }
  }
}

module.exports = ServerStatsService;