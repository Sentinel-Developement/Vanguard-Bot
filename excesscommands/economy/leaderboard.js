const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { Economy } = require('../../models/economy/economy');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    description: 'View server leaderboards with v2 components',
    usage: '!leaderboard [wealth/level/racing/family]',
    async execute(message, args) {
        try {
            const type = args[0]?.toLowerCase() || 'wealth';
            const validTypes = ['wealth', 'level', 'racing', 'family'];
            
            if (!validTypes.includes(type)) {
                const components = [];

                const invalidTypeContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidTypeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Leaderboard Type\n## PLEASE SELECT VALID CATEGORY\n\n> **\`${type}\`** is not a valid leaderboard category!\n> Choose from the available options below.`)
                );

                components.push(invalidTypeContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const typesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                typesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏆 **AVAILABLE LEADERBOARDS**\n\n**💰 \`wealth\`** - Total wealth (wallet + bank + family vault)\n**⭐ \`level\`** - Player levels and experience points\n**🏁 \`racing\`** - Racing wins and success rates\n**👨‍👩‍👧‍👦 \`family\`** - Family bonds and household sizes\n\n**Example:** \`!leaderboard wealth\``)
                );

                components.push(typesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let leaderboardData = [];
            let title = '';
            let emoji = '';
            let description = '';

        
            switch (type) {
                case 'wealth':
                    leaderboardData = await Economy.aggregate([
                        { $match: { guildId: message.guild.id } },
                        { $addFields: { totalWealth: { $add: ['$wallet', '$bank', '$familyVault'] } } },
                        { $sort: { totalWealth: -1 } },
                        { $limit: 15 }
                    ]);
                    title = 'Wealth Champions';
                    emoji = '💰';
                    description = 'Top players by total wealth (wallet + bank + family vault)';
                    break;

                case 'level':
                    leaderboardData = await Economy.find({ guildId: message.guild.id })
                        .sort({ level: -1, experience: -1 })
                        .limit(15);
                    title = 'Experience Leaders';
                    emoji = '⭐';
                    description = 'Top players by level and experience points';
                    break;

                case 'racing':
                    leaderboardData = await Economy.find({ guildId: message.guild.id })
                        .sort({ 'racingStats.wins': -1 })
                        .limit(15);
                    title = 'Racing Champions';
                    emoji = '🏁';
                    description = 'Top players by racing victories and win rates';
                    break;

                case 'family':
                    leaderboardData = await Economy.find({ 
                        guildId: message.guild.id,
                        'familyMembers.0': { $exists: true }
                    })
                    .sort({ familyBond: -1 })
                    .limit(15);
                    title = 'Family Leaders';
                    emoji = '👨‍👩‍👧‍👦';
                    description = 'Top players by family bonds and household management';
                    break;
            }

            if (!leaderboardData || leaderboardData.length === 0) {
                const components = [];

                const noDataContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                noDataContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📊 No Leaderboard Data\n## CATEGORY CURRENTLY EMPTY\n\n> No data found for the **${type}** leaderboard!\n> Be the first to make your mark on this leaderboard!`)
                );

                components.push(noDataContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const encouragementContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                encouragementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚀 **GET STARTED**\n\n**💡 Tips to appear on this leaderboard:**\n> • Participate in economy activities\n> • Build wealth through work and businesses\n> • Level up through regular activity\n> • Start racing and building family relationships\n\n> Your journey to the top starts now!`)
                );

                components.push(encouragementContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const components = [];

          
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0xFFD700);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${emoji} ${title}\n## ${message.guild.name.toUpperCase()} LEADERBOARD\n\n> ${description}\n> Celebrating the top performers in our economy!`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

         
            const podiumContainer = new ContainerBuilder()
                .setAccentColor(0xFFC107);

            podiumContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏆 **TOP 3 PODIUM**')
            );

            const topThree = leaderboardData.slice(0, 3);
            topThree.forEach((profile, index) => {
                const user = message.guild.members.cache.get(profile.userId);
                const username = user ? user.displayName : 'Unknown User';
                const medal = ['🥇', '🥈', '🥉'][index];
                
                let valueText = '';
                switch (type) {
                    case 'wealth':
                        valueText = `$${profile.totalWealth.toLocaleString()}`;
                        break;
                    case 'level':
                        valueText = `Level ${profile.level} (${profile.experience} XP)`;
                        break;
                    case 'racing':
                        const totalRaces = profile.racingStats.totalRaces || (profile.racingStats.wins + profile.racingStats.losses);
                        const winRate = totalRaces > 0 ? ((profile.racingStats.wins / totalRaces) * 100).toFixed(1) : '0.0';
                        valueText = `${profile.racingStats.wins} wins (${winRate}% rate)`;
                        break;
                    case 'family':
                        valueText = `${profile.familyBond}% bond (${profile.familyMembers.length} members)`;
                        break;
                }

                podiumContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${medal} **${username}**\n> ${valueText}`)
                );
            });

            components.push(podiumContainer);

        
            if (leaderboardData.length > 3) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const remainingData = leaderboardData.slice(3);
                const rankingGroups = [];
                
                for (let i = 0; i < remainingData.length; i += 6) {
                    rankingGroups.push(remainingData.slice(i, i + 6));
                }

                rankingGroups.forEach((group, groupIndex) => {
                    const rankingContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6);

                    rankingContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📊 **RANKINGS ${groupIndex === 0 ? '4-9' : '10-15'}**`)
                    );

                    const rankingText = group.map((profile, index) => {
                        const actualRank = 4 + (groupIndex * 6) + index;
                        const user = message.guild.members.cache.get(profile.userId);
                        const username = user ? user.displayName : 'Unknown User';
                        
                        let valueText = '';
                        switch (type) {
                            case 'wealth':
                                valueText = `$${profile.totalWealth.toLocaleString()}`;
                                break;
                            case 'level':
                                valueText = `Level ${profile.level} (${profile.experience} XP)`;
                                break;
                            case 'racing':
                                const totalRaces = profile.racingStats.totalRaces || (profile.racingStats.wins + profile.racingStats.losses);
                                const winRate = totalRaces > 0 ? ((profile.racingStats.wins / totalRaces) * 100).toFixed(1) : '0.0';
                                valueText = `${profile.racingStats.wins} wins (${winRate}%)`;
                                break;
                            case 'family':
                                valueText = `${profile.familyBond}% bond (${profile.familyMembers.length} members)`;
                                break;
                        }

                        return `**${actualRank}.** ${username}\n> ${valueText}`;
                    }).join('\n\n');

                    rankingContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(rankingText)
                    );

                    components.push(rankingContainer);

                    if (groupIndex < rankingGroups.length - 1) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    }
                });
            }

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0x17A2B8);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📈 **LEADERBOARD STATISTICS**')
            );

            let statsText = '';
            switch (type) {
                case 'wealth':
                    const totalWealth = leaderboardData.reduce((sum, p) => sum + p.totalWealth, 0);
                    const averageWealth = totalWealth / leaderboardData.length;
                    statsText = `**💰 Combined Top 15 Wealth:** \`$${totalWealth.toLocaleString()}\`\n**📊 Average Top 15 Wealth:** \`$${Math.floor(averageWealth).toLocaleString()}\`\n**🏆 Wealth Gap:** \`$${(leaderboardData[0].totalWealth - leaderboardData[leaderboardData.length - 1].totalWealth).toLocaleString()}\``;
                    break;
                case 'level':
                    const averageLevel = leaderboardData.reduce((sum, p) => sum + p.level, 0) / leaderboardData.length;
                    const totalXP = leaderboardData.reduce((sum, p) => sum + p.experience, 0);
                    statsText = `**⭐ Average Level:** \`${averageLevel.toFixed(1)}\`\n**🎯 Total Experience:** \`${totalXP.toLocaleString()} XP\`\n**📊 Level Range:** \`${leaderboardData[leaderboardData.length - 1].level} - ${leaderboardData[0].level}\``;
                    break;
                case 'racing':
                    const totalWins = leaderboardData.reduce((sum, p) => sum + p.racingStats.wins, 0);
                    const averageWins = totalWins / leaderboardData.length;
                    statsText = `**🏁 Total Wins:** \`${totalWins}\`\n**📊 Average Wins:** \`${averageWins.toFixed(1)}\`\n**🏆 Top Racer:** \`${leaderboardData[0].racingStats.wins} wins\``;
                    break;
                case 'family':
                    const averageBond = leaderboardData.reduce((sum, p) => sum + p.familyBond, 0) / leaderboardData.length;
                    const totalMembers = leaderboardData.reduce((sum, p) => sum + p.familyMembers.length, 0);
                    statsText = `**❤️ Average Family Bond:** \`${averageBond.toFixed(1)}%\`\n**👥 Total Family Members:** \`${totalMembers}\`\n**🏠 Largest Family:** \`${Math.max(...leaderboardData.map(p => p.familyMembers.length))} members\``;
                    break;
            }

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`${statsText}\n\n**📊 Players Ranked:** \`${leaderboardData.length}\`\n**📅 Last Updated:** \`${new Date().toLocaleString()}\``)
            );

            components.push(statsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x6F42C1);

            let tipText = '';
            switch (type) {
                case 'wealth':
                    tipText = '💡 **Wealth Building Tips:** Work regularly, run businesses, invest in properties, and save money in your bank and family vault!';
                    break;
                case 'level':
                    tipText = '💡 **Leveling Tips:** Complete daily activities, work consistently, participate in all economy features to gain XP!';
                    break;
                case 'racing':
                    tipText = '💡 **Racing Tips:** Buy better cars, maintain their condition, and practice regularly to improve your win rate!';
                    break;
                case 'family':
                    tipText = '💡 **Family Tips:** Take regular family trips, build strong relationships, and expand your household size!';
                    break;
            }

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **CLIMB THE RANKS**\n\n${tipText}\n\n**🔄 Other Leaderboards:** Try \`!leaderboard wealth\`, \`!leaderboard level\`, \`!leaderboard racing\`, or \`!leaderboard family\``)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in leaderboard command:', error);

        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **LEADERBOARD ERROR**\n\nSomething went wrong while generating the leaderboard. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
