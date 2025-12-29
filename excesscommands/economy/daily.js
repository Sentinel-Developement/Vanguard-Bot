const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const now = Date.now();
            const oneDayMs = 24 * 60 * 60 * 1000;
            
            if (profile.cooldowns.daily && (now - profile.cooldowns.daily.getTime()) < oneDayMs) {
                const timeLeft = oneDayMs - (now - profile.cooldowns.daily.getTime());
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Daily Reward Cooldown\n## PATIENCE REWARDS DEDICATION\n\n> You've already claimed your daily reward! Come back tomorrow for another chance to earn.\n> Daily rewards reset every 24 hours to maintain balance and encourage regular play.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **TIME UNTIL NEXT REWARD**\n\n**Time Remaining:** \`${hoursLeft}h ${minutesLeft}m\`\n**Next Available:** \`${new Date(now + timeLeft).toLocaleDateString()} at ${new Date(now + timeLeft).toLocaleTimeString()}\`\n**Current Streak:** \`${profile.dailyStreak} days\`\n\n> Keep your streak alive by claiming daily rewards consistently!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
           
            const wasYesterday = profile.cooldowns.daily && 
                (now - profile.cooldowns.daily.getTime()) < (2 * oneDayMs);
            
            if (wasYesterday) {
                profile.dailyStreak += 1;
            } else {
                profile.dailyStreak = 1;
            }
            
          
            const baseReward = 500;
            const streakBonus = Math.min(profile.dailyStreak * 50, 1000); 
            const roleBonus = profile.purchasedRoles
                .filter(r => !r.expiryDate || r.expiryDate > new Date())
                .reduce((sum, role) => sum + (role.benefits.familyBonus * 100), 0);
            
            const totalReward = baseReward + streakBonus + roleBonus;
            
         
            profile.wallet += totalReward;
            profile.cooldowns.daily = new Date();
            profile.experience += 5;

          
            profile.transactions.push({
                type: 'income',
                amount: totalReward,
                description: `Daily reward (${profile.dailyStreak} day streak)`,
                category: 'daily'
            });
            
            await profile.save();
            
            
            const components = [];

        
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFFD700);

            const streakMessage = profile.dailyStreak === 1 ? 
                'Starting fresh with a new daily streak!' : 
                `Amazing ${profile.dailyStreak}-day consistency!`;

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎁 Daily Reward Claimed!\n## CONSISTENCY PAYS OFF\n\n> Congratulations! You've successfully claimed your daily reward of **\`$${totalReward.toLocaleString()}\`**!\n> ${streakMessage}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

       
            const breakdownContainer = new ContainerBuilder()
                .setAccentColor(0xFFC107);

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **REWARD BREAKDOWN**')
            );

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Base Daily Reward:** \`$${baseReward.toLocaleString()}\`\n**🔥 Streak Bonus:** \`$${streakBonus.toLocaleString()}\` (${profile.dailyStreak} days)\n**👑 Role Bonus:** \`$${roleBonus.toLocaleString()}\`\n**💰 Total Reward:** \`$${totalReward.toLocaleString()}\``)
            );

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⭐ Experience Gained:** \`+5 XP\`\n**💳 New Wallet Balance:** \`$${profile.wallet.toLocaleString()}\`\n**📊 Transaction Logged:** Daily reward recorded`)
            );

            components.push(breakdownContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const streakContainer = new ContainerBuilder()
                .setAccentColor(profile.dailyStreak >= 7 ? 0xE74C3C : 0x3498DB);

            streakContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🔥 **DAILY STREAK STATUS**')
            );

            const streakBonusPercent = Math.min((profile.dailyStreak * 10), 200);
            const maxStreakBonus = Math.min(profile.dailyStreak * 50, 1000);
            const nextStreakBonus = Math.min((profile.dailyStreak + 1) * 50, 1000);

            streakContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 Current Streak:** \`${profile.dailyStreak} days\`\n**💵 Current Bonus:** \`$${maxStreakBonus}\` per day\n**📈 Next Day Bonus:** \`$${nextStreakBonus}\`\n**🎯 Max Bonus:** \`$1,000\` (20+ day streak)`)
            );

            if (profile.dailyStreak >= 7) {
                streakContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 STREAK MILESTONE!** You've maintained a ${profile.dailyStreak}-day streak!\n\n> Excellent dedication! Keep this momentum going for maximum rewards!`)
                );
            } else {
                streakContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Streak Tips:** Claim daily rewards consistently to build up massive bonus earnings!\n\n> ${7 - profile.dailyStreak} more days until your first weekly milestone!`)
                );
            }

            components.push(streakContainer);

       
            if (roleBonus > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const roleContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                roleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 👑 **PREMIUM ROLE BENEFITS**')
                );

                const activeRoles = profile.purchasedRoles.filter(r => !r.expiryDate || r.expiryDate > new Date());
                roleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Active Premium Roles:** \`${activeRoles.length}\`\n**Daily Role Bonus:** \`$${roleBonus.toLocaleString()}\`\n**Monthly Role Value:** \`$${(roleBonus * 30).toLocaleString()}\`\n\n> Your premium membership is enhancing your daily earnings!`)
                );

                components.push(roleContainer);
            }

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextRewardContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextRewardContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **NEXT DAILY REWARD**\n\n**Next Claim Available:** \`${new Date(now + oneDayMs).toLocaleDateString()} at ${new Date(now + oneDayMs).toLocaleTimeString()}\`\n**Projected Next Reward:** \`$${baseReward + nextStreakBonus + roleBonus}\`\n**Streak Continuation:** Come back within 48 hours to maintain your streak\n\n> Set a daily reminder to maximize your earning potential!`)
            );

            components.push(nextRewardContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in daily command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **DAILY REWARD ERROR**\n\nSomething went wrong while processing your daily reward. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
