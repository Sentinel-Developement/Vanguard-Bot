const { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');
const AFK = require('../models/afk/schema');

class AFKManager {
constructor(client) {
  this.client = client;
  this.processedMessages = new Map();
  this.mentionCooldowns = new Map();
  this.autoResponseCooldowns = new Map();
  
  this.startCleanupTask();
  this.startMemoryCleanup();
}

async setAFK(userId, guildId, reason, options = {}) {
  try {
    const {
      duration = null,
      autoResponse = null,
      dmNotifications = true,
      publicNotifications = true,
      showDuration = true,
      timezone = null
    } = options;

    const expiresAt = duration ? new Date(Date.now() + duration) : null;

    const afkData = {
      userId,
      guildId,
      reason,
      setAt: new Date(),
      expiresAt,
      status: 'active',
      mentions: {
        count: 0,
        lastMentioned: null,
        mentionedBy: []
      },
      autoResponses: {
        enabled: autoResponse?.message ? true : false,
        message: autoResponse?.message || null,
        cooldown: autoResponse?.cooldown || 300000,
        lastSent: null
      },
      settings: {
        dmNotifications,
        publicNotifications,
        showDuration,
        allowMentionTracking: true
      },
      metadata: {
        timezone,
        lastActivity: new Date(),
        totalAfkTime: 0
      }
    };

    const afk = await AFK.findOneAndUpdate(
      { userId, guildId },
      { $set: afkData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return afk;
  } catch (error) {
    console.error('Error setting AFK:', error);
    throw new Error('Failed to set AFK status');
  }
}


async removeAFK(userId, guildId, silent = false) {
  try {
    const afk = await AFK.findActiveAFK(userId, guildId);
    
    if (!afk) return null;

   
    await afk.calculateTotalAfkTime();
    
   
    afk.status = 'removed';
    afk.metadata.lastActivity = new Date();
    await afk.save();

    return afk;
  } catch (error) {
    console.error('Error removing AFK:', error);
    throw new Error('Failed to remove AFK status');
  }
}


async getAFK(userId, guildId) {
  try {
    return await AFK.findActiveAFK(userId, guildId);
  } catch (error) {
    console.error('Error getting AFK:', error);
    return null;
  }
}


async getAllAFKs(guildId, options = {}) {
  try {
    const {
      page = 1,
      limit = 25,
      sortBy = 'setAt',
      sortOrder = -1,
      status = 'active'
    } = options;

    const skip = (page - 1) * limit;
    
    const query = { guildId, status };
    if (status === 'active') {
      query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    const afks = await AFK.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AFK.countDocuments(query);

    return {
      afks,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error getting all AFKs:', error);
    return { afks: [], pagination: { current: 1, total: 0, hasNext: false, hasPrev: false } };
  }
}


async handleMentions(message) {
  if (
    message.author.bot ||
    !message.mentions.users.size ||
    !message.guild ||
    this.processedMessages.has(message.id)
  ) return;

  this.processedMessages.set(message.id, Date.now());

  try {
    const mentionedAFKs = [];
    const autoResponses = [];

    for (const [userId] of message.mentions.users) {
      const afk = await this.getAFK(userId, message.guild.id);
      
      if (!afk) continue;

 
      const mentionedUser = await this.client.users.fetch(userId).catch(() => null);
      if (mentionedUser) {
        await afk.addMention(message.author);
      }

    
      const cooldownKey = `${message.author.id}-${userId}`;
      const lastMention = this.mentionCooldowns.get(cooldownKey);
      
      if (lastMention && Date.now() - lastMention < 60000) continue; 
      
      this.mentionCooldowns.set(cooldownKey, Date.now());
      mentionedAFKs.push({ userId, afk, user: mentionedUser });

    
      if (afk.canSendAutoResponse()) {
        autoResponses.push({ afk, user: mentionedUser });
      }
    }

  
    if (mentionedAFKs.length > 0) {
      await this.sendMentionNotification(message, mentionedAFKs);
    }

 
    for (const { afk, user } of autoResponses) {
      await this.sendAutoResponse(message, afk, user);
    }

  } catch (error) {
    console.error('Error handling mentions:', error);
  }
}


async sendMentionNotification(message, mentionedAFKs) {
  try {
    if (mentionedAFKs.length === 1) {
      const { userId, afk, user } = mentionedAFKs[0];
      
      const mentionContainer = new ContainerBuilder()
        .setAccentColor(0x00BFFF)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🌙 AFK Notification\n${user ? user.tag : `<@${userId}>`} is currently AFK.\n**Reason:** ${afk.reason}`)
        );

      
      let additionalInfo = '';
      if (afk.expiresAt && afk.settings.showDuration) {
        additionalInfo += `**Returns:** <t:${Math.floor(afk.expiresAt.getTime() / 1000)}:R>\n`;
      }
      if (afk.mentions.count > 1) {
        additionalInfo += `**Mentions:** ${afk.mentions.count} times`;
      }

      if (additionalInfo) {
        mentionContainer.addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(additionalInfo)
        );
      }

      mentionContainer.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`*AFK notification • ${new Date().toLocaleString()}*`)
      );

      await message.reply({ 
        components: [mentionContainer], 
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false } 
      });
    } else {
      let description = '';
      for (const { userId, afk, user } of mentionedAFKs.slice(0, 5)) {
        const userTag = user ? user.tag : `<@${userId}>`;
        description += `**${userTag}:** ${afk.reason}\n`;
      }

      if (mentionedAFKs.length > 5) {
        description += `\n*...and ${mentionedAFKs.length - 5} more*`;
      }

      const multiMentionContainer = new ContainerBuilder()
        .setAccentColor(0x00BFFF)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🌙 AFK Notification\n${mentionedAFKs.length} AFK Users Mentioned`)
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(description)
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`*AFK notification • ${new Date().toLocaleString()}*`)
        );
      
      await message.reply({ 
        components: [multiMentionContainer], 
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false } 
      });
    }
  } catch (error) {
    console.error('Error sending mention notification:', error);
  }
}


async sendAutoResponse(message, afk, user) {
  try {
    const autoResponseContainer = new ContainerBuilder()
      .setAccentColor(0xFFD700)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`**Auto-Response**\n${afk.autoResponses.message}`)
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(user ? user.displayAvatarURL({ dynamic: true }) : this.client.user.displayAvatarURL())
              .setDescription(`${user ? user.username : 'AFK User'} auto-response`)
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`*This is an automated response • ${new Date().toLocaleString()}*`)
      );

    await message.channel.send({ 
      components: [autoResponseContainer], 
      flags: MessageFlags.IsComponentsV2 
    });
    await afk.markAutoResponseSent();
  } catch (error) {
    console.error('Error sending auto-response:', error);
  }
}


