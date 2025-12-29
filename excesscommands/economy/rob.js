const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'rob',
    description: 'Attempt to rob another player with v2 components (risky!)',
    usage: '!rob @user',
    cooldown: 1800,
    async execute(message, args) {
        try {
          
            let robberProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (!robberProfile) {
                const components = [];

                const profileErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                profileErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Profile Access Error\n## ACCOUNT INITIALIZATION REQUIRED\n\n> Unable to access your criminal profile!\n> Please use \`!balance\` first to initialize your account before attempting robberies.`)
                );

                components.push(profileErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

        
            if (typeof robberProfile.wallet !== 'number') {
                robberProfile.wallet = Number(robberProfile.wallet) || 0;
                await robberProfile.save();
            }

            if (!robberProfile.cooldowns || typeof robberProfile.cooldowns !== 'object') {
                robberProfile.cooldowns = {};
                await robberProfile.save();
            }

           
            const cooldownCheck = EconomyManager.checkCooldown(robberProfile, 'robbery');
            if (cooldownCheck.onCooldown) {
                const { minutes, seconds } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Robbery Cooldown Active\n## CRIMINAL ACTIVITY RESTRICTED\n\n> You must wait before attempting another robbery!\n> **Time Remaining:** \`${minutes}m ${seconds}s\``)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const patienceContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                patienceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **USE THIS TIME WISELY**\n\n**🎯 Plan Your Next Target:** Scout potential victims\n**📈 Build Skills:** Work to increase your level for better success rates\n**🛡️ Study Security:** Learn about target protection methods\n**💰 Manage Resources:** Ensure you can handle potential fines\n\n> Patience and planning lead to successful heists!`)
                );

                components.push(patienceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
       
            const target = message.mentions.users.first();
            if (!target) {
                const components = [];

                const noTargetContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 No Target Specified\n## ROBBERY TARGET REQUIRED\n\n> You need to mention someone to rob!\n> **Usage:** \`!rob @username\``)
                );

                components.push(noTargetContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🕵️ **HOW TO ROB SOMEONE**\n\n**Command:** \`!rob @target\`\n**Example:** \`!rob @JohnDoe\`\n\n**💡 Robbery Tips:**\n> • Target users with lower security levels\n> • Higher level robbers have better success rates\n> • Victims need at least $500 to be worth robbing\n> • Failed robberies result in fines and reputation loss\n> • Successful robberies give XP and stolen money`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (target.id === message.author.id) {
                const components = [];

                const selfRobContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                selfRobContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🪞 Cannot Rob Yourself\n## LOGICAL IMPOSSIBILITY\n\n> You cannot rob yourself! That's not how crime works.\n> Find another target to attempt your robbery on.`)
                );

                components.push(selfRobContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const alternativeContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                alternativeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **ALTERNATIVE MONEY METHODS**\n\n**💼 Work:** Use \`!work\` for legitimate income\n**🎰 Gamble:** Try \`!gamble\` for risky gains\n**🏪 Business:** Run businesses for passive income\n**🎁 Daily:** Claim \`!daily\` rewards regularly\n\n> Why rob yourself when you can rob others? 😏`)
                );

                components.push(alternativeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (target.bot) {
                const components = [];

                const botRobContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                botRobContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤖 Cannot Rob Bots\n## INVALID TARGET TYPE\n\n> Bots don't have money to steal and don't participate in the economy!\n> Choose a human player as your robbery target.`)
                );

                components.push(botRobContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const humanTargetContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                humanTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **FIND HUMAN TARGETS**\n\n**🎯 Look For:** Active server members who participate in the economy\n**💰 Target Rich:** Players with high wallet balances\n**🛡️ Avoid Strong:** Users with high security levels (pets/properties)\n**⏰ Time It Right:** Rob when targets are likely offline\n\n> Focus on human players for successful robberies!`)
                );

                components.push(humanTargetContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        
            let victimProfile = await EconomyManager.getProfile(target.id, message.guild.id);
            
            if (!victimProfile) {
                const components = [];

                const victimErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                victimErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Target Profile Error\n## VICTIM ACCOUNT INACCESSIBLE\n\n> Unable to access **${target.username}**'s profile!\n> They may need to use \`!balance\` first to initialize their account.`)
                );

                components.push(victimErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            
            if (typeof victimProfile.wallet !== 'number') {
                victimProfile.wallet = Number(victimProfile.wallet) || 1000;
                await victimProfile.save();
            }

            if (!Array.isArray(victimProfile.pets)) {
                victimProfile.pets = [];
                await victimProfile.save();
            }

         
            if (victimProfile.wallet < 500) {
                const components = [];

                const poorTargetContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                poorTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Target Too Poor\n## INSUFFICIENT ROBBERY VALUE\n\n> **${target.username}** only has **\`$${victimProfile.wallet.toLocaleString()}\`**!\n> Targets need at least **\`$500\`** to be worth robbing.`)
                );

                components.push(poorTargetContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const betterTargetContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                betterTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **FIND BETTER TARGETS**\n\n**💰 Look For:** Users with substantial wallet balances\n**📊 Check Activity:** Active players tend to have more money\n**🏆 Target Winners:** Look for successful gamblers or workers\n**⏰ Wait Strategy:** Check back when they might have earned more\n\n**💡 Pro Tip:** Use \`!leaderboard wealth\` to scout rich targets!`)
                );

                components.push(betterTargetContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
      
            const victimSecurity = EconomyManager.calculateSecurityLevel(victimProfile);
            const robberLevel = robberProfile.level || 1;
            
            const baseSuccessChance = 30;
            const levelBonus = Math.min(robberLevel * 2, 20);
            const securityPenalty = victimSecurity * 0.5;
            
            const successChance = Math.max(5, baseSuccessChance + levelBonus - securityPenalty);
            const success = Math.random() * 100 < successChance;
            
           
            robberProfile.cooldowns.robbery = new Date();
            
            if (success) {
                
                const maxSteal = Math.min(victimProfile.wallet * 0.3, 5000);
                const stolenAmount = Math.floor(Math.random() * maxSteal) + 100;
                
                robberProfile.wallet += stolenAmount;
                victimProfile.wallet = Math.max(0, victimProfile.wallet - stolenAmount);
                
                robberProfile.experience = (robberProfile.experience || 0) + 20;
                robberProfile.reputation = Math.max((robberProfile.reputation || 0) - 10, -100);
                robberProfile.successfulRobberies = (robberProfile.successfulRobberies || 0) + 1;
                
              
                if (victimProfile.pets && victimProfile.pets.length > 0) {
                    victimProfile.pets.forEach(pet => {
                        if (Math.random() < 0.5) {
                            pet.health = Math.max(10, (pet.health || 100) - Math.floor(Math.random() * 15));
                            pet.happiness = Math.max(0, (pet.happiness || 50) - Math.floor(Math.random() * 20));
                        }
                    });
                }
                
             
                if (!Array.isArray(robberProfile.transactions)) robberProfile.transactions = [];
                if (!Array.isArray(victimProfile.transactions)) victimProfile.transactions = [];

                robberProfile.transactions.push({
                    type: 'income',
                    amount: stolenAmount,
                    description: `Robbed ${target.username}`,
                    category: 'robbery',
                    timestamp: new Date()
                });
                
                victimProfile.transactions.push({
                    type: 'expense',
                    amount: stolenAmount,
                    description: `Robbed by ${message.author.username}`,
                    category: 'robbery',
                    timestamp: new Date()
                });
                
                await robberProfile.save();
                await victimProfile.save();
                
              
                const components = [];

              
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Robbery Successful!\n## CRIMINAL OPERATION COMPLETE\n\n> Congratulations! You successfully robbed **${target.username}** and got away clean!\n> Your criminal skills have proven effective in this daring theft.`)
                );

                components.push(successContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💎 **THEFT BREAKDOWN**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Target:** \`${target.username}\`\n**💰 Amount Stolen:** \`$${stolenAmount.toLocaleString()}\`\n**📊 Success Rate:** \`${successChance.toFixed(1)}%\`\n**🛡️ Target Security:** \`${victimSecurity}%\`\n**⭐ Experience Gained:** \`+20 XP\``)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Your New Balance:** \`$${robberProfile.wallet.toLocaleString()}\`\n**💸 Victim's Remaining:** \`$${victimProfile.wallet.toLocaleString()}\`\n**📈 Your Level:** \`${robberProfile.level || 1}\`\n**🏆 Successful Robberies:** \`${robberProfile.successfulRobberies}\``)
                );

                components.push(detailsContainer);

             
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const consequencesContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                consequencesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚠️ **ROBBERY CONSEQUENCES**\n\n**📉 Reputation Impact:** \`-10 reputation points\`\n**🐕 Pet Damage:** Some of the victim's pets may have been hurt during the robbery\n**⏰ Cooldown Applied:** \`30 minutes\` before your next robbery attempt\n**🔍 Increased Suspicion:** Law enforcement awareness heightened\n\n**💡 Advice:** Lay low and avoid suspicious activities for a while!`)
                );

                components.push(consequencesContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
                
               
                try {
                    const victimComponents = [];

                    const victimNotificationContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    victimNotificationContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🚨 You've Been Robbed!\n## CRIMINAL ATTACK IN ${message.guild.name.toUpperCase()}\n\n> **${message.author.username}** has successfully robbed you!\n> Your security measures were insufficient to prevent this theft.`)
                    );

                    victimComponents.push(victimNotificationContainer);

                    victimComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const lossDetailsContainer = new ContainerBuilder()
                        .setAccentColor(0xDC3545);

                    lossDetailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💸 **LOSS DETAILS**\n\n**💰 Amount Lost:** \`$${stolenAmount.toLocaleString()}\`\n**🛡️ Your Security Level:** \`${victimSecurity}%\`\n**💳 Remaining Balance:** \`$${victimProfile.wallet.toLocaleString()}\`\n**🏠 Server:** \`${message.guild.name}\`\n\n**💡 Security Tip:** Buy pets and properties to increase your protection against future robberies!`)
                    );

                    victimComponents.push(lossDetailsContainer);
                        
                    await target.send({
                        components: victimComponents,
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (error) {
                    console.log(`Could not notify robbery victim: ${target.tag}`);
                }
                
            } else {
             
                const penalty = Math.floor(Math.random() * 2000) + 500;
                robberProfile.wallet = Math.max(0, robberProfile.wallet - penalty);
                robberProfile.reputation = Math.max((robberProfile.reputation || 0) - 5, -100);
                robberProfile.robberyAttempts = (robberProfile.robberyAttempts || 0) + 1;
                
                if (!Array.isArray(robberProfile.transactions)) {
                    robberProfile.transactions = [];
                }

                robberProfile.transactions.push({
                    type: 'expense',
                    amount: penalty,
                    description: `Failed robbery fine`,
                    category: 'robbery',
                    timestamp: new Date()
                });
                
                await robberProfile.save();
                
               
                const components = [];

             
                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚨 Robbery Failed!\n## CRIMINAL OPERATION COMPROMISED\n\n> You were caught attempting to rob **${target.username}**!\n> Law enforcement responded quickly and you face serious consequences.`)
                );

                components.push(failureContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
                const penaltyContainer = new ContainerBuilder()
                    .setAccentColor(0xDC3545);

                penaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚖️ **LEGAL CONSEQUENCES**')
                );

                penaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💸 Fine Imposed:** \`$${penalty.toLocaleString()}\`\n**📊 Failure Chance:** \`${(100 - successChance).toFixed(1)}%\`\n**📉 Reputation Lost:** \`-5 reputation points\`\n**🛡️ Target Security:** \`${victimSecurity}%\` (too strong!)\n**📈 Your Level:** \`${robberProfile.level || 1}\` (need improvement)`)
                );

                penaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Remaining Balance:** \`$${robberProfile.wallet.toLocaleString()}\`\n**🎯 Total Robbery Attempts:** \`${robberProfile.robberyAttempts}\`\n**⏰ Cooldown Applied:** \`30 minutes\` before next attempt`)
                );

                components.push(penaltyContainer);

          
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const improvementContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                improvementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **IMPROVE YOUR SUCCESS RATE**\n\n**📈 Level Up:** Work regularly to increase your level (current: ${robberProfile.level || 1})\n**🎯 Choose Easier Targets:** Look for users with lower security levels\n**🕵️ Scout First:** Research target security before attempting robberies\n**⏰ Timing:** Try robbing when targets are likely offline\n**💰 Build Funds:** Ensure you can afford potential failure fines\n\n**🎓 Remember:** Each level gives +2% success rate bonus!`)
                );

                components.push(improvementContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        } catch (error) {
            console.error('Error in rob command:', error);
            
            const components = [];

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ **ROBBERY SYSTEM ERROR**\n## OPERATION ABORTED\n\n> Something went wrong during the robbery attempt!\n> **Error:** \`${error.message}\``)
            );

            components.push(errorContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const troubleshootContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            troubleshootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🛠️ **TROUBLESHOOTING STEPS**\n\n**1.** Both users should try \`!balance\` first to initialize accounts\n**2.** Wait 30 seconds and try the robbery again\n**3.** Ensure the target user is a valid server member\n**4.** Contact an admin if the issue persists\n\n**💡 Note:** System errors don't trigger cooldowns or penalties.`)
            );

            components.push(troubleshootContainer);
                
            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
