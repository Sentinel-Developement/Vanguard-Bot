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
    name: 'hunting',
    aliases: ['hunter', 'huntstats'],
    description: 'View your complete hunting profile and statistics',
    usage: '!hunting',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const components = [];

     
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x8E44AD);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦁 ${message.author.username}'s Hunting Profile\n## WILDERNESS EXPLORER\n\n> Your complete hunting expedition overview`)
            );

            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
            const statsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **HUNTER STATISTICS**`)
            );

            const successRate = profile.huntingStats.totalHunts > 0 ? 
                Math.floor((profile.huntingStats.successfulHunts / profile.huntingStats.totalHunts) * 100) : 0;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏹 Hunter Level:** ${profile.huntingProfile.hunterLevel}\n**⭐ Experience:** ${profile.huntingProfile.hunterExperience.toLocaleString()} XP\n**❤️ Health:** ${profile.huntingProfile.currentHealth}/100`)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Hunting Skill:** ${profile.huntingStats.huntingSkill}%\n**🛡️ Survival Skill:** ${profile.huntingStats.survivalSkill}%\n**⭐ Success Rate:** ${successRate}%`)
            );

            components.push(statsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

      
            const historyContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            historyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **EXPEDITION HISTORY**`)
            );

            historyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Total Expeditions:** ${profile.huntingStats.totalHunts}\n**✅ Successful:** ${profile.huntingStats.successfulHunts}\n**❌ Failed:** ${profile.huntingStats.failedHunts}`)
            );

            historyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦌 Animals Killed:** ${profile.huntingStats.animalsKilled}\n**💰 Total Earnings:** $${profile.huntingStats.totalEarnings.toLocaleString()}\n**📦 Loot Boxes Found:** ${profile.huntingStats.lootBoxesFound}`)
            );

            components.push(historyContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const equipmentContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            equipmentContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎒 **EQUIPMENT OVERVIEW**`)
            );

            const activeVehicle = profile.huntingVehicles.find(v => v.vehicleId === profile.activeVehicle);
            const activeWeapon = profile.huntingWeapons.find(w => w.weaponId === profile.activeWeapon);
            const activeCompanionCount = profile.activeCompanions.length;

            equipmentContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Active Vehicle:** ${activeVehicle ? activeVehicle.name : 'None'}\n**🔫 Active Weapon:** ${activeWeapon ? activeWeapon.name : 'None'}\n**👥 Active Companions:** ${activeCompanionCount}/${profile.maxCompanions}`)
            );

            equipmentContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Total Vehicles:** ${profile.huntingVehicles.length}\n**🔫 Total Weapons:** ${profile.huntingWeapons.length}\n**👥 Total Companions:** ${profile.huntingCompanions.length}`)
            );

            components.push(equipmentContainer);

          
            const storageUsed = HuntingManager.calculateInventoryWeight(profile);
            const storageCapacity = HuntingManager.calculateStorageCapacity(profile);

            if (profile.huntingWarehouses.length > 0 || profile.huntingInventory.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const storageContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                storageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏭 **STORAGE & INVENTORY**`)
                );

                storageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📦 Inventory Items:** ${profile.huntingInventory.length}\n**⚖️ Storage Used:** ${storageUsed}/${storageCapacity} capacity\n**🏭 Warehouses:** ${profile.huntingWarehouses.length}`)
                );

                const totalInventoryValue = profile.huntingInventory.reduce((sum, item) => sum + (item.currentValue * item.quantity), 0);
                
                storageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Inventory Value:** $${totalInventoryValue.toLocaleString()}\n**💡 Command:** \`!inventory\` to view items\n**💡 Command:** \`!sell\` to sell items`)
                );

                components.push(storageContainer);
            }

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const commandsContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            commandsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📋 **QUICK COMMANDS**\n\n**\`!hunt\`** - Go hunting\n**\`!huntshop\`** - Buy equipment\n**\`!inventory\`** - View loot\n**\`!upgrade\`** - Upgrade weapons\n**\`!heal\`** - Heal injuries`)
            );

            components.push(commandsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in hunting command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **PROFILE ERROR**\n\nCouldn't load your hunting profile. Please try again.`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
