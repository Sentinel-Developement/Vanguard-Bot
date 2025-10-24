const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { SHOP_ITEMS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'shop',
    description: 'Browse and buy special items and power-ups with v2 components',
    usage: '!shop [buy <item_id>]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
           
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'shop');
            if (cooldownCheck.onCooldown) {
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Shop Purchase Cooldown\n## ANTI-SPAM PROTECTION ACTIVE\n\n> You've made a recent purchase and need to wait before buying again!\n> This prevents accidental duplicate purchases.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **COOLDOWN INFO**\n\n**Time Remaining:** \`${cooldownCheck.timeLeft.seconds}s\`\n**Cooldown Duration:** \`10 seconds\`\n\n> Browse the shop while you wait for the cooldown to end!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (!args[0]) {
               
                const categories = {
                    'pet_care': '🐕 Pet Care',
                    'vehicle': '🚗 Vehicle', 
                    'security': '🛡️ Security',
                    'family': '👨‍👩‍👧‍👦 Family',
                    'boost': '⚡ Boosts',
                    'storage': '📦 Storage'
                };
                
                const components = [];

           
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🛒 Premium Shop\n## EXCLUSIVE ITEMS & POWER-UPS\n\n> Welcome to the premium shop! Purchase special items to enhance your gameplay experience.\n> Current wallet: **\`$${profile.wallet.toLocaleString()}\`**`)
                );

                components.push(headerContainer);

                
                Object.entries(categories).forEach(([category, emoji]) => {
                    const items = Object.entries(SHOP_ITEMS).filter(([id, item]) => item.category === category);
                    if (items.length > 0) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        const categoryContainer = new ContainerBuilder()
                            .setAccentColor(getCategoryColor(category));

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## ${emoji}`)
                        );

                        
                        const itemsPerGroup = 3;
                        for (let i = 0; i < items.length; i += itemsPerGroup) {
                            const itemGroup = items.slice(i, i + itemsPerGroup);
                            const itemText = itemGroup.map(([id, item]) => 
                                `**\`${id}\`** - ${item.name}\n> **Price:** \`$${item.price.toLocaleString()}\`\n> **Effect:** ${item.description}`
                            ).join('\n\n');

                            categoryContainer.addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(itemText)
                            );
                        }

                        components.push(categoryContainer);
                    }
                });

           
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **HOW TO PURCHASE**\n\n**Command:** \`!shop buy <item_id>\`\n**Example:** \`!shop buy pet_food\`\n**Cooldown:** \`10 seconds between purchases\`\n\n> Choose your items wisely! Each purchase has strategic benefits for your economy journey.`)
                );

                components.push(instructionsContainer);
                
                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (args[0] === 'buy' && args[1]) {
                const itemId = args[1].toLowerCase();
                const item = SHOP_ITEMS[itemId];
                
                if (!item) {
                    const components = [];

                    const invalidItemContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    invalidItemContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Item ID\n## ITEM NOT FOUND\n\n> **\`${itemId}\`** is not a valid item ID!\n> Use \`!shop\` to see all available items with their correct IDs.`)
                    );

                    components.push(invalidItemContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
                if (profile.wallet < item.price) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD ITEM\n\n> You don't have enough money to purchase **${item.name}**!`)
                    );

                    components.push(insufficientContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const priceContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    priceContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Item:** \`${item.name}\`\n**Price:** \`$${item.price.toLocaleString()}\`\n**Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Shortage:** \`$${(item.price - profile.wallet).toLocaleString()}\`\n\n> Work, complete dailies, or sell assets to earn more money!`)
                    );

                    components.push(priceContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
                profile.wallet -= item.price;
                profile.cooldowns.shop = new Date();
                
                let effectDescription = '';
                
                switch (itemId) {
                    case 'pet_food':
                        if (profile.pets.length === 0) {
                            profile.wallet += item.price;
                            const components = [];

                            const noPetsContainer = new ContainerBuilder()
                                .setAccentColor(0xF39C12);

                            noPetsContainer.addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 🐕 No Pets Available\n## ITEM CANNOT BE USED\n\n> You need pets to use **${item.name}**!\n> Visit the pet shop to adopt some furry friends first.\n\n**💰 Refund:** Your money has been returned to your wallet.`)
                            );

                            components.push(noPetsContainer);

                            return message.reply({
                                components: components,
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                        profile.pets.forEach(pet => {
                            pet.hunger = Math.min(100, pet.hunger + 40);
                            pet.health = Math.min(100, pet.health + 10);
                        });
                        effectDescription = `Fed all ${profile.pets.length} pets! (+40 hunger, +10 health each)`;
                        break;
                        
                    case 'car_repair':
                        const car = profile.cars.find(c => c.carId === profile.activeCar);
                        if (!car) {
                            profile.wallet += item.price;
                            const components = [];

                            const noCarContainer = new ContainerBuilder()
                                .setAccentColor(0xF39C12);

                            noCarContainer.addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 🚗 No Active Car\n## ITEM CANNOT BE USED\n\n> You need an active car to use **${item.name}**!\n> Purchase a car and set it as active first.\n\n**💰 Refund:** Your money has been returned to your wallet.`)
                            );

                            components.push(noCarContainer);

                            return message.reply({
                                components: components,
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                        car.durability = Math.min(100, car.durability + 30);
                        effectDescription = `Repaired ${car.name}! (+30 durability, now ${car.durability}%)`;
                        break;
                        
                    case 'security_upgrade':
                        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
                        if (!primaryProperty) {
                            profile.wallet += item.price;
                            const components = [];

                            const noPropertyContainer = new ContainerBuilder()
                                .setAccentColor(0xF39C12);

                            noPropertyContainer.addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 🏠 No Property Available\n## ITEM CANNOT BE USED\n\n> You need to own a property to use **${item.name}**!\n> Purchase a property and set it as your primary residence first.\n\n**💰 Refund:** Your money has been returned to your wallet.`)
                            );

                            components.push(noPropertyContainer);

                            return message.reply({
                                components: components,
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                        primaryProperty.securityLevel = Math.min(10, primaryProperty.securityLevel + 2);
                        effectDescription = `Upgraded ${primaryProperty.name} security! (Level ${primaryProperty.securityLevel})`;
                        break;
                        
                    case 'family_vacation':
                        if (profile.familyMembers.length === 0) {
                            profile.wallet += item.price;
                            const components = [];

                            const noFamilyContainer = new ContainerBuilder()
                                .setAccentColor(0xF39C12);

                            noFamilyContainer.addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 👨‍👩‍👧‍👦 No Family Members\n## ITEM CANNOT BE USED\n\n> You need family members to use **${item.name}**!\n> Add family members to your household first.\n\n**💰 Refund:** Your money has been returned to your wallet.`)
                            );

                            components.push(noFamilyContainer);

                            return message.reply({
                                components: components,
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                        profile.familyMembers.forEach(member => {
                            member.bond = Math.min(100, member.bond + 15);
                        });
                        const newFamilyBond = Math.floor(profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length);
                        profile.familyBond = newFamilyBond;
                        effectDescription = `All family members gained +15% bond! (Family bond: ${profile.familyBond}%)`;
                        break;
                        
                    case 'lucky_charm':
                    case 'gambling_luck':
                    case 'robbery_protection':
                    case 'vault_expansion':
                    case 'bank_upgrade':
                        const effect = item.effect;
                        const duration = effect.duration;
                        const stacks = effect.stackable ? 1 : 1;
                        
                        await EconomyManager.addActiveEffect(
                            message.author.id, 
                            message.guild.id, 
                            effect.type, 
                            effect.multiplier, 
                            duration, 
                            stacks
                        );
                        
                        const hours = Math.floor(duration / (60 * 60 * 1000));
                        effectDescription = `${item.name} activated for ${hours} hours!`;
                        
                        if (effect.stackable) {
                            effectDescription += ` (Can stack up to 5 times)`;
                        }
                        break;
                }
                
              
                profile.transactions.push({
                    type: 'expense',
                    amount: item.price,
                    description: `Shop: ${item.name}`,
                    category: 'shop'
                });
                
                await profile.save();
                
              
                const components = [];

              
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🛒 Purchase Successful!\n## ITEM ACQUIRED\n\n> You successfully purchased **${item.name}** for **\`$${item.price.toLocaleString()}\`**!\n> Your new item is ready to use and enhance your gameplay.`)
                );

                components.push(successContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                
                const effectContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                effectContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ✨ **ITEM EFFECT**\n\n**Effect Applied:** ${effectDescription}\n**Item Description:** ${item.description}`)
                );

                effectContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**📊 Transaction Recorded:** Purchase logged in your transaction history`)
                );

                components.push(effectContainer);

              
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const tipsContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                tipsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **SHOPPING TIPS**\n\n**⏰ Cooldown:** Wait 10 seconds before your next purchase\n**🎯 Strategy:** Plan purchases based on your current needs\n**💰 Budget:** Monitor your wallet balance for smart shopping\n**📈 Effects:** Some items provide temporary boosts - use them wisely!\n\n> Return to \`!shop\` anytime to browse more premium items!`)
                );

                components.push(tipsContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error('Error in shop command:', error);

          
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **SHOP ERROR**\n\nSomething went wrong while processing your shop request. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getCategoryColor(category) {
    const colors = {
        'pet_care': 0xFF9800,   
        'vehicle': 0x2196F3,     
        'security': 0x4CAF50,   
        'family': 0x9C27B0,    
        'boost': 0xE91E63,      
        'storage': 0x607D8B      
    };
    return colors[category] || 0x9C27B0;
}
