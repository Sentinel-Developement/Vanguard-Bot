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
    SeparatorBuilder,
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Text-to-speech in voice channel')
        .addStringOption(opt =>
            opt.setName('text')
                .setDescription('Text to speak')
                .setRequired(true)
                .setMaxLength(200))
        .addStringOption(opt =>
            opt.setName('language')
                .setDescription('Language')
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
                    { name: '🇮🇳 Hindi', value: 'hi' },
                    { name: '🇵🇹 Portuguese', value: 'pt' },
                    { name: '🇦🇪 Arabic', value: 'ar' },
                    { name: '🇹🇷 Turkish', value: 'tr' },
                    { name: '🇵🇱 Polish', value: 'pl' },
                    { name: '🇳🇱 Dutch', value: 'nl' },
                    { name: '🇮🇩 Indonesian', value: 'id' },
                    { name: '🇻🇳 Vietnamese', value: 'vi' },
                    { name: '🇹🇭 Thai', value: 'th' },
                    { name: '🇬🇷 Greek', value: 'el' },
                    { name: '🇸🇪 Swedish', value: 'sv' }
                ))
        .addStringOption(opt =>
            opt.setName('speed')
                .setDescription('Speech speed')
                .addChoices(
                    { name: '🐌 Slow', value: 'slow' },
                    { name: '🚶 Normal', value: 'normal' },
                    { name: '🏃 Fast', value: 'fast' }
                )),

    async execute(interaction) {
        await interaction.deferReply();

        const text = interaction.options.getString('text');
        const lang = interaction.options.getString('language') || 'en';
        const speed = interaction.options.getString('speed') || 'normal';


        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return this.sendError(interaction, 'You need to be in a voice channel!');
        }

     
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            return this.sendError(interaction, 'I need permissions to join and speak in your voice channel!');
        }

     
        const existingConnection = interaction.guild.members.me.voice.channel;
        if (existingConnection && existingConnection.id !== voiceChannel.id) {
            return this.sendError(interaction, 'I\'m already playing in another voice channel!');
        }

        try {
           
            const loadingContainer = new ContainerBuilder().setAccentColor(0xFFA500);
            loadingContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## ⏳ Generating Speech\n\n` +
                    `**Text:** ${text}\n` +
                    `**Language:** ${this.getLanguageName(lang)}\n` +
                    `**Speed:** ${speed}\n\n` +
                    `Generating audio and joining voice channel...`
                )
            );
            await interaction.editReply({
                components: [loadingContainer],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {});

    
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

      
            const filename = `tts_${Date.now()}.mp3`;
            const tempFile = path.join(tempDir, filename);

        
            let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
            
        
            if (speed === 'slow') {
                ttsUrl += '&ttsspeed=0.5';
            } else if (speed === 'fast') {
                ttsUrl += '&ttsspeed=1.5';
            }

        
            await this.downloadFile(ttsUrl, tempFile);

      
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

    
            await entersState(connection, VoiceConnectionStatus.Ready, 30000);

       
            const player = createAudioPlayer();
            const resource = createAudioResource(tempFile);

            connection.subscribe(player);
            player.play(resource);

      
            const container = new ContainerBuilder().setAccentColor(0x00FF00);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🗣️ Now Speaking\n\n` +
                    `**Text:** "${text}"\n\n` +
                    `**Language:** ${this.getLanguageName(lang)}\n` +
                    `**Speed:** ${speed}\n` +
                    `**Channel:** ${voiceChannel.name}\n\n` +
                    `Bot will auto-disconnect after speaking!`
                )
            );

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        
            player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (err) {
                        console.error('Failed to delete temp file:', err);
                    }
                    connection.destroy();
                }, 1000);
            });

          
            player.on('error', error => {
                console.error('Audio player error:', error);
                try {
                    fs.unlinkSync(tempFile);
                } catch (err) {}
                connection.destroy();
            });

        } catch (error) {
            console.error('TTS error:', error);
            return this.sendError(interaction, 'Failed to generate or play speech. Try again.');
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
            ru: 'Russian', hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic',
            tr: 'Turkish', pl: 'Polish', nl: 'Dutch', id: 'Indonesian',
            vi: 'Vietnamese', th: 'Thai', el: 'Greek', sv: 'Swedish'
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