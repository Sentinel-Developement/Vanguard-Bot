// antiModules/antiLink.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const AntiConfig = require('../models/antiSystem/AntiConfig');
const UserViolation = require('../models/antiSystem/UserViolation');
const ThreatScore = require('../models/antiSystem/ThreatScore');
const aiManager = require('../utils/AIManager');

class AntiLinkModule {
    constructor(client) {
        this.client = client;
        this.linkCache = new Map();
        this.urlShorteners = [
            'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.link',
            'tiny.one', 'rb.gy', 'cutt.ly', 'is.gd', 'v.gd', 'x.co'
        ];
        
        //console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAI Anti-Link System Active ✅\x1b[0m');
        this.initialize();
    }
    
    initialize() {
        this.client.on('messageCreate', async (message) => {
            if (!message.guild || message.author.bot) return;
            await this.handleMessage(message);
        });
        
        setInterval(() => this.cleanup(), 10 * 60 * 1000);
    }
    
    async handleMessage(message) {
        try {
            const config = await AntiConfig.findOne({ guildId: message.guild.id });
            if (!config?.antiLink?.enabled) return;
            
            if (await this.isWhitelisted(message.author, message.channel, config)) return;
            
            const links = this.extractLinks(message.content);
            if (links.length === 0) return;
            
            const violations = await this.analyzeLinks(links, message, config);
            
            if (violations.length > 0) {
                await this.handleViolations(message, violations, config);
            }
            
        } catch (error) {
            console.error('Anti-link error:', error);
        }
    }
    
    extractLinks(content) {
        const urlRegex = /https?:\/\/[^\s<>"{}|\\/^`[\]]+/gi;
        const matches = content.match(urlRegex) || [];
        
        return matches.map(url => {
            try {
                const urlObj = new URL(url);
                return {
                    original: url,
                    hostname: urlObj.hostname.toLowerCase(),
                    path: urlObj.pathname,
                    protocol: urlObj.protocol
                };
            } catch (e) {
                return {
                    original: url,
                    hostname: url.toLowerCase(),
                    path: '',
                    protocol: 'unknown'
                };
            }
        });
    }
    
    async analyzeLinks(links, message, config) {
        const violations = [];
        
        for (const link of links) {
            // 1. Check blocked domains
            if (this.isDomainBlocked(link.hostname, config.antiLink.blockedDomains)) {
                violations.push({
                    type: 'blocked_domain',
                    severity: 'high',
                    description: `Blocked domain: ${link.hostname}`,
                    confidence: 1.0,
                    url: link.original
                });
                continue;
            }
            
            // 2. Check if domain is explicitly allowed
            if (config.antiLink.mode === 'custom' && 
                this.isDomainAllowed(link.hostname, config.antiLink.allowedDomains)) {
                continue; // Skip further checks for allowed domains
            }
            
            // 3. Check for IP-based links
            if (config.antiLink.ipLinkProtection && this.isIPLink(link.hostname)) {
                violations.push({
                    type: 'ip_link',
                    severity: 'high',
                    description: `IP-based link detected: ${link.hostname}`,
                    confidence: 0.9,
                    url: link.original
                });
                continue;
            }
            
            // 4. Check for URL shorteners
            if (config.antiLink.shortenerProtection && this.isUrlShortener(link.hostname)) {
                violations.push({
                    type: 'url_shortener',
                    severity: 'medium',
                    description: `URL shortener detected: ${link.hostname}`,
                    confidence: 0.8,
                    url: link.original
                });
                continue;
            }
            
            // 5. Strict mode - block all links except whitelisted
            if (config.antiLink.mode === 'strict' && 
                !this.isDomainAllowed(link.hostname, config.antiLink.allowedDomains)) {
                violations.push({
                    type: 'unauthorized_link',
                    severity: 'medium',
                    description: `Unauthorized link in strict mode: ${link.hostname}`,
                    confidence: 0.7,
                    url: link.original
                });
                continue;
            }
            
            // 6. AI Analysis for suspicious links
            if (config.aiEnabled && config.antiLink.mode === 'moderate') {
                try {
                    const aiResult = await this.analyzeWithAI(link, message, config);
                    
                    if (aiResult.success && aiResult.isMalicious && 
                        aiResult.confidence >= config.aiConfidenceThreshold) {
                        violations.push({
                            type: 'suspicious_link',
                            severity: aiResult.riskLevel === 'critical' ? 'critical' : 'high',
                            description: aiResult.reasoning,
                            confidence: aiResult.confidence,
                            url: link.original,
                            aiGenerated: true
                        });
                    }
                } catch (aiError) {
                    console.error('AI link analysis failed:', aiError.message);
                }
            }
        }
        
        return violations;
    }
    
    async analyzeWithAI(link, message, config) {
        const cacheKey = `${link.hostname}_${link.path}`;
        
        // Check cache first
        if (this.linkCache.has(cacheKey)) {
            const cached = this.linkCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 60 * 60 * 1000) { // 1 hour cache
                return cached.result;
            }
        }
        
        try {
            const result = await aiManager.analyzeLink(link.original, {
                guildName: message.guild.name,
                authorTag: message.author.tag,
                channelName: message.channel.name
            });
            
            // Cache the result
            this.linkCache.set(cacheKey, {
                result,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            throw error;
        }
    }
    
    isDomainBlocked(hostname, blockedDomains) {
        return blockedDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
    }
    
    isDomainAllowed(hostname, allowedDomains) {
        return allowedDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
    }
    
    isIPLink(hostname) {
        // Check for IPv4
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        // Check for IPv6
        const ipv6Regex = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
        
        return ipv4Regex.test(hostname) || ipv6Regex.test(hostname);
    }
    
    isUrlShortener(hostname) {
        return this.urlShorteners.some(shortener => 
            hostname === shortener || hostname.endsWith('.' + shortener)
        );
    }
    
    async handleViolations(message, violations, config) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        // Update threat score
        let threatScore = await ThreatScore.findOne({ userId, guildId });
        if (!threatScore) {
            threatScore = new ThreatScore({ userId, guildId });
        }
        
        const severityScores = { low: 5, medium: 15, high: 30, critical: 60 };
        const totalSeverity = violations.reduce((sum, v) => sum + severityScores[v.severity], 0);
        
        threatScore.currentScore = Math.min(100, threatScore.currentScore + totalSeverity);
        threatScore.linkScore = Math.min(100, threatScore.linkScore + totalSeverity);
        threatScore.lastActivity = new Date();
        
        // Determine action
        let action = 'warn';
        let duration = null;
        
        const recentViolations = await UserViolation.countDocuments({
            userId,
            guildId,
            violatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        const highestSeverity = violations.reduce((max, v) => 
            severityScores[v.severity] > severityScores[max] ? v.severity : max, 'low');
        
        if (highestSeverity === 'critical' || threatScore.currentScore >= 80) {
            action = 'quarantine';
            duration = config.punishmentSystem.quarantineDuration;
        } else if (highestSeverity === 'high' || threatScore.currentScore >= 60) {
            action = 'timeout';
            duration = config.punishmentSystem.timeoutDuration;
        } else if (recentViolations >= 2) {
            action = 'timeout';
            duration = config.punishmentSystem.timeoutDuration / 2;
        }
        
        // Execute action
        await this.executeAction(message, action, duration, violations, config);
        
        // Save violation record
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
        
        // Log the incident
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
                        `⚠️ ${message.author}, posting unauthorized links is not allowed. Warning issued for: ${violations[0].description}`
                    ).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
                    break;
                    
                case 'timeout':
                    await member.timeout(duration, `Anti-link: ${violations[0].description}`);
                    await message.channel.send(
                        `🔇 ${message.author} has been timed out for ${duration/1000}s for posting unauthorized links.`
                    ).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
                    break;
                    
                case 'quarantine':
                    if (config.punishmentSystem.useQuarantine) {
                        await this.quarantineUser(member, violations, config);
                    } else {
                        await member.ban({ reason: `Anti-link: ${violations[0].description}` });
                    }
                    break;
            }
            
        } catch (error) {
            console.error('Link action execution error:', error);
        }
    }
    
