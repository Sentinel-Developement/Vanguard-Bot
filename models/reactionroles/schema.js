// schemas/reactionRoleSchema.js
const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({
  // Unique identifier for the reaction role setup
  setupId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Server information
  guildId: {
    type: String,
    required: true,
    index: true
  },
  
  // Channel and message info
  channelId: {
    type: String,
    required: true
  },
  
  messageId: {
    type: String,
    required: true,
    index: true
  },
  
  // Setup configuration - FIXED: Made optional during setup
  title: {
    type: String,
    maxLength: 256,
    default: '' // Allow empty during setup
  },
  
  description: {
    type: String,
    maxLength: 4000, // FIXED: Changed from 4096 to 4000 (Discord's actual limit)
    default: '' // Allow empty during setup
  },
  
  color: {
    type: String,
    default: '#6366f1'
  },
  
  // FIXED: Allow empty during setup
  type: {
    type: String,
    enum: ['buttons', 'menu', ''], // Added empty string to enum
    default: '' // Allow empty during setup
  },
  
  // For dropdown menus
  menuConfig: {
    placeholder: {
      type: String,
      maxLength: 150,
      default: 'Select your roles...'
    },
    minValues: {
      type: Number,
      default: 1
    },
    maxValues: {
      type: Number,
      default: 1
    }
  },
  
  // Roles configuration (max 5)
  roles: [{
    roleId: {
      type: String,
      required: true
    },
    roleName: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true,
      maxLength: 80
    },
    description: {
      type: String,
      maxLength: 100
    },
    emoji: {
      type: {
        id: String,
        name: String,
        animated: Boolean,
        unicode: Boolean
      },
      default: null
    },
    style: {
      type: String,
      enum: ['Primary', 'Secondary', 'Success', 'Danger'],
      default: 'Secondary'
    }
  }],
  
  // Settings
  settings: {
    requireRole: String,
    maxRolesPerUser: {
      type: Number,
      default: null // null = unlimited
    },
    removeOtherRoles: {
      type: Boolean,
      default: false
    },
    allowMultipleRoles: {
      type: Boolean,
      default: true
    }
  },
  
  // Statistics
  stats: {
    totalInteractions: {
      type: Number,
      default: 0
    },
    rolesGiven: {
      type: Number,
      default: 0
    },
    rolesRemoved: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  createdBy: {
    type: String,
    required: true
  },
  
  updatedBy: {
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
}, {
  timestamps: true
});

// Custom validation method to ensure required fields are filled when setup is complete
reactionRoleSchema.methods.validateComplete = function() {
  const errors = [];
  
  if (!this.title || this.title.trim() === '') {
    errors.push('Title is required to complete setup');
  }
  
  if (!this.description || this.description.trim() === '') {
    errors.push('Description is required to complete setup');
  }
  
  if (!this.type || this.type === '') {
    errors.push('Type is required to complete setup');
  }
  
  if (this.roles.length === 0) {
    errors.push('At least one role is required to complete setup');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Pre-save middleware to update the updatedAt field
reactionRoleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
reactionRoleSchema.index({ guildId: 1, messageId: 1 });
reactionRoleSchema.index({ guildId: 1, channelId: 1 });
// reactionRoleSchema.index({ setupId: 1 });
reactionRoleSchema.index({ createdBy: 1 });
reactionRoleSchema.index({ guildId: 1, createdAt: -1 });

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);
