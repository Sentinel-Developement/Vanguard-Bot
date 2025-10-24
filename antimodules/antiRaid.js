// antiModules/antiRaid.js (continued)
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const AntiConfig = require('../models/antiSystem/AntiConfig');
const UserViolation = require('../models/antiSystem/UserViolation');

class AntiRaidModule {
    constructor(client) {
        this.client = client;
        this.joinTracking = new Map(); // guildId -> { joins: [], lockdownUntil: timestamp }
        
        //console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAnti-Raid System Active ✅\x1b[0m');
        this.initialize();
    }
    
    initialize() {
        this.client.on('guildMemberAdd', async (member) => {
            await this.handleMemberJoin(member);
        });
        
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    async handleMemberJoin(member) {
        try {
            const config = await AntiConfig.findOne({ guildId: member.guild.id });
            if (!config?.antiRaid?.enabled) return;
            
            const guildId = member.guild.id;
            
            // Check if server is in lockdown
            if (this.isInLockdown(guildId)) {
                await this.handleLockdownJoin(member, config);
                return;
            }
            
            // Track the join
            await this.trackJoin(member, config);
            
            // Check for raid patterns
            const raidDetected = await this.checkForRaid(guildId, config);
            
            if (raidDetected) {
                await this.handleRaidDetection(member.guild, config);
            }
            
        } catch (error) {
            console.error('Anti-raid error:', error);
        }
    }
    
    async trackJoin(member, config) {
        const guildId = member.guild.id;
        const now = Date.now();
        
        if (!this.joinTracking.has(guildId)) {
            this.joinTracking.set(guildId, { joins: [], lockdownUntil: 0 });
        }
        
        const guildData = this.joinTracking.get(guildId);
        
        // Remove joins outside time window
        guildData.joins = guildData.joins.filter(
            join => now - join.timestamp < config.antiRaid.timeWindow
        );
        
        // Analyze member for suspicious patterns
        const suspiciousScore = await this.analyzeMember(member, config);
        
        // Add new join
        guildData.joins.push({
            userId: member.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            accountAge: now - member.user.createdTimestamp,
            hasAvatar: member.user.avatar !== null,
            timestamp: now,
            suspiciousScore
        });
    }
    
    async analyzeMember(member, config) {
        let suspiciousScore = 0;
        
        // Account age check
        if (config.antiRaid.accountAgeCheck) {
            const accountAge = Date.now() - member.user.createdTimestamp;
            if (accountAge < config.antiRaid.minAccountAge) {
                suspiciousScore += 30;
            }
        }
        
        // Avatar check
        if (config.antiRaid.avatarCheck && !member.user.avatar) {
            suspiciousScore += 20;
        }
        
        // Username patterns
        const username = member.user.username.toLowerCase();
        
        // Check for common bot/raid patterns
        const suspiciousPatterns = [
            /^user\d+$/,           // user123
            /^[a-z]+\d{4,}$/,      // abc1234
            /discord/,             // contains "discord"
            /nitro/,               // contains "nitro"
            /free/,                // contains "free"
            /gift/,                // contains "gift"
            /^.{1,3}$/,            // very short names
            /^[a-z]{20,}$/,        // very long random strings
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(username)) {
                suspiciousScore += 15;
                break;
            }
        }
        
        // Check for sequential usernames
        const recentJoins = this.joinTracking.get(member.guild.id)?.joins || [];
        const similarNames = recentJoins.filter(join => 
            this.areSimilarUsernames(join.username, member.user.username)
        );
        
        if (similarNames.length >= 2) {
            suspiciousScore += 25;
        }
        
        return suspiciousScore;
    }
    
    areSimilarUsernames(name1, name2) {
        if (!name1 || !name2) return false;
        
        name1 = name1.toLowerCase();
        name2 = name2.toLowerCase();
        
        // Check for sequential numbers
        const num1 = name1.match(/\d+$/);
        const num2 = name2.match(/\d+$/);
        
        if (num1 && num2) {
            const base1 = name1.replace(/\d+$/, '');
            const base2 = name2.replace(/\d+$/, '');
            
            if (base1 === base2) {
                const diff = Math.abs(parseInt(num1[0]) - parseInt(num2[0]));
                return diff <= 5; // Sequential numbers within 5
            }
        }
        
        // Check for common prefix (minimum 3 characters)
        const minLength = Math.min(name1.length, name2.length);
        if (minLength < 3) return false;
        
        let commonLength = 0;
        for (let i = 0; i < minLength; i++) {
            if (name1[i] === name2[i]) {
                commonLength++;
            } else {
                break;
            }
        }
        
        return commonLength >= 3;
    }
    
    isInLockdown(guildId) {
        const guildData = this.joinTracking.get(guildId);
        if (!guildData) return false;
        
        return guildData.lockdownUntil > Date.now();
    }
    
    async handleLockdownJoin(member, config) {
        try {
            const action = config.antiRaid.action;
            
            // Log the join attempt during lockdown
            const embed = new EmbedBuilder()
                .setTitle('🚨 Lockdown Join Attempt')
                .setColor('#ff6600')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Account Age', value: `${Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000))} days`, inline: true },
                    { name: 'Action Taken', value: action.toUpperCase(), inline: true }
                )
                .setTimestamp();
            
            const logChannel = this.client.channels.cache.get(config.logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
            
            // Take action based on configuration
            switch (action) {
                case 'kick':
                    if (member.kickable) {
                        await member.kick('Server in lockdown - raid protection');
                    }
                    break;
                    
                case 'ban':
                    if (member.bannable) {
                        await member.ban({ reason: 'Server in lockdown - raid protection' });
                    }
                    break;
                    
                case 'quarantine':
                    await this.quarantineMember(member, 'Server in lockdown - raid protection', config);
                    break;
            }
            
        } catch (error) {
            console.error('Lockdown join handler error:', error);
        }
    }
    
    async checkForRaid(guildId, config) {
        const guildData = this.joinTracking.get(guildId);
        if (!guildData) return false;
        
        const now = Date.now();
        const recentJoins = guildData.joins.filter(
            join => now - join.timestamp < config.antiRaid.timeWindow
        );
        
        // Basic join limit check
        if (recentJoins.length >= config.antiRaid.joinLimit) {
            return true;
        }
        
        // Advanced pattern detection
        const suspiciousJoins = recentJoins.filter(join => join.suspiciousScore >= 50);
        
        // If 50% or more of recent joins are suspicious, consider it a raid
        if (suspiciousJoins.length >= Math.max(3, recentJoins.length * 0.5)) {
            return true;
        }
        
        // Check for multiple joins with similar usernames
        const similarGroups = this.findSimilarUsernameGroups(recentJoins);
        const largestGroup = Math.max(...similarGroups.map(group => group.length), 0);
        
        if (largestGroup >= 3) {
            return true;
        }
        
        return false;
    }
    
    findSimilarUsernameGroups(joins) {
        const groups = [];
        const processed = new Set();
        
        for (let i = 0; i < joins.length; i++) {
            if (processed.has(i)) continue;
            
            const group = [joins[i]];
            processed.add(i);
            
            for (let j = i + 1; j < joins.length; j++) {
                if (processed.has(j)) continue;
                
                if (this.areSimilarUsernames(joins[i].username, joins[j].username)) {
                    group.push(joins[j]);
                    processed.add(j);
                }
            }
            
            if (group.length > 1) {
                groups.push(group);
            }
        }
        
        return groups;
    }
    
    async handleRaidDetection(guild, config) {
        const guildId = guild.id;
        const now = Date.now();
        
        try {
            // Set lockdown
            const guildData = this.joinTracking.get(guildId) || { joins: [], lockdownUntil: 0 };
            guildData.lockdownUntil = now + config.antiRaid.lockdownDuration;
            this.joinTracking.set(guildId, guildData);
            
            console.log(`\x1b[31m[ ANTI-RAID ]\x1b[0m Raid detected in ${guild.name}, lockdown initiated`);
            
            // Get recent suspicious joins
            const recentJoins = guildData.joins.filter(
                join => now - join.timestamp < config.antiRaid.timeWindow
            );
            
            const suspiciousJoins = recentJoins.filter(join => join.suspiciousScore >= 30);
            
            // Take action on suspicious members
            for (const join of suspiciousJoins) {
                try {
                    const member = await guild.members.fetch(join.userId).catch(() => null);
                    if (!member) continue;
                    
                    await this.executeRaidAction(member, config);
                    
                    // Save violation record
                    const violation = new UserViolation({
                        userId: join.userId,
                        guildId,
                        violationType: 'raid_participation',
                        severity: 'high',
                        content: `Suspicious account detected during raid (score: ${join.suspiciousScore})`,
                        channelId: guild.systemChannelId || null,
                        actionTaken: config.antiRaid.action,
                        warningCount: 0
                    });
                    
                    await violation.save();
                    
                } catch (actionError) {
                    console.error('Raid action error:', actionError);
                }
            }
            
            // Log the raid detection
            await this.logRaidDetection(guild, recentJoins, suspiciousJoins, config);
            
            // Send alerts
            await this.sendRaidAlert(guild, recentJoins, config);
            
        } catch (error) {
            console.error('Raid detection handler error:', error);
        }
    }
    
    async executeRaidAction(member, config) {
        const action = config.antiRaid.action;
        
        switch (action) {
            case 'kick':
                if (member.kickable) {
                    await member.kick('Raid protection - suspicious account pattern');
                }
                break;
                
            case 'ban':
                if (member.bannable) {
                    await member.ban({ reason: 'Raid protection - suspicious account pattern' });
                }
                break;
                
            case 'quarantine':
                await this.quarantineMember(member, 'Raid protection - suspicious account pattern', config);
                break;
        }
    }
    
    async quarantineMember(member, reason, config) {
        const QuarantineConfig = require('../models/qurantine/quarantineConfig');
        const UserQuarantine = require('../models/qurantine/userQuarantine');
        
        const quarantineConfig = await QuarantineConfig.findOne({ guildId: member.guild.id });
        if (!quarantineConfig?.quarantineEnabled) {
            // Fallback to ban if quarantine not available
            if (member.bannable) {
                await member.ban({ reason });
            }
            return;
        }
        
        const quarantineRole = member.guild.roles.cache.get(quarantineConfig.quarantineRoleId);
        if (!quarantineRole) return;
        
        // Store original roles
        const userRoles = member.roles.cache.map(role => role.id);
        await member.roles.set([quarantineRole]);
        
        // Update quarantine records
        await UserQuarantine.findOneAndUpdate(
            { userId: member.id, guildId: member.guild.id },
            { 
                isQuarantined: true, 
                quarantinedAt: new Date(),
                reason
            },
            { upsert: true }
        );
        
        quarantineConfig.userRoles.set(member.id, userRoles);
        await quarantineConfig.save();
        
        // Send DM
        const embed = new EmbedBuilder()
            .setTitle('🚨 You Have Been Quarantined')
            .setDescription(`You have been quarantined in **${member.guild.name}** due to raid protection measures.`)
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Duration', value: 'Until reviewed by staff' },
                { name: 'Appeal', value: 'Contact server moderators if you believe this was an error' }
            )
            .setColor('#ff0000')
            .setTimestamp();
        
        try {
            await member.send({ embeds: [embed] });
        } catch (error) {
            console.log(`Failed to send DM to ${member.user.tag}`);
        }
    }
    
    async logRaidDetection(guild, allJoins, suspiciousJoins, config) {
        const logChannel = this.client.channels.cache.get(config.logChannelId);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 RAID DETECTED')
            .setColor('#ff0000')
            .addFields(
                { name: 'Server', value: guild.name, inline: true },
                { name: 'Total Joins', value: allJoins.length.toString(), inline: true },
                { name: 'Suspicious Joins', value: suspiciousJoins.length.toString(), inline: true },
                { name: 'Time Window', value: `${config.antiRaid.timeWindow / 1000}s`, inline: true },
                { name: 'Action Taken', value: config.antiRaid.action.toUpperCase(), inline: true },
                { name: 'Lockdown Duration', value: `${config.antiRaid.lockdownDuration / 60000} minutes`, inline: true }
            )
            .setDescription(`**RAID PROTECTION ACTIVATED**\n\nServer is now in lockdown mode. New joins will be automatically ${config.antiRaid.action}ed.`)
            .setTimestamp();
        
        // Add suspicious member list
        if (suspiciousJoins.length > 0) {
            const suspiciousList = suspiciousJoins
                .slice(0, 10) // Limit to 10 entries
                .map(join => `• ${join.username} (Score: ${join.suspiciousScore})`)
                .join('\n');
            
            embed.addFields({
                name: 'Suspicious Accounts',
                value: suspiciousList + (suspiciousJoins.length > 10 ? `\n...and ${suspiciousJoins.length - 10} more` : ''),
                inline: false
            });
        }
        
        await logChannel.send({ embeds: [embed] });
    }
    
    async sendRaidAlert(guild, recentJoins, config) {
        const alertChannel = this.client.channels.cache.get(config.alertChannelId);
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 URGENT: RAID IN PROGRESS')
            .setColor('#ff0000')
            .setDescription(`**${guild.name}** is currently under raid attack!\n\n**IMMEDIATE ACTION TAKEN:**\n✅ Server locked down\n✅ Suspicious accounts ${config.antiRaid.action}ed\n✅ New joins blocked`)
            .addFields(
                { name: 'Raid Statistics', value: `${recentJoins.length} joins in ${config.antiRaid.timeWindow/1000}s`, inline: true },
                { name: 'Lockdown Duration', value: `${config.antiRaid.lockdownDuration/60000} minutes`, inline: true },
                { name: 'Status', value: '🔴 **ACTIVE PROTECTION**', inline: true }
            )
            .setTimestamp();
        
        if (alertChannel && alertChannel.id !== config.logChannelId) {
            await alertChannel.send({ 
                content: '@here',
                embeds: [embed] 
            });
        }
        
        // Try to DM the owner
        try {
            const owner = await guild.fetchOwner();
            await owner.send({ embeds: [embed] });
        } catch (error) {
            console.log('Failed to DM guild owner about raid');
        }
    }
    
    async isWhitelisted(user, guild, config) {
        if (!user || user.bot) return true; // Ignore bots
        
        if (config.whitelist.owners.includes(user.id)) return true;
        if (config.whitelist.customMembers.includes(user.id)) return true;
        
        const member = guild.members.cache.get(user.id);
        if (!member) return false;
        
        // Check whitelisted roles
        const hasWhitelistedRole = member.roles.cache.some(role => 
            config.whitelist.customRoles.includes(role.id)
        );
        if (hasWhitelistedRole) return true;
        
        // Admin bypass
        if (config.whitelist.bypassAdmins && member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return true;
        }
        
        return false;
    }
    
    cleanup() {
        const now = Date.now();
        
        // Clean up old join tracking data
        for (const [guildId, guildData] of this.joinTracking.entries()) {
            // Remove old joins
            guildData.joins = guildData.joins.filter(
                join => now - join.timestamp < 300000 // Keep last 5 minutes
            );
            
            // Remove expired lockdowns
            if (guildData.lockdownUntil > 0 && now > guildData.lockdownUntil) {
                guildData.lockdownUntil = 0;
                console.log(`\x1b[32m[ ANTI-RAID ]\x1b[0m Lockdown lifted for guild ${guildId}`);
            }
            
            // Clean up empty data
            if (guildData.joins.length === 0 && guildData.lockdownUntil === 0) {
                this.joinTracking.delete(guildId);
            }
        }
    }
}

module.exports = AntiRaidModule;
