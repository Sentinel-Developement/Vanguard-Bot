const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const StickyMessage = require('../models/stickymessage/Schema');
const CountingConfig = require('../models/counting/Schema');
const configPath = path.join(__dirname, '..', 'config.json');
const lang = require('./loadLanguage');
const afkHandler = require('./afkHandler');
const { getUserCommands } = require('../models/customCommands/controller');
const stickyTimers = new Map();
const AutoResponderModel = require('../models/autoresponses/schema');
const ServerConfig = require('../models/serverConfig/schema');
const { handleFaqMessage } = require('../handlers/faqHandler');


const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;


        try {
            const faqHandled = await handleFaqMessage(message);
            if (faqHandled) return;
        } catch (faqError) {
            console.error('FAQ handler error:', faqError);
        }

        try {

            const { handleAFKRemoval, handleMentions } = afkHandler(message.client);
            await handleAFKRemoval(message);
            await handleMentions(message);

        } catch (afkError) {
            console.error('AFK handler error:', afkError);
        }

        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const content = message.content.toLowerCase().trim();


        try {
            const countingData = await CountingConfig.findOne({
                serverId: guildId,
                channelId: channelId,
                status: true
            });

            if (countingData) {
                const expectedCount = countingData.currentCount + 1;
                const userId = message.author.id;


                if (!/^\d+$/.test(content)) {
                    if (countingData.deleteWrongMessages) {
                        await message.delete().catch(() => { });
                    }

                    if (countingData.showErrorMessages) {
                        const errorMsg = await message.channel.send(
                            `${message.author}, please only send numbers! 🔢`
                        );
                        setTimeout(() => errorMsg.delete().catch(() => { }), countingData.errorMessageDuration);
                    }
                    return;
                }

                const userNumber = parseInt(content, 10);


                if (userNumber !== expectedCount) {
                    if (countingData.deleteWrongMessages) {
                        await message.delete().catch(() => { });
                    }

                    if (countingData.showErrorMessages) {
                        const errorMsg = await message.channel.send(
                            `${message.author}, wrong number! Expected **${expectedCount}** but got **${userNumber}**. 🔢`
                        );
                        setTimeout(() => errorMsg.delete().catch(() => { }), countingData.errorMessageDuration);
                    }
                    return;
                }


                if (!countingData.allowSameUser && countingData.lastUserId === userId) {
                    if (countingData.deleteWrongMessages) {
                        await message.delete().catch(() => { });
                    }

                    if (countingData.showErrorMessages) {
                        const errorMsg = await message.channel.send(
                            `${message.author}, you can't count twice in a row! Let someone else count. 👥`
                        );
                        setTimeout(() => errorMsg.delete().catch(() => { }), countingData.errorMessageDuration);
                    }
                    return;
                }


                await countingData.incrementCount(userId);


                if (MILESTONES.includes(userNumber)) {
                    await countingData.addMilestone(userNumber, userId);

                    const milestoneEmbed = new EmbedBuilder()
                        .setColor('#ffd700')
                        .setTitle('🎉 Milestone Achieved!')
                        .setDescription(`Congratulations! The server reached **${userNumber}** counts!`)
                        .addFields(
                            { name: '🏆 Achieved by', value: `<@${userId}>`, inline: true },
                            { name: '📊 Total Messages', value: `${countingData.totalMessages}`, inline: true },
                            { name: '🔄 Times Reset', value: `${countingData.resetCount}`, inline: true }
                        )
                        .setTimestamp();

                    await message.channel.send({ embeds: [milestoneEmbed] });
                }


                await message.react('✅').catch(() => { });


                if (userNumber % 100 === 0) {
                    await message.react('💯').catch(() => { });
                } else if (userNumber % 50 === 0) {
                    await message.react('🎯').catch(() => { });
                } else if (userNumber % 25 === 0) {
                    await message.react('⭐').catch(() => { });
                }
            }
        } catch (countingError) {
            console.error('Advanced counting system error:', countingError);
        }

        try {
            const stickyMessage = await StickyMessage.findOne({
                serverId: guildId,
                channelId: channelId,
                active: true
            });

            if (stickyMessage) {

                if (stickyMessage.ignoreBots && message.author.bot) return;


                if (stickyMessage.timerMode === 'message') {
                    await handleMessageBasedSticky(message, stickyMessage);
                } else if (stickyMessage.timerMode === 'time') {
                    await handleTimeBasedSticky(message, stickyMessage);
                }
            }
        } catch (stickyError) {
            console.error('Enhanced sticky message error:', stickyError);
        }


        try {
            const autoResponders = await AutoResponderModel.find({ guildId: message.guild.id });

            if (autoResponders.length > 0) {
                for (const responder of autoResponders) {
                    if (!responder.status) continue;
                    if (!responder.channels.includes('all') && !responder.channels.includes(channelId)) continue;

                    let match = false;
                    const triggerLower = responder.trigger.toLowerCase();
                    const contentLower = content.toLowerCase();

                    if (responder.matchType === 'exact' && contentLower === triggerLower) match = true;
                    else if (responder.matchType === 'partial' && contentLower.includes(triggerLower)) match = true;
                    else if (responder.matchType === 'whole' && contentLower.trim() === triggerLower) match = true;

                    if (!match) continue;

                    if (responder.embedData) {
                        try {
                            const embedData = responder.embedData;

                            const embed = new EmbedBuilder()
                                .setTitle(embedData.title || 'AutoResponder')
                                .setDescription(embedData.description || 'No description provided.')
                                .setColor(embedData.color || '#2f3136');


                            if (embedData.footer) {
                                const footerData = {};
                                if (embedData.footer.text) footerData.text = embedData.footer.text;
                                if (embedData.footer.iconURL) footerData.iconURL = embedData.footer.iconURL;
                                if (footerData.text) embed.setFooter(footerData);
                            }


                            if (embedData.author && embedData.author.name) {
                                embed.setAuthor({
                                    name: embedData.author.name,
                                    iconURL: embedData.author.iconURL || embedData.author.url || null,
                                    url: null
                                });
                            }


                            if (embedData.image) embed.setImage(embedData.image);
                            if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);


                            if (Array.isArray(embedData.fields) && embedData.fields.length >= 2) {
                                const safeFields = embedData.fields.map(field => ({
                                    name: field.name,
                                    value: field.value,
                                    inline: field.inline ?? false
                                }));
                                embed.addFields(safeFields);
                            }

                            await message.reply({ embeds: [embed] });
                        } catch (embedError) {
                            console.error('AutoResponder Embed Error:', embedError);
                            await message.reply('❌ Invalid embed format in AutoResponder.');
                        }
                    } else {
                        await message.reply(responder.textResponse || '✅ AutoResponder triggered!');
                    }


                    break;
                }
            }
        } catch (autoResponderError) {
            console.error('AutoResponder error:', autoResponderError);
        }


        try {
            let config;
            try {
                const data = fs.readFileSync(configPath, 'utf8');
                config = JSON.parse(data);
            } catch (err) {
                return message.reply(lang.error);
            }

            const serverConfig = await ServerConfig.findOne({ serverId: guildId });
            const prefix = serverConfig?.prefix || config.prefix;

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();


            const customCommands = await getUserCommands(message.author.id);
            const customCommand = customCommands.find(cmd => cmd.commandName === commandName);

            if (customCommand) {
                await message.reply(customCommand.response);
                return;
            }


            const command = client.commands.get(commandName);
            if (command) {
                await command.execute(message, args, client);
            }
        } catch (commandError) {
            console.error('Command system error:', commandError);
        }
    },
};


async function handleMessageBasedSticky(message, stickyMessage) {
    const channelId = message.channel.id;
    const timerKey = `${stickyMessage.serverId}_${channelId}`;


    stickyMessage.currentMessageCount += 1;
    await stickyMessage.save();


    if (stickyMessage.currentMessageCount >= stickyMessage.messageCount) {
        stickyMessage.currentMessageCount = 0;
        await stickyMessage.save();


        if (stickyTimers.has(timerKey)) return;
        stickyTimers.set(timerKey, true);
        setTimeout(() => stickyTimers.delete(timerKey), 3000);

        await sendAdvancedStickyMessage(message.channel, stickyMessage);
    }
}

async function handleTimeBasedSticky(message, stickyMessage) {
    const channelId = message.channel.id;
    const timerKey = `${stickyMessage.serverId}_${channelId}`;

    const now = new Date();
    const timeDiff = (now - stickyMessage.lastSent) / 1000;

    if (timeDiff >= stickyMessage.timerInterval) {
        if (stickyTimers.has(timerKey)) return;

        stickyTimers.set(timerKey, true);
        setTimeout(() => stickyTimers.delete(timerKey), 3000);

        stickyMessage.lastSent = now;
        await stickyMessage.save();

        await sendAdvancedStickyMessage(message.channel, stickyMessage);
    }
}

async function sendAdvancedStickyMessage(channel, stickyMessage) {
    try {

        if (stickyMessage.deleteOldMessage && stickyMessage.lastMessageId) {
            try {
                const oldMessage = await channel.messages.fetch(stickyMessage.lastMessageId);
                if (oldMessage) await oldMessage.delete();
            } catch (err) {
                console.warn(`Could not delete old sticky message: ${err.message}`);
            }
        }

        const messagePayload = {};


        if ((stickyMessage.messageType === 'text' || stickyMessage.messageType === 'both') && stickyMessage.textContent) {
            messagePayload.content = stickyMessage.textContent;
        }


        if (stickyMessage.messageType === 'embed' || stickyMessage.messageType === 'both') {
            const embed = buildAdvancedEmbed(stickyMessage);
            if (embed) messagePayload.embeds = [embed];
        }


        if (messagePayload.content || messagePayload.embeds) {
            const sentMessage = await channel.send(messagePayload);
            stickyMessage.lastMessageId = sentMessage.id;
            await stickyMessage.save();
        }

    } catch (error) {
        console.error('Error sending advanced sticky message:', error);
    }
}

function buildAdvancedEmbed(stickyMessage) {
    try {
        const embedData = stickyMessage.embed;
        const embed = new EmbedBuilder();

        if (embedData.title) embed.setTitle(embedData.title);
        if (embedData.description) embed.setDescription(embedData.description);
        if (embedData.color) embed.setColor(embedData.color);


        if (embedData.author?.name) {
            const authorData = { name: embedData.author.name };
            if (embedData.author.iconURL) authorData.iconURL = embedData.author.iconURL;
            if (embedData.author.url) authorData.url = embedData.author.url;
            embed.setAuthor(authorData);
        }


        if (embedData.footer?.text) {
            const footerData = { text: embedData.footer.text };
            if (embedData.footer.iconURL) footerData.iconURL = embedData.footer.iconURL;
            embed.setFooter(footerData);
        }

        if (embedData.image) embed.setImage(embedData.image);
        if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);


        if (embedData.fields && embedData.fields.length > 0) {
            const validFields = embedData.fields.filter(field => field.name && field.value);
            if (validFields.length > 0) embed.addFields(validFields);
        }

        if (embedData.timestamp) embed.setTimestamp();

        return embed;
    } catch (error) {
        console.error('Error building advanced embed:', error);
        return null;
    }
}