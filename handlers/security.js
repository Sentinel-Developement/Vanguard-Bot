// handlers/security.js
const AntiSpamModule = require('../antimodules/antiSpam');
const AntiLinkModule = require('../antimodules/antiLink');
const AntiNukeModule = require('../antimodules/antiNuke');
const AntiRaidModule = require('../antimodules/antiRaid');

module.exports = (client) => {
    // Instantiate all anti-modules with 'new'
    new AntiSpamModule(client);
    new AntiLinkModule(client);
    new AntiNukeModule(client);
    new AntiRaidModule(client);
    
    //console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAll anti-modules initialized! 🛡️\x1b[0m');
};
