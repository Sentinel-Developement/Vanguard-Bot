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
    name: 'executeheist',
    aliases: ['heist-execute', 'startheist'],
    description: 'Execute a planned heist with v2 components',
    usage: '!executeheist <heist_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚨 Execute Heist Operation\n## MISSING HEIST IDENTIFIER\n\n> Please specify the heist ID to begin the operation!\n> **Usage:** \`!executeheist <heist_id>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **EXECUTION REQUIREMENTS**\n\n**🆔 Heist ID:** Find this in your active heists (\`!heist\`)\n**👑 Authority:** Only the heist planner can execute\n**👥 Team Status:** All crew members must be recruited\n**⏰ Timing:** Execute when the crew is ready\n\n**Example:** \`!executeheist ABC123\`\n\n**⚠️ Warning:** Once executed, there's no turning back!`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const heistId = args[0];
            const heist = await Heist.findOne({ heistId, guildId: message.guild.id });
            
            if (!heist) {
                const components = [];

                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Heist Operation Not Found\n## INVALID OPERATION ID\n\n> Heist ID **\`${heistId}\`** doesn't exist or has been completed!\n> Verify the heist identifier and try again.`)
                );

                components.push(notFoundContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔍 **FIND YOUR ACTIVE HEISTS**\n\n**Check Status:** Use \`!heist\` to see your active operations\n**Verify ID:** Copy the exact heist ID from your active list\n**Case Sensitive:** Heist IDs must match exactly\n\n**💡 Alternatives:**\n> • Check if the heist has already been executed\n> • Verify you're in the correct server\n> • Plan a new heist with \`!planheist\``)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (heist.plannerUserId !== message.author.id) {
                const components = [];

                const unauthorizedContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                const planner = message.guild.members.cache.get(heist.plannerUserId);
                const plannerName = planner ? planner.displayName : 'Unknown';

                unauthorizedContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Unauthorized Execution\n## INSUFFICIENT AUTHORITY\n\n> Only the heist planner can execute this operation!\n> **Heist Planner:** \`${plannerName}\`\n> **Your Role:** Crew member`)
                );

                components.push(unauthorizedContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const hierarchyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                hierarchyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👑 **HEIST HIERARCHY**\n\n**🎯 Target:** \`${heist.targetName}\`\n**👑 Mastermind:** \`${plannerName}\`\n**🎭 Your Role:** \`${heist.members.find(m => m.userId === message.author.id)?.role || 'Unknown'}\`\n\n**💡 Chain of Command:**\n> • Only the planner has execution authority\n> • Crew members await orders from the mastermind\n> • Contact the planner to request execution\n> • Trust the chain of command for success`)
                );

                components.push(hierarchyContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (heist.status !== 'ready') {
                const components = [];

                const notReadyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                notReadyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏳ Heist Not Ready for Execution\n## TEAM ASSEMBLY INCOMPLETE\n\n> The **${heist.targetName}** heist cannot be executed yet!\n> **Current Status:** \`${heist.status.toUpperCase()}\``)
                );

                components.push(notReadyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const requirementsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const targetData = HEIST_TARGETS[heist.targetType];
                const currentMemberRoles = heist.members.map(m => m.role);
                const missingRoles = targetData.requiredRoles.filter(role => !currentMemberRoles.includes(role));

                requirementsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📋 **EXECUTION REQUIREMENTS**')
                );

                requirementsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**👥 Team Status:** \`${heist.members.length}/${heist.requiredMembers} members recruited\`\n**🎯 Target:** \`${heist.targetName}\`\n**📊 Required Team Size:** \`${heist.requiredMembers} specialists\``)
                );

                if (missingRoles.length > 0) {
                    requirementsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🔍 Missing Roles:** \`${missingRoles.join(', ')}\`\n\n**⚡ Next Steps:**\n> • Recruit specialists for missing roles\n> • Share the heist ID with potential crew members\n> • Use recruitment channels to find talent\n> • Wait for full team assembly before execution`)
                    );
                } else {
                    requirementsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✅ All Roles Filled:** Crew complete!\n**⚠️ Status Issue:** Check heist coordination\n\n**💡 Troubleshooting:**\n> • Verify all members are confirmed\n> • Check if planning phase is complete\n> • Contact support if issues persist`)
                    );
                }

                components.push(requirementsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const targetData = HEIST_TARGETS[heist.targetType];
            
          
            const components = [];

            const executionContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000);

            executionContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🚨 HEIST EXECUTION INITIATED\n## ${heist.targetName.toUpperCase()} OPERATION\n\n> The heist operation is now beginning...\n> All crew members are moving into position...\n\n**⏳ PHASE 1:** Team deployment in progress...`)
            );

            components.push(executionContainer);

            const executionMsg = await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
          
            setTimeout(async () => {
                const phase2Components = [];

                const phase2Container = new ContainerBuilder()
                    .setAccentColor(0xFF3D00);

                phase2Container.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚨 HEIST IN PROGRESS\n## ${heist.targetName.toUpperCase()} OPERATION\n\n> The operation is proceeding according to plan...\n\n**✅ PHASE 1:** Team successfully deployed\n**⏳ PHASE 2:** Bypassing security systems...\n**🔓 STATUS:** Hacking security protocols...`)
                );

                phase2Components.push(phase2Container);

                await executionMsg.edit({
                    components: phase2Components,
                    flags: MessageFlags.IsComponentsV2
                });
            }, 3000);
            
         
            setTimeout(async () => {
                const phase3Components = [];

                const phase3Container = new ContainerBuilder()
                    .setAccentColor(0xFF6D00);

                phase3Container.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚨 HEIST IN PROGRESS\n## ${heist.targetName.toUpperCase()} OPERATION\n\n> Critical phase - accessing primary target...\n\n**✅ PHASE 1:** Team deployed successfully\n**✅ PHASE 2:** Security systems bypassed\n**⏳ PHASE 3:** Accessing target vault...\n**🎯 STATUS:** Infiltration in progress...`)
                );

                phase3Components.push(phase3Container);

                await executionMsg.edit({
                    components: phase3Components,
                    flags: MessageFlags.IsComponentsV2
                });
            }, 6000);
            
            
            setTimeout(async () => {
                heist.status = 'executing';
                await heist.save();
                
                const result = await EconomyManager.executeHeist(heistId);
                const resultComponents = [];
                
                if (result.success) {
                  
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🎉 HEIST SUCCESSFUL!\n## ${result.heist.targetName.toUpperCase()} COMPLETELY COMPROMISED\n\n> **OPERATION COMPLETE:** Your crew has executed the perfect heist!\n> The target has been successfully infiltrated and the score secured!`)
                    );

                    resultComponents.push(successContainer);

                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                  
                    const financialContainer = new ContainerBuilder()
                        .setAccentColor(0x27AE60);

                    financialContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 💰 **FINANCIAL RESULTS**')
                    );

                    const memberPayouts = result.heist.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const roleMultiplier = {
                            mastermind: 1.5,
                            hacker: 1.3,
                            safecracker: 1.2,
                            driver: 1.1,
                            lookout: 1.0,
                            muscle: 1.0
                        }[member.role] || 1.0;
                        
                        const basePayout = Math.floor(result.heist.actual_payout / result.heist.members.length);
                        const finalPayout = Math.floor(basePayout * roleMultiplier);
                        
                        return `**${member.username}** (${member.role})\n> **Base Share:** \`$${basePayout.toLocaleString()}\`\n> **Role Bonus:** \`${((roleMultiplier - 1) * 100).toFixed(0)}%\`\n> **Final Payout:** \`$${finalPayout.toLocaleString()}\``;
                    }).join('\n\n');

                    financialContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🏆 Total Heist Score:** \`$${result.heist.actual_payout.toLocaleString()}\`\n**📊 Success Probability:** \`${Math.floor(await EconomyManager.calculateHeistSuccess(result.heist, result.memberProfiles))}%\`\n**👥 Crew Size:** \`${result.heist.members.length} specialists\``)
                    );

                    financialContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💎 CREW PAYOUTS:**\n\n${memberPayouts}`)
                    );

                    resultComponents.push(financialContainer);

               
                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const consequencesContainer = new ContainerBuilder()
                        .setAccentColor(0xFF9800);

                    consequencesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ⚠️ **OPERATION CONSEQUENCES**\n\n**🔥 Heat Level Impact:** All crew members' heat levels have increased\n**🚔 Law Enforcement:** Heightened police awareness in the area\n**⏰ Laying Low:** Recommended to avoid high-profile activities\n**📈 Criminal Reputation:** Your crew's notoriety has grown\n\n**💡 Strategic Advice:** Use your earnings wisely and plan your next moves carefully!`)
                    );

                    resultComponents.push(consequencesContainer);

                } else {
                  
                    const failureContainer = new ContainerBuilder()
                        .setAccentColor(0xF44336);

                    failureContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🚨 HEIST FAILED!\n## ${result.heist.targetName.toUpperCase()} OPERATION COMPROMISED\n\n> **OPERATION FAILED:** Your crew has been caught!\n> Law enforcement responded faster than anticipated and your team was apprehended!`)
                    );

                    resultComponents.push(failureContainer);

                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                   
                    const penaltiesContainer = new ContainerBuilder()
                        .setAccentColor(0xD32F2F);

                    penaltiesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## ⚖️ **LEGAL CONSEQUENCES**')
                    );

                    const memberPenalties = result.heist.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const jailHours = targetData.difficulty * 6;
                        const fine = Math.floor(profile.wallet * 0.2);
                        
                        return `**${member.username}** (${member.role})\n> **Jail Time:** \`${jailHours} hours\`\n> **Fine:** \`$${fine.toLocaleString()}\`\n> **Status:** Incarcerated`;
                    }).join('\n\n');

                    penaltiesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💸 Total Financial Loss:** No payout - all funds confiscated\n**⏰ Average Jail Time:** \`${targetData.difficulty * 6} hours\`\n**📊 Failure Probability:** \`${100 - Math.floor(await EconomyManager.calculateHeistSuccess(result.heist, result.memberProfiles))}%\``)
                    );

                    penaltiesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🚔 CREW PENALTIES:**\n\n${memberPenalties}`)
                    );

                    resultComponents.push(penaltiesContainer);

              
                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const severeContainer = new ContainerBuilder()
                        .setAccentColor(0xB71C1C);

                    severeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🚨 **SEVERE CONSEQUENCES**\n\n**🔥 Heat Levels:** Massively increased for all crew members\n**👮 FBI Watchlist:** Your crew is now under federal surveillance\n**🚫 Criminal Record:** Failure recorded in permanent criminal database\n**⏰ Recovery Time:** Extended period required before next major operation\n\n**💔 Learn From Failure:** Study what went wrong to improve future heist planning!`)
                    );

                    resultComponents.push(severeContainer);
                }

                await executionMsg.edit({
                    components: resultComponents,
                    flags: MessageFlags.IsComponentsV2
                });
                
             
                for (const member of result.heist.members) {
                    const profile = await EconomyManager.getProfile(member.userId, result.heist.guildId);
                    profile.activeHeists = profile.activeHeists.filter(id => id !== heistId);
                    await profile.save();
                }
                
            }, 9000);

        } catch (error) {
            console.error('Error in executeheist command:', error);

          
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **HEIST EXECUTION ERROR**\n\nSomething went wrong during heist execution. The operation has been aborted for safety.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
