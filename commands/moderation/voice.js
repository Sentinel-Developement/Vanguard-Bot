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
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice-mod')
        .setDescription('Voice channel moderation commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers | PermissionFlagsBits.MuteMembers)
        
       
        .addSubcommand(sub =>
            sub.setName('kick')
                .setDescription('Disconnect user from voice')
                .addUserOption(opt => opt.setName('user').setDescription('User to disconnect').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for disconnect')))
        
        .addSubcommand(sub =>
            sub.setName('move')
                .setDescription('Move user to another voice channel')
                .addUserOption(opt => opt.setName('user').setDescription('User to move').setRequired(true))
                .addChannelOption(opt => opt.setName('channel').setDescription('Target voice channel').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for move')))
        
        .addSubcommand(sub =>
            sub.setName('mute')
                .setDescription('Server mute user in voice')
                .addUserOption(opt => opt.setName('user').setDescription('User to mute').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for mute')))
        
        .addSubcommand(sub =>
            sub.setName('unmute')
                .setDescription('Unmute user in voice')
                .addUserOption(opt => opt.setName('user').setDescription('User to unmute').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('deafen')
                .setDescription('Server deafen user')
                .addUserOption(opt => opt.setName('user').setDescription('User to deafen').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for deafen')))
        
        .addSubcommand(sub =>
            sub.setName('undeafen')
                .setDescription('Undeafen user')
                .addUserOption(opt => opt.setName('user').setDescription('User to undeafen').setRequired(true)))
        
     
        .addSubcommand(sub =>
            sub.setName('mass-disconnect')
                .setDescription('Disconnect all users from a voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason')))
        
        .addSubcommand(sub =>
            sub.setName('mass-move')
                .setDescription('Move all users from one channel to another')
                .addChannelOption(opt => opt.setName('from').setDescription('Source channel').setRequired(true))
                .addChannelOption(opt => opt.setName('to').setDescription('Target channel').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('mass-mute')
                .setDescription('Mute all users in a voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason')))
        
        .addSubcommand(sub =>
            sub.setName('mass-unmute')
                .setDescription('Unmute all users in a voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('mass-deafen')
                .setDescription('Deafen all users in a voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('mass-undeafen')
                .setDescription('Undeafen all users in a voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true)))
        
     
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all users in voice channels'))
        
        .addSubcommand(sub =>
            sub.setName('channel-info')
                .setDescription('Get info about a voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('user-info')
                .setDescription('Get user voice state')
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
        
   
        .addSubcommand(sub =>
            sub.setName('hide')
                .setDescription('Hide voice channel from user')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true))
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('unhide')
                .setDescription('Unhide voice channel for user')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true))
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('lock')
                .setDescription('Lock voice channel (no one can join)')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('unlock')
                .setDescription('Unlock voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('limit')
                .setDescription('Set user limit for voice channel')
                .addChannelOption(opt => opt.setName('channel').setDescription('Voice channel').setRequired(true))
                .addIntegerOption(opt => opt.setName('limit').setDescription('User limit (0 = unlimited)').setMinValue(0).setMaxValue(99).setRequired(true)))
        
    
        .addSubcommand(sub =>
            sub.setName('monitor')
                .setDescription('Get real-time voice activity summary'))
        
        .addSubcommand(sub =>
            sub.setName('afk')
                .setDescription('List users in AFK channel'))
        
        .addSubcommand(sub =>
            sub.setName('empty')
                .setDescription('List empty voice channels'))
        
       
        .addSubcommand(sub =>
            sub.setName('stage-speaker')
                .setDescription('Make user speaker in stage channel')
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
        
        .addSubcommand(sub =>
            sub.setName('stage-audience')
                .setDescription('Move user to audience in stage')
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (!await checkPermissions(interaction, 'moderator')) return;

        const subcommand = interaction.options.getSubcommand();


        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers) && 
            !interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return this.sendError(interaction, 'You need Move Members or Mute Members permission!');
        }

        try {
            switch (subcommand) {
                case 'kick':
                    return await this.handleKick(interaction);
                case 'move':
                    return await this.handleMove(interaction);
                case 'mute':
                    return await this.handleMute(interaction);
                case 'unmute':
                    return await this.handleUnmute(interaction);
                case 'deafen':
                    return await this.handleDeafen(interaction);
                case 'undeafen':
                    return await this.handleUndeafen(interaction);
                case 'mass-disconnect':
                    return await this.handleMassDisconnect(interaction);
                case 'mass-move':
                    return await this.handleMassMove(interaction);
                case 'mass-mute':
                    return await this.handleMassMute(interaction);
                case 'mass-unmute':
                    return await this.handleMassUnmute(interaction);
                case 'mass-deafen':
                    return await this.handleMassDeafen(interaction);
                case 'mass-undeafen':
                    return await this.handleMassUndeafen(interaction);
                case 'list':
                    return await this.handleList(interaction);
                case 'channel-info':
                    return await this.handleChannelInfo(interaction);
                case 'user-info':
                    return await this.handleUserInfo(interaction);
                case 'hide':
                    return await this.handleHide(interaction);
                case 'unhide':
                    return await this.handleUnhide(interaction);
                case 'lock':
                    return await this.handleLock(interaction);
                case 'unlock':
                    return await this.handleUnlock(interaction);
                case 'limit':
                    return await this.handleLimit(interaction);
                case 'monitor':
                    return await this.handleMonitor(interaction);
                case 'afk':
                    return await this.handleAFK(interaction);
                case 'empty':
                    return await this.handleEmpty(interaction);
                case 'stage-speaker':
                    return await this.handleStageSpeaker(interaction);
                case 'stage-audience':
                    return await this.handleStageAudience(interaction);
            }
        } catch (error) {
            console.error('[Voice Mod Error]', error);
            return this.sendError(interaction, error.message);
        }
    },


    async handleKick(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        await member.voice.disconnect(reason);

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👢 User Disconnected\n\n` +
                `**User:** ${user.tag}\n` +
                `**Channel:** ${member.voice.channel.name}\n` +
                `**Reason:** ${reason}\n` +
                `**Moderator:** ${interaction.user.tag}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMove(interaction) {
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        const oldChannel = member.voice.channel;
        await member.voice.setChannel(channel, reason);

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔄 User Moved\n\n` +
                `**User:** ${user.tag}\n` +
                `**From:** ${oldChannel.name}\n` +
                `**To:** ${channel.name}\n` +
                `**Reason:** ${reason}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        await member.voice.setMute(true, reason);

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔇 User Muted\n\n` +
                `**User:** ${user.tag}\n` +
                `**Channel:** ${member.voice.channel.name}\n` +
                `**Reason:** ${reason}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleUnmute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        await member.voice.setMute(false);

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔊 User Unmuted\n\n` +
                `**User:** ${user.tag}\n` +
                `**Channel:** ${member.voice.channel.name}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleDeafen(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        await member.voice.setDeaf(true, reason);

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔇 User Deafened\n\n` +
                `**User:** ${user.tag}\n` +
                `**Channel:** ${member.voice.channel.name}\n` +
                `**Reason:** ${reason}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleUndeafen(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        await member.voice.setDeaf(false);

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔊 User Undeafened\n\n` +
                `**User:** ${user.tag}\n` +
                `**Channel:** ${member.voice.channel.name}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMassDisconnect(interaction) {
        const channel = interaction.options.getChannel('channel');
        const reason = interaction.options.getString('reason') || 'Mass disconnect';

        const members = channel.members;
        if (members.size === 0) {
            return this.sendError(interaction, 'No users in that voice channel!');
        }

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.voice.disconnect(reason);
                count++;
            } catch (err) {
                console.error(`Failed to disconnect ${member.user.tag}:`, err);
            }
        }

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👢 Mass Disconnect\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Disconnected:** ${count} users\n` +
                `**Reason:** ${reason}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMassMove(interaction) {
        const fromChannel = interaction.options.getChannel('from');
        const toChannel = interaction.options.getChannel('to');

        const members = fromChannel.members;
        if (members.size === 0) {
            return this.sendError(interaction, 'No users in source channel!');
        }

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.voice.setChannel(toChannel);
                count++;
            } catch (err) {
                console.error(`Failed to move ${member.user.tag}:`, err);
            }
        }

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔄 Mass Move\n\n` +
                `**From:** ${fromChannel.name}\n` +
                `**To:** ${toChannel.name}\n` +
                `**Moved:** ${count} users`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMassMute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const reason = interaction.options.getString('reason') || 'Mass mute';

        const members = channel.members;
        if (members.size === 0) {
            return this.sendError(interaction, 'No users in that voice channel!');
        }

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.voice.setMute(true, reason);
                count++;
            } catch (err) {
                console.error(`Failed to mute ${member.user.tag}:`, err);
            }
        }

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔇 Mass Mute\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Muted:** ${count} users\n` +
                `**Reason:** ${reason}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMassUnmute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const members = channel.members;
        if (members.size === 0) {
            return this.sendError(interaction, 'No users in that voice channel!');
        }

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.voice.setMute(false);
                count++;
            } catch (err) {
                console.error(`Failed to unmute ${member.user.tag}:`, err);
            }
        }

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔊 Mass Unmute\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Unmuted:** ${count} users`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMassDeafen(interaction) {
        const channel = interaction.options.getChannel('channel');

        const members = channel.members;
        if (members.size === 0) {
            return this.sendError(interaction, 'No users in that voice channel!');
        }

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.voice.setDeaf(true);
                count++;
            } catch (err) {
                console.error(`Failed to deafen ${member.user.tag}:`, err);
            }
        }

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔇 Mass Deafen\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Deafened:** ${count} users`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMassUndeafen(interaction) {
        const channel = interaction.options.getChannel('channel');

        const members = channel.members;
        if (members.size === 0) {
            return this.sendError(interaction, 'No users in that voice channel!');
        }

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.voice.setDeaf(false);
                count++;
            } catch (err) {
                console.error(`Failed to undeafen ${member.user.tag}:`, err);
            }
        }

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔊 Mass Undeafen\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Undeafened:** ${count} users`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleList(interaction) {
        const voiceChannels = interaction.guild.channels.cache.filter(c => c.isVoiceBased());

        const container = new ContainerBuilder().setAccentColor(0x3498db);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 🎙️ Voice Activity\n\nAll users in voice channels`)
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        let totalUsers = 0;
        for (const [id, channel] of voiceChannels) {
            if (channel.members.size > 0) {
                const userList = channel.members.map(m => `• ${m.user.tag}`).join('\n');
                
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${channel.name}** (${channel.members.size})\n${userList}`
                    )
                );

                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                totalUsers += channel.members.size;
            }
        }

        if (totalUsers === 0) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('No users in voice channels')
            );
        } else {
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Total:** ${totalUsers} users in voice`)
            );
        }

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleChannelInfo(interaction) {
        const channel = interaction.options.getChannel('channel');

        const container = new ContainerBuilder().setAccentColor(0x3498db);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎙️ ${channel.name}\n\n` +
                `**Type:** ${channel.type === 2 ? 'Voice' : channel.type === 13 ? 'Stage' : 'Unknown'}\n` +
                `**Users:** ${channel.members.size}/${channel.userLimit || '∞'}\n` +
                `**Bitrate:** ${channel.bitrate / 1000}kbps\n` +
                `**Region:** ${channel.rtcRegion || 'Automatic'}\n` +
                `**ID:** ${channel.id}`
            )
        );

        if (channel.members.size > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const userList = channel.members.map(m => {
                let status = [];
                if (m.voice.serverMute) status.push('🔇 Muted');
                if (m.voice.serverDeaf) status.push('🔇 Deafened');
                if (m.voice.selfMute) status.push('🔇 Self-Muted');
                if (m.voice.selfDeaf) status.push('🔇 Self-Deafened');
                if (m.voice.streaming) status.push('📹 Streaming');
                if (m.voice.selfVideo) status.push('📹 Video');
                
                return `• ${m.user.tag}${status.length > 0 ? ` (${status.join(', ')})` : ''}`;
            }).join('\n');

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Users:**\n${userList}`)
            );
        }

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleUserInfo(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel) {
            return this.sendError(interaction, 'User is not in a voice channel!');
        }

        const voice = member.voice;
        const states = [];
        if (voice.serverMute) states.push('🔇 Server Muted');
        if (voice.serverDeaf) states.push('🔇 Server Deafened');
        if (voice.selfMute) states.push('🔇 Self Muted');
        if (voice.selfDeaf) states.push('🔇 Self Deafened');
        if (voice.streaming) states.push('📹 Streaming');
        if (voice.selfVideo) states.push('📹 Video On');

        const container = new ContainerBuilder().setAccentColor(0x3498db);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👤 ${user.tag}\n\n` +
                `**Channel:** ${voice.channel.name}\n` +
                `**Status:** ${states.length > 0 ? states.join('\n') : 'Active'}\n` +
                `**Session ID:** ${voice.sessionId || 'Unknown'}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleHide(interaction) {
        const channel = interaction.options.getChannel('channel');
        const user = interaction.options.getUser('user');

        await channel.permissionOverwrites.create(user.id, {
            ViewChannel: false
        });

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👁️ Channel Hidden\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Hidden from:** ${user.tag}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleUnhide(interaction) {
        const channel = interaction.options.getChannel('channel');
        const user = interaction.options.getUser('user');

        await channel.permissionOverwrites.delete(user.id);

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👁️ Channel Unhidden\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Visible to:** ${user.tag}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleLock(interaction) {
        const channel = interaction.options.getChannel('channel');

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: false
        });

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔒 Channel Locked\n\n` +
                `**Channel:** ${channel.name}\n` +
                `No one can join this channel now`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleUnlock(interaction) {
        const channel = interaction.options.getChannel('channel');

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: null
        });

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🔓 Channel Unlocked\n\n` +
                `**Channel:** ${channel.name}\n` +
                `Everyone can join now`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleLimit(interaction) {
        const channel = interaction.options.getChannel('channel');
        const limit = interaction.options.getInteger('limit');

        await channel.setUserLimit(limit);

        const container = new ContainerBuilder().setAccentColor(0x3498db);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👥 User Limit Set\n\n` +
                `**Channel:** ${channel.name}\n` +
                `**Limit:** ${limit === 0 ? 'Unlimited' : `${limit} users`}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMonitor(interaction) {
        const voiceChannels = interaction.guild.channels.cache.filter(c => c.isVoiceBased());

        let totalUsers = 0;
        let muted = 0;
        let deafened = 0;
        let streaming = 0;
        let video = 0;

        for (const [id, channel] of voiceChannels) {
            totalUsers += channel.members.size;
            
            for (const [mid, member] of channel.members) {
                if (member.voice.serverMute || member.voice.selfMute) muted++;
                if (member.voice.serverDeaf || member.voice.selfDeaf) deafened++;
                if (member.voice.streaming) streaming++;
                if (member.voice.selfVideo) video++;
            }
        }

        const container = new ContainerBuilder().setAccentColor(0x3498db);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 📊 Voice Activity Monitor\n\n` +
                `**Total Users:** ${totalUsers}\n` +
                `**Active Channels:** ${voiceChannels.filter(c => c.members.size > 0).size}\n` +
                `**Muted:** ${muted}\n` +
                `**Deafened:** ${deafened}\n` +
                `**Streaming:** ${streaming}\n` +
                `**Video On:** ${video}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleAFK(interaction) {
        const afkChannel = interaction.guild.afkChannel;

        if (!afkChannel) {
            return this.sendError(interaction, 'No AFK channel set for this server!');
        }

        const members = afkChannel.members;

        const container = new ContainerBuilder().setAccentColor(0x95A5A6);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 💤 AFK Channel\n\n` +
                `**Channel:** ${afkChannel.name}\n` +
                `**Users:** ${members.size}`
            )
        );

        if (members.size > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const userList = members.map(m => `• ${m.user.tag}`).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(userList)
            );
        }

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleEmpty(interaction) {
        const voiceChannels = interaction.guild.channels.cache.filter(c => c.isVoiceBased() && c.members.size === 0);

        const container = new ContainerBuilder().setAccentColor(0x95A5A6);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 📭 Empty Voice Channels\n\n` +
                `**Count:** ${voiceChannels.size}`
            )
        );

        if (voiceChannels.size > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const channelList = voiceChannels.map(c => `• ${c.name}`).join('\n');
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(channelList)
            );
        }

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleStageSpeaker(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel || member.voice.channel.type !== 13) {
            return this.sendError(interaction, 'User is not in a stage channel!');
        }

        await member.voice.setSuppressed(false);

        const container = new ContainerBuilder().setAccentColor(0x00FF00);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎤 Speaker Promoted\n\n` +
                `**User:** ${user.tag}\n` +
                `**Stage:** ${member.voice.channel.name}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleStageAudience(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.voice.channel || member.voice.channel.type !== 13) {
            return this.sendError(interaction, 'User is not in a stage channel!');
        }

        await member.voice.setSuppressed(true);

        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👥 Moved to Audience\n\n` +
                `**User:** ${user.tag}\n` +
                `**Stage:** ${member.voice.channel.name}`
            )
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    sendError(interaction, message) {
        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ❌ Error\n\n${message}`)
        );
        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
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