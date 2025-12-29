const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'garage',
    aliases: ['cars', 'mycars'],
    description: 'View and manage your car collection with v2 components',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.cars.length === 0) {
                const components = [];

                const noCarContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noCarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 Empty Garage\n## NO VEHICLES IN YOUR COLLECTION\n\n> Your garage is currently empty! You need to purchase cars to start building your automotive collection.\n> Cars are essential for racing and family trips.`)
                );

                components.push(noCarContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **GET YOUR FIRST CAR**\n\n**Step 1:** Use \`!buycar\` to see available vehicles\n**Step 2:** Choose a car that fits your budget\n**Step 3:** Purchase your first vehicle\n**Step 4:** Start racing and taking family trips!\n\n**💡 Benefits:**\n> • Unlock racing competitions for prize money\n> • Enable family trips to boost relationships\n> • Build a valuable automotive portfolio\n> • Show off your style and success`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0]?.toLowerCase();
            
            if (action === 'select' && args[1]) {
                const carIndex = parseInt(args[1]) - 1;
                if (carIndex < 0 || carIndex >= profile.cars.length) {
                    const components = [];

                    const invalidSelectionContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    invalidSelectionContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Car Selection\n## CAR NUMBER OUT OF RANGE\n\n> Car number must be between **1** and **${profile.cars.length}**!\n> Use \`!garage\` to see your numbered car list.`)
                    );

                    components.push(invalidSelectionContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
                const selectedCar = profile.cars[carIndex];
                profile.activeCar = selectedCar.carId;
                await profile.save();
                
                const components = [];

                const selectionSuccessContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                selectionSuccessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚗 Active Car Changed!\n## NEW VEHICLE SELECTED\n\n> You have successfully selected **${selectedCar.name}** as your active car!\n> This vehicle will now be used for racing and family trips.`)
                );

                components.push(selectionSuccessContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const carStatsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                carStatsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏎️ **ACTIVE VEHICLE STATS**\n\n**🚗 Vehicle:** \`${selectedCar.name}\`\n**⚡ Speed:** \`${selectedCar.speed}/100\`\n**🚀 Acceleration:** \`${selectedCar.acceleration}/100\`\n**🎯 Handling:** \`${selectedCar.handling}/100\`\n**🔧 Condition:** \`${selectedCar.durability}%\`\n**🏁 Race Record:** \`${selectedCar.raceWins}W/${selectedCar.raceLosses}L\``)
                );

                components.push(carStatsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
       
            const components = [];

         
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x0099FF);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏢 ${message.author.username}'s Garage\n## YOUR AUTOMOTIVE COLLECTION\n\n> Welcome to your personal garage! Here you can view all your vehicles, check their condition, and manage your automotive empire.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

         
            const carGroups = [];
            for (let i = 0; i < profile.cars.length; i += 3) {
                carGroups.push(profile.cars.slice(i, i + 3));
            }

            carGroups.forEach((group, groupIndex) => {
                const carContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                carContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚗 **VEHICLE COLLECTION ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((car, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const isActive = car.carId === profile.activeCar ? '🚗 **ACTIVE**' : '🅿️ Parked';
                    const condition = car.durability > 80 ? '🟢 Excellent' : car.durability > 50 ? '🟡 Good' : '🔴 Needs Repair';
                    const performanceRating = ((car.speed + car.acceleration + car.handling) / 3).toFixed(1);
                    
                    const carText = `**${actualIndex}. ${car.name}** ${isActive}\n` +
                        `> **📊 Performance:** \`${performanceRating}/100\` overall\n` +
                        `> **⚡ Speed:** \`${car.speed}\` • **🚀 Acceleration:** \`${car.acceleration}\` • **🎯 Handling:** \`${car.handling}\`\n` +
                        `> **🔧 Condition:** ${condition} (\`${car.durability}%\`)\n` +
                        `> **🏁 Racing Record:** \`${car.raceWins}\` wins, \`${car.raceLosses}\` losses\n` +
                        `> **💰 Current Value:** \`$${(car.currentValue || car.purchasePrice).toLocaleString()}\``;

                    carContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(carText)
                    );
                });

                components.push(carContainer);
                
                if (groupIndex < carGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xFF9800);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **GARAGE STATISTICS**')
            );

            const totalValue = profile.cars.reduce((sum, car) => sum + (car.currentValue || car.purchasePrice), 0);
            const averageCondition = profile.cars.reduce((sum, car) => sum + car.durability, 0) / profile.cars.length;
            const totalRaceWins = profile.cars.reduce((sum, car) => sum + car.raceWins, 0);
            const totalRaceLosses = profile.cars.reduce((sum, car) => sum + car.raceLosses, 0);
            const averagePerformance = profile.cars.reduce((sum, car) => sum + ((car.speed + car.acceleration + car.handling) / 3), 0) / profile.cars.length;

         
            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            const garageCapacity = primaryProperty ? primaryProperty.garageCapacity : 'Unlimited';

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏎️ Total Vehicles:** \`${profile.cars.length}${typeof garageCapacity === 'number' ? `/${garageCapacity}` : ''}\`\n**💰 Portfolio Value:** \`$${totalValue.toLocaleString()}\`\n**🔧 Average Condition:** \`${averageCondition.toFixed(1)}%\`\n**📊 Average Performance:** \`${averagePerformance.toFixed(1)}/100\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏆 Total Race Wins:** \`${totalRaceWins}\`\n**📉 Total Race Losses:** \`${totalRaceLosses}\`\n**📈 Overall Win Rate:** \`${totalRaceWins + totalRaceLosses > 0 ? ((totalRaceWins / (totalRaceWins + totalRaceLosses)) * 100).toFixed(1) : '0.0'}%\`\n**🚗 Active Car:** \`${profile.cars.find(c => c.carId === profile.activeCar)?.name || 'None selected'}\``)
            );

            components.push(statsContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🔧 **GARAGE MANAGEMENT**\n\n**🚗 Select Active Car:** \`!garage select <number>\`\n**🏁 Race Your Cars:** Use \`!race\` with your active vehicle\n**👨‍👩‍👧‍👦 Family Trips:** Take your family on adventures\n**🛒 Expand Collection:** Purchase more cars with \`!buycar\`\n**🔧 Maintenance:** Use shop items to repair car condition\n**📈 Performance:** Better cars = higher race win chances\n\n> Keep your cars in good condition for optimal performance!`)
            );

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in garage command:', error);

          
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **GARAGE ERROR**\n\nSomething went wrong while accessing your garage. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
