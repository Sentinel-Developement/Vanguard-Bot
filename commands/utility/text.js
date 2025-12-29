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
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('Convert text to various styles, fonts, and formats')
        .addSubcommand(sub => sub
            .setName('style')
            .setDescription('Apply Discord markdown styles to your text')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to style')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('format')
                    .setDescription('Choose formatting style')
                    .addChoices(
                        { name: 'Bold', value: 'bold' },
                        { name: 'Italic', value: 'italic' },
                        { name: 'Underline', value: 'underline' },
                        { name: 'Strikethrough', value: 'strike' },
                        { name: 'Bold Italic', value: 'bolditalic' },
                        { name: 'Bold Underline', value: 'boldunder' },
                        { name: 'All Styles', value: 'all' },
                        { name: 'Code Block', value: 'code' },
                        { name: 'Inline Code', value: 'inline' },
                        { name: 'Spoiler', value: 'spoiler' }
                    )
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('Hex color (without #) for embed background')
                    .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('emoji')
            .setDescription('Convert text to regional indicator emojis')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to convert to emojis')
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName('spaces')
                    .setDescription('Add extra spacing between letters')
                    .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('unicode')
            .setDescription('Convert text to Unicode font variations')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to convert')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('font')
                    .setDescription('Choose Unicode font style')
                    .addChoices(
                        { name: 'Mathematical Bold', value: 'mathbold' },
                        { name: 'Mathematical Italic', value: 'mathitalic' },
                        { name: 'Mathematical Bold Italic', value: 'mathbolditalic' },
                        { name: 'Mathematical Sans-Serif', value: 'mathsans' },
                        { name: 'Mathematical Monospace', value: 'mathmono' },
                        { name: 'Circled Letters', value: 'circled' },
                        { name: 'Squared Letters', value: 'squared' },
                        { name: 'Fullwidth', value: 'fullwidth' },
                        { name: 'Small Caps', value: 'smallcaps' }
                    )
                    .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('fancy')
            .setDescription('Create fancy text with special characters')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text to make fancy')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('style')
                    .setDescription('Choose fancy style')
                    .addChoices(
                        { name: 'Aesthetic Spacing', value: 'aesthetic' },
                        { name: 'Wave Text', value: 'wave' },
                        { name: 'Bubble Text', value: 'bubble' },
                        { name: 'Reversed', value: 'reverse' },
                        { name: 'Upside Down', value: 'upside' },
                        { name: 'Zalgo (Glitchy)', value: 'zalgo' },
                        { name: 'Leet Speak', value: 'leet' }
                    )
                    .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('gradient')
            .setDescription('Create color gradient text effect')
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Text for gradient effect')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('colors')
                    .setDescription('Two hex colors separated by comma (e.g., FF0000,0000FF)')
                    .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        try {
       
            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply().catch(() => {});
            
            switch (subcommand) {
                case 'style':
                    await this.handleStyle(interaction);
                    break;
                case 'emoji':
                    await this.handleEmoji(interaction);
                    break;
                case 'unicode':
                    await this.handleUnicode(interaction);
                    break;
                case 'fancy':
                    await this.handleFancy(interaction);
                    break;
                case 'gradient':
                    await this.handleGradient(interaction);
                    break;
            }
        } catch (error) {
            console.error('Text command error:', error);
            try {
                await interaction.followUp({ content: '❌ An error occurred processing your text.', ephemeral: true });
            } catch (e) {
                console.error('Could not send error message:', e);
            }
        }
    },

    async handleStyle(interaction) {
        const text = interaction.options.getString('text');
        const format = interaction.options.getString('format');
        const colorInput = interaction.options.getString('color');
        
        let styledText = this.applyDiscordStyle(text, format);
        let embed = null;
        
        if (colorInput && this.isValidHex(colorInput)) {
            embed = new EmbedBuilder()
                .setDescription(styledText)
                .setColor(parseInt(colorInput, 16))
                .setTimestamp();
        }
        
        const content = embed ? { embeds: [embed] } : { content: styledText };
        
        await interaction.channel.send(content);
    },

    async handleEmoji(interaction) {
        const text = interaction.options.getString('text');
        const addSpaces = interaction.options.getBoolean('spaces') ?? false;
        
        const emojiText = this.convertToEmojis(text, addSpaces);
        
        if (emojiText.length > 2000) {
            await interaction.followUp({ content: '❌ Converted text is too long! Try shorter text.', ephemeral: true });
            return;
        }
        
        await interaction.channel.send({ content: emojiText });
    },

    async handleUnicode(interaction) {
        const text = interaction.options.getString('text');
        const font = interaction.options.getString('font');
        
        const unicodeText = this.convertToUnicode(text, font);
        
        const embed = new EmbedBuilder()
            .setDescription(unicodeText)
            .setColor('Random')
            .setFooter({ text: `Style: ${font}` })
            .setTimestamp();
        
        await interaction.channel.send({ embeds: [embed] });
    },

    async handleFancy(interaction) {
        const text = interaction.options.getString('text');
        const style = interaction.options.getString('style');
        
        const fancyText = this.applyFancyStyle(text, style);
        
        await interaction.channel.send({ content: fancyText });
    },

    async handleGradient(interaction) {
        const text = interaction.options.getString('text');
        const colors = interaction.options.getString('colors').split(',');
        
        if (colors.length !== 2 || !colors.every(c => this.isValidHex(c.trim()))) {
            await interaction.followUp({ content: '❌ Please provide two valid hex colors separated by comma!', ephemeral: true });
            return;
        }
        
        const gradientText = this.createGradientText(text, colors[0].trim(), colors[1].trim());
        
        const embed = new EmbedBuilder()
            .setDescription(gradientText)
            .setColor(parseInt(colors[0].trim(), 16))
            .setFooter({ text: `Gradient: #${colors[0].trim()} → #${colors[1].trim()}` })
            .setTimestamp();
        
        await interaction.channel.send({ embeds: [embed] });
    },


    applyDiscordStyle(text, format) {
        switch (format) {
            case 'bold':
                return `**${text}**`;
            case 'italic':
                return `*${text}*`;
            case 'underline':
                return `__${text}__`;
            case 'strike':
                return `~~${text}~~`;
            case 'bolditalic':
                return `***${text}***`;
            case 'boldunder':
                return `__**${text}**__`;
            case 'all':
                return `~~__***${text}***__~~`;
            case 'code':
                return `\`\`\`\n${text}\n\`\`\``;
            case 'inline':
                return `\`${text}\``;
            case 'spoiler':
                return `||${text}||`;
            default:
                return text;
        }
    },


    convertToEmojis(text, addSpaces = false) {
        const specialCodes = {
            '0': ':zero:',
            '1': ':one:',
            '2': ':two:',
            '3': ':three:',
            '4': ':four:',
            '5': ':five:',
            '6': ':six:',
            '7': ':seven:',
            '8': ':eight:',
            '9': ':nine:',
            '#': ':hash:',
            '*': ':asterisk:',
            '?': ':grey_question:',
            '!': ':grey_exclamation:',
            ' ': addSpaces ? '   ' : '  '
        };

        return text.toLowerCase().split('').map(char => {
            if (/[a-z]/.test(char)) {
                return `:regional_indicator_${char}:`;
            } else if (specialCodes[char]) {
                return specialCodes[char];
            }
            return char;
        }).join(addSpaces ? ' ' : '');
    },


    convertToUnicode(text, font) {
        const fonts = {
            mathbold: this.createMathBold,
            mathitalic: this.createMathItalic,
            mathbolditalic: this.createMathBoldItalic,
            mathsans: this.createMathSans,
            mathmono: this.createMathMono,
            circled: this.createCircled,
            squared: this.createSquared,
            fullwidth: this.createFullwidth,
            smallcaps: this.createSmallCaps
        };

        const converter = fonts[font];
        if (!converter) return text;

        return text.split('').map(char => converter.call(this, char)).join('');
    },

 
    createMathBold(char) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { 
            return String.fromCodePoint(0x1D400 + code - 65);
        } else if (code >= 97 && code <= 122) { 
            return String.fromCodePoint(0x1D41A + code - 97);
        }
        return char;
    },

    createMathItalic(char) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { 
            return String.fromCodePoint(0x1D434 + code - 65);
        } else if (code >= 97 && code <= 122) { 
            return String.fromCodePoint(0x1D44E + code - 97);
        }
        return char;
    },

    createMathBoldItalic(char) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { 
            return String.fromCodePoint(0x1D468 + code - 65);
        } else if (code >= 97 && code <= 122) { 
            return String.fromCodePoint(0x1D482 + code - 97);
        }
        return char;
    },

    createMathSans(char) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { 
            return String.fromCodePoint(0x1D5A0 + code - 65);
        } else if (code >= 97 && code <= 122) { 
            return String.fromCodePoint(0x1D5BA + code - 97);
        }
        return char;
    },

    createMathMono(char) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { 
            return String.fromCodePoint(0x1D670 + code - 65);
        } else if (code >= 97 && code <= 122) { 
            return String.fromCodePoint(0x1D68A + code - 97);
        }
        return char;
    },

    createCircled(char) {
        const circledMap = {
            'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ',
            'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ',
            'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ'
        };
        return circledMap[char.toUpperCase()] || char;
    },

    createSquared(char) {
        const squaredMap = {
            'A': '🄰', 'B': '🄱', 'C': '🄲', 'D': '🄳', 'E': '🄴', 'F': '🄵', 'G': '🄶', 'H': '🄷', 'I': '🄸',
            'J': '🄹', 'K': '🄺', 'L': '🄻', 'M': '🄼', 'N': '🄽', 'O': '🄾', 'P': '🄿', 'Q': '🅀', 'R': '🅁',
            'S': '🅂', 'T': '🅃', 'U': '🅄', 'V': '🅅', 'W': '🅆', 'X': '🅇', 'Y': '🅈', 'Z': '🅉'
        };
        return squaredMap[char.toUpperCase()] || char;
    },

    createFullwidth(char) {
        const code = char.charCodeAt(0);
        if (code >= 33 && code <= 126) {
            return String.fromCodePoint(0xFF01 + code - 33);
        }
        return char;
    },

    createSmallCaps(char) {
        const smallCapsMap = {
            'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
            'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
            's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
        };
        return smallCapsMap[char.toLowerCase()] || char;
    },


    applyFancyStyle(text, style) {
        switch (style) {
            case 'aesthetic':
                return text.split('').join('  ').toUpperCase();
            case 'wave':
                return text.split('').map((char, i) => i % 2 ? char.toLowerCase() : char.toUpperCase()).join('');
            case 'bubble':
                return `◦•●◉✿ ${text} ✿◉●•◦`;
            case 'reverse':
                return text.split('').reverse().join('');
            case 'upside':
                return this.flipUpsideDown(text);
            case 'zalgo':
                return this.addZalgo(text);
            case 'leet':
                return this.convertToLeet(text);
            default:
                return text;
        }
    },

    flipUpsideDown(text) {
        const flipMap = {
            'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ',
            'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ',
            's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
            'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ᖴ', 'G': 'פ', 'H': 'H', 'I': 'I',
            'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴿ',
            'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
            '?': '¿', '!': '¡', '.': '˙', ',': "'", ' ': ' '
        };
        
        return text.split('').reverse().map(char => flipMap[char] || char).join('');
    },

    addZalgo(text) {
        const zalgoUp = ['̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊', '͂', '̓', '̈', '͊', '͋', '͌', '̃', '̂', '̌', '͐', '̀', '́', '̋', '̏', '̒', '̓', '̔', '̽', '̉', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ', 'ͪ', 'ͫ', 'ͬ', 'ͭ', 'ͮ', 'ͯ', '̾', '͛', '͆', '̚'];
        const zalgoDown = ['̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬', '̭', '̮', '̯', '̰', '̱', '̲', '̳', '̹', '̺', '̻', '̼', 'ͅ', '͇', '͈', '͉', '͍', '͎', '͓', '͔', '͕', '͖', '͙', '͚', '̣'];
        
        return text.split('').map(char => {
            let zalgoChar = char;
            for (let i = 0; i < Math.random() * 3; i++) {
                zalgoChar += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
            }
            for (let i = 0; i < Math.random() * 3; i++) {
                zalgoChar += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
            }
            return zalgoChar;
        }).join('');
    },

    convertToLeet(text) {
        const leetMap = {
            'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7', 'l': '1',
            'A': '4', 'E': '3', 'I': '1', 'O': '0', 'S': '5', 'T': '7', 'L': '1'
        };
        
        return text.split('').map(char => leetMap[char] || char).join('');
    },

    createGradientText(text, startColor, endColor) {
        const start = this.hexToRgb(startColor);
        const end = this.hexToRgb(endColor);
        const steps = text.length;
        
        let result = '';
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            const r = Math.round(start.r + (end.r - start.r) * ratio);
            const g = Math.round(start.g + (end.g - start.g) * ratio);
            const b = Math.round(start.b + (end.b - start.b) * ratio);
            
        
            const intensity = Math.round(ratio * 4);
            const formats = ['', '*', '**', '***', '~~**'];
            result += `${formats[intensity]}${text[i]}${formats[intensity].split('').reverse().join('')}`;
        }
        
        return result;
    },

    hexToRgb(hex) {
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    isValidHex(hex) {
        return /^[0-9A-Fa-f]{6}$/.test(hex);
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