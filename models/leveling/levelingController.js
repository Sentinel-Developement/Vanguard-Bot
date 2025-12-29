// controllers/levelingController.js
const UserLevel = require('./userLevelSchema');
const GuildLevel = require('./guildLevelSchema');
const VoiceSession = require('./voiceSessionSchema');
const { EmbedBuilder } = require('discord.js');

class LevelingController {
    constructor() {
        this.cooldowns = new Map();
        this.voiceSessions = new Map();
        this.voiceXpIntervals = new Map();
        this.achievements = this.initializeAchievements();
    }

    initializeAchievements() {
        return [
            { id: 'first_level', name: 'Getting Started', description: 'Reach level 5', requirement: 5, type: 'levels' },
            { id: 'chatter', name: 'Chatterbox', description: 'Send 100 messages', requirement: 100, type: 'messages' },
            { id: 'dedicated', name: 'Dedicated Member', description: 'Reach level 10', requirement: 10, type: 'levels' },
            { id: 'active_voice', name: 'Voice Champion', description: 'Spend 60 minutes in voice', requirement: 60, type: 'voice_minutes' },
            { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day streak', requirement: 7, type: 'streak' },
            { id: 'veteran', name: 'Server Veteran', description: 'Reach level 25', requirement: 25, type: 'levels' },
            { id: 'social_butterfly', name: 'Social Butterfly', description: 'Send 1000 messages', requirement: 1000, type: 'messages' },
            { id: 'voice_lover', name: 'Voice Enthusiast', description: 'Spend 300 minutes in voice', requirement: 300, type: 'voice_minutes' }
        ];
    }

    // ===== USER INITIALIZATION =====
    async initializeUser(userId, guildId) {
        try {
            const existing = await UserLevel.findOne({ userId, guildId });
            if (existing) return existing;

            const newUser = new UserLevel({
                userId,
                guildId,
                xp: 0,
                level: 1,
                totalXp: 0,
                weeklyXp: 0,
                dailyXp: 0,
                messageCount: 0,
                lastXpGain: new Date(),
                prestige: 0,
                rankCard: {
                    background: null,
                    color: '#1e3a8a',
                    theme: 'default',
                    badge: null
                },
                voiceStats: {
                    totalMinutes: 0,
                    sessionsCount: 0,
                    voiceXp: 0,
                    longestSession: 0,
                    averageSessionLength: 0,
                    weeklyVoiceMinutes: 0,
                    monthlyVoiceMinutes: 0
                },
                achievements: [],
                streaks: {
                    daily: 0,
                    weekly: 0,
                    lastActive: new Date()
                }
            });

            return await newUser.save();
        } catch (error) {
            console.error('Error initializing user:', error);
            throw error;
        }
    }

    // ===== TEXT XP SYSTEM =====
    async gainTextXP(userId, guildId, message, client) {
        try {
            const guildConfig = await GuildLevel.findOne({ guildId });
            if (!guildConfig?.enabled) return null;

            // Check restrictions
            if (this.isRestricted(message, guildConfig)) return null;

            // Check cooldown
            const cooldownKey = `${userId}_${guildId}`;
            if (this.cooldowns.has(cooldownKey)) {
                const remaining = this.cooldowns.get(cooldownKey) - Date.now();
                if (remaining > 0) return null;
            }

            const user = await this.initializeUser(userId, guildId);
            
            // Calculate XP gain
            const baseXP = this.calculateBaseTextXP(message, guildConfig);
            const multiplier = await this.calculateTextMultiplier(message, guildConfig, user);
            const finalXP = Math.floor(baseXP * multiplier);

            // Apply cooldown
            this.cooldowns.set(cooldownKey, Date.now() + guildConfig.settings.xpCooldown);
            setTimeout(() => this.cooldowns.delete(cooldownKey), guildConfig.settings.xpCooldown);

            // Update user data
            const oldLevel = user.level;
            user.xp += finalXP;
            user.totalXp += finalXP;
            user.dailyXp += finalXP;
            user.weeklyXp += finalXP;
            user.messageCount += 1;
            user.lastXpGain = new Date();

            // Update streaks
            await this.updateStreaks(user);

            // Calculate new level
            const newLevel = this.calculateLevel(user.totalXp);
            const leveledUp = newLevel > oldLevel;

            if (leveledUp) {
                user.level = newLevel;
                await this.handleLevelUp(user, message, guildConfig, client);
            }

            // Check achievements
            await this.checkAchievements(user, guildConfig);

            await user.save();

            return {
                user,
                xpGained: finalXP,
                leveledUp,
                oldLevel,
                newLevel: user.level
            };

        } catch (error) {
            console.error('Error gaining text XP:', error);
            return null;
        }
    }

    calculateBaseTextXP(message, guildConfig) {
        const { min, max } = guildConfig.settings.xpRange;
        let baseXP = Math.floor(Math.random() * (max - min + 1)) + min;

        // Bonus for attachments
        if (message.attachments.size > 0) {
            baseXP = Math.floor(baseXP * guildConfig.settings.multipliers.attachment);
        }

        // Bonus for links
        if (/(https?:\/\/[^\s]+)/g.test(message.content)) {
            baseXP += Math.floor(baseXP * 0.2);
        }

        // Length bonus (for longer messages)
        const messageLength = message.content.length;
        if (messageLength > 50) {
            const lengthBonus = Math.min(messageLength / 100, 0.5); // Max 50% bonus
            baseXP = Math.floor(baseXP * (1 + lengthBonus));
        }

        return Math.max(baseXP, 1);
    }

    async calculateTextMultiplier(message, guildConfig, user) {
        let multiplier = guildConfig.settings.multipliers.text;

        // Weekend bonus
        const now = new Date();
        if (now.getDay() === 0 || now.getDay() === 6) {
            multiplier *= guildConfig.settings.multipliers.weekend;
        }

        // Server boost bonus
        if (message.member?.premiumSince) {
            multiplier *= guildConfig.settings.multipliers.boost;
        }

        // Role-based multipliers from level roles
        const memberRoles = message.member?.roles.cache;
        if (memberRoles) {
            for (const levelRole of guildConfig.levelRoles) {
                if (memberRoles.has(levelRole.roleId) && levelRole.rewards.xpBonus > 0) {
                    multiplier *= (1 + levelRole.rewards.xpBonus / 100);
                }
            }
        }

        // Daily streak bonus (up to 50% bonus for 10+ day streak)
        if (user.streaks.daily >= 3) {
            const streakBonus = Math.min(user.streaks.daily * 0.05, 0.5);
            multiplier *= (1 + streakBonus);
        }

        return Math.min(multiplier, 5.0); // Cap at 5x multiplier
    }

    // ===== VOICE XP SYSTEM =====
    async handleVoiceJoin(member, channel, guildConfig) {
        if (!guildConfig?.voiceSettings?.enabled) return;
        if (member.user.bot) return;

        const sessionId = `${member.id}_${member.guild.id}`;

        // Check if channel is ignored
        if (guildConfig.voiceSettings.ignoredChannels.includes(channel.id)) return;

        // Check if it's AFK channel and AFK XP is disabled
        if (channel.id === member.guild.afkChannelId && !guildConfig.voiceSettings.afkChannelXp) return;

        // Create voice session
        const session = {
            userId: member.id,
            guildId: member.guild.id,
            channelId: channel.id,
            startTime: new Date(),
            xpEarned: 0,
            participants: this.getChannelParticipants(channel)
        };

        this.voiceSessions.set(sessionId, session);

        // Start XP interval (award XP every minute)
        const interval = setInterval(async () => {
            await this.awardVoiceXP(member, channel, guildConfig, session);
        }, 60000); // Every minute

        this.voiceXpIntervals.set(sessionId, interval);

        //console.log(`🎤 ${member.user.tag} joined voice channel: ${channel.name}`);
    }

    async handleVoiceLeave(member, guildConfig) {
        const sessionId = `${member.id}_${member.guild.id}`;
        const session = this.voiceSessions.get(sessionId);

        if (!session) return;

        // Clear interval
        const interval = this.voiceXpIntervals.get(sessionId);
        if (interval) {
            clearInterval(interval);
            this.voiceXpIntervals.delete(sessionId);
        }

        // Calculate session duration
        const endTime = new Date();
        const duration = endTime - session.startTime;

        // Only save if meets minimum session length
        if (duration >= guildConfig.voiceSettings.minSessionLength) {
            await this.saveVoiceSession(session, endTime, duration);
        }

        this.voiceSessions.delete(sessionId);
        //console.log(`🎤 ${member.user.tag} left voice channel after ${Math.round(duration / 1000 / 60)} minutes`);
    }

    async awardVoiceXP(member, channel, guildConfig, session) {
        try {
            if (!member.voice || !member.voice.channel) return;

            const user = await this.initializeUser(member.id, member.guild.id);
            const voiceState = member.voice;

            // Check if user should receive XP
            const isAFK = voiceState.selfDeaf || voiceState.serverDeaf;
            const isMuted = voiceState.selfMute || voiceState.serverMute;

            // Base XP per minute
            let xpGain = guildConfig.voiceSettings.xpPerMinute;

            // Apply multipliers
            const multipliers = guildConfig.voiceSettings.multipliers;

            // Activity bonuses
            if (voiceState.streaming) {
                xpGain *= multipliers.streaming;
            }
            if (voiceState.selfVideo) {
                xpGain *= multipliers.camera;
            }

            // Multiple users bonus
            const activeMembers = channel.members.filter(m => 
                !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf
            );

            if (activeMembers.size >= 2) {
                xpGain *= multipliers.multipleUsers;
            } else if (!guildConfig.voiceSettings.soloChannelXp) {
                return; // No XP for solo channels if disabled
            }

            // Channel-specific bonuses
            const bonusChannel = guildConfig.voiceSettings.bonusChannels.find(
                bc => bc.channelId === channel.id
            );
            if (bonusChannel) {
                xpGain *= bonusChannel.multiplier;
            }

            // Apply penalties
            if (isAFK) xpGain *= 0.1; // Heavy penalty for AFK
            if (isMuted) xpGain *= 0.7; // Light penalty for muted

            // Weekend bonus
            const now = new Date();
            if (now.getDay() === 0 || now.getDay() === 6) {
                xpGain *= guildConfig.settings.multipliers.weekend;
            }

            // Server boost bonus
            if (member.premiumSince) {
                xpGain *= guildConfig.settings.multipliers.boost;
            }

            xpGain = Math.floor(xpGain);
            if (xpGain <= 0) return;

            // Check session XP limit
            if (session.xpEarned + xpGain > guildConfig.voiceSettings.maxSessionXp) {
                xpGain = Math.max(0, guildConfig.voiceSettings.maxSessionXp - session.xpEarned);
            }

            if (xpGain <= 0) return;

            // Update user XP
            const oldLevel = user.level;
            user.xp += xpGain;
            user.totalXp += xpGain;
            user.voiceStats.voiceXp += xpGain;
            user.voiceStats.totalMinutes += 1;
            user.voiceStats.weeklyVoiceMinutes += 1;
            user.voiceStats.monthlyVoiceMinutes += 1;

            // Calculate new level
            const newLevel = this.calculateLevel(user.totalXp);
            const leveledUp = newLevel > oldLevel;

            if (leveledUp) {
                user.level = newLevel;
                await this.handleLevelUp(user, {
                    guild: member.guild,
                    author: member.user,
                    channel: channel,
                    member: member
                }, guildConfig, member.client);
            }

            // Check achievements
            await this.checkAchievements(user, guildConfig);

            await user.save();

            // Update session tracking
            session.xpEarned += xpGain;
            session.wasAFK = isAFK;
            session.wasMuted = isMuted;
            session.wasDeafened = voiceState.serverDeaf;

        } catch (error) {
            console.error('Voice XP error:', error);
        }
    }

    async saveVoiceSession(session, endTime, duration) {
        try {
            const voiceSession = new VoiceSession({
                ...session,
                endTime,
                duration
            });

            await voiceSession.save();

            // Update user voice stats
            const user = await UserLevel.findOne({
                userId: session.userId,
                guildId: session.guildId
            });

            if (user) {
                user.voiceStats.sessionsCount += 1;
                const sessionMinutes = Math.floor(duration / 1000 / 60);

                // Update longest session
                if (sessionMinutes > user.voiceStats.longestSession) {
                    user.voiceStats.longestSession = sessionMinutes;
                }

                // Recalculate average session length
                if (user.voiceStats.sessionsCount > 0) {
                    user.voiceStats.averageSessionLength = Math.floor(
                        user.voiceStats.totalMinutes / user.voiceStats.sessionsCount
                    );
                }

                await user.save();
            }

        } catch (error) {
            console.error('Error saving voice session:', error);
        }
    }

    // ===== LEVEL CALCULATION =====
    calculateLevel(totalXp) {
        // Progressive formula: level = sqrt(totalXp / 100)
        return Math.floor(Math.sqrt(totalXp / 100)) + 1;
    }

    calculateXPForLevel(level) {
        // Inverse: totalXp = (level - 1)² * 100
        return Math.pow(level - 1, 2) * 100;
    }

    getXPForNextLevel(currentLevel) {
        return this.calculateXPForLevel(currentLevel + 1);
    }

    getCurrentLevelProgress(user) {
        const currentLevelXp = this.calculateXPForLevel(user.level);
        const nextLevelXp = this.calculateXPForLevel(user.level + 1);
        const progressXp = user.totalXp - currentLevelXp;
        const neededXp = nextLevelXp - currentLevelXp;

        return {
            currentXp: progressXp,
            requiredXp: neededXp,
            percentage: (progressXp / neededXp) * 100
        };
    }

    // ===== LEVEL UP HANDLING =====
    async handleLevelUp(user, messageContext, guildConfig, client) {
        try {
            // Assign level roles
            await this.assignLevelRoles(user, messageContext, guildConfig);

            // Send level up message
            await this.sendLevelUpMessage(user, messageContext, guildConfig);

            // Check for milestone rewards
            await this.checkMilestoneRewards(user, guildConfig);

        } catch (error) {
            console.error('Error handling level up:', error);
        }
    }

    async assignLevelRoles(user, messageContext, guildConfig) {
        try {
            if (!messageContext.member) return;

            const applicableRoles = guildConfig.levelRoles.filter(lr => lr.level === user.level);

            for (const levelRole of applicableRoles) {
                const role = messageContext.guild.roles.cache.get(levelRole.roleId);
                if (!role) continue;

                if (levelRole.action === 'replace') {
                    // Remove previous level roles
                    const previousRoles = guildConfig.levelRoles
                        .filter(lr => lr.level < user.level && lr.action === 'replace')
                        .map(lr => lr.roleId);

                    for (const prevRoleId of previousRoles) {
                        if (messageContext.member.roles.cache.has(prevRoleId)) {
                            await messageContext.member.roles.remove(prevRoleId);
                        }
                    }
                }

                if (!messageContext.member.roles.cache.has(levelRole.roleId)) {
                    await messageContext.member.roles.add(role);
                }
            }
        } catch (error) {
            console.error('Error assigning level roles:', error);
        }
    }

    async sendLevelUpMessage(user, messageContext, guildConfig) {
        try {
            const channel = guildConfig.settings.logChannel
                ? messageContext.guild.channels.cache.get(guildConfig.settings.logChannel)
                : messageContext.channel;

            if (!channel) return;

            let levelUpMessage = guildConfig.settings.levelUpMessage
                .replace('{user}', `<@${user.userId}>`)
                .replace('{level}', user.level.toString())
                .replace('{xp}', user.totalXp.toLocaleString());

            const progress = this.getCurrentLevelProgress(user);
            const nextLevelXp = this.getXPForNextLevel(user.level);

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🎉 Level Up!')
                .setDescription(levelUpMessage)
                .addFields([
                    { name: '📊 Current Level', value: user.level.toString(), inline: true },
                    { name: '💫 Total XP', value: user.totalXp.toLocaleString(), inline: true },
                    { name: '📈 Next Level', value: `${(nextLevelXp - user.totalXp).toLocaleString()} XP`, inline: true },
                    { name: '🎤 Voice XP', value: user.voiceStats.voiceXp.toLocaleString(), inline: true },
                    { name: '💬 Messages', value: user.messageCount.toLocaleString(), inline: true },
                    { name: '🔥 Daily Streak', value: user.streaks.daily.toString(), inline: true }
                ])
                .setThumbnail(messageContext.author?.displayAvatarURL?.({ dynamic: true }) || null)
                .setTimestamp();

            await channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error sending level up message:', error);
        }
    }

    // ===== ACHIEVEMENTS SYSTEM =====
    async checkAchievements(user, guildConfig) {
        try {
            const newAchievements = [];

            for (const achievement of this.achievements) {
                // Skip if already unlocked
                if (user.achievements.some(ua => ua.id === achievement.id)) continue;

                let progress = 0;
                let unlocked = false;

                switch (achievement.type) {
                    case 'levels':
                        progress = user.level;
                        unlocked = user.level >= achievement.requirement;
                        break;
                    case 'messages':
                        progress = user.messageCount;
                        unlocked = user.messageCount >= achievement.requirement;
                        break;
                    case 'voice_minutes':
                        progress = user.voiceStats.totalMinutes;
                        unlocked = user.voiceStats.totalMinutes >= achievement.requirement;
                        break;
                    case 'streak':
                        progress = user.streaks.daily;
                        unlocked = user.streaks.daily >= achievement.requirement;
                        break;
                }

                if (unlocked) {
                    user.achievements.push({
                        id: achievement.id,
                        unlockedAt: new Date(),
                        progress: achievement.requirement
                    });
                    newAchievements.push(achievement);
                } else {
                    // Update progress for partially completed achievements
                    const existingAchievement = user.achievements.find(ua => ua.id === achievement.id);
                    if (existingAchievement) {
                        existingAchievement.progress = progress;
                    }
                }
            }

            // Notify about new achievements (could be expanded)
            if (newAchievements.length > 0) {
                console.log(`🏆 User ${user.userId} unlocked ${newAchievements.length} achievements`);
            }

        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    // ===== STREAK SYSTEM =====
    async updateStreaks(user) {
        const now = new Date();
        const lastActive = new Date(user.streaks.lastActive);
        const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Same day, no change
            return;
        } else if (daysDiff === 1) {
            // Next day, increment streak
            user.streaks.daily += 1;
        } else {
            // Gap in activity, reset streak
            user.streaks.daily = 1;
        }

        user.streaks.lastActive = now;

        // Weekly streak logic
        const weeksDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24 * 7));
        if (weeksDiff >= 1) {
            user.streaks.weekly = user.streaks.daily >= 7 ? user.streaks.weekly + 1 : 0;
        }
    }

