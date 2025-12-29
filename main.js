const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
require('dotenv').config();
const axios = require('axios');
const config = require('./config.json');
const colors = require('./UI/colors/colors');
const loadLogHandlers = require('./logHandlers');
const scanCommands = require('./utils/scanCommands');
const { EmbedBuilder, Partials } = require('discord.js');
const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
    }),
    partials: [Partials.Channel]
});

client.commands = new Collection();
require('events').defaultMaxListeners = 100;


const loadEvents = require('./handlers/events');


loadEvents(client);


async function fetchExpectedCommandsCount() {
    try {
        const response = await axios.get('https://server-backend-tdpa.onrender.com/api/expected-commands-count');
        return response.data.expectedCommandsCount;
    } catch (error) {
        return -1;
    }
}

async function verifyCommandsCount() {

    console.log('\n' + '─'.repeat(60));
    console.log(`${colors.yellow}${colors.bright}             🔍 VERIFICATION 🔍${colors.reset}`);
    console.log('─'.repeat(60));

    const expectedCommandsCount = await fetchExpectedCommandsCount();
    const registeredCommandsCount = scanCommands(config);


    if (expectedCommandsCount === -1) {
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Server Status: OFFLINE ❌${colors.reset}`);
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Unable to verify commands${colors.reset}`);
        return;
    }


    if (registeredCommandsCount !== expectedCommandsCount) {
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Commands Mismatch Detected ⚠️${colors.reset}`);
        console.log(`${colors.yellow}[ DETAILS ]${colors.reset} ${colors.red}Current Commands: ${colors.reset}${registeredCommandsCount}`);
        console.log(`${colors.yellow}[ DETAILS ]${colors.reset} ${colors.red}Expected Commands: ${colors.reset}${expectedCommandsCount}`);
        console.log(`${colors.yellow}[ STATUS  ]${colors.reset} ${colors.red}Action Required: Please verify command integrity${colors.reset}`);
    } else {
        console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}Command Count: ${registeredCommandsCount} ✓${colors.reset}`);
        console.log(`${colors.cyan}[ SECURITY ]${colors.reset} ${colors.green}Command Integrity Verified ✅${colors.reset}`);
        console.log(`${colors.cyan}[ STATUS   ]${colors.reset} ${colors.green}Bot is Secured and Ready 🛡️${colors.reset}`);
    }

    console.log('─'.repeat(60));
}
const fetchAndRegisterCommands = async () => {
    try {
        const response = await axios.get('https://server-backend-tdpa.onrender.com/api/commands');
        const commands = response.data;

        commands.forEach(command => {
            command.source = 'shiva';
            client.commands.set(command.name, {
                ...command,
                execute: async (interaction) => {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle(command.embed.title)
                            .setDescription(command.embed.description)
                            .setImage(command.embed.image)
                            .addFields(command.embed.fields)
                            .setColor(command.embed.color)
                            .setFooter({
                                text: command.embed.footer.text,
                                iconURL: command.embed.footer.icon_url
                            })
                            .setAuthor({
                                name: command.embed.author.name,
                                iconURL: command.embed.author.icon_url
                            });

                        await interaction.reply({ embeds: [embed] });
                    } catch (error) {
                        //console.error(`Error executing command ${command.name}:`, error);
                        //await interaction.reply('Failed to execute the command.');
                    }
                }
            });
        });
        //console.log('Commands fetched and registered successfully.');
    } catch (error) {
        //console.error('Error fetching commands:', error);
    }
};

require('./handlers/security')(client);
require('./handlers/applications')(client);
require('./handlers/server');
require('./handlers/economyScheduler')(client);
require('./handlers/embedScheduler')(client);
require('./handlers/embedBuilderModals')(client);
require('./handlers/giveawayHandler')(client);
require('./handlers/serverStatsHandler')(client);
const boostHandler = require('./handlers/boostHandler');
boostHandler(client);
const ModMailHandler = require('./handlers/modMailHandler');
const LevelingHandler = require('./handlers/levelingHandler');
let levelingHandler;
const ReactionRoleHandler = require('./handlers/reactionRoleHandler');
const ModalHandler = require('./handlers/reactionRolemodalHandler');
const reactionRoleHandler = new ReactionRoleHandler(client);
const modalHandler = new ModalHandler(client);

const afkButtonHandler = require('./handlers/afkHandler');
const BirthdayHandlers = require('./handlers/birthdayHandlers');
new BirthdayHandlers(client);
client.on('interactionCreate', afkButtonHandler.execute);

client.once('ready', async () => {
    console.log(`[ CORE ] Bot Name: ${client.user.tag}`);
    console.log(`[ CORE ] Client ID: ${client.user.id}`);
    loadLogHandlers(client);
    new ModMailHandler(client);
    levelingHandler = new LevelingHandler(client);
    try {
        await verifyCommandsCount();
        await fetchAndRegisterCommands();
        await require('./handlers/commands')(client, config, colors);


    } catch (error) {
        console.log(`${colors.red}[ ERROR ]${colors.reset} ${colors.red}${error}${colors.reset}`);
    }
});

client.login(process.env.TOKEN || config.token);

module.exports = client;
