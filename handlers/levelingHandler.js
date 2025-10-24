// handlers/levelingHandler.js
const levelingController = require('../models/leveling/levelingController');
const GuildLevel = require('../models/leveling/guildLevelSchema');
const UserLevel = require('../models/leveling/userLevelSchema');
const VoiceSession = require('../models/leveling/voiceSessionSchema');

class LevelingHandler {
    constructor(client) {
        this.client = client;
        this.setupEventListeners();
        this.setupCleanupTasks();
        this.setupStatResets();
        //console.log('✅ Advanced Leveling Handler initialized');
    }

    setupEventListeners() {
        // Message events
        this.client.on('messageCreate', this.handleMessage.bind(this));
        
        // Voice events
        this.client.on('voiceStateUpdate', this.handleVoiceStateUpdate.bind(this));
        
        // Guild events
        this.client.on('guildMemberAdd', this.handleMemberJoin.bind(this));
        this.client.on('guildMemberRemove', this.handleMemberLeave.bind(this));
        
        // Error handling
        this.client.on('error', this.handleError.bind(this));
        
       // console.log('🎧 Event listeners registered');
    }

    // ===== MESSAGE HANDLING =====
    async handleMessage(message) {
        // Basic checks
        if (!message.guild || message.author.bot) return;

        try {
            const result = await levelingController.gainTextXP(
                message.author.id,
                message.guild.id,
                message,
                this.client
            );

            if (result?.leveledUp) {
                console.log(`📈 ${message.author.tag} leveled up to ${result.newLevel} in ${message.guild.name}`);
                
                // Optional: Add level up reactions or other effects
                try {
                    await message.react('🎉');
                } catch (error) {
                    // Ignore reaction errors
                }
            }

        } catch (error) {
            console.error('Message handling error:', error);
        }
    }

