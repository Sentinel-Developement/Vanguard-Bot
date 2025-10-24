const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { HuntingManager } = require('../../models/economy/huntingManager');

module.exports = {
    name: 'sell',
    aliases: ['sellitem', 'sellhunt', 'sellloot'],
    description: 'Sell hunting loot and items',
    usage: '!sell <item_id> OR !sell all <type> OR !sell confirm',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (!args[0]) {
                const components = [];

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Sell Hunting Loot\n## HOW TO SELL ITEMS\n\n> Various ways to sell your hunting inventory`)
                );

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Sell Specific Item:**\n\`!sell <item_id>\` - Sell one item\n\n**📦 Sell by Type:**\n\`!sell all meat\` - Sell all meat\n\`!sell all common\` - Sell all common items\n\`!sell all pelts\` - Sell all pelts`)
                );

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Available Types:**\n\`meat\`, \`pelts\`, \`trophies\`, \`materials\`, \`artifacts\`, \`common\`, \`uncommon\`, \`rare\`\n\n**📋 Use \`!inventory\` to see your items and their IDs**`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (args[0] === 'all' && args[1]) {
              
                const type = args[1].toLowerCase();
                
                let itemsToSell = [];
                profile.huntingInventory.forEach(item => {
                    switch(type) {
                        case 'meat':
                            if (item.type === 'meat') itemsToSell.push(item.itemId);
                            break;
                        case 'pelts':
                        case 'pelt':
                            if (item.type === 'pelt') itemsToSell.push(item.itemId);
                            break;
                        case 'trophies':
                        case 'trophy':
                            if (item.type === 'trophy') itemsToSell.push(item.itemId);
                            break;
                        case 'materials':
                        case 'rare_material':
                            if (item.type === 'rare_material') itemsToSell.push(item.itemId);
                            break;
                        case 'artifacts':
                        case 'artifact':
                            if (item.type === 'artifact') itemsToSell.push(item.itemId);
                            break;
                        case 'common':
                        case 'uncommon':
                        case 'rare':
                        case 'epic':
                        case 'legendary':
                        case 'mythic':
                            if (item.rarity === type) itemsToSell.push(item.itemId);
                            break;
                        case 'fuel':
                            if (item.type === 'fuel') itemsToSell.push(item.itemId);
                            break;
                        case 'ammo':
                            if (item.type === 'ammo') itemsToSell.push(item.itemId);
                            break;
                    }
                });

                if (itemsToSell.length === 0) {
                    const components = [];

                    const noItemsContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noItemsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📦 No Items Found\n## NOTHING TO SELL\n\n> You don't have any **${type}** items to sell!`)
                    );

                    components.push(noItemsContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

            
                let totalValue = 0;
                const itemDetails = [];
                
                itemsToSell.forEach(itemId => {
                    const item = profile.huntingInventory.find(i => i.itemId === itemId);
                    if (item) {
                        let sellValue = item.currentValue;
                        const warehouse = profile.huntingWarehouses.find(w => item.location === w.warehouseId);
                        if (warehouse) {
                            sellValue = Math.floor(sellValue * warehouse.bonusMultiplier);
                        }
                        
                        totalValue += sellValue * item.quantity;
                        itemDetails.push({
                            name: item.name,
                            value: sellValue * item.quantity,
                            quantity: item.quantity
                        });
                    }
                });

             
                const result = await HuntingManager.sellHuntingItems(profile, itemsToSell);
                await profile.save();

                const components = [];

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Bulk Sale Complete!\n## SOLD ALL ${type.toUpperCase()}\n\n> Successfully sold ${result.soldItems.length} items!`)
                );

                components.push(successContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **SALE SUMMARY**`)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Total Earned:** $${result.totalValue.toLocaleString()}\n**📦 Items Sold:** ${result.soldItems.length}\n**💳 New Balance:** $${profile.wallet.toLocaleString()}\n**📈 Total Hunting Earnings:** $${profile.huntingStats.totalEarnings.toLocaleString()}`)
                );

               
                const topItems = result.soldItems
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map(item => `**${item.name}** - $${item.value.toLocaleString()}`)
                    .join('\n');

                if (topItems) {
                    detailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🏆 Most Valuable Items:**\n${topItems}`)
                    );
                }

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const itemId = args[0];
            
          
            let item = profile.huntingInventory.find(i => i.itemId === itemId);
            if (!item) {
                item = profile.huntingInventory.find(i => i.itemId.endsWith(itemId));
            }

            if (!item) {
                const components = [];

                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Item Not Found\n## INVALID ITEM ID\n\n> Item with ID \`${itemId}\` not found!\n> Use \`!inventory\` to see your items and their IDs.`)
                );

                components.push(notFoundContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            let sellValue = item.currentValue;
            const warehouse = profile.huntingWarehouses.find(w => item.location === w.warehouseId);
            let warehouseBonus = 0;
            
            if (warehouse) {
                const bonusValue = Math.floor(item.currentValue * warehouse.bonusMultiplier) - item.currentValue;
                warehouseBonus = bonusValue * item.quantity;
                sellValue = Math.floor(item.currentValue * warehouse.bonusMultiplier);
            }

            const totalSellValue = sellValue * item.quantity;

           
            const result = await HuntingManager.sellHuntingItems(profile, [item.itemId]);
            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💰 Item Sold Successfully!\n## ${item.name.toUpperCase()}\n\n> Sold for $${totalSellValue.toLocaleString()}!`)
            );

            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📋 **SALE DETAILS**`)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📦 Item:** ${item.name}\n**⭐ Rarity:** ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}\n**📊 Quantity:** ${item.quantity}`)
            );

            let valueBreakdown = `**💰 Base Value:** $${(item.currentValue * item.quantity).toLocaleString()}`;
            if (warehouseBonus > 0) {
                valueBreakdown += `\n**🏭 Warehouse Bonus:** +$${warehouseBonus.toLocaleString()}`;
            }
            valueBreakdown += `\n**💎 Total Earned:** $${totalSellValue.toLocaleString()}\n**💳 New Balance:** $${profile.wallet.toLocaleString()}`;

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(valueBreakdown)
            );

            components.push(detailsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in sell command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **SELL ERROR**\n\nCouldn't process the sale: ${error.message}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
