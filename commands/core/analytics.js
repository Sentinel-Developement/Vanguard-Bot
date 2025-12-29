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
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');


const analyticsPath = path.join(__dirname, '..', '..', 'data', 'analytics.json');


const ensureAnalyticsData = () => {
    if (!fs.existsSync(path.dirname(analyticsPath))) {
        fs.mkdirSync(path.dirname(analyticsPath), { recursive: true });
    }
    if (!fs.existsSync(analyticsPath)) {
        fs.writeFileSync(analyticsPath, JSON.stringify({
            commands: {},
            messages: {},
            voice: {},
            members: {},
            daily: {}
        }, null, 2));
    }
};

const getAnalyticsData = () => {
    ensureAnalyticsData();
    return JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
};

const saveAnalyticsData = (data) => {
    fs.writeFileSync(analyticsPath, JSON.stringify(data, null, 2));
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analytics')
        .setDescription('Comprehensive server analytics and insights system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        
        .addSubcommand(sub => sub
            .setName('server')
            .setDescription('Complete server analytics overview'))
        .addSubcommand(sub => sub
            .setName('user')
            .setDescription('Individual user analytics and insights')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('User to analyze (defaults to you)')
                    .setRequired(false)))
        .addSubcommand(sub => sub
            .setName('activity')
            .setDescription('Server activity heatmaps and patterns'))
        .addSubcommand(sub => sub
            .setName('growth')
            .setDescription('Server growth tracking and trends'))
        .addSubcommand(sub => sub
            .setName('engagement')
            .setDescription('Member engagement metrics and analysis'))
        .addSubcommand(sub => sub
            .setName('channels')
            .setDescription('Channel performance and usage statistics'))
        .addSubcommand(sub => sub
            .setName('commands')
            .setDescription('Bot command usage statistics'))
        .addSubcommand(sub => sub
            .setName('economy')
            .setDescription('Economy system analytics (if available)'))
        .addSubcommand(sub => sub
            .setName('leveling')
            .setDescription('Leveling system insights and progression'))
        .addSubcommand(sub => sub
            .setName('music')
            .setDescription('Music bot usage analytics'))
        .addSubcommand(sub => sub
            .setName('export')
            .setDescription('Export analytics data to file'))
        .addSubcommand(sub => sub
            .setName('compare')
            .setDescription('Compare different time periods')
            .addStringOption(option =>
                option.setName('period1')
                    .setDescription('First time period')
                    .addChoices(
                        { name: 'Today', value: 'today' },
                        { name: 'Yesterday', value: 'yesterday' },
                        { name: 'This Week', value: 'week' },
                        { name: 'Last Week', value: 'lastweek' },
                        { name: 'This Month', value: 'month' }
                    ))
            .addStringOption(option =>
                option.setName('period2')
                    .setDescription('Second time period')
                    .addChoices(
                        { name: 'Today', value: 'today' },
                        { name: 'Yesterday', value: 'yesterday' },
                        { name: 'This Week', value: 'week' },
                        { name: 'Last Week', value: 'lastweek' },
                        { name: 'This Month', value: 'month' }
                    )))
        .addSubcommand(sub => sub
            .setName('predictions')
            .setDescription('AI-powered growth and engagement predictions'))
        .addSubcommand(sub => sub
            .setName('reports')
            .setDescription('Generate comprehensive custom reports')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Report type')
                    .addChoices(
                        { name: 'Weekly Summary', value: 'weekly' },
                        { name: 'Monthly Report', value: 'monthly' },
                        { name: 'Growth Analysis', value: 'growth' },
                        { name: 'Engagement Report', value: 'engagement' }
                    )))
        .addSubcommand(sub => sub
            .setName('dashboard')
            .setDescription('Interactive analytics dashboard overview')),

    async execute(interaction) {
        try {
            let sender = interaction.user;
            let subcommand;
            let isSlashCommand = false;

            if (interaction.isChatInputCommand()) {
                isSlashCommand = true;
                await interaction.deferReply();
                subcommand = interaction.options.getSubcommand();
            } else {
                const message = interaction;
                sender = message.author;
                const args = message.content.split(' ').slice(1);
                subcommand = args[0] || 'dashboard';
            }

         
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                const permissionContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🚫 Permission Denied\n\n> You need **Manage Server** permission to use analytics\n> Contact a server administrator for access')
                    );
                
                const messageData = { components: [permissionContainer], flags: MessageFlags.IsComponentsV2 };
                return isSlashCommand ? interaction.editReply(messageData) : interaction.reply(messageData);
            }

            const guild = interaction.guild;
            const sendReply = async (components) => {
                const messageData = { components: components, flags: MessageFlags.IsComponentsV2 };
                return isSlashCommand ? interaction.editReply(messageData) : interaction.reply(messageData);
            };

       
            const calculateMemberGrowth = () => {
                const now = new Date();
                const members = guild.members.cache;
                
                const today = members.filter(m => {
                    const joinDate = new Date(m.joinedTimestamp);
                    return joinDate.toDateString() === now.toDateString();
                }).size;

                const thisWeek = members.filter(m => {
                    const joinDate = new Date(m.joinedTimestamp);
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return joinDate >= weekAgo;
                }).size;

                const thisMonth = members.filter(m => {
                    const joinDate = new Date(m.joinedTimestamp);
                    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).size;

                return { today, thisWeek, thisMonth };
            };

            const getChannelStats = () => {
                const channels = guild.channels.cache;
                const textChannels = channels.filter(c => c.type === 0).size;
                const voiceChannels = channels.filter(c => c.type === 2).size;
                const categories = channels.filter(c => c.type === 4).size;
                const threads = channels.filter(c => c.type === 11 || c.type === 12).size;

                return { textChannels, voiceChannels, categories, threads, total: channels.size };
            };

            const getRoleDistribution = () => {
                const roles = guild.roles.cache;
                const members = guild.members.cache;
                
                const roleStats = roles.map(role => ({
                    name: role.name,
                    memberCount: role.members.size,
                    color: role.hexColor,
                    position: role.position
                })).filter(r => r.name !== '@everyone').sort((a, b) => b.memberCount - a.memberCount).slice(0, 10);

                return roleStats;
            };

            const getActivityPattern = () => {
              
                const members = guild.members.cache;
                const online = members.filter(m => m.presence?.status === 'online').size;
                const idle = members.filter(m => m.presence?.status === 'idle').size;
                const dnd = members.filter(m => m.presence?.status === 'dnd').size;
                const offline = members.size - online - idle - dnd;

                return { online, idle, dnd, offline };
            };

         
            if (subcommand === 'server') {
                const growth = calculateMemberGrowth();
                const channelStats = getChannelStats();
                const activity = getActivityPattern();
                const roleStats = getRoleDistribution();

                const components = [];
                
                const serverContainer = new ContainerBuilder()
                    .setAccentColor(0x5865f2);

                serverContainer.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 📊 ${guild.name} Analytics\n## Complete Server Overview\n\n> Comprehensive server statistics and insights\n> Real-time data analysis and trends`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(guild.iconURL({ format: 'png', dynamic: true, size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png')
                                .setDescription(`${guild.name} server icon`)
                        )
                );

                components.push(serverContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 📈 **Server Statistics**',
                            '',
                            `**Member Metrics**`,
                            `Total Members: ${guild.memberCount.toLocaleString()}`,
                            `Online Members: ${activity.online.toLocaleString()}`,
                            `Verification Level: ${guild.verificationLevel}`,
                            '',
                            `**Growth Tracking**`,
                            `New Today: ${growth.today} members`,
                            `New This Week: ${growth.thisWeek} members`,
                            `New This Month: ${growth.thisMonth} members`,
                            '',
                            `**Server Infrastructure**`,
                            `Text Channels: ${channelStats.textChannels}`,
                            `Voice Channels: ${channelStats.voiceChannels}`,
                            `Categories: ${channelStats.categories}`,
                            `Total Roles: ${guild.roles.cache.size}`,
                            '',
                            `**Server Age**`,
                            `Created: ${guild.createdAt.toLocaleDateString()}`,
                            `Age: ${Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24))} days`
                        ].join('\n'))
                );

                components.push(statsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const activityContainer = new ContainerBuilder()
                    .setAccentColor(0x2196F3);

                const activityPercentage = ((activity.online + activity.idle + activity.dnd) / guild.memberCount * 100).toFixed(1);

                activityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 🎯 **Activity Analysis**',
                            '',
                            `**Member Activity**`,
                            `🟢 Online: ${activity.online} (${(activity.online/guild.memberCount*100).toFixed(1)}%)`,
                            `🟡 Idle: ${activity.idle} (${(activity.idle/guild.memberCount*100).toFixed(1)}%)`,
                            `🔴 DND: ${activity.dnd} (${(activity.dnd/guild.memberCount*100).toFixed(1)}%)`,
                            `⚫ Offline: ${activity.offline} (${(activity.offline/guild.memberCount*100).toFixed(1)}%)`,
                            '',
                            `**Overall Activity Rate**`,
                            `${activityPercentage}% of members currently active`,
                            '',
                            `**Top Roles by Size**`,
                            roleStats.slice(0, 5).map((role, i) => `${i + 1}. ${role.name}: ${role.memberCount} members`).join('\n')
                        ].join('\n'))
                );

                components.push(activityContainer);
                return sendReply(components);
            }

           
            else if (subcommand === 'user') {
                const targetUser = isSlashCommand ? 
                    (interaction.options.getUser('target') || interaction.user) : 
                    (interaction.mentions.users.first() || interaction.author);
                
                const member = await guild.members.fetch(targetUser.id).catch(() => null);
                
                if (!member) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ User Not Found\n\n> User is not a member of this server\n> Please specify a valid server member')
                        );
                    return sendReply([errorContainer]);
                }

                const components = [];
                
                const userContainer = new ContainerBuilder()
                    .setAccentColor(0x9b59b6);

                userContainer.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 👤 User Analytics\n## ${member.displayName} Profile Analysis\n\n> Comprehensive user statistics and server activity\n> Member behavior and engagement insights`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(targetUser.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }))
                                .setDescription(`${targetUser.username} avatar`)
                        )
                );

                components.push(userContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const profileContainer = new ContainerBuilder()
                    .setAccentColor(0x8B5CF6);

                const joinPosition = guild.members.cache
                    .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
                    .keyArray()
                    .indexOf(member.id) + 1;

                const daysSinceJoin = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
                const daysSinceCreation = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));

                profileContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 📋 **Member Profile**',
                            '',
                            `**Basic Information**`,
                            `Username: ${targetUser.username}`,
                            `Display Name: ${member.displayName}`,
                            `User ID: ${targetUser.id}`,
                            '',
                            `**Server Statistics**`,
                            `Join Date: ${member.joinedAt.toLocaleDateString()}`,
                            `Days in Server: ${daysSinceJoin}`,
                            `Join Position: #${joinPosition}`,
                            '',
                            `**Account Information**`,
                            `Account Created: ${targetUser.createdAt.toLocaleDateString()}`,
                            `Account Age: ${daysSinceCreation} days`,
                            `Account Type: ${targetUser.bot ? 'Bot' : 'User'}`,
                            '',
                            `**Current Status**`,
                            `Status: ${member.presence?.status || 'offline'}`,
                            `Activity: ${member.presence?.activities[0]?.name || 'None'}`,
                            `Roles: ${member.roles.cache.size - 1} roles`
                        ].join('\n'))
                );

                components.push(profileContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const rolesContainer = new ContainerBuilder()
                    .setAccentColor(0x6366F1);

                const userRoles = member.roles.cache
                    .filter(role => role.name !== '@everyone')
                    .sort((a, b) => b.position - a.position)
                    .first(10);

                rolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 🎭 **Role Analysis**',
                            '',
                            `**Assigned Roles (${member.roles.cache.size - 1})**`,
                            userRoles.map(role => `• ${role.name}`).join('\n') || 'No roles assigned',
                            '',
                            `**Highest Role**`,
                            `${member.roles.highest.name} (Position: ${member.roles.highest.position})`,
                            '',
                            `**Permissions**`,
                            `Administrator: ${member.permissions.has(PermissionFlagsBits.Administrator) ? '✅' : '❌'}`,
                            `Manage Server: ${member.permissions.has(PermissionFlagsBits.ManageGuild) ? '✅' : '❌'}`,
                            `Manage Channels: ${member.permissions.has(PermissionFlagsBits.ManageChannels) ? '✅' : '❌'}`,
                            `Manage Messages: ${member.permissions.has(PermissionFlagsBits.ManageMessages) ? '✅' : '❌'}`
                        ].join('\n'))
                );

                components.push(rolesContainer);
                return sendReply(components);
            }

       
            else if (subcommand === 'activity') {
                const activity = getActivityPattern();
                const channelStats = getChannelStats();

                const components = [];
                
                const activityContainer = new ContainerBuilder()
                    .setAccentColor(0xf39c12);

                activityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🔥 Activity Heatmap\n## Server Activity Patterns\n\n> Real-time activity analysis and engagement patterns\n> Member behavior and peak usage insights')
                );

                components.push(activityContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const heatmapContainer = new ContainerBuilder()
                    .setAccentColor(0xe67e22);

              
                const createActivityBar = (value, max) => {
                    const percentage = (value / max) * 100;
                    const barLength = Math.round(percentage / 5);
                    return '█'.repeat(barLength) + '░'.repeat(20 - barLength) + ` ${percentage.toFixed(1)}%`;
                };

                const maxActivity = Math.max(activity.online, activity.idle, activity.dnd, activity.offline);

                heatmapContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 📊 **Activity Distribution**',
                            '',
                            `**Current Member Status**`,
                            `🟢 Online:  ${createActivityBar(activity.online, maxActivity)}`,
                            `🟡 Idle:    ${createActivityBar(activity.idle, maxActivity)}`,
                            `🔴 DND:     ${createActivityBar(activity.dnd, maxActivity)}`,
                            `⚫ Offline: ${createActivityBar(activity.offline, maxActivity)}`,
                            '',
                            `**Engagement Metrics**`,
                            `Active Users: ${activity.online + activity.idle + activity.dnd}`,
                            `Activity Rate: ${((activity.online + activity.idle + activity.dnd) / guild.memberCount * 100).toFixed(1)}%`,
                            `Peak Activity: ${Math.max(activity.online, activity.idle, activity.dnd)} members`,
                            '',
                            `**Channel Utilization**`,
                            `Text Channels: ${channelStats.textChannels} channels`,
                            `Voice Channels: ${channelStats.voiceChannels} channels`,
                            `Average per Channel: ${(guild.memberCount / channelStats.textChannels).toFixed(1)} members`
                        ].join('\n'))
                );

                components.push(heatmapContainer);
                return sendReply(components);
            }

        
            else if (subcommand === 'growth') {
                const growth = calculateMemberGrowth();
                const members = guild.members.cache;

         
                const now = new Date();
                const periods = {
                    '1d': members.filter(m => (now - new Date(m.joinedTimestamp)) < 24 * 60 * 60 * 1000).size,
                    '7d': members.filter(m => (now - new Date(m.joinedTimestamp)) < 7 * 24 * 60 * 60 * 1000).size,
                    '30d': members.filter(m => (now - new Date(m.joinedTimestamp)) < 30 * 24 * 60 * 60 * 1000).size,
                    '90d': members.filter(m => (now - new Date(m.joinedTimestamp)) < 90 * 24 * 60 * 60 * 1000).size
                };

                const components = [];
                
                const growthContainer = new ContainerBuilder()
                    .setAccentColor(0x00ff88);

                growthContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 📈 Growth Tracking\n## Server Growth Analysis\n\n> Member acquisition trends and growth patterns\n> Historical growth data and projections')
                );

                components.push(growthContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const trendsContainer = new ContainerBuilder()
                    .setAccentColor(0x10B981);

           
                const dailyRate = (periods['1d'] / 1).toFixed(2);
                const weeklyRate = (periods['7d'] / 7).toFixed(2);
                const monthlyRate = (periods['30d'] / 30).toFixed(2);

                trendsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 📊 **Growth Metrics**',
                            '',
                            `**Current Statistics**`,
                            `Total Members: ${guild.memberCount.toLocaleString()}`,
                            `Server Created: ${guild.createdAt.toLocaleDateString()}`,
                            `Server Age: ${Math.floor((now - guild.createdTimestamp) / (1000 * 60 * 60 * 24))} days`,
                            '',
                            `**Growth by Period**`,
                            `Last 24 Hours: +${periods['1d']} members`,
                            `Last 7 Days: +${periods['7d']} members`,
                            `Last 30 Days: +${periods['30d']} members`,
                            `Last 90 Days: +${periods['90d']} members`,
                            '',
                            `**Growth Rates**`,
                            `Daily Average: ${dailyRate} members/day`,
                            `Weekly Average: ${weeklyRate} members/day`,
                            `Monthly Average: ${monthlyRate} members/day`,
                            '',
                            `**Projections (Based on 30-day trend)**`,
                            `Next 30 Days: ~${Math.round(monthlyRate * 30)} new members`,
                            `Growth Rate: ${((periods['30d'] / guild.memberCount) * 100).toFixed(2)}% monthly`
                        ].join('\n'))
                );

                components.push(trendsContainer);
                return sendReply(components);
            }

          
            else if (subcommand === 'engagement') {
                const activity = getActivityPattern();
                const roleStats = getRoleDistribution();

                const components = [];
                
                const engagementContainer = new ContainerBuilder()
                    .setAccentColor(0xe91e63);

                engagementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 💬 Engagement Metrics\n## Member Interaction Analysis\n\n> Community engagement patterns and interaction levels\n> Activity-based engagement scoring')
                );

                components.push(engagementContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const metricsContainer = new ContainerBuilder()
                    .setAccentColor(0xC2185B);

                const engagementScore = ((activity.online + activity.idle * 0.7 + activity.dnd * 0.5) / guild.memberCount * 100).toFixed(1);
                const roleEngagement = (roleStats.reduce((acc, role) => acc + role.memberCount, 0) / guild.memberCount * 100).toFixed(1);

                metricsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 🎯 **Engagement Analysis**',
                            '',
                            `**Overall Engagement Score**`,
                            `${engagementScore}% - ${engagementScore > 70 ? 'Excellent' : engagementScore > 50 ? 'Good' : engagementScore > 30 ? 'Average' : 'Needs Improvement'}`,
                            '',
                            `**Activity Breakdown**`,
                            `Highly Active: ${activity.online} members (${(activity.online/guild.memberCount*100).toFixed(1)}%)`,
                            `Moderately Active: ${activity.idle} members (${(activity.idle/guild.memberCount*100).toFixed(1)}%)`,
                            `Focused Activity: ${activity.dnd} members (${(activity.dnd/guild.memberCount*100).toFixed(1)}%)`,
                            '',
                            `**Role Participation**`,
                            `Members with Roles: ${roleEngagement}%`,
                            `Average Roles per Member: ${(guild.roles.cache.size / guild.memberCount).toFixed(1)}`,
                            '',
                            `**Engagement Indicators**`,
                            `Voice Channel Usage: ${guild.channels.cache.filter(c => c.type === 2 && c.members?.size > 0).size} active`,
                            `Text Channel Spread: ${guild.channels.cache.filter(c => c.type === 0).size} available`,
                            `Community Events: ${guild.scheduledEvents?.cache.size || 0} scheduled`
                        ].join('\n'))
                );

                components.push(metricsContainer);
                return sendReply(components);
            }

      
            else if (subcommand === 'channels') {
                const channels = guild.channels.cache;
                const textChannels = channels.filter(c => c.type === 0);
                const voiceChannels = channels.filter(c => c.type === 2);
                const categories = channels.filter(c => c.type === 4);

                const components = [];
                
                const channelsContainer = new ContainerBuilder()
                    .setAccentColor(0x9c27b0);

                channelsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 📺 Channel Performance\n## Channel Usage and Statistics\n\n> Comprehensive channel analysis and performance metrics\n> Channel activity and member distribution')
                );

                components.push(channelsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x7B1FA2);

            
                const activeVoiceChannels = voiceChannels
                    .filter(c => c.members?.size > 0)
                    .sort((a, b) => b.members.size - a.members.size)
                    .first(5);

               
                const categoryStats = categories.map(category => ({
                    name: category.name,
                    channels: channels.filter(c => c.parentId === category.id).size
                })).sort((a, b) => b.channels - a.channels);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 📊 **Channel Overview**',
                            '',
                            `**Channel Distribution**`,
                            `Text Channels: ${textChannels.size}`,
                            `Voice Channels: ${voiceChannels.size}`,
                            `Categories: ${categories.size}`,
                            `Total Channels: ${channels.size}`,
                            '',
                            `**Active Voice Channels**`,
                            activeVoiceChannels.size > 0 ? 
                                activeVoiceChannels.map(c => `🔊 ${c.name}: ${c.members.size} members`).join('\n') :
                                'No active voice channels',
                            '',
                            `**Channel Organization**`,
                            categoryStats.slice(0, 5).map(cat => `📁 ${cat.name}: ${cat.channels} channels`).join('\n') || 'No categories',
                            '',
                            `**Performance Metrics**`,
                            `Channels per Member: ${(channels.size / guild.memberCount).toFixed(2)}`,
                            `Voice Channel Utilization: ${((activeVoiceChannels.size / voiceChannels.size) * 100).toFixed(1)}%`,
                            `Average Category Size: ${categoryStats.length > 0 ? (categoryStats.reduce((acc, cat) => acc + cat.channels, 0) / categoryStats.length).toFixed(1) : 0} channels`
                        ].join('\n'))
                );

                components.push(statsContainer);
                return sendReply(components);
            }

         
            else if (subcommand === 'dashboard') {
                const growth = calculateMemberGrowth();
                const activity = getActivityPattern();
                const channelStats = getChannelStats();

                const components = [];
                
                const dashboardContainer = new ContainerBuilder()
                    .setAccentColor(0x667eea);

                dashboardContainer.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🎛️ Analytics Dashboard\n## ${guild.name} Overview\n\n> Interactive analytics dashboard with key metrics\n> Real-time server insights and performance indicators`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(guild.iconURL({ format: 'png', dynamic: true, size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png')
                                .setDescription('Server analytics dashboard')
                        )
                );

                components.push(dashboardContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const quickStatsContainer = new ContainerBuilder()
                    .setAccentColor(0x6366F1);

                const activityRate = ((activity.online + activity.idle + activity.dnd) / guild.memberCount * 100).toFixed(1);
                const engagementScore = ((activity.online + activity.idle * 0.7 + activity.dnd * 0.5) / guild.memberCount * 100).toFixed(1);

                quickStatsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '## 📊 **Key Metrics Dashboard**',
                            '',
                            `**📈 Growth Indicators**`,
                            `Total Members: ${guild.memberCount.toLocaleString()}`,
                            `New Today: ${growth.today} | This Week: ${growth.thisWeek} | This Month: ${growth.thisMonth}`,
                            '',
                            `**⚡ Activity Metrics**`,
                            `Activity Rate: ${activityRate}% | Engagement Score: ${engagementScore}%`,
                            `Online: ${activity.online} | Idle: ${activity.idle} | DND: ${activity.dnd}`,
                            '',
                            `**🏗️ Infrastructure**`,
                            `Text: ${channelStats.textChannels} | Voice: ${channelStats.voiceChannels} | Categories: ${channelStats.categories}`,
                            `Total Roles: ${guild.roles.cache.size} | Premium Tier: ${guild.premiumTier}`,
                            '',
                            `**🎯 Quick Actions**`,
                            `Use \`/analytics server\` for detailed overview`,
                            `Use \`/analytics growth\` for growth analysis`,
                            `Use \`/analytics engagement\` for engagement metrics`,
                            `Use \`/analytics channels\` for channel performance`
                        ].join('\n'))
                );

                components.push(quickStatsContainer);
                return sendReply(components);
            }

        
            else {
                const components = [];
                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x667eea);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '# 📊 Analytics Command Center',
                            '## Comprehensive Server Insights - Zero External APIs',
                            '',
                            '> Professional analytics using Discord.js built-in data',
                            '> Real-time insights without external dependencies',
                            '',
                            '**📈 Core Analytics:**',
                            '`/analytics server` - Complete server overview',
                            '`/analytics user [@user]` - Individual user analysis',
                            '`/analytics activity` - Activity heatmaps and patterns',
                            '`/analytics growth` - Growth tracking and trends',
                            '',
                            '**🎯 Advanced Metrics:**',
                            '`/analytics engagement` - Engagement analysis',
                            '`/analytics channels` - Channel performance stats',
                            '`/analytics commands` - Bot command usage (coming soon)',
                            '`/analytics dashboard` - Interactive overview',
                            '',
                            '**🔧 Tools & Reports:**',
                            '`/analytics export` - Export data to file',
                            '`/analytics compare` - Time period comparison',
                            '`/analytics reports` - Custom report generation',
                            '`/analytics predictions` - AI-powered insights',
                            '',
                            '**✅ Features:**',
                            '• Real-time Discord data analysis',
                            '• No external API dependencies',
                            '• Built-in permission management',
                            '• Comprehensive member insights',
                            '• Growth and engagement tracking'
                        ].join('\n'))
                );

                return sendReply([helpContainer]);
            }

        } catch (error) {
            console.error('Analytics command error:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Analytics Error\n\n> Failed to generate analytics data\n> Please try again or contact support')
                );

            const messageData = { components: [errorContainer], flags: MessageFlags.IsComponentsV2 };
            return isSlashCommand ? interaction.editReply(messageData) : interaction.reply(messageData);
        }
    },
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