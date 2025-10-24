const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { HuntingManager } = require('../../models/economy/huntingManager');
const { 
    HUNTING_VEHICLES, 
    HUNTING_WEAPONS, 
    HUNTING_COMPANIONS, 
    HUNTING_WAREHOUSES,
    FUEL_TYPES,
    AMMO_TYPES,
    MAINTENANCE_SUPPLIES
} = require('../../models/economy/constants/huntingData');

module.exports = {
    name: 'huntshop',
    aliases: ['huntstore', 'buyequipment'],
    description: 'Buy hunting vehicles, weapons, companions, warehouses, fuel, and ammo',
    usage: '!huntshop [category] [item] OR !huntshop buy [item_id] [quantity] OR !huntshop refuel/reload',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
     
            if (args[0] === 'refuel' && args[1] && args[2]) {
                const vehicleIndex = parseInt(args[1]) - 1;
                const fuelType = args[2].toLowerCase();
                const quantity = parseInt(args[3]) || 1;

                if (isNaN(vehicleIndex) || vehicleIndex < 0 || vehicleIndex >= profile.huntingVehicles.length) {
                    return this.sendError(message, 'Invalid vehicle number! Use `!hunting` to see your vehicles.');
                }

                const vehicle = profile.huntingVehicles[vehicleIndex];
                
                try {
                    const result = await HuntingManager.refuelVehicle(profile, vehicle.vehicleId, fuelType, quantity);
                    await profile.save();

                    const components = [];
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⛽ Vehicle Refueled!\n## ${vehicle.name.toUpperCase()}\n\n> Successfully added ${result.fuelAdded} fuel units!`)
                    );

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⛽ Fuel Added:** ${result.fuelAdded} units\n**🔋 New Fuel Level:** ${result.newFuelLevel}/${vehicle.fuelCapacity}\n**💰 Cost:** $${result.cost.toLocaleString()}\n**💳 Remaining Balance:** $${profile.wallet.toLocaleString()}`)
                    );

                    components.push(successContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

                } catch (error) {
                    return this.sendError(message, error.message);
                }
            }

    
            if (args[0] === 'reload' && args[1] && args[2]) {
                const weaponIndex = parseInt(args[1]) - 1;
                const ammoType = args[2].toLowerCase();
                const quantity = parseInt(args[3]) || 1;

                if (isNaN(weaponIndex) || weaponIndex < 0 || weaponIndex >= profile.huntingWeapons.length) {
                    return this.sendError(message, 'Invalid weapon number! Use `!hunting` to see your weapons.');
                }

                const weapon = profile.huntingWeapons[weaponIndex];
                
                try {
                    const result = await HuntingManager.reloadWeapon(profile, weapon.weaponId, ammoType, quantity);
                    await profile.save();

                    const components = [];
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🔫 Weapon Reloaded!\n## ${weapon.name.toUpperCase()}\n\n> Successfully added ${result.ammoAdded} rounds!`)
                    );

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🔫 Ammo Added:** ${result.ammoAdded} rounds\n**📊 New Ammo Level:** ${result.newAmmoLevel}/${weapon.ammoCapacity}\n**💰 Cost:** $${result.cost.toLocaleString()}\n**💳 Remaining Balance:** $${profile.wallet.toLocaleString()}`)
                    );

                    components.push(successContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

                } catch (error) {
                    return this.sendError(message, error.message);
                }
            }

          
            if (args[0] === 'buy' && args[1]) {
                const itemId = args[1].toLowerCase();
                const quantity = parseInt(args[2]) || 1;
                let item = null;
                let category = '';
                let price = 0;

            
                if (HUNTING_VEHICLES[itemId]) {
                    item = HUNTING_VEHICLES[itemId];
                    category = 'vehicle';
                    price = item.price;
                } else if (HUNTING_WEAPONS[itemId]) {
                    item = HUNTING_WEAPONS[itemId];
                    category = 'weapon';
                    price = item.price;
                } else if (HUNTING_COMPANIONS[itemId]) {
                    item = HUNTING_COMPANIONS[itemId];
                    category = 'companion';
                    price = item.price;
                } else if (HUNTING_WAREHOUSES[itemId]) {
                    item = HUNTING_WAREHOUSES[itemId];
                    category = 'warehouse';
                    price = item.price;
                } else if (FUEL_TYPES[itemId]) {
                    item = FUEL_TYPES[itemId];
                    category = 'fuel';
                    price = item.price * quantity;
                } else if (AMMO_TYPES[itemId]) {
                    item = AMMO_TYPES[itemId];
                    category = 'ammo';
                    price = item.price * quantity;
                } else if (MAINTENANCE_SUPPLIES[itemId]) {
                    item = MAINTENANCE_SUPPLIES[itemId];
                    category = 'maintenance';
                    price = item.price * quantity;
                }

                if (!item) {
                    return this.sendError(message, `Item \`${itemId}\` not found! Use \`!huntshop\` to browse available items.`);
                }

            
                if (profile.wallet < price) {
                    return this.sendInsufficientFunds(message, item.name, price, profile.wallet);
                }

                if (category === 'fuel' || category === 'ammo' || category === 'maintenance') {
                    profile.wallet -= price;
                    
                  
                    profile.huntingInventory.push({
                        itemId: `${itemId}_${Date.now()}`,
                        name: `${item.name} (x${quantity})`,
                        type: category,
                        rarity: 'common',
                        baseValue: price,
                        currentValue: price,
                        weight: quantity,
                        quantity: quantity,
                        huntDate: new Date(),
                        description: item.description,
                        consumableData: {
                            itemType: itemId,
                            usesRemaining: quantity
                        }
                    });

                    profile.transactions.push({
                        type: 'expense',
                        amount: price,
                        description: `Purchased ${quantity}x ${item.name}`,
                        category: 'hunting'
                    });

                    await profile.save();

                   
                    const components = [];
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ✅ Purchase Successful!\n## ${item.name.toUpperCase()}\n\n> Purchased ${quantity}x **${item.name}**!`)
                    );

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Total Cost:** $${price.toLocaleString()}\n**💳 Remaining Balance:** $${profile.wallet.toLocaleString()}\n**📦 Added to Inventory:** Use \`!inventory\` to see your consumables`)
                    );

                    if (category === 'fuel') {
                        successContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**💡 How to Use:** \`!huntshop refuel <vehicle#> ${itemId} <amount>\``)
                        );
                    } else if (category === 'ammo') {
                        successContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**💡 How to Use:** \`!huntshop reload <weapon#> ${itemId} <amount>\``)
                        );
                    }

                    components.push(successContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                }

            }

          
            const category = args[0]?.toLowerCase() || 'overview';
            const components = [];

            if (category === 'overview') {
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🛒 Complete Hunting Outfitters\n## WILDERNESS SUPPLY DEPOT\n\n> Everything you need for successful hunting expeditions!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const categoriesContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏪 **SHOP CATEGORIES**`)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🚗 Vehicles** - \`!huntshop vehicles\`\n**🔫 Weapons** - \`!huntshop weapons\`\n**👥 Companions** - \`!huntshop companions\`\n**🏭 Warehouses** - \`!huntshop warehouses\``)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⛽ Fuel** - \`!huntshop fuel\`\n**🔫 Ammunition** - \`!huntshop ammo\`\n**🔧 Maintenance** - \`!huntshop maintenance\``)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Quick Actions:**\n\`!huntshop refuel <vehicle#> <fuel_type> [amount]\`\n\`!huntshop reload <weapon#> <ammo_type> [amount]\``)
                );

                components.push(categoriesContainer);

                const playerContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                playerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **YOUR BUDGET**\n\n**Current Balance:** $${profile.wallet.toLocaleString()}\n**💡 How to Buy:** \`!huntshop buy <item_id> [quantity]\``)
                );

                components.push(playerContainer);

            } else {
               
                this.displayCategory(components, category, profile);
            }

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in huntshop command:', error);
            return this.sendError(message, `Couldn't process your request: ${error.message}`);
        }
    },

    displayCategory(components, category, profile) {
        let items = {};
        let categoryName = '';
        let categoryIcon = '';
        let accentColor = 0x3498DB;

        switch(category) {
            case 'vehicles':
                items = HUNTING_VEHICLES;
                categoryName = 'Vehicles';
                categoryIcon = '🚗';
                accentColor = 0x3498DB;
                break;
            case 'weapons':
                items = HUNTING_WEAPONS;
                categoryName = 'Weapons';
                categoryIcon = '🔫';
                accentColor = 0xE74C3C;
                break;
            case 'companions':
                items = HUNTING_COMPANIONS;
                categoryName = 'Companions';
                categoryIcon = '👥';
                accentColor = 0x9B59B6;
                break;
            case 'warehouses':
                items = HUNTING_WAREHOUSES;
                categoryName = 'Warehouses';
                categoryIcon = '🏭';
                accentColor = 0xFF9800;
                break;
         
            case 'fuel':
                items = FUEL_TYPES;
                categoryName = 'Fuel';
                categoryIcon = '⛽';
                accentColor = 0x2ECC71;
                break;
            case 'ammo':
                items = AMMO_TYPES;
                categoryName = 'Ammunition';
                categoryIcon = '🔫';
                accentColor = 0xFF5722;
                break;
            case 'maintenance':
                items = MAINTENANCE_SUPPLIES;
                categoryName = 'Maintenance';
                categoryIcon = '🔧';
                accentColor = 0x607D8B;
                break;
            default:
                return;
        }

        const headerContainer = new ContainerBuilder()
            .setAccentColor(accentColor);

        headerContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ${categoryIcon} ${categoryName} Shop\n## BROWSE ${categoryName.toUpperCase()}\n\n> Available ${categoryName.toLowerCase()} for purchase`)
        );

        components.push(headerContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const itemEntries = Object.entries(items).slice(0, 4);
        
        itemEntries.forEach(([itemId, item], index) => {
            const canAfford = profile.wallet >= item.price;
            
            const itemContainer = new ContainerBuilder()
                .setAccentColor(canAfford ? accentColor : 0x95A5A6);

            itemContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ${item.name}`)
            );

            let specs = '';
            if (category === 'fuel') {
                specs = `**⚡ Efficiency:** ${Math.floor((2.0 - item.efficiency) * 100)}% fuel savings\n**⛽ Fuel Value:** ${item.fuelValue} units per purchase\n**💰 Cost per Unit:** $${item.price}`;
            } else if (category === 'ammo') {
                const compatibleText = item.compatibleWeapons.join(', ');
                specs = `**🔫 Compatible:** ${compatibleText}\n**💥 Damage Bonus:** +${Math.floor((item.damage - 1) * 100)}%\n**🎯 Accuracy Bonus:** +${Math.floor((item.accuracy - 1) * 100)}%`;
            } else if (category === 'maintenance') {
                specs = `**🔧 Repair Amount:** ${item.repairAmount || 'N/A'}\n**🔄 Uses:** ${item.uses || 1}\n**⏰ Duration:** ${item.duration || 'Instant'} hunts`;
            }
         

            if (specs) {
                itemContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(specs)
                );
            }

            itemContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Price:** $${item.price.toLocaleString()} ${canAfford ? '✅' : '❌'}\n**📖 Description:** ${item.description}\n**💡 Buy:** \`!huntshop buy ${itemId} [quantity]\``)
            );

            components.push(itemContainer);
            
            if (index < itemEntries.length - 1) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            }
        });

        if (Object.keys(items).length > 4) {
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            
            const moreContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            moreContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*... and ${Object.keys(items).length - 4} more ${categoryName.toLowerCase()} available*\n\n**💰 Your Budget:** $${profile.wallet.toLocaleString()}`)
            );

            components.push(moreContainer);
        }
    },

    sendError(message, errorText) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C);

        errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ❌ Error\n## OPERATION FAILED\n\n> ${errorText}`)
        );

        return message.reply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    },

    sendInsufficientFunds(message, itemName, price, currentBalance) {
        const insufficientContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C);

        insufficientContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 💸 Insufficient Funds\n## CANNOT PURCHASE\n\n> You need $${price.toLocaleString()} to buy **${itemName}**!`)
        );

        insufficientContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**💰 Current Balance:** $${currentBalance.toLocaleString()}\n**💰 Required:** $${price.toLocaleString()}\n**💰 Shortage:** $${(price - currentBalance).toLocaleString()}`)
        );

        return message.reply({
            components: [insufficientContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
