const mongoose = require('mongoose');

const nqnConfigSchema = new mongoose.Schema({
    serverId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    ownerId: {
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

// Update the updatedAt field before saving
nqnConfigSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update the updatedAt field before updating
nqnConfigSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('NqnConfig', nqnConfigSchema);