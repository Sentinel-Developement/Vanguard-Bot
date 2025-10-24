const Application = require('./applications');
const { v4: uuidv4 } = require('uuid');

async function createApplication(guildId, appName) {
    const application = new Application({ guildId, appName });
    await application.save();
}

async function addQuestion(guildId, appName, questionText) {
    const newQuestion = {
        id: uuidv4(),
        text: questionText
    };

    await Application.findOneAndUpdate(
        { guildId, appName },
        { $push: { questions: newQuestion } }
    );
}

async function removeQuestion(guildId, appName, index) {
    const app = await Application.findOne({ guildId, appName });
    if (!app || index < 0 || index >= app.questions.length) return;

    app.questions.splice(index, 1);
    await app.save();
}

async function deleteApplication(guildId, appName) {
    const result = await Application.deleteOne({ guildId, appName });
    return result.deletedCount > 0;
}

async function activateApplication(guildId, appName, mainChannel, responseChannel) {
    await Application.findOneAndUpdate(
        { guildId, appName },
        {
            isActive: true,
            mainChannel,
            responseChannel
        }
    );
}

async function getActiveApplication(guildId) {
    return await Application.findOne({ guildId, isActive: true });
}

async function getApplication(guildId, appName) {
    return await Application.findOne({ guildId, appName });
}

async function getAllApplications(guildId) {
    return await Application.find({ guildId });
}

module.exports = {
    createApplication,
    addQuestion,
    removeQuestion,
    deleteApplication,
    activateApplication,
    getActiveApplication,
    getApplication,
    getAllApplications
};
