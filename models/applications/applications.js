
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    appName: { type: String, required: true },
    questions: [{
        id: String,
        text: String
      }],
    isActive: { type: Boolean, default: false },
    mainChannel: { type: String, default: null },
    responseChannel: { type: String, default: null }
  });
  
module.exports = mongoose.model('Application', ApplicationSchema);
