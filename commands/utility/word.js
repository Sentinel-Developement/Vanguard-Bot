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
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const axios = require('axios');
const cmdIcons = require('../../UI/icons/commandicons');
const aiManager = require('../../utils/AIManager');


function truncateText(text, maxLength = 3800) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

async function callGeminiAPI(prompt) {
    try {
        const response = await aiManager.generateContent(prompt);
        return response.text();
    } catch (error) {
        console.error('AI Manager Error:', error.message);
        
        if (error.name === 'AIContentBlockedError') {
            return 'Content was blocked by AI safety filters. Please try rephrasing your request.';
        }
        
        return 'Error occurred while processing request with AI service.';
    }
}

async function analyzeWord(word, analysisType) {
    const prompts = {
        etymology: `Provide detailed etymology and origin of the word "${word}". Include historical development, root languages, and how the meaning evolved over time. Format the response clearly with sections.`,
        
        usage: `Provide comprehensive usage examples for the word "${word}". Include: 1) Common usage in sentences, 2) Formal vs informal contexts, 3) Different meanings in various contexts, 4) Collocations and phrases. Make it detailed and educational.`,
        
        grammar: `Provide detailed grammatical analysis of the word "${word}". Include: 1) Part of speech variations, 2) Conjugations/declensions if applicable, 3) Grammatical rules, 4) Common grammatical mistakes, 5) Usage in different tenses/forms.`,
        
        advanced: `Provide advanced linguistic analysis of the word "${word}". Include: 1) Semantic field and related concepts, 2) Connotations and register, 3) Stylistic usage, 4) Literary examples, 5) Regional variations, 6) Frequency of use.`,
        
        rhyme: `Find words that rhyme with "${word}". Provide: 1) Perfect rhymes, 2) Near rhymes/slant rhymes, 3) Words organized by syllable count, 4) Example sentences using rhyming words. Make it comprehensive for creative writing.`,
        
        antonyms: `Provide comprehensive antonyms for "${word}". Include: 1) Direct antonyms, 2) Contextual opposites, 3) Gradable antonyms (if applicable), 4) Example sentences showing contrasts, 5) Nuanced opposites in different contexts.`,
        
        context: `Analyze how the word "${word}" is used in different contexts. Include: 1) Technical/professional usage, 2) Casual conversation, 3) Academic writing, 4) Creative writing, 5) Historical contexts, 6) Cultural significance.`
    };

    return await callGeminiAPI(prompts[analysisType]);
}

