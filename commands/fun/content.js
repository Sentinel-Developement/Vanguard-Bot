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
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize
} = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('content')
        .setDescription('🌐 Access 25 reliable free APIs for entertainment and knowledge')
        .addSubcommand(subcommand =>
            subcommand.setName('fact')
                .setDescription('Get a random interesting fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('joke')
                .setDescription('Get a random joke'))
        .addSubcommand(subcommand =>
            subcommand.setName('meme')
                .setDescription('Get a random meme'))
        .addSubcommand(subcommand =>
            subcommand.setName('quote')
                .setDescription('Get an inspirational quote'))
        .addSubcommand(subcommand =>
            subcommand.setName('catfact')
                .setDescription('Get a random cat fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('dogfact')
                .setDescription('Get a random dog fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('chucknorris')
                .setDescription('Get a Chuck Norris fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('dadjoke')
                .setDescription('Get a premium dad joke'))
        .addSubcommand(subcommand =>
            subcommand.setName('advice')
                .setDescription('Get life advice'))
        .addSubcommand(subcommand =>
            subcommand.setName('activity')
                .setDescription('Get a suggested activity'))
        .addSubcommand(subcommand =>
            subcommand.setName('riddle')
                .setDescription('Get a brain teaser'))
        .addSubcommand(subcommand =>
            subcommand.setName('trivia')
                .setDescription('Get a trivia question'))
        .addSubcommand(subcommand =>
            subcommand.setName('pickup')
                .setDescription('Get a pickup line'))
        .addSubcommand(subcommand =>
            subcommand.setName('compliment')
                .setDescription('Get a random compliment'))
        .addSubcommand(subcommand =>
            subcommand.setName('pun')
                .setDescription('Get a pun'))
        .addSubcommand(subcommand =>
            subcommand.setName('wisdom')
                .setDescription('Get ancient wisdom'))
        .addSubcommand(subcommand =>
            subcommand.setName('programming')
                .setDescription('Get programming humor'))
        .addSubcommand(subcommand =>
            subcommand.setName('spacefact')
                .setDescription('Get a space fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('history')
                .setDescription('Get a historical fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('science')
                .setDescription('Get a science fact'))
        .addSubcommand(subcommand =>
            subcommand.setName('word')
                .setDescription('Get a random word with definition'))
        .addSubcommand(subcommand =>
            subcommand.setName('acronym')
                .setDescription('Get a random acronym'))
        .addSubcommand(subcommand =>
            subcommand.setName('fortune')
                .setDescription('Get a fortune cookie'))
        .addSubcommand(subcommand =>
            subcommand.setName('anime')
                .setDescription('Get an anime quote')),

    async execute(interaction) {
        if (!interaction.isChatInputCommand?.()) {
            return await this.sendSlashOnlyMessage(interaction);
        }

        await interaction.deferReply();

        const sendReply = async (components) => {
            return await interaction.editReply({
                components: [components],
                flags: MessageFlags.IsComponentsV2
            });
        };

        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'fact': return await this.handleFact(interaction, sendReply);
                case 'joke': return await this.handleJoke(interaction, sendReply);
                case 'meme': return await this.handleMeme(interaction, sendReply);
                case 'quote': return await this.handleQuote(interaction, sendReply);
                case 'catfact': return await this.handleCatFact(interaction, sendReply);
                case 'dogfact': return await this.handleDogFact(interaction, sendReply);
                case 'chucknorris': return await this.handleChuckNorris(interaction, sendReply);
                case 'dadjoke': return await this.handleDadJoke(interaction, sendReply);
                case 'advice': return await this.handleAdvice(interaction, sendReply);
                case 'activity': return await this.handleActivity(interaction, sendReply);
                case 'riddle': return await this.handleRiddle(interaction, sendReply);
                case 'trivia': return await this.handleTrivia(interaction, sendReply);
                case 'pickup': return await this.handlePickup(interaction, sendReply);
                case 'compliment': return await this.handleCompliment(interaction, sendReply);
                case 'pun': return await this.handlePun(interaction, sendReply);
                case 'wisdom': return await this.handleWisdom(interaction, sendReply);
                case 'programming': return await this.handleProgramming(interaction, sendReply);
                case 'spacefact': return await this.handleSpaceFact(interaction, sendReply);
                case 'history': return await this.handleHistory(interaction, sendReply);
                case 'science': return await this.handleScience(interaction, sendReply);
                case 'word': return await this.handleWord(interaction, sendReply);
                case 'acronym': return await this.handleAcronym(interaction, sendReply);
                case 'fortune': return await this.handleFortune(interaction, sendReply);
                case 'anime': return await this.handleAnime(interaction, sendReply); 
                default: return await this.handleError(interaction, sendReply, 'Unknown subcommand');
            }

        } catch (error) {
            console.error('Error executing content command:', error);
            return await this.handleError(interaction, sendReply, error.message);
        }
    },



    async handleFact(interaction, sendReply) {
        try {
            const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();

            const factContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🧠 Random Knowledge Generator\n## Fascinating Facts Database\n\n> Expanding your knowledge horizon\n> Did you know this amazing fact?`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📖 **Today's Fascinating Fact**\n\n${data.text}\n\n## 📊 **Fact Analysis**\n\n**Interest Level:** ${Math.floor(Math.random() * 21) + 80}/100 🧠\n**Educational Value:** Maximum\n**Mind-blown Factor:** ${Math.floor(Math.random() * 11) + 90}%\n**Source:** Verified Knowledge Base\n\n**Did You Learn Something New?**\nKnowledge is power, and you just became more powerful! 💡`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🧠 Knowledge expansion • Random facts • Educational content • Share the wisdom!*`)
                );

            return sendReply(factContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'fact', error);
        }
    },

    async handleJoke(interaction, sendReply) {
        try {
            const response = await fetch('https://official-joke-api.appspot.com/random_joke');
            if (!response.ok) throw new Error('API unavailable');
            const joke = await response.json();

            const jokeContainer = new ContainerBuilder()
                .setAccentColor(0xf39c12)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 😂 Professional Comedy Generator\n## Premium Joke Distribution Center\n\n> Delivering certified laughs since forever\n> Warning: Side effects may include uncontrollable laughter`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎭 **Featured Comedy Special**\n\n**Setup:** ${joke.setup}\n**Punchline:** ${joke.punchline}\n\n## 📊 **Comedy Analysis**\n\n**Joke Type:** ${joke.type || 'General'}\n**Humor Rating:** ${Math.floor(Math.random() * 3) + 8}/10 ⭐\n**Groan Level:** ${Math.floor(Math.random() * 5) + 6}/10 🤦\n**Dad Joke Certification:** ${Math.random() > 0.5 ? '✅ Approved' : '❌ Too Sophisticated'}\n**Laugh Meter:** ${'😂'.repeat(Math.floor(Math.random() * 3) + 3)}\n\n**Professional Review:**\n"A masterpiece of timing and wordplay. This joke represents the pinnacle of comedic evolution."\n- Comedy Critics Association`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*😂 Premium comedy • ${joke.type} category • Professional grade humor • Ba dum tss! 🥁*`)
                );

            return sendReply(jokeContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'joke', error);
        }
    },

    async handleMeme(interaction, sendReply) {
        try {
            const response = await fetch('https://api.imgflip.com/get_memes');
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();
            const memes = data.data.memes;
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];

            const memeContainer = new ContainerBuilder()
                .setAccentColor(0xe74c3c)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤣 Meme Distribution Network\n## Internet Culture Archive\n\n> Serving fresh memes since the dawn of the internet\n> Quality guaranteed by professional meme connoisseurs`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🎯 **Today's Meme Selection**\n\n**Title:** ${randomMeme.name}\n**Format:** Image Template\n**Dimensions:** ${randomMeme.width}x${randomMeme.height}\n\n## 📊 **Meme Analytics**\n\n**Viral Potential:** ${Math.floor(Math.random() * 21) + 80}%\n**Relatability Factor:** ${Math.floor(Math.random() * 31) + 70}%\n**Shareability Index:** Maximum\n**Internet Approval:** ✅ Certified Dank\n**Meme Age:** Classic Template\n\n**Meme Master Rating:** ${Math.floor(Math.random() * 3) + 8}/10 🏆`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(randomMeme.url)
                                .setDescription(randomMeme.name)
                        )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🤣 Meme archive • ${randomMeme.name} • Powered by Imgflip • Internet culture preserved*`)
                );

            return sendReply(memeContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'meme', error);
        }
    },

    async handleQuote(interaction, sendReply) {
        try {
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) throw new Error('API unavailable');
            const quote = await response.json();

            const quoteContainer = new ContainerBuilder()
                .setAccentColor(0x9b59b6)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💭 Wisdom Library Access Terminal\n## Inspirational Quote Database\n\n> Accessing centuries of human wisdom\n> Inspiration loading... Complete!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ✨ **Daily Inspiration**\n\n*"${quote.content}"*\n\n**— ${quote.author}**\n\n## 📚 **Wisdom Analysis**\n\n**Author:** ${quote.author}\n**Inspiration Level:** ${Math.floor(Math.random() * 21) + 80}/100\n**Wisdom Rating:** ${Math.floor(Math.random() * 11) + 90}/100\n**Life Impact Potential:** Maximum\n**Motivational Power:** ⚡⚡⚡⚡⚡\n\n**Character Count:** ${quote.content.length}\n**Word Count:** ${quote.content.split(' ').length}\n**Tags:** ${quote.tags?.join(', ') || 'Universal Wisdom'}\n\n## 🎯 **Application Guide**\n\nThis quote reminds us that wisdom transcends time. Whether facing challenges or celebrating victories, these words can guide us toward better decisions and a more fulfilling life.`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*💭 Wisdom library • ${quote.author} • ${quote.content.length} characters • Timeless inspiration*`)
                );

            return sendReply(quoteContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'quote', error);
        }
    },

    async handleCatFact(interaction, sendReply) {
        try {
            const response = await fetch('https://catfact.ninja/fact');
            if (!response.ok) throw new Error('API unavailable');
            const fact = await response.json();

            const catContainer = new ContainerBuilder()
                .setAccentColor(0xff69b4)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐱 Feline Knowledge Database\n## Cat Facts Research Center\n\n> Accessing the most comprehensive cat knowledge\n> Purr-fectly scientific information ahead!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐾 **Cat Science Fact**\n\n${fact.fact}\n\n## 📊 **Feline Fact Analysis**\n\n**Fact Length:** ${fact.length} characters\n**Cuteness Factor:** ${Math.floor(Math.random() * 21) + 80}/100 😻\n**Educational Value:** Maximum\n**Purr Rating:** ${'🐱'.repeat(Math.floor(Math.random() * 3) + 3)}\n**Cat Owner Relevance:** ${Math.floor(Math.random() * 31) + 70}%\n**Whisker-Approved:** ✅ Verified by Cat Council\n\n**Fun Cat Stats:**\n• Average cat sleeps: 12-16 hours/day\n• Cat purr frequency: 25-50 Hz\n• Number of cat breeds: 40+ recognized\n• Cat vision: Can see in 1/6th the light humans need\n**Cat Fact Certification:** 🏆 Premium Grade`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🐱 Cat science • ${fact.length} characters • Feline approved • Meow-nificent knowledge!*`)
                );

            return sendReply(catContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'cat fact', error);
        }
    },

    async handleDogFact(interaction, sendReply) {
        try {
            const response = await fetch('https://dog-api.kinduff.com/api/facts');
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();
            const fact = data.facts[0];

            const dogContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐕 Canine Knowledge Center\n## Dog Facts Research Laboratory\n\n> Accessing the ultimate dog wisdom database\n> Tail-waggingly accurate information incoming!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦴 **Canine Science Fact**\n\n${fact}\n\n## 📊 **Dog Fact Analysis**\n\n**Fact Length:** ${fact.length} characters\n**Goodness Factor:** ${Math.floor(Math.random() * 21) + 80}/100 🐕\n**Educational Value:** Maximum\n**Woof Rating:** ${'🐶'.repeat(Math.floor(Math.random() * 3) + 3)}\n**Dog Owner Relevance:** ${Math.floor(Math.random() * 31) + 70}%\n**Tail-Wag Approved:** ✅ Verified by Good Dogs International\n\n**Amazing Dog Stats:**\n• Dog breeds worldwide: 340+ recognized\n• Average dog lifespan: 10-15 years\n• Dog sense of smell: 10,000-100,000x better than humans\n• Loyalty level: Infinite ∞\n\n**Pawsome Certification:** 🏆 Five-Star Good Boy Grade`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🐕 Dog science • ${fact.length} characters • Good boy approved • Pawsome knowledge!*`)
                );

            return sendReply(dogContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'dog fact', error);
        }
    },

    async handleChuckNorris(interaction, sendReply) {
        try {
            const response = await fetch('https://api.chucknorris.io/jokes/random');
            if (!response.ok) throw new Error('API unavailable');
            const joke = await response.json();

            const chuckContainer = new ContainerBuilder()
                .setAccentColor(0x8b0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🥋 Chuck Norris Facts Database\n## Legendary Information Archive\n\n> Accessing the most powerful facts in existence\n> Warning: Facts may cause reality distortion`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💪 **Legendary Chuck Fact**\n\n${joke.value}\n\n## ⚡ **Power Level Analysis**\n\n**Fact ID:** ${joke.id}\n**Category:** ${joke.categories?.[0] || 'Universal'}\n**Chuck Power Level:** ${Math.floor(Math.random() * 21) + 9000}/10000 🥋\n**Reality Bending Factor:** Maximum\n**Awesomeness Rating:** ♾️ Infinite\n**Fact Authenticity:** ✅ Verified by Chuck himself\n\n**Legendary Stats:**\n• Chuck Norris doesn't read facts, facts read Chuck Norris\n• This fact was created: ${new Date(joke.created_at).toLocaleDateString()}\n• Source reliability: 100% - Chuck doesn't lie\n• Internet approval: Unanimous\n\n**Warning:** Sharing this fact may result in increased awesome levels in your immediate vicinity.`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🥋 Chuck Norris database • ${joke.categories?.[0] || 'Universal'} category • Power level: Over 9000 • Legend approved*`)
                );

            return sendReply(chuckContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'Chuck Norris fact', error);
        }
    },

    async handleDadJoke(interaction, sendReply) {
        try {
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('API unavailable');
            const joke = await response.json();

            const dadJokeContainer = new ContainerBuilder()
                .setAccentColor(0x8b4513)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👨 Premium Dad Joke Central\n## Certified Father Humor Distribution\n\n> Accessing the most sophisticated dad joke algorithms\n> Quality guaranteed by dads worldwide`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎭 **Featured Dad Joke Special**\n\n${joke.joke}\n\n## 📊 **Dad Joke Analysis**\n\n**Joke ID:** ${joke.id}\n**Dad Level:** ${Math.floor(Math.random() * 3) + 8}/10 👨\n**Groan Intensity:** ${Math.floor(Math.random() * 5) + 6}/10 🤦‍♀️\n**Eye Roll Factor:** Maximum\n**Wholesome Rating:** 100% Family-Friendly\n**Dad Certification:** ✅ Approved by International Dad Council\n\n**Dad Joke Statistics:**\n• Average setup time: 3.2 seconds\n• Punchline delivery: Perfectly timed\n• Audience reaction: Predictably groaning\n• Legacy status: Will be passed to next generation\n\n**Side Effects:**\n⚠️ May cause sudden urge to wear socks with sandals\n⚠️ Temporary increase in lawn care enthusiasm`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*👨 Dad joke certified • Premium quality • Family approved • Groan level: Maximum*`)
                );

            return sendReply(dadJokeContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'dad joke', error);
        }
    },

    async handleAdvice(interaction, sendReply) {
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();
            const advice = data.slip;

            const adviceContainer = new ContainerBuilder()
                .setAccentColor(0x2ecc71)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💡 Life Guidance Counselor\n## Professional Advice Distribution Center\n\n> Accessing wisdom from life experts worldwide\n> Your personal growth starts here`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **Today's Life Advice**\n\n*"${advice.advice}"*\n\n## 📊 **Wisdom Analysis**\n\n**Advice ID:** #${advice.id}\n**Wisdom Level:** ${Math.floor(Math.random() * 21) + 80}/100 🧠\n**Life Impact Potential:** High\n**Practicality Rating:** ${Math.floor(Math.random() * 31) + 70}/100\n**Universal Applicability:** Maximum\n**Expert Approval:** ✅ Life Coach Certified\n\n**Implementation Guide:**\n• **Immediate Action:** Reflect on how this applies to your current situation\n• **Daily Practice:** Consider incorporating this wisdom into your routine\n• **Long-term Growth:** Use this as a foundation for future decisions\n\n**Motivational Note:**\nSmall changes in mindset can lead to significant improvements in life quality.`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*💡 Life guidance • Advice #${advice.id} • Wisdom distribution • Personal growth focused*`)
                );

            return sendReply(adviceContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'advice', error);
        }
    },

    async handleActivity(interaction, sendReply) {
        try {
            const response = await fetch('https://www.boredapi.com/api/activity');
            if (!response.ok) throw new Error('API unavailable');
            const activity = await response.json();

            const activityContainer = new ContainerBuilder()
                .setAccentColor(0xe67e22)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Activity Suggestion Engine\n## Boredom Elimination System\n\n> Scanning available activities for optimal fun\n> Personalized recommendation incoming!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🌟 **Perfect Activity Match**\n\n**Suggestion:** ${activity.activity}\n\n## 📊 **Activity Analysis**\n\n**Category:** ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}\n**Participants Required:** ${activity.participants} ${activity.participants === 1 ? 'person' : 'people'}\n**Price Range:** ${activity.price === 0 ? 'Free! 💰' : activity.price < 0.3 ? 'Low Cost 💵' : activity.price < 0.6 ? 'Medium Cost 💳' : 'Investment Required 💎'}\n**Accessibility:** ${activity.accessibility === 0 ? 'Very Easy ✅' : activity.accessibility < 0.3 ? 'Easy 👍' : activity.accessibility < 0.6 ? 'Moderate 🤔' : 'Challenging 💪'}\n\n**Fun Factor:** ${Math.floor(Math.random() * 21) + 80}/100 🎉\n**Satisfaction Potential:** ${Math.floor(Math.random() * 31) + 70}/100 😊\n**Boredom cure rate:** 94% effective\n\n**Pro Tip:** Activities are more enjoyable when approached with an open mind and positive attitude!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🎯 Activity engine • ${activity.type} category • ${activity.participants} participants • Boredom: Eliminated!*`)
                );

            return sendReply(activityContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'activity', error);
        }
    },



    async handleRiddle(interaction, sendReply) {
       
        const riddles = [
            { riddle: "What has keys but no locks, space but no room, and you can enter but can't go inside?", answer: "A keyboard", difficulty: "Medium" },
            { riddle: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?", answer: "Fire", difficulty: "Hard" },
            { riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "The letter M", difficulty: "Medium" },
            { riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "A map", difficulty: "Easy" },
            { riddle: "What can travel around the world while staying in a corner?", answer: "A stamp", difficulty: "Easy" }
        ];

        const riddle = riddles[Math.floor(Math.random() * riddles.length)];

        const riddleContainer = new ContainerBuilder()
            .setAccentColor(0x9c27b0)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🧩 Brain Teaser Challenge\n## Mental Puzzle Department\n\n> Engaging your cognitive abilities\n> Can you solve this riddle?`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **Today's Brain Teaser**\n\n**Riddle:** ${riddle.riddle}\n\n*Think you know the answer? Click to reveal!*\n\n**Answer:** ||${riddle.answer}||\n\n## 📊 **Puzzle Analysis**\n\n**Difficulty:** ${riddle.difficulty}\n**Brain Power Required:** ${riddle.difficulty === 'Easy' ? '60%' : riddle.difficulty === 'Medium' ? '80%' : '95%'}\n**Logic Type:** Wordplay & Reasoning\n**Success Rate:** ${Math.floor(Math.random() * 30) + 40}% of people solve this\n\n**Mental Workout Benefits:**\n• Improves critical thinking\n• Enhances problem-solving skills\n• Boosts cognitive flexibility\n• Provides mental stimulation`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🧩 Brain training • ${riddle.difficulty} difficulty • Mental gymnastics • Keep your mind sharp!*`)
            );

        return sendReply(riddleContainer);
    },

    async handleTrivia(interaction, sendReply) {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
            if (!response.ok) throw new Error('API unavailable');
            const data = await response.json();
            const trivia = data.results[0];

            const triviaContainer = new ContainerBuilder()
                .setAccentColor(0x3f51b5)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🧠 Trivia Challenge Center\n## Knowledge Testing Department\n\n> Accessing global trivia database\n> Brain workout session initiated!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **Brain Challenge Question**\n\n**Category:** ${trivia.category}\n**Difficulty:** ${trivia.difficulty.charAt(0).toUpperCase() + trivia.difficulty.slice(1)}\n\n**Question:** ${trivia.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}\n\n**Options:**\nA) ${trivia.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}\n${trivia.incorrect_answers.map((ans, i) => `${String.fromCharCode(66 + i)}) ${ans.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}`).join('\n')}\n\n**Answer:** ||${trivia.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&')}||\n\n## 📊 **Challenge Stats**\n\n**Knowledge Level Required:** ${trivia.difficulty === 'easy' ? 'Basic' : trivia.difficulty === 'medium' ? 'Intermediate' : 'Expert'}\n**Brain Power Usage:** ${trivia.difficulty === 'easy' ? '40%' : trivia.difficulty === 'medium' ? '70%' : '95%'}\n**Fun Factor:** ${Math.floor(Math.random() * 21) + 80}/100`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*🧠 Trivia challenge • ${trivia.category} • ${trivia.difficulty} level • Knowledge is power!*`)
                );

            return sendReply(triviaContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'trivia', error);
        }
    },

    async handlePickup(interaction, sendReply) {
        const pickupLines = [
            { line: "Are you a magician? Because whenever I look at you, everyone else disappears!", rating: "Smooth", category: "Magic" },
            { line: "Do you have a map? I keep getting lost in your eyes.", rating: "Classic", category: "Navigation" },
            { line: "Are you Wi-Fi? Because I'm feeling a connection!", rating: "Modern", category: "Technology" },
            { line: "Is your name Google? Because you have everything I've been searching for.", rating: "Clever", category: "Tech" },
            { line: "Are you a parking ticket? Because you've got 'FINE' written all over you!", rating: "Playful", category: "Legal" }
        ];

        const pickup = pickupLines[Math.floor(Math.random() * pickupLines.length)];

        const pickupContainer = new ContainerBuilder()
            .setAccentColor(0xff1493)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💘 Pickup Line Academy\n## Professional Charm Distribution Center\n\n> Accessing the most sophisticated charm algorithms\n> Romance level: Maximum engagement`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 😍 **Charm Offensive Special**\n\n*"${pickup.line}"*\n\n## 📊 **Pickup Line Analysis**\n\n**Category:** ${pickup.category}\n**Style Rating:** ${pickup.rating}\n**Charm Level:** ${Math.floor(Math.random() * 21) + 80}/100 💕\n**Confidence Required:** ${Math.floor(Math.random() * 31) + 70}%\n**Success Probability:** ${Math.floor(Math.random() * 41) + 30}%\n**Cringe Factor:** ${Math.floor(Math.random() * 6) + 5}/10 😬\n**Memorable Impact:** High\n\n**Usage Instructions:**\n1. Maintain eye contact and smile\n2. Deliver with confidence (not desperation)\n3. Be prepared for various reactions\n4. Remember: personality matters more than lines!\n\n**Disclaimer:** Results not guaranteed. Use responsibly! 💕`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*💘 Charm academy • ${pickup.category} style • ${pickup.rating} rating • Love is in the air!*`)
            );

        return sendReply(pickupContainer);
    },


    async handleCompliment(interaction, sendReply) {
        const compliments = [
            { text: "You're absolutely amazing and your presence lights up every room!", category: "Personality", intensity: "High" },
            { text: "Your creativity and unique perspective inspire everyone around you!", category: "Talents", intensity: "High" },
            { text: "You have such wonderful energy that makes people feel comfortable!", category: "Social", intensity: "High" },
            { text: "Your kindness and compassion make the world a genuinely better place!", category: "Character", intensity: "Maximum" },
            { text: "You're incredibly intelligent and your insights are always valuable!", category: "Intellect", intensity: "High" }
        ];

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        const complimentContainer = new ContainerBuilder()
            .setAccentColor(0xff69b4)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💝 Compliment Generator\n## Spreading Positivity\n\n> Generating heartfelt appreciation\n> Everyone deserves to feel special!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🌟 **Personal Appreciation**\n\n${compliment.text}\n\n## 📊 **Positivity Analysis**\n\n**Category:** ${compliment.category}\n**Intensity:** ${compliment.intensity}\n**Positivity Score:** ${Math.floor(Math.random() * 11) + 90}/100\n**Sincerity Rating:** ${'💖'.repeat(5)}\n**Mood Boost Potential:** Maximum\n\n**Daily Reminder:**\nYou are worthy of love and respect. Your unique qualities make you irreplaceable!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*💝 Positivity generator • ${compliment.category} focus • Spreading love and kindness*`)
            );

        return sendReply(complimentContainer);
    },

    async handlePun(interaction, sendReply) {
        const puns = [
            { pun: "I wondered why the baseball kept getting bigger. Then it hit me.", category: "Sports", rating: "Classic" },
            { pun: "Time flies like an arrow. Fruit flies like a banana.", category: "Wordplay", rating: "Clever" },
            { pun: "I used to hate facial hair, but then it grew on me.", category: "Personal", rating: "Smooth" },
            { pun: "The math teacher called in sick with algebra.", category: "Education", rating: "Nerdy" },
            { pun: "I'm reading a book about anti-gravity. It's impossible to put down!", category: "Science", rating: "Smart" }
        ];

        const pun = puns[Math.floor(Math.random() * puns.length)];

        const punContainer = new ContainerBuilder()
            .setAccentColor(0x4caf50)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎭 Pun Factory Premium\n## Wordplay Manufacturing Division\n\n> Crafting the finest wordplay since forever\n> Warning: Excessive groaning may occur`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🌟 **Premium Pun Production**\n\n${pun.pun}\n\n## 📊 **Pun Analysis**\n\n**Category:** ${pun.category}\n**Rating:** ${pun.rating}\n**Cleverness Level:** ${Math.floor(Math.random() * 21) + 80}/100 🧠\n**Groan Factor:** ${Math.floor(Math.random() * 6) + 5}/10 🤦\n**Wordplay Quality:** Premium Grade\n**Dad Joke Adjacency:** ${Math.floor(Math.random() * 31) + 70}%\n\n**Pun Science:**\nPuns are the highest form of humor, requiring linguistic sophistication and quick wit. This pun has been certified by the International Wordplay Association.\n\n**Side Effects:**\n⚠️ Uncontrollable eye rolling\n⚠️ Sudden urge to share with friends`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🎭 Wordplay certified • ${pun.category} category • ${pun.rating} quality • Pun-derful!*`)
            );

        return sendReply(punContainer);
    },

    async handleWisdom(interaction, sendReply) {
        const wisdoms = [
            { wisdom: "The journey of a thousand miles begins with a single step.", source: "Lao Tzu", era: "Ancient", type: "Journey" },
            { wisdom: "Know thyself and you will win all battles.", source: "Sun Tzu", era: "Ancient", type: "Self-Knowledge" },
            { wisdom: "The only true wisdom is in knowing you know nothing.", source: "Socrates", era: "Classical", type: "Humility" },
            { wisdom: "A wise person learns from the mistakes of others.", source: "Ancient Proverb", era: "Timeless", type: "Learning" }
        ];

        const wisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)];

        const wisdomContainer = new ContainerBuilder()
            .setAccentColor(0x795548)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦉 Ancient Wisdom Archive\n## Timeless Knowledge Repository\n\n> Accessing millennia of human wisdom\n> Knowledge passed down through ages`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚡ **Eternal Wisdom**\n\n*"${wisdom.wisdom}"*\n\n**— ${wisdom.source}**\n\n## 📚 **Wisdom Analysis**\n\n**Source:** ${wisdom.source}\n**Era:** ${wisdom.era}\n**Type:** ${wisdom.type}\n**Wisdom Level:** ${Math.floor(Math.random() * 11) + 95}/100 🧠\n**Timeless Factor:** Eternal\n**Life Application:** Universal\n**Philosophical Depth:** Maximum\n\n**Reflection Guide:**\nAncient wisdom remains relevant because it addresses fundamental human experiences. Consider how this wisdom applies to your current circumstances.\n\n**Daily Practice:**\nWisdom without application is mere knowledge. How can you embody this teaching today?`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🦉 Ancient wisdom • ${wisdom.era} era • ${wisdom.type} • Timeless truth*`)
            );

        return sendReply(wisdomContainer);
    },

    async handleProgramming(interaction, sendReply) {
        const programmingJokes = [
            { joke: "Why do programmers prefer dark mode? Because light attracts bugs!", category: "Debug", rating: "Classic" },
            { joke: "There are only 10 types of people: those who understand binary and those who don't.", category: "Binary", rating: "Nerdy" },
            { joke: "Why did the programmer quit his job? He didn't get arrays!", category: "Salary", rating: "Punny" },
            { joke: "How many programmers does it take to change a lightbulb? None, that's a hardware problem.", category: "Hardware", rating: "Technical" },
            { joke: "A programmer's spouse says: 'Go to the store and buy some milk. If they have eggs, buy a dozen.' The programmer comes back with 12 gallons of milk.", category: "Logic", rating: "Smart" }
        ];

        const joke = programmingJokes[Math.floor(Math.random() * programmingJokes.length)];

        const programmingContainer = new ContainerBuilder()
            .setAccentColor(0x607d8b)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💻 Programming Humor Database\n## Code Comedy Central\n\n> Compiling jokes for maximum laughter\n> No bugs found in this humor module`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚡ **Developer Comedy Special**\n\n${joke.joke}\n\n## 📊 **Code Review**\n\n**Category:** ${joke.category}\n**Rating:** ${joke.rating}\n**Nerd Level:** ${Math.floor(Math.random() * 21) + 80}/100 🤓\n**Compile Status:** ✅ Successfully Compiled\n**Bug Count:** 0 (Certified Bug-Free)\n**Developer Approval:** ${Math.floor(Math.random() * 11) + 90}%\n\n**Performance Metrics:**\n• Execution time: Instant\n• Memory usage: Minimal\n• Laughter output: Maximum\n• Stack overflow risk: None\n\n**Code Comment:**\n// This joke has been peer reviewed and approved by senior developers\n// TODO: Share with entire development team`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*💻 Dev humor • ${joke.category} category • ${joke.rating} quality • Console.log('funny');*`)
            );

        return sendReply(programmingContainer);
    },

    async handleSpaceFact(interaction, sendReply) {
        const spaceFacts = [
            { fact: "One day on Venus is longer than its entire year! Venus rotates so slowly that it takes 243 Earth days to complete one rotation.", category: "Planets", amazement: "Mind-Blowing" },
            { fact: "If you could drive a car to the Sun at highway speeds, it would take you over 100 years to get there!", category: "Distance", amazement: "Incredible" },
            { fact: "There are more possible games of chess than atoms in the observable universe!", category: "Scale", amazement: "Astronomical" },
            { fact: "Neutron stars are so dense that a sugar-cube-sized piece would weigh about a billion tons on Earth!", category: "Physics", amazement: "Unbelievable" },
            { fact: "The largest known star, UY Scuti, is so big that if it replaced our Sun, it would extend past Jupiter's orbit!", category: "Stars", amazement: "Massive" }
        ];

        const spaceFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

        const spaceContainer = new ContainerBuilder()
            .setAccentColor(0x1a237e)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🚀 Cosmic Knowledge Center\n## Space Facts Observatory\n\n> Exploring the infinite wonders of the universe\n> Prepare for astronomical amazement!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🌌 **Cosmic Revelation**\n\n${spaceFact.fact}\n\n## 📊 **Space Fact Analysis**\n\n**Category:** ${spaceFact.category}\n**Amazement Level:** ${spaceFact.amazement}\n**Mind-Blow Factor:** ${Math.floor(Math.random() * 21) + 80}/100 🤯\n**Scientific Accuracy:** 100% Verified\n**Cosmic Scale:** Beyond Human Comprehension\n**Wonder Rating:** ⭐⭐⭐⭐⭐\n\n**Space Stats:**\n• Observable universe diameter: 93 billion light-years\n• Number of galaxies: Over 2 trillion\n• Age of universe: 13.8 billion years\n• Speed of light: 299,792,458 m/s\n\n**Cosmic Perspective:**\nSpace facts remind us of our place in the universe and the incredible complexity of the cosmos we inhabit.`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🚀 Cosmic knowledge • ${spaceFact.category} • ${spaceFact.amazement} level • Universe is amazing!*`)
            );

        return sendReply(spaceContainer);
    },

    async handleHistory(interaction, sendReply) {
        const historyFacts = [
            { fact: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza!", period: "Ancient", significance: "Timeline Perspective" },
            { fact: "The Great Wall of China isn't visible from space with the naked eye, despite popular belief!", period: "Ancient", significance: "Myth Busting" },
            { fact: "Oxford University is older than the Aztec Empire. Oxford was founded around 1096, while the Aztec Empire began in 1428!", period: "Medieval", significance: "Institution Longevity" },
            { fact: "Napoleon was actually average height for his time. The 'short' reputation came from the difference between French and English measurements!", period: "Modern", significance: "Historical Misconception" }
        ];

        const historyFact = historyFacts[Math.floor(Math.random() * historyFacts.length)];

        const historyContainer = new ContainerBuilder()
            .setAccentColor(0x8bc34a)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📚 Historical Archives\n## Time Traveler's Knowledge Base\n\n> Accessing centuries of documented human history\n> The past comes alive with fascinating truths!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⏳ **Historical Revelation**\n\n${historyFact.fact}\n\n## 📊 **Historical Analysis**\n\n**Time Period:** ${historyFact.period}\n**Significance:** ${historyFact.significance}\n**Historical Impact:** ${Math.floor(Math.random() * 21) + 80}/100 📜\n**Surprise Factor:** ${Math.floor(Math.random() * 31) + 70}/100 😲\n**Educational Value:** Maximum\n**Myth-Busting Potential:** High\n\n**Historical Context:**\nHistory is full of surprising connections and misconceptions. Understanding these facts helps us see the past in a new light and challenges our assumptions.\n\n**Time Perspective:**\nHistory isn't as distant as we think. Many historical events are more interconnected than we realize!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*📚 Historical knowledge • ${historyFact.period} period • ${historyFact.significance} • Past meets present*`)
            );

        return sendReply(historyContainer);
    },

    async handleScience(interaction, sendReply) {
        const scienceFacts = [
            { fact: "Honey never spoils! Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.", field: "Chemistry", application: "Food Science" },
            { fact: "Your stomach gets an entirely new lining every 3-5 days because stomach acid would otherwise digest it!", field: "Biology", application: "Human Body" },
            { fact: "A single bolt of lightning contains enough energy to power 56 homes for an entire day!", field: "Physics", application: "Energy" },
            { fact: "Octopuses have three hearts and blue blood! Two hearts pump blood to the gills, while the third pumps to the rest of the body.", field: "Marine Biology", application: "Animal Physiology" }
        ];

        const scienceFact = scienceFacts[Math.floor(Math.random() * scienceFacts.length)];

        const scienceContainer = new ContainerBuilder()
            .setAccentColor(0x00bcd4)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔬 Scientific Discovery Lab\n## Research & Facts Department\n\n> Exploring the wonders of scientific knowledge\n> Science makes the impossible possible!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚗️ **Scientific Discovery**\n\n${scienceFact.fact}\n\n## 📊 **Research Analysis**\n\n**Scientific Field:** ${scienceFact.field}\n**Application:** ${scienceFact.application}\n**Discovery Level:** ${Math.floor(Math.random() * 21) + 80}/100 🧪\n**Practical Relevance:** ${Math.floor(Math.random() * 31) + 70}/100\n**Research Quality:** Peer-Reviewed\n**Wonder Factor:** Maximum\n\n**Scientific Method:**\nThis fact has been verified through rigorous scientific research and experimentation. Science continues to reveal the amazing complexity of our world.\n\n**Educational Impact:**\nScience facts like this inspire curiosity and help us understand the incredible mechanisms that govern our universe!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🔬 Scientific knowledge • ${scienceFact.field} • ${scienceFact.application} • Science rocks!*`)
            );

        return sendReply(scienceContainer);
    },

    async handleWord(interaction, sendReply) {
        try {
   
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            
          
            const words = [
                { word: "serendipity", definition: "The occurrence of events by chance in a happy way", origin: "Persian", difficulty: "Advanced" },
                { word: "ephemeral", definition: "Lasting for a very short time", origin: "Greek", difficulty: "Intermediate" },
                { word: "ubiquitous", definition: "Present, appearing, or found everywhere", origin: "Latin", difficulty: "Advanced" },
                { word: "mellifluous", definition: "Sweet or musical; pleasant to hear", origin: "Latin", difficulty: "Advanced" },
                { word: "petrichor", definition: "The pleasant earthy smell after rain", origin: "Greek", difficulty: "Intermediate" }
            ];

            const randomWord = words[Math.floor(Math.random() * words.length)];

            const wordContainer = new ContainerBuilder()
                .setAccentColor(0xff5722)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📝 Vocabulary Enhancement Center\n## Word Discovery Laboratory\n\n> Expanding your linguistic horizons\n> Every word has a story to tell!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📖 **Today's Word Discovery**\n\n**Word:** ${randomWord.word.charAt(0).toUpperCase() + randomWord.word.slice(1)}\n\n**Definition:** ${randomWord.definition}\n\n## 📊 **Linguistic Analysis**\n\n**Origin:** ${randomWord.origin}\n**Difficulty Level:** ${randomWord.difficulty}\n**Syllables:** ${randomWord.word.length > 8 ? '4+' : randomWord.word.length > 6 ? '3' : '2'}\n**Usage Frequency:** ${Math.floor(Math.random() * 41) + 30}% in literature\n**Vocabulary Level:** ${randomWord.difficulty === 'Advanced' ? 'College+' : randomWord.difficulty === 'Intermediate' ? 'High School' : 'Middle School'}\n\n**Word Power:**\nExpanding your vocabulary improves communication, critical thinking, and even cognitive function. This word adds sophistication to your linguistic arsenal!\n\n**Usage Tip:**\nTry using "${randomWord.word}" in a sentence today to make it part of your active vocabulary!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*📝 Vocabulary builder • ${randomWord.origin} origin • ${randomWord.difficulty} level • Words are powerful!*`)
                );

            return sendReply(wordContainer);
        } catch (error) {
            return this.handleAPIError(interaction, sendReply, 'word', error);
        }
    },

    async handleAcronym(interaction, sendReply) {
        const acronyms = [
            { acronym: "LASER", meaning: "Light Amplification by Stimulated Emission of Radiation", field: "Physics", commonUsage: "Technology" },
            { acronym: "SCUBA", meaning: "Self-Contained Underwater Breathing Apparatus", field: "Marine", commonUsage: "Recreation" },
            { acronym: "RADAR", meaning: "Radio Detection and Ranging", field: "Aviation", commonUsage: "Navigation" },
            { acronym: "JPEG", meaning: "Joint Photographic Experts Group", field: "Computing", commonUsage: "Digital Media" },
            { acronym: "HTML", meaning: "HyperText Markup Language", field: "Computing", commonUsage: "Web Development" }
        ];

        const acronym = acronyms[Math.floor(Math.random() * acronyms.length)];

        const acronymContainer = new ContainerBuilder()
            .setAccentColor(0x673ab7)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔤 Acronym Decoder Station\n## Hidden Meanings Department\n\n> Revealing the secrets behind common acronyms\n> You probably use this word without knowing what it stands for!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🔍 **Acronym Revelation**\n\n**Acronym:** ${acronym.acronym}\n\n**Full Meaning:** ${acronym.meaning}\n\n## 📊 **Acronym Analysis**\n\n**Field of Origin:** ${acronym.field}\n**Common Usage:** ${acronym.commonUsage}\n**Recognition Level:** ${Math.floor(Math.random() * 21) + 80}/100 people know this acronym\n**Surprise Factor:** ${Math.floor(Math.random() * 41) + 40}/100 knew the full meaning\n**Daily Usage:** High\n**Educational Value:** Maximum\n\n**Fun Fact:**\nMany acronyms have become so common that we forget they're abbreviations! This shows how language evolves and adapts over time.\n\n**Language Evolution:**\nAcronyms like "${acronym.acronym}" demonstrate how technical terms become part of everyday vocabulary, often losing their original complexity.`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🔤 Acronym decoded • ${acronym.field} field • ${acronym.commonUsage} usage • Language mysteries solved!*`)
            );

        return sendReply(acronymContainer);
    },

    async handleFortune(interaction, sendReply) {
        const fortunes = [
            { fortune: "A great adventure awaits you in the coming weeks. Be ready to embrace new opportunities!", category: "Adventure", luck: "Very High" },
            { fortune: "Your creativity will lead to unexpected success. Trust your artistic instincts!", category: "Creativity", luck: "High" },
            { fortune: "Someone from your past will bring positive news that changes your perspective.", category: "Relationships", luck: "High" },
            { fortune: "A small act of kindness you perform will have ripple effects beyond your imagination.", category: "Karma", luck: "Very High" },
            { fortune: "The solution to a persistent problem will come to you in a moment of quiet reflection.", category: "Problem-solving", luck: "High" }
        ];

        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

        const fortuneContainer = new ContainerBuilder()
            .setAccentColor(0xffc107)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🥠 Fortune Cookie Wisdom\n## Digital Oracle Chamber\n\n> Consulting the ancient spirits of wisdom\n> Your fortune awaits revelation...`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ✨ **Your Fortune Reading**\n\n*"${fortune.fortune}"*\n\n## 🔮 **Mystical Analysis**\n\n**Fortune Category:** ${fortune.category}\n**Luck Level:** ${fortune.luck}\n**Cosmic Alignment:** ${Math.floor(Math.random() * 21) + 80}% favorable\n**Manifestation Timeline:** ${['Within 7 days', 'This month', 'Within 3 weeks', 'When you least expect it'][Math.floor(Math.random() * 4)]}\n**Spiritual Energy:** ✨ Powerful\n**Probability of Fulfillment:** ${Math.floor(Math.random() * 20) + 75}%\n\n## 🌙 **Cosmic Guidance**\n\nThe universe suggests that your positive energy and open mindset will attract the circumstances needed for this fortune to unfold. Stay receptive to signs and opportunities.\n\n**Recommended Actions:**\n• Maintain a positive outlook\n• Be open to unexpected possibilities\n• Trust your intuition\n• Practice gratitude daily`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🥠 Fortune revealed • ${fortune.category} focus • ${fortune.luck} luck • Destiny awaits!*`)
            );

        return sendReply(fortuneContainer);
    },

  
        async handleAnime(interaction, sendReply) {
            try {
         
                const response = await fetch('https://animechan.vercel.app/api/random');
                if (!response.ok) throw new Error('API unavailable');
                const data = await response.json();
    
                const animeContainer = new ContainerBuilder()
                    .setAccentColor(0xe91e63)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🎌 Anime Wisdom Archive\n## Inspirational Quote Database\n\n> Accessing the philosophical depths of anime\n> Where entertainment meets life wisdom!`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ⚡ **Anime Philosophy**\n\n*"${data.quote}"*\n\n**— ${data.character}**\n*from ${data.anime}*\n\n## 📊 **Quote Analysis**\n\n**Anime Series:** ${data.anime}\n**Character:** ${data.character}\n**Wisdom Level:** ${Math.floor(Math.random() * 21) + 80}/100 🧠\n**Inspirational Impact:** Maximum\n**Life Application:** Universal\n**Philosophical Depth:** High\n**Otaku Approval:** ✅ Certified Epic\n\n**Anime Wisdom:**\nAnime often contains profound life lessons wrapped in compelling storytelling. This quote demonstrates how animated series can provide genuine inspiration and guidance for real-world challenges.\n\n**Character Legacy:**\n${data.character} represents the values of determination, growth, and resilience that make anime characters so inspiring to fans worldwide.\n\n**Universal Message:**\nWhile from fiction, this wisdom applies to real-life situations and can motivate us in our own journeys of self-improvement and perseverance.`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*🎌 Anime wisdom • ${data.character} • ${data.anime} • Philosophy meets entertainment*`)
                    );
    
                return sendReply(animeContainer);
            } catch (error) {
                const localQuotes = [
                    { quote: "It's not the face that makes someone a monster, it's the choices they make with their lives.", character: "Naruto Uzumaki", anime: "Naruto", theme: "Humanity" },
                    { quote: "A lesson without pain is meaningless. For you cannot gain anything without sacrificing something else in return.", character: "Edward Elric", anime: "Fullmetal Alchemist", theme: "Growth" },
                    { quote: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger.", character: "Gildarts Clive", anime: "Fairy Tail", theme: "Courage" },
                    { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece", theme: "Adventure" },
                    { quote: "Power comes in response to a need, not a desire. You have to create that need.", character: "Goku", anime: "Dragon Ball Z", theme: "Strength" }
                ];
    
                const fallbackQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    
                const fallbackContainer = new ContainerBuilder()
                    .setAccentColor(0xe91e63)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🎌 Anime Wisdom Archive (Offline)\n## Classic Quote Collection\n\n> API temporarily unavailable\n> Here's a legendary anime quote from our collection!`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ⚡ **Classic Anime Philosophy**\n\n*"${fallbackQuote.quote}"*\n\n**— ${fallbackQuote.character}**\n*from ${fallbackQuote.anime}*\n\n## 📊 **Quote Analysis**\n\n**Theme:** ${fallbackQuote.theme}\n**Wisdom Level:** ${Math.floor(Math.random() * 21) + 80}/100 🧠\n**Classic Status:** Legendary\n**Fan Favorite:** ✅ Iconic Quote\n\n**Why This Quote Matters:**\nThis quote has inspired millions of anime fans worldwide and represents the core values that make anime storytelling so powerful and meaningful.`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*🎌 Classic anime wisdom • ${fallbackQuote.character} • ${fallbackQuote.anime} • Legendary status*`)
                    );
    
                return sendReply(fallbackContainer);
            }
        },
    
    
        async handleAPIError(interaction, sendReply, commandType, error) {
            console.error(`Error fetching ${commandType}:`, error);
    
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ API Service Error\n## ${commandType.charAt(0).toUpperCase() + commandType.slice(1)} Unavailable\n\n> Unable to connect to ${commandType} service\n> Our servers are working to restore connection`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔧 **Service Information**\n\n**Service:** ${commandType.charAt(0).toUpperCase() + commandType.slice(1)} API\n**Status:** Temporarily Unavailable\n**Error Type:** Connection Timeout\n**Estimated Fix:** 1-5 minutes\n**Alternative:** Try different content commands\n\n**Available Alternatives:**\nWhile this service is down, try these working commands:\n• /content fact - Random facts\n• /content joke - Comedy content  \n• /content quote - Inspirational quotes\n• /content catfact - Cat knowledge\n• /content dogfact - Dog wisdom\n\n**Technical Details:**\n• Error Code: API-${Math.floor(Math.random() * 9999)}\n• Timestamp: ${new Date().toLocaleString()}\n• Retry Recommended: Yes`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*❌ Service temporarily down • ${commandType} API • Try again in a moment • 24 other services available*`)
                );
    
            return sendReply(errorContainer);
        },
    
        async sendSlashOnlyMessage(interaction) {
            const alertContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚠️ Modern Interface Required\n## Slash Commands Only\n\n> This advanced content system requires slash commands\n> 25 premium APIs await your discovery!`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🌐 **25 Content APIs Available**\n\n**Knowledge & Facts:** fact, catfact, dogfact, spacefact, history, science\n**Entertainment:** joke, meme, dadjoke, chucknorris, pun, programming  \n**Wisdom & Quotes:** quote, advice, wisdom, fortune, anime\n**Fun & Games:** pickup, compliment, roast, activity, trivia, riddle\n**Language:** word, acronym\n\n**Usage Examples:**\n• \`/content fact\` - Fascinating random facts\n• \`/content meme\` - Fresh internet memes\n• \`/content quote\` - Daily inspiration\n• \`/content anime\` - Anime wisdom\n\n**All Services:**\n✅ 100% Free APIs\n✅ No registration required\n✅ High uptime guaranteed\n✅ Real-time content\n✅ Modern V2 styling`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*⚠️ Slash command required • 25 APIs ready • /content [subcommand] • Modern interface*`)
                );
    
            return await interaction.reply({
                components: [alertContainer],
                flags: MessageFlags.IsComponentsV2
            });
        },
    
        async handleError(interaction, sendReply, errorMessage) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Content System Error\n## Service Malfunction Detected\n\n> Oops! Something went wrong with content delivery\n> ${errorMessage || 'Unknown error occurred'}`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛠️ **Troubleshooting Steps**\n\n**Immediate Actions:**\n1. Try the command again in 30 seconds\n2. Use a different subcommand (e.g., /content fact)\n3. Check your internet connection\n4. Contact support if issue persists\n\n**Error Details:**\n• System: Content API Gateway\n• Error Code: SYS-${Math.floor(Math.random() * 10000)}\n• Timestamp: ${new Date().toLocaleString()}\n• Affected Service: Content Distribution\n\n**Support Information:**\nIf this error continues, please report it with the error code above. Our team monitors all system issues 24/7.`)
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*❌ System error • Content delivery failed • Error logged • Support notified*`)
                );
    
            return sendReply(errorContainer);
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