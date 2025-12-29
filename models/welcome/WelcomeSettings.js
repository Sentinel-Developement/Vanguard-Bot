const mongoose = require('mongoose');

// Field options for dropdown selections
const fieldOptions = [
    'username',
    'userid', 
    'joindate',
    'accountcreated',
    'membercount',
    'servername',
    'none'
];

const thumbnailImageOptions = [
    'userimage',
    'serverimage',
    'none'
];

const welcomeSettingsSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
    
    // Channel Welcome Settings
    welcomeChannelId: { type: String },
    channelStatus: { type: Boolean, default: false },
    
    // DM Settings
    dmStatus: { type: Boolean, default: false },
    
    // Channel Welcome Embed Configuration
    channelEmbed: {
        title: { type: String, default: 'Welcome!' },
        description: { type: String, default: '{member}, You are the **{membercount}{suffix}** member of our server!' },
        color: { type: String, default: '#00e5ff' },
        author: {
            name: { type: String, default: '' },
            iconURL: { type: String, default: '' },
            url: { type: String, default: '' }
        },
        footer: {
            text: { type: String, default: "We're glad to have you here!" },
            iconURL: { type: String, default: '' }
        },
        thumbnail: { 
            type: { type: String, enum: thumbnailImageOptions, default: 'serverimage' }
        },
        image: {
            useWcard: { type: Boolean, default: true },
            customURL: { type: String, default: '' }
        },
        fields: [{
            name: { type: String, default: 'Username' },
            value: { type: String, enum: fieldOptions, default: 'username' },
            inline: { type: Boolean, default: true }
        }, {
            name: { type: String, default: 'Join Date' },
            value: { type: String, enum: fieldOptions, default: 'joindate' },
            inline: { type: Boolean, default: true }
        }, {
            name: { type: String, default: 'Account Created' },
            value: { type: String, enum: fieldOptions, default: 'accountcreated' },
            inline: { type: Boolean, default: true }
        }]
    },
    
    // DM Welcome Embed Configuration
    dmEmbed: {
        title: { type: String, default: 'Welcome to the Server!' },
        description: { type: String, default: 'Welcome {username}! Thanks for joining {servername}!' },
        color: { type: String, default: '#00e5ff' },
        footer: {
            text: { type: String, default: 'Enjoy your stay!' },
            iconURL: { type: String, default: '' }
        },
        thumbnail: { 
            type: { type: String, enum: thumbnailImageOptions, default: 'userimage' }
        },
        image: {
            useWcard: { type: Boolean, default: false },
            customURL: { type: String, default: '' }
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WelcomeSettings', welcomeSettingsSchema);