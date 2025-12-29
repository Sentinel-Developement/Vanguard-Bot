const mongoose = require('mongoose');

const EmbedFieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 256
    },
    value: {
        type: String,
        required: true,
        maxlength: 1024
    },
    inline: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const EmbedAuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 256
    },
    url: String,
    iconURL: String
}, { _id: false });

const EmbedFooterSchema = new mongoose.Schema({
    text: {
        type: String,
        maxlength: 2048
    },
    iconURL: String
}, { _id: false });

const EmbedSchema = new mongoose.Schema({
    // Basic identification
    embedId: {
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
    
    // Embed properties
    title: {
        type: String,
        maxlength: 256
    },
    description: {
        type: String,
        maxlength: 4096
    },
    url: String,
    color: {
        type: String,
        default: '#3498db',
        validate: {
            validator: function(v) {
                return /^#([0-9A-F]{6})$/i.test(v);
            },
            message: 'Color must be a valid hex color'
        }
    },
    timestamp: {
        type: Boolean,
        default: false
    },
    
    // Rich content
    author: EmbedAuthorSchema,
    footer: EmbedFooterSchema,
    image: String,
    thumbnail: String,
    
    // Fields (max 25)
    fields: {
        type: [EmbedFieldSchema],
        validate: {
            validator: function(fields) {
                return fields.length <= 25;
            },
            message: 'Maximum 25 fields allowed'
        },
        default: []
    },
    
    // Type and usage
    type: {
        type: String,
        enum: ['normal', 'scheduled', 'template'],
        default: 'normal'
    },
    category: {
        type: String,
        default: 'general'
    },
    tags: [String],
    
    // Usage statistics
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: Date,
    
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
    },
    updatedBy: String,
    
    // Permissions
    isPublic: {
        type: Boolean,
        default: false
    },
    allowedRoles: [String],
    allowedUsers: [String]
});

// Update the updatedAt field on save
EmbedSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Generate short readable IDs
EmbedSchema.statics.generateEmbedId = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'EMB-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

module.exports = mongoose.model('Embed', EmbedSchema);
