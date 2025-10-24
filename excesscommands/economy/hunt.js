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
    name: 'hunt',
    aliases: ['expedition', 'safari'],
    description: 'Go on a hunting expedition in the wild jungle',
    usage: '!hunt',
    cooldown: 300, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'hunt');
            if (cooldownCheck.onCooldown) {
                const { minutes, seconds } = cooldownCheck.timeLeft;
                
                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Expedition Cooldown\n## RECOVERY TIME\n\n> You need to rest between hunting expeditions!\n> **Time Remaining:** ${minutes}m ${seconds}s`)
                );

                return message.reply({
                    components: [cooldownContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            if (profile.huntingVehicles.length === 0 || profile.huntingWeapons.length === 0) {
                const components = [];

                const noEquipmentContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noEquipmentContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Missing Equipment\n## EXPEDITION CANCELLED\n\n> You need both a vehicle and weapon to go hunting!`)
                );

                components.push(noEquipmentContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **GET STARTED**\n\n**Command:** \`!huntshop\`\n**Buy:** Vehicles, weapons, and companions\n**Starting Budget:** You have $${profile.wallet.toLocaleString()} available`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            
            if (profile.huntingProfile.currentHealth < 20) {
                const components = [];

                const injuredContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                injuredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🩸 Too Injured to Hunt\n## MEDICAL ATTENTION NEEDED\n\n> Your health is too low (${profile.huntingProfile.currentHealth}/100)!\n> **Minimum Required:** 20 HP`)
                );

                const healingCost = Math.floor((100 - profile.huntingProfile.currentHealth) * 50);
                
                injuredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏥 Healing Cost:** $${healingCost.toLocaleString()}\n**💡 Command:** \`!heal self\``)
                );

                components.push(injuredContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const huntResult = await HuntingManager.executeHunt(profile);
            
     
            profile.huntingStats.totalHunts += 1;
            profile.huntingProfile.expeditionCount += 1;
            profile.huntingProfile.lastHunt = new Date();
            
            if (huntResult.success) {
                profile.huntingStats.successfulHunts += 1;
                profile.huntingStats.animalsKilled += 1;
                
             
                huntResult.loot.forEach(item => {
                    profile.huntingInventory.push(item);
                });
                
            } else {
                profile.huntingStats.failedHunts += 1;
            }

          
            profile.huntingStats.totalDamageDealt += huntResult.damageDealt;
            profile.huntingStats.totalDamageTaken += huntResult.damageTaken;
            profile.huntingProfile.hunterExperience += huntResult.experience;
            profile.huntingStats.huntingSkill = Math.min(100, profile.huntingStats.huntingSkill + huntResult.skillGain);

        
            const totalCosts = Object.values(huntResult.costs).reduce((sum, cost) => sum + cost, 0);
            if (totalCosts > 0) {
                profile.wallet = Math.max(0, profile.wallet - totalCosts);
                
                profile.transactions.push({
                    type: 'expense',
                    amount: totalCosts,
                    description: 'Hunting expedition costs',
                    category: 'hunting'
                });
            }

          
            profile.cooldowns.hunt = new Date();
            await profile.save();

       
            const components = [];

            if (huntResult.success) {
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Successful Hunt!\n## ${huntResult.animal.name.toUpperCase()} DEFEATED\n\n> You successfully hunted a **${huntResult.animal.name}** (Tier ${huntResult.animal.tier})!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const combatContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **COMBAT REPORT**`)
                );

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💥 Damage Dealt:** ${huntResult.damageDealt}\n**🩸 Damage Taken:** ${huntResult.damageTaken}\n**❤️ Health Remaining:** ${profile.huntingProfile.currentHealth}/100`)
                );

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Gained:** +${huntResult.experience} XP\n**📈 Skill Gained:** +${huntResult.skillGain}%\n**🎯 Hunting Skill:** ${profile.huntingStats.huntingSkill}%`)
                );

                components.push(combatContainer);

              
                if (huntResult.loot.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const lootContainer = new ContainerBuilder()
                        .setAccentColor(0xFFB02E);

                    lootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💎 **LOOT COLLECTED**`)
                    );

                    const lootText = huntResult.loot.slice(0, 5).map(item => 
                        `**${item.name}** (${item.rarity})\n> **Value:** $${item.currentValue.toLocaleString()} • **Type:** ${item.type}`
                    ).join('\n\n');

                    lootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(lootText)
                    );

                    if (huntResult.loot.length > 5) {
                        lootContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${huntResult.loot.length - 5} more items*`)
                        );
                    }

                    components.push(lootContainer);
                }

            } else {
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💥 Hunt Failed!\n## ${huntResult.animal.name.toUpperCase()} ESCAPED\n\n> The **${huntResult.animal.name}** proved too powerful and escaped!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xC0392B);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚑 **CASUALTIES**`)
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💥 Damage Dealt:** ${huntResult.damageDealt}\n**🩸 Damage Taken:** ${huntResult.damageTaken}\n**❤️ Health Remaining:** ${profile.huntingProfile.currentHealth}/100`)
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏥 Medical Costs:** $${huntResult.costs.healing.toLocaleString()}\n**⭐ Experience:** +${huntResult.experience} XP (participation)\n**💡 Tip:** Upgrade your equipment or bring more companions!`)
                );

                components.push(failureContainer);
            }

         
            if (huntResult.companionInjuries.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const injuryContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🩹 **COMPANION INJURIES**`)
                );

                const injuryText = huntResult.companionInjuries.map(injury =>
                    `**${injury.name}** - Injured!\n> **Healing Cost:** $${injury.healingCost.toLocaleString()}`
                ).join('\n\n');

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(injuryText)
                );

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Command:** \`!heal companions\` to restore them`)
                );

                components.push(injuryContainer);
            }

     
            if (totalCosts > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const costsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💸 **EXPEDITION COSTS**`)
                );

                const costBreakdown = Object.entries(huntResult.costs)
                    .filter(([key, value]) => value > 0)
                    .map(([key, value]) => `**${key.replace('_', ' ').toUpperCase()}:** $${value.toLocaleString()}`)
                    .join('\n');

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(costBreakdown)
                );

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Total Cost:** $${totalCosts.toLocaleString()}\n**💰 Remaining Balance:** $${profile.wallet.toLocaleString()}`)
                );

                components.push(costsContainer);
            }

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in hunt command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **HUNTING ERROR**\n\n${error.message || 'Something went wrong during your hunting expedition.'}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
