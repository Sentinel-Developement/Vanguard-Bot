const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'trip',
    aliases: ['familytrip'],
    description: 'Take your family on a trip to improve bonds with v2 components',
    cooldown: 86400, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
          
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'trip');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Trip Cooldown Active\n## FAMILY NEEDS REST\n\n> Your family just returned from their last trip and needs time to recover before the next adventure!`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **TIME REMAINING**\n\n**Cooldown:** \`${hours}h ${minutes}m remaining\`\n**Next Trip Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n\n> Plan your next family adventure while you wait!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (profile.familyMembers.length === 0) {
                const components = [];

                const noFamilyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noFamilyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 No Family Members\n## BUILD YOUR FAMILY FIRST\n\n> You need family members to go on trips! A solo adventure just isn't the same.\n\n**💡 Tip:** Use family system commands to add family members and start building those precious bonds.`)
                );

                components.push(noFamilyContainer);

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
                        .setContent(`# 🚗 No Transportation\n## CAR REQUIRED FOR FAMILY TRIPS\n\n> You need a car to take your family on trips! How else would you all travel together?\n\n**💡 Tip:** Visit the car shop to purchase a vehicle, then set it as your active car.`)
                );

                components.push(noCarContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const car = profile.cars.find(c => c.carId === profile.activeCar);
            const tripCost = 500 * profile.familyMembers.length;
            
            if (profile.wallet < tripCost) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD FAMILY TRIP\n\n> You need **\`$${tripCost.toLocaleString()}\`** to take your family on a trip!\n> Current wallet: **\`$${profile.wallet.toLocaleString()}\`**\n> Shortage: **\`$${(tripCost - profile.wallet).toLocaleString()}\`**`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const costBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                costBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **TRIP COST BREAKDOWN**\n\n**Family Members:** \`${profile.familyMembers.length}\`\n**Cost per Person:** \`$500\`\n**Total Trip Cost:** \`$${tripCost.toLocaleString()}\`\n\n> Save up and come back when you can afford this magical family experience!`)
                );

                components.push(costBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            profile.wallet -= tripCost;
            profile.cooldowns.trip = new Date();
            
            const carQuality = (car.speed + car.acceleration + car.handling) / 300;
            const baseBondIncrease = 5 + Math.floor(carQuality * 10);
            const randomBonus = Math.floor(Math.random() * 5);
            const totalBondIncrease = baseBondIncrease + randomBonus;
            
            profile.familyMembers.forEach(member => {
                member.bond = Math.min(100, member.bond + totalBondIncrease);
                member.totalTrips += 1;
                member.lastTrip = new Date();
            });
            
            const avgBond = profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length;
            profile.familyBond = Math.floor(avgBond);
            
            await profile.save();
            
            const tripEvents = [
                'went to the beach and had a wonderful time!',
                'visited an amusement park and rode roller coasters!',
                'had a picnic in the mountains!',
                'went shopping and bought souvenirs!',
                'visited a museum and learned new things!',
                'went camping under the stars!',
                'had dinner at a fancy restaurant!'
            ];
            
            const randomEvent = tripEvents[Math.floor(Math.random() * tripEvents.length)];
            
            const components = [];

         
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🚗 Amazing Family Trip!\n## UNFORGETTABLE MEMORIES CREATED\n\n> Your family ${randomEvent}\n> Everyone had an incredible time and the bonds grew stronger!`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            const resultsContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **TRIP RESULTS**')
            );

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Trip Cost:** \`$${tripCost.toLocaleString()}\`\n**❤️ Bond Increase:** \`+${totalBondIncrease}%\`\n**👨‍👩‍👧‍👦 New Family Bond:** \`${profile.familyBond}%\`\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\``)
            );

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Vehicle Used:** \`${car.name}\`\n**👥 Family Members:** \`${profile.familyMembers.length}\`\n**🎯 Car Quality Bonus:** \`${Math.floor(carQuality * 100)}%\``)
            );

            components.push(resultsContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const bondContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            bondContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **FAMILY BOND PROGRESS**')
            );

        
            const familyBondText = profile.familyMembers.slice(0, 3).map(member => 
                `**${member.name}** (${member.relationship})\n> **Bond:** \`${member.bond}%\` • **Total Trips:** \`${member.totalTrips}\``
            ).join('\n\n');

            bondContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(familyBondText)
            );

            if (profile.familyMembers.length > 3) {
                bondContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*...and ${profile.familyMembers.length - 3} more family members enjoyed the trip!*`)
                );
            }

            components.push(bondContainer);

            
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextTripContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            nextTripContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🗓️ **NEXT ADVENTURE**\n\n**Next Trip Available:** \`${new Date(Date.now() + 86400000).toLocaleDateString()} at ${new Date(Date.now() + 86400000).toLocaleTimeString()}\`\n**Cooldown:** \`24 hours\`\n\n> Keep building those family bonds! Regular trips strengthen relationships and improve work efficiency.`)
            );

            components.push(nextTripContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in trip command:', error);
            
        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAMILY TRIP ERROR**\n\nSomething went wrong during your family trip planning. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
