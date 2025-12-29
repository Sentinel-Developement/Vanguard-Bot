const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Heist } = require('../../models/economy/economy');
const { HEIST_TARGETS, HEIST_EQUIPMENT } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'planheist',
    aliases: ['heist-plan', 'newheist'],
    description: 'Plan a heist and recruit team members with v2 components',
    usage: '!planheist <target>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

             
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Available Heist Targets\n## CRIMINAL OPPORTUNITIES AWAIT\n\n> Choose your target carefully! Each heist has different requirements, risks, and rewards.\n> Plan strategically to maximize your chances of success and minimize law enforcement response.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const targetsByDifficulty = {};
                Object.entries(HEIST_TARGETS).forEach(([id, target]) => {
                    const difficulty = target.difficulty;
                    if (!targetsByDifficulty[difficulty]) {
                        targetsByDifficulty[difficulty] = [];
                    }
                    targetsByDifficulty[difficulty].push([id, target]);
                });

             
                Object.entries(targetsByDifficulty).sort(([a], [b]) => a - b).forEach(([difficulty, targets]) => {
                    const difficultyContainer = new ContainerBuilder()
                        .setAccentColor(getDifficultyColor(parseInt(difficulty)));

                    const difficultyEmoji = getDifficultyEmoji(parseInt(difficulty));
                    difficultyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${difficultyEmoji} **DIFFICULTY ${difficulty}/5 TARGETS**`)
                    );

                    targets.forEach(([id, target]) => {
                        const payoutRange = `$${target.payout[0].toLocaleString()}-${target.payout[1].toLocaleString()}`;
                        const targetText = `**\`${id}\`** - ${target.name}\n` +
                            `> **💰 Payout Range:** \`${payoutRange}\`\n` +
                            `> **👥 Team Size:** \`${target.requiredMembers} specialists\`\n` +
                            `> **📊 Base Success:** \`${target.successChance}%\`\n` +
                            `> **⏰ Planning Time:** \`${target.planningTime} hours\`\n` +
                            `> **🎭 Required Roles:** ${target.requiredRoles.join(', ')}`;

                        difficultyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(targetText)
                        );
                    });

                    components.push(difficultyContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

            
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **HOW TO PLAN A HEIST**\n\n**Command:** \`!planheist <target_id>\`\n**Example:** \`!planheist bank\`\n\n**💡 Planning Tips:**\n> • Start with lower difficulty targets to build experience\n> • Ensure you have enough funds for equipment\n> • Check your heat level requirements\n> • Plan when you have time to recruit a full crew\n> • Higher difficulty = higher rewards but more risk`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const targetType = args[0].toLowerCase();
            const targetData = HEIST_TARGETS[targetType];
            
            if (!targetData) {
                const components = [];

                const invalidTargetContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Heist Target\n## UNRECOGNIZED TARGET\n\n> **\`${targetType}\`** is not a valid heist target!\n> Choose from the available criminal opportunities below.`)
                );

                components.push(invalidTargetContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validTargetsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const targetsList = Object.entries(HEIST_TARGETS).map(([id, target]) => 
                    `**\`${id}\`** - ${target.name} (Difficulty ${target.difficulty}/5)`
                ).join('\n');

                validTargetsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **VALID HEIST TARGETS**\n\n${targetsList}\n\n**💡 Try:** \`!planheist ${Object.keys(HEIST_TARGETS)[0]}\``)
                );

                components.push(validTargetsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            
            if (profile.jailTime && profile.jailTime > new Date()) {
                const hoursLeft = Math.ceil((profile.jailTime - new Date()) / (1000 * 60 * 60));
                const components = [];

                const jailContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                jailContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚔 Currently Incarcerated\n## CRIMINAL PLANNING RESTRICTED\n\n> You cannot plan heists while serving time!\n> **Remaining Sentence:** \`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}\``)
                );

                components.push(jailContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const releaseContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                releaseContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏰ **RELEASE INFORMATION**\n\n**Expected Release:** \`${profile.jailTime.toLocaleString()}\`\n**Target Interest:** \`${targetData.name}\`\n\n**💡 Use This Time:**\n> • Study heist planning strategies\n> • Network with potential crew members\n> • Plan your post-release criminal activities\n> • Build anticipation for your return to crime`)
                );

                components.push(releaseContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        
            if (profile.heatLevel < targetData.minHeatLevel) {
                const components = [];

                const heatRequirementContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                heatRequirementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔥 Insufficient Criminal Reputation\n## HEAT LEVEL TOO LOW\n\n> You need **${targetData.minHeatLevel}%** heat level to attempt **${targetData.name}**!\n> **Your Current Heat:** \`${profile.heatLevel}%\`\n> **Required Heat:** \`${targetData.minHeatLevel}%\``)
                );

                components.push(heatRequirementContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const buildHeatContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                buildHeatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **BUILD YOUR CRIMINAL REPUTATION**\n\n**💡 Ways to Increase Heat:**\n> • Complete smaller heists successfully\n> • Participate in criminal activities\n> • Build your reputation in the underworld\n> • Take risks with smaller operations first\n\n**🎯 Alternative Targets:**\n> Look for heists with lower heat requirements\n> Build up gradually to major operations`)
                );

                components.push(buildHeatContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
         
            const existingHeist = await Heist.findOne({
                plannerUserId: message.author.id,
                guildId: message.guild.id,
                status: { $in: ['planning', 'recruiting', 'ready'] }
            });
            
            if (existingHeist) {
                const components = [];

                const alreadyPlanningContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                alreadyPlanningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Already Planning Operation\n## EXISTING HEIST IN PROGRESS\n\n> You're already masterminding the **${existingHeist.targetName}** heist!\n> **Current Status:** \`${existingHeist.status.toUpperCase()}\`\n> **Team Size:** \`${existingHeist.members.length}/${existingHeist.requiredMembers}\``)
                );

                components.push(alreadyPlanningContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const currentHeistContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                currentHeistContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **CURRENT OPERATION STATUS**\n\n**🎯 Target:** \`${existingHeist.targetName}\`\n**🆔 Heist ID:** \`${existingHeist.heistId}\`\n**👥 Crew Status:** \`${existingHeist.members.length}/${existingHeist.requiredMembers} specialists\`\n**💰 Potential Payout:** \`$${existingHeist.potential_payout.toLocaleString()}\`\n\n**💡 Next Steps:**\n> • Use \`!heist\` to check detailed status\n> • Complete current operation before planning new ones\n> • Focus on recruiting remaining crew members`)
                );

                components.push(currentHeistContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
          
            const equipmentCost = targetData.equipment.reduce((sum, item) => 
                sum + HEIST_EQUIPMENT[item].cost, 0
            );
            
            if (profile.wallet < equipmentCost) {
                const components = [];

                const insufficientFundsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientFundsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds for Equipment\n## CANNOT AFFORD OPERATION COSTS\n\n> You need **\`$${equipmentCost.toLocaleString()}\`** for the required equipment!\n> **Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n> **Shortage:** \`$${(equipmentCost - profile.wallet).toLocaleString()}\``)
                );

                components.push(insufficientFundsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const equipmentBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                equipmentBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🔧 **REQUIRED EQUIPMENT BREAKDOWN**')
                );

                const equipmentList = targetData.equipment.map(item => {
                    const equipment = HEIST_EQUIPMENT[item];
                    return `**${equipment.name}** - \`$${equipment.cost.toLocaleString()}\`\n> ${equipment.description}`;
                }).join('\n\n');

                equipmentBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${equipmentList}\n\n**💰 Total Cost:** \`$${equipmentCost.toLocaleString()}\`\n\n**💡 Earning Tips:** Work, complete dailies, or run businesses to raise funds for your operation!`)
                );

                components.push(equipmentBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
         
            const heistId = `heist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const heist = new Heist({
                heistId,
                guildId: message.guild.id,
                plannerUserId: message.author.id,
                targetType,
                targetName: targetData.name,
                difficulty: targetData.difficulty,
                requiredMembers: targetData.requiredMembers,
                members: [{
                    userId: message.author.id,
                    username: message.author.username,
                    role: 'mastermind',
                    confirmed: true,
                    equipment: [],
                    joinedAt: new Date()
                }],
                plannedDate: new Date(Date.now() + targetData.planningTime * 60 * 60 * 1000),
                status: 'recruiting',
                potential_payout: Math.floor((targetData.payout[0] + targetData.payout[1]) / 2),
                success_chance: targetData.successChance,
                heat_level: profile.heatLevel,
                preparation_time: 0,
                equipment_cost: equipmentCost,
                dateCreated: new Date()
            });
            
            await heist.save();
            
          
            profile.wallet -= equipmentCost;
            
        
            profile.activeHeists.push(heistId);
            
         
            profile.transactions.push({
                type: 'expense',
                amount: equipmentCost,
                description: `Heist equipment for ${targetData.name}`,
                category: 'heist_planning'
            });
            
            await profile.save();
            
          
            const components = [];

          
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF5722);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎯 Heist Successfully Planned!\n## ${targetData.name.toUpperCase()} OPERATION INITIATED\n\n> Congratulations, mastermind! Your **${targetData.name}** heist is now recruiting specialists.\n> The criminal underworld awaits your leadership in this daring operation!`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            
            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📋 **OPERATION SPECIFICATIONS**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Target:** \`${targetData.name}\`\n**🆔 Operation ID:** \`${heistId}\`\n**⚡ Difficulty Level:** \`${targetData.difficulty}/5\`\n**💰 Potential Payout:** \`$${heist.potential_payout.toLocaleString()}\`\n**📊 Base Success Rate:** \`${targetData.successChance}%\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👥 Required Team Size:** \`${targetData.requiredMembers} specialists\`\n**⏰ Planning Duration:** \`${targetData.planningTime} hours\`\n**📅 Ready Date:** \`${heist.plannedDate.toLocaleString()}\`\n**💸 Equipment Investment:** \`$${equipmentCost.toLocaleString()}\``)
            );

            components.push(detailsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const teamContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👥 **CREW RECRUITMENT STATUS**')
            );

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👑 Mastermind:** \`${message.author.username}\` (You)\n**🎭 Required Specialists:** ${targetData.requiredRoles.join(', ')}\n**👥 Current Team:** \`1/${targetData.requiredMembers} recruited\`\n**🎯 Still Needed:** \`${targetData.requiredMembers - 1} specialists\``)
            );

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📢 Recruitment Command:** \`!joinheist ${heistId} <role>\`\n**💡 Share With Crew:** Give potential members the heist ID\n**⏰ Recruitment Window:** Open until team is complete`)
            );

            components.push(teamContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const preparationContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            preparationContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🔧 **EQUIPMENT & PREPARATION**')
            );

            const equipmentList = targetData.equipment.map(item => {
                const equipment = HEIST_EQUIPMENT[item];
                return `**${equipment.name}** (\`$${equipment.cost.toLocaleString()}\`)`;
            }).join(' • ');

            preparationContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**✅ Equipment Acquired:** ${equipmentList}\n**💰 Total Investment:** \`$${equipmentCost.toLocaleString()}\`\n**📦 Equipment Status:** Secured and ready for operation\n**🎯 Preparation Level:** Professional grade criminal tools`)
            );

            components.push(preparationContainer);

            
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0x607D8B);

            nextStepsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **NEXT STEPS FOR SUCCESS**\n\n**1. Recruit Your Crew:** Share heist ID \`${heistId}\` with trusted specialists\n**2. Assign Roles:** Ensure each required role is filled by capable criminals\n**3. Plan Coordination:** Discuss strategy and timing with your team\n**4. Execute Operation:** Use \`!executeheist ${heistId}\` when ready\n\n**💡 Mastermind Tips:**\n> • Choose crew members with relevant skills\n> • Coordinate timing for maximum success\n> • Higher skilled crew = better success chances\n> • Communication is key to heist success`)
            );

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        
            setTimeout(() => {
                const recruitmentComponents = [];

                const recruitmentContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                recruitmentContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚨 HEIST RECRUITMENT OPEN\n## ${targetData.name.toUpperCase()} OPERATION\n\n> **Mastermind:** \`${message.author.username}\`\n> **Target:** \`${targetData.name}\`\n> **Potential Payout:** \`$${heist.potential_payout.toLocaleString()}\`\n> **Difficulty:** \`${targetData.difficulty}/5\`\n\n**👥 SEEKING:** ${targetData.requiredMembers - 1} skilled specialists\n**🎭 ROLES NEEDED:** ${targetData.requiredRoles.filter(role => role !== 'mastermind').join(', ')}\n\n**⚡ JOIN NOW:** \`!joinheist ${heistId} <your_role>\``)
                );

                recruitmentComponents.push(recruitmentContainer);

                message.channel.send({
                    components: recruitmentComponents,
                    flags: MessageFlags.IsComponentsV2
                });
            }, 2000);

        } catch (error) {
            console.error('Error in planheist command:', error);

           
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **HEIST PLANNING ERROR**\n\nSomething went wrong while planning your heist operation. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getDifficultyColor(difficulty) {
    const colors = {
        1: 0x4CAF50, 
        2: 0x8BC34A,  
        3: 0xFF9800, 
        4: 0xFF5722, 
        5: 0xF44336  
    };
    return colors[difficulty] || 0x95A5A6;
}

function getDifficultyEmoji(difficulty) {
    const emojis = {
        1: '🟢',
        2: '🟡',
        3: '🟠',
        4: '🔴',
        5: '⚫'
    };
    return emojis[difficulty] || '⚪';
}
