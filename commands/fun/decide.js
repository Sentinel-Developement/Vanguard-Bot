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
const aiManager = require('../../utils/AIManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decide')
        .setDescription('Intelligent decision making and thought experiments!')
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('options')
                .setDescription('Choose from a list of options')
                .addStringOption(option =>
                    option.setName('choices')
                        .setDescription('Options separated by commas (e.g., pizza, burger, tacos)')
                        .setRequired(true)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('yesno')
                .setDescription('Simple yes/no decision')
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('Your yes/no question')
                        .setRequired(true)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('percentage')
                .setDescription('Get a random percentage chance')
                .addStringOption(option =>
                    option.setName('event')
                        .setDescription('What event to calculate percentage for')
                        .setRequired(true)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('wheel')
                .setDescription('Spin a wheel of options')
                .addStringOption(option =>
                    option.setName('options')
                        .setDescription('Options separated by commas')
                        .setRequired(true)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('tier')
                .setDescription('Rank options into tier lists')
                .addStringOption(option =>
                    option.setName('items')
                        .setDescription('Items to rank, separated by commas')
                        .setRequired(true)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('pairs')
                .setDescription('Create random pairs from people')
                .addStringOption(option =>
                    option.setName('people')
                        .setDescription('Names separated by commas')
                        .setRequired(true)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('scenario')
                .setDescription('Generate "What would you do if..." scenarios')
                .addStringOption(option =>
                    option.setName('theme')
                        .setDescription('Optional theme for the scenario')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('apocalypse')
                .setDescription('Random end-of-world survival scenarios')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of apocalypse (zombie, alien, natural, etc.)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('superpower')
                .setDescription('Grant random superpowers with descriptions')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Power category (mental, physical, elemental, etc.)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('villain')
                .setDescription('Create random villain backstories')
                .addStringOption(option =>
                    option.setName('genre')
                        .setDescription('Genre (superhero, fantasy, sci-fi, etc.)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('dimension')
                .setDescription('Describe alternate reality dimensions')
                .addStringOption(option =>
                    option.setName('aspect')
                        .setDescription('What aspect is different (physics, society, technology)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('paradox')
                .setDescription('Generate philosophical paradoxes with analysis')
                .addStringOption(option =>
                    option.setName('field')
                        .setDescription('Field of paradox (logic, time, ethics, existence)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('thought_experiment')
                .setDescription('Create mind-bending thought experiments')
                .addStringOption(option =>
                    option.setName('topic')
                        .setDescription('Topic area (ethics, consciousness, reality, identity)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('debate_topic')
                .setDescription('Generate debate topics with arguments')
                .addStringOption(option =>
                    option.setName('domain')
                        .setDescription('Domain (technology, society, ethics, politics)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('conspiracy_theory')
                .setDescription('Create hilarious fictional conspiracy theories')
                .addStringOption(option =>
                    option.setName('subject')
                        .setDescription('Subject to create conspiracy about')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('moral_dilemma')
                .setDescription('Present complex ethical scenarios')
                .addStringOption(option =>
                    option.setName('context')
                        .setDescription('Context (medical, business, personal, societal)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('future_prediction')
                .setDescription('Generate plausible future scenarios')
                .addStringOption(option =>
                    option.setName('timeframe')
                        .setDescription('Time period (10 years, 50 years, 100 years)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('invention')
                .setDescription('Create impossible inventions with explanations')
                .addStringOption(option =>
                    option.setName('purpose')
                        .setDescription('What problem should it solve?')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('alternate_history')
                .setDescription('Explore "what if" historical scenarios')
                .addStringOption(option =>
                    option.setName('period')
                        .setDescription('Historical period or event')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('philosophy_question')
                .setDescription('Generate deep philosophical questions')
                .addStringOption(option =>
                    option.setName('branch')
                        .setDescription('Philosophy branch (metaphysics, epistemology, ethics)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('scientific_theory')
                .setDescription('Create fictional scientific theories')
                .addStringOption(option =>
                    option.setName('field')
                        .setDescription('Scientific field (physics, biology, psychology)')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        try {
            switch (subcommand) {
                case 'options':
                    await this.handleBasicDecision(interaction);
                    break;
                case 'yesno':
                    await this.handleYesNo(interaction);
                    break;
                case 'percentage':
                    await this.handlePercentage(interaction);
                    break;
                case 'wheel':
                    await this.handleWheel(interaction);
                    break;
                case 'tier':
                    await this.handleTier(interaction);
                    break;
                case 'pairs':
                    await this.handlePairs(interaction);
                    break;
                case 'scenario':
                    await this.handleAICommand(interaction, 'scenario');
                    break;
                case 'apocalypse':
                    await this.handleAICommand(interaction, 'apocalypse');
                    break;
                case 'superpower':
                    await this.handleAICommand(interaction, 'superpower');
                    break;
                case 'villain':
                    await this.handleAICommand(interaction, 'villain');
                    break;
                case 'dimension':
                    await this.handleAICommand(interaction, 'dimension');
                    break;
                case 'paradox':
                    await this.handleAICommand(interaction, 'paradox');
                    break;
                case 'thought_experiment':
                    await this.handleAICommand(interaction, 'thought_experiment');
                    break;
                case 'debate_topic':
                    await this.handleAICommand(interaction, 'debate_topic');
                    break;
                case 'conspiracy_theory':
                    await this.handleAICommand(interaction, 'conspiracy_theory');
                    break;
                case 'moral_dilemma':
                    await this.handleAICommand(interaction, 'moral_dilemma');
                    break;
                case 'future_prediction':
                    await this.handleAICommand(interaction, 'future_prediction');
                    break;
                case 'invention':
                    await this.handleAICommand(interaction, 'invention');
                    break;
                case 'alternate_history':
                    await this.handleAICommand(interaction, 'alternate_history');
                    break;
                case 'philosophy_question':
                    await this.handleAICommand(interaction, 'philosophy_question');
                    break;
                case 'scientific_theory':
                    await this.handleAICommand(interaction, 'scientific_theory');
                    break;
                default:
                    await interaction.reply({ content: '❌ Unknown subcommand!', ephemeral: true });
            }
        } catch (error) {
            console.error('Decision command error:', error);
            await interaction.reply({ 
                content: '❌ Something went wrong! Please try again.', 
                ephemeral: true 
            });
        }
    },

    async handleBasicDecision(interaction) {
        const options = interaction.options.getString('choices').split(',').map(opt => opt.trim());
        
        if (options.length < 2) {
            return interaction.reply({ content: '❌ I need at least 2 options to decide!', ephemeral: true });
        }

        const chosen = options[Math.floor(Math.random() * options.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🎯 Decision Made!')
            .setDescription(`After careful consideration of **${options.length}** options...\n\n🏆 **I choose: ${chosen}**`)
            .setColor('Random')
            .addFields({ name: 'Options Considered', value: options.join(' • '), inline: false })
            .setFooter({ text: 'This decision is 100% scientifically random' });


        await interaction.reply({ embeds: [embed] });
    },

    async handleYesNo(interaction) {
        const question = interaction.options.getString('question');
        const answers = ['Yes', 'No', 'Maybe', 'Absolutely!', 'Not a chance', 'Ask again later', 'Definitely not', 'Without a doubt'];
        const chosen = answers[Math.floor(Math.random() * answers.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🤔 Yes or No Decision')
            .setDescription(`**Question:** ${question}\n\n🎱 **Answer: ${chosen}**`)
            .setColor(chosen.includes('Yes') || chosen.includes('Absolutely') || chosen.includes('doubt') ? 'Green' : 
                     chosen.includes('No') || chosen.includes('not') ? 'Red' : 'Yellow')
            .setFooter({ text: 'The magic 8-ball has spoken!' });


        await interaction.reply({ embeds: [embed]});
    },

    async handlePercentage(interaction) {
        const event = interaction.options.getString('event');
        const percentage = Math.floor(Math.random() * 101);
        
        let interpretation = '';
        let color = 'Grey';
        
        if (percentage >= 90) {
            interpretation = 'Almost certain to happen!';
            color = 'Green';
        } else if (percentage >= 70) {
            interpretation = 'Very likely!';
            color = 'DarkGreen';
        } else if (percentage >= 50) {
            interpretation = 'Good chances!';
            color = 'Yellow';
        } else if (percentage >= 30) {
            interpretation = 'Unlikely but possible';
            color = 'Orange';
        } else if (percentage >= 10) {
            interpretation = 'Not very likely';
            color = 'Red';
        } else {
            interpretation = 'Extremely unlikely';
            color = 'DarkRed';
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Percentage Calculation')
            .setDescription(`**Event:** ${event}\n\n🎲 **Probability: ${percentage}%**\n*${interpretation}*`)
            .setColor(color)
            .setFooter({ text: 'Based on advanced quantum probability calculations' });


        await interaction.reply({ embeds: [embed] });
    },

    async handleWheel(interaction) {
        const options = interaction.options.getString('options').split(',').map(opt => opt.trim());
        
        if (options.length < 2) {
            return interaction.reply({ content: '❌ I need at least 2 options for the wheel!', ephemeral: true });
        }

        const chosen = options[Math.floor(Math.random() * options.length)];
        const spinEmojis = ['🎡', '🎠', '🎪', '🎭', '🎨', '🎯'];
        const randomEmoji = spinEmojis[Math.floor(Math.random() * spinEmojis.length)];
        
        const embed = new EmbedBuilder()
            .setTitle(`${randomEmoji} Wheel Spin Result!`)
            .setDescription(`The wheel spins... and spins... and lands on:\n\n🎯 **${chosen}**`)
            .setColor('Random')
            .addFields(
                { name: 'All Options', value: options.join(' • '), inline: false },
                { name: 'Spin Statistics', value: `1 in ${options.length} chance`, inline: true }
            )
            .setFooter({ text: 'The wheel of fortune has decided!' });


        await interaction.reply({ embeds: [embed] });
    },

    async handleTier(interaction) {
        const items = interaction.options.getString('items').split(',').map(item => item.trim());
        
        if (items.length < 3) {
            return interaction.reply({ content: '❌ I need at least 3 items to create a tier list!', ephemeral: true });
        }

        const tiers = {
            'S': { emoji: '🏆', items: [] },
            'A': { emoji: '🥇', items: [] },
            'B': { emoji: '🥈', items: [] },
            'C': { emoji: '🥉', items: [] },
            'D': { emoji: '💩', items: [] }
        };

        const shuffled = [...items].sort(() => Math.random() - 0.5);
        const tierKeys = Object.keys(tiers);
        
        shuffled.forEach((item, index) => {
            const tierIndex = Math.floor(Math.random() * tierKeys.length);
            const tierKey = tierKeys[tierIndex];
            tiers[tierKey].items.push(item);
        });

        let tierText = '';
        for (const [tier, data] of Object.entries(tiers)) {
            if (data.items.length > 0) {
                tierText += `**${data.emoji} ${tier} Tier:** ${data.items.join(', ')}\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Tier List Ranking')
            .setDescription(tierText || 'Something went wrong with the ranking!')
            .setColor('Gold')
            .setFooter({ text: 'Rankings are totally objective and not random at all' });



        await interaction.reply({ embeds: [embed] });
    },

    async handlePairs(interaction) {
        const people = interaction.options.getString('people').split(',').map(person => person.trim());
        
        if (people.length < 2) {
            return interaction.reply({ content: '❌ I need at least 2 people to create pairs!', ephemeral: true });
        }

        const shuffled = [...people].sort(() => Math.random() - 0.5);
        const pairs = [];
        let leftOver = null;

        for (let i = 0; i < shuffled.length - 1; i += 2) {
            pairs.push([shuffled[i], shuffled[i + 1]]);
        }

        if (shuffled.length % 2 === 1) {
            leftOver = shuffled[shuffled.length - 1];
        }

        let pairText = pairs.map((pair, index) => 
            `**Pair ${index + 1}:** ${pair[0]} & ${pair[1]}`
        ).join('\n');

        if (leftOver) {
            pairText += `\n\n**Odd one out:** ${leftOver}`;
        }

        const embed = new EmbedBuilder()
            .setTitle('👥 Random Pairs Generated!')
            .setDescription(pairText)
            .setColor('Blue')
            .addFields({ name: 'Total People', value: people.length.toString(), inline: true },
                      { name: 'Pairs Created', value: pairs.length.toString(), inline: true })
            .setFooter({ text: 'Perfect for team activities and group work!' });


        await interaction.reply({ embeds: [embed] });
    },

    async handleAICommand(interaction, commandType) {
        await interaction.deferReply();
        
        try {
            const prompt = this.getAIPrompt(commandType, interaction);
            const response = await aiManager.generateContent(prompt, { timeout: 30000 });
            
            const embed = this.createAIEmbed(commandType, response.text(), interaction);
            

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error(`AI command error (${commandType}):`, error);
            await interaction.editReply({ 
                content: '❌ AI is taking a coffee break! Please try again later.', 
                ephemeral: true 
            });
        }
    },

    getAIPrompt(commandType, interaction) {
        const prompts = {
            scenario: `Generate a thought-provoking "What would you do if..." scenario. ${this.getOptionalTheme(interaction, 'theme')}
Make it interesting, realistic, and engaging. Include enough detail to spark discussion.
Format: Present the scenario clearly and end with the question "What would you do?"`,

            apocalypse: `Create an end-of-world survival scenario. ${this.getOptionalTheme(interaction, 'type')}
Include:
1. The apocalyptic event/situation
2. Your current resources and location
3. Immediate dangers and challenges
4. A strategic decision you must make
Make it engaging and realistic, not too dark or disturbing.`,

            superpower: `Generate a unique superpower with detailed description. ${this.getOptionalTheme(interaction, 'category')}
Include:
1. Power name and core ability
2. How it works mechanically
3. Practical applications
4. Potential drawbacks or limitations
5. Creative uses most people wouldn't think of
Make it original and interesting!`,

            villain: `Create an original villain character with compelling backstory. ${this.getOptionalTheme(interaction, 'genre')}
Include:
1. Villain name and appearance
2. Origin story/what made them evil
3. Powers/abilities and methods
4. Ultimate goal or motivation
5. Fatal flaw or weakness
Make them complex and interesting, not just "evil for evil's sake."`,

            dimension: `Describe a fascinating alternate reality dimension. ${this.getOptionalTheme(interaction, 'aspect')}
Include:
1. Key differences from our reality
2. How daily life works there
3. Unique laws of physics or society
4. What visitors from our world would notice first
5. An interesting inhabitant or culture
Be creative and mind-bending!`,

            paradox: `Generate a fascinating philosophical paradox with analysis. ${this.getOptionalTheme(interaction, 'field')}
Include:
1. Clear statement of the paradox
2. Why it's paradoxical/contradictory
3. Real-world examples or applications
4. Different approaches to resolving it
5. Why it matters philosophically
Make it accessible but intellectually stimulating.`,

            thought_experiment: `Create a mind-bending thought experiment. ${this.getOptionalTheme(interaction, 'topic')}
Include:
1. The scenario setup
2. The key question or dilemma
3. Why it's philosophically important
4. Different possible conclusions
5. What it reveals about reality/consciousness/ethics
Think Trolley Problem or Ship of Theseus level!`,

            debate_topic: `Generate a compelling debate topic with starting arguments. ${this.getOptionalTheme(interaction, 'domain')}
Include:
1. Clear debate statement/proposition
2. Strong argument FOR the position
3. Strong argument AGAINST the position
4. Key evidence or examples for both sides
5. Why this topic matters
Make it thought-provoking and balanced!`,

            conspiracy_theory: `Create a hilarious fictional conspiracy theory. ${this.getOptionalTheme(interaction, 'subject')}
Include:
1. The absurd conspiracy claim
2. "Evidence" that supports it
3. Who's supposedly behind it and why
4. How "they" keep it secret
5. What "they" don't want you to know
Make it obviously fake but entertainingly ridiculous!`,

            moral_dilemma: `Present a complex ethical dilemma requiring difficult choices. ${this.getOptionalTheme(interaction, 'context')}
Include:
1. The situation and key players
2. The difficult choice that must be made
3. Arguments for different options
4. What values/principles are in conflict
5. Why there's no clearly "right" answer
Make it genuinely challenging and thought-provoking.`,

            future_prediction: `Generate a plausible future scenario. ${this.getOptionalTheme(interaction, 'timeframe')}
Include:
1. What has changed from today
2. Key technological or social developments
3. How daily life is different
4. New challenges or opportunities
5. What surprised people the most
Base it on current trends but be creative!`,

            invention: `Create an impossible but detailed invention. ${this.getOptionalTheme(interaction, 'purpose')}
Include:
1. Invention name and what it does
2. How it supposedly works (pseudo-science OK)
3. Materials needed and construction
4. Practical applications
5. Unexpected side effects or uses
Make it creative and slightly absurd but detailed!`,

            alternate_history: `Explore a "what if" historical scenario. ${this.getOptionalTheme(interaction, 'period')}
Include:
1. The key historical change/event
2. Immediate consequences
3. How the world developed differently
4. What life is like in this timeline
5. One surprising butterfly effect
Make it plausible and fascinating!`,

            philosophy_question: `Generate a deep philosophical question with exploration. ${this.getOptionalTheme(interaction, 'branch')}
Include:
1. The central question
2. Why this question is important
3. Different philosophical approaches
4. What's at stake in the answer
5. How it relates to everyday life
Make it genuinely thought-provoking!`,

            scientific_theory: `Create a fictional scientific theory with explanation. ${this.getOptionalTheme(interaction, 'field')}
Include:
1. Theory name and core principle
2. Scientific explanation (can be fictional)
3. Evidence that "supports" it
4. Practical applications or implications
5. What experiments could test it
Make it sound scientific but be creative!`
        };

        return prompts[commandType] || 'Generate something interesting and creative!';
    },

    getOptionalTheme(interaction, optionName) {
        const theme = interaction.options.getString(optionName);
        return theme ? `Focus on: ${theme}.` : 'Choose any theme.';
    },

    createAIEmbed(commandType, content, interaction) {
        const embedConfigs = {
            scenario: { title: '🤔 Hypothetical Scenario', color: 'Purple', emoji: '❓' },
            apocalypse: { title: '☢️ Apocalypse Survival', color: 'Red', emoji: '💀' },
            superpower: { title: '⚡ Superpower Granted!', color: 'Gold', emoji: '🦸' },
            villain: { title: '😈 Villain Profile', color: 'DarkRed', emoji: '🦹' },
            dimension: { title: '🌌 Alternate Dimension', color: 'Blurple', emoji: '🚪' },
            paradox: { title: '🧠 Philosophical Paradox', color: 'Navy', emoji: '🤯' },
            thought_experiment: { title: '💭 Thought Experiment', color: 'DarkBlue', emoji: '🧪' },
            debate_topic: { title: '⚖️ Debate Topic', color: 'Orange', emoji: '🗣️' },
            conspiracy_theory: { title: '🕵️ Conspiracy Theory', color: 'Yellow', emoji: '👁️' },
            moral_dilemma: { title: '⚖️ Moral Dilemma', color: 'DarkGreen', emoji: '😰' },
            future_prediction: { title: '🔮 Future Prediction', color: 'Aqua', emoji: '🚀' },
            invention: { title: '🔬 Impossible Invention', color: 'LuminousVividPink', emoji: '⚗️' },
            alternate_history: { title: '📚 Alternate History', color: 'DarkGold', emoji: '⏰' },
            philosophy_question: { title: '🤔 Philosophical Question', color: 'DarkPurple', emoji: '💫' },
            scientific_theory: { title: '🔬 Scientific Theory', color: 'Green', emoji: '🧬' }
        };

        const config = embedConfigs[commandType];
        
        return new EmbedBuilder()
            .setTitle(config.title)
            .setDescription(content.length > 4000 ? content.substring(0, 4000) + '...' : content)
            .setColor(config.color)
            .setTimestamp();
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