    // ===== UTILITY METHODS =====
    isRestricted(message, guildConfig) {
        const restrictions = guildConfig.settings.restrictions;

        // Check ignored channels
        if (restrictions.ignoredChannels.includes(message.channel.id)) return true;

        // Check allowed channels (if specified)
        if (restrictions.allowedChannels.length > 0 && 
            !restrictions.allowedChannels.includes(message.channel.id)) return true;

        // Check ignored roles
        if (message.member?.roles.cache.some(role => 
            restrictions.ignoredRoles.includes(role.id))) return true;

        // Check bot messages
        if (message.author.bot && !restrictions.botMessages) return true;

        return false;
    }

    getChannelParticipants(channel) {
        return channel.members
            .filter(member => !member.user.bot)
            .map(member => member.id);
    }

    // ===== LEADERBOARD METHODS =====
    async getLeaderboard(guildId, type = 'xp', page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            let sortField, query = { guildId };

            switch (type) {
                case 'weekly':
                    sortField = { weeklyXp: -1, totalXp: -1 };
                    break;
                case 'voice_time':
                    sortField = { 'voiceStats.totalMinutes': -1 };
                    query['voiceStats.totalMinutes'] = { $gt: 0 };
                    break;
                case 'voice_xp':
                    sortField = { 'voiceStats.voiceXp': -1 };
                    query['voiceStats.voiceXp'] = { $gt: 0 };
                    break;
                case 'voice_sessions':
                    sortField = { 'voiceStats.sessionsCount': -1 };
                    query['voiceStats.sessionsCount'] = { $gt: 0 };
                    break;
                case 'messages':
                    sortField = { messageCount: -1 };
                    query.messageCount = { $gt: 0 };
                    break;
                case 'streak':
                    sortField = { 'streaks.daily': -1, totalXp: -1 };
                    query['streaks.daily'] = { $gt: 0 };
                    break;
                default: // 'xp'
                    sortField = { totalXp: -1, level: -1 };
            }

            return await UserLevel.find(query)
                .sort(sortField)
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }

