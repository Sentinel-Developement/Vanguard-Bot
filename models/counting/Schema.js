const mongoose = require('mongoose');

const countingSchema = new mongoose.Schema({
    serverId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    channelId: { 
        type: String, 
        required: true 
    },
    currentCount: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: Boolean, 
        default: true 
    },
    lastUserId: { 
        type: String, 
        default: null 
    },
    highestCount: { 
        type: Number, 
        default: 0 
    },
    totalMessages: { 
        type: Number, 
        default: 0 
    },
    resetCount: { 
        type: Number, 
        default: 0 
    },
    allowSameUser: { 
        type: Boolean, 
        default: false 
    },
    deleteWrongMessages: { 
        type: Boolean, 
        default: true 
    },
    showErrorMessages: { 
        type: Boolean, 
        default: true 
    },
    errorMessageDuration: { 
        type: Number, 
        default: 3000 
    },
    leaderboard: [{
        userId: String,
        count: { type: Number, default: 0 },
        lastContribution: { type: Date, default: Date.now }
    }],
    milestones: [{
        count: Number,
        achievedAt: { type: Date, default: Date.now },
        achievedBy: String
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Index for better performance
// countingSchema.index({ serverId: 1 });
countingSchema.index({ channelId: 1 });

// Methods
countingSchema.methods.incrementCount = function(userId) {
    this.currentCount += 1;
    this.lastUserId = userId;
    this.totalMessages += 1;
    
    // Update highest count if needed
    if (this.currentCount > this.highestCount) {
        this.highestCount = this.currentCount;
    }
    
    // Update leaderboard
    const userIndex = this.leaderboard.findIndex(entry => entry.userId === userId);
    if (userIndex !== -1) {
        this.leaderboard[userIndex].count += 1;
        this.leaderboard[userIndex].lastContribution = new Date();
    } else {
        this.leaderboard.push({
            userId: userId,
            count: 1,
            lastContribution: new Date()
        });
    }
    
    // Sort leaderboard by count (descending)
    this.leaderboard.sort((a, b) => b.count - a.count);
    
    // Keep only top 10
    this.leaderboard = this.leaderboard.slice(0, 10);
    
    return this.save();
};

countingSchema.methods.resetCounting = function(userId) {
    this.currentCount = 0;
    this.lastUserId = null;
    this.resetCount += 1;
    
    return this.save();
};

countingSchema.methods.addMilestone = function(count, userId) {
    // Check if milestone already exists
    const existingMilestone = this.milestones.find(m => m.count === count);
    if (!existingMilestone) {
        this.milestones.push({
            count: count,
            achievedAt: new Date(),
            achievedBy: userId
        });
        
        // Sort milestones by count
        this.milestones.sort((a, b) => b.count - a.count);
    }
    
    return this.save();
};

// Static methods
countingSchema.statics.findByServerId = function(serverId) {
    return this.findOne({ serverId });
};

countingSchema.statics.findByChannelId = function(channelId) {
    return this.findOne({ channelId });
};

countingSchema.statics.getLeaderboard = function(serverId, limit = 10) {
    return this.findOne({ serverId })
        .select('leaderboard')
        .then(doc => doc ? doc.leaderboard.slice(0, limit) : []);
};

module.exports = mongoose.model('CountingConfig', countingSchema);