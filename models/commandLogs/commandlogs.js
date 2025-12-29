const mongoose = require('mongoose');

// Schema for command logs configuration only
const commandLogsConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    channelId: {
        type: String,
        default: null
    },
    enabled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CommandLogsConfig', commandLogsConfigSchema);