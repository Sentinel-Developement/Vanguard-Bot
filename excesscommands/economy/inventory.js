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
    name: 'inventory',
    aliases: ['inv', 'huntinv', 'loot'],
    description: 'View your hunting inventory and loot',
    usage: '!inventory [filter] [page]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.huntingInventory.length === 0) {
                const components = [];

                const emptyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                emptyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📦 Empty Inventory\n## NO HUNTING LOOT\n\n> Your hunting inventory is empty!\n> Go on expeditions to collect valuable loot.`)
                );

                emptyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 How to Get Loot:**\n\`!hunt\` - Go hunting\n\`!huntshop\` - Buy supplies`)
                );

                components.push(emptyContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const filter = args[0]?.toLowerCase() || 'all';
            const page = parseInt(args[1]) || 1;
            const itemsPerPage = 8;

            
            let filteredItems = profile.huntingInventory;
            
            if (filter !== 'all') {
                filteredItems = profile.huntingInventory.filter(item => {
                    switch(filter) {
                        case 'rare':
                            return ['rare', 'epic', 'legendary', 'mythic'].includes(item.rarity);
                        case 'common':
                            return ['common', 'uncommon'].includes(item.rarity);
                        case 'lootbox':
                        case 'lootboxes':
                            return item.type === 'loot_box';
                        case 'meat':
                            return item.type === 'meat';
                        case 'pelt':
                        case 'pelts':
                            return item.type === 'pelt';
                        case 'trophy':
                        case 'trophies':
                            return item.type === 'trophy';
                        case 'materials':
                            return item.type === 'rare_material';
                        case 'artifacts':
                            return item.type === 'artifact';
                        case 'fuel':
                            return item.type === 'fuel';
                        case 'ammo':
                            return item.type === 'ammo';
                        default:
                            return item.type === filter || item.rarity === filter;
                    }
                });
            }

        
            filteredItems.sort((a, b) => (b.currentValue * b.quantity) - (a.currentValue * a.quantity));

            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageItems = filteredItems.slice(startIndex, endIndex);

            const components = [];

          
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎒 ${message.author.username}'s Hunting Inventory\n## LOOT COLLECTION\n\n> Showing ${filter === 'all' ? 'all items' : filter} (Page ${page}/${totalPages})`)
            );

            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            const statsContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            const totalItems = profile.huntingInventory.length;
            const totalValue = profile.huntingInventory.reduce((sum, item) => sum + (item.currentValue * item.quantity), 0);
            const storageUsed = HuntingManager.calculateInventoryWeight(profile);
            const storageCapacity = HuntingManager.calculateStorageCapacity(profile);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **INVENTORY STATISTICS**`)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📦 Total Items:** ${totalItems}\n**💰 Total Value:** $${totalValue.toLocaleString()}\n**⚖️ Storage:** ${storageUsed}/${storageCapacity} capacity`)
            );

            const rarityCount = {};
            profile.huntingInventory.forEach(item => {
                rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
            });

            const rarityText = Object.entries(rarityCount)
                .map(([rarity, count]) => `**${rarity.charAt(0).toUpperCase() + rarity.slice(1)}:** ${count}`)
                .join('\n');

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(rarityText)
            );

            components.push(statsContainer);

        
            if (pageItems.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const itemsContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                itemsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎁 **ITEMS (${startIndex + 1}-${Math.min(endIndex, filteredItems.length)} of ${filteredItems.length})**`)
                );

            
                for (let i = 0; i < pageItems.length; i += 2) {
                    let itemText = '';
                    
                    for (let j = i; j < Math.min(i + 2, pageItems.length); j++) {
                        const item = pageItems[j];
                        const rarityEmoji = {
                            'common': '⚪',
                            'uncommon': '🟢',
                            'rare': '🔵',
                            'epic': '🟣',
                            'legendary': '🟡',
                            'mythic': '🔴'
                        };

                        const typeEmoji = {
                            'meat': '🥩',
                            'pelt': '🦌',
                            'trophy': '🏆',
                            'rare_material': '💎',
                            'artifact': '⚱️',
                            'loot_box': '📦',
                            'fuel': '⛽',
                            'ammo': '🔫'
                        };

                        const emoji = rarityEmoji[item.rarity] || '⚪';
                        const typeIcon = typeEmoji[item.type] || '📦';
                        
                        itemText += `${emoji} **${item.name}** ${typeIcon}\n`;
                        itemText += `> **Value:** $${(item.currentValue * item.quantity).toLocaleString()}`;
                        if (item.quantity > 1) {
                            itemText += ` (${item.quantity}x $${item.currentValue.toLocaleString()})`;
                        }
                        itemText += `\n> **ID:** \`${item.itemId.slice(-8)}\`\n`;
                        
                        if (j < Math.min(i + 2, pageItems.length) - 1) {
                            itemText += '\n';
                        }
                    }
                    
                    itemsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(itemText)
                    );
                }

                components.push(itemsContainer);
            }

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📋 **QUICK COMMANDS**`)
            );

            let commandText = `**\`!sell <item_id>\`** - Sell specific item\n**\`!sell all <type>\`** - Sell all of type\n**\`!lootbox <item_id>\`** - Open loot box`;
            
            if (totalPages > 1) {
                commandText += `\n\n**Navigation:** Page ${page}/${totalPages}\n\`!inventory ${filter} ${page + 1}\` - Next page`;
            }

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(commandText)
            );

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Filters:** \`all\`, \`rare\`, \`common\`, \`lootboxes\`, \`meat\`, \`pelts\`, \`trophies\`, \`materials\`, \`artifacts\``)
            );

            components.push(footerContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in inventory command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **INVENTORY ERROR**\n\nCouldn't load your inventory. Please try again.`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
