const ServerConfig = require('./schema');

async function getConfig(serverId) {
  return await ServerConfig.findOne({ serverId });
}

async function updateConfig(serverId, data) {
  return await ServerConfig.findOneAndUpdate(
    { serverId },
    { $set: data },
    { upsert: true, new: true }
  );
}

async function removeBotManagers(serverId, removeList) {
  return await ServerConfig.findOneAndUpdate(
    { serverId },
    { $pull: { botManagers: { $in: removeList } } },
    { new: true }
  );
}

async function removeAdminRoles(serverId, removeList) {
  return await ServerConfig.findOneAndUpdate(
    { serverId },
    { $pull: { adminRoles: { $in: removeList } } },
    { new: true }
  );
}

async function removeModRoles(serverId, removeList) {
  return await ServerConfig.findOneAndUpdate(
    { serverId },
    { $pull: { modRoles: { $in: removeList } } },
    { new: true }
  );
}

module.exports = {
  getConfig,
  updateConfig,
  removeBotManagers,
  removeAdminRoles,
  removeModRoles
};
