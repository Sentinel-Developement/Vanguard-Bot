const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { BUSINESS_TYPES, HEIST_TARGETS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'profile',
    aliases: ['stats', 'me'],
    description: 'View your complete economy profile with v2 components',
    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
            const profile = await EconomyManager.getProfile(targetUser.id, message.guild.id);
            
            const totalWealth = profile.wallet + profile.bank + profile.familyVault;
            const securityLevel = EconomyManager.calculateSecurityLevel(profile);
            const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
            const carValue = profile.cars.reduce((sum, car) => sum + car.currentValue, 0);
            const propertyValue = profile.properties.reduce((sum, prop) => sum + prop.currentValue, 0);
            const winRate = profile.racingStats.totalRaces > 0 ? 
                ((profile.racingStats.wins / profile.racingStats.totalRaces) * 100).toFixed(1) : '0.0';
            
            const components = [];

      
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📊 ${targetUser.username}'s Complete Profile\n## YOUR ECONOMY STATISTICS & ACHIEVEMENTS\n\n> Comprehensive overview of your progress, assets, and achievements`)
            );

            components.push(headerContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **FINANCIAL STATUS**')
            );

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💵 Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**🏦 Bank:** \`$${profile.bank.toLocaleString()}\`\n**🏠 Family Vault:** \`$${profile.familyVault.toLocaleString()}\`\n**💎 Total Wealth:** \`$${totalWealth.toLocaleString()}\``)
            );

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📈 Level:** \`${profile.level}\`\n**⭐ Experience:** \`${profile.experience.toLocaleString()} XP\`\n**🏆 Reputation:** \`${profile.reputation}\`\n**💼 Work Multiplier:** \`${workMultiplier.toFixed(2)}x\``)
            );

            components.push(financialContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
            const assetsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏠 **ASSETS & PROPERTIES**')
            );

            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏘️ Properties Owned:** \`${profile.properties.length}\`\n**🏠 Property Value:** \`$${propertyValue.toLocaleString()}\`\n**🚗 Cars Owned:** \`${profile.cars.length}\`\n**🚙 Car Value:** \`$${carValue.toLocaleString()}\``)
            );

            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👨‍👩‍👧‍👦 Family Members:** \`${profile.familyMembers.length}\`\n**💝 Family Bond:** \`${profile.familyBond}%\`\n**🐕 Pets:** \`${profile.pets.length}/${profile.maxPets}\`\n**🛡️ Security Level:** \`${securityLevel}%\``)
            );

            components.push(assetsContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

    
            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏁 **RACING & SECURITY STATS**')
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏁 Total Races:** \`${profile.racingStats.totalRaces}\`\n**🏆 Race Wins:** \`${profile.racingStats.wins}\`\n**📊 Win Rate:** \`${winRate}%\`\n**💰 Race Earnings:** \`$${profile.racingStats.earnings.toLocaleString()}\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔓 Robbery Attempts:** \`${profile.robberyAttempts}\`\n**📅 Last Robbed:** \`${profile.lastRobbed ? new Date(profile.lastRobbed).toLocaleDateString() : 'Never'}\`\n**👑 Active Roles:** \`${profile.purchasedRoles.filter(r => !r.expiryDate || r.expiryDate > new Date()).length}\``)
            );

            components.push(statsContainer);

         
            if (profile.businesses.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const businessContainer = new ContainerBuilder()
                    .setAccentColor(0x8E44AD);

                businessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🏢 **BUSINESS EMPIRE**')
                );

            
                const totalBusinessValue = profile.businesses.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
                const totalProfit = profile.businesses.reduce((sum, b) => sum + (b.profit || 0), 0);
                const totalRevenue = profile.businesses.reduce((sum, b) => sum + (b.revenue || 0), 0);

                businessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏢 Active Businesses:** \`${profile.businesses.length}/${profile.maxBusinesses}\`\n**📊 Business Skill:** \`${profile.businessSkill}%\`\n**💰 Total Investment:** \`$${totalBusinessValue.toLocaleString()}\`\n**📈 Total Profit:** \`$${totalProfit.toLocaleString()}\``)
                );

            
                if (profile.businesses.length > 0) {
                    let businessDetails = profile.businesses.slice(0, 3).map(business => {
                        const businessType = BUSINESS_TYPES[business.type];
                        const lastCollection = business.lastCollection ? 
                            new Date(business.lastCollection).toLocaleDateString() : 'Never';
                        
                        return `**\`${business.name}\`** (${businessType?.name || business.type})\n` +
                               `> **Level:** \`${business.level}/10\` • **Employees:** \`${business.employees}\`\n` +
                               `> **Reputation:** \`${business.reputation}%\` • **Efficiency:** \`${(business.efficiency * 100).toFixed(0)}%\`\n` +
                               `> **Last Collection:** \`${lastCollection}\``;
                    }).join('\n\n');

                    if (profile.businesses.length > 3) {
                        businessDetails += `\n\n*...and ${profile.businesses.length - 3} more businesses*`;
                    }

                    businessContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(businessDetails)
                    );
                }

                components.push(businessContainer);
            }

         
            if (profile.completedHeists > 0 || profile.failedHeists > 0 || profile.activeHeists.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const heistContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                heistContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **HEIST OPERATIONS**')
                );

              
                const totalHeists = profile.completedHeists + profile.failedHeists;
                const heistSuccessRate = totalHeists > 0 ? 
                    ((profile.completedHeists / totalHeists) * 100).toFixed(1) : '0.0';

                heistContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Total Heists:** \`${totalHeists}\`\n**✅ Successful Heists:** \`${profile.completedHeists}\`\n**❌ Failed Heists:** \`${profile.failedHeists}\`\n**📊 Success Rate:** \`${heistSuccessRate}%\``)
                );

                heistContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔓 Heist Skill:** \`${profile.heistSkill}%\`\n**🔥 Heat Level:** \`${profile.heatLevel}%\`\n**🚨 Active Heists:** \`${profile.activeHeists.length}\`\n**⏰ Jail Status:** \`${profile.jailTime && profile.jailTime > new Date() ? 'In Jail' : 'Free'}\``)
                );

              
                if (profile.jailTime && profile.jailTime > new Date()) {
                    const jailTimeLeft = Math.ceil((profile.jailTime - new Date()) / (60 * 60 * 1000));
                    heistContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🔒 CURRENTLY IN JAIL**\n\n> **Time Remaining:** \`${jailTimeLeft} hours\`\n> **Release Date:** \`${new Date(profile.jailTime).toLocaleString()}\``)
                    );
                }

              
                if (profile.activeHeists.length > 0) {
                    heistContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🎯 ACTIVE HEIST OPERATIONS**\n\n> You are currently involved in \`${profile.activeHeists.length}\` active heist(s)\n> Use \`!heist status\` for detailed information`)
                    );
                }

                components.push(heistContainer);
            }

          
            if (profile.activeEffects && profile.activeEffects.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const effectsContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **ACTIVE ENHANCEMENT EFFECTS**')
                );

                let effectsText = profile.activeEffects.slice(0, 3).map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    const stackText = effect.stacks > 1 ? ` (×${effect.stacks})` : '';
                    return `**\`${effect.name}\`**${stackText}\n> **Duration:** \`${timeLeft}h remaining\` • **Multiplier:** \`${effect.multiplier}x\``;
                }).join('\n\n');

                if (profile.activeEffects.length > 3) {
                    effectsText += `\n\n*...and ${profile.activeEffects.length - 3} more effects*`;
                }

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(effectsText)
                );

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚡ Total Active Effects:** \`${profile.activeEffects.length}\``)
                );

                components.push(effectsContainer);
            }

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **PROFILE INFORMATION**\n\n**Profile Created:** \`${new Date(profile.createdAt).toLocaleDateString()}\`\n**Last Activity:** \`${new Date(profile.updatedAt).toLocaleDateString()}\`\n**Daily Streak:** \`${profile.dailyStreak} days\`\n**Total Transactions:** \`${profile.transactions.length}\``)
            );

            components.push(footerContainer);

          
            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in profile command:', error);
            
        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PROFILE ERROR**\n\nUnable to retrieve profile information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
