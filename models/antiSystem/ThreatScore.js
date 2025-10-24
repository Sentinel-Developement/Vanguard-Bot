// models/antiSystem/ThreatScore.js
const mongoose = require('mongoose');

const threatScoreSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    
    // Scoring System
    currentScore: { type: Number, default: 0, min: 0, max: 100 },
    maxScore: { type: Number, default: 0 },
    
    // Score Breakdown
    spamScore: { type: Number, default: 0 },
    linkScore: { type: Number, default: 0 },
    raidScore: { type: Number, default: 0 },
    behaviorScore: { type: Number, default: 0 },
    
    // Risk Assessment
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    isMonitored: { type: Boolean, default: false },
    
    // Decay System
    lastActivity: { type: Date, default: Date.now },
    decayRate: { type: Number, default: 1 }, // Points to decay per hour
    
    lastUpdated: { type: Date, default: Date.now }
}, {
    timestamps: true
});

threatScoreSchema.index({ userId: 1, guildId: 1 });

module.exports = mongoose.model('ThreatScore', threatScoreSchema);
