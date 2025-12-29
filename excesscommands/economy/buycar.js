const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { CARS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buycar',
    aliases: ['car-buy'],
    description: 'Buy a car for racing and family trips with v2 components',
    usage: '!buycar <car_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
              
                const components = [];

               
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x0099FF);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚗 Car Dealership\n## PREMIUM VEHICLE COLLECTION\n\n> Welcome to the car dealership! Choose from our selection of high-performance vehicles for racing and family adventures.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
                const carEntries = Object.entries(CARS);
                const carsByType = {};
                
           
                carEntries.forEach(([id, car]) => {
                    if (!carsByType[car.type]) {
                        carsByType[car.type] = [];
                    }
                    carsByType[car.type].push([id, car]);
                });

             
                Object.entries(carsByType).forEach(([type, cars]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getCarTypeColor(type));

                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${getCarTypeEmoji(type)} **${type.toUpperCase()} VEHICLES**`)
                    );

              
                    for (let i = 0; i < cars.length; i += 3) {
                        const carGroup = cars.slice(i, i + 3);
                        const carText = carGroup.map(([id, car]) => 
                            `**\`${id}\`** - ${car.name}\n> **Price:** \`$${car.price.toLocaleString()}\`\n> **Performance:** Speed ${car.speed} • Acceleration ${car.acceleration} • Handling ${car.handling}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(carText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

           
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **HOW TO PURCHASE**\n\n**Command:** \`!buycar <car_id>\`\n**Example:** \`!buycar sports_car\`\n\n**💡 Tips:**\n> • Higher performance = Better racing results\n> • First car automatically becomes your active car\n> • Cars enable family trips and racing participation`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const carId = args[0].toLowerCase();
            const carData = CARS[carId];

            if (!carData) {
                const components = [];

                const invalidCarContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidCarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Car ID\n## VEHICLE NOT FOUND\n\n> **\`${carId}\`** is not a valid car ID!\n> Use \`!buycar\` to see all available vehicles with their correct IDs.`)
                );

                components.push(invalidCarContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

      
            if (profile.cars.some(car => car.carId === carId)) {
                const components = [];

                const duplicateCarContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateCarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Vehicle Already Owned\n## DUPLICATE PURCHASE BLOCKED\n\n> You already own a **${carData.name}**!\n> Each player can only own one of each car model.\n\n**💡 Tip:** Check your garage with car management commands to see your current collection.`)
                );

                components.push(duplicateCarContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

           
            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            if (primaryProperty && profile.cars.length >= primaryProperty.garageCapacity) {
                const components = [];

                const garageFullContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                garageFullContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Garage Full\n## MAXIMUM VEHICLE CAPACITY REACHED\n\n> Your garage is at maximum capacity!\n> You can't purchase more cars without additional storage space.`)
                );

                components.push(garageFullContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **GARAGE STATUS**\n\n**Current Cars:** \`${profile.cars.length}\`\n**Garage Capacity:** \`${primaryProperty.garageCapacity}\`\n**Property:** \`${primaryProperty.name}\`\n\n**💡 Solutions:**\n> • Upgrade to a larger property with bigger garage\n> • Sell existing cars to make space\n> • Consider property with premium garage features`)
                );

                components.push(capacityContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < carData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD VEHICLE\n\n> You don't have enough money to purchase the **${carData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Vehicle:** \`${carData.name}\`\n**Price:** \`$${carData.price.toLocaleString()}\`\n**Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Shortage:** \`$${(carData.price - profile.wallet).toLocaleString()}\`\n\n**💡 Earning Tips:** Work, complete dailies, race (if you have a car), or run businesses to earn more money!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

      
            profile.wallet -= carData.price;
            profile.cars.push({
                carId,
                name: carData.name,
                type: carData.type,
                speed: carData.speed,
                acceleration: carData.acceleration,
                handling: carData.handling,
                purchasePrice: carData.price,
                currentValue: carData.price,
                maintenanceCost: carData.maintenanceCost,
                durability: 100,
                raceWins: 0,
                raceLosses: 0,
                totalDistance: 0,
                dateAcquired: new Date()
            });

           
            if (!profile.activeCar) {
                profile.activeCar = carId;
            }

          
            profile.transactions.push({
                type: 'expense',
                amount: carData.price,
                description: `Purchased car: ${carData.name}`,
                category: 'vehicle'
            });

            await profile.save();

      
            const components = [];

      
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x0099FF);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🚗 Car Purchase Successful!\n## VEHICLE ACQUIRED\n\n> Congratulations! You've successfully purchased a **${carData.name}** for **\`$${carData.price.toLocaleString()}\`**!\n> ${!profile.cars.find(c => c.carId !== carId) ? 'This is now your active car and ready for racing!' : 'Your new car is ready for action!'}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

      
            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏁 **VEHICLE SPECIFICATIONS**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Vehicle Name:** \`${carData.name}\`\n**🏷️ Vehicle Type:** \`${carData.type}\`\n**🏁 Speed:** \`${carData.speed}/100\`\n**⚡ Acceleration:** \`${carData.acceleration}/100\`\n**🎯 Handling:** \`${carData.handling}/100\``)
            );

            const overallPerformance = ((carData.speed + carData.acceleration + carData.handling) / 3).toFixed(1);
            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📊 Overall Performance:** \`${overallPerformance}/100\`\n**🔧 Condition:** \`100%\` (Brand New)\n**💰 Maintenance Cost:** \`$${carData.maintenanceCost}/repair\`\n**📅 Purchase Date:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(specsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **TRANSACTION SUMMARY**\n\n**Purchase Price:** \`$${carData.price.toLocaleString()}\`\n**Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Total Cars Owned:** \`${profile.cars.length}\`\n**Transaction Logged:** Purchase recorded in your transaction history`)
            );

            components.push(financialContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **WHAT'S NEXT?**\n\n**🏁 Racing:** Use \`!race\` to compete and earn money\n**👨‍👩‍👧‍👦 Family Trips:** Take your family on adventures with \`!trip\`\n**🔧 Maintenance:** Keep your car in top condition for best performance\n**📊 Stats:** Check your car collection and racing statistics\n\n> Your new vehicle opens up exciting gameplay opportunities!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buycar command:', error);

        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **CAR PURCHASE ERROR**\n\nSomething went wrong while processing your car purchase. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getCarTypeColor(type) {
    const colors = {
        'economy': 0x95A5A6,  
        'sports': 0x3498DB,      
        'luxury': 0x9B59B6,     
        'supercar': 0xE91E63,    
        'hypercar': 0xF39C12     
    };
    return colors[type] || 0x0099FF;
}

function getCarTypeEmoji(type) {
    const emojis = {
        'economy': '🚙',
        'sports': '🏎️',
        'luxury': '🚗',
        'supercar': '🏁',
        'hypercar': '⚡'
    };
    return emojis[type] || '🚗';
}