    async quarantineUser(member, violations, config) {
        const QuarantineConfig = require('../models/qurantine/quarantineConfig');
        const UserQuarantine = require('../models/qurantine/userQuarantine');
        
        const quarantineConfig = await QuarantineConfig.findOne({ guildId: member.guild.id });
        if (!quarantineConfig?.quarantineEnabled) {
            await member.ban({ reason: `Anti-link: ${violations[0].description}` });
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
                reason: `Anti-link violation: ${violations[0].description}`
            },
            { upsert: true }
        );
        
        quarantineConfig.userRoles.set(member.id, userRoles);
        await quarantineConfig.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 You Have Been Quarantined')
            .setDescription(`You have been quarantined in **${member.guild.name}** for posting unauthorized links.`)
            .addFields(
                { name: 'Reason', value: violations[0].description },
                { name: 'Link', value: violations[0].url || 'Unknown' },
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
            .setTitle('🔗 Anti-Link Detection')
            .setColor(action === 'quarantine' ? '#ff0000' : action === 'timeout' ? '#ff6600' : '#ffff00')
            .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Action Taken', value: action.toUpperCase(), inline: true },
                { name: 'Threat Score', value: `${threatScore.currentScore}/100`, inline: true },
                { name: 'Violations', value: violations.map(v => `• ${v.type}: ${v.description}`).join('\n').slice(0, 1024), inline: false },
                { name: 'Links', value: violations.map(v => v.url).join('\n').slice(0, 1024) || 'N/A', inline: false }
            )
            .setDescription(`Message: ${message.content.slice(0, 500)}`)
            .setTimestamp();
        
        if (duration) {
            embed.addFields({ name: 'Duration', value: `${duration/1000}s`, inline: true });
        }
        
        await logChannel.send({ embeds: [embed] });
    }
    
    async isWhitelisted(user, channel, config) {
        const member = channel.guild.members.cache.get(user.id);
        if (!member) return false;
        
        if (config.whitelist.owners.includes(user.id)) return true;
        if (config.whitelist.customMembers.includes(user.id)) return true;
        if (config.whitelist.customChannels.includes(channel.id)) return true;
        if (config.antiLink.whitelistedChannels.includes(channel.id)) return true;
        
        const hasWhitelistedRole = member.roles.cache.some(role => 
            config.whitelist.customRoles.includes(role.id)
        );
        if (hasWhitelistedRole) return true;
        
        // ✅ Fix: Use PermissionsBitField.Flags.Administrator
        if (config.whitelist.bypassAdmins && member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
        
        return false;
    }
    
    cleanup() {
        const now = Date.now();
        
        // Clean up link cache (remove entries older than 1 hour)
        for (const [key, cached] of this.linkCache.entries()) {
            if (now - cached.timestamp > 60 * 60 * 1000) {
                this.linkCache.delete(key);
            }
        }
    }
}

module.exports = AntiLinkModule;
