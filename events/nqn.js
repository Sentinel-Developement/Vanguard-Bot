const { Client, GatewayIntentBits } = require('discord.js');
const NqnConfig = require('../models/nqn/nqnSchema');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => global.fetch(...args));


let nqnConfigCache = new Map();
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; 
async function loadNqnConfig() {
    const now = Date.now();
    
  
    if (now - lastCacheUpdate < CACHE_DURATION && nqnConfigCache.size > 0) {
        return nqnConfigCache;
    }
    
    try {
        const configs = await NqnConfig.find({ status: true }); 
        
        nqnConfigCache.clear();
        configs.forEach(config => {
            nqnConfigCache.set(config.serverId, {
                status: config.status,
                ownerId: config.ownerId,
                updatedAt: config.updatedAt
            });
        });
        
        lastCacheUpdate = now;
        return nqnConfigCache;
    } catch (err) {
        console.error('Error loading NQN config:', err);
        return nqnConfigCache; 
    }
}

async function getUniqueEmojiName(guild, baseName) {
    if (!guild.emojis.cache.some(emoji => emoji.name === baseName)) {
        return baseName; 
    }
    
    let counter = 1;
    let newName;
    
    do {
        newName = `${baseName}${counter}`;
        counter++;
    } while (guild.emojis.cache.some(emoji => emoji.name === newName));
    
    return newName;
}

async function downloadEmoji(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download emoji: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}


function hasNitro(member) {
    return member.premiumSince !== null || 
           member.avatar !== null; 
}

