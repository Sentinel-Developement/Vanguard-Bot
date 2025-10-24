const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'gamble',
    aliases: ['bet'],
    description: 'Gamble your money for a chance to win more! (Affected by gambling luck) with v2 components',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
           
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'gambling');
            if (cooldownCheck.onCooldown) {
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Gambling Cooldown Active\n## TAKE A BREATHER\n\n> You've gambled recently and need to wait before trying your luck again!\n> Responsible gambling includes taking breaks between sessions.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **COOLDOWN INFORMATION**\n\n**Time Remaining:** \`${cooldownCheck.timeLeft.seconds}s\`\n**Cooldown Duration:** \`30 seconds\`\n\n> Use this time to plan your next bet strategically!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let amount;
            if (args[0] === 'all' || args[0] === 'max') {
                amount = profile.wallet;
            } else {
                amount = parseInt(args[0], 10);
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Bet Amount\n## PLEASE SPECIFY VALID AMOUNT\n\n> Please provide a valid amount to gamble!\n> **Examples:** \`!gamble 1000\`, \`!gamble all\`, \`!gamble max\`\n\n**💡 Tip:** Start with smaller amounts to test your luck before going all-in!`)
                );

                components.push(invalidAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < amount) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## NOT ENOUGH MONEY TO BET\n\n> You only have **\`$${profile.wallet.toLocaleString()}\`** in your wallet!\n> You're trying to bet **\`$${amount.toLocaleString()}\`**`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const suggestionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                suggestionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **BETTING SUGGESTIONS**\n\n**Available to Bet:** \`$${profile.wallet.toLocaleString()}\`\n**Try:** \`!gamble ${Math.floor(profile.wallet / 2)}\` (Half your wallet)\n**Safe Bet:** \`!gamble ${Math.floor(profile.wallet * 0.1)}\` (10% of wallet)\n**All-In:** \`!gamble all\` (Everything you have)\n\n> Remember: Only gamble what you can afford to lose!`)
                );

                components.push(suggestionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            const luckMultiplier = EconomyManager.getGamblingLuck(profile);
            
       
            const baseLuckBonus = (luckMultiplier - 1) * 10; 
            const winChance = Math.min(75, 45 + baseLuckBonus); 
            
            const won = Math.random() * 100 < winChance;
            
            profile.cooldowns.gambling = new Date();
            
            const components = [];

            if (won) {
           
                let multiplier;
                const roll = Math.random() * 100;
                
                if (roll > 98) { 
                    multiplier = 5.0 * luckMultiplier; 
                } else if (roll > 90) { 
                    multiplier = 3.0 * luckMultiplier; 
                } else if (roll > 70) { 
                    multiplier = 2.5 * luckMultiplier; 
                } else {
                    multiplier = 2.0 * luckMultiplier; 
                }
                
                const winnings = Math.floor(amount * multiplier);
                const profit = winnings - amount;
                
                profile.wallet += profit;
                
                let winType = '';
                if (multiplier >= 4) winType = '🎉 **MEGA JACKPOT!** 🎉';
                else if (multiplier >= 3) winType = '⭐ **JACKPOT!** ⭐';
                else if (multiplier >= 2.5) winType = '🎰 **BIG WIN!** 🎰';
                
                profile.transactions.push({
                    type: 'income',
                    amount: profit,
                    description: `Gambling win (${multiplier.toFixed(2)}x)`,
                    category: 'gambling'
                });

                
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎰 Gambling Victory!\n## ${winType || 'LUCKY WIN!'}\n\n> Congratulations! Lady Luck smiled upon you today!\n> You bet **\`$${amount.toLocaleString()}\`** and won **\`$${winnings.toLocaleString()}\`**!`)
                );

                components.push(successContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            
                const winDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                winDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **WINNING BREAKDOWN**')
                );

                winDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Pure Profit:** \`$${profit.toLocaleString()}\`\n**📈 Win Multiplier:** \`${multiplier.toFixed(2)}x\`\n**🍀 Luck Bonus:** \`${luckMultiplier.toFixed(2)}x\`\n**🎯 Win Chance:** \`${winChance.toFixed(1)}%\``)
                );

                winDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 New Wallet Balance:** \`$${profile.wallet.toLocaleString()}\`\n**🎲 Roll Result:** \`${roll.toFixed(1)}/100\`\n**📝 Transaction Logged:** Win recorded in history`)
                );

                components.push(winDetailsContainer);

             
                if (luckMultiplier > 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const luckContainer = new ContainerBuilder()
                        .setAccentColor(0x28A745);

                    luckContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🍀 **LUCK SYSTEM ACTIVE**\n\n**🎯 Enhanced Win Chance:** Your luck boosted your win probability!\n**⚡ Multiplier Boost:** \`${((luckMultiplier - 1) * 100).toFixed(0)}%\` bonus on winnings\n**🛒 Luck Source:** Premium shop items are paying off!\n\n> Your investment in luck items is generating great returns!`)
                    );

                    components.push(luckContainer);
                }

            } else {
               
                profile.wallet -= amount;
                
                profile.transactions.push({
                    type: 'expense',
                    amount: amount,
                    description: 'Gambling loss',
                    category: 'gambling'
                });

               
                const lossContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                lossContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎲 Gambling Loss\n## LADY LUCK WASN'T ON YOUR SIDE\n\n> Unfortunately, you didn't win this time.\n> You bet **\`$${amount.toLocaleString()}\`** and lost it all, but don't give up!`)
                );

                components.push(lossContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

               
                const lossDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xDC3545);

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **GAMBLING STATISTICS**')
                );

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Your Win Chance:** \`${winChance.toFixed(1)}%\`\n**🍀 Luck Multiplier:** \`${luckMultiplier.toFixed(2)}x\`\n**💸 Amount Lost:** \`$${amount.toLocaleString()}\`\n**💳 Remaining Balance:** \`$${profile.wallet.toLocaleString()}\``)
                );

                components.push(lossDetailsContainer);

               
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const tipsContainer = new ContainerBuilder()
                    .setAccentColor(0x6C757D);

                tipsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **GAMBLING TIPS & ENCOURAGEMENT**\n\n**🍀 Improve Your Odds:** Buy luck items from the premium shop\n**🎲 Smart Betting:** Start with smaller amounts to minimize risk\n**💰 Earn More:** Work, complete dailies, or run businesses to rebuild funds\n**🎯 Patience Pays:** With ${winChance.toFixed(1)}% win chance, victory will come!\n\n**💫 Remember:** Every loss brings you closer to the next big win!`)
                );

                components.push(tipsContainer);
            }

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextGambleContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextGambleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎰 **NEXT GAMBLING SESSION**\n\n**Cooldown:** \`30 seconds\`\n**Next Available:** \`${new Date(Date.now() + 30000).toLocaleTimeString()}\`\n**Current Balance:** \`$${profile.wallet.toLocaleString()}\`\n\n> ${won ? 'Ride your winning streak or cash out while ahead!' : 'Take a moment to plan your comeback strategy!'}`)
            );

            components.push(nextGambleContainer);

            await profile.save();

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in gamble command:', error);

          
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **GAMBLING ERROR**\n\nSomething went wrong while processing your bet. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
