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
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analytics')
        .setDescription('Advanced server analytics and insights')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        
        .addSubcommand(sub => sub
            .setName('overview')
            .setDescription('Complete server overview with insights'))
        
        .addSubcommand(sub => sub
            .setName('members')
            .setDescription('Detailed member analytics'))
        
        .addSubcommand(sub => sub
            .setName('channels')
            .setDescription('Channel performance analysis'))
        
        .addSubcommand(sub => sub
            .setName('activity')
            .setDescription('Activity heatmap and patterns'))
        
        .addSubcommand(sub => sub
            .setName('growth')
            .setDescription('Growth tracking with predictions'))
        
        .addSubcommand(sub => sub
            .setName('roles')
            .setDescription('Complete role distribution'))
        
        .addSubcommand(sub => sub
            .setName('user')
            .setDescription('User profile analysis')
            .addUserOption(opt => opt
                .setName('target')
                .setDescription('User to analyze')
                .setRequired(false))),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const subcommand = interaction.options.getSubcommand();
            const guild = interaction.guild;
            await guild.members.fetch();

            switch (subcommand) {
                case 'overview':
                    return await this.handleOverview(interaction, guild);
                case 'members':
                    return await this.handleMembers(interaction, guild);
                case 'channels':
                    return await this.handleChannels(interaction, guild);
                case 'activity':
                    return await this.handleActivity(interaction, guild);
                case 'growth':
                    return await this.handleGrowth(interaction, guild);
                case 'roles':
                    return await this.handleRoles(interaction, guild);
                case 'user':
                    return await this.handleUser(interaction, guild);
            }

        } catch (error) {
            console.error('[Analytics Error]', error);
            return this.sendError(interaction, 'Failed to generate analytics.');
        }
    },

    async handleOverview(interaction, guild) {
        const members = guild.members.cache;
        const channels = guild.channels.cache;
        const roles = guild.roles.cache;

        const totalMembers = members.size;
        const humans = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;

        const online = members.filter(m => m.presence?.status === 'online').size;
        const idle = members.filter(m => m.presence?.status === 'idle').size;
        const dnd = members.filter(m => m.presence?.status === 'dnd').size;

        // Calculate metrics
        const activityRate = ((online + idle + dnd) / totalMembers * 100).toFixed(1);
        const botRatio = (bots / totalMembers * 100).toFixed(1);
        const serverAge = Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24));
        const growthRate = (totalMembers / serverAge).toFixed(2);

        // Health score calculation
        let healthScore = 0;
        if (activityRate > 70) healthScore += 30;
        else if (activityRate > 40) healthScore += 20;
        else healthScore += 10;

        if (botRatio < 10) healthScore += 20;
        else if (botRatio < 20) healthScore += 10;

        if (totalMembers > 1000) healthScore += 25;
        else if (totalMembers > 100) healthScore += 15;
        else healthScore += 5;

        if (growthRate > 5) healthScore += 25;
        else if (growthRate > 1) healthScore += 15;
        else healthScore += 5;

        // Container 1: Overview
        const overview = new ContainerBuilder().setAccentColor(0x5865F2);

        overview.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 📊 ${guild.name} Analytics\n\n` +
                `**Server Health:** ${healthScore}/100 ${this.getHealthEmoji(healthScore)}\n` +
                `**Status:** ${this.getHealthStatus(healthScore)}`
            )
        );

        overview.addSeparatorComponents(new SeparatorBuilder());

        overview.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🎯 Key Metrics\n\n` +
                `**Total Members:** ${totalMembers.toLocaleString()}\n` +
                `**Activity Rate:** ${activityRate}% ${activityRate > 50 ? '🔥' : activityRate > 30 ? '✅' : '⚠️'}\n` +
                `**Growth Rate:** ${growthRate} members/day\n` +
                `**Server Age:** ${serverAge} days\n` +
                `**Bot Ratio:** ${botRatio}% ${botRatio < 15 ? '✅' : '⚠️'}`
            )
        );

        await interaction.editReply({
            components: [overview],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        // Container 2: Demographics
        const demographics = new ContainerBuilder().setAccentColor(0x57F287);

        demographics.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 👥 Member Demographics\n\n` +
                `**Breakdown**\n` +
                `👤 Humans: ${humans.toLocaleString()} (${(humans/totalMembers*100).toFixed(1)}%)\n` +
                `🤖 Bots: ${bots.toLocaleString()} (${botRatio}%)\n\n` +
                `**Activity Status**\n` +
                `🟢 Online: ${online} (${(online/totalMembers*100).toFixed(1)}%)\n` +
                `🟡 Idle: ${idle} (${(idle/totalMembers*100).toFixed(1)}%)\n` +
                `🔴 DND: ${dnd} (${(dnd/totalMembers*100).toFixed(1)}%)\n` +
                `⚫ Offline: ${totalMembers - online - idle - dnd}`
            )
        );

        await interaction.followUp({
            components: [demographics],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        // Container 3: Infrastructure
        const infrastructure = new ContainerBuilder().setAccentColor(0xFEE75C);

        const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;
        const forums = channels.filter(c => c.type === ChannelType.GuildForum).size;

        infrastructure.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🏗️ Server Infrastructure\n\n` +
                `**Channels:** ${channels.size} total\n` +
                `├─ 💬 Text: ${textChannels}\n` +
                `├─ 🔊 Voice: ${voiceChannels}\n` +
                `├─ 📁 Categories: ${categories}\n` +
                `└─ 💭 Forums: ${forums}\n\n` +
                `**Organization**\n` +
                `🎭 Roles: ${roles.size}\n` +
                `😀 Emojis: ${guild.emojis.cache.size}\n` +
                `🚀 Boosts: ${guild.premiumSubscriptionCount || 0} (Tier ${guild.premiumTier})\n` +
                `📈 Efficiency: ${(totalMembers/channels.size).toFixed(1)} members/channel`
            )
        );

        await interaction.followUp({
            components: [infrastructure],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        // Container 4: Insights & Recommendations
        const insights = new ContainerBuilder().setAccentColor(0x9B59B6);

        const recommendations = [];
        if (activityRate < 40) recommendations.push('• Host events to boost engagement');
        if (botRatio > 20) recommendations.push('• Review bot count - may be too high');
        if (channels.size / totalMembers > 0.1) recommendations.push('• Consider consolidating channels');
        if (growthRate < 1) recommendations.push('• Increase promotional activities');
        if (guild.premiumTier < 2 && totalMembers > 100) recommendations.push('• Encourage members to boost the server');
        if (roles.size < 5) recommendations.push('• Create more roles for organization');

        insights.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 💡 Smart Insights\n\n` +
                (recommendations.length > 0 ? recommendations.join('\n') : '✅ Server is well-optimized!') +
                `\n\n**Server Owner:** <@${guild.ownerId}>\n` +
                `**Created:** ${guild.createdAt.toLocaleDateString()}\n` +
                `**Verification:** ${this.getVerificationLevel(guild.verificationLevel)}`
            )
        );

        await interaction.followUp({
            components: [insights],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleMembers(interaction, guild) {
        const members = guild.members.cache;
        const totalMembers = members.size;

        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // Join analysis
        const joinedToday = members.filter(m => (now - m.joinedTimestamp) < day).size;
        const joinedWeek = members.filter(m => (now - m.joinedTimestamp) < 7 * day).size;
        const joinedMonth = members.filter(m => (now - m.joinedTimestamp) < 30 * day).size;

        // Account ages
        const newAccounts = members.filter(m => (now - m.user.createdTimestamp) < 7 * day).size;
        const youngAccounts = members.filter(m => (now - m.user.createdTimestamp) < 30 * day).size;
        const oldAccounts = members.filter(m => (now - m.user.createdTimestamp) > 365 * day).size;

        // Status
        const online = members.filter(m => m.presence?.status === 'online').size;
        const idle = members.filter(m => m.presence?.status === 'idle').size;
        const dnd = members.filter(m => m.presence?.status === 'dnd').size;

        // Container 1: Member Breakdown
        const breakdown = new ContainerBuilder().setAccentColor(0x57F287);

        breakdown.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👥 Member Analytics\n\n` +
                `Comprehensive member statistics and insights`
            )
        );

        breakdown.addSeparatorComponents(new SeparatorBuilder());

        breakdown.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📊 Demographics\n\n` +
                `**Total Members:** ${totalMembers.toLocaleString()}\n` +
                `👤 Humans: ${members.filter(m => !m.user.bot).size}\n` +
                `🤖 Bots: ${members.filter(m => m.user.bot).size}\n\n` +
                `**Member Density**\n` +
                `Roles per Member: ${(guild.roles.cache.size / totalMembers).toFixed(2)}\n` +
                `Channels per Member: ${(guild.channels.cache.size / totalMembers).toFixed(2)}`
            )
        );

        await interaction.editReply({
            components: [breakdown],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        // Container 2: Growth Metrics
        const growth = new ContainerBuilder().setAccentColor(0x3498DB);

        growth.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📈 Recent Growth\n\n` +
                `**New Members**\n` +
                `└─ Today: +${joinedToday}\n` +
                `└─ This Week: +${joinedWeek}\n` +
                `└─ This Month: +${joinedMonth}\n\n` +
                `**Growth Rates**\n` +
                `Daily Avg: ${(joinedWeek / 7).toFixed(1)} members\n` +
                `Weekly Avg: ${(joinedMonth / 4.3).toFixed(1)} members\n` +
                `Monthly Avg: ${joinedMonth} members\n\n` +
                `**Growth Percentage:** ${((joinedMonth / totalMembers) * 100).toFixed(2)}%/month`
            )
        );

        await interaction.followUp({
            components: [growth],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        // Container 3: Account Ages
        const ages = new ContainerBuilder().setAccentColor(0xE67E22);

        ages.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🆕 Account Analysis\n\n` +
                `**New Accounts (<7 days):** ${newAccounts}\n` +
                `├─ Percentage: ${(newAccounts/totalMembers*100).toFixed(1)}%\n` +
                `└─ Risk Level: ${newAccounts > totalMembers * 0.1 ? '⚠️ High' : '✅ Low'}\n\n` +
                `**Young Accounts (<30 days):** ${youngAccounts}\n` +
                `**Established Accounts (>1 year):** ${oldAccounts}\n\n` +
                `**Account Maturity Score:** ${((oldAccounts/totalMembers)*100).toFixed(1)}/100`
            )
        );

        await interaction.followUp({
            components: [ages],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        // Container 4: Activity Status
        const activityContainer = new ContainerBuilder().setAccentColor(0xEB459E);

        const activityRate = ((online + idle + dnd) / totalMembers * 100).toFixed(1);

        activityContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### ⚡ Activity Metrics\n\n` +
                `**Current Status**\n` +
                `🟢 Online: ${online} (${(online/totalMembers*100).toFixed(1)}%)\n` +
                `🟡 Idle: ${idle} (${(idle/totalMembers*100).toFixed(1)}%)\n` +
                `🔴 DND: ${dnd} (${(dnd/totalMembers*100).toFixed(1)}%)\n` +
                `⚫ Offline: ${totalMembers - online - idle - dnd}\n\n` +
                `**Engagement**\n` +
                `Activity Rate: ${activityRate}%\n` +
                `Engagement Level: ${activityRate > 70 ? '🔥 Excellent' : activityRate > 50 ? '✅ Good' : activityRate > 30 ? '⚠️ Average' : '❌ Low'}\n` +
                `Active Members: ${online + idle + dnd}/${totalMembers}`
            )
        );

        await interaction.followUp({
            components: [activityContainer],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleChannels(interaction, guild) {
        const channels = guild.channels.cache;

        const text = channels.filter(c => c.type === ChannelType.GuildText);
        const voice = channels.filter(c => c.type === ChannelType.GuildVoice);
        const categories = channels.filter(c => c.type === ChannelType.GuildCategory);
        const forums = channels.filter(c => c.type === ChannelType.GuildForum);
        const announcements = channels.filter(c => c.type === ChannelType.GuildAnnouncement);

        const activeVoice = voice.filter(c => c.members && c.members.size > 0);
        const totalVoiceUsers = activeVoice.reduce((acc, c) => acc + c.members.size, 0);

        const container = new ContainerBuilder().setAccentColor(0xFEE75C);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 📺 Channel Analytics\n\n` +
                `Channel distribution and usage statistics`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📊 Channel Overview\n\n` +
                `**Total Channels:** ${channels.size}\n\n` +
                `**Breakdown by Type**\n` +
                `💬 Text: ${text.size}\n` +
                `🔊 Voice: ${voice.size}\n` +
                `📁 Categories: ${categories.size}\n` +
                `📢 Announcements: ${announcements.size}\n` +
                `💭 Forums: ${forums.size}\n\n` +
                `**Voice Activity**\n` +
                `Active Channels: ${activeVoice.size}/${voice.size}\n` +
                `Total Users: ${totalVoiceUsers}\n` +
                `Utilization: ${voice.size > 0 ? (activeVoice.size/voice.size*100).toFixed(1) : 0}%`
            )
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        if (activeVoice.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));

            const voiceActivity = new ContainerBuilder().setAccentColor(0x3498DB);

            voiceActivity.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 🔊 Active Voice Channels\n\n` +
                    activeVoice.map(c => `🎤 **${c.name}**\n   └─ ${c.members.size} users`).slice(0, 10).join('\n\n')
                )
            );

            await interaction.followUp({
                components: [voiceActivity],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },

    async handleActivity(interaction, guild) {
        const members = guild.members.cache;

        const online = members.filter(m => m.presence?.status === 'online');
        const idle = members.filter(m => m.presence?.status === 'idle');
        const dnd = members.filter(m => m.presence?.status === 'dnd');
        const offline = members.size - online.size - idle.size - dnd.size;

        const container = new ContainerBuilder().setAccentColor(0xEB459E);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## ⚡ Activity Analytics\n\n` +
                `Real-time server activity and engagement`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        const createBar = (value, max, length = 20) => {
            const filled = Math.round((value / max) * length);
            return '█'.repeat(filled) + '░'.repeat(length - filled);
        };

        const maxStatus = Math.max(online.size, idle.size, dnd.size, offline);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📊 Status Distribution\n\n` +
                `🟢 **Online** (${online.size})\n` +
                `${createBar(online.size, maxStatus)} ${(online.size/members.size*100).toFixed(1)}%\n\n` +
                `🟡 **Idle** (${idle.size})\n` +
                `${createBar(idle.size, maxStatus)} ${(idle.size/members.size*100).toFixed(1)}%\n\n` +
                `🔴 **DND** (${dnd.size})\n` +
                `${createBar(dnd.size, maxStatus)} ${(dnd.size/members.size*100).toFixed(1)}%\n\n` +
                `⚫ **Offline** (${offline})\n` +
                `${createBar(offline, maxStatus)} ${(offline/members.size*100).toFixed(1)}%`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        const activeMembers = online.size + idle.size + dnd.size;
        const activityRate = (activeMembers / members.size * 100).toFixed(1);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🎯 Engagement Metrics\n\n` +
                `**Activity Rate:** ${activityRate}%\n` +
                `**Active Members:** ${activeMembers}/${members.size}\n` +
                `**Engagement Level:** ${activityRate > 70 ? '🔥 Excellent' : activityRate > 50 ? '✅ Good' : activityRate > 30 ? '⚠️ Average' : '❌ Low'}`
            )
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleGrowth(interaction, guild) {
        const members = guild.members.cache;

        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        const periods = {
            '1d': members.filter(m => (now - m.joinedTimestamp) < day).size,
            '7d': members.filter(m => (now - m.joinedTimestamp) < 7 * day).size,
            '30d': members.filter(m => (now - m.joinedTimestamp) < 30 * day).size,
            '90d': members.filter(m => (now - m.joinedTimestamp) < 90 * day).size,
        };

        const container = new ContainerBuilder().setAccentColor(0x57F287);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 📈 Growth Analytics\n\n` +
                `Server growth tracking and projections`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        const dailyAvg = (periods['7d'] / 7).toFixed(1);
        const weeklyAvg = (periods['30d'] / 4.3).toFixed(1);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📊 Growth Overview\n\n` +
                `**Current Members:** ${members.size.toLocaleString()}\n` +
                `**Server Age:** ${Math.floor((now - guild.createdTimestamp) / day)} days\n\n` +
                `**New Members by Period**\n` +
                `├─ Last 24 Hours: ${periods['1d']}\n` +
                `├─ Last 7 Days: ${periods['7d']}\n` +
                `├─ Last 30 Days: ${periods['30d']}\n` +
                `└─ Last 90 Days: ${periods['90d']}\n\n` +
                `**Growth Rates**\n` +
                `Daily Avg: ${dailyAvg} members/day\n` +
                `Weekly Avg: ${weeklyAvg} members/week\n` +
                `Monthly %: ${((periods['30d']/members.size)*100).toFixed(2)}%`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        const projection30 = Math.round(dailyAvg * 30);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🔮 Projections\n\n` +
                `*Based on 7-day average*\n\n` +
                `**Next 30 Days:** ~${projection30} new members\n` +
                `**Projected Total:** ~${(members.size + projection30).toLocaleString()}\n` +
                `**Growth Trend:** ${periods['7d'] > periods['1d'] * 7 ? '📈 Accelerating' : '📉 Slowing'}`
            )
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleUser(interaction, guild) {
        const target = interaction.options.getUser('target') || interaction.user;
        const member = await guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return this.sendError(interaction, 'User not found in this server!');
        }

        const joinPos = guild.members.cache
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
            .map(m => m.id)
            .indexOf(member.id) + 1;

        const daysSinceJoin = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
        const accountAge = Math.floor((Date.now() - target.createdTimestamp) / (1000 * 60 * 60 * 24));

        const container = new ContainerBuilder().setAccentColor(0x5865F2);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👤 User Analytics\n\n` +
                `**${member.displayName}** (${target.username})`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📋 Profile Information\n\n` +
                `**User ID:** ${target.id}\n` +
                `**Account Created:** ${target.createdAt.toLocaleDateString()}\n` +
                `**Account Age:** ${accountAge} days\n` +
                `**Joined Server:** ${member.joinedAt.toLocaleDateString()}\n` +
                `**Days in Server:** ${daysSinceJoin}\n` +
                `**Join Position:** #${joinPos}`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🎭 Roles & Permissions\n\n` +
                `**Total Roles:** ${member.roles.cache.size - 1}\n` +
                `**Highest Role:** ${member.roles.highest.name}\n` +
                `**Admin:** ${member.permissions.has(PermissionFlagsBits.Administrator) ? '✅' : '❌'}\n` +
                `**Mod Permissions:** ${member.permissions.has(PermissionFlagsBits.ManageMessages) ? '✅' : '❌'}`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### ⚡ Activity Status\n\n` +
                `**Current Status:** ${member.presence?.status || 'offline'}\n` +
                `**Activity:** ${member.presence?.activities[0]?.name || 'None'}\n` +
                `**Bot Account:** ${target.bot ? 'Yes' : 'No'}`
            )
        );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async handleRoles(interaction, guild) {
        const roles = guild.roles.cache.filter(r => r.name !== '@everyone').sort((a, b) => b.members.size - a.members.size);
        
        const overview = new ContainerBuilder().setAccentColor(0x9B59B6);

        const totalAssignments = roles.reduce((acc, r) => acc + r.members.size, 0);

        overview.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎭 Role Analytics\n\n` +
                `Detailed role distribution and usage`
            )
        );

        overview.addSeparatorComponents(new SeparatorBuilder());

        overview.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 📊 Role Overview\n\n` +
                `**Total Roles:** ${roles.size}\n` +
                `**Total Assignments:** ${totalAssignments.toLocaleString()}\n` +
                `**Avg per Member:** ${(totalAssignments/guild.memberCount).toFixed(1)}\n` +
                `**Efficiency:** ${(roles.size/guild.memberCount*100).toFixed(2)}% coverage`
            )
        );

        await interaction.editReply({
            components: [overview],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 200));

        const top15 = roles.first(15);
        const roleList = top15.map((role, i) =>
            `${i+1}. **${role.name}**\n   └─ ${role.members.size} members (${(role.members.size/guild.memberCount*100).toFixed(1)}%)`
        ).join('\n\n');

        const topRoles = new ContainerBuilder().setAccentColor(0x8E44AD);

        topRoles.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🏆 Top Roles (1-15)\n\n${roleList}`
            )
        );

        await interaction.followUp({
            components: [topRoles],
            flags: MessageFlags.IsComponentsV2
        });

        if (roles.size > 15) {
            await new Promise(resolve => setTimeout(resolve, 200));

            const remaining = roles.filter((r, i) => i >= 15 && i < 30);
            const remainingList = remaining.map((role, i) =>
                `${i+16}. **${role.name}**\n   └─ ${role.members.size} members (${(role.members.size/guild.memberCount*100).toFixed(1)}%)`
            ).join('\n\n');

            const moreRoles = new ContainerBuilder().setAccentColor(0x7D3C98);

            moreRoles.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 🏆 More Roles (16-30)\n\n${remainingList}`
                )
            );

            await interaction.followUp({
                components: [moreRoles],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },

    getHealthEmoji(score) {
        if (score >= 80) return '🏆';
        if (score >= 60) return '✅';
        if (score >= 40) return '⚠️';
        return '❌';
    },

    getHealthStatus(score) {
        if (score >= 80) return 'Excellent - Server is thriving!';
        if (score >= 60) return 'Good - Healthy server metrics';
        if (score >= 40) return 'Average - Room for improvement';
        return 'Needs Attention - Focus on growth';
    },

    getVerificationLevel(level) {
        const levels = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High' };
        return levels[level] || 'Unknown';
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