module.exports = async (client) => {

    await loadNqnConfig();


    setInterval(async () => {
        await loadNqnConfig();
    }, CACHE_DURATION);

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        const guildId = message.guild?.id;
        if (!guildId) return;
        
   
        const settings = nqnConfigCache.get(guildId);
        if (!settings || !settings.status) return;

        let userHasNitro = false;
        try {
            userHasNitro = hasNitro(message.member);
        } catch (error) {
            console.error('Error checking Nitro status:', error);
         
        }

 
        if (message.content.toLowerCase().startsWith('nqnadd ')) {
            if (!message.member.permissions.has('ManageEmojisAndStickers')) {
                return message.reply('You need the "Manage Emojis and Stickers" permission to add emojis.');
            }
            
            const customEmojiRegex = /<(a)?:([^:]+):(\d+)>/;
            const emojiMatch = message.content.match(customEmojiRegex);
            
            if (emojiMatch) {
                try {
                    const isAnimated = emojiMatch[1] === 'a';
                    const emojiName = emojiMatch[2];
                    const emojiId = emojiMatch[3];
                    const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
                    
                    const uniqueEmojiName = await getUniqueEmojiName(message.guild, emojiName);
                    
                    const buffer = await downloadEmoji(emojiUrl);
                    
                    const newEmoji = await message.guild.emojis.create({
                        attachment: buffer,
                        name: uniqueEmojiName,
                        reason: `Added by ${message.author.tag} via NQN`
                    });
                    
                    return message.reply(`Successfully added emoji ${newEmoji} with name \`:${uniqueEmojiName}:\``);
                } catch (error) {
                    console.error('Error adding emoji:', error);
                    return message.reply(`Failed to add the emoji: ${error.message}`);
                }
            } else {
                const textEmojiRegex = /:(\w+):/;
                const textMatch = message.content.match(textEmojiRegex);
                
                if (textMatch) {
                    const emojiName = textMatch[1];
                    
                    const emojiGuilds = client.guilds.cache;
                    const foundEmoji = emojiGuilds
                        .map(guild => guild.emojis.cache.find(e => e.name === emojiName))
                        .find(e => e);
                    
                    if (foundEmoji) {
                        try {
                            const uniqueEmojiName = await getUniqueEmojiName(message.guild, emojiName);
                            
                            const isAnimated = foundEmoji.animated;
                            const emojiUrl = foundEmoji.imageURL();
                            
                            const buffer = await downloadEmoji(emojiUrl);
                            
                            const newEmoji = await message.guild.emojis.create({
                                attachment: buffer,
                                name: uniqueEmojiName,
                                reason: `Added by ${message.author.tag} via NQN`
                            });
                            
                            return message.reply(`Successfully added emoji ${newEmoji} with name \`:${uniqueEmojiName}:\``);
                        } catch (error) {
                            console.error('Error adding emoji:', error);
                            //return message.reply(`Failed to add the emoji: ${error.message}`);
                        }
                    } else {
                        //return message.reply(`Could not find an emoji with the name \`:${emojiName}:\` in any server the bot has access to.`);
                    }
                } else {
                   // return message.reply('No valid emoji found in your message. Use `add <emoji>` or `add :emojiname:`.');
                }
            }
        }
        
 
        if (message.content.toLowerCase().startsWith('nqnreact ')) {
            const emojiRegex = /:(\w+):/g;
            const matches = [...message.content.matchAll(emojiRegex)];
            
            if (matches.length > 0 && message.reference && message.reference.messageId) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    
                    let reactSuccess = false;
                    
                    for (const [_, emojiName] of matches) {
                        const emoji = client.guilds.cache
                            .map(guild => guild.emojis.cache.find(e => e.name === emojiName))
                            .find(e => e);
                        
                        if (emoji) {
                            await repliedMessage.react(emoji.id);
                            reactSuccess = true;
                        }
                    }
                    
                    if (reactSuccess) {
                        try {
                            await message.delete();
                        } catch (deleteError) {
                            console.error('Failed to delete the reaction command message:', deleteError);
                        }
                    } else {
                        message.reply("Couldn't find the specified emoji to react with.");
                    }
                } catch (error) {
                    console.error('Failed to process reaction command:', error);
                    message.reply(`Error processing reaction: ${error.message}`);
                }
                
                return;
            }
        }

        // --- EMOJI REPLACEMENT LOGIC ---
        

        const textEmojiRegex = /:(\w+):/g;
        const discordEmojiRegex = /<(a)?:([^:]+):(\d+)>/g;
        

        const textMatches = [...message.content.matchAll(textEmojiRegex)];
        const discordMatches = [...message.content.matchAll(discordEmojiRegex)];
        
        let shouldReplaceMessage = false;
        let newContent = message.content;
        

        if (textMatches.length > 0 || discordMatches.length > 0) {
            const guildEmojis = message.guild.emojis.cache;
            const emojiGuilds = client.guilds.cache;
            
     
            for (const [fullMatch, emojiName] of textMatches) {
             
                if (message.content.includes(`<:${emojiName}:`) || message.content.includes(`<a:${emojiName}:`)) {
                    continue;
                }
                
           
                const isLocalEmoji = guildEmojis.some(e => e.name === emojiName);
                
                if (!userHasNitro || !isLocalEmoji) {

                    const emoji = emojiGuilds
                        .map(guild => guild.emojis.cache.find(e => e.name === emojiName))
                        .find(e => e);
                    
                    if (emoji) {
                        newContent = newContent.replace(new RegExp(`:${emojiName}:`, 'g'), emoji.toString());
                        shouldReplaceMessage = true;
                    }
                }
            }
            

            if (!userHasNitro && discordMatches.length > 0) {
                for (const [fullMatch, isAnimated, emojiName, emojiId] of discordMatches) {
           
                    if (isAnimated === 'a') {
                        const emojiString = `<${isAnimated}:${emojiName}:${emojiId}>`;
                        shouldReplaceMessage = true;
                    }
                }
            }
            
   
            if (shouldReplaceMessage) {
                try {
                    const webhook = await message.channel.createWebhook({
                        name: message.member.displayName,
                        avatar: message.author.displayAvatarURL(),
                    });
                    
                    await webhook.send({
                        content: newContent,
                        username: message.member.displayName,
                        avatarURL: message.author.displayAvatarURL(),
                        ...(message.reference ? {
                            reply: {
                                messageReference: message.reference.messageId,
                                failIfNotExists: false
                            }
                        } : {})
                    });
                    
                    await webhook.delete();
                    
                    try {
                        await message.delete();
                    } catch (deleteError) {
                        //console.error('Failed to delete the original message:', deleteError);
                    }
                } catch (error) {
                    //console.error('Failed to create or send webhook message:', error);
                }
            }
        }
    });


    client.on('nqnConfigUpdated', async (serverId) => {

        try {
            const config = await NqnConfig.findOne({ serverId });
            if (config && config.status) {
                nqnConfigCache.set(serverId, {
                    status: config.status,
                    ownerId: config.ownerId,
                    updatedAt: config.updatedAt
                });
            } else {
                nqnConfigCache.delete(serverId);
            }
        } catch (error) {
            console.error('Error updating NQN config cache:', error);
        }
    });

    client.on('ready', () => {
        //console.log('\x1b[36m[ NQN ]\x1b[0m', '\x1b[32mNQN Module Active with Enhanced Features ✅\x1b[0m');
    });

    client.on('error', (error) => {
        //console.error('An error occurred:', error);
    });

    client.on('unhandledRejection', (reason, promise) => {
        //console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
};