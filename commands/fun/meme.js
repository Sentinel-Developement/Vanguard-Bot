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
        .setName('memes')
        .setDescription('😂 Create memes')
        .addSubcommand(subcommand =>
            subcommand
                .setName('drake')
                .setDescription('Create a Drake meme')
                .addStringOption(option =>
                    option.setName('top')
                        .setDescription('Text for top (bad thing)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('bottom')
                        .setDescription('Text for bottom (good thing)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('biden')
                .setDescription('Make Biden tweet anything')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('What should Biden tweet?')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pikachu')
                .setDescription('Create a surprised Pikachu meme')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text for the meme')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pooh')
                .setDescription('Create a Pooh meme (normal vs tuxedo)')
                .addStringOption(option =>
                    option.setName('text1')
                        .setDescription('Text for normal Pooh')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('text2')
                        .setDescription('Text for tuxedo Pooh')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('oogway')
                .setDescription('Create an Oogway quote meme')
                .addStringOption(option =>
                    option.setName('quote')
                        .setDescription('Wise quote from Master Oogway')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('opinion')
                .setDescription('Create an opinion meme')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Your opinion')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('facts')
                .setDescription('This man is speaking facts meme')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('The facts being spoken')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('jokeoverhead')
                .setDescription('Joke going over someone\'s head meme')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('The joke that went over their head')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('whowould')
                .setDescription('Create a WhoWouldWin meme')
                .addStringOption(option =>
                    option.setName('first')
                        .setDescription('First competitor')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('second')
                        .setDescription('Second competitor')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('alert')
                .setDescription('Create a fake iPhone alert')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Alert message')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('caution')
                .setDescription('Create a caution banner')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Caution message')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            let imageUrl;
            const embed = new EmbedBuilder().setColor(0xFF6B6B);

            switch (subcommand) {
                case 'drake':
                    const drakeTop = interaction.options.getString('top');
                    const drakeBottom = interaction.options.getString('bottom');
                    imageUrl = `https://api.popcat.xyz/drake?text1=${encodeURIComponent(drakeTop)}&text2=${encodeURIComponent(drakeBottom)}`;
                    embed.setTitle('Drake Meme').setImage(imageUrl);
                    break;

                case 'biden':
                    const bidenText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/biden?text=${encodeURIComponent(bidenText)}`;
                    embed.setTitle('Biden Tweet').setImage(imageUrl);
                    break;

                case 'pikachu':
                    const pikachuText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/pikachu?text=${encodeURIComponent(pikachuText)}`;
                    embed.setTitle('Surprised Pikachu').setImage(imageUrl);
                    break;

                case 'pooh':
                    const poohText1 = interaction.options.getString('text1');
                    const poohText2 = interaction.options.getString('text2');
                    imageUrl = `https://api.popcat.xyz/pooh?text1=${encodeURIComponent(poohText1)}&text2=${encodeURIComponent(poohText2)}`;
                    embed.setTitle('Pooh Meme').setImage(imageUrl);
                    break;

                case 'oogway':
                    const oogwayQuote = interaction.options.getString('quote');
                    imageUrl = `https://api.popcat.xyz/oogway?text=${encodeURIComponent(oogwayQuote)}`;
                    embed.setTitle('Master Oogway\'s Wisdom').setImage(imageUrl);
                    break;

                case 'opinion':
                    const opinionText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/opinion?text=${encodeURIComponent(opinionText)}`;
                    embed.setTitle('Opinion Meme').setImage(imageUrl);
                    break;

                case 'facts':
                    const factsText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/facts?text=${encodeURIComponent(factsText)}`;
                    embed.setTitle('This Man Is Speaking Facts').setImage(imageUrl);
                    break;

                case 'jokeoverhead':
                    const jokeText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/jokeoverhead?text=${encodeURIComponent(jokeText)}`;
                    embed.setTitle('Joke Over Head').setImage(imageUrl);
                    break;

                case 'whowould':
                    const first = interaction.options.getString('first');
                    const second = interaction.options.getString('second');
                    imageUrl = `https://api.popcat.xyz/whowouldwin?text1=${encodeURIComponent(first)}&text2=${encodeURIComponent(second)}`;
                    embed.setTitle('Who Would Win?').setImage(imageUrl);
                    break;

                case 'alert':
                    const alertText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/alert?text=${encodeURIComponent(alertText)}`;
                    embed.setTitle('iPhone Alert').setImage(imageUrl);
                    break;

                case 'caution':
                    const cautionText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/caution?text=${encodeURIComponent(cautionText)}`;
                    embed.setTitle('Caution Banner').setImage(imageUrl);
                    break;
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Meme command error:', error);
            await interaction.editReply('❌ An error occurred while creating the meme.');
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