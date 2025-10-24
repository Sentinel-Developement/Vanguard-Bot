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
    name: 'upgrade',
    aliases: ['upg', 'improve', 'enhance'],
    description: 'Upgrade your hunting weapons and vehicles',
    usage: '!upgrade weapon <#> OR !upgrade vehicle <#>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (!args[0] || !args[1]) {
                const components = [];

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚡ Equipment Upgrade Center\n## IMPROVE YOUR GEAR\n\n> Enhance your weapons and vehicles for better performance`)
                );

                components.push(helpContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔧 **UPGRADE COMMANDS**`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔫 Weapon Upgrades:**\n\`!upgrade weapon <number>\`\n> Increases damage, accuracy, and critical chance\n> Max level: 10`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🚗 Vehicle Upgrades:**\n\`!upgrade vehicle <number>\`\n> Increases capacity, fuel tank, and jungle depth\n> Max tier: 5`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 How to Find Numbers:**\n\`!hunting\` - Shows all your equipment with numbers\n\n**💰 Upgrade Costs:**\n> Weapons: 30% of purchase price × level\n> Vehicles: 40% of purchase price × tier`)
                );

                components.push(commandsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const equipmentType = args[0].toLowerCase();
            const equipmentNumber = parseInt(args[1]);

            if (equipmentType === 'weapon') {
           
                if (isNaN(equipmentNumber) || equipmentNumber < 1 || equipmentNumber > profile.huntingWeapons.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Weapon Number\n## WEAPON NOT FOUND\n\n> Invalid weapon number! You have ${profile.huntingWeapons.length} weapons.\n> Use \`!hunting\` to see your weapons with numbers.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const weapon = profile.huntingWeapons[equipmentNumber - 1];
                
                try {
                    const result = await HuntingManager.upgradeWeapon(profile, weapon.weaponId);
                    await profile.save();

                    const components = [];

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚡ Weapon Upgraded!\n## ${weapon.name.toUpperCase()}\n\n> Successfully upgraded to level ${result.newLevel}!`)
                    );

                    components.push(successContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const upgradeContainer = new ContainerBuilder()
                        .setAccentColor(0x2196F3);

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📈 **UPGRADE IMPROVEMENTS**`)
                    );

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Upgrade Cost:** $${result.upgradeCost.toLocaleString()}\n**⚡ New Level:** ${result.newLevel}/10\n**💳 Remaining Balance:** $${profile.wallet.toLocaleString()}`)
                    );

                    const improvementsText = `**💥 Damage:** ${result.newStats.damage} (+${result.improvements.damage})\n**🎯 Accuracy:** ${result.newStats.accuracy}% (+${result.improvements.accuracy}%)\n**💥 Critical Chance:** ${result.newStats.criticalChance}% (+${result.improvements.criticalChance}%)`;

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(improvementsText)
                    );

                    if (result.newLevel < 10) {
                        const nextUpgradeCost = Math.floor(weapon.purchasePrice * 0.3 * (result.newLevel + 1));
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🔮 Next Upgrade Cost:** $${nextUpgradeCost.toLocaleString()}`)
                        );
                    } else {
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🏆 MAXIMUM LEVEL REACHED!**\n> This weapon is fully upgraded!`)
                        );
                    }

                    components.push(upgradeContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });

                } catch (error) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Upgrade Failed\n## ${error.message}\n\n> ${weapon.name} could not be upgraded.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            if (equipmentType === 'vehicle') {
              
                if (isNaN(equipmentNumber) || equipmentNumber < 1 || equipmentNumber > profile.huntingVehicles.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Vehicle Number\n## VEHICLE NOT FOUND\n\n> Invalid vehicle number! You have ${profile.huntingVehicles.length} vehicles.\n> Use \`!hunting\` to see your vehicles with numbers.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const vehicle = profile.huntingVehicles[equipmentNumber - 1];
                
                try {
                    const result = await HuntingManager.upgradeVehicle(profile, vehicle.vehicleId);
                    await profile.save();

                    const components = [];

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚡ Vehicle Upgraded!\n## ${vehicle.name.toUpperCase()}\n\n> Successfully upgraded to tier ${result.newTier}!`)
                    );

                    components.push(successContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const upgradeContainer = new ContainerBuilder()
                        .setAccentColor(0xFF9800);

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🚗 **UPGRADE IMPROVEMENTS**`)
                    );

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Upgrade Cost:** $${result.upgradeCost.toLocaleString()}\n**⚡ New Tier:** ${result.newTier}/5\n**💳 Remaining Balance:** $${profile.wallet.toLocaleString()}`)
                    );

                    const improvementsText = `**📦 Capacity:** ${vehicle.capacity} animals (+${result.improvements.capacity})\n**⛽ Fuel Tank:** ${vehicle.fuelCapacity} units (+${result.improvements.fuelCapacity})\n**🌲 Jungle Depth:** ${vehicle.jungleDepth}/10 (+${result.improvements.jungleDepth})`;

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(improvementsText)
                    );

                    if (result.newTier < 5) {
                        const nextUpgradeCost = Math.floor(vehicle.purchasePrice * 0.4 * result.newTier);
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🔮 Next Upgrade Cost:** $${nextUpgradeCost.toLocaleString()}`)
                        );
                    } else {
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🏆 MAXIMUM TIER REACHED!**\n> This vehicle is fully upgraded!`)
                        );
                    }

                    components.push(upgradeContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });

                } catch (error) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Upgrade Failed\n## ${error.message}\n\n> ${vehicle.name} could not be upgraded.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

         
            const components = [];

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Invalid Equipment Type\n## UNKNOWN TYPE\n\n> Valid types are: \`weapon\` or \`vehicle\`\n> Example: \`!upgrade weapon 1\``)
            );

            components.push(errorContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in upgrade command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **UPGRADE ERROR**\n\nCouldn't process the upgrade: ${error.message}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
