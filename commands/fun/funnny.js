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
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('funny')
        .setDescription('Fun commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('meme')
                .setDescription('Get a random meme')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('8ball')
                .setDescription('Ask the magic 8ball a question')
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('Your question for the 8ball')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pickup')
                .setDescription('Get a random pickup line')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('showerthought')
                .setDescription('Get a random shower thought')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('wouldyourather')
                .setDescription('Get a would you rather question')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('mock')
                .setDescription('Convert text to sarcastic mocking tone')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to mock')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lulcat')
                .setDescription('Translate text to funny Lul Cat language')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to translate to cat language')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            let response, embed;

            switch (subcommand) {
                case 'meme':
                    response = await axios.get('https://api.popcat.xyz/meme');
                    
                    embed = new EmbedBuilder()
                        .setTitle(response.data.title)
                        .setImage(response.data.image)
                        .setFooter({ text: `👍 ${response.data.upvotes} | 💬 ${response.data.comments} | r/${response.data.subreddit}` })
                        .setColor(0xFF4500);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case '8ball':
                    const question = interaction.options.getString('question');
                    response = await axios.get('https://api.popcat.xyz/8ball');
                    
                    embed = new EmbedBuilder()
                        .setTitle('🎱 Magic 8Ball')
                        .addFields(
                            { name: 'Question', value: question, inline: false },
                            { name: 'Answer', value: response.data.answer, inline: false }
                        )
                        .setColor(0x000000);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'pickup':
                    response = await axios.get('https://api.popcat.xyz/pickuplines');
                    
                    embed = new EmbedBuilder()
                        .setTitle('💕 Pickup Line')
                        .setDescription(response.data.pickupline)
                        .setColor(0xFF69B4);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'showerthought':
                    response = await axios.get('https://api.popcat.xyz/showerthoughts');
                    
                    embed = new EmbedBuilder()
                        .setTitle('🚿 Shower Thought')
                        .setDescription(response.data.result)
                        .setFooter({ text: `👍 ${response.data.upvotes}` })
                        .setColor(0x87CEEB);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'wouldyourather':
                    response = await axios.get('https://api.popcat.xyz/wyr');
                    
                    embed = new EmbedBuilder()
                        .setTitle('🤔 Would You Rather?')
                        .setDescription(response.data.ops1 + '\n\n**OR**\n\n' + response.data.ops2)
                        .setColor(0x9932CC);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'mock':
                    const mockText = interaction.options.getString('text');
                    response = await axios.get(`https://api.popcat.xyz/mock?text=${encodeURIComponent(mockText)}`);
                    
                    await interaction.editReply(`**Mocking:** ${response.data.text}`);
                    break;

                case 'lulcat':
                    const catText = interaction.options.getString('text');
                    response = await axios.get(`https://api.popcat.xyz/lulcat?text=${encodeURIComponent(catText)}`);
                    
                    embed = new EmbedBuilder()
                        .setTitle('🐱 Lul Cat Translation')
                        .addFields(
                            { name: 'Original', value: catText, inline: false },
                            { name: 'Cat Language', value: response.data.text, inline: false }
                        )
                        .setColor(0xFFA500);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;
            }

        } catch (error) {
            console.error('Fun command error:', error);
            await interaction.editReply('❌ An error occurred while processing your request.');
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