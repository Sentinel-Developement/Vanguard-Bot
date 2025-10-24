const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'race',
    description: 'Race your car to win money with v2 components',
    cooldown: 300, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
         
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'race');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Racing Cooldown Active\n## ENGINE NEEDS TO COOL DOWN\n\n> Your car needs time to cool down after the last race!\n> Racing requires proper maintenance breaks between events.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **COOLDOWN INFORMATION**\n\n**Time Remaining:** \`${hours}h ${minutes}m\`\n**Next Race Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n**Cooldown Duration:** \`5 minutes\`\n\n> Use this time to maintain your car or check racing stats!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (!profile.activeCar) {
                const components = [];

                const noCarContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noCarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚗 No Active Car\n## VEHICLE REQUIRED FOR RACING\n\n> You need to buy and select a car before you can race!\n> Can't participate in races without a proper vehicle.`)
                );

                components.push(noCarContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏪 **GET RACING READY**\n\n**Step 1:** Use \`!buycar\` to purchase a vehicle\n**Step 2:** Set it as your active car\n**Step 3:** Return here to start racing!\n\n**💡 Tip:** Better cars have higher win chances and bigger payouts!`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const car = profile.cars.find(c => c.carId === profile.activeCar);
            if (!car) {
                const components = [];

                const carNotFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                carNotFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Active Car Not Found\n## DATABASE ERROR\n\n> Your active car was not found in your garage!\n> This might be a system error. Please try setting your active car again.`)
                );

                components.push(carNotFoundContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const performance = (car.speed + car.acceleration + car.handling) / 3;
            const winChance = Math.min(90, Math.max(10, performance + Math.random() * 20));
            
            const won = Math.random() * 100 < winChance;
            const baseWinnings = Math.floor(Math.random() * 5000) + 1000;
            const winnings = Math.floor(baseWinnings * (performance / 50));
            
            let roleBonus = 0;
            profile.purchasedRoles.forEach(role => {
                if (!role.expiryDate || role.expiryDate > new Date()) {
                    roleBonus += role.benefits.racingBonus;
                }
            });
            
         
            profile.cooldowns.race = new Date();
            
            const components = [];

            if (won) {
                const totalWinnings = winnings + roleBonus;
                profile.wallet += totalWinnings;
                profile.racingStats.wins += 1;
                profile.racingStats.winStreak += 1;
                profile.racingStats.earnings += totalWinnings;
                car.raceWins += 1;

                const victoryContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                victoryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏁 RACE VICTORY!\n## CHECKERED FLAG CHAMPION\n\n> Congratulations! You dominated the track with your **${car.name}**!\n> Your driving skills and car performance led to a spectacular win!`)
                );

                components.push(victoryContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **RACE EARNINGS**')
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 Base Winnings:** \`$${winnings.toLocaleString()}\`\n**👑 Role Bonus:** \`$${roleBonus.toLocaleString()}\`\n**💎 Total Winnings:** \`$${totalWinnings.toLocaleString()}\`\n**💳 New Wallet:** \`$${profile.wallet.toLocaleString()}\``)
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏁 Win Streak:** \`${profile.racingStats.winStreak}\`\n**📊 Car Performance:** \`${performance.toFixed(1)}/100\`\n**🎯 Win Chance:** \`${winChance.toFixed(1)}%\``)
                );

                components.push(resultsContainer);

              
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🚗 **VEHICLE & DRIVER STATS**')
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🚗 Vehicle:** \`${car.name}\`\n**⚡ Speed:** \`${car.speed}/100\`\n**🚀 Acceleration:** \`${car.acceleration}/100\`\n**🎯 Handling:** \`${car.handling}/100\`\n**🔧 Durability:** \`${car.durability}%\``)
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 Car Race Wins:** \`${car.raceWins}\`\n**📈 Total Career Earnings:** \`$${profile.racingStats.earnings.toLocaleString()}\`\n**🏁 Total Races:** \`${profile.racingStats.totalRaces + 1}\``)
                );

                components.push(statsContainer);

            } else {
                const loss = Math.floor(winnings * 0.3);
                profile.wallet = Math.max(0, profile.wallet - loss);
                profile.racingStats.losses += 1;
                profile.racingStats.winStreak = 0;
                car.raceLosses += 1;
                const durabilityLoss = Math.floor(Math.random() * 5);
                car.durability = Math.max(0, car.durability - durabilityLoss);

            
                const lossContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                lossContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏁 Race Defeat\n## TOUGH LUCK ON THE TRACK\n\n> Unfortunately, you didn't place well in this race.\n> Sometimes the competition is just too fierce, but that's racing!`)
                );

                components.push(lossContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

               
                const lossDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xC0392B);

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💸 **RACE CONSEQUENCES**')
                );

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Damage Costs:** \`$${loss.toLocaleString()}\`\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**🔧 Durability Loss:** \`-${durabilityLoss}%\`\n**🚗 Car Condition:** \`${car.durability}%\``)
                );

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📊 Car Performance:** \`${performance.toFixed(1)}/100\`\n**🎯 Win Chance:** \`${winChance.toFixed(1)}%\`\n**💔 Win Streak:** \`Reset to 0\``)
                );

                components.push(lossDetailsContainer);

               
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const tipsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                tipsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **IMPROVEMENT TIPS**\n\n**🔧 Maintain Your Car:** Use shop items to repair durability\n**🚗 Upgrade Vehicle:** Better cars have higher win rates\n**👑 Get Racing Roles:** Bonus earnings from role benefits\n**🏁 Keep Racing:** Practice makes perfect!\n\n> Every champion has faced defeats - comeback stronger!`)
                );

                components.push(tipsContainer);
            }

    
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextRaceContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextRaceContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🏁 **NEXT RACE AVAILABILITY**\n\n**Next Race:** \`${new Date(Date.now() + 300000).toLocaleDateString()} at ${new Date(Date.now() + 300000).toLocaleTimeString()}\`\n**Cooldown:** \`5 minutes\`\n**Current Time:** \`${new Date().toLocaleString()}\`\n\n> Use the break to maintain your vehicle and plan your next racing strategy!`)
            );

            components.push(nextRaceContainer);

            profile.racingStats.totalRaces += 1;
            await profile.save();

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in race command:', error);

     
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RACING ERROR**\n\nSomething went wrong during the race. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
