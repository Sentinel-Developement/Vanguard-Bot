const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const AntiConfig = require('../models/antiSystem/AntiConfig');
const UserViolation = require('../models/antiSystem/UserViolation');
const ThreatScore = require('../models/antiSystem/ThreatScore');
const aiManager = require('../utils/AIManager');

class AntiSpamModule {
    constructor(client) {
        this.client = client;
        this.spamTracking = new Map();
        this.rateLimiter = new Map();
        
        //console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAI Anti-Spam System Active ✅\x1b[0m');
        this.initialize();
    }
    
    initialize() {
        this.client.on('messageCreate', async (message) => {
            if (!message.guild || message.author.bot) return;
            await this.handleMessage(message);
        });
        
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    async handleMessage(message) {
        try {
            const config = await AntiConfig.findOne({ guildId: message.guild.id });
            if (!config?.antiSpam?.enabled) return;
            
            if (await this.isWhitelisted(message.author, message.channel, config)) return;
            
            const userId = message.author.id;
            const guildId = message.guild.id;
            
            if (this.isRateLimited(userId)) return;
            
            this.trackMessage(userId, message);
            
            let threatScore = await ThreatScore.findOne({ userId, guildId });
            if (!threatScore) {
                threatScore = new ThreatScore({ userId, guildId });
            }
            
            const violations = await this.detectViolations(message, config, threatScore);
            
            if (violations.length > 0) {
                await this.handleViolations(message, violations, config, threatScore);
            }
            
        } catch (error) {
            console.error('Anti-spam error:', error);
        }
    }
    
    trackMessage(userId, message) {
        const now = Date.now();
        if (!this.spamTracking.has(userId)) {
            this.spamTracking.set(userId, { messages: [], lastReset: now });
        }
        
        const userData = this.spamTracking.get(userId);
        userData.messages.push({
            content: message.content,
            timestamp: now,
            channelId: message.channel.id
        });
        
        userData.messages = userData.messages.filter(msg => now - msg.timestamp < 30000);
    }
    
    // ✅ FIXED: Proper violation detection with corrected regex
    async detectViolations(message, config, threatScore) {
        const violations = [];
        const userId = message.author.id;
        const userData = this.spamTracking.get(userId);
        
        // 1. Message Frequency Check
        const recentMessages = userData.messages.filter(
            msg => Date.now() - msg.timestamp < config.antiSpam.timeWindow
        );
        
        if (recentMessages.length > config.antiSpam.messageLimit) {
            violations.push({
                type: 'spam',
                severity: 'medium',
                description: `${recentMessages.length} messages in ${config.antiSpam.timeWindow/1000}s`,
                confidence: 0.9
            });
        }
        
        // 2. Duplicate Message Check
        const duplicates = recentMessages.filter(msg => 
            this.similarity(msg.content, message.content) > 0.8
        );
        
        if (duplicates.length >= config.antiSpam.duplicateThreshold) {
            violations.push({
                type: 'spam',
                severity: 'high',
                description: 'Duplicate/similar messages detected',
                confidence: 0.95
            });
        }
        
        // 3. Mention Spam Check
        const mentions = (message.content.match(/<@[!&]?\d+>/g) || []).length;
        if (mentions > config.antiSpam.mentionLimit) {
            violations.push({
                type: 'mention_spam',
                severity: 'high',
                description: `Excessive mentions: ${mentions}`,
                confidence: 0.9
            });
        }
        
        // 4. Emoji Spam Check - ✅ FIXED REGEX
        const emojiRegex = /<:\w+:\d+>|[\u{1f600}-\u{1f64f}]|[\u{1f300}-\u{1f5ff}]|[\u{1f680}-\u{1f6ff}]|[\u{1f1e0}-\u{1f1ff}]/gu;
        const emojis = (message.content.match(emojiRegex) || []).length;
        if (emojis > config.antiSpam.emojiLimit) {
            violations.push({
                type: 'emoji_spam',
                severity: 'medium',
                description: `Excessive emojis: ${emojis}`,
                confidence: 0.8
            });
        }
        
        // 5. Caps Lock Check
        if (config.antiSpam.capsPunishment && message.content.length > 10) {
            const capsPercentage = (message.content.match(/[A-Z]/g) || []).length / message.content.length * 100;
            if (capsPercentage >= config.antiSpam.capsPercentage) {
                violations.push({
                    type: 'caps',
                    severity: 'low',
                    description: `Excessive caps: ${capsPercentage.toFixed(1)}%`,
                    confidence: 0.8
                });
            }
        }
        
        // 6. Blocked Words Check
        const lowerContent = message.content.toLowerCase();
        const blockedWord = config.antiSpam.blockedWords.find(word => 
            lowerContent.includes(word.toLowerCase())
        );
        
        if (blockedWord) {
            violations.push({
                type: 'blocked_word',
                severity: 'medium',
                description: `Contains blocked word: ${blockedWord}`,
                confidence: 1.0
            });
        }
        
        // ✅ 7. BALANCED AI Analysis - Still triggers but smarter
        if (config.aiEnabled && this.shouldTriggerAI(message, threatScore, violations)) {
            try {
                const aiResult = await aiManager.analyzeSpam(message, {
                    guildName: message.guild.name,
                    channelName: message.channel.name,
                    existingViolations: violations.map(v => v.type).join(', '),
                    memberJoinDate: message.member?.joinedAt?.toISOString() || 'Unknown',
                    accountAge: new Date() - message.author.createdAt,
                    isNormalChat: this.isNormalConversation(message.content),
                    isCommand: this.isCommand(message.content)
                });
                
                // ✅ Reasonable confidence threshold
                const requiredConfidence = this.isNormalConversation(message.content) ? 0.8 : config.aiConfidenceThreshold;
                
                if (aiResult.success && aiResult.isSpam && aiResult.confidence >= requiredConfidence) {
                    violations.push({
                        type: 'suspicious_behavior',
                        severity: aiResult.severity,
                        description: aiResult.reasoning,
                        confidence: aiResult.confidence,
                        aiGenerated: true
                    });
                }
            } catch (aiError) {
                console.error('AI analysis failed:', aiError.message);
            }
        }
        
        return violations;
    }
    
    // ✅ FIXED: Smart AI triggering - balanced approach
    shouldTriggerAI(message, threatScore, violations) {
        const content = message.content;
        
        // For normal conversation - trigger AI if there are violations or moderate threat score
        if (this.isNormalConversation(content)) {
            return violations.length > 0 || threatScore.currentScore >= 50;
        }
        
        // For commands - only if serious violations
        if (this.isCommand(content)) {
            return violations.some(v => v.severity === 'high' || v.severity === 'critical');
        }
        
        // For other messages - balanced approach
        return threatScore.currentScore >= 40 || 
               violations.length >= 1 || 
               violations.some(v => v.severity === 'high' || v.severity === 'critical');
    }
    
    // ✅ FIXED: Proper normal conversation detection
    isNormalConversation(content) {
        if (!content || content.length > 80) return false;
        
        const normalPatterns = [
            /^(hi|hello|hey|sup|what's up|how are you|good morning|good night|gm|gn)$/i,
            /^(thanks|thank you|ty|thx|appreciated)$/i,
            /^(yes|no|ok|okay|sure|alright|maybe|yep|nope)$/i,
            /^(lol|haha|hehe|xd|lmao|rofl|lmfao)$/i,
            /^(good|nice|cool|awesome|great|amazing|wow)$/i,
            /^(bye|goodbye|see you|cya|ttyl|gotta go)$/i,
            /^(sorry|my bad|oops|mb|apologize)$/i,
            /^(welcome|congrats|congratulations|well done)$/i,
            /^[a-zA-Z\s]{1,50}$/i
        ];
        
        const trimmed = content.trim().toLowerCase();
        return normalPatterns.some(pattern => pattern.test(trimmed));
    }
    
    // ✅ FIXED: Proper command detection with corrected regex
    isCommand(content) {
        if (!content) return false;
        
        const commandPatterns = [
            /^[!.\/]/, // Starts with !, ., or /
            /^<@!?\d+>/, // Bot mentions at start
            /``````/, // Code blocks
            /`[^`]+`/, // Inline code
            /\b(function|const|let|var|if|else|for|while|class|import|export|require)\b/i,
            /\b(console\.log|print|echo|printf)\b/i
        ];
        
        return commandPatterns.some(pattern => pattern.test(content));
    }
    
    // ✅ KEEP: Ban and quarantine system as requested
    async handleViolations(message, violations, config, threatScore) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        const severityScores = { low: 10, medium: 25, high: 50, critical: 100 };
        const totalSeverity = violations.reduce((sum, v) => sum + severityScores[v.severity], 0);
        
        threatScore.currentScore = Math.min(100, threatScore.currentScore + totalSeverity);
        threatScore.spamScore = Math.min(100, threatScore.spamScore + totalSeverity);
        threatScore.lastActivity = new Date();
        
        let action = 'warn';
        let duration = null;
        
        const recentViolations = await UserViolation.countDocuments({
            userId,
            guildId,
            violatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        // ✅ KEEP: Ban and quarantine system
        if (threatScore.currentScore >= 80 || recentViolations >= 5) {
            action = 'quarantine';
            duration = config.punishmentSystem.quarantineDuration;
        } else if (threatScore.currentScore >= 60 || recentViolations >= 3) {
            action = 'timeout';
            duration = config.punishmentSystem.timeoutDuration;
        } else if (threatScore.currentScore >= 40 || recentViolations >= 2) {
            action = 'timeout';
            duration = config.punishmentSystem.timeoutDuration / 2;
        }
        
        await this.executeAction(message, action, duration, violations, config);
        
        const violation = new UserViolation({
            userId,
            guildId,
            violationType: violations[0].type,
            severity: violations[0].severity,
            content: message.content,
            channelId: message.channel.id,
            aiAnalysis: {
                confidence: violations.find(v => v.aiGenerated)?.confidence || 0,
                reasoning: violations.find(v => v.aiGenerated)?.description || 'Manual detection',
                threatScore: threatScore.currentScore
            },
            actionTaken: action,
            actionDuration: duration,
            warningCount: recentViolations + 1
        });
        
        await violation.save();
        await threatScore.save();
        
        await this.logViolation(message, violations, action, duration, config, threatScore);
    }
    
    async executeAction(message, action, duration, violations, config) {
        const member = message.guild.members.cache.get(message.author.id);
        if (!member) return;
        
        try {
            await message.delete().catch(() => {});
            
            switch (action) {
                case 'warn':
                    await message.channel.send(
                        `⚠️ ${message.author}, please avoid spamming. Warning issued for: ${violations[0].description}`
                    ).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
                    break;
                    
                case 'timeout':
                    await member.timeout(duration, `Anti-spam: ${violations[0].description}`);
                    await message.channel.send(
                        `🔇 ${message.author} has been timed out for ${duration/1000}s for spamming.`
                    ).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
                    break;
                    
                case 'quarantine':
                    if (config.punishmentSystem.useQuarantine) {
                        await this.quarantineUser(member, violations, config);
                    } else {
                        await member.ban({ reason: `Anti-spam: ${violations[0].description}` });
                    }
                    break;
            }
            
        } catch (error) {
            console.error('Action execution error:', error);
        }
    }
    
    async quarantineUser(member, violations, config) {
        const QuarantineConfig = require('../models/qurantine/quarantineConfig');
        const UserQuarantine = require('../models/qurantine/userQuarantine');
        
        const quarantineConfig = await QuarantineConfig.findOne({ guildId: member.guild.id });
        if (!quarantineConfig?.quarantineEnabled) {
            await member.ban({ reason: `Anti-spam: ${violations[0].description}` });
            return;
        }
        
        const quarantineRole = member.guild.roles.cache.get(quarantineConfig.quarantineRoleId);
        if (!quarantineRole) return;
        
        const userRoles = member.roles.cache.map(role => role.id);
        await member.roles.set([quarantineRole]);
        
        await UserQuarantine.findOneAndUpdate(
            { userId: member.id, guildId: member.guild.id },
            { 
                isQuarantined: true, 
                quarantinedAt: new Date(),
                reason: `Anti-spam violation: ${violations[0].description}`
            },
            { upsert: true }
        );
        
        quarantineConfig.userRoles.set(member.id, userRoles);
        await quarantineConfig.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 You Have Been Quarantined')
            .setDescription(`You have been quarantined in **${member.guild.name}** for spam violations.`)
            .addFields(
                { name: 'Reason', value: violations[0].description },
                { name: 'Duration', value: 'Until reviewed by staff' }
            )
            .setColor('#ff0000')
            .setTimestamp();
        
        try {
            await member.send({ embeds: [embed] });
        } catch (error) {
            console.log(`Failed to send DM to ${member.user.tag}`);
        }
    }
    
    async logViolation(message, violations, action, duration, config, threatScore) {
        const logChannel = this.client.channels.cache.get(config.logChannelId);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Anti-Spam Detection')
            .setColor(action === 'quarantine' ? '#ff0000' : action === 'timeout' ? '#ff6600' : '#ffff00')
            .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Action Taken', value: action.toUpperCase(), inline: true },
                { name: 'Threat Score', value: `${threatScore.currentScore}/100`, inline: true },
                { name: 'Violations', value: violations.map(v => `• ${v.type}: ${v.description}`).join('\n').slice(0, 1024), inline: false }
            )
            .setDescription(`Message: ${message.content.slice(0, 500)}`)
            .setTimestamp();
        
        if (duration) {
            embed.addFields({ name: 'Duration', value: `${duration/1000}s`, inline: true });
        }
        
        await logChannel.send({ embeds: [embed] });
        
        if (threatScore.currentScore >= 70 && config.alertChannelId !== config.logChannelId) {
            const alertChannel = this.client.channels.cache.get(config.alertChannelId);
            if (alertChannel) {
                const alertEmbed = new EmbedBuilder()
                    .setTitle('🚨 HIGH THREAT DETECTED')
                    .setColor('#ff0000')
                    .setDescription(`User ${message.author.tag} has reached threat score ${threatScore.currentScore}/100`)
                    .addFields(
                        { name: 'Action Required', value: 'Manual review recommended', inline: true },
                        { name: 'Auto Action', value: action.toUpperCase(), inline: true }
                    );
                
                await alertChannel.send({ embeds: [alertEmbed] });
            }
        }
    }
    
    isRateLimited(userId) {
        const now = Date.now();
        const userLimit = this.rateLimiter.get(userId);
        
        if (!userLimit || now > userLimit.resetTime) {
            this.rateLimiter.set(userId, { count: 1, resetTime: now + 1000 });
            return false;
        }
        
        if (userLimit.count >= 10) {
            return true;
        }
        
        userLimit.count++;
        return false;
    }
    
    async isWhitelisted(user, channel, config) {
        const member = channel.guild.members.cache.get(user.id);
        if (!member) return false;
        
        if (user.id === channel.guild.ownerId) return true;
        if (config.whitelist.owners.includes(user.id)) return true;
        if (config.whitelist.customMembers.includes(user.id)) return true;
        if (config.whitelist.customChannels.includes(channel.id)) return true;
        if (config.antiSpam.whitelistedChannels.includes(channel.id)) return true;
        
        const hasWhitelistedRole = member.roles.cache.some(role => 
            config.whitelist.customRoles.includes(role.id)
        );
        if (hasWhitelistedRole) return true;
        
        return false;
    }
    
    // ✅ FIXED: Corrected similarity calculation
    similarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    // ✅ FIXED: Proper matrix initialization
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1);
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = Array(str1.length + 1).fill(0);
        }
        
        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    cleanup() {
        const now = Date.now();
        
        for (const [userId, userData] of this.spamTracking.entries()) {
            userData.messages = userData.messages.filter(msg => now - msg.timestamp < 30000);
            if (userData.messages.length === 0) {
                this.spamTracking.delete(userId);
            }
        }
        
        for (const [userId, userLimit] of this.rateLimiter.entries()) {
            if (now > userLimit.resetTime) {
                this.rateLimiter.delete(userId);
            }
        }
    }
}

module.exports = AntiSpamModule;