async function translateWithContext(text, targetLanguage, sourceLanguage = 'auto') {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}: "${text}". 
    Provide: 1) Direct translation, 2) Alternative translations with different nuances, 3) Cultural context if relevant, 4) Usage notes for the target language.`;
    
    return await callGeminiAPI(prompt);
}

async function compareWords(word1, word2) {
    const prompt = `Compare and contrast these two words: "${word1}" and "${word2}". 
    Include: 1) Similarities in meaning, 2) Key differences, 3) Usage contexts for each, 4) Examples showing the distinction, 5) When to use each word appropriately.`;
    
    return await callGeminiAPI(prompt);
}

async function wordFamily(word) {
    const prompt = `Analyze the word family of "${word}". Include: 1) Root word and base forms, 2) Related words (same root), 3) Derived words (prefixes/suffixes), 4) Word formations, 5) Semantic relationships within the family.`;
    
    return await callGeminiAPI(prompt);
}

async function handlePrefixCommand(message, args) {
    const subcommand = args[0]?.toLowerCase();
    const word = args[23];
    
    if (!subcommand) {
        const helpContainer = new ContainerBuilder()
            .setAccentColor(0xFFAA00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❓ Command Help\nPlease specify a subcommand for word analysis.')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**Available Commands:**\n`define`, `dictionary`, `translate`, `etymology`, `usage`, `grammar`, `advanced`, `rhyme`, `antonyms`, `context`, `compare`, `family`')
            );
        
        return message.reply({ 
            components: [helpContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    if (!word && !['translate', 'compare'].includes(subcommand)) {
        const noWordContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Missing Word\nPlease provide a word to analyze.')
            );
            
        return message.reply({ 
            components: [noWordContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }

    try {
        switch (subcommand) {
            case 'define':
            case 'dictionary':
                await handleDefinition(message, word);
                break;
            case 'translate':
                await handleTranslation(message, args);
                break;
            case 'etymology':
                await handleEtymology(message, word);
                break;
            case 'usage':
                await handleUsage(message, word);
                break;
            case 'grammar':
                await handleGrammar(message, word);
                break;
            case 'advanced':
                await handleAdvanced(message, word);
                break;
            case 'rhyme':
                await handleRhyme(message, word);
                break;
            case 'antonyms':
                await handleAntonyms(message, word);
                break;
            case 'context':
                await handleContext(message, word);
                break;
            case 'compare':
                await handleCompare(message, args);
                break;
            case 'family':
                await handleFamily(message, word);
                break;
            default:
                const invalidContainer = new ContainerBuilder()
                    .setAccentColor(0xFF0000)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# ❌ Invalid Subcommand\nAvailable: `define`, `dictionary`, `translate`, `etymology`, `usage`, `grammar`, `advanced`, `rhyme`, `antonyms`, `context`, `compare`, `family`')
                    );
                    
                message.reply({ 
                    components: [invalidContainer],
                    flags: MessageFlags.IsComponentsV2 
                });
        }
    } catch (error) {
        console.error('Error in prefix command:', error);
        
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Command Error\nAn error occurred while processing your request.')
            );
            
        message.reply({ 
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
}

async function handleDefinition(interaction, word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    
    try {
        const response = await axios.get(apiUrl);
        const data = response.data[0];

        if (!data) {
            const noDefContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ No Definition Found\nNo definition found for **${word}**.`)
                );
                
            return interaction.editReply({ 
                components: [noDefContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const phonetic = data.phonetic || 'N/A';
        const meanings = data.meanings.map(meaning => ({
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions.slice(0, 2).map(def => ({
                definition: def.definition,
                example: def.example || 'No example available.',
            })),
        }));

        let definitionContent = '';
        meanings.forEach(meaning => {
            definitionContent += `**${meaning.partOfSpeech.toUpperCase()}**\n`;
            definitionContent += meaning.definitions.map(def => `• ${def.definition}\n*Example: ${def.example}*`).join('\n\n');
            definitionContent += '\n\n';
        });

        const defContainer = new ContainerBuilder()
            .setAccentColor(0x0099FF)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📖 Definition of "${word}"\nComprehensive dictionary analysis`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**📢 Phonetic:** ${phonetic}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user?.displayAvatarURL({ dynamic: true, size: 128 }) || interaction.author?.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Dictionary lookup')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(truncateText(definitionContent))
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Dictionary API • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({ 
            components: [defContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    } catch (error) {
        console.log('Dictionary API failed, falling back to AI Manager');
        const result = await callGeminiAPI(`Provide a comprehensive definition of the word "${word}" with examples, pronunciation, and different meanings.`);
        
        const aiDefContainer = new ContainerBuilder()
            .setAccentColor(0x9B59B6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📖 Definition of "${word}" (AI Analysis)\nAI-powered comprehensive word analysis`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(truncateText(result))
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({ 
            components: [aiDefContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
}

async function handleTranslation(interaction, args) {
    let text, targetLanguage;
    
    if (Array.isArray(args)) {
        text = args.slice(1, -1).join(' ');
        targetLanguage = args[args.length - 1];
    } else {
        text = interaction.options.getString('text');
        targetLanguage = interaction.options.getString('target_language');
    }
    
    if (!text || !targetLanguage) {
        const usageContainer = new ContainerBuilder()
            .setAccentColor(0xFFAA00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Invalid Usage\nUsage: `translate <text> <target_language>`')
            );
            
        return interaction.editReply({ 
            components: [usageContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }

    const result = await translateWithContext(text, targetLanguage);
    
    const transContainer = new ContainerBuilder()
        .setAccentColor(0x00FF88)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# 🌐 Translation Result\nAI-powered contextual translation')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📝 Original:** ${truncateText(text, 500)}\n**🎯 Target Language:** ${targetLanguage}`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user?.displayAvatarURL({ dynamic: true, size: 128 }) || interaction.author?.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription('Translation request')
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [transContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleEtymology(interaction, word) {
    const result = await analyzeWord(word, 'etymology');
    
    const etymContainer = new ContainerBuilder()
        .setAccentColor(0x8B4513)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 📚 Etymology of "${word}"\nHistorical word origin and development`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [etymContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleUsage(interaction, word) {
    const result = await analyzeWord(word, 'usage');
    
    const usageContainer = new ContainerBuilder()
        .setAccentColor(0x32CD32)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 💬 Usage Examples for "${word}"\nComprehensive usage patterns and contexts`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [usageContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleGrammar(interaction, word) {
    const result = await analyzeWord(word, 'grammar');
    
    const grammarContainer = new ContainerBuilder()
        .setAccentColor(0xFF6347)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 📝 Grammar Analysis of "${word}"\nDetailed grammatical structure and rules`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [grammarContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleAdvanced(interaction, word) {
    const result = await analyzeWord(word, 'advanced');
    
    const advancedContainer = new ContainerBuilder()
        .setAccentColor(0x4169E1)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🎓 Advanced Analysis of "${word}"\nLinguistic and semantic deep analysis`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [advancedContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleRhyme(interaction, word) {
    const result = await analyzeWord(word, 'rhyme');
    
    const rhymeContainer = new ContainerBuilder()
        .setAccentColor(0xFF1493)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🎵 Words that Rhyme with "${word}"\nPerfect and near rhymes for creative writing`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [rhymeContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleAntonyms(interaction, word) {
    const result = await analyzeWord(word, 'antonyms');
    
    const antonymContainer = new ContainerBuilder()
        .setAccentColor(0xFF8C00)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🔄 Antonyms of "${word}"\nComprehensive opposites and contrasts`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [antonymContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleContext(interaction, word) {
    const result = await analyzeWord(word, 'context');
    
    const contextContainer = new ContainerBuilder()
        .setAccentColor(0x20B2AA)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🌍 Contextual Usage of "${word}"\nWord usage across different contexts and registers`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [contextContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleCompare(interaction, args) {
    let word1, word2;
    
    if (Array.isArray(args)) {
        word1 = args[1];
        word2 = args[22];
    } else {
        word1 = interaction.options.getString('word1');
        word2 = interaction.options.getString('word2');
    }
    
    if (!word1 || !word2) {
        const usageContainer = new ContainerBuilder()
            .setAccentColor(0xFFAA00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Invalid Usage\nUsage: `compare <word1> <word2>`')
            );
            
        return interaction.editReply({ 
            components: [usageContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }

    const result = await compareWords(word1, word2);
    
    const compareContainer = new ContainerBuilder()
        .setAccentColor(0x6A5ACD)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ⚖️ Comparing "${word1}" vs "${word2}"\nDetailed comparison and contrast analysis`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [compareContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleFamily(interaction, word) {
    const result = await wordFamily(word);
    
    const familyContainer = new ContainerBuilder()
        .setAccentColor(0xDC143C)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 👨‍👩‍👧‍👦 Word Family of "${word}"\nRelated words, roots, and derivatives`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(truncateText(result))
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*AI Manager & Gemini API • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({ 
        components: [familyContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('word')
        .setDescription('Comprehensive word analysis and language tools.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('define')
                .setDescription('Get detailed definition of a word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to define.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dictionary')
                .setDescription('Look up a word in the dictionary.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to look up.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('Translate text with context and alternatives.')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to translate.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('target_language')
                        .setDescription('Target language (e.g., Spanish, French, German).')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('source_language')
                        .setDescription('Source language (auto-detect if not specified).')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('etymology')
                .setDescription('Get detailed etymology and origin of a word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('usage')
                .setDescription('Get comprehensive usage examples and contexts.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('grammar')
                .setDescription('Get detailed grammatical analysis.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('advanced')
                .setDescription('Get advanced linguistic analysis.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rhyme')
                .setDescription('Find words that rhyme with the given word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to find rhymes for.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antonyms')
                .setDescription('Get comprehensive antonyms and opposites.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to find antonyms for.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('context')
                .setDescription('Analyze word usage in different contexts.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('compare')
                .setDescription('Compare and contrast two words.')
                .addStringOption(option =>
                    option.setName('word1')
                        .setDescription('First word to compare.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('word2')
                        .setDescription('Second word to compare.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('family')
                .setDescription('Analyze word family and related words.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true))),

    async execute(interaction) {
        if (!interaction.isCommand()) return;

        try {
            await interaction.deferReply();

            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'define':
                case 'dictionary':
                    await handleDefinition(interaction, interaction.options.getString('word'));
                    break;

                case 'translate':
                    await handleTranslation(interaction);
                    break;

                case 'etymology':
                    await handleEtymology(interaction, interaction.options.getString('word'));
                    break;

                case 'usage':
                    await handleUsage(interaction, interaction.options.getString('word'));
                    break;

                case 'grammar':
                    await handleGrammar(interaction, interaction.options.getString('word'));
                    break;

                case 'advanced':
                    await handleAdvanced(interaction, interaction.options.getString('word'));
                    break;

                case 'rhyme':
                    await handleRhyme(interaction, interaction.options.getString('word'));
                    break;

                case 'antonyms':
                    await handleAntonyms(interaction, interaction.options.getString('word'));
                    break;

                case 'context':
                    await handleContext(interaction, interaction.options.getString('word'));
                    break;

                case 'compare':
                    await handleCompare(interaction);
                    break;

                case 'family':
                    await handleFamily(interaction, interaction.options.getString('word'));
                    break;

                default:
                    const unknownContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Unknown Subcommand\nThe specified subcommand was not recognized.')
                        );
                        
                    await interaction.editReply({ 
                        components: [unknownContainer],
                        flags: MessageFlags.IsComponentsV2 
                    });
            }
        } catch (error) {
            console.error('Slash Command Error:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Command Error\nAn error occurred while processing your command.')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Error logged • ${new Date().toLocaleString()}*`)
                );

            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } catch (err) {
                console.error('Follow-up error:', err);
            }
        }
    },

    async executePrefix(message, args) {
        await handlePrefixCommand(message, args);
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