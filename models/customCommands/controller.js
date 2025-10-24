const CustomCommand = require('./schema');

async function createOrUpdateCommand(userId, commandName, response) {
  await CustomCommand.findOneAndUpdate(
    { userId, commandName },
    { $set: { response } },
    { upsert: true, new: true }
  );
}

async function getUserCommands(userId) {
  return await CustomCommand.find({ userId }).lean();
}

async function deleteCommand(userId, commandName, isAdmin = false) {
  const query = isAdmin ? { commandName } : { userId, commandName };
  const result = await CustomCommand.deleteOne(query);
  return result.deletedCount > 0;
}

module.exports = {
  createOrUpdateCommand,
  getUserCommands,
  deleteCommand,
};
