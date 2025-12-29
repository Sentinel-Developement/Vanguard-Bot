const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'vault',
    aliases: ['fvault'],
    description: 'Manage your family vault with v2 components',
    usage: '!vault <deposit/withdraw> <amount>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            if (!primaryProperty) {
                const components = [];

                const noPropertyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noPropertyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Property Required for Vault\n## SECURE STORAGE NEEDS A HOME\n\n> You need to own a property to have a family vault!\n> A vault requires a secure location to store your family's wealth.`)
                );

                components.push(noPropertyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **GET STARTED WITH PROPERTY**\n\n**💡 Solutions:**\n> • Purchase a property through the property shop\n> • Set it as your primary residence\n> • Unlock family vault storage capacity\n> • Enjoy secure wealth storage for your family\n\n**Benefits of Family Vault:**\n> • Enhanced security from robberies\n> • Separate from personal banking\n> • Family-focused wealth management`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        
        
            const vaultCapacity = EconomyManager.getVaultCapacity(profile);
            const securityLevel = EconomyManager.calculateSecurityLevel(profile);
            
            if (!args[0]) {
          
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Family Vault Management\n## SECURE WEALTH STORAGE CENTER\n\n> Your family's secure financial storage facility\n> Protected by advanced security systems and property-based encryption`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const statusContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **VAULT STATUS**')
                );

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Current Balance:** \`$${profile.familyVault.toLocaleString()}\`\n**📊 Vault Capacity:** \`$${vaultCapacity.toLocaleString()}\`\n**📈 Usage:** \`${((profile.familyVault / vaultCapacity) * 100).toFixed(1)}%\`\n**💾 Available Space:** \`$${(vaultCapacity - profile.familyVault).toLocaleString()}\``)
                );

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🛡️ Security Level:** \`${securityLevel}%\`\n**🏠 Property:** \`${primaryProperty.name}\`\n**🏘️ Property Type:** \`${primaryProperty.type}\``)
                );

                components.push(statusContainer);

             
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **VAULT OPERATIONS**\n\n**\`!vault deposit <amount>\`** - Store money securely\n**\`!vault withdraw <amount>\`** - Retrieve stored funds\n**\`!vault deposit all\`** - Deposit all available wallet funds\n**\`!vault withdraw all\`** - Withdraw all vault funds\n\n**💡 Tip:** Keep emergency funds in vault for maximum security!`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0].toLowerCase();
            let amount;

            if (!['deposit', 'withdraw'].includes(action)) {
                const components = [];

                const invalidActionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidActionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Vault Operation\n## UNKNOWN COMMAND\n\n> **\`${action}\`** is not a valid vault operation!\n> Use **\`deposit\`** or **\`withdraw\`** only.`)
                );

                components.push(invalidActionContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **CORRECT USAGE**\n\n**\`!vault deposit <amount>\`** - Store money in vault\n**\`!vault withdraw <amount>\`** - Take money from vault\n\n**Examples:**\n> \`!vault deposit 5000\`\n> \`!vault withdraw 2000\`\n> \`!vault deposit all\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            if (args[1] === 'all' || args[1] === 'max') {
                if (action === 'deposit') {
                    amount = Math.min(profile.wallet, vaultCapacity - profile.familyVault);
                } else {
                    amount = profile.familyVault;
                }
            } else {
                amount = parseInt(args[1]);
            }
            
            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Amount\n## PLEASE ENTER VALID NUMBER\n\n> Please enter a valid amount greater than zero!\n> **Examples:** \`1000\`, \`5000\`, \`all\`, \`max\``)
                );

                components.push(invalidAmountContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **CURRENT BALANCES**\n\n**💳 Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**🏦 Family Vault:** \`$${profile.familyVault.toLocaleString()}\`\n**📊 Vault Capacity:** \`$${vaultCapacity.toLocaleString()}\``)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (action === 'deposit') {
                if (amount > profile.wallet) {
                    const components = [];

                    const insufficientWalletContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientWalletContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Wallet Funds\n## NOT ENOUGH MONEY TO DEPOSIT\n\n> You don't have enough money in your wallet for this deposit!`)
                    );

                    components.push(insufficientWalletContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const walletBreakdownContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    walletBreakdownContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💳 **WALLET ANALYSIS**\n\n**Current Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Attempted Deposit:** \`$${amount.toLocaleString()}\`\n**Shortage:** \`$${(amount - profile.wallet).toLocaleString()}\`\n\n**💡 Suggestion:** Try \`!vault deposit all\` to deposit everything you have!`)
                    );

                    components.push(walletBreakdownContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
                if (profile.familyVault + amount > vaultCapacity) {
                    const maxDeposit = vaultCapacity - profile.familyVault;
                    const components = [];

                    const capacityContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    capacityContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📊 Vault Capacity Exceeded\n## MAXIMUM STORAGE LIMIT REACHED\n\n> Your family vault doesn't have enough space for this deposit!`)
                    );

                    components.push(capacityContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const capacityDetailsContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    capacityDetailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏦 **VAULT CAPACITY ANALYSIS**\n\n**Current Vault Balance:** \`$${profile.familyVault.toLocaleString()}\`\n**Maximum Capacity:** \`$${vaultCapacity.toLocaleString()}\`\n**Available Space:** \`$${maxDeposit.toLocaleString()}\`\n**Attempted Deposit:** \`$${amount.toLocaleString()}\``)
                    );

                    capacityDetailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💡 Solutions:**\n> • Try \`!vault deposit ${maxDeposit}\` to fill remaining space\n> • Upgrade your property for more vault capacity\n> • Use \`!vault deposit max\` for automatic maximum deposit`)
                    );

                    components.push(capacityDetailsContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
             
                profile.wallet -= amount;
                profile.familyVault += amount;
                
                const components = [];

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Vault Deposit Successful!\n## FUNDS SECURELY STORED\n\n> Successfully deposited **\`$${amount.toLocaleString()}\`** into your family vault!\n> Your family's wealth is now safely protected.`)
                );

                components.push(successContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const transactionContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                transactionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **TRANSACTION SUMMARY**\n\n**💰 Deposited Amount:** \`$${amount.toLocaleString()}\`\n**💳 New Wallet Balance:** \`$${profile.wallet.toLocaleString()}\`\n**🏦 New Vault Balance:** \`$${profile.familyVault.toLocaleString()}\`\n**📈 Vault Usage:** \`${((profile.familyVault / vaultCapacity) * 100).toFixed(1)}%\``)
                );

                components.push(transactionContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
                
            } else if (action === 'withdraw') {
                if (amount > profile.familyVault) {
                    const components = [];

                    const insufficientVaultContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientVaultContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Vault Funds\n## NOT ENOUGH MONEY IN VAULT\n\n> You don't have enough money in your family vault for this withdrawal!`)
                    );

                    components.push(insufficientVaultContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const vaultBreakdownContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    vaultBreakdownContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏦 **VAULT ANALYSIS**\n\n**Current Vault Balance:** \`$${profile.familyVault.toLocaleString()}\`\n**Attempted Withdrawal:** \`$${amount.toLocaleString()}\`\n**Shortage:** \`$${(amount - profile.familyVault).toLocaleString()}\`\n\n**💡 Suggestion:** Try \`!vault withdraw all\` to withdraw everything available!`)
                    );

                    components.push(vaultBreakdownContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
         
                profile.familyVault -= amount;
                profile.wallet += amount;
                
                const components = [];

                const withdrawSuccessContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                withdrawSuccessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Vault Withdrawal Successful!\n## FUNDS TRANSFERRED TO WALLET\n\n> Successfully withdrew **\`$${amount.toLocaleString()}\`** from your family vault!\n> The funds are now available in your wallet for immediate use.`)
                );

                components.push(withdrawSuccessContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const withdrawTransactionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                withdrawTransactionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **WITHDRAWAL SUMMARY**\n\n**💰 Withdrawn Amount:** \`$${amount.toLocaleString()}\`\n**💳 New Wallet Balance:** \`$${profile.wallet.toLocaleString()}\`\n**🏦 New Vault Balance:** \`$${profile.familyVault.toLocaleString()}\`\n**📈 Vault Usage:** \`${((profile.familyVault / vaultCapacity) * 100).toFixed(1)}%\``)
                );

                components.push(withdrawTransactionContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            await profile.save();

        } catch (error) {
            console.error('Error in vault command:', error);

      
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **VAULT ERROR**\n\nSomething went wrong while processing your vault operation. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
