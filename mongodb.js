const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const colors = require('./UI/colors/colors');
const configPath = path.join(__dirname, 'config.json');
require('dotenv').config(); 
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const uri = config.mongodbUri || process.env.MONGODB_URI;
const client = new MongoClient(uri);
const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('\n' + '─'.repeat(40));
        console.log(`${colors.magenta}${colors.bright}🕸️  DATABASE CONNECTION${colors.reset}`);
        console.log('─'.repeat(40));
        console.log('\x1b[36m[ DATABASE ]\x1b[0m', '\x1b[32mConnected to MongoDB ✅\x1b[0m');

       
        await mongoose.connect(uri);
        console.log('\x1b[36m[ MONGOOSE ]\x1b[0m', '\x1b[32mConnected using Mongoose ✅\x1b[0m');

    } catch (err) {
        console.error("❌ Error connecting to MongoDB or Mongoose", err);
    }
}

const db = client.db("discord-bot");
const notificationsCollection = db.collection("notifications");
const nicknameConfigs = db.collection("nicknameConfig");
const playlistCollection = db.collection('lavalinkplaylist');
const autoplayCollection = db.collection('autoplaylavalink');
const botStatusCollection = db.collection('bot_status');

module.exports = {
    connectToDatabase,
    notificationsCollection,
    nicknameConfigs,
    playlistCollection,
    autoplayCollection,
    botStatusCollection,
};