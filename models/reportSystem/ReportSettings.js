const mongoose = require('mongoose');

const reportSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Channel Configuration
    channels: {
        reportsChannel: String, // Where reports are sent
        alertsChannel: String,  // High priority alerts
        logsChannel: String     // All report actions log
    },
    
    // Auto-moderation Settings
    autoModeration: {
        enabled: { type: Boolean, default: true },
        aiAnalysis: { type: Boolean, default: true },
        autoTimeout: {
            enabled: { type: Boolean, default: false },
            severityThreshold: { type: String, default: 'high' },
            duration: { type: Number, default: 300 } // seconds
        },
        autoEscalate: {
            enabled: { type: Boolean, default: true },
            confidenceThreshold: { type: Number, default: 0.8 },
            severityThreshold: { type: String, default: 'high' }
        }
    },
    
    // Notification Settings
    notifications: {
        instantAlerts: { type: Boolean, default: true },
        dailyDigest: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true },
        mentionModerators: { type: Boolean, default: true }
    },
    
    // Report Categories (customizable per server)
    customCategories: [{
        name: String,
        description: String,
        color: String,
        autoActions: [String]
    }],
    
    // Moderator Roles
    moderatorRoles: [String],
    adminRoles: [String],
    
    // Thresholds
    thresholds: {
        duplicateWindow: { type: Number, default: 24 }, // hours
        escalationThreshold: { type: Number, default: 3 }, // number of reports
        aiConfidenceMin: { type: Number, default: 0.5 }
    },
    
    timestamps: {
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
}, {
    timestamps: { createdAt: 'timestamps.createdAt', updatedAt: 'timestamps.updatedAt' }
});

module.exports = mongoose.model('ReportSettings', reportSettingsSchema);
