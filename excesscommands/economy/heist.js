const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Heist } = require('../../models/economy/economy');
const { HEIST_TARGETS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'heist',
    aliases: ['heists'],
    description: 'View active heists and heist management with v2 components',
    usage: '!heist [status/history/leaderboard]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const action = args[0]?.toLowerCase();
            
            if (!action || action === 'status') {
              
                const activeHeists = await Heist.find({
                    heistId: { $in: profile.activeHeists },
                    guildId: message.guild.id,
                    status: { $in: ['planning', 'recruiting', 'ready'] }
                });
                
                const components = [];
                
                if (activeHeists.length === 0) {
                 
                    const noHeistsContainer = new ContainerBuilder()
                        .setAccentColor(0x607D8B);

                    noHeistsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🎯 No Active Heists\n## READY FOR CRIMINAL VENTURES\n\n> You're not currently involved in any heists. Time to plan your next big score!\n> The criminal underworld awaits your strategic mind and daring spirit.`)
                    );

                    components.push(noHeistsContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                  
                    const startContainer = new ContainerBuilder()
                        .setAccentColor(0x3498DB);

                    startContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 🎭 **GET STARTED WITH HEISTS**')
                    );

                    startContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🆕 Plan a Heist:** \`!planheist\` - Organize your own criminal operation\n**🤝 Join Others:** \`!joinheist <id> <role>\` - Join existing heist crews\n**📚 Learn Roles:** Each heist needs hackers, lookouts, drivers, and muscle\n**💡 Strategy:** Choose targets based on your skill level and heat`)
                    );

                    components.push(startContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                 
                    const statsContainer = new ContainerBuilder()
                        .setAccentColor(0x9B59B6);

                    statsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📊 **YOUR CRIMINAL RECORD**')
                    );

                    const successRate = (profile.completedHeists + profile.failedHeists) > 0 ? 
                        Math.floor((profile.completedHeists / (profile.completedHeists + profile.failedHeists)) * 100) : 0;

                    statsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✅ Completed Heists:** \`${profile.completedHeists}\`\n**❌ Failed Heists:** \`${profile.failedHeists}\`\n**📈 Success Rate:** \`${successRate}%\`\n**🔥 Heat Level:** \`${profile.heatLevel}%\`\n**🎓 Heist Skill:** \`${profile.heistSkill}%\``)
                    );

               
                    if (profile.jailTime && profile.jailTime > new Date()) {
                        const hoursLeft = Math.ceil((profile.jailTime - new Date()) / (1000 * 60 * 60));
                        statsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🚔 Jail Status:** \`${hoursLeft} hours remaining\`\n\n> You're currently behind bars! Wait for release before planning new heists.`)
                        );
                    } else {
                        statsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🚔 Legal Status:** \`Free to operate\`\n\n> You're ready to plan and execute new criminal ventures!`)
                        );
                    }

                    components.push(statsContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

            
                const activeHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                activeHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Active Heist Operations\n## CRIMINAL ENTERPRISES IN PROGRESS\n\n> You're currently involved in **${activeHeists.length}** active heist${activeHeists.length !== 1 ? 's' : ''}!\n> Manage your operations carefully to ensure successful outcomes.`)
                );

                components.push(activeHeaderContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                activeHeists.forEach((heist, index) => {
                    const target = HEIST_TARGETS[heist.targetType];
                    const memberRole = heist.members.find(m => m.userId === message.author.id)?.role || 'Unknown';
                    const timeLeft = heist.plannedDate ? Math.max(0, Math.floor((heist.plannedDate - new Date()) / (1000 * 60 * 60))) : 0;
                    const individualPayout = Math.floor(heist.potential_payout / heist.requiredMembers);

                    const heistContainer = new ContainerBuilder()
                        .setAccentColor(0xE91E63);

                    heistContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏢 **${heist.targetName}** (${heist.status.toUpperCase()})`)
                    );

                    heistContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🎭 Your Role:** \`${memberRole}\`\n**👥 Team Status:** \`${heist.members.length}/${heist.requiredMembers} members\`\n**💰 Your Cut:** \`$${individualPayout.toLocaleString()}\`\n**🎯 Target Type:** \`${heist.targetType}\`\n**🆔 Heist ID:** \`${heist.heistId}\``)
                    );

                    if (timeLeft > 0) {
                        heistContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**⏰ Time Until Ready:** \`${timeLeft} hours\`\n**📅 Planned Date:** \`${heist.plannedDate.toLocaleString()}\`\n\n> **Status:** Preparation phase - gathering intel and resources`)
                        );
                    } else {
                        heistContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🚨 Status:** \`READY TO EXECUTE!\`\n**⚡ Action Required:** Use \`!executeheist ${heist.heistId}\` to begin\n\n> **Alert:** Your crew is ready - strike while the iron is hot!`)
                        );
                    }

                    components.push(heistContainer);

                    if (index < activeHeists.length - 1) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    }
                });

             
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x795548);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **CRIMINAL STATISTICS**\n\n**✅ Completed:** \`${profile.completedHeists}\` • **❌ Failed:** \`${profile.failedHeists}\`\n**🔥 Heat Level:** \`${profile.heatLevel}%\` • **🎓 Skill:** \`${profile.heistSkill}%\`\n\n> Higher skill and lower heat improve your success chances!`)
                );

                components.push(statsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (action === 'history') {
                const completedHeists = await Heist.find({
                    guildId: message.guild.id,
                    'members.userId': message.author.id,
                    status: { $in: ['completed', 'failed'] }
                }).sort({ executionDate: -1 }).limit(10);
                
                if (completedHeists.length === 0) {
                    const components = [];

                    const noHistoryContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noHistoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📜 No Heist History\n## CLEAN CRIMINAL RECORD\n\n> You haven't completed any heists yet! Your criminal career is just beginning.\n> Start planning heists to build your reputation in the underworld.`)
                    );

                    components.push(noHistoryContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const components = [];

                
                const historyHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                historyHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📜 Criminal History\n## YOUR HEIST LEGACY\n\n> Here's your complete criminal record showing all completed and failed operations.\n> Learn from past experiences to improve future success rates.`)
                );

                components.push(historyHeaderContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                
                const historyGroups = [];
                for (let i = 0; i < completedHeists.length; i += 4) {
                    historyGroups.push(completedHeists.slice(i, i + 4));
                }

                historyGroups.forEach((group, groupIndex) => {
                    const historyContainer = new ContainerBuilder()
                        .setAccentColor(0xAB47BC);

                    historyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🎭 **HEIST RECORDS ${groupIndex > 0 ? `(Continued)` : ''}**`)
                    );

                    const historyText = group.map(heist => {
                        const success = heist.status === 'completed';
                        const memberRole = heist.members.find(m => m.userId === message.author.id)?.role;
                        const outcome = success ? 
                            `✅ **SUCCESS** - Earned \`$${Math.floor(heist.actual_payout / heist.members.length).toLocaleString()}\`` :
                            `❌ **FAILED** - Jail time and fines`;
                        
                        return `**${heist.targetName}** (${memberRole})\n> ${outcome}\n> **Date:** \`${new Date(heist.executionDate).toLocaleDateString()}\``;
                    }).join('\n\n');

                    historyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(historyText)
                    );

                    components.push(historyContainer);

                    if (groupIndex < historyGroups.length - 1) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    }
                });

        
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const analysisContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                const successRate = profile.completedHeists > 0 ? 
                    Math.floor((profile.completedHeists / (profile.completedHeists + profile.failedHeists)) * 100) : 0;

                analysisContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📈 **PERFORMANCE ANALYSIS**\n\n**🎯 Success Rate:** \`${successRate}%\`\n**📊 Total Operations:** \`${profile.completedHeists + profile.failedHeists}\`\n**💰 Successful Heists:** \`${profile.completedHeists}\`\n**🚫 Failed Attempts:** \`${profile.failedHeists}\`\n\n**💡 Improvement Tips:** ${successRate < 70 ? 'Focus on skill building and heat management' : 'Excellent track record - keep up the strategic planning!'}`)
                );

                components.push(analysisContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (action === 'leaderboard') {
                const topPlayers = await EconomyManager.Economy.find({ guildId: message.guild.id })
                    .sort({ completedHeists: -1 })
                    .limit(15);
                    
                if (topPlayers.length === 0) {
                    const components = [];

                    const noDataContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noDataContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏆 No Heist Data\n## CRIMINAL UNDERWORLD AWAITS\n\n> No one has completed any heists yet! Be the first to establish your criminal empire.\n> The leaderboard will track the most successful criminal masterminds.`)
                    );

                    components.push(noDataContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const components = [];

           
                const leaderboardHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                leaderboardHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏆 Criminal Masterminds Leaderboard\n## TOP HEIST OPERATIVES\n\n> These are the most successful criminals in **${message.guild.name}**.\n> Their skills, success rates, and completed operations set the standard for the underworld.`)
                );

                components.push(leaderboardHeaderContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const podiumContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                podiumContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🥇 **TOP 3 CRIMINAL MASTERMINDS**')
                );

                const topThree = topPlayers.slice(0, 3);
                topThree.forEach((player, index) => {
                    const user = message.guild.members.cache.get(player.userId);
                    const username = user ? user.displayName : 'Unknown Criminal';
                    const medal = ['🥇', '🥈', '🥉'][index];
                    const successRate = player.completedHeists > 0 ? 
                        Math.floor((player.completedHeists / (player.completedHeists + player.failedHeists)) * 100) : 0;

                    podiumContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`${medal} **${username}**\n> **Completed:** \`${player.completedHeists}\` • **Success Rate:** \`${successRate}%\`\n> **Skill:** \`${player.heistSkill}%\` • **Heat:** \`${player.heatLevel}%\``)
                    );
                });

                components.push(podiumContainer);

          
                if (topPlayers.length > 3) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const remainingPlayers = topPlayers.slice(3);
                    const rankingGroups = [];
                    
                    for (let i = 0; i < remainingPlayers.length; i += 6) {
                        rankingGroups.push(remainingPlayers.slice(i, i + 6));
                    }

                    rankingGroups.forEach((group, groupIndex) => {
                        const rankingContainer = new ContainerBuilder()
                            .setAccentColor(0x95A5A6);

                        rankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🎯 **RANKINGS ${groupIndex === 0 ? '4-9' : '10-15'}**`)
                        );

                        const rankingText = group.map((player, index) => {
                            const actualRank = 4 + (groupIndex * 6) + index;
                            const user = message.guild.members.cache.get(player.userId);
                            const username = user ? user.displayName : 'Unknown Criminal';
                            const successRate = player.completedHeists > 0 ? 
                                Math.floor((player.completedHeists / (player.completedHeists + player.failedHeists)) * 100) : 0;

                            return `**${actualRank}.** ${username}\n> **Heists:** \`${player.completedHeists}\` • **Rate:** \`${successRate}%\` • **Skill:** \`${player.heistSkill}%\``;
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

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

      
            const components = [];

            const invalidContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            invalidContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Invalid Heist Action\n## UNKNOWN COMMAND\n\n> **\`${action}\`** is not a valid heist action!\n> Choose from the available options below.`)
            );

            components.push(invalidContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const optionsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            optionsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **AVAILABLE HEIST COMMANDS**\n\n**\`!heist\`** or **\`!heist status\`** - View your active heists\n**\`!heist history\`** - See your completed heist record\n**\`!heist leaderboard\`** - Check top criminal masterminds\n\n**Additional Commands:**\n> • \`!planheist\` - Plan a new heist operation\n> • \`!joinheist <id> <role>\` - Join an existing heist crew`)
            );

            components.push(optionsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in heist command:', error);

       
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **HEIST SYSTEM ERROR**\n\nSomething went wrong while accessing heist information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
