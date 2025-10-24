const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'deposit',
    aliases: ['dep'],
    description: 'Deposit money into your bank with v2 components',
    async execute(message, args) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            let amount;
            if (args[0] === 'all' || args[0] === 'max') {
                amount = Math.min(profile.wallet, profile.bankLimit - profile.bank);
            } else {
                amount = parseInt(args[0], 10);
            }

       
            const bankLimit = EconomyManager.getBankLimit(profile);

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Deposit Amount\n## PLEASE SPECIFY VALID AMOUNT\n\n> Please specify a valid amount to deposit or use special keywords.`)
                );

                components.push(invalidContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **USAGE EXAMPLES**\n\n**\`!deposit 1000\`** - Deposit specific amount\n**\`!deposit all\`** - Deposit all available funds\n**\`!deposit max\`** - Deposit maximum possible\n\n**Current Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Available Space:** \`$${(bankLimit - profile.bank).toLocaleString()}\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (amount > profile.wallet) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Wallet Funds\n## NOT ENOUGH MONEY TO DEPOSIT\n\n> You don't have enough money in your wallet for this deposit!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **WALLET BREAKDOWN**\n\n**Current Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Attempted Deposit:** \`$${amount.toLocaleString()}\`\n**Shortage:** \`$${(amount - profile.wallet).toLocaleString()}\`\n\n**💡 Tip:** Try \`!deposit all\` to deposit everything you have!`)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.bank + amount > bankLimit) {
                const maxDeposit = bankLimit - profile.bank;
                const components = [];

                const limitContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                limitContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Bank Limit Exceeded\n## MAXIMUM CAPACITY REACHED\n\n> Your bank account doesn't have enough space for this deposit!`)
                );

                components.push(limitContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const limitDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                limitDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **BANK CAPACITY DETAILS**\n\n**Current Bank Balance:** \`$${profile.bank.toLocaleString()}\`\n**Bank Limit:** \`$${bankLimit.toLocaleString()}\`\n**Available Space:** \`$${maxDeposit.toLocaleString()}\`\n**Attempted Deposit:** \`$${amount.toLocaleString()}\``)
                );

                limitDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Solutions:**\n> • Try \`!deposit ${maxDeposit}\` to fill remaining space\n> • Upgrade your bank limit through properties or roles\n> • Use \`!deposit max\` for automatic maximum deposit`)
                );

                components.push(limitDetailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            const newWallet = profile.wallet - amount;
            const newBank = profile.bank + amount;

          
            await EconomyManager.updateWallet(userId, guildId, -amount);
            await EconomyManager.updateBank(userId, guildId, amount);

         
            profile.transactions.push({
                type: 'transfer',
                amount: amount,
                description: 'Bank deposit',
                category: 'banking'
            });
            await profile.save();

          
            const components = [];

          
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Deposit Successful!\n## MONEY SAFELY BANKED\n\n> You have successfully deposited **\`$${amount.toLocaleString()}\`** into your bank account!\n> Your money is now secure and earning interest.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **TRANSACTION SUMMARY**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Deposit Amount:** \`$${amount.toLocaleString()}\`\n**⏰ Transaction Time:** \`${new Date().toLocaleString()}\`\n**📝 Transaction Type:** \`Bank Deposit\`\n**🏷️ Category:** \`Banking\``)
            );

            components.push(detailsContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const balancesContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏦 **UPDATED ACCOUNT BALANCES**')
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💳 Wallet Balance:** \`$${newWallet.toLocaleString()}\`\n**🏦 Bank Balance:** \`$${newBank.toLocaleString()}\`\n**📊 Bank Limit:** \`$${bankLimit.toLocaleString()}\``)
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📈 Bank Usage:** \`${((newBank / bankLimit) * 100).toFixed(1)}%\`\n**💾 Remaining Space:** \`$${(bankLimit - newBank).toLocaleString()}\`\n**💎 Total Net Worth:** \`$${(newWallet + newBank + profile.familyVault).toLocaleString()}\``)
            );

            components.push(balancesContainer);

     
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **BANKING BENEFITS**\n\n**🛡️ Security:** Money in bank is safer from robberies\n**📈 Interest:** Bank money may earn passive income\n**🏠 Requirements:** Some purchases require banked funds\n**👨‍👩‍👧‍👦 Family:** Separate from family vault for organization\n\n> Use \`!withdraw <amount>\` to take money out when needed!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in deposit command:', error);

       
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **DEPOSIT ERROR**\n\nSomething went wrong while processing your bank deposit. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