    async getUserRank(userId, guildId) {
        try {
            const user = await UserLevel.findOne({ userId, guildId });
            if (!user) return null;

            const rank = await UserLevel.countDocuments({
                guildId,
                totalXp: { $gt: user.totalXp }
            }) + 1;

            return { ...user.toObject(), rank };
        } catch (error) {
            console.error('Error getting user rank:', error);
            return null;
        }
    }

    // ===== ADMIN METHODS =====
    async setUserXP(userId, guildId, amount) {
        const user = await this.initializeUser(userId, guildId);
        user.totalXp = Math.max(0, amount);
        user.xp = user.totalXp;
        user.level = this.calculateLevel(user.totalXp);
        return await user.save();
    }

    async addUserXP(userId, guildId, amount) {
        const user = await this.initializeUser(userId, guildId);
        user.totalXp += amount;
        user.xp += amount;
        user.level = this.calculateLevel(user.totalXp);
        return await user.save();
    }

    async removeUserXP(userId, guildId, amount) {
        const user = await this.initializeUser(userId, guildId);
        user.totalXp = Math.max(0, user.totalXp - amount);
        user.xp = Math.max(0, user.xp - amount);
        user.level = this.calculateLevel(user.totalXp);
        return await user.save();
    }

    async setUserLevel(userId, guildId, level) {
        const user = await this.initializeUser(userId, guildId);
        const requiredXP = this.calculateXPForLevel(level);
        user.level = level;
        user.totalXp = requiredXP;
        user.xp = requiredXP;
        return await user.save();
    }

