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
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
    TextDisplayBuilder,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');
const https = require('https');
const fs = require('fs');
const path = require('path');

const activeSessions = new Map();
const messageQueue = new Map();
const userCooldowns = new Map();
const inactivityTimers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts-live')
        .setDescription('Live TTS - Bot reads messages in voice channel')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start live TTS session')
                .addStringOption(opt =>
                    opt.setName('language')
                        .setDescription('Default language for TTS')
                        .addChoices(
                            { name: '🇺🇸 English', value: 'en' },
                            { name: '🇪🇸 Spanish', value: 'es' },
                            { name: '🇫🇷 French', value: 'fr' },
                            { name: '🇩🇪 German', value: 'de' },
                            { name: '🇮🇹 Italian', value: 'it' },
                            { name: '🇯🇵 Japanese', value: 'ja' },
                            { name: '🇰🇷 Korean', value: 'ko' },
                            { name: '🇨🇳 Chinese', value: 'zh' },
                            { name: '🇷🇺 Russian', value: 'ru' },
                            { name: '🇮🇳 Hindi', value: 'hi' }
                        )))
        .addSubcommand(sub =>
            sub.setName('stop')
                .setDescription('Stop live TTS session')),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'start') {
            return await this.handleStart(interaction, guildId);
        } else if (subcommand === 'stop') {
            return await this.handleStop(interaction, guildId);
        }
    },

    async handleStart(interaction, guildId) {
        if (activeSessions.has(guildId)) {
            return this.sendError(interaction, 'TTS Live is already active in this server!\nUse `/tts-live stop` to stop it first.');
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return this.sendError(interaction, 'You need to be in a voice channel!');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            return this.sendError(interaction, 'I need permissions to join and speak in your voice channel!');
        }

        const lang = interaction.options.getString('language') || 'en';

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 30000);

            const player = createAudioPlayer();
            connection.subscribe(player);

            activeSessions.set(guildId, {
                channelId: interaction.channel.id,
                voiceChannelId: voiceChannel.id,
                connection: connection,
                player: player,
                language: lang,
                isPlaying: false,
                startedBy: interaction.user.id
            });

            messageQueue.set(guildId, []);

            this.setupMessageListener(interaction.client, guildId);
            this.startInactivityTimer(guildId, interaction.channel);

            const container = new ContainerBuilder().setAccentColor(0x00FF00);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🎙️ TTS Live Started!\n\n` +
                    `**Text Channel:** <#${interaction.channel.id}>\n` +
                    `**Voice Channel:** ${voiceChannel.name}\n` +
                    `**Language:** ${this.getLanguageName(lang)}\n\n` +
                    `**How to use:**\n` +
                    `• Type \`!tts <text>\` in this channel\n` +
                    `• Rate limit: 1 message per 5 seconds\n` +
                    `• Max length: 200 characters\n` +
                    `• Auto-disconnect after 30s inactivity\n\n` +
                    `**To stop:** Use \`/tts-live stop\``
                )
            );

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('TTS Live start error:', error);
            activeSessions.delete(guildId);
            return this.sendError(interaction, 'Failed to start TTS Live. Please try again.');
        }
    },

    async handleStop(interaction, guildId) {
        const session = activeSessions.get(guildId);

        if (!session) {
            return this.sendError(interaction, 'No active TTS Live session found!');
        }

        if (session.startedBy !== interaction.user.id && 
            !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return this.sendError(interaction, 'Only the user who started the session or moderators can stop it!');
        }

        try {
            this.cleanupSession(guildId);

            const container = new ContainerBuilder().setAccentColor(0xFF0000);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🛑 TTS Live Stopped\n\n` +
                    `Session ended by <@${interaction.user.id}>\n` +
                    `Bot has left the voice channel.`
                )
            );

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('TTS Live stop error:', error);
            return this.sendError(interaction, 'Error stopping TTS Live.');
        }
    },

    startInactivityTimer(guildId, channel) {
        if (inactivityTimers.has(guildId)) {
            clearTimeout(inactivityTimers.get(guildId));
        }

        const timer = setTimeout(async () => {
            const session = activeSessions.get(guildId);
            if (session) {
                this.cleanupSession(guildId);

                try {
                    const container = new ContainerBuilder().setAccentColor(0xFFA500);
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `## ⏱️ TTS Live Session Ended\n\n` +
                            `Session terminated due to 30 seconds of inactivity.\n` +
                            `Use \`/tts-live start\` to start a new session.`
                        )
                    );

                    await channel.send({
                        components: [container],
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (err) {
                    console.error('Failed to send inactivity message:', err);
                }
            }
        }, 30000);

        inactivityTimers.set(guildId, timer);
    },

    resetInactivityTimer(guildId, channel) {
        this.startInactivityTimer(guildId, channel);
    },

    cleanupSession(guildId) {
        const session = activeSessions.get(guildId);
        
        if (session && session.connection) {
            session.connection.destroy();
        }

        if (inactivityTimers.has(guildId)) {
            clearTimeout(inactivityTimers.get(guildId));
            inactivityTimers.delete(guildId);
        }

        activeSessions.delete(guildId);
        messageQueue.delete(guildId);
    },

    setupMessageListener(client, guildId) {
        const messageHandler = async (message) => {
            const session = activeSessions.get(guildId);
            if (!session) {
                client.off('messageCreate', messageHandler);
                return;
            }

            if (message.author.bot) return;
            if (message.channel.id !== session.channelId) return;
            if (!message.content.startsWith('!tts ')) return;

            this.resetInactivityTimer(guildId, message.channel);

            const text = message.content.slice(5).trim();

            if (!text) {
                return message.reply('❌ Please provide text to speak!').then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 5000);
                });
            }

            if (text.length > 200) {
                return message.reply('❌ Text too long! Maximum 200 characters.').then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 5000);
                });
            }

            const userId = message.author.id;
            const cooldownKey = `${guildId}-${userId}`;
            const now = Date.now();

            if (userCooldowns.has(cooldownKey)) {
                const cooldownEnd = userCooldowns.get(cooldownKey);
                if (now < cooldownEnd) {
                    const remaining = Math.ceil((cooldownEnd - now) / 1000);
                    return message.reply(`⏳ Please wait ${remaining} seconds before using TTS again!`).then(m => {
                        setTimeout(() => m.delete().catch(() => {}), 3000);
                    });
                }
            }

            userCooldowns.set(cooldownKey, now + 5000);
            setTimeout(() => userCooldowns.delete(cooldownKey), 5000);

            const queue = messageQueue.get(guildId);
            queue.push({
                text: text,
                username: message.author.username,
                language: session.language
            });

            await message.react('🔊').catch(() => {});

            if (!session.isPlaying) {
                this.processQueue(guildId);
            }
        };

        client.on('messageCreate', messageHandler);
    },

    async processQueue(guildId) {
        const session = activeSessions.get(guildId);
        const queue = messageQueue.get(guildId);

        if (!session || !queue || queue.length === 0) {
            if (session) session.isPlaying = false;
            return;
        }

        session.isPlaying = true;

        const item = queue.shift();
        const text = item.text;

        try {
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const filename = `tts_live_${Date.now()}.mp3`;
            const tempFile = path.join(tempDir, filename);

            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${item.language}&client=tw-ob&q=${encodeURIComponent(text)}`;
            
            await this.downloadFile(ttsUrl, tempFile);

            const resource = createAudioResource(tempFile);
            session.player.play(resource);

            await new Promise((resolve) => {
                session.player.once(AudioPlayerStatus.Idle, () => {
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (err) {
                        console.error('Failed to delete temp file:', err);
                    }
                    resolve();
                });

                session.player.once('error', (error) => {
                    console.error('Player error:', error);
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (err) {}
                    resolve();
                });
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            this.processQueue(guildId);

        } catch (error) {
            console.error('TTS processing error:', error);
            session.isPlaying = false;
            
            if (queue.length > 0) {
                setTimeout(() => this.processQueue(guildId), 1000);
            }
        }
    },

    downloadFile(url, dest) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(dest);
            
            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve();
                });

                file.on('error', (err) => {
                    fs.unlink(dest, () => {});
                    reject(err);
                });
            }).on('error', (err) => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        });
    },

    getLanguageName(code) {
        const langs = {
            en: 'English', es: 'Spanish', fr: 'French', de: 'German',
            it: 'Italian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
            ru: 'Russian', hi: 'Hindi'
        };
        return langs[code] || code;
    },

    sendError(interaction, message) {
        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ❌ Error\n\n${message}`)
        );
        return interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
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