async handleAFKRemoval(message) {
  if (!message.guild || !message.author || message.author.bot) return;

  try {
    const afk = await this.removeAFK(message.author.id, message.guild.id);
    
    if (!afk) return;

    if (afk.settings.publicNotifications) {
      const totalTime = afk.metadata.totalAfkTime || 0;
      const afkDuration = this.formatDuration(totalTime);
      
      const welcomeBackContainer = new ContainerBuilder()
        .setAccentColor(0x00FF7F)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 👋 Welcome Back!\nWelcome back, <@${message.author.id}>! Your AFK status has been removed.`)
        );

      if (afk.mentions.count > 0) {
        welcomeBackContainer.addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`**While You Were Away**\nYou were mentioned **${afk.mentions.count}** time(s)\nAFK Duration: **${afkDuration}**`)
        );
      }

      welcomeBackContainer.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`*Welcome back! • ${new Date().toLocaleString()}*`)
      );

      await message.channel.send({ 
        components: [welcomeBackContainer], 
        flags: MessageFlags.IsComponentsV2 
      });
    }

  
    if (afk.settings.dmNotifications) {
      await this.sendWelcomeBackDM(message.author, afk);
    }

  } catch (error) {
    console.error('Error handling AFK removal:', error);
  }
}


async sendWelcomeBackDM(user, afk) {
  try {
    const totalTime = afk.metadata.totalAfkTime || 0;
    const afkDuration = this.formatDuration(totalTime);
    
    const welcomeDMContainer = new ContainerBuilder()
      .setAccentColor(0x00FF7F)
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# 🎉 AFK Status Removed\nWelcome back! Here's a summary of your AFK session:`)
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`**Reason:** ${afk.reason}\n**Duration:** ${afkDuration}\n**Mentions:** ${afk.mentions.count}`)
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(user.displayAvatarURL({ dynamic: true }))
              .setDescription(`${user.username} AFK session summary`)
          )
      );

    if (afk.mentions.mentionedBy.length > 0) {
      const recentMentions = afk.mentions.mentionedBy
        .slice(0, 3)
        .map(mention => `• ${mention.username}`)
        .join('\n');
      
      welcomeDMContainer.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**Recent Mentions From:**\n${recentMentions}${afk.mentions.mentionedBy.length > 3 ? `\n*...and ${afk.mentions.mentionedBy.length - 3} more*` : ''}`)
      );
    }

    welcomeDMContainer.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`*AFK session ended • ${new Date().toLocaleString()}*`)
    );

    await user.send({ 
      components: [welcomeDMContainer], 
      flags: MessageFlags.IsComponentsV2 
    });
  } catch (error) {
    console.error('Error sending welcome back DM:', error);
  }
}


async removeExpiredAFKs() {
  try { 
    const expiredAFKs = await AFK.findExpiredAFKs();

    for (const afk of expiredAFKs) {
      const user = this.client.users.cache.get(afk.userId);
      
      if (user && afk.settings.dmNotifications) {
        const expiredContainer = new ContainerBuilder()
          .setAccentColor(0xFFCC00)
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`# ⏰ AFK Status Expired\nYour AFK status has expired.\n**Reason:** ${afk.reason}`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`*AFK status automatically removed • ${new Date().toLocaleString()}*`)
          );

        await user.send({ 
          components: [expiredContainer], 
          flags: MessageFlags.IsComponentsV2 
        }).catch(() => {});
      }


      await afk.calculateTotalAfkTime();
      
      afk.status = 'expired';
      await afk.save();
    }

    if (expiredAFKs.length > 0) {
      console.log(`\x1b[36m[ AFK Handler ]\x1b[0m Processed ${expiredAFKs.length} expired AFK statuses.`);
    }
  } catch (error) {
    console.error('Error cleaning up expired AFK statuses:', error);
  }
}


