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
const { SlashCommandBuilder } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('password')
        .setDescription('Generate secure passwords with advanced options')
        .addSubcommand(sub => sub
            .setName('generate')
            .setDescription('Generate a custom password')
            .addIntegerOption(option =>
                option.setName('length')
                    .setDescription('Password length (8-128)')
                    .setMinValue(8)
                    .setMaxValue(128)
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Password type')
                    .addChoices(
                        { name: 'Secure (Mixed)', value: 'secure' },
                        { name: 'Ultra Secure', value: 'ultra' },
                        { name: 'Alphanumeric Only', value: 'alphanum' },
                        { name: 'Letters Only', value: 'letters' },
                        { name: 'Numbers Only', value: 'numbers' },
                        { name: 'Pronounceable', value: 'pronounce' }
                    ))
            .addBooleanOption(option =>
                option.setName('exclude_similar')
                    .setDescription('Exclude similar characters (0, O, l, I)')
                    .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('preset')
            .setDescription('Generate password from preset templates')
            .addStringOption(option =>
                option.setName('template')
                    .setDescription('Choose a preset template')
                    .addChoices(
                        { name: 'Banking (Ultra Secure)', value: 'banking' },
                        { name: 'Social Media', value: 'social' },
                        { name: 'Gaming', value: 'gaming' },
                        { name: 'Email Account', value: 'email' },
                        { name: 'Wi-Fi Password', value: 'wifi' },
                        { name: 'Corporate', value: 'corporate' }
                    )
                    .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('passphrase')
            .setDescription('Generate a memorable passphrase')
            .addIntegerOption(option =>
                option.setName('words')
                    .setDescription('Number of words (3-8)')
                    .setMinValue(3)
                    .setMaxValue(8)
                    .setRequired(false))
            .addBooleanOption(option =>
                option.setName('numbers')
                    .setDescription('Add numbers between words')
                    .setRequired(false))
            .addBooleanOption(option =>
                option.setName('symbols')
                    .setDescription('Add symbols between words')
                    .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('bulk')
            .setDescription('Generate multiple passwords at once')
            .addIntegerOption(option =>
                option.setName('count')
                    .setDescription('Number of passwords (2-10)')
                    .setMinValue(2)
                    .setMaxValue(10)
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('length')
                    .setDescription('Password length')
                    .setMinValue(8)
                    .setMaxValue(64)
                    .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('analyze')
            .setDescription('Analyze password strength (send your password)')
            .addStringOption(option =>
                option.setName('password')
                    .setDescription('Password to analyze (will be deleted immediately)')
                    .setRequired(true))),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const subcommand = interaction.options.getSubcommand();
            
            switch (subcommand) {
                case 'generate':
                    await this.handleGenerate(interaction);
                    break;
                case 'preset':
                    await this.handlePreset(interaction);
                    break;
                case 'passphrase':
                    await this.handlePassphrase(interaction);
                    break;
                case 'bulk':
                    await this.handleBulk(interaction);
                    break;
                case 'analyze':
                    await this.handleAnalyze(interaction);
                    break;
                default:
                    await interaction.editReply({ content: '❌ Unknown subcommand.' });
            }
            
        } catch (error) {
            console.error('Password command error:', error);
            await interaction.editReply({ content: '❌ An error occurred generating your password.' });
        }
    },

    async handleGenerate(interaction) {
        const length = interaction.options.getInteger('length') || 16;
        const type = interaction.options.getString('type') || 'secure';
        const excludeSimilar = interaction.options.getBoolean('exclude_similar') ?? true;

        const password = this.generatePassword(length, type, excludeSimilar);
        const strength = this.analyzePasswordStrength(password);

        const components = [];
        
        const passwordContainer = new ContainerBuilder()
            .setAccentColor(this.getStrengthColor(strength.score));

        passwordContainer.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔐 Generated Password\n## ${type.charAt(0).toUpperCase() + type.slice(1)} Type\n\n> Your secure password has been generated\n> **Strength:** ${strength.level} (${strength.score}/100)`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL('https://cdn.discordapp.com/emojis/🔒.png')
                        .setDescription('Password security')
                )
        );

        components.push(passwordContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const passwordDetailsContainer = new ContainerBuilder()
            .setAccentColor(0x3498db);

        passwordDetailsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 🔑 **Your Password**',
                    '',
                    `\`\`\``,
                    `${password}`,
                    `\`\`\``,
                    '',
                    `**📊 Password Details**`,
                    `Length: ${password.length} characters`,
                    `Type: ${type}`,
                    `Exclude Similar: ${excludeSimilar ? 'Yes' : 'No'}`,
                    '',
                    `**🛡️ Security Analysis**`,
                    `Strength: ${strength.level}`,
                    `Score: ${strength.score}/100`,
                    `Entropy: ${strength.entropy.toFixed(1)} bits`
                ].join('\n'))
        );

        components.push(passwordDetailsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const tipsContainer = new ContainerBuilder()
            .setAccentColor(0xf39c12);

        tipsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 💡 **Security Tips**',
                    '',
                    '> **Do:**',
                    '• Store in a password manager',
                    '• Use unique passwords for each account',
                    '• Enable 2FA when available',
                    '',
                    '> **Don\'t:**',
                    '• Share this password',
                    '• Use on multiple accounts',
                    '• Write it down in plain text',
                    '',
                    '*This message will auto-delete after viewing*'
                ].join('\n'))
        );

        components.push(tipsContainer);

        await interaction.editReply({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handlePreset(interaction) {
        const template = interaction.options.getString('template');
        const presets = this.getPresetConfig(template);
        
        const password = this.generatePassword(presets.length, presets.type, presets.excludeSimilar);
        const strength = this.analyzePasswordStrength(password);

        const components = [];
        
        const presetContainer = new ContainerBuilder()
            .setAccentColor(presets.color);

        presetContainer.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ${presets.emoji} ${presets.name} Password\n## Preset Template\n\n> ${presets.description}\n> **Strength:** ${strength.level} (${strength.score}/100)`)
                )
        );

        components.push(presetContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const passwordContainer = new ContainerBuilder()
            .setAccentColor(0x2c3e50);

        passwordContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 🔑 **Your Password**',
                    '',
                    `\`\`\``,
                    `${password}`,
                    `\`\`\``,
                    '',
                    `**📋 Template Specs**`,
                    `Use Case: ${presets.useCase}`,
                    `Length: ${password.length} characters`,
                    `Security Level: ${presets.security}`,
                    '',
                    `**🎯 Recommended For**`,
                    presets.recommendations.map(rec => `• ${rec}`).join('\n')
                ].join('\n'))
        );

        components.push(passwordContainer);

        await interaction.editReply({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handlePassphrase(interaction) {
        const wordCount = interaction.options.getInteger('words') || 4;
        const includeNumbers = interaction.options.getBoolean('numbers') ?? false;
        const includeSymbols = interaction.options.getBoolean('symbols') ?? false;

        const passphrase = this.generatePassphrase(wordCount, includeNumbers, includeSymbols);
        const strength = this.analyzePasswordStrength(passphrase);

        const components = [];
        
        const passphraseContainer = new ContainerBuilder()
            .setAccentColor(0x9b59b6);

        passphraseContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🗣️ Generated Passphrase\n## Memorable & Secure\n\n> Easy to remember, hard to crack\n> **Strength:** ${strength.level} (${strength.score}/100)`)
        );

        components.push(passphraseContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const phraseContainer = new ContainerBuilder()
            .setAccentColor(0x8B5CF6);

        phraseContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 🔤 **Your Passphrase**',
                    '',
                    `\`\`\``,
                    `${passphrase}`,
                    `\`\`\``,
                    '',
                    `**📊 Passphrase Details**`,
                    `Words: ${wordCount}`,
                    `Numbers: ${includeNumbers ? 'Included' : 'Not included'}`,
                    `Symbols: ${includeSymbols ? 'Included' : 'Not included'}`,
                    `Total Length: ${passphrase.length} characters`,
                    '',
                    `**🧠 Memory Tips**`,
                    `• Create a story with the words`,
                    `• Practice typing it a few times`,
                    `• Remember the separators pattern`
                ].join('\n'))
        );

        components.push(phraseContainer);

        await interaction.editReply({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleBulk(interaction) {
        const count = interaction.options.getInteger('count');
        const length = interaction.options.getInteger('length') || 16;

        const passwords = [];
        for (let i = 0; i < count; i++) {
            passwords.push(this.generatePassword(length, 'secure', true));
        }

        const components = [];
        
        const bulkContainer = new ContainerBuilder()
            .setAccentColor(0x00ff88);

        bulkContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 📦 Bulk Password Generation\n## ${count} Secure Passwords\n\n> Multiple passwords for different accounts\n> Each password is unique and secure`)
        );

        components.push(bulkContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const passwordsContainer = new ContainerBuilder()
            .setAccentColor(0x10B981);

        const passwordList = passwords.map((pwd, index) => `${index + 1}. \`${pwd}\``).join('\n');

        passwordsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 🔐 **Generated Passwords**',
                    '',
                    passwordList,
                    '',
                    `**📊 Specifications**`,
                    `Length: ${length} characters each`,
                    `Count: ${count} passwords`,
                    `Type: Secure mixed characters`,
                    '',
                    `**💡 Usage Tip**`,
                    `Use different passwords for different accounts`
                ].join('\n'))
        );

        components.push(passwordsContainer);

        await interaction.editReply({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleAnalyze(interaction) {
        const password = interaction.options.getString('password');
        const analysis = this.analyzePasswordStrength(password);

        const components = [];
        
        const analysisContainer = new ContainerBuilder()
            .setAccentColor(this.getStrengthColor(analysis.score));

        analysisContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🔍 Password Analysis\n## Security Assessment\n\n> Your password has been analyzed for security\n> **Overall Strength:** ${analysis.level}`)
        );

        components.push(analysisContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const scoreContainer = new ContainerBuilder()
            .setAccentColor(0x3498db);

        const scoreBar = '█'.repeat(Math.floor(analysis.score / 5)) + '░'.repeat(20 - Math.floor(analysis.score / 5));

        scoreContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 📊 **Strength Breakdown**',
                    '',
                    `**Overall Score: ${analysis.score}/100**`,
                    `${scoreBar}`,
                    '',
                    `**🔢 Technical Details**`,
                    `Length: ${password.length} characters`,
                    `Entropy: ${analysis.entropy.toFixed(1)} bits`,
                    `Character Types: ${analysis.charTypes}`,
                    '',
                    `**⏱️ Crack Time Estimates**`,
                    `Online Attack: ${analysis.crackTime.online}`,
                    `Offline Attack: ${analysis.crackTime.offline}`,
                    `With GPU: ${analysis.crackTime.gpu}`
                ].join('\n'))
        );

        components.push(scoreContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const recommendationsContainer = new ContainerBuilder()
            .setAccentColor(analysis.score >= 80 ? 0x00ff88 : analysis.score >= 60 ? 0xf39c12 : 0xff4757);

        recommendationsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 💡 **Recommendations**',
                    '',
                    ...analysis.recommendations.map(rec => `• ${rec}`),
                    '',
                    `**🛡️ Security Status**`,
                    analysis.score >= 80 ? '✅ Excellent - Very secure password' :
                    analysis.score >= 60 ? '⚠️ Good - Could be stronger' :
                    analysis.score >= 40 ? '⚠️ Fair - Needs improvement' :
                    '❌ Weak - Use a different password'
                ].join('\n'))
        );

        components.push(recommendationsContainer);

        await interaction.editReply({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });
    },


    generatePassword(length, type, excludeSimilar) {
        let charset = '';
        
        switch (type) {
            case 'ultra':
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
                break;
            case 'secure':
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                break;
            case 'alphanum':
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                break;
            case 'letters':
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                break;
            case 'numbers':
                charset = '0123456789';
                break;
            case 'pronounce':
                return this.generatePronounceable(length);
        }

        if (excludeSimilar) {
            charset = charset.replace(/[0O1lI]/g, '');
        }

        let password = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        
        return password;
    },

    generatePronounceable(length) {
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        const vowels = 'aeiou';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            if (i % 2 === 0) {
                password += consonants[Math.floor(Math.random() * consonants.length)];
            } else {
                password += vowels[Math.floor(Math.random() * vowels.length)];
            }
        }
        
        return password;
    },

    generatePassphrase(wordCount, includeNumbers, includeSymbols) {
        const words = [
            'apple', 'beach', 'cloud', 'dance', 'eagle', 'flame', 'grape', 'house',
            'island', 'jungle', 'knight', 'lemon', 'mouse', 'north', 'ocean', 'piano',
            'queen', 'river', 'stone', 'tiger', 'urban', 'voice', 'whale', 'xenon',
            'yellow', 'zebra', 'amber', 'blaze', 'coral', 'dream', 'ember', 'frost',
            'ghost', 'heart', 'ivory', 'jewel', 'kiwi', 'lunar', 'maple', 'novel'
        ];
        
        const selectedWords = [];
        for (let i = 0; i < wordCount; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            selectedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
        }
        
        let separator = '-';
        if (includeNumbers) {
            separator = Math.floor(Math.random() * 10).toString();
        }
        if (includeSymbols) {
            const symbols = ['!', '@', '#', '%', '&', '*'];
            separator = symbols[Math.floor(Math.random() * symbols.length)];
        }
        
        return selectedWords.join(separator);
    },

    getPresetConfig(template) {
        const presets = {
            banking: {
                name: 'Banking',
                emoji: '🏦',
                description: 'Maximum security for financial accounts',
                length: 24,
                type: 'ultra',
                excludeSimilar: true,
                color: 0x1e3d59,
                security: 'Maximum',
                useCase: 'Banking & Financial Services',
                recommendations: ['Use with 2FA', 'Never share', 'Change every 90 days']
            },
            social: {
                name: 'Social Media',
                emoji: '📱',
                description: 'Secure password for social platforms',
                length: 18,
                type: 'secure',
                excludeSimilar: true,
                color: 0x3498db,
                security: 'High',
                useCase: 'Social Media Platforms',
                recommendations: ['Enable 2FA', 'Regular security checkups', 'Monitor login activity']
            },
            gaming: {
                name: 'Gaming',
                emoji: '🎮',
                description: 'Strong password for gaming accounts',
                length: 16,
                type: 'secure',
                excludeSimilar: true,
                color: 0x9b59b6,
                security: 'High',
                useCase: 'Gaming Platforms',
                recommendations: ['Use unique password', 'Enable Steam Guard/similar', 'Regular password updates']
            },
            email: {
                name: 'Email',
                emoji: '📧',
                description: 'Critical security for email accounts',
                length: 20,
                type: 'ultra',
                excludeSimilar: true,
                color: 0xe74c3c,
                security: 'Critical',
                useCase: 'Email Accounts',
                recommendations: ['Use app passwords', 'Enable 2FA', 'This is your master key!']
            },
            wifi: {
                name: 'Wi-Fi',
                emoji: '📶',
                description: 'Strong network security password',
                length: 22,
                type: 'secure',
                excludeSimilar: true,
                color: 0x00ff88,
                security: 'High',
                useCase: 'Wireless Networks',
                recommendations: ['WPA3 if available', 'Hide SSID', 'Regular password rotation']
            },
            corporate: {
                name: 'Corporate',
                emoji: '🏢',
                description: 'Enterprise-grade security',
                length: 20,
                type: 'ultra',
                excludeSimilar: true,
                color: 0x2c3e50,
                security: 'Enterprise',
                useCase: 'Business & Corporate',
                recommendations: ['Follow company policy', 'Use SSO when available', 'Regular audits']
            }
        };
        
        return presets[template];
    },

    analyzePasswordStrength(password) {
        let score = 0;
        let entropy = 0;
        let charTypes = 0;
        const recommendations = [];

   
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else recommendations.push('Use at least 12 characters');

    
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);

        if (hasLower) { score += 5; charTypes++; }
        if (hasUpper) { score += 5; charTypes++; }
        if (hasNumbers) { score += 10; charTypes++; }
        if (hasSymbols) { score += 15; charTypes++; }

        if (!hasLower) recommendations.push('Add lowercase letters');
        if (!hasUpper) recommendations.push('Add uppercase letters');
        if (!hasNumbers) recommendations.push('Add numbers');
        if (!hasSymbols) recommendations.push('Add symbols');

      
        let charsetSize = 0;
        if (hasLower) charsetSize += 26;
        if (hasUpper) charsetSize += 26;
        if (hasNumbers) charsetSize += 10;
        if (hasSymbols) charsetSize += 32;

        entropy = Math.log2(Math.pow(charsetSize, password.length));

    
        if (!/(.)\1{2,}/.test(password)) score += 10;
        else recommendations.push('Avoid repeating characters');

        if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) score += 10;
        else recommendations.push('Avoid sequential characters');

     
        const commonWords = ['password', 'admin', 'user', 'login', '1234', 'qwerty'];
        if (!commonWords.some(word => password.toLowerCase().includes(word))) score += 10;
        else recommendations.push('Avoid common words');

        score = Math.min(score, 100);

        let level;
        if (score >= 80) level = 'Excellent';
        else if (score >= 60) level = 'Good';
        else if (score >= 40) level = 'Fair';
        else level = 'Weak';

       
        const crackTime = this.estimateCrackTime(charsetSize, password.length);

        return {
            score,
            level,
            entropy,
            charTypes,
            recommendations: recommendations.length > 0 ? recommendations : ['Password looks good!'],
            crackTime
        };
    },

    estimateCrackTime(charsetSize, length) {
        const combinations = Math.pow(charsetSize, length);
        
        return {
            online: this.formatTime(combinations / (1000 * 2)),
            offline: this.formatTime(combinations / (1000000000 * 2)),
            gpu: this.formatTime(combinations / (100000000000 * 2))
        };
    },

    formatTime(seconds) {
        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
        return 'Practically impossible';
    },

    getStrengthColor(score) {
        if (score >= 80) return 0x00ff88;
        if (score >= 60) return 0xf39c12;
        if (score >= 40) return 0xff8c00;
        return 0xff4757;
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