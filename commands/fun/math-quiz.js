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

let activeQuizzes = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math-quiz')
        .setDescription('🧮 Ultimate mathematics quiz system with 10 difficulty levels')
        .addSubcommand(subcommand =>
            subcommand.setName('basic')
                .setDescription('🟢 Basic math quiz (Addition, Subtraction)')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('intermediate')
                .setDescription('🟡 Intermediate math quiz (Multiplication, Division)')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('advanced')
                .setDescription('🔴 Advanced math quiz (Powers, Roots, Algebra)')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('prime')
                .setDescription('🔢 Prime Numbers & Number Theory')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('ultimate')
                .setDescription('🌟 Ultimate Algebra & Complex Numbers')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('trigonometry')
                .setDescription('📐 Trigonometry & Identities')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('calculus')
                .setDescription('∫ Calculus & Differential Equations')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('statistics')
                .setDescription('📊 Statistics & Probability')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('mixed')
                .setDescription('🌈 Mixed difficulty quiz (All operations)')
                .addIntegerOption(option =>
                    option.setName('questions')
                        .setDescription('Number of questions (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand.setName('speed')
                .setDescription('⚡ Speed quiz (Quick fire questions)')
                .addIntegerOption(option =>
                    option.setName('time')
                        .setDescription('Time limit per question (5-30 seconds)')
                        .setRequired(false)
                        .setMinValue(5)
                        .setMaxValue(30)))
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
                .setDescription('🛑 Stop the active quiz'))
        .addSubcommand(subcommand =>
            subcommand.setName('leaderboard')
                .setDescription('🏆 View quiz leaderboard')),

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
                case 'basic': return await this.startQuiz(interaction, sendReply, 'basic');
                case 'intermediate': return await this.startQuiz(interaction, sendReply, 'intermediate');
                case 'advanced': return await this.startQuiz(interaction, sendReply, 'advanced');
                case 'prime': return await this.startQuiz(interaction, sendReply, 'prime');
                case 'ultimate': return await this.startQuiz(interaction, sendReply, 'ultimate');
                case 'trigonometry': return await this.startQuiz(interaction, sendReply, 'trigonometry');
                case 'calculus': return await this.startQuiz(interaction, sendReply, 'calculus');
                case 'statistics': return await this.startQuiz(interaction, sendReply, 'statistics');
                case 'mixed': return await this.startQuiz(interaction, sendReply, 'mixed');
                case 'speed': return await this.startQuiz(interaction, sendReply, 'speed');
                case 'stop': return await this.stopQuiz(interaction, sendReply);
                case 'leaderboard': return await this.showLeaderboard(interaction, sendReply);
                default: return await this.handleError(interaction, sendReply, 'Unknown subcommand');
            }

        } catch (error) {
            console.error('Error executing math quiz:', error);
            return await this.handleError(interaction, sendReply, error.message);
        }
    },

    async startQuiz(interaction, sendReply, difficulty) {
        const channelId = interaction.channel.id;
        const userId = interaction.user.id;
        const questionCount = interaction.options.getInteger('questions') || 10;
        const timeLimit = interaction.options.getInteger('time') || this.getDefaultTimeLimit(difficulty);

        if (activeQuizzes.has(channelId)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff6b6b)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Quiz Already Active\n## Channel Busy\n\n> There's already an active quiz in this channel\n> Use /mathquiz stop to end the current quiz first`)
                );
            return sendReply(errorContainer);
        }

        const quizData = {
            difficulty,
            questionCount,
            timeLimit,
            currentQuestion: 0,
            correctAnswers: 0,
            totalScore: 0,
            streak: 0,
            maxStreak: 0,
            startTime: Date.now(),
            questions: this.generateQuestions(difficulty, questionCount),
            userId,
            channelId
        };

        activeQuizzes.set(channelId, quizData);

        const startContainer = new ContainerBuilder()
            .setAccentColor(this.getDifficultyColor(difficulty))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🧮 Math Quiz Started!\n## ${this.getDifficultyIcon(difficulty)} ${this.getDifficultyTitle(difficulty)}\n\n> ${this.getDifficultyDescription(difficulty)}\n> Test your mathematical prowess!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **Quiz Configuration**\n\n**Difficulty:** ${this.getDifficultyTitle(difficulty)}\n**Total Questions:** ${questionCount}\n**Time per Question:** ${timeLimit} seconds\n**Complexity Level:** ${this.getComplexityLevel(difficulty)}\n**Operations:** ${this.getOperationsText(difficulty)}\n\n## 🎯 **How to Play**\n\n1. Each question will appear automatically\n2. Type your answer as a **number** ${difficulty === 'prime' ? 'or **yes/no**' : ''}\n3. Be accurate - these questions are challenging!\n4. Build streaks for multiplier bonuses\n\n## 🏆 **Advanced Scoring System**\n\n• **Correct Answer:** ${this.getBasePoints(difficulty)} points\n• **Speed Bonus:** Up to ${Math.floor(this.getBasePoints(difficulty) * 0.5)} extra points\n• **Difficulty Multiplier:** ${this.getDifficultyMultiplier(difficulty)}x\n• **Streak Multiplier:** 1.1x per consecutive correct\n• **Perfect Quiz:** ${this.getBasePoints(difficulty) * 5} bonus points`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🧮 ${this.getDifficultyTitle(difficulty)} quiz ready • ${questionCount} questions • ${timeLimit}s per question • Good luck!*`)
            );

        await sendReply(startContainer);
        setTimeout(() => this.askQuestion(interaction, quizData), 3000);
    },

    async askQuestion(interaction, quizData) {
        if (quizData.currentQuestion >= quizData.questions.length) {
            return await this.endQuiz(interaction, quizData);
        }

        const question = quizData.questions[quizData.currentQuestion];
        const questionNumber = quizData.currentQuestion + 1;
        const progress = Math.round((questionNumber / quizData.questions.length) * 100);

        const questionContainer = new ContainerBuilder()
            .setAccentColor(this.getDifficultyColor(quizData.difficulty))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎯 Question ${questionNumber}/${quizData.questions.length}\n## ${this.getDifficultyIcon(quizData.difficulty)} ${this.getDifficultyTitle(quizData.difficulty)} Challenge\n\n> Progress: ${progress}% Complete\n> Current streak: ${quizData.streak} correct answers`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🧮 **Solve This Problem**\n\n# ${question.display}\n\n**Question Type:** ${question.type}\n**Difficulty:** ${this.getDifficultyTitle(quizData.difficulty)}\n**Time Remaining:** ${quizData.timeLimit} seconds\n**Points Available:** ${this.getBasePoints(quizData.difficulty)} + bonuses\n\n## 📊 **Your Performance**\n\n**Current Score:** ${quizData.totalScore} points\n**Accuracy:** ${quizData.currentQuestion > 0 ? Math.round((quizData.correctAnswers/quizData.currentQuestion)*100) : 0}%\n**Best Streak:** ${quizData.maxStreak}\n**Current Streak:** ${quizData.streak}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL('https://cdn-icons-png.flaticon.com/512/3094/3094837.png')
                            .setDescription('Advanced math question')
                    )
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🎯 Question ${questionNumber} • ${this.getDifficultyTitle(quizData.difficulty)} level • ${quizData.timeLimit}s timer • Think carefully!*`)
            );

        const message = await interaction.channel.send({
            components: [questionContainer],
            flags: MessageFlags.IsComponentsV2
        });


        const filter = (m) => {
            if (m.author.id !== quizData.userId) return false;
            if (quizData.difficulty === 'prime') {
                const content = m.content.toLowerCase().trim();
                return content === 'yes' || content === 'no' || !isNaN(parseFloat(m.content));
            }
            return !isNaN(parseFloat(m.content));
        };

        const collector = interaction.channel.createMessageCollector({ 
            filter, 
            time: quizData.timeLimit * 1000,
            max: 1
        });

        const questionStartTime = Date.now();

        collector.on('collect', async (answerMessage) => {
            let userAnswer;
            const responseTime = Date.now() - questionStartTime;
            
            if (quizData.difficulty === 'prime' && (answerMessage.content.toLowerCase() === 'yes' || answerMessage.content.toLowerCase() === 'no')) {
                userAnswer = answerMessage.content.toLowerCase();
            } else {
                userAnswer = parseFloat(answerMessage.content);
            }

            const isCorrect = this.checkAnswer(userAnswer, question.answer, quizData.difficulty);

            try { await answerMessage.delete(); } catch {}

            if (isCorrect) {
                quizData.correctAnswers++;
                quizData.streak++;
                quizData.maxStreak = Math.max(quizData.maxStreak, quizData.streak);
                
              
                let points = this.getBasePoints(quizData.difficulty);
                const speedBonus = Math.max(0, Math.floor(points * 0.5) - Math.floor(responseTime / 1000) * 5);
                const difficultyMultiplier = this.getDifficultyMultiplier(quizData.difficulty);
                const streakMultiplier = 1 + (quizData.streak - 1) * 0.1;
                points = Math.round((points + speedBonus) * difficultyMultiplier * streakMultiplier);
                quizData.totalScore += points;

                await this.showResult(interaction, message, true, question.answer, points, responseTime, quizData.streak);
            } else {
                quizData.streak = 0;
                await this.showResult(interaction, message, false, question.answer, 0, responseTime, 0);
            }

            quizData.currentQuestion++;
            setTimeout(() => this.askQuestion(interaction, quizData), 3000);
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                quizData.streak = 0;
                await this.showResult(interaction, message, false, question.answer, 0, quizData.timeLimit * 1000, 0);
                quizData.currentQuestion++;
                setTimeout(() => this.askQuestion(interaction, quizData), 3000);
            }
        });
    },


    generateQuestions(difficulty, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push(this.generateQuestion(difficulty));
        }
        return questions;
    },

    generateQuestion(difficulty) {
        switch (difficulty) {
            case 'basic': return this.generateBasicQuestion();
            case 'intermediate': return this.generateIntermediateQuestion();
            case 'advanced': return this.generateAdvancedQuestion();
            case 'prime': return this.generatePrimeQuestion();
            case 'ultimate': return this.generateUltimateQuestion();
            case 'trigonometry': return this.generateTrigonometryQuestion();
            case 'calculus': return this.generateCalculusQuestion();
            case 'statistics': return this.generateStatisticsQuestion();
            case 'mixed': return this.generateMixedQuestion();
            case 'speed': return this.generateSpeedQuestion();
            default: return this.generateBasicQuestion();
        }
    },

    generateBasicQuestion() {
        const operations = [
            () => {
                const a = Math.floor(Math.random() * 100) + 1;
                const b = Math.floor(Math.random() * 100) + 1;
                return { display: `${a} + ${b}`, answer: a + b, type: 'Addition' };
            },
            () => {
                const a = Math.floor(Math.random() * 100) + 50;
                const b = Math.floor(Math.random() * 49) + 1;
                return { display: `${a} - ${b}`, answer: a - b, type: 'Subtraction' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateIntermediateQuestion() {
        const operations = [
            () => {
                const a = Math.floor(Math.random() * 25) + 2;
                const b = Math.floor(Math.random() * 25) + 2;
                return { display: `${a} × ${b}`, answer: a * b, type: 'Multiplication' };
            },
            () => {
                const b = Math.floor(Math.random() * 12) + 2;
                const answer = Math.floor(Math.random() * 20) + 2;
                const a = b * answer;
                return { display: `${a} ÷ ${b}`, answer: answer, type: 'Division' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateAdvancedQuestion() {
        const operations = [
            () => {
                const base = Math.floor(Math.random() * 10) + 2;
                const exp = Math.floor(Math.random() * 4) + 2;
                return { display: `${base}^${exp}`, answer: Math.pow(base, exp), type: 'Exponents' };
            },
            () => {
                const perfect = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
                const num = perfect[Math.floor(Math.random() * perfect.length)];
                return { display: `√${num}`, answer: Math.sqrt(num), type: 'Square Root' };
            },
            () => {
                const x = Math.floor(Math.random() * 20) + 1;
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 20) + 1;
                const result = a * x + b;
                return { display: `If ${a}x + ${b} = ${result}, what is x?`, answer: x, type: 'Linear Algebra' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generatePrimeQuestion() {
        const operations = [
            () => {
                const num = Math.floor(Math.random() * 90) + 10;
                const isPrime = this.isPrime(num);
                return { display: `Is ${num} a prime number? (yes/no)`, answer: isPrime ? 'yes' : 'no', type: 'Prime Check' };
            },
            () => {
                const n = Math.floor(Math.random() * 8) + 3;
                const nthPrime = this.getNthPrime(n);
                return { display: `What is the ${n}th prime number?`, answer: nthPrime, type: 'Prime Sequence' };
            },
            () => {
                const num = Math.floor(Math.random() * 50) + 10;
                const factors = this.getPrimeFactors(num);
                const largestFactor = Math.max(...factors);
                return { display: `What is the largest prime factor of ${num}?`, answer: largestFactor, type: 'Prime Factorization' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateUltimateQuestion() {
        const operations = [
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 5) + 1;
                const c = Math.floor(Math.random() * 5) + 1;
                const answer = 4*a*b + 2*a*c;
                return { display: `Expand: (${a}x + ${b})(${a}x + ${c}) + (${a}x - ${b})(${a}x - ${c})\nWhat is the coefficient of x?`, answer: answer, type: 'Algebraic Expansion' };
            },
            () => {
                const a = Math.floor(Math.random() * 3) + 1;
                const b = Math.floor(Math.random() * 3) + 1;
                const discriminant = b*b - 4*a;
                return { display: `For equation ${a}x² + ${b}x - 1 = 0, what is the discriminant?`, answer: discriminant, type: 'Quadratic Analysis' };
            },
            () => {
                const r = Math.floor(Math.random() * 5) + 2;
                const i = Math.floor(Math.random() * 5) + 1;
                const magnitude = Math.round(Math.sqrt(r*r + i*i) * 100) / 100;
                return { display: `What is the magnitude of the complex number ${r} + ${i}i? (round to 2 decimal places)`, answer: magnitude, type: 'Complex Numbers' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateTrigonometryQuestion() {
        const operations = [
            () => {
                const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180];
                const funcs = ['sin', 'cos', 'tan'];
                const angle = angles[Math.floor(Math.random() * angles.length)];
                const func = funcs[Math.floor(Math.random() * funcs.length)];
                
                let answer;
                const rad = angle * Math.PI / 180;
                switch(func) {
                    case 'sin': answer = Math.round(Math.sin(rad) * 100) / 100; break;
                    case 'cos': answer = Math.round(Math.cos(rad) * 100) / 100; break;
                    case 'tan': 
                        if (angle === 90) answer = 'undefined';
                        else answer = Math.round(Math.tan(rad) * 100) / 100; 
                        break;
                }
                
                return { display: `Calculate ${func}(${angle}°). Round to 2 decimal places.`, answer: answer, type: `Trigonometric Values` };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 3;
                const b = Math.floor(Math.random() * 5) + 3;
                const c = Math.round(Math.sqrt(a*a + b*b) * 100) / 100;
                return { display: `In a right triangle, if legs are ${a} and ${b}, what is the hypotenuse? (round to 2 decimals)`, answer: c, type: 'Pythagorean Theorem' };
            },
            () => {
                const period = Math.floor(Math.random() * 4) + 2;
                const answer = 360 / period;
                return { display: `If sin(${period}θ) has period ${360/period}°, what is the coefficient of θ?`, answer: period, type: 'Trigonometric Periods' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateCalculusQuestion() {
        const operations = [
            () => {
                const n = Math.floor(Math.random() * 6) + 2;
                const coeff = Math.floor(Math.random() * 5) + 1;
                const answer = n * coeff;
                return { display: `Find the derivative: f(x) = ${coeff}x^${n}\nWhat is the coefficient of x^${n-1}?`, answer: answer, type: 'Power Rule Differentiation' };
            },
            () => {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 5) + 1;
                const answer = a;
                return { display: `Find f'(x) if f(x) = ${a}e^x + ${b}ln(x)\nWhat is the coefficient of e^x in f'(x)?`, answer: answer, type: 'Exponential Derivatives' };
            },
            () => {
                const n = Math.floor(Math.random() * 4) + 2;
                const coeff = Math.floor(Math.random() * 6) + 1;
                const upper = Math.floor(Math.random() * 3) + 2;
                const answer = Math.round((coeff * Math.pow(upper, n+1)) / (n+1) * 100) / 100;
                return { display: `Evaluate: ∫₀^${upper} ${coeff}x^${n} dx (round to 2 decimals)`, answer: answer, type: 'Definite Integration' };
            },
            () => {
                const a = Math.floor(Math.random() * 3) + 1;
                const b = Math.floor(Math.random() * 5) + 1;
                const c = Math.floor(Math.random() * 5) + 1;
                const answer = 2*a;
                return { display: `Find the second derivative: f(x) = ${a}x³ + ${b}x² + ${c}x\nWhat is the coefficient of x in f''(x)?`, answer: answer, type: 'Second Derivatives' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateStatisticsQuestion() {
        const operations = [
            () => {
                const data = Array.from({length: Math.floor(Math.random() * 5) + 4}, () => Math.floor(Math.random() * 20) + 1);
                const mean = Math.round((data.reduce((sum, x) => sum + x, 0) / data.length) * 100) / 100;
                return { display: `Calculate the mean of: [${data.join(', ')}] (round to 2 decimals)`, answer: mean, type: 'Mean Calculation' };
            },
            () => {
                const data = Array.from({length: 6}, () => Math.floor(Math.random() * 15) + 1).sort((a, b) => a - b);
                const n = data.length;
                const median = n % 2 === 0 ? (data[n/2 - 1] + data[n/2]) / 2 : data[Math.floor(n/2)];
                return { display: `Find the median of: [${data.join(', ')}]`, answer: median, type: 'Median Calculation' };
            },
            () => {
                const successes = Math.floor(Math.random() * 8) + 2;
                const trials = successes + Math.floor(Math.random() * 5) + 3;
                const probability = Math.round((successes / trials) * 100) / 100;
                return { display: `If ${successes} out of ${trials} trials succeed, what is the probability? (round to 2 decimals)`, answer: probability, type: 'Probability Calculation' };
            },
            () => {
                const data = Array.from({length: 5}, () => Math.floor(Math.random() * 10) + 5);
                const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
                const variance = Math.round((data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length) * 100) / 100;
                return { display: `Calculate the variance of: [${data.join(', ')}] (round to 2 decimals)`, answer: variance, type: 'Variance Calculation' };
            },
            () => {
                const n = Math.floor(Math.random() * 5) + 3;
                const k = Math.floor(Math.random() * n) + 1;
                const combinations = this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
                return { display: `Calculate C(${n}, ${k}) - combinations of ${n} choose ${k}`, answer: combinations, type: 'Combinations' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },

    generateMixedQuestion() {
        const difficulties = ['basic', 'intermediate', 'advanced', 'prime', 'ultimate', 'trigonometry', 'calculus', 'statistics'];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        return this.generateQuestion(randomDifficulty);
    },

    generateSpeedQuestion() {
        const operations = [
            () => {
                const a = Math.floor(Math.random() * 20) + 1;
                const b = Math.floor(Math.random() * 20) + 1;
                return { display: `${a} + ${b}`, answer: a + b, type: 'Quick Addition' };
            },
            () => {
                const a = Math.floor(Math.random() * 12) + 1;
                const b = Math.floor(Math.random() * 12) + 1;
                return { display: `${a} × ${b}`, answer: a * b, type: 'Quick Multiplication' };
            },
            () => {
                const base = Math.floor(Math.random() * 5) + 2;
                const exp = Math.floor(Math.random() * 3) + 2;
                return { display: `${base}^${exp}`, answer: Math.pow(base, exp), type: 'Quick Powers' };
            }
        ];
        return operations[Math.floor(Math.random() * operations.length)]();
    },


    isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    },

    getNthPrime(n) {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        return primes[n - 1];
    },

    getPrimeFactors(n) {
        const factors = [];
        for (let i = 2; i <= n; i++) {
            while (n % i === 0) {
                factors.push(i);
                n /= i;
            }
        }
        return factors;
    },

    factorial(n) {
        if (n <= 1) return 1;
        return n * this.factorial(n - 1);
    },

    checkAnswer(userAnswer, correctAnswer, difficulty) {
        if (difficulty === 'prime' && typeof correctAnswer === 'string') {
            return userAnswer === correctAnswer;
        }
        if (typeof correctAnswer === 'number') {
            return Math.abs(userAnswer - correctAnswer) < 0.01;
        }
        return userAnswer === correctAnswer;
    },

    getDefaultTimeLimit(difficulty) {
        const timeLimits = {
            basic: 20, intermediate: 25, advanced: 30, prime: 35,
            ultimate: 45, trigonometry: 40, calculus: 50, statistics: 45,
            mixed: 35, speed: 10
        };
        return timeLimits[difficulty] || 30;
    },

    getBasePoints(difficulty) {
        const basePoints = {
            basic: 100, intermediate: 120, advanced: 150, prime: 180,
            ultimate: 250, trigonometry: 200, calculus: 300, statistics: 220,
            mixed: 160, speed: 80
        };
        return basePoints[difficulty] || 100;
    },

    getDifficultyMultiplier(difficulty) {
        const multipliers = {
            basic: 1.0, intermediate: 1.2, advanced: 1.5, prime: 1.8,
            ultimate: 2.5, trigonometry: 2.0, calculus: 3.0, statistics: 2.2,
            mixed: 1.6, speed: 0.8
        };
        return multipliers[difficulty] || 1.0;
    },

    getComplexityLevel(difficulty) {
        const complexity = {
            basic: 'Elementary', intermediate: 'Middle School', advanced: 'High School',
            prime: 'Advanced High School', ultimate: 'College Level', 
            trigonometry: 'Pre-Calculus', calculus: 'University Level',
            statistics: 'College Statistics', mixed: 'Variable', speed: 'Quick Thinking'
        };
        return complexity[difficulty] || 'Standard';
    },

    getDifficultyColor(difficulty) {
        const colors = {
            basic: 0x00ff00, intermediate: 0xffa500, advanced: 0xff0000, prime: 0x8a2be2,
            ultimate: 0xffd700, trigonometry: 0x1e90ff, calculus: 0xff1493, statistics: 0x32cd32,
            mixed: 0x9b59b6, speed: 0x00bcd4
        };
        return colors[difficulty] || 0x3498db;
    },

    getDifficultyIcon(difficulty) {
        const icons = {
            basic: '🟢', intermediate: '🟡', advanced: '🔴', prime: '🔢',
            ultimate: '🌟', trigonometry: '📐', calculus: '∫', statistics: '📊',
            mixed: '🌈', speed: '⚡'
        };
        return icons[difficulty] || '🧮';
    },

    getDifficultyTitle(difficulty) {
        const titles = {
            basic: 'Basic Math', intermediate: 'Intermediate Math', advanced: 'Advanced Math',
            prime: 'Prime Numbers & Number Theory', ultimate: 'Ultimate Algebra & Complex Numbers',
            trigonometry: 'Trigonometry & Identities', calculus: 'Calculus & Differential Equations',
            statistics: 'Statistics & Probability', mixed: 'Mixed Difficulty', speed: 'Speed Math'
        };
        return titles[difficulty] || 'Mathematics';
    },

    getDifficultyDescription(difficulty) {
        const descriptions = {
            basic: 'Master fundamental arithmetic operations',
            intermediate: 'Challenge yourself with multiplication and division',
            advanced: 'Tackle powers, roots, and algebraic equations',
            prime: 'Explore the fascinating world of prime numbers',
            ultimate: 'Conquer advanced algebra and complex number systems',
            trigonometry: 'Master angles, triangles, and trigonometric functions',
            calculus: 'Dive into derivatives, integrals, and advanced calculus',
            statistics: 'Analyze data with statistical methods and probability',
            mixed: 'Face questions from all difficulty levels',
            speed: 'Test your quick calculation skills under pressure'
        };
        return descriptions[difficulty] || 'Test your mathematical knowledge';
    },

    getOperationsText(difficulty) {
        const operations = {
            basic: 'Addition, Subtraction',
            intermediate: 'Multiplication, Division',
            advanced: 'Powers, Roots, Linear Algebra',
            prime: 'Prime Numbers, Factorization, Number Theory',
            ultimate: 'Advanced Algebra, Complex Numbers, Polynomials',
            trigonometry: 'Trigonometric Functions, Identities, Triangle Properties',
            calculus: 'Derivatives, Integrals, Limits, Differential Equations',
            statistics: 'Mean, Median, Probability, Variance, Combinations',
            mixed: 'All Mathematical Operations',
            speed: 'Quick Addition, Multiplication, Powers'
        };
        return operations[difficulty] || 'Various Operations';
    },

    async showResult(interaction, questionMessage, isCorrect, correctAnswer, pointsEarned, responseTime, streak) {
        try { await questionMessage.delete(); } catch {}

        const resultContainer = new ContainerBuilder()
            .setAccentColor(isCorrect ? 0x00ff00 : 0xff0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${isCorrect ? '✅ Brilliant!' : '❌ Incorrect!'}\n## ${isCorrect ? 'Perfect Solution' : 'Keep Learning'}\n\n> ${isCorrect ? 'Outstanding mathematical reasoning!' : 'Every mistake is a learning opportunity!'}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **Detailed Analysis**\n\n**Correct Answer:** ${correctAnswer}\n**Points Earned:** ${pointsEarned}\n**Response Time:** ${(responseTime / 1000).toFixed(1)}s\n**Current Streak:** ${streak}\n\n${isCorrect ? 
                        (streak > 1 ? `🔥 **${streak} Question Streak!** You're on fire!` : '🎯 Excellent work! Keep building that streak!') :
                        '💪 Don\'t lose hope! Mathematics rewards persistence!'}\n\n${pointsEarned > 300 ? '⚡ **SPEED & DIFFICULTY BONUS!**' : pointsEarned > 200 ? '🎯 **GREAT PERFORMANCE!**' : pointsEarned > 0 ? '👍 **GOOD EFFORT!**' : '🤔 **THINK HARDER NEXT TIME!**'}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*${isCorrect ? '✅' : '❌'} Result processed • ${pointsEarned} points • ${(responseTime / 1000).toFixed(1)}s response • Next question incoming*`)
            );

        const resultMessage = await interaction.channel.send({
            components: [resultContainer],
            flags: MessageFlags.IsComponentsV2
        });

        setTimeout(async () => {
            try { await resultMessage.delete(); } catch {}
        }, 2500);
    },

    async endQuiz(interaction, quizData) {
        const totalTime = Date.now() - quizData.startTime;
        const accuracy = (quizData.correctAnswers / quizData.questions.length * 100).toFixed(1);
        const avgTimePerQuestion = (totalTime / quizData.questions.length / 1000).toFixed(1);
        const isPerfect = quizData.correctAnswers === quizData.questions.length;
        
        if (isPerfect) quizData.totalScore += this.getBasePoints(quizData.difficulty) * 5;

        const grade = this.calculateGrade(accuracy, quizData.totalScore, quizData.difficulty);

        const endContainer = new ContainerBuilder()
            .setAccentColor(isPerfect ? 0xffd700 : accuracy >= 80 ? 0x00ff00 : accuracy >= 60 ? 0xffa500 : 0xff6b6b)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎉 ${this.getDifficultyTitle(quizData.difficulty)} Complete!\n## ${isPerfect ? '🏆 PERFECT MASTERY!' : grade.emoji + ' ' + grade.title}\n\n> ${isPerfect ? 'Flawless mathematical performance! You are truly exceptional!' : grade.message}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📊 **Complete Performance Analysis**\n\n**Final Score:** ${quizData.totalScore} points\n**Questions Correct:** ${quizData.correctAnswers}/${quizData.questions.length}\n**Accuracy:** ${accuracy}%\n**Best Streak:** ${quizData.maxStreak} correct\n**Total Time:** ${(totalTime / 1000).toFixed(1)} seconds\n**Avg Time/Question:** ${avgTimePerQuestion} seconds\n**Difficulty:** ${this.getDifficultyTitle(quizData.difficulty)}\n\n## 🏅 **Academic Assessment**\n\n**Letter Grade:** ${grade.letter}\n**Grade Title:** ${grade.title}\n**GPA Points:** ${grade.gpa}/4.0\n**Performance Level:** ${this.getComplexityLevel(quizData.difficulty)}\n\n## 🎖️ **Achievements Unlocked**\n\n${isPerfect ? '🏆 **PERFECT QUIZ:** +' + (this.getBasePoints(quizData.difficulty) * 5) + ' bonus points!' : ''}\n${quizData.maxStreak >= 7 ? '🔥 **STREAK LEGEND:** 7+ consecutive correct!' : quizData.maxStreak >= 5 ? '🔥 **STREAK MASTER:** 5+ consecutive correct!' : ''}\n${quizData.totalScore >= 2000 ? '⭐ **MATHEMATICAL GENIUS:** 2000+ points!' : quizData.totalScore >= 1000 ? '⭐ **HIGH ACHIEVER:** 1000+ points!' : ''}\n${accuracy == 100 ? '💯 **PERFECTIONIST:** 100% accuracy achieved!' : accuracy >= 90 ? '🎯 **EXPERT:** 90%+ accuracy!' : ''}\n${quizData.difficulty === 'calculus' && accuracy >= 70 ? '∫ **CALCULUS MASTER:** Conquered university-level math!' : ''}\n${quizData.difficulty === 'statistics' && accuracy >= 70 ? '📊 **DATA ANALYST:** Statistics expertise proven!' : ''}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL())
                            .setDescription(`${interaction.user.displayName}'s mathematical achievement`)
                    )
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🎉 ${this.getDifficultyTitle(quizData.difficulty)} completed • ${grade.letter} grade • ${quizData.totalScore} points • ${accuracy}% mastery*`)
            );

        await interaction.channel.send({
            components: [endContainer],
            flags: MessageFlags.IsComponentsV2
        });

        activeQuizzes.delete(quizData.channelId);
    },

    async stopQuiz(interaction, sendReply) {
        const channelId = interaction.channel.id;
        const quizData = activeQuizzes.get(channelId);

        if (!quizData) {
            const noQuizContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ℹ️ No Active Quiz\n## Nothing to Terminate\n\n> No quiz is currently running in this channel\n> Start a new mathematical challenge anytime!`)
                );
            return sendReply(noQuizContainer);
        }

        if (quizData.userId !== interaction.user.id) {
            const permissionContainer = new ContainerBuilder()
                .setAccentColor(0xff6b6b)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Access Denied\n## Quiz Creator Privileges Required\n\n> Only ${interaction.guild.members.cache.get(quizData.userId)?.displayName || 'the quiz creator'} can terminate this quiz\n> Respect their mathematical journey!`)
                );
            return sendReply(permissionContainer);
        }

        const stopContainer = new ContainerBuilder()
            .setAccentColor(0xff6b6b)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🛑 Quiz Terminated\n## Manual Override Activated\n\n> ${this.getDifficultyTitle(quizData.difficulty)} quiz stopped by ${interaction.user.displayName}\n> Mathematical progress preserved`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **Partial Achievement Summary**\n\n**Questions Completed:** ${quizData.currentQuestion}/${quizData.questions.length}\n**Correct Answers:** ${quizData.correctAnswers}\n**Current Score:** ${quizData.totalScore} points\n**Best Streak:** ${quizData.maxStreak}\n**Difficulty Level:** ${this.getDifficultyTitle(quizData.difficulty)}\n**Time Invested:** ${((Date.now() - quizData.startTime) / 1000).toFixed(1)} seconds\n\n*Early termination - no final grade assigned*\n*Progress shows mathematical potential!*`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🛑 Quiz terminated • ${quizData.currentQuestion}/${quizData.questions.length} completed • ${quizData.totalScore} points earned*`)
            );

        await sendReply(stopContainer);
        activeQuizzes.delete(channelId);
    },

    async showLeaderboard(interaction, sendReply) {
        const leaderboardContainer = new ContainerBuilder()
            .setAccentColor(0xffd700)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏆 Mathematical Hall of Fame\n## Elite Quiz Performance Rankings\n\n> Advanced persistent scoring system coming soon\n> Current session statistics and achievements`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **Current Session Status**\n\n**Active Mathematical Challenges:** ${activeQuizzes.size}\n**System Status:** Fully Operational\n**Available Difficulty Levels:** 10 levels\n\n## 📊 **Upcoming Premium Features**\n\n• **Persistent Score Database:** MongoDB integration\n• **Global Rankings:** Server-wide leaderboards\n• **Seasonal Competitions:** Weekly/Monthly champions\n• **Achievement System:** Unlock mathematical badges\n• **Performance Analytics:** Detailed statistics tracking\n• **Difficulty Mastery Levels:** Progress through all levels\n• **Time-based Challenges:** Speed competitions\n• **Team Competitions:** Group mathematics challenges\n\n## 🏅 **Complete Difficulty Spectrum**\n\n🟢 **Basic:** Elementary arithmetic mastery\n🟡 **Intermediate:** Pre-algebra fundamentals\n🔴 **Advanced:** High school mathematics\n🔢 **Prime:** Number theory exploration\n🌟 **Ultimate:** Advanced algebra & complex analysis\n📐 **Trigonometry:** Angle and triangle mastery\n∫ **Calculus:** University-level mathematics\n📊 **Statistics:** Data analysis & probability\n🌈 **Mixed:** Universal mathematical challenge\n⚡ **Speed:** Lightning-fast calculations`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🏆 Hall of Fame • Coming: persistent rankings • ${activeQuizzes.size} active sessions • 10 difficulty levels available*`)
            );

        return sendReply(leaderboardContainer);
    },

    calculateGrade(accuracy, score, difficulty) {
        let baseGrade = accuracy >= 95 ? 'A+' : accuracy >= 90 ? 'A' : accuracy >= 85 ? 'A-' : 
                       accuracy >= 80 ? 'B+' : accuracy >= 75 ? 'B' : accuracy >= 70 ? 'B-' :
                       accuracy >= 65 ? 'C+' : accuracy >= 60 ? 'C' : accuracy >= 55 ? 'C-' : 
                       accuracy >= 50 ? 'D' : 'F';

        const grades = {
            'A+': { letter: 'A+', gpa: 4.0, title: 'Mathematical Genius', emoji: '🏆', message: 'Extraordinary mastery! You have achieved mathematical excellence!' },
            'A': { letter: 'A', gpa: 4.0, title: 'Outstanding Performance', emoji: '⭐', message: 'Excellent mathematical reasoning! You clearly understand the concepts!' },
            'A-': { letter: 'A-', gpa: 3.7, title: 'Superior Achievement', emoji: '🌟', message: 'Very strong performance! Your mathematical skills are impressive!' },
            'B+': { letter: 'B+', gpa: 3.3, title: 'Above Average Excellence', emoji: '👍', message: 'Good mathematical thinking! You\'re performing well!' },
            'B': { letter: 'B', gpa: 3.0, title: 'Solid Understanding', emoji: '👌', message: 'Reliable mathematical performance! Keep building on this foundation!' },
            'B-': { letter: 'B-', gpa: 2.7, title: 'Satisfactory Progress', emoji: '✅', message: 'Decent work! Focus on strengthening weak areas!' },
            'C+': { letter: 'C+', gpa: 2.3, title: 'Developing Skills', emoji: '📚', message: 'Fair effort! More practice will improve your performance!' },
            'C': { letter: 'C', gpa: 2.0, title: 'Basic Competency', emoji: '📖', message: 'Average performance! Review fundamentals and practice more!' },
            'C-': { letter: 'C-', gpa: 1.7, title: 'Needs Improvement', emoji: '📝', message: 'Below expectations! Dedicate more time to studying!' },
            'D': { letter: 'D', gpa: 1.0, title: 'Significant Gaps', emoji: '📉', message: 'Poor performance! Return to basics and build foundation!' },
            'F': { letter: 'F', gpa: 0.0, title: 'Requires Remediation', emoji: '❌', message: 'Don\'t give up! Everyone can master mathematics with effort!' }
        };

        return grades[baseGrade];
    },

    async sendSlashOnlyMessage(interaction) {
        const alertContainer = new ContainerBuilder()
            .setAccentColor(0x3498db)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Advanced Mathematical Interface\n## Slash Commands Required\n\n> This sophisticated quiz system requires modern slash commands\n> Experience the ultimate in mathematical education technology!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🧮 **Complete Difficulty Spectrum**\n\n🟢 **Basic:** \`/mathquiz basic\` - Addition & Subtraction\n🟡 **Intermediate:** \`/mathquiz intermediate\` - Multiplication & Division\n🔴 **Advanced:** \`/mathquiz advanced\` - Powers, Roots & Algebra\n🔢 **Prime:** \`/mathquiz prime\` - Number Theory & Prime Numbers\n🌟 **Ultimate:** \`/mathquiz ultimate\` - Complex Numbers & Advanced Algebra\n📐 **Trigonometry:** \`/mathquiz trigonometry\` - Angles & Trigonometric Functions\n∫ **Calculus:** \`/mathquiz calculus\` - Derivatives & Integrals\n📊 **Statistics:** \`/mathquiz statistics\` - Data Analysis & Probability\n🌈 **Mixed:** \`/mathquiz mixed\` - All difficulty levels combined\n⚡ **Speed:** \`/mathquiz speed\` - Lightning-fast calculations\n\n## 🎯 **Management & Features**\n\n🛑 **/mathquiz stop** - Terminate active quiz\n🏆 **/mathquiz leaderboard** - View performance rankings\n\n## ✨ **Revolutionary Features**\n\n• **10 Difficulty Levels:** From elementary to university mathematics\n• **Advanced Scoring:** Difficulty multipliers and streak bonuses\n• **Academic Grading:** Letter grades with GPA calculation\n• **Beautiful V2 Interface:** Modern component-based design\n• **Comprehensive Analytics:** Detailed performance tracking\n• **Achievement System:** Unlock mathematical accomplishments\n• **Adaptive Timing:** Difficulty-appropriate time limits\n• **Educational Feedback:** Learn from every question`)
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
                    .setContent(`# ❌ Mathematical System Error\n## Quiz Engine Malfunction\n\n> The advanced quiz system encountered an unexpected error\n> ${errorMessage || 'Unknown mathematical anomaly detected'}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🔧 **System Diagnostics**\n\n**Error Code:** MATH-${Math.floor(Math.random() * 10000)}\n**Timestamp:** ${new Date().toLocaleString()}\n**Affected Module:** Mathematical Quiz Engine\n**Status:** Investigating mathematical anomaly\n\n**Recommended Actions:**\n• Try restarting the quiz in 30 seconds\n• Select a different difficulty level\n• Contact system administrators if error persists\n• Check mathematical calculations for accuracy\n\n**System Status:** All other quiz functions operational`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*❌ Quiz system error • Mathematical anomaly detected • Support team notified • Please try again*`)
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