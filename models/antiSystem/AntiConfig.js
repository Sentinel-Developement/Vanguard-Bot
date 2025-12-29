// models/antiSystem/AntiConfig.js
const mongoose = require('mongoose');

const antiConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    
    // General Settings
    enabled: { type: Boolean, default: true },
    logChannelId: { type: String, default: null },
    alertChannelId: { type: String, default: null },
    
    // AI Settings
    aiEnabled: { type: Boolean, default: true },
    aiSensitivity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    aiConfidenceThreshold: { type: Number, default: 0.7, min: 0, max: 1 },
    
    // Whitelist System
    whitelist: {
        owners: [{ type: String }],
        admins: [{ type: String }],
        customMembers: [{ type: String }],
        customChannels: [{ type: String }],
        customRoles: [{ type: String }],
        bypassAdmins: { type: Boolean, default: true }
    },
    
    // Punishment System
    punishmentSystem: {
        useQuarantine: { type: Boolean, default: true },
        escalationEnabled: { type: Boolean, default: true },
        maxWarnings: { type: Number, default: 3 },
        timeoutDuration: { type: Number, default: 300000 }, // 5 minutes
        quarantineDuration: { type: Number, default: 3600000 }, // 1 hour
        banAfterQuarantine: { type: Boolean, default: false }
    },
    
    // Anti-Spam Settings
    antiSpam: {
        enabled: { type: Boolean, default: true },
        messageLimit: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 5000 },
        duplicateThreshold: { type: Number, default: 3 },
        mentionLimit: { type: Number, default: 5 },
        emojiLimit: { type: Number, default: 10 },
        capsPunishment: { type: Boolean, default: true },
        capsPercentage: { type: Number, default: 70 },
        blockedWords: [{ type: String }],
        whitelistedChannels: [{ type: String }]
    },
    
    // Anti-Link Settings
    antiLink: {
        enabled: { type: Boolean, default: true },
        mode: { type: String, enum: ['strict', 'moderate', 'custom'], default: 'moderate' },
        allowedDomains: [{ type: String }],
        blockedDomains: [{ type: String }],
        shortenerProtection: { type: Boolean, default: true },
        ipLinkProtection: { type: Boolean, default: true },
        whitelistedChannels: [{ type: String }]
    },
    
    // Anti-Raid Settings
    antiRaid: {
        enabled: { type: Boolean, default: true },
        joinLimit: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 60000 },
        accountAgeCheck: { type: Boolean, default: true },
        minAccountAge: { type: Number, default: 604800000 }, // 7 days
        avatarCheck: { type: Boolean, default: true },
        lockdownDuration: { type: Number, default: 600000 }, // 10 minutes
        action: { type: String, enum: ['kick', 'ban', 'quarantine'], default: 'quarantine' }
    },
    
    // Anti-Nuke Settings
    antiNuke: {
        enabled: { type: Boolean, default: true },
        channelDeleteLimit: { type: Number, default: 1 },
        channelCreateLimit: { type: Number, default: 3 },
        roleDeleteLimit: { type: Number, default: 1 },
        roleCreateLimit: { type: Number, default: 3 },
        memberKickLimit: { type: Number, default: 2 },
        memberBanLimit: { type: Number, default: 1 },
        timeWindow: { type: Number, default: 10000 },
        lockdownOnDetection: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AntiConfig', antiConfigSchema);
