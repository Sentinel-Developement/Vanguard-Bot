const axios = require('axios');
const dotenv = require('dotenv');
const colors = require('../UI/colors/colors'); 
dotenv.config();

const client = require('../main');

const BACKEND = process.env.BACKEND || 'https://server-backend-tdpa.onrender.com';
const BOT_API = process.env.BOT_API;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;


function printBox({ title, lines, color = colors.cyan }) {
    console.log('\n' + '─'.repeat(60));
    console.log(`${color}${colors.bright}${title}${colors.reset}`);
    console.log('─'.repeat(60));
    lines.forEach(line => {
        console.log(`${color}${line}${colors.reset}`);
    });
    console.log('─'.repeat(60) + '\n');
}

async function initializeBot() {
    const BOT_ID = client.user?.id || 'AIO @1.4.1.0';

    if (!BOT_API || !DISCORD_USER_ID) {
        console.error(`${colors.red}❌ Missing BOT_API or DISCORD_USER_ID in .env file${colors.reset}`);
        process.exit(1);
    }

    try {
       
        const response = await axios.post(`${BACKEND}/api/verify-key`, {
            apiKey: BOT_API,
            discordId: DISCORD_USER_ID,
            botId: BOT_ID
        });

        if (response.data.success) {
            printBox({
                title: '[ ✅ API Key Verified ]',
                lines: [
                    `User: ${response.data.user?.username || DISCORD_USER_ID}`,
                    'Your bot is ready to go!',
                    'Visit https://glaceyt.com for more info.'
                ],
                color: colors.green
            });
            return true;
        } else {
            printBox({
                title: '[ ❌ Verification Failed ]',
                lines: [
                    response.data.message || 'Unknown error',
                    'No user account found for this Discord ID.',
                    'Visit https://glaceyt.com to register/login.'
                ],
                color: colors.red
            });
            process.exit(1);
        }
    } catch (error) {
        printBox({
            title: '[ ❌ Verification Error ]',
            lines: [
                error.response?.data?.message || error.message,
                'Visit https://glaceyt.com to get API.'
            ],
            color: colors.red
        });
        process.exit(1);
    }
}

module.exports = initializeBot;
