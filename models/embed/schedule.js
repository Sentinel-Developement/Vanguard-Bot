const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    // Basic identification
    scheduleId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    guildId: {
        type: String,
        required: true,
        index: true
    },
    
    // Schedule configuration
    embedId: {
        type: String,
        required: true,
        ref: 'Embed'
    },
    channelId: {
        type: String,
        required: true
    },
    
    // Timing
    frequency: {
        type: String,
        enum: [
            'hourly', 'daily', 'weekly_monday', 'weekly_tuesday', 
            'weekly_wednesday', 'weekly_thursday', 'weekly_friday', 
            'weekly_saturday', 'weekly_sunday', 'monthly', 'custom'
        ],
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(v);
            },
            message: 'Time must be in HH:MM format'
        }
    },
    customCron: String, // For custom frequency
    timezone: {
        type: String,
        default: 'UTC'
    },
    
    // Message configuration
    mentionRoleId: String,
    messageContent: {
        type: String,
        maxlength: 2000
    },
    
    // Status and control
    isActive: {
        type: Boolean,
        default: true
    },
    nextRun: Date,
    lastRun: Date,
    runCount: {
        type: Number,
        default: 0
    },
    maxRuns: Number, // Optional limit
    
    // Error handling
    failureCount: {
        type: Number,
        default: 0
    },
    lastError: String,
    maxFailures: {
        type: Number,
        default: 5
    },
    
    // Metadata
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate short readable IDs
ScheduleSchema.statics.generateScheduleId = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SCH-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

module.exports = mongoose.model('EmbedSchedule', ScheduleSchema);
