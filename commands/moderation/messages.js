/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    PermissionsBitField,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const moment = require('moment');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messages')
        .setDescription('🧹 Advanced message management and bulk deletion tools')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addSubcommand(sub => sub.setName('usermessages').setDescription('Delete all user messages in the channel').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('specificuser').setDescription('Delete messages from a specific user').addUserOption(opt => opt.setName('user').setDescription('User whose messages will be deleted').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('botmessages').setDescription('Delete all bot messages in the channel').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('embeds').setDescription('Delete messages that contain embeds').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('links').setDescription('Delete messages that contain links').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('emojis').setDescription('Delete messages that contain emojis').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('attachments').setDescription('Delete messages containing attachments').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('mentions').setDescription('Delete messages that contain mentions').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('containsword').setDescription('Delete messages containing a specific word or phrase').addStringOption(opt => opt.setName('word').setDescription('Keyword to match in messages').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('pinned').setDescription('Delete all pinned messages').addIntegerOption(opt => opt.setName('count').setDescription('Max number of pinned messages to delete').setRequired(true)))
        .addSubcommand(sub => sub.setName('containsinvite').setDescription('Delete messages containing Discord invite links').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('startswith').setDescription('Delete messages starting with specific characters').addStringOption(opt => opt.setName('prefix').setDescription('Prefix to match').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('uppercase').setDescription('Delete messages written in full uppercase').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('lengthover').setDescription('Delete messages over a certain character length').addIntegerOption(opt => opt.setName('limit').setDescription('Character length threshold').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('reactionbased').setDescription('Delete messages with a high number of reactions').addIntegerOption(opt => opt.setName('minreactions').setDescription('Minimum reactions required').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('spam').setDescription('Delete messages identified as spam (rapid posting)').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)).addIntegerOption(opt => opt.setName('timeframe').setDescription('Time frame in seconds (default: 60)').setRequired(false)))
        .addSubcommand(sub => sub.setName('duplicates').setDescription('Delete duplicate messages in the channel').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)))
        .addSubcommand(sub => sub.setName('clean').setDescription('Comprehensive channel cleanup with multiple filters').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-1000)').setRequired(true)).addBooleanOption(opt => opt.setName('users').setDescription('Include user messages (default: true)').setRequired(false)).addBooleanOption(opt => opt.setName('bots').setDescription('Include bot messages').setRequired(false)).addBooleanOption(opt => opt.setName('links').setDescription('Include messages with links').setRequired(false)).addBooleanOption(opt => opt.setName('embeds').setDescription('Include messages with embeds').setRequired(false)))
        .addSubcommand(sub => sub.setName('stats').setDescription('Show detailed message statistics for the channel').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to analyze (1-1000)').setRequired(false)))
        .addSubcommand(sub => sub.setName('preview').setDescription('Preview messages that would be deleted without actually deleting them').addStringOption(opt => opt.setName('filter').setDescription('Filter type to preview').setRequired(true).addChoices({ name: 'bots', value: 'bots' }, { name: 'links', value: 'links' }, { name: 'embeds', value: 'embeds' }, { name: 'mentions', value: 'mentions' })).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to preview (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('help').setDescription('Show comprehensive help for message management commands')),

    async execute(interaction) {
        
if (!await checkPermissions(interaction, 'admin')) return;
        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;
        let channel;
        let count;
        let args = {};

       
        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply({ ephemeral: true });
            sender = interaction.user;
            subcommand = interaction.options.getSubcommand();
            channel = interaction.channel;
            count = interaction.options.getInteger('count');

         
            args = {
                user: interaction.options.getUser('user'),
                word: interaction.options.getString('word'),
                prefix: interaction.options.getString('prefix'),
                limit: interaction.options.getInteger('limit'),
                minreactions: interaction.options.getInteger('minreactions'),
                timeframe: interaction.options.getInteger('timeframe') || 60,
                users: interaction.options.getBoolean('users'),
                bots: interaction.options.getBoolean('bots'),
                links: interaction.options.getBoolean('links'),
                embeds: interaction.options.getBoolean('embeds'),
                filter: interaction.options.getString('filter')
            };
        } else {
           
            const message = interaction;
            sender = message.author;
            channel = message.channel;
            const cmdArgs = message.content.split(' ');
            cmdArgs.shift();
            subcommand = cmdArgs[0] || 'help';
            count = parseInt(cmdArgs[1]) || 10;
        }


        const sendReply = async (components) => {
            if (isSlashCommand) {
                return interaction.editReply({ components: components, flags: MessageFlags.IsComponentsV2 });
            } else {
                return interaction.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }
        };

    
        const member = await interaction.guild.members.fetch(sender.id).catch(() => null);
        if (!member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔒 ACCESS DENIED**\nRequired Permission: MANAGE_MESSAGES\nContact server administrators for access.')
                );

            return sendReply([errorContainer]);
        }

 
        if ((count < 1 || count > 1000) && subcommand !== 'help' && subcommand !== 'stats') {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff6b35)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**⚠️ INVALID PARAMETER**\nPlease provide a number between **1 and 1000**.\n\n**Enhanced Limit:** This command now supports up to 1000 messages for comprehensive cleaning.')
                );

            return sendReply([errorContainer]);
        }

  
        const advancedBulkDelete = async (messagesToDelete) => {
            if (messagesToDelete.length === 0) return 0;
            
            let totalDeleted = 0;
            const batches = [];
            
       
            for (let i = 0; i < messagesToDelete.length; i += 100) {
                batches.push(messagesToDelete.slice(i, i + 100));
            }

    
            for (const batch of batches) {
                try {
                    const deleted = await channel.bulkDelete(batch, true);
                    totalDeleted += deleted.size;
                    
                
                    if (batches.length > 1 && batch !== batches[batches.length - 1]) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    console.error('Batch deletion error:', error);
                }
            }

            return totalDeleted;
        };

    
        const fetchMessages = async (limit) => {
            const messages = [];
            let lastId;
            
            while (messages.length < limit) {
                const batch = await channel.messages.fetch({ 
                    limit: Math.min(100, limit - messages.length), 
                    before: lastId 
                });
                
                if (batch.size === 0) break;
                
                messages.push(...batch.values());
                lastId = batch.last().id;
            }
            
            return messages;
        };

        try {
       
            if (subcommand === 'help') {
                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498db)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🧹 ADVANCED MESSAGE MANAGEMENT SYSTEM**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**📋 Enhanced Bulk Deletion Tools**\nPowerful message management with support for up to 1000 messages per operation')
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Command help')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🎯 Target-Based Deletion:**\n• `usermessages` - Delete all user messages\n• `specificuser` - Delete messages from specific user\n• `botmessages` - Delete all bot messages\n• `clean` - Comprehensive channel cleanup')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📝 Content-Based Deletion:**\n• `embeds` - Delete messages with embeds\n• `links` - Delete messages with links\n• `emojis` - Delete messages with emojis\n• `attachments` - Delete messages with files')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔍 Advanced Filters:**\n• `mentions` - Delete messages with mentions\n• `containsword` - Delete messages with keywords\n• `startswith` - Delete messages with prefix\n• `uppercase` - Delete ALL CAPS messages')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 Smart Features:**\n• `spam` - Delete rapid posting (spam)\n• `duplicates` - Delete duplicate messages\n• `lengthover` - Delete long messages\n• `reactionbased` - Delete highly reacted messages')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🛠️ Utility Commands:**\n• `pinned` - Delete pinned messages\n• `containsinvite` - Delete invite links\n• `stats` - Channel message analytics\n• `preview` - Preview before deletion')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🚀 New Features:**\n• **Up to 1000 messages** - Enhanced bulk deletion capacity\n• **Smart Batching** - Automatic API limit handling\n• **Rate Limit Protection** - Prevents API errors\n• **Advanced Analytics** - Detailed channel insights')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**💡 Usage Examples:**\n• \`/messages clean 500 bots:true links:true\`\n• \`/messages specificuser @user 200\`\n• \`/messages containsword "spam" 300\`\n• \`/messages preview bots 50\`\n\n**Help requested by ${sender.tag} | Enhanced Version 3.5**`)
                    );

                return sendReply([helpContainer]);
            }

          
            if (subcommand === 'stats') {
                const scanCount = count || 200;
                const messages = await fetchMessages(scanCount);

                const stats = {
                    total: messages.length,
                    users: messages.filter(m => !m.author.bot).length,
                    bots: messages.filter(m => m.author.bot).length,
                    embeds: messages.filter(m => m.embeds.length > 0).length,
                    attachments: messages.filter(m => m.attachments.size > 0).length,
                    links: messages.filter(m => /(https?:\/\/[^\s]+)/gi.test(m.content)).length,
                    mentions: messages.filter(m => m.mentions.users.size > 0 || m.mentions.roles.size > 0).length,
                    reactions: messages.filter(m => m.reactions.cache.size > 0).length,
                    pinned: messages.filter(m => m.pinned).length
                };

                const topUsers = [...messages.reduce((acc, msg) => {
                    const count = acc.get(msg.author.id) || 0;
                    acc.set(msg.author.id, count + 1);
                    return acc;
                }, new Map())].sort((a, b) => b[1] - a[1]).slice(0, 5);

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x1abc9c)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 CHANNEL MESSAGE ANALYTICS**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Channel:** ${channel.name}\n**Messages Analyzed:** ${stats.total}\n**Time Period:** Last ${scanCount} messages\n**Analysis Date:** ${moment().format('MMMM Do YYYY, h:mm A')}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(channel.guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Channel analytics')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**👥 Message Distribution:**\n• **User Messages:** ${stats.users} (${((stats.users / stats.total) * 100).toFixed(1)}%)\n• **Bot Messages:** ${stats.bots} (${((stats.bots / stats.total) * 100).toFixed(1)}%)\n• **System Messages:** ${stats.total - stats.users - stats.bots}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**📎 Content Analysis:**\n• **With Embeds:** ${stats.embeds}\n• **With Attachments:** ${stats.attachments}\n• **With Links:** ${stats.links}\n• **With Mentions:** ${stats.mentions}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🎯 Engagement Metrics:**\n• **With Reactions:** ${stats.reactions}\n• **Pinned Messages:** ${stats.pinned}\n• **Average Length:** ${Math.round(messages.reduce((acc, m) => acc + m.content.length, 0) / stats.total)} chars\n• **Activity Level:** ${stats.total > 80 ? 'High' : stats.total > 40 ? 'Medium' : 'Low'}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🏆 Top Contributors:**\n${topUsers.length > 0 ? topUsers.map((user, i) => {
                            const userObj = messages.find(m => m.author.id === user[0])?.author;
                            return `${i + 1}. **${userObj?.username || 'Unknown'}** - ${user[1]} messages`;
                        }).join('\n') : 'No data available'}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**📈 Channel Health:**\n• **Activity Score:** ${Math.min(100, Math.round((stats.total / scanCount) * 100))}%\n• **Content Diversity:** ${stats.embeds + stats.attachments + stats.links > stats.total / 4 ? 'High' : 'Medium'}\n• **Engagement Rate:** ${((stats.reactions / stats.total) * 100).toFixed(1)}%\n• **Spam Risk:** ${stats.total > 90 && stats.users < 5 ? 'High' : 'Low'}\n\n**📊 Analytics by ${sender.tag}**`)
                    );

                return sendReply([statsContainer]);
            }

         
            if (subcommand === 'preview') {
                const messages = await fetchMessages(Math.min(count * 2, 200));
                let filteredMessages = [];

                switch (args.filter) {
                    case 'bots':
                        filteredMessages = messages.filter(msg => msg.author.bot);
                        break;
                    case 'links':
                        filteredMessages = messages.filter(msg => /(https?:\/\/[^\s]+)/gi.test(msg.content));
                        break;
                    case 'embeds':
                        filteredMessages = messages.filter(msg => msg.embeds.length > 0);
                        break;
                    case 'mentions':
                        filteredMessages = messages.filter(msg => msg.mentions.users.size > 0 || msg.mentions.roles.size > 0);
                        break;
                    default:
                        filteredMessages = messages;
                }

                const previewList = filteredMessages.slice(0, Math.min(count, 15));

                const previewContainer = new ContainerBuilder()
                    .setAccentColor(0xf39c12)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**👀 DELETION PREVIEW**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Filter:** ${args.filter}\n**Messages Found:** ${filteredMessages.length}\n**Showing:** ${previewList.length}\n**Channel:** ${channel.name}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Preview mode')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🔍 Messages to be deleted:**\n${previewList.map(msg => `• **${msg.author.username}:** ${msg.content.substring(0, 60)}${msg.content.length > 60 ? '...' : ''}`).join('\n') || 'No messages found'}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**⚠️ This is a preview only - no messages were deleted**\n**Preview by ${sender.tag}**`)
                    );

                return sendReply([previewContainer]);
            }

            
            const messages = await fetchMessages(Math.min(count * 2, 1000));
            let filteredMessages = [];

         
            switch (subcommand) {
                case 'usermessages':
                    filteredMessages = messages.filter(msg => !msg.author.bot).slice(0, count);
                    break;
                case 'specificuser':
                    if (!args.user) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ USER NOT FOUND**\nPlease provide a valid user!')
                            );
                        return sendReply([errorContainer]);
                    }
                    filteredMessages = messages.filter(msg => msg.author.id === args.user.id).slice(0, count);
                    break;
                case 'botmessages':
                    filteredMessages = messages.filter(msg => msg.author.bot).slice(0, count);
                    break;
                case 'embeds':
                    filteredMessages = messages.filter(msg => msg.embeds.length > 0).slice(0, count);
                    break;
                case 'links':
                    filteredMessages = messages.filter(msg => /(https?:\/\/[^\s]+)/gi.test(msg.content)).slice(0, count);
                    break;
                case 'emojis':
                    filteredMessages = messages.filter(msg => /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu.test(msg.content)).slice(0, count);
                    break;
                case 'attachments':
                    filteredMessages = messages.filter(msg => msg.attachments.size > 0).slice(0, count);
                    break;
                case 'mentions':
                    filteredMessages = messages.filter(msg => msg.mentions.users.size > 0 || msg.mentions.roles.size > 0 || msg.mentions.everyone).slice(0, count);
                    break;
                case 'containsword':
                    if (!args.word) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ MISSING PARAMETER**\nPlease provide a word to search for!')
                            );
                        return sendReply([errorContainer]);
                    }
                    filteredMessages = messages.filter(msg => msg.content.toLowerCase().includes(args.word.toLowerCase())).slice(0, count);
                    break;
                case 'pinned':
                    filteredMessages = messages.filter(msg => msg.pinned).slice(0, count);
                    break;
                case 'containsinvite':
                    filteredMessages = messages.filter(msg => /(discord\.gg|discordapp\.com\/invite|discord\.com\/invite)/i.test(msg.content)).slice(0, count);
                    break;
                case 'startswith':
                    if (!args.prefix) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ MISSING PARAMETER**\nPlease provide a prefix to search for!')
                            );
                        return sendReply([errorContainer]);
                    }
                    filteredMessages = messages.filter(msg => msg.content.startsWith(args.prefix)).slice(0, count);
                    break;
                case 'uppercase':
                    filteredMessages = messages.filter(msg => msg.content === msg.content.toUpperCase() && msg.content.length > 4 && /[A-Z]/.test(msg.content)).slice(0, count);
                    break;
                case 'lengthover':
                    if (!args.limit) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ MISSING PARAMETER**\nPlease provide a character limit!')
                            );
                        return sendReply([errorContainer]);
                    }
                    filteredMessages = messages.filter(msg => msg.content.length > args.limit).slice(0, count);
                    break;
                case 'reactionbased':
                    if (!args.minreactions) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**❌ MISSING PARAMETER**\nPlease provide minimum reaction count!')
                            );
                        return sendReply([errorContainer]);
                    }
                    filteredMessages = messages.filter(msg => msg.reactions.cache.reduce((sum, r) => sum + r.count, 0) >= args.minreactions).slice(0, count);
                    break;
                case 'spam':
                    const timeThreshold = Date.now() - (args.timeframe * 1000);
                    const userMessageCounts = new Map();

                    messages.forEach(msg => {
                        if (msg.createdTimestamp > timeThreshold) {
                            const count = userMessageCounts.get(msg.author.id) || 0;
                            userMessageCounts.set(msg.author.id, count + 1);
                        }
                    });

                    const spamUsers = [...userMessageCounts.entries()].filter(([id, count]) => count > 5).map(([id]) => id);
                    filteredMessages = messages.filter(msg => spamUsers.includes(msg.author.id) && msg.createdTimestamp > timeThreshold).slice(0, count);
                    break;
                case 'duplicates':
                    const contentMap = new Map();
                    const duplicateMessages = [];

                    messages.forEach(msg => {
                        const content = msg.content.trim().toLowerCase();
                        if (content && content.length > 5) {
                            if (contentMap.has(content)) {
                                duplicateMessages.push(msg);
                            } else {
                                contentMap.set(content, msg);
                            }
                        }
                    });

                    filteredMessages = duplicateMessages.slice(0, count);
                    break;
                    case 'clean':
                        const cleanFilters = [];
                        
                      
                        if (args.users !== false) { 
                            cleanFilters.push(msg => !msg.author.bot);
                        }
                        
                        
                        if (args.bots === true) cleanFilters.push(msg => msg.author.bot);
                        if (args.links === true) cleanFilters.push(msg => /(https?:\/\/[^\s]+)/gi.test(msg.content));
                        if (args.embeds === true) cleanFilters.push(msg => msg.embeds.length > 0);
                    
                
                        if (cleanFilters.length === 0) {
                            filteredMessages = messages.filter(msg => 
                                !msg.author.bot || 
                                msg.author.bot || 
                                /(https?:\/\/[^\s]+)/gi.test(msg.content) || 
                                msg.embeds.length > 0 
                            ).slice(0, count);
                        } else {
                            filteredMessages = messages.filter(msg => cleanFilters.some(filter => filter(msg))).slice(0, count);
                        }
                        break;
                default:
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff0000)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ UNKNOWN COMMAND**\nUnknown subcommand: \`${subcommand}\`\n\nUse \`/messages help\` to see all available commands.`)
                        );
                    return sendReply([errorContainer]);
            }

    
            if (!filteredMessages || filteredMessages.length === 0) {
                const noMessagesContainer = new ContainerBuilder()
                    .setAccentColor(0xffa500)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📭 NO MESSAGES FOUND**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Filter:** ${subcommand}\n**Messages Scanned:** ${messages.length}\n**Messages Found:** 0\n**Channel:** ${channel.name}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**💡 No messages matching your criteria were found.**\n**Search by ${sender.tag}**`)
                    );

                return sendReply([noMessagesContainer]);
            }

            
            const deletedCount = await advancedBulkDelete(filteredMessages);

       
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x00ff88)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🧹 CLEANUP SUCCESSFUL**')
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Operation:** ${subcommand}\n**Messages Deleted:** ${deletedCount}\n**Channel:** ${channel.name}\n**Executed by:** ${sender.tag}`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('Cleanup completed')
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🚀 Enhanced Features:**\n• **Batch Processing:** ${Math.ceil(deletedCount / 100)} batches executed\n• **Advanced Filtering:** ${subcommand} filter applied\n• **Safety Checks:** All messages under 14 days old\n• **Rate Limit Protection:** Automatic delay handling`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**📊 Operation Details:**\n• **Filter Applied:** ${subcommand}\n• **Messages Processed:** ${filteredMessages.length}\n• **Successfully Deleted:** ${deletedCount}\n• **Completion Time:** ${moment().format('MMMM Do YYYY, h:mm:ss A')}`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**✅ Channel cleanup completed successfully!**\n**🧹 Operation by ${sender.tag}**`)
                );

            return sendReply([successContainer]);

        } catch (error) {
            console.error('❌ Error during message deletion:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xe74c3c)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**❌ ERROR OCCURRED**')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Error Details:**\nSomething went wrong while processing messages.\n\n**Error:** \`${error.message || 'Unknown error'}\``)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**💡 Troubleshooting:**\n• Check bot permissions (Manage Messages)\n• Ensure messages are newer than 14 days\n• Verify channel access permissions\n• Try with a smaller message count')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**❌ Error for ${sender.tag}**`)
                );

            return sendReply([errorContainer]);
        }
    }
};
/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/