    async resetUserData(userId, guildId, type = 'all') {
        const user = await UserLevel.findOne({ userId, guildId });
        if (!user) return null;

        switch (type) {
            case 'all':
                return await UserLevel.deleteOne({ userId, guildId });
            case 'xp':
                user.xp = 0;
                user.totalXp = 0;
                user.level = 1;
                user.weeklyXp = 0;
                user.dailyXp = 0;
                break;
            case 'voice':
                user.voiceStats = {
                    totalMinutes: 0,
                    sessionsCount: 0,
                    voiceXp: 0,
                    longestSession: 0,
                    averageSessionLength: 0,
                    weeklyVoiceMinutes: 0,
                    monthlyVoiceMinutes: 0
                };
                break;
            case 'weekly':
                user.weeklyXp = 0;
                user.voiceStats.weeklyVoiceMinutes = 0;
                break;
        }

        return await user.save();
    }

    // ===== CLEANUP METHODS =====
    async resetWeeklyStats(guildId) {
        return await UserLevel.updateMany(
            { guildId },
            { $set: { weeklyXp: 0, 'voiceStats.weeklyVoiceMinutes': 0 } }
        );
    }

    async cleanupInactiveUsers(guildId, days = 90) {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return await UserLevel.deleteMany({
            guildId,
            lastXpGain: { $lt: cutoffDate },
            totalXp: { $lt: 100 }
        });
    }

    async checkMilestoneRewards(user, guildConfig) {
        // Implementation for milestone rewards
        try {
            const milestones = guildConfig.rewards?.milestones || [];
            for (const milestone of milestones) {
                if (milestone.level === user.level) {
                    console.log(`🎁 User ${user.userId} reached milestone level ${milestone.level}`);
                    // Add milestone reward logic here
                }
            }
        } catch (error) {
            console.error('Error checking milestone rewards:', error);
        }
    }
}

module.exports = new LevelingController();
