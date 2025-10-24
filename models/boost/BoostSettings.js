// models/boost/BoostSettings.js
const mongoose = require('mongoose');

const boostSettingsSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
    
    // Boost Channel Settings
    boostChannelId: { type: String },
    boostStatus: { type: Boolean, default: false },
    
    // Simple message settings
    boostMessage: { 
        type: String, 
        default: 'Thank you {username} for boosting **{servername}**! 🚀\nServer is now level **{boostlevel}** with **{boostcount}** boosts!' 
    },
    
    // Boost removal message
    removeMessage: { 
        type: String, 
        default: '{username} is no longer boosting **{servername}** 😢\nServer is now level **{boostlevel}** with **{boostcount}** boosts.' 
    }
    
}, {
    timestamps: true
});

module.exports = mongoose.model('BoostSettings', boostSettingsSchema);
