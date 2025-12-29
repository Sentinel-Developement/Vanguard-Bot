// antiModules/antiNuke.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const AntiConfig = require('../models/antiSystem/AntiConfig');
const UserViolation = require('../models/antiSystem/UserViolation');

class AntiNukeModule {
    constructor(client) {
        this.client = client;
        this.actionTracking = new Map(); // guildId -> { actions: [], lastReset: timestamp }
        
        //console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAnti-Nuke System Active ✅\x1b[0m');
        this.initialize();
    }
    
    initialize() {
        // Channel events
        this.client.on('channelDelete', async (channel) => {
            if (!channel.guild) return;
            await this.handleChannelDelete(channel);
        });
        
        this.client.on('channelCreate', async (channel) => {
            if (!channel.guild) return;
            await this.handleChannelCreate(channel);
        });
        
        // Role events
        this.client.on('roleDelete', async (role) => {
            await this.handleRoleDelete(role);
        });
        
        this.client.on('roleCreate', async (role) => {
            await this.handleRoleCreate(role);
        });
        
        // Member events
        this.client.on('guildBanAdd', async (ban) => {
            await this.handleMemberBan(ban);
        });
        
        this.client.on('guildMemberRemove', async (member) => {
            if (member.user.bot) return;
            await this.handleMemberKick(member);
        });
        
        // Cleanup tracking data every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    async handleChannelDelete(channel) {
        try {
            const config = await AntiConfig.findOne({ guildId: channel.guild.id });
            if (!config?.antiNuke?.enabled) return;
            
            const auditLogs = await channel.guild.fetchAuditLogs({ 
                limit: 1, 
                type: 12 // CHANNEL_DELETE
            });
            
            const deleteLog = auditLogs.entries.first();
            if (!deleteLog) return;
            
            const executor = deleteLog.executor;
            if (await this.isWhitelisted(executor, channel.guild, config)) return;
            
            await this.trackAction(channel.guild.id, 'channelDelete', executor, config);
            
        } catch (error) {
            console.error('Channel delete handler error:', error);
        }
    }
    
    async handleChannelCreate(channel) {
        try {
            const config = await AntiConfig.findOne({ guildId: channel.guild.id });
            if (!config?.antiNuke?.enabled) return;
            
            const auditLogs = await channel.guild.fetchAuditLogs({ 
                limit: 1, 
                type: 10 // CHANNEL_CREATE
            });
            
            const createLog = auditLogs.entries.first();
            if (!createLog) return;
            
            const executor = createLog.executor;
            if (await this.isWhitelisted(executor, channel.guild, config)) return;
            
            await this.trackAction(channel.guild.id, 'channelCreate', executor, config);
            
        } catch (error) {
            console.error('Channel create handler error:', error);
        }
    }
    
    async handleRoleDelete(role) {
        try {
            const config = await AntiConfig.findOne({ guildId: role.guild.id });
            if (!config?.antiNuke?.enabled) return;
            
            const auditLogs = await role.guild.fetchAuditLogs({ 
                limit: 1, 
                type: 32 // ROLE_DELETE
            });
            
            const deleteLog = auditLogs.entries.first();
            if (!deleteLog) return;
            
            const executor = deleteLog.executor;
            if (await this.isWhitelisted(executor, role.guild, config)) return;
            
            await this.trackAction(role.guild.id, 'roleDelete', executor, config);
            
        } catch (error) {
            console.error('Role delete handler error:', error);
        }
    }
    
    async handleRoleCreate(role) {
        try {
            const config = await AntiConfig.findOne({ guildId: role.guild.id });
            if (!config?.antiNuke?.enabled) return;
            
            const auditLogs = await role.guild.fetchAuditLogs({ 
                limit: 1, 
                type: 30 // ROLE_CREATE
            });
            
            const createLog = auditLogs.entries.first();
            if (!createLog) return;
            
            const executor = createLog.executor;
            if (await this.isWhitelisted(executor, role.guild, config)) return;
            
            await this.trackAction(role.guild.id, 'roleCreate', executor, config);
            
        } catch (error) {
            console.error('Role create handler error:', error);
        }
    }
    
