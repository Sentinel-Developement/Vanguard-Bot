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
const { SlashCommandBuilder } = require('@discordjs/builders');
const { 
    CommandInteraction, 
    PermissionFlagsBits,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailAccessory
} = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');
const checkPermissions = require('../../utils/checkPermissions');

const activePolls = new Map();
const pollVotes = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createpoll')
        .setDescription('📊 Create clean polls with emoji reactions and V2 display')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('options')
                .setDescription('Number of options (2-10)')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(10))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the poll to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Poll duration in minutes (default: 60, max: 1440)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(1440))
        .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('Hide detailed voter info (default: false)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('First option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Second option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Third option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Fourth option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option5')
                .setDescription('Fifth option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option6')
                .setDescription('Sixth option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option7')
                .setDescription('Seventh option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option8')
                .setDescription('Eighth option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option9')
                .setDescription('Ninth option')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option10')
                .setDescription('Tenth option')
                .setRequired(false)),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (!await checkPermissions(interaction)) return;
            
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🚫 INSUFFICIENT PERMISSIONS**\nYou need **MANAGE_CHANNELS** permission to create polls.')
                    );

                return interaction.editReply({ 
                    components: [errorContainer], 
                    flags: MessageFlags.IsComponentsV2 
                });
            }

            const question = interaction.options.getString('question');
            const numOptions = interaction.options.getInteger('options');
            const channel = interaction.options.getChannel('channel');
            const duration = interaction.options.getInteger('duration') || 60;
            const anonymous = interaction.options.getBoolean('anonymous') || false;
            const sender = interaction.user;

          
            const options = [];
            for (let i = 1; i <= numOptions; i++) {
                const option = interaction.options.getString(`option${i}`);
                if (option && option.trim()) {
                    options.push(option.trim());
                }
            }

         
            while (options.length < numOptions) {
                if (options.length === 0) options.push('Yes');
                else if (options.length === 1) options.push('No');
                else options.push(`Option ${options.length + 1}`);
            }

          
            const pollId = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const endTime = Date.now() + (duration * 60000);

           
            const pollData = {
                id: pollId,
                question: question,
                options: options,
                creator: sender.id,
                creatorTag: sender.tag,
                channel: channel.id,
                guild: interaction.guild.id,
                startTime: Date.now(),
                endTime: endTime,
                duration: duration,
                anonymous: anonymous,
                active: true,
                messageId: null,
                client: interaction.client,
                reactionEmojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].slice(0, options.length)
            };

            activePolls.set(pollId, pollData);
            pollVotes.set(pollId, new Map());

            try {
             
                const pollContainer = this.createPollDisplay(pollId);

            
                const pollMessage = await channel.send({
                    components: [pollContainer],
                    flags: MessageFlags.IsComponentsV2
                });

             
                const poll = activePolls.get(pollId);
                for (const emoji of poll.reactionEmojis) {
                    await pollMessage.react(emoji);
                }

          
                poll.messageId = pollMessage.id;
                activePolls.set(pollId, poll);

            
                setTimeout(async () => {
                    if (activePolls.has(pollId) && activePolls.get(pollId).active) {
                        await this.closePoll(pollId, 'expired');
                    }
                }, duration * 60000);

            
                this.setupPollEventListeners(interaction.client);

             
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x2ecc71)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 POLL CREATED SUCCESSFULLY**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Question:** ${question}\n**Channel:** ${channel.name}\n**Duration:** ${duration} minutes`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Poll created')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**📋 Your Poll Options:**\n${options.map((opt, i) => `${poll.reactionEmojis[i]} **${opt}**`).join('\n')}\n\n**🎯 Users react with emojis to vote!\n✨ Unlimited duration support - no collector timeout limits!**`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Settings:**\n• **Duration:** ${duration} minutes ⏰ (unlimited support)\n• **Vote Switching:** ✅ Enabled (clean single reactions)\n• **Anonymous:** ${anonymous ? '✅ Enabled' : '❌ Disabled'}\n• **Auto-Close:** <t:${Math.floor(endTime / 1000)}:R>\n\n**Poll ID:** ${pollId.split('-').pop()}`)
                    );

                await interaction.editReply({
                    components: [successContainer],
                    flags: MessageFlags.IsComponentsV2
                });

            } catch (error) {
                console.error('Poll creation error:', error);
                
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**❌ POLL CREATION FAILED**\nFailed to create poll in the specified channel.')
                    );

                await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } else {
            const helpContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**📊 UNLIMITED DURATION POLLING**')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**No Limits:** Supports polls up to 1440 minutes (24 hours) with no collector timeout issues!\n\n**Example:**\n`/createpoll question:"Best game?" options:3 option1:"GTA" option2:"Fortnite" option3:"Minecraft" duration:1440`')
                );

            await interaction.reply({
                components: [helpContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },


    setupPollEventListeners(client) {
   
        if (client._pollListenersSetup) return;
        client._pollListenersSetup = true;

    
        client.on('messageReactionAdd', async (reaction, user) => {
            if (user.bot) return;

            
            const messageId = reaction.message.id;
            const emoji = reaction.emoji.name;

       
            for (const [pollId, poll] of activePolls.entries()) {
                if (poll.messageId === messageId && poll.active && poll.reactionEmojis.includes(emoji)) {
                    const newOptionIndex = poll.reactionEmojis.indexOf(emoji);
                    const votes = pollVotes.get(pollId);
                    const previousVote = votes.get(user.id);

                
                    if (previousVote !== undefined && previousVote !== newOptionIndex) {
                        try {
                            const previousEmoji = poll.reactionEmojis[previousVote];
                            const previousReaction = reaction.message.reactions.cache.get(previousEmoji);
                            if (previousReaction) {
                                await previousReaction.users.remove(user.id);
                            }
                        } catch (error) {
                            console.error('Error removing previous reaction:', error);
                        }
                    }

                 
                    votes.set(user.id, newOptionIndex);

                   
                    await this.updatePollDisplay(pollId);
                    break;
                }
            }
        });


        client.on('messageReactionRemove', async (reaction, user) => {
            if (user.bot) return;

            const messageId = reaction.message.id;
            const emoji = reaction.emoji.name;

         
            for (const [pollId, poll] of activePolls.entries()) {
                if (poll.messageId === messageId && poll.active && poll.reactionEmojis.includes(emoji)) {
                    const optionIndex = poll.reactionEmojis.indexOf(emoji);
                    const votes = pollVotes.get(pollId);

                    if (votes.has(user.id) && votes.get(user.id) === optionIndex) {
                        votes.delete(user.id);
                        await this.updatePollDisplay(pollId);
                    }
                    break;
                }
            }
        });
    },


    createPollDisplay(pollId) {
        const poll = activePolls.get(pollId);
        const votes = pollVotes.get(pollId);

        if (!poll || !votes) {
            return new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**❌ POLL ERROR**\nPoll data unavailable.')
                );
        }

    
        const voteCounts = Array(poll.options.length).fill(0);
        
        for (const [userId, optionIndex] of votes.entries()) {
            voteCounts[optionIndex]++;
        }

        const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
        const maxVotes = Math.max(...voteCounts, 1);

     
        const optionsDisplay = poll.options.map((option, index) => {
            const voteCount = voteCounts[index];
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const barLength = Math.round((voteCount / maxVotes) * 15);
            const progressBar = voteCount > 0 ? '█'.repeat(barLength) + '░'.repeat(15 - barLength) : '░'.repeat(15);
            const emoji = poll.reactionEmojis[index];
            
            return `${emoji} **${option}**\n\`${progressBar}\` ${voteCount} votes • ${percentage}%`;
        }).join('\n\n');

      
        const timeRemaining = poll.active ? Math.max(0, Math.floor((poll.endTime - Date.now()) / 60000)) : 0;
        const statusEmoji = poll.active ? '🟢' : '🔴';
        const statusText = poll.active ? `${statusEmoji} Active • ${timeRemaining}m left` : `${statusEmoji} Closed`;

        return new ContainerBuilder()
            .setAccentColor(poll.active ? 0x3498db : 0x95a5a6)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent('**📊 LIVE POLL**')
            )
            .addSeparatorComponents(separator => separator)
            .addSectionComponents(
                section => section
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**${poll.question}**\n\n**Status:** ${statusText}\n**Total Votes:** ${totalVotes} • **Participants:** ${votes.size}`)
                    )
                    .setThumbnailAccessory(
                        thumbnail => thumbnail
                            .setURL(cmdIcons.PollIcon)
                            .setDescription('Live poll')
                    )
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent('**🗳️ VOTE OPTIONS & LIVE RESULTS:**')
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(optionsDisplay)
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(`**💡 How to Vote:**\n• React with emoji for your choice\n\n**Poll Info:**\n• **Duration:** ${poll.duration} minutes\n• **Anonymous:** ${poll.anonymous ? '✅ Yes' : '❌ No'}\n• **Ends:** <t:${Math.floor(poll.endTime / 1000)}:F>`)
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(`**Created by ${poll.creatorTag}** • **Poll ID:** ${pollId.split('-').pop()}`)
            );
    },

   
    async updatePollDisplay(pollId) {
        const poll = activePolls.get(pollId);
        if (!poll || !poll.messageId || !poll.client) return;

        try {
            const guild = await poll.client.guilds.fetch(poll.guild);
            const channel = await guild.channels.fetch(poll.channel);
            const message = await channel.messages.fetch(poll.messageId);

            const updatedContainer = this.createPollDisplay(pollId);

            await message.edit({
                components: [updatedContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error updating poll:', error);
        }
    },

    
    async closePoll(pollId, reason = 'manual') {
        const poll = activePolls.get(pollId);
        if (!poll) return;

        poll.active = false;
        activePolls.set(pollId, poll);

        const votes = pollVotes.get(pollId);
        const voteCounts = Array(poll.options.length).fill(0);
        
        for (const [userId, optionIndex] of votes.entries()) {
            voteCounts[optionIndex]++;
        }

        const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);
        const maxVotes = Math.max(...voteCounts);
        const winners = poll.options.filter((_, index) => voteCounts[index] === maxVotes);
        const winnerText = maxVotes === 0 ? 'No votes received' : 
                          winners.length === 1 ? winners[0] : 
                          `Tie: ${winners.join(', ')}`;

        const finalContainer = new ContainerBuilder()
            .setAccentColor(0xe74c3c)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent('**📊 POLL CLOSED - FINAL RESULTS**')
            )
            .addSeparatorComponents(separator => separator)
            .addSectionComponents(
                section => section
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**${poll.question}**\n\n**🏆 Winner:** ${winnerText}\n**Total Votes:** ${totalVotes} • **Participants:** ${votes.size}`)
                    )
                    .setThumbnailAccessory(
                        thumbnail => thumbnail
                            .setURL(cmdIcons.PollIcon)
                            .setDescription('Poll complete')
                    )
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent('**🏆 FINAL RESULTS:**')
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(poll.options.map((option, index) => {
                    const voteCount = voteCounts[index];
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isWinner = voteCount === maxVotes && maxVotes > 0;
                    const emoji = isWinner ? '🏆' : poll.reactionEmojis[index];
                    return `${emoji} **${option}:** ${voteCount} votes (${percentage}%)`;
                }).join('\n'))
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent(`• **Real-time tracking** - Live updates throughout entire duration\n\n**Created by ${poll.creatorTag}** • **Closed:** <t:${Math.floor(Date.now() / 1000)}:F>`)
            );

        await this.updatePollDisplayWithContainer(pollId, finalContainer);

  
        setTimeout(() => {
            activePolls.delete(pollId);
            pollVotes.delete(pollId);
        }, 60 * 60 * 1000);
    },

  
    async updatePollDisplayWithContainer(pollId, container) {
        const poll = activePolls.get(pollId);
        if (!poll || !poll.messageId || !poll.client) return;

        try {
            const guild = await poll.client.guilds.fetch(poll.guild);
            const channel = await guild.channels.fetch(poll.channel);
            const message = await channel.messages.fetch(poll.messageId);

            await message.edit({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Error updating poll container:', error);
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