    // ===== VOICE HANDLING =====
    async handleVoiceStateUpdate(oldState, newState) {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;

        try {
            const guildConfig = await GuildLevel.findOne({ guildId: member.guild.id });
            if (!guildConfig?.enabled || !guildConfig?.voiceSettings?.enabled) return;

            // User joined a voice channel
            if (!oldState.channel && newState.channel) {
                await levelingController.handleVoiceJoin(member, newState.channel, guildConfig);
                //console.log(`🎤 Voice join: ${member.user.tag} -> ${newState.channel.name}`);
            }
            // User left a voice channel
            else if (oldState.channel && !newState.channel) {
                await levelingController.handleVoiceLeave(member, guildConfig);
               // console.log(`🎤 Voice leave: ${member.user.tag} <- ${oldState.channel.name}`);
            }
            // User switched voice channels
            else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                await levelingController.handleVoiceLeave(member, guildConfig);
                await levelingController.handleVoiceJoin(member, newState.channel, guildConfig);
                //console.log(`🎤 Voice switch: ${member.user.tag} ${oldState.channel.name} -> ${newState.channel.name}`);
            }
            // User changed voice states (mute, deaf, etc.) - no action needed as XP calculation handles this

        } catch (error) {
            console.error('Voice state update error:', error);
        }
    }

    // ===== MEMBER EVENTS =====
    async handleMemberJoin(member) {
        if (member.user.bot) return;

        try {
            // Initialize new member data
            await levelingController.initializeUser(member.id, member.guild.id);
            //console.log(`👋 Initialized leveling data for new member: ${member.user.tag}`);

            // Optional: Welcome message with leveling info
            const guildConfig = await GuildLevel.findOne({ guildId: member.guild.id });
            if (guildConfig?.enabled && guildConfig.settings.logChannel) {
                const logChannel = member.guild.channels.cache.get(guildConfig.settings.logChannel);
                if (logChannel) {
                    const welcomeEmbed = {
                        color: 0x00ff88,
                        title: '👋 Welcome to the Leveling System!',
                        description: `Welcome ${member}! Start chatting and participating in voice channels to gain XP and level up!`,
                        fields: [
                            { name: '💬 Text XP', value: `${guildConfig.settings.xpRange.min}-${guildConfig.settings.xpRange.max} per message`, inline: true },
                            { name: '🎤 Voice XP', value: `${guildConfig.voiceSettings.xpPerMinute} per minute`, inline: true },
                            { name: '⏱️ Cooldown', value: `${guildConfig.settings.xpCooldown / 1000}s`, inline: true }
                        ],
                        timestamp: new Date()
                    };

                    try {
                        await logChannel.send({ embeds: [welcomeEmbed] });
                    } catch (error) {
                        // Ignore send errors
                    }
                }
            }

        } catch (error) {
            console.error('Member join handling error:', error);
        }
    }

    async handleMemberLeave(member) {
        if (member.user.bot) return;

        try {
            // Clean up active voice sessions
            const sessionId = `${member.id}_${member.guild.id}`;
            if (levelingController.voiceSessions.has(sessionId)) {
                const guildConfig = await GuildLevel.findOne({ guildId: member.guild.id });
                await levelingController.handleVoiceLeave(member, guildConfig);
            }

            //console.log(`👋 Member left, cleaned up voice session: ${member.user.tag}`);

        } catch (error) {
            console.error('Member leave handling error:', error);
        }
    }

    // ===== CLEANUP TASKS =====
    setupCleanupTasks() {
        // Clean up old voice sessions every hour
        setInterval(async () => {
            try {
                const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                const result = await VoiceSession.deleteMany({
                    createdAt: { $lt: threeDaysAgo },
                    duration: { $lt: 300000 } // Remove sessions shorter than 5 minutes
                });

                if (result.deletedCount > 0) {
                    console.log(`🧹 Cleaned up ${result.deletedCount} old voice sessions`);
                }

            } catch (error) {
                console.error('Voice session cleanup error:', error);
            }
        }, 3600000); // Every hour

        // Clean up expired XP cooldowns every 15 minutes
        setInterval(() => {
            const now = Date.now();
            let cleaned = 0;
            
            for (const [key, timestamp] of levelingController.cooldowns.entries()) {
                if (timestamp <= now) {
                    levelingController.cooldowns.delete(key);
                    cleaned++;
                }
            }
            
            if (cleaned > 0) {
                console.log(`🧹 Cleaned up ${cleaned} expired XP cooldowns`);
            }
        }, 900000); // Every 15 minutes

        // Database optimization every 6 hours
        setInterval(async () => {
            try {
                // Update average session lengths
                const users = await UserLevel.find({
                    'voiceStats.sessionsCount': { $gt: 0 },
                    'voiceStats.averageSessionLength': { $eq: 0 }
                });

                let updated = 0;
                for (const user of users) {
                    if (user.voiceStats.sessionsCount > 0) {
                        user.voiceStats.averageSessionLength = Math.floor(
                            user.voiceStats.totalMinutes / user.voiceStats.sessionsCount
                        );
                        await user.save();
                        updated++;
                    }
                }

                if (updated > 0) {
                    console.log(`📊 Updated average session lengths for ${updated} users`);
                }

            } catch (error) {
                console.error('Database optimization error:', error);
            }
        }, 21600000); // Every 6 hours

       // console.log('🧹 Cleanup tasks scheduled');
    }

    // ===== STAT RESETS =====
    setupStatResets() {
        // Reset weekly stats every Monday at 00:00 UTC
        setInterval(async () => {
            const now = new Date();
            
            // Check if it's Monday at midnight UTC
            if (now.getUTCDay() === 1 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
                try {
                    const result = await UserLevel.updateMany(
                        {},
                        { 
                            $set: { 
                                weeklyXp: 0,
                                'voiceStats.weeklyVoiceMinutes': 0
                            } 
                        }
                    );

                    console.log(`📅 Weekly stats reset completed for ${result.modifiedCount} users`);

                    // Notify in log channels
                    const guilds = await GuildLevel.find({ enabled: true, 'settings.logChannel': { $ne: null } });
                    
                    for (const guildConfig of guilds) {
                        try {
                            const guild = this.client.guilds.cache.get(guildConfig.guildId);
                            if (!guild) continue;
                            
                            const logChannel = guild.channels.cache.get(guildConfig.settings.logChannel);
                            if (!logChannel) continue;

                            const resetEmbed = {
                                color: 0xf39c12,
                                title: '📅 Weekly Stats Reset',
                                description: 'Weekly XP and voice time statistics have been reset. Time to start fresh!',
                                timestamp: new Date()
                            };

                            await logChannel.send({ embeds: [resetEmbed] });

                        } catch (error) {
                            // Ignore individual guild errors
                        }
                    }

                } catch (error) {
                    console.error('Weekly stats reset error:', error);
                }
            }
        }, 60000); // Check every minute

        // Reset daily stats every day at 00:00 UTC
        setInterval(async () => {
            const now = new Date();
            
            if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
                try {
                    const result = await UserLevel.updateMany(
                        {},
                        { $set: { dailyXp: 0 } }
                    );

                    console.log(`🌅 Daily XP reset completed for ${result.modifiedCount} users`);

                } catch (error) {
                    console.error('Daily stats reset error:', error);
                }
            }
        }, 60000); // Check every minute

        // Reset monthly voice stats on the 1st of each month
        setInterval(async () => {
            const now = new Date();
            
            if (now.getUTCDate() === 1 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
                try {
                    const result = await UserLevel.updateMany(
                        {},
                        { $set: { 'voiceStats.monthlyVoiceMinutes': 0 } }
                    );

                    console.log(`📅 Monthly voice stats reset completed for ${result.modifiedCount} users`);

                } catch (error) {
                    console.error('Monthly stats reset error:', error);
                }
            }
        }, 60000); // Check every minute

        //console.log('📅 Stat reset schedulers initialized');
    }

    // ===== ERROR HANDLING =====
    handleError(error) {
        console.error('Discord client error in leveling handler:', error);
    }

    // ===== UTILITY METHODS =====
    async getSystemStats() {
        try {
            return {
                activeSessions: levelingController.voiceSessions.size,
                activeIntervals: levelingController.voiceXpIntervals.size,
                activeCooldowns: levelingController.cooldowns.size,
                totalUsers: await UserLevel.countDocuments({}),
                totalGuilds: await GuildLevel.countDocuments({ enabled: true })
            };
        } catch (error) {
            console.error('Error getting system stats:', error);
            return null;
        }
    }

    async emergencyCleanup() {
        try {
            console.log('🚨 Starting emergency cleanup...');

            // Clear all voice sessions and intervals
            for (const [sessionId, interval] of levelingController.voiceXpIntervals.entries()) {
                clearInterval(interval);
            }
            levelingController.voiceXpIntervals.clear();
            levelingController.voiceSessions.clear();

            // Clear cooldowns
            levelingController.cooldowns.clear();

            console.log('🧹 Emergency cleanup completed');

        } catch (error) {
            console.error('Emergency cleanup error:', error);
        }
    }

    // ===== SHUTDOWN HANDLING =====
    async shutdown() {
        console.log('📴 Shutting down leveling handler...');
        
        try {
            // Save any pending voice sessions
            for (const [sessionId, session] of levelingController.voiceSessions.entries()) {
                const [userId, guildId] = sessionId.split('_');
                const guild = this.client.guilds.cache.get(guildId);
                if (guild) {
                    const member = guild.members.cache.get(userId);
                    if (member) {
                        const guildConfig = await GuildLevel.findOne({ guildId });
                        if (guildConfig) {
                            await levelingController.handleVoiceLeave(member, guildConfig);
                        }
                    }
                }
            }

            await this.emergencyCleanup();
            console.log('✅ Leveling handler shutdown completed');

        } catch (error) {
            console.error('Shutdown error:', error);
        }
    }
}

module.exports = LevelingHandler;
