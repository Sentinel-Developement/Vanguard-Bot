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
const levelingController = require('../../models/leveling/levelingController');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View server leveling leaderboards')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of leaderboard to display')
                .addChoices(
                    { name: '🏆 Total XP - Overall Rankings', value: 'xp' },
                    { name: '📅 Weekly XP - This Week', value: 'weekly' },
                    { name: '🎤 Voice Time - Most Active', value: 'voice_time' },
                    { name: '🔊 Voice XP - Voice Rankings', value: 'voice_xp' },
                    { name: '💬 Messages - Chat Activity', value: 'messages' },
                    { name: '🔥 Daily Streak - Consistency', value: 'streak' }
                )
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number to view')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const type = interaction.options.getString('type') || 'xp';
            const page = interaction.options.getInteger('page') || 1;
            const limit = 10;

            const leaderboardData = await levelingController.getLeaderboard(
                interaction.guild.id, 
                type, 
                page, 
                limit
            );

            if (!leaderboardData || leaderboardData.length === 0) {
                const noDataContainer = new ContainerBuilder()
                    .setAccentColor(0xFF4757)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('**📊 NO LEADERBOARD DATA**')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent([
                                        `**📈 Leaderboard Type:** ${type.toUpperCase()}`,
                                        `**📄 Page:** ${page}`,
                                        `**💡 Status:** No data available for this category`,
                                        `**🚀 Get Started:** Members need to be active to appear here!`
                                    ].join('\n'))
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(interaction.guild.iconURL({ dynamic: true, size: 128 }))
                                    .setDescription(`${interaction.guild.name} Leaderboard`)
                            )
                    );

                return await interaction.editReply({
                    components: [noDataContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const typeInfo = {
                'xp': { title: 'Total XP Rankings', emoji: '🏆', field: 'totalXp' },
                'weekly': { title: 'Weekly XP Rankings', emoji: '📅', field: 'weeklyXp' },
                'voice_time': { title: 'Voice Time Rankings', emoji: '🎤', field: 'voiceStats.totalMinutes' },
                'voice_xp': { title: 'Voice XP Rankings', emoji: '🔊', field: 'voiceStats.voiceXp' },
                'messages': { title: 'Message Rankings', emoji: '💬', field: 'messageCount' },
                'streak': { title: 'Daily Streak Rankings', emoji: '🔥', field: 'streaks.daily' }
            };

            const currentType = typeInfo[type];
            const startRank = (page - 1) * limit + 1;

           
            let leaderboardText = '';
            for (let i = 0; i < leaderboardData.length; i++) {
                const user = leaderboardData[i];
                const rank = startRank + i;
                const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
                
                let value;
                switch (type) {
                    case 'xp':
                        value = `${user.totalXp.toLocaleString()} XP (Level ${user.level})`;
                        break;
                    case 'weekly':
                        value = `${user.weeklyXp.toLocaleString()} XP`;
                        break;
                    case 'voice_time':
                        const hours = Math.floor(user.voiceStats.totalMinutes / 60);
                        const minutes = user.voiceStats.totalMinutes % 60;
                        value = `${hours}h ${minutes}m`;
                        break;
                    case 'voice_xp':
                        value = `${user.voiceStats.voiceXp.toLocaleString()} Voice XP`;
                        break;
                    case 'messages':
                        value = `${user.messageCount.toLocaleString()} messages`;
                        break;
                    case 'streak':
                        value = `${user.streaks.daily} day streak`;
                        break;
                }

                leaderboardText += `${rankEmoji} **#${rank}** <@${user.userId}>\n    ${value}\n\n`;
            }

            const containerBuilder = new ContainerBuilder()
                .setAccentColor(0x3B82F6)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**${currentType.emoji} ${currentType.title.toUpperCase()}**`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent([
                                    `**📊 Server:** ${interaction.guild.name}`,
                                    `**📄 Page:** ${page}`,
                                    `**👥 Showing:** ${leaderboardData.length} members`,
                                    `**📈 Category:** ${currentType.title}`
                                ].join('\n'))
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(interaction.guild.iconURL({ dynamic: true, size: 128 }))
                                .setDescription(`${interaction.guild.name} Rankings`)
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(leaderboardText)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '**💡 Navigation Tips:**',
                            '• Use `/leaderboard page:2` for next page',
                            '• Try different types: `xp`, `weekly`, `voice_time`, `messages`, `streak`',
                            '• Use `/rank` to see your personal stats'
                        ].join('\n'))
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Requested by ${interaction.user.username} • ${new Date().toLocaleString()}*`)
                );

            await interaction.editReply({
                components: [containerBuilder],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Leaderboard command error:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**⚠️ LEADERBOARD ERROR**')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '**🔧 Error Details:**',
                            'Failed to fetch leaderboard data',
                            '',
                            '**💡 Try Again:**',
                            '• Check if leveling system is enabled',
                            '• Try a different leaderboard type',
                            '• Contact support if issue persists'
                        ].join('\n'))
                );

            await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
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