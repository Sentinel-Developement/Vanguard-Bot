const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { PROPERTIES } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buyhouse',
    aliases: ['house-buy', 'property'],
    description: 'Buy a property to house your family and cars with v2 components',
    usage: '!buyhouse <property_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
          
                const components = [];

             
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Premium Real Estate Market\n## EXCLUSIVE PROPERTY COLLECTION\n\n> Welcome to the premium property market! Invest in real estate to expand your family capacity, secure storage, and unlock new gameplay features.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
                const propertyEntries = Object.entries(PROPERTIES);
                const propertiesByType = {};
                
                propertyEntries.forEach(([id, prop]) => {
                    if (!propertiesByType[prop.type]) {
                        propertiesByType[prop.type] = [];
                    }
                    propertiesByType[prop.type].push([id, prop]);
                });

                Object.entries(propertiesByType).forEach(([type, properties]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getPropertyTypeColor(type));

                    const emoji = getPropertyTypeEmoji(type);
                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${emoji} **${type.toUpperCase()} PROPERTIES**`)
                    );

                    for (let i = 0; i < properties.length; i += 3) {
                        const propertyGroup = properties.slice(i, i + 3);
                        const propertyText = propertyGroup.map(([id, prop]) => 
                            `**\`${id}\`** - ${prop.name}\n> **Price:** \`$${prop.price.toLocaleString()}\`\n> **Family:** ${prop.maxFamilyMembers} • **Security:** ${prop.securityLevel} • **Vault:** $${prop.vaultCapacity.toLocaleString()}\n> **Garage:** ${prop.hasGarage ? `${prop.garageCapacity} cars` : 'None'} • **Monthly:** $${(prop.monthlyRent + prop.utilities).toLocaleString()}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(propertyText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

   
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **HOW TO PURCHASE**\n\n**Command:** \`!buyhouse <property_id>\`\n**Example:** \`!buyhouse mansion\`\n\n**💡 Benefits:**\n> • House your family members securely\n> • Unlock family vault storage\n> • Enable garage for multiple cars\n> • Increase security against robberies\n> • First property becomes your primary residence`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const propertyId = args[0].toLowerCase();
            const propertyData = PROPERTIES[propertyId];

            if (!propertyData) {
                const components = [];

                const invalidPropertyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidPropertyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Property ID\n## PROPERTY NOT FOUND\n\n> **\`${propertyId}\`** is not a valid property ID!\n> Use \`!buyhouse\` to see all available properties with their correct IDs.`)
                );

                components.push(invalidPropertyContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            
            if (profile.properties.some(p => p.propertyId === propertyId)) {
                const components = [];

                const duplicatePropertyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicatePropertyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Property Already Owned\n## DUPLICATE PURCHASE BLOCKED\n\n> You already own **${propertyData.name}**!\n> Each player can only own one of each property type.\n\n**💡 Tip:** Check your property portfolio with property management commands to see your current real estate holdings.`)
                );

                components.push(duplicatePropertyContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < propertyData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD PROPERTY\n\n> You don't have enough money to purchase **${propertyData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Property:** \`${propertyData.name}\`\n**Price:** \`$${propertyData.price.toLocaleString()}\`\n**Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Shortage:** \`$${(propertyData.price - profile.wallet).toLocaleString()}\`\n\n**💡 Investment Tips:** Work consistently, run businesses, or race to build wealth for real estate investments!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

       
            profile.wallet -= propertyData.price;
            profile.properties.push({
                propertyId,
                name: propertyData.name,
                type: propertyData.type,
                purchasePrice: propertyData.price,
                currentValue: propertyData.price,
                monthlyRent: propertyData.monthlyRent,
                utilities: propertyData.utilities,
                securityLevel: propertyData.securityLevel,
                maxFamilyMembers: propertyData.maxFamilyMembers,
                hasGarage: propertyData.hasGarage,
                garageCapacity: propertyData.garageCapacity,
                vaultCapacity: propertyData.vaultCapacity,
                condition: 'good',
                dateAcquired: new Date()
            });

        
            if (!profile.primaryResidence) {
                profile.primaryResidence = propertyId;
                profile.maxPets = Math.floor(propertyData.maxFamilyMembers / 2);
            }

         
            profile.transactions.push({
                type: 'expense',
                amount: propertyData.price,
                description: `Purchased property: ${propertyData.name}`,
                category: 'property'
            });

            await profile.save();

           
            const components = [];

         
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏠 Property Purchase Successful!\n## REAL ESTATE ACQUIRED\n\n> Congratulations! You've successfully purchased **${propertyData.name}** for **\`$${propertyData.price.toLocaleString()}\`**!\n> ${!profile.properties.find(p => p.propertyId !== propertyId) ? 'This is now your primary residence!' : 'Your real estate portfolio is growing!'}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏘️ **PROPERTY SPECIFICATIONS**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏠 Property Name:** \`${propertyData.name}\`\n**🏷️ Property Type:** \`${propertyData.type}\`\n**👨‍👩‍👧‍👦 Family Capacity:** \`${propertyData.maxFamilyMembers} members\`\n**🛡️ Security Level:** \`${propertyData.securityLevel}/10\`\n**🏦 Vault Capacity:** \`$${propertyData.vaultCapacity.toLocaleString()}\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Garage:** ${propertyData.hasGarage ? `\`${propertyData.garageCapacity} cars\`` : '\`None\`'}\n**💰 Monthly Rent:** \`$${propertyData.monthlyRent.toLocaleString()}\`\n**⚡ Utilities:** \`$${propertyData.utilities.toLocaleString()}\`\n**💸 Total Monthly:** \`$${(propertyData.monthlyRent + propertyData.utilities).toLocaleString()}\`\n**📅 Purchase Date:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(specsContainer);

      
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const featuresContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            featuresContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🎉 **UNLOCKED FEATURES**')
            );

            const unlockedFeatures = [];
            if (propertyData.maxFamilyMembers > 0) unlockedFeatures.push(`**👨‍👩‍👧‍👦 Family Housing:** Accommodate up to ${propertyData.maxFamilyMembers} family members`);
            if (propertyData.vaultCapacity > 0) unlockedFeatures.push(`**🏦 Family Vault:** Secure storage for $${propertyData.vaultCapacity.toLocaleString()}`);
            if (propertyData.hasGarage) unlockedFeatures.push(`**🚗 Vehicle Garage:** Park up to ${propertyData.garageCapacity} cars safely`);
            if (propertyData.securityLevel > 0) unlockedFeatures.push(`**🛡️ Enhanced Security:** Level ${propertyData.securityLevel} protection against robberies`);
            if (!profile.properties.find(p => p.propertyId !== propertyId)) unlockedFeatures.push(`**🐕 Pet Ownership:** House up to ${Math.floor(propertyData.maxFamilyMembers / 2)} pets`);

            featuresContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(unlockedFeatures.join('\n\n'))
            );

            components.push(featuresContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **FINANCIAL SUMMARY**\n\n**Purchase Price:** \`$${propertyData.price.toLocaleString()}\`\n**Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Total Properties:** \`${profile.properties.length}\`\n**Property Investment:** \`$${profile.properties.reduce((sum, p) => sum + p.purchasePrice, 0).toLocaleString()}\`\n**Transaction Logged:** Purchase recorded in your transaction history`)
            );

            components.push(financialContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            nextStepsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **WHAT'S NEXT?**\n\n**👨‍👩‍👧‍👦 Add Family:** Recruit family members to work and earn bonuses\n**🏦 Use Vault:** Deposit money in your family vault for security\n**🚗 Park Cars:** Store multiple vehicles in your garage\n**🐕 Adopt Pets:** Add pets for companionship and security\n**📈 Property Value:** Watch your real estate investment appreciate over time\n\n> Your new property opens up exciting expansion opportunities!`)
            );

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buyhouse command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PROPERTY PURCHASE ERROR**\n\nSomething went wrong while processing your property purchase. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getPropertyTypeColor(type) {
    const colors = {
        'studio': 0x95A5A6,     
        'apartment': 0x607D8B,  
        'house': 0x4CAF50,     
        'mansion': 0x9C27B0,     
        'penthouse': 0xFF9800,   
        'estate': 0xE91E63       
    };
    return colors[type] || 0x4CAF50;
}

function getPropertyTypeEmoji(type) {
    const emojis = {
        'studio': '🏢',
        'apartment': '🏢',
        'house': '🏡',
        'mansion': '🏰',
        'penthouse': '🌆',
        'estate': '🏰'
    };
    return emojis[type] || '🏠';
}