async getGuildStats(guildId) {
  try {
    const stats = await AFK.getGuildAFKStats(guildId);
    
    const result = {
      active: 0,
      expired: 0,
      removed: 0,
      totalMentions: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.totalMentions += stat.totalMentions;
    });

    return result;
  } catch (error) {
    console.error('Error getting guild stats:', error);
    return { active: 0, expired: 0, removed: 0, totalMentions: 0 };
  }
}


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


parseDuration(durationStr) {
  const match = durationStr.match(/^(\d+)([smhd])$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  
  return value * multipliers[unit];
}


startCleanupTask() {
  setInterval(async () => {
    try {
      await this.removeExpiredAFKs();
    } catch (error) {
      console.error('Error in AFK cleanup task:', error);
    }
  }, 60000); 
}


startMemoryCleanup() {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 300000; 
    

    for (const [messageId, timestamp] of this.processedMessages) {
      if (now - timestamp > maxAge) {
        this.processedMessages.delete(messageId);
      }
    }
    

    for (const [key, timestamp] of this.mentionCooldowns) {
      if (now - timestamp > 60000) { 
        this.mentionCooldowns.delete(key);
      }
    }
  }, 300000); 
}
}

module.exports = (client) => {
const manager = new AFKManager(client);

return {
  setAFK: (userId, guildId, reason, options) => manager.setAFK(userId, guildId, reason, options),
  removeAFK: (userId, guildId, silent) => manager.removeAFK(userId, guildId, silent),
  getAFK: (userId, guildId) => manager.getAFK(userId, guildId),
  getAllAFKs: (guildId, options) => manager.getAllAFKs(guildId, options),
  handleAFKRemoval: (message) => manager.handleAFKRemoval(message),
  handleMentions: (message) => manager.handleMentions(message),
  getGuildStats: (guildId) => manager.getGuildStats(guildId),
  parseDuration: (durationStr) => manager.parseDuration(durationStr)
};
};
