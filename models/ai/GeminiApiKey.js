// models/GeminiApiKey.js
const mongoose = require('mongoose');

const geminiApiKeySchema = new mongoose.Schema({
    keyId: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    
    // Usage Stats
    totalRequests: { type: Number, default: 0 },
    successfulRequests: { type: Number, default: 0 },
    failedRequests: { type: Number, default: 0 },
    
    // Rate Limiting & Health
    lastUsedAt: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date, default: null },
    blockedReason: { type: String, default: null },
    
    // Performance Metrics
    avgResponseTime: { type: Number, default: 0 },
    lastErrorAt: { type: Date, default: null },
    lastErrorMessage: { type: String, default: null },
    
    // Management
    addedBy: { type: String, required: true }, 
    addedAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for quick lookups
geminiApiKeySchema.index({ isActive: 1, isBlocked: 1 });
// geminiApiKeySchema.index({ keyId: 1 });

module.exports = mongoose.model('GeminiApiKey', geminiApiKeySchema);
