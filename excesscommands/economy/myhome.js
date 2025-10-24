const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'myhome',
    aliases: ['home', 'house', 'property'],
    description: 'View your current property and family status with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.properties.length === 0) {
                const components = [];

                const noPropertyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noPropertyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 No Property Owned\n## START YOUR REAL ESTATE JOURNEY\n\n> You don't own any properties yet! Property ownership is essential for building your economy empire.\n> Properties provide family housing, secure storage, and garage space for your vehicles.`)
                );

                components.push(noPropertyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const startContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                startContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **GET YOUR FIRST HOME**\n\n**Step 1:** Use \`!buyhouse\` to browse available properties\n**Step 2:** Choose a property that fits your budget and needs\n**Step 3:** Set it as your primary residence\n**Step 4:** Start building your household with family and pets!\n\n**💡 Property Benefits:**\n> • House family members for work bonuses\n> • Secure family vault storage\n> • Garage space for vehicle collection\n> • Enhanced security against robberies\n> • Investment appreciation over time`)
                );

                components.push(startContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence) || profile.properties[0];
            const securityLevel = EconomyManager.calculateSecurityLevel(profile);
            const vaultCapacity = EconomyManager.getVaultCapacity(profile);
            const monthlyCost = primaryProperty.monthlyRent + primaryProperty.utilities;

            const components = [];

          
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            const conditionEmojis = {
                poor: '🔴 Poor',
                fair: '🟡 Fair', 
                good: '🟢 Good',
                excellent: '⭐ Excellent'
            };

            const conditionDisplay = conditionEmojis[primaryProperty.condition] || '🟢 Good';
            const ownershipDays = Math.floor((new Date() - new Date(primaryProperty.dateAcquired)) / (1000 * 60 * 60 * 24));

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏠 ${primaryProperty.name}\n## YOUR FAMILY HOME & ESTATE\n\n> Welcome to your beautiful home! This is your family's safe haven and the center of your economy empire.\n> **Property Type:** ${primaryProperty.type.toUpperCase()} • **Condition:** ${conditionDisplay}`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏘️ **PROPERTY SPECIFICATIONS**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏠 Property:** \`${primaryProperty.name}\`\n**🏷️ Type:** \`${primaryProperty.type}\`\n**🛡️ Base Security:** \`Level ${primaryProperty.securityLevel}\`\n**💰 Current Value:** \`$${primaryProperty.currentValue.toLocaleString()}\`\n**💸 Purchase Price:** \`$${primaryProperty.purchasePrice.toLocaleString()}\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Monthly Rent:** \`$${primaryProperty.monthlyRent.toLocaleString()}\`\n**⚡ Utilities:** \`$${primaryProperty.utilities.toLocaleString()}\`\n**💸 Total Monthly Cost:** \`$${monthlyCost.toLocaleString()}\`\n**📅 Owned Since:** \`${new Date(primaryProperty.dateAcquired).toLocaleDateString()}\` (${ownershipDays} days)\n**📈 Value Appreciation:** \`$${(primaryProperty.currentValue - primaryProperty.purchasePrice).toLocaleString()}\``)
            );

            components.push(detailsContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const familyContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            familyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👨‍👩‍👧‍👦 **HOUSEHOLD FAMILY**')
            );

            if (profile.familyMembers.length > 0) {
                familyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Family Size:** \`${profile.familyMembers.length}/${primaryProperty.maxFamilyMembers} members\`\n**Average Family Bond:** \`${profile.familyBond}%\`\n**Family Work Income:** \`$${EconomyManager.calculateFamilyIncome(profile).toLocaleString()}/work\``)
                );

                const familyList = profile.familyMembers.slice(0, 5).map(member => 
                    `**${member.name}** (${member.relationship})\n> **Profession:** \`${member.profession}\` • **Bond:** \`${member.bond}%\` • **Salary:** \`$${member.salary}/work\``
                ).join('\n\n');

                familyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(familyList)
                );

                if (profile.familyMembers.length > 5) {
                    familyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*...and ${profile.familyMembers.length - 5} more family members living here*`)
                    );
                }
            } else {
                familyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏠 Empty House:** Your home is ready for family members!\n**Capacity:** \`0/${primaryProperty.maxFamilyMembers} members\`\n\n**💡 Add Family:** Use family management commands to add loved ones\n**🎯 Benefits:** Family members provide work bonuses and companionship\n**❤️ Relationships:** Build bonds through trips and activities`)
                );
            }

            components.push(familyContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const garageContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            garageContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🚗 **VEHICLE GARAGE**')
            );

            if (primaryProperty.hasGarage) {
                garageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Garage Capacity:** \`${profile.cars.length}/${primaryProperty.garageCapacity} vehicles\`\n**Total Fleet Value:** \`$${profile.cars.reduce((sum, car) => sum + (car.currentValue || car.purchasePrice), 0).toLocaleString()}\``)
                );

                if (profile.cars.length > 0) {
                    const carList = profile.cars.slice(0, 4).map(car => {
                        const activeIndicator = car.carId === profile.activeCar ? '🚗 **ACTIVE**' : '🅿️ Parked';
                        const condition = car.durability > 80 ? '🟢' : car.durability > 50 ? '🟡' : '🔴';
                        return `**${car.name}** ${activeIndicator}\n> **Condition:** ${condition} \`${car.durability}%\` • **Value:** \`$${(car.currentValue || car.purchasePrice).toLocaleString()}\``;
                    }).join('\n\n');

                    garageContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(carList)
                    );

                    if (profile.cars.length > 4) {
                        garageContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.cars.length - 4} more vehicles in your garage*`)
                        );
                    }
                } else {
                    garageContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🏢 Empty Garage:** Your garage is ready for vehicles!\n\n**💡 Get Started:** Use \`!buycar\` to purchase your first vehicle\n**🎯 Benefits:** Cars enable racing and family trips`)
                    );
                }
            } else {
                garageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🚫 No Garage Available**\n\n**🏠 Property Limitation:** This property doesn't include garage space\n**💡 Upgrade Option:** Consider moving to a property with garage facilities\n**🚗 Vehicle Storage:** You'll need garage space to house vehicles safely`)
                );
            }

            components.push(garageContainer);

    
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const securityContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **SECURITY & STORAGE**')
            );

            const vaultUsage = ((profile.familyVault / vaultCapacity) * 100).toFixed(1);
            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔒 Total Security Level:** \`${securityLevel}%\`\n**🏠 Property Base Security:** \`${primaryProperty.securityLevel}\`\n**🐕 Pet Security Bonus:** \`+${securityLevel - primaryProperty.securityLevel}\`\n**🛡️ Robbery Protection:** Enhanced based on total security`)
            );

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏦 Family Vault Balance:** \`$${profile.familyVault.toLocaleString()}\`\n**📊 Vault Capacity:** \`$${vaultCapacity.toLocaleString()}\`\n**💾 Storage Used:** \`${vaultUsage}%\`\n**🔐 Vault Security:** Protected by property and pet security`)
            );

            components.push(securityContainer);

        
            if (profile.maxPets > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const petContainer = new ContainerBuilder()
                    .setAccentColor(0xFF69B4);

                petContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🐕 **PET COMPANIONS**')
                );

                petContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Pet Capacity:** \`${profile.pets.length}/${profile.maxPets} pets\`\n**Security Contribution:** \`+${securityLevel - primaryProperty.securityLevel}\` from pets\n**Pet Care Status:** ${profile.pets.filter(p => (p.happiness + p.health + p.cleanliness) / 3 > 70).length} well-cared pets`)
                );

                if (profile.pets.length > 0) {
                    const petList = profile.pets.slice(0, 3).map(pet => {
                        const condition = ((pet.happiness + pet.health + pet.cleanliness) / 3);
                        const conditionIcon = condition > 80 ? '🟢' : condition > 50 ? '🟡' : '🔴';
                        return `**${pet.name}** (${pet.breed}) ${conditionIcon}\n> **Security:** \`${pet.securityLevel}\` • **Condition:** \`${condition.toFixed(0)}%\``;
                    }).join('\n\n');

                    petContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(petList)
                    );

                    if (profile.pets.length > 3) {
                        petContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.pets.length - 3} more furry companions*`)
                        );
                    }
                } else {
                    petContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🐾 No Pets Yet:** Your home can house up to ${profile.maxPets} pets\n\n**💡 Adopt Today:** Use \`!buypet\` to add loyal companions\n**🛡️ Security Boost:** Pets enhance your property protection`)
                    );
                }

                components.push(petContainer);
            }

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **PROPERTY MANAGEMENT**\n\n**🏦 Vault Management:** Use \`!vault\` to manage your family's secure savings\n**👨‍👩‍👧‍👦 Family Growth:** Add more family members if space allows\n**🚗 Vehicle Collection:** Expand your garage with more cars for racing\n**🐕 Pet Adoption:** Adopt pets to increase security and companionship\n**🔧 Property Maintenance:** Keep your property in excellent condition\n**📈 Investment Tracking:** Monitor your property value appreciation\n\n> Your home is the foundation of your economy empire!`)
            );

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in myhome command:', error);

     
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **HOME INFORMATION ERROR**\n\nSomething went wrong while retrieving your home details. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
