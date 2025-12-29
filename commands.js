const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Create a new REST instance
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Function to delete all commands
async function deleteAllCommands() {
    try {
        console.log('Started deleting application (/) commands...');

        // Get the client ID from environment variables
        const clientId = process.env.CLIENT_ID;

        if (!clientId) {
            throw new Error('Please set your bot\'s CLIENT_ID in the .env file');
        }

        // Delete global commands
        console.log('Deleting global commands...');
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        // Delete guild-specific commands if GUILD_ID is provided
        if (process.env.GUILD_ID) {
            console.log('Deleting guild-specific commands...');
            await rest.put(
                Routes.applicationGuildCommands(clientId, process.env.GUILD_ID),
                { body: [] }
            );
        }

        console.log('Successfully deleted all application (/) commands!');
    } catch (error) {
        console.error('Error deleting commands:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

// Run the function
deleteAllCommands(); 