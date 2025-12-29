const mongoose = require('mongoose');

const ServerConfigSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  botManagers: { type: [String], default: [] },
  adminRoles: { type: [String], default: [] },  
  modRoles: { type: [String], default: [] },   
  prefix: { type: String, default: '!' }
});

module.exports = mongoose.model('ServerConfig', ServerConfigSchema);
