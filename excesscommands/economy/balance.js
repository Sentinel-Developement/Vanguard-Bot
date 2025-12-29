const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'money'],
    description: 'Check your financial status with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const totalWealth = profile.wallet + profile.bank + profile.familyVault;
            const securityLevel = EconomyManager.calculateSecurityLevel(profile);
            const vaultCapacity = EconomyManager.getVaultCapacity(profile);
            const bankLimit = EconomyManager.getBankLimit(profile);
            
            const components = [];

        
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💼 ${message.author.username}'s Financial Portfolio\n## YOUR COMPLETE FINANCIAL OVERVIEW\n\n> Your current financial status and wealth information`)
            );

            components.push(headerContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            const cashContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            cashContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **LIQUID ASSETS**')
            );

            cashContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💵 Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**🏦 Bank Balance:** \`$${profile.bank.toLocaleString()}\`\n**📊 Bank Limit:** \`$${bankLimit.toLocaleString()}\``)
            );

            cashContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏠 Family Vault:** \`$${profile.familyVault.toLocaleString()}\`\n**📦 Vault Capacity:** \`$${vaultCapacity.toLocaleString()}\`\n**🛡️ Security Level:** \`${securityLevel}%\``)
            );

            components.push(cashContainer);

           
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const wealthContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            wealthContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **WEALTH SUMMARY**')
            );

            wealthContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Total Net Worth:** \`$${totalWealth.toLocaleString()}\`\n**📈 Character Level:** \`${profile.level}\`\n**⭐ Experience Points:** \`${profile.experience.toLocaleString()} XP\``)
            );

            wealthContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👨‍👩‍👧‍👦 Family Bond:** \`${profile.familyBond}%\`\n**🏆 Reputation:** \`${profile.reputation}\``)
            );

            components.push(wealthContainer);

            
            if (profile.activeEffects && profile.activeEffects.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const effectsContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **ACTIVE ENHANCEMENT EFFECTS**')
                );

                let effectsText = profile.activeEffects.map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    const stackText = effect.stacks > 1 ? ` (×${effect.stacks})` : '';
                    return `**\`${effect.name}\`**${stackText} • ${effect.description || 'Active boost'}\n\n> **Duration:** \`${timeLeft}h remaining\``;
                }).join('\n\n');

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
                    .setContent(`## 📅 **ACCOUNT INFORMATION**\n\n**Last Updated:** \`${new Date().toLocaleString()}\`\n**Profile Created:** \`${new Date(profile.createdAt).toLocaleDateString()}\``)
            );

            components.push(footerContainer);

          
            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in balance command:', error);
            
         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BALANCE ERROR**\n\nUnable to retrieve your financial information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
