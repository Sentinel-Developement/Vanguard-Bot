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
        .setName('helper')
        .setDescription('🔧 Helper commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('color')
                .setDescription('Get info on a hex color')
                .addStringOption(option =>
                    option.setName('hex')
                        .setDescription('Hex color code (without #)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('randomcolor')
                .setDescription('Get a random hex color with image & name')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('periodic')
                .setDescription('Get info on a chemical element')
                .addStringOption(option =>
                    option.setName('element')
                        .setDescription('Element name, symbol, or number')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('randomperiodic')
                .setDescription('Get a random element from the periodic table')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('Translate text to specified language')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to translate')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('to')
                        .setDescription('Target language code (e.g., es, fr, de)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('encode')
                .setDescription('Encode text into binary')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to encode')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('decode')
                .setDescription('Decode binary into text')
                .addStringOption(option =>
                    option.setName('binary')
                        .setDescription('Binary code to decode')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reverse')
                .setDescription('Reverse the provided text')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to reverse')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('morse')
                .setDescription('Convert text to morse code')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to convert to morse')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('doublestruck')
                .setDescription('Convert text to double struck font')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to convert')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('screenshot')
                .setDescription('Screenshot a website')
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('Website URL to screenshot')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            let response, embed;

            switch (subcommand) {
                case 'color':
                    const hex = interaction.options.getString('hex').replace('#', '');
                    response = await axios.get(`https://api.popcat.xyz/color/${hex}`);
                    
                    embed = new EmbedBuilder()
                        .setTitle(`Color: #${hex.toUpperCase()}`)
                        .setColor(parseInt(hex, 16))
                        .addFields(
                            { name: 'Name', value: response.data.name || 'Unknown', inline: true },
                            { name: 'Hex', value: `#${response.data.hex}`, inline: true },
                            { name: 'RGB', value: `rgb(${response.data.rgb.r}, ${response.data.rgb.g}, ${response.data.rgb.b})`, inline: true }
                        )
                        .setImage(response.data.color_image);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'randomcolor':
                    response = await axios.get('https://api.popcat.xyz/randomcolor');
                    
                    embed = new EmbedBuilder()
                        .setTitle('Random Color')
                        .setColor(parseInt(response.data.hex.replace('#', ''), 16))
                        .addFields(
                            { name: 'Name', value: response.data.name, inline: true },
                            { name: 'Hex', value: response.data.hex, inline: true }
                        )
                        .setImage(response.data.color_image);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'periodic':
                    const element = interaction.options.getString('element');
                    response = await axios.get(`https://api.popcat.xyz/periodic-table?element=${element}`);
                    
                    embed = new EmbedBuilder()
                        .setTitle(`${response.data.name} (${response.data.symbol})`)
                        .setColor(0x0099FF)
                        .addFields(
                            { name: 'Atomic Number', value: response.data.atomic_number.toString(), inline: true },
                            { name: 'Atomic Mass', value: response.data.atomic_mass.toString(), inline: true },
                            { name: 'Period', value: response.data.period.toString(), inline: true },
                            { name: 'Phase', value: response.data.phase, inline: true },
                            { name: 'Discovered By', value: response.data.discovered_by || 'Unknown', inline: true }
                        )
                        .setDescription(response.data.summary)
                        .setImage(response.data.image);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'randomperiodic':
                    response = await axios.get('https://api.popcat.xyz/periodic-table');
                    
                    embed = new EmbedBuilder()
                        .setTitle(`${response.data.name} (${response.data.symbol})`)
                        .setColor(0x0099FF)
                        .addFields(
                            { name: 'Atomic Number', value: response.data.atomic_number.toString(), inline: true },
                            { name: 'Atomic Mass', value: response.data.atomic_mass.toString(), inline: true },
                            { name: 'Period', value: response.data.period.toString(), inline: true }
                        )
                        .setDescription(response.data.summary)
                        .setImage(response.data.image);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'translate':
                    const text = interaction.options.getString('text');
                    const targetLang = interaction.options.getString('to');
                    response = await axios.get(`https://api.popcat.xyz/translate?to=${targetLang}&text=${encodeURIComponent(text)}`);
                    
                    embed = new EmbedBuilder()
                        .setTitle('Translation')
                        .setColor(0x00FF00)
                        .addFields(
                            { name: 'Original', value: text, inline: false },
                            { name: 'Translated', value: response.data.translated, inline: false }
                        );
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'encode':
                    const encodeText = interaction.options.getString('text');
                    response = await axios.get(`https://api.popcat.xyz/encode?text=${encodeURIComponent(encodeText)}`);
                    
                    await interaction.editReply(`**Binary Encoded:**\n\`\`\`${response.data.binary}\`\`\``);
                    break;

                case 'decode':
                    const binary = interaction.options.getString('binary');
                    response = await axios.get(`https://api.popcat.xyz/decode?binary=${encodeURIComponent(binary)}`);
                    
                    await interaction.editReply(`**Decoded Text:**\n${response.data.text}`);
                    break;

                case 'reverse':
                    const reverseText = interaction.options.getString('text');
                    response = await axios.get(`https://api.popcat.xyz/reverse?text=${encodeURIComponent(reverseText)}`);
                    
                    await interaction.editReply(`**Reversed:**\n${response.data.text}`);
                    break;

                case 'morse':
                    const morseText = interaction.options.getString('text');
                    response = await axios.get(`https://api.popcat.xyz/texttomorse?text=${encodeURIComponent(morseText)}`);
                    
                    await interaction.editReply(`**Morse Code:**\n\`${response.data.morse}\``);
                    break;

                case 'doublestruck':
                    const dsText = interaction.options.getString('text');
                    response = await axios.get(`https://api.popcat.xyz/doublestruck?text=${encodeURIComponent(dsText)}`);
                    
                    await interaction.editReply(`**Double Struck:**\n${response.data.text}`);
                    break;

                case 'screenshot':
                    const url = interaction.options.getString('url');
                    const screenshotUrl = `https://api.popcat.xyz/screenshot?url=${encodeURIComponent(url)}`;
                    
                    embed = new EmbedBuilder()
                        .setTitle('Website Screenshot')
                        .setDescription(`Screenshot of: ${url}`)
                        .setImage(screenshotUrl)
                        .setColor(0x0099FF);
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;
            }

        } catch (error) {
            console.error('Utility command error:', error);
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