    async handleMemberBan(ban) {
        try {
            const config = await AntiConfig.findOne({ guildId: ban.guild.id });
            if (!config?.antiNuke?.enabled) return;
            
            const auditLogs = await ban.guild.fetchAuditLogs({ 
                limit: 1, 
                type: 22 // MEMBER_BAN_ADD
            });
            
            const banLog = auditLogs.entries.first();
            if (!banLog || banLog.target.id !== ban.user.id) return;
            
            const executor = banLog.executor;
            if (await this.isWhitelisted(executor, ban.guild, config)) return;
            
            await this.trackAction(ban.guild.id, 'memberBan', executor, config);
            
        } catch (error) {
            console.error('Member ban handler error:', error);
        }
    }
    
    async handleMemberKick(member) {
        try {
            const config = await AntiConfig.findOne({ guildId: member.guild.id });
            if (!config?.antiNuke?.enabled) return;
            
            const auditLogs = await member.guild.fetchAuditLogs({ 
                limit: 1, 
                type: 20 // MEMBER_KICK
            });
            
            const kickLog = auditLogs.entries.first();
            if (!kickLog || kickLog.target.id !== member.id) return;
            
            const executor = kickLog.executor;
            if (await this.isWhitelisted(executor, member.guild, config)) return;
            
            await this.trackAction(member.guild.id, 'memberKick', executor, config);
            
        } catch (error) {
            console.error('Member kick handler error:', error);
        }
    }
    
    async trackAction(guildId, actionType, executor, config) {
        const now = Date.now();
        
        if (!this.actionTracking.has(guildId)) {
            this.actionTracking.set(guildId, { actions: [], lastReset: now });
        }
        
        const guildData = this.actionTracking.get(guildId);
        
        // Remove old actions outside time window
        guildData.actions = guildData.actions.filter(
            action => now - action.timestamp < config.antiNuke.timeWindow
        );
        
        // Add new action
        guildData.actions.push({
            type: actionType,
            executorId: executor.id,
            timestamp: now
        });
        
        // Check for violations
        await this.checkViolations(guildId, executor, config);
    }
    
    async checkViolations(guildId, executor, config) {
        const guildData = this.actionTracking.get(guildId);
        const now = Date.now();
        
        // Count actions by type in time window
        const actionCounts = {};
        
        for (const action of guildData.actions) {
            if (now - action.timestamp < config.antiNuke.timeWindow) {
                actionCounts[action.type] = (actionCounts[action.type] || 0) + 1;
            }
        }
        
        const violations = [];
        
        // Check each limit
        if (actionCounts.channelDelete > config.antiNuke.channelDeleteLimit) {
            violations.push({
                type: 'channel_delete_limit',
                severity: 'critical',
                description: `${actionCounts.channelDelete} channels deleted in ${config.antiNuke.timeWindow/1000}s`,
                count: actionCounts.channelDelete,
                limit: config.antiNuke.channelDeleteLimit
            });
        }
        
        if (actionCounts.channelCreate > config.antiNuke.channelCreateLimit) {
            violations.push({
                type: 'channel_create_limit',
                severity: 'high',
                description: `${actionCounts.channelCreate} channels created in ${config.antiNuke.timeWindow/1000}s`,
                count: actionCounts.channelCreate,
                limit: config.antiNuke.channelCreateLimit
            });
        }
        
        if (actionCounts.roleDelete > config.antiNuke.roleDeleteLimit) {
            violations.push({
                type: 'role_delete_limit',
                severity: 'critical',
                description: `${actionCounts.roleDelete} roles deleted in ${config.antiNuke.timeWindow/1000}s`,
                count: actionCounts.roleDelete,
                limit: config.antiNuke.roleDeleteLimit
            });
        }
        
        if (actionCounts.roleCreate > config.antiNuke.roleCreateLimit) {
            violations.push({
                type: 'role_create_limit',
                severity: 'high',
                description: `${actionCounts.roleCreate} roles created in ${config.antiNuke.timeWindow/1000}s`,
                count: actionCounts.roleCreate,
                limit: config.antiNuke.roleCreateLimit
            });
        }
        
        if (actionCounts.memberBan > config.antiNuke.memberBanLimit) {
            violations.push({
                type: 'member_ban_limit',
                severity: 'critical',
                description: `${actionCounts.memberBan} members banned in ${config.antiNuke.timeWindow/1000}s`,
                count: actionCounts.memberBan,
                limit: config.antiNuke.memberBanLimit
            });
        }
        
        if (actionCounts.memberKick > config.antiNuke.memberKickLimit) {
            violations.push({
                type: 'member_kick_limit',
                severity: 'high',
                description: `${actionCounts.memberKick} members kicked in ${config.antiNuke.timeWindow/1000}s`,
                count: actionCounts.memberKick,
                limit: config.antiNuke.memberKickLimit
            });
        }
        
        if (violations.length > 0) {
            await this.handleViolations(guildId, executor, violations, config);
        }
    }
    
    async handleViolations(guildId, executor, violations, config) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return;
        
        const member = guild.members.cache.get(executor.id);
        
        try {
            // Immediate action - ban the executor
            if (member && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await member.ban({ reason: `Anti-nuke: ${violations[0].description}` });
            }
            
            // Server lockdown if enabled
            if (config.antiNuke.lockdownOnDetection) {
                await this.initiateServerLockdown(guild, config);
            }
            
            // Save violation record
            const violation = new UserViolation({
                userId: executor.id,
                guildId,
                violationType: violations[0].type,
                severity: violations[0].severity,
                content: `Nuke attempt detected: ${violations.map(v => v.description).join(', ')}`,
                channelId: guild.systemChannelId || null,
                actionTaken: member ? 'ban' : 'none',
                warningCount: 0
            });
            
            await violation.save();
            
            // Log the incident
            await this.logViolation(guild, executor, violations, config);
            
            // Send alert to owners
            await this.alertOwners(guild, executor, violations, config);
            
        } catch (error) {
            console.error('Nuke violation handling error:', error);
        }
    }
    
    async initiateServerLockdown(guild, config) {
        try {
            // Pause all invites
            const invites = await guild.invites.fetch();
            for (const invite of invites.values()) {
                try {
                    await invite.delete('Anti-nuke lockdown');
                } catch (e) {}
            }
            
            // Lock all channels
            for (const channel of guild.channels.cache.values()) {
                if (channel.isTextBased()) {
                    try {
                        await channel.permissionOverwrites.edit(guild.roles.everyone, {
                            SendMessages: false,
                            AddReactions: false,
                            CreatePublicThreads: false,
                            CreatePrivateThreads: false
                        });
                    } catch (e) {}
                }
            }
            
            console.log(`\x1b[31m[ ANTI-NUKE ]\x1b[0m Server ${guild.name} locked down due to nuke attempt`);
            
        } catch (error) {
            console.error('Server lockdown error:', error);
        }
    }
    
    async logViolation(guild, executor, violations, config) {
        const logChannel = this.client.channels.cache.get(config.logChannelId);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('💣 ANTI-NUKE DETECTION')
            .setColor('#ff0000')
            .addFields(
                { name: 'Executor', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: 'Server', value: guild.name, inline: true },
                { name: 'Status', value: '🚨 CRITICAL THREAT', inline: true },
                { name: 'Violations', value: violations.map(v => `• ${v.description}`).join('\n').slice(0, 1024), inline: false },
                { name: 'Actions Taken', value: '• Executor banned\n• Server locked down\n• Owners notified', inline: false }
            )
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    }
    
    async alertOwners(guild, executor, violations, config) {
        const alertChannel = this.client.channels.cache.get(config.alertChannelId);
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 NUKE ATTEMPT DETECTED')
            .setColor('#ff0000')
            .setDescription(`**IMMEDIATE ACTION REQUIRED**\n\nA nuke attempt has been detected and automatically mitigated.`)
            .addFields(
                { name: 'Attacker', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: 'Server', value: guild.name, inline: true },
                { name: 'Time', value: new Date().toLocaleString(), inline: true },
                { name: 'Violations', value: violations.map(v => `• ${v.description}`).join('\n'), inline: false },
                { name: 'Mitigation', value: '✅ Attacker banned\n✅ Server locked\n✅ Invites disabled', inline: false }
            )
            .setTimestamp();
        
        if (alertChannel) {
            await alertChannel.send({ embeds: [embed] });
        }
        
        // Try to DM the owner
        try {
            const owner = await guild.fetchOwner();
            await owner.send({ embeds: [embed] });
        } catch (error) {
            console.log('Failed to DM guild owner about nuke attempt');
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
        
        // Admin bypass (optional)
        if (config.whitelist.bypassAdmins && member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return true;
        }
        
        return false;
    }
    
    cleanup() {
        const now = Date.now();
        
        // Clean up old action tracking data
        for (const [guildId, guildData] of this.actionTracking.entries()) {
            guildData.actions = guildData.actions.filter(
                action => now - action.timestamp < 60000 // Keep last minute
            );
            
            if (guildData.actions.length === 0) {
                this.actionTracking.delete(guildId);
            }
        }
    }
}

module.exports = AntiNukeModule;
