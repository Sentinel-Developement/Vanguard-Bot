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

const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
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
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('local-play')
        .setDescription('Upload and play MP3 files in voice channel')
        .addSubcommand(sub =>
            sub.setName('upload')
                .setDescription('Upload an MP3 file to library')
                .addAttachmentOption(opt =>
                    opt.setName('file')
                        .setDescription('MP3 file to upload')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Name for this audio')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all uploaded audio files'))
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Play audio in your voice channel')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Audio name')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(sub =>
            sub.setName('stop')
                .setDescription('Stop playing and disconnect'))
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete an uploaded audio')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Audio name')
                        .setRequired(true)
                        .setAutocomplete(true))),

    async autocomplete(interaction) {
        const audioDir = path.join(__dirname, '../../audio_library');
        
        if (!fs.existsSync(audioDir)) {
            return interaction.respond([]);
        }

        const files = fs.readdirSync(audioDir)
            .filter(f => f.endsWith('.mp3'))
            .map(f => ({
                name: f.replace('.mp3', ''),
                value: f.replace('.mp3', '')
            }));

        await interaction.respond(files.slice(0, 25));
    },

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'upload':
                    return await this.handleUpload(interaction);
                case 'list':
                    return await this.handleList(interaction);
                case 'play':
                    return await this.handlePlay(interaction);
                case 'stop':
                    return await this.handleStop(interaction);
                case 'delete':
                    return await this.handleDelete(interaction);
            }
        } catch (error) {
            console.error('[Local Play Error]', error);
            return this.sendError(interaction, error.message);
        }
    },

    async handleUpload(interaction) {
        const file = interaction.options.getAttachment('file');
        const name = interaction.options.getString('name').toLowerCase().replace(/[^a-z0-9_-]/g, '');


        if (!file.name.endsWith('.mp3')) {
            return this.sendError(interaction, 'Only MP3 files are supported!');
        }


        if (file.size > 8 * 1024 * 1024) {
            return this.sendError(interaction, 'File too large! Max 8MB.');
        }


        const audioDir = path.join(__dirname, '../../audio_library');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        const filePath = path.join(audioDir, `${name}.mp3`);


        if (fs.existsSync(filePath)) {
            return this.sendError(interaction, `Audio "${name}" already exists! Delete it first or use a different name.`);
        }

     
        const response = await fetch(file.url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ✅ Upload Success\n\n` +
                `**Name:** ${name}\n` +
                `**Size:** ${(file.size / 1024).toFixed(2)} KB\n` +
                `**Duration:** ~${Math.floor(file.size / 32000)}s\n\n` +
                `Use \`/local-play play name:${name}\` to play it in voice channel!`
            )
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleList(interaction) {
        const audioDir = path.join(__dirname, '../../audio_library');

        if (!fs.existsSync(audioDir)) {
            return this.sendError(interaction, 'No audio files uploaded yet!');
        }

        const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));

        if (files.length === 0) {
            return this.sendError(interaction, 'No audio files uploaded yet!');
        }

        const container = new ContainerBuilder().setAccentColor(0x3498db);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎧 Audio Library\n\nTotal: **${files.length}** files`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        let fileList = '';
        files.forEach((file, idx) => {
            const name = file.replace('.mp3', '');
            const stats = fs.statSync(path.join(audioDir, file));
            const size = (stats.size / 1024).toFixed(2);
            fileList += `${idx + 1}. **${name}** • ${size} KB\n`;
        });

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(fileList + `\nUse \`/local-play play\` to play in VC!`)
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handlePlay(interaction) {
        const name = interaction.options.getString('name');

       
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

   
        const audioDir = path.join(__dirname, '../../audio_library');
        const filePath = path.join(audioDir, `${name}.mp3`);

        if (!fs.existsSync(filePath)) {
            return this.sendError(interaction, 'Audio file not found!');
        }

        try {
      
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

  
            await entersState(connection, VoiceConnectionStatus.Ready, 30000);

       
            const player = createAudioPlayer();
            const resource = createAudioResource(filePath);

            connection.subscribe(player);
            player.play(resource);

 
            const stats = fs.statSync(filePath);


            const container = new ContainerBuilder().setAccentColor(0x00FF00);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🎵 Now Playing\n\n` +
                    `**Audio:** ${name}\n` +
                    `**Channel:** ${voiceChannel.name}\n` +
                    `**Size:** ${(stats.size / 1024).toFixed(2)} KB\n` +
                    `**Duration:** ~${Math.floor(stats.size / 32000)}s\n\n` +
                    `Bot will auto-disconnect after playing!`
                )
            );

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

     
            player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    connection.destroy();
                }, 1000);
            });

          
            player.on('error', error => {
                console.error('Audio player error:', error);
                connection.destroy();
            });

        } catch (error) {
            console.error('Playback error:', error);
            return this.sendError(interaction, 'Failed to play audio. Please try again.');
        }
    },

    async handleStop(interaction) {
        const voiceChannel = interaction.guild.members.me.voice.channel;
        
        if (!voiceChannel) {
            return this.sendError(interaction, 'I\'m not in a voice channel!');
        }

        const connection = interaction.guild.members.me.voice;
        if (connection) {
            connection.disconnect();
        }

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ⏹️ Stopped\n\nDisconnected from voice channel`)
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleDelete(interaction) {
        const name = interaction.options.getString('name');
        const audioDir = path.join(__dirname, '../../audio_library');
        const filePath = path.join(audioDir, `${name}.mp3`);

        if (!fs.existsSync(filePath)) {
            return this.sendError(interaction, 'Audio file not found!');
        }

        fs.unlinkSync(filePath);

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🗑️ Deleted\n\nRemoved **${name}** from library`
            )
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
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