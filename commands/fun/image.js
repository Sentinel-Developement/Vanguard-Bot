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
        .setName('image')
        .setDescription('Image manipulation commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('blur')
                .setDescription('Blur an image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to blur')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('invert')
                .setDescription('Invert the colors of an image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to invert')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('greyscale')
                .setDescription('Convert image to greyscale')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to convert')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('huerotate')
                .setDescription('Rotate the hue of an image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to rotate hue')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('colorify')
                .setDescription('Overlay colors on your image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to colorify')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Color to overlay (red, blue, green, etc.)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Red', value: 'red' },
                            { name: 'Blue', value: 'blue' },
                            { name: 'Green', value: 'green' },
                            { name: 'Yellow', value: 'yellow' },
                            { name: 'Purple', value: 'purple' },
                            { name: 'Orange', value: 'orange' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('jail')
                .setDescription('Add jail overlay to image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to put in jail')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('wanted')
                .setDescription('Create a wanted poster with your image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image for wanted poster')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('gun')
                .setDescription('Add gun overlay to image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to add gun to')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('communism')
                .setDescription('Add communist overlay to image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to add communist overlay')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('drip')
                .setDescription('Add expensive drip jacket overlay')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to add drip to')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clown')
                .setDescription('Turn someone into a clown')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to clownify')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('uncover')
                .setDescription('Uncover someone hiding behind a wall')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to uncover')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ad')
                .setDescription('Make yourself an ad')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image for the ad')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('mnm')
                .setDescription('Turn your image into M&M shape')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to M&M-ify')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pet')
                .setDescription('Create a pet-pet GIF of any image')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to pet')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('nokia')
                .setDescription('Add your image on Nokia screen')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image for Nokia screen')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sadcat')
                .setDescription('Create a sad cat meme')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image for sad cat')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ship')
                .setDescription('Create a ship combination of 2 avatars')
                .addAttachmentOption(option =>
                    option.setName('image1')
                        .setDescription('First person\'s avatar')
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option.setName('image2')
                        .setDescription('Second person\'s avatar')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('quote')
                .setDescription('Quote text with image background')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Background image')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Quote text')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            let imageUrl;
            const embed = new EmbedBuilder().setColor(0x9932CC);

            switch (subcommand) {
                case 'blur':
                    const blurImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/blur?image=${encodeURIComponent(blurImage.url)}`;
                    embed.setTitle('Blurred Image').setImage(imageUrl);
                    break;

                case 'invert':
                    const invertImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/invert?image=${encodeURIComponent(invertImage.url)}`;
                    embed.setTitle('Inverted Colors').setImage(imageUrl);
                    break;

                case 'greyscale':
                    const greyImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/greyscale?image=${encodeURIComponent(greyImage.url)}`;
                    embed.setTitle('Greyscale Image').setImage(imageUrl);
                    break;

                case 'huerotate':
                    const hueImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/huerotate?image=${encodeURIComponent(hueImage.url)}`;
                    embed.setTitle('Hue Rotated').setImage(imageUrl);
                    break;

                case 'colorify':
                    const colorImage = interaction.options.getAttachment('image');
                    const color = interaction.options.getString('color');
                    imageUrl = `https://api.popcat.xyz/colorify?image=${encodeURIComponent(colorImage.url)}&color=${color}`;
                    embed.setTitle(`${color.charAt(0).toUpperCase() + color.slice(1)} Overlay`).setImage(imageUrl);
                    break;

                case 'jail':
                    const jailImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/jail?image=${encodeURIComponent(jailImage.url)}`;
                    embed.setTitle('Jail Time!').setImage(imageUrl);
                    break;

                case 'wanted':
                    const wantedImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/wanted?image=${encodeURIComponent(wantedImage.url)}`;
                    embed.setTitle('WANTED Poster').setImage(imageUrl);
                    break;

                case 'gun':
                    const gunImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/gun?image=${encodeURIComponent(gunImage.url)}`;
                    embed.setTitle('Gun Overlay').setImage(imageUrl);
                    break;

                case 'communism':
                    const commImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/communism?image=${encodeURIComponent(commImage.url)}`;
                    embed.setTitle('Our Comrade').setImage(imageUrl);
                    break;

                case 'drip':
                    const dripImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/drip?image=${encodeURIComponent(dripImage.url)}`;
                    embed.setTitle('Dripping with Style').setImage(imageUrl);
                    break;

                case 'clown':
                    const clownImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/clown?image=${encodeURIComponent(clownImage.url)}`;
                    embed.setTitle('🤡 Clown Time').setImage(imageUrl);
                    break;

                case 'uncover':
                    const uncoverImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/uncover?image=${encodeURIComponent(uncoverImage.url)}`;
                    embed.setTitle('Uncovered!').setImage(imageUrl);
                    break;

                case 'ad':
                    const adImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/ad?image=${encodeURIComponent(adImage.url)}`;
                    embed.setTitle('Advertisement').setImage(imageUrl);
                    break;

                case 'mnm':
                    const mnmImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/mnm?image=${encodeURIComponent(mnmImage.url)}`;
                    embed.setTitle('M&M Style').setImage(imageUrl);
                    break;

                case 'pet':
                    const petImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/pet?image=${encodeURIComponent(petImage.url)}`;
                    embed.setTitle('Pet Pet GIF').setImage(imageUrl);
                    break;

                case 'nokia':
                    const nokiaImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/nokia?image=${encodeURIComponent(nokiaImage.url)}`;
                    embed.setTitle('Nokia Screen').setImage(imageUrl);
                    break;

                case 'sadcat':
                    const sadcatImage = interaction.options.getAttachment('image');
                    imageUrl = `https://api.popcat.xyz/sadcat?image=${encodeURIComponent(sadcatImage.url)}`;
                    embed.setTitle('😿 Sad Cat Meme').setImage(imageUrl);
                    break;

                case 'ship':
                    const ship1 = interaction.options.getAttachment('image1');
                    const ship2 = interaction.options.getAttachment('image2');
                    imageUrl = `https://api.popcat.xyz/ship?user1=${encodeURIComponent(ship1.url)}&user2=${encodeURIComponent(ship2.url)}`;
                    embed.setTitle('💕 Ship Combination').setImage(imageUrl);
                    break;

                case 'quote':
                    const quoteImage = interaction.options.getAttachment('image');
                    const quoteText = interaction.options.getString('text');
                    imageUrl = `https://api.popcat.xyz/quote?image=${encodeURIComponent(quoteImage.url)}&text=${encodeURIComponent(quoteText)}`;
                    embed.setTitle('Inspirational Quote').setImage(imageUrl);
                    break;
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Image command error:', error);
            await interaction.editReply('❌ An error occurred while processing the image.');
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