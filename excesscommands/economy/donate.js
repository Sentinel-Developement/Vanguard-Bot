const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'donate',
    aliases: ['give', 'transfer'],
    description: 'Donate money to another user with v2 components',
    usage: '!donate @user <amount>',
    cooldown: 5000,
    async execute(message, args) {
        try {


            
            if (args.length < 2) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Command Usage\n## MISSING REQUIRED PARAMETERS\n\n> **Correct Usage:** \`!donate @user <amount>\`\n> **Example:** \`!donate @friend 1000\`\n> **Donate All:** \`!donate @friend all\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const target = message.mentions.users.first();
            if (!target) {
                const components = [];

                const noUserContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noUserContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ No User Mentioned\n## RECIPIENT REQUIRED\n\n> You need to mention a valid user to donate to!\n> **Example:** \`!donate @friend 500\`\n\n**💡 Tip:** Make sure to use @ to mention the user properly.`)
                );

                components.push(noUserContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (target.id === message.author.id) {
                const components = [];

                const selfDonateContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                selfDonateContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Self-Donation Not Allowed\n## CANNOT DONATE TO YOURSELF\n\n> Nice try, but you cannot donate to yourself!\n> Find a friend to share your wealth with instead.`)
                );

                components.push(selfDonateContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (target.bot) {
                const components = [];

                const botDonateContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                botDonateContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤖 Bot Donations Not Allowed\n## BOTS DON'T NEED MONEY\n\n> You cannot donate to bots! They don't have economy profiles.\n> Find a real person to help instead.`)
                );

                components.push(botDonateContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }


        
            let amount;
            try {
                if (args[1] === 'all' || args[1] === 'max') {
                   
                    const tempProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
                    
                    if (typeof tempProfile.wallet !== 'number') {
                        tempProfile.wallet = 0;
                        await tempProfile.save();
                    }
                    
                    amount = tempProfile.wallet;
                } else {
                    amount = parseInt(args[1].replace(/[,$]/g, ''), 10);
                }
            } catch (parseError) {

                
                const components = [];

                const parseErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                parseErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Amount Format\n## PARSING ERROR\n\n> Could not understand the amount: \`${args[1]}\`\n> **Valid formats:** \`1000\`, \`1,000\`, \`$1000\`, \`all\`, \`max\``)
                );

                components.push(parseErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Donation Amount\n## AMOUNT MUST BE POSITIVE\n\n> Please enter a valid donation amount greater than zero!\n> **Examples:** \`!donate @friend 100\` or \`!donate @friend all\``)
                );

                components.push(invalidAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (amount < 10) {
                const components = [];

                const minAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                minAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Minimum Donation Required\n## AMOUNT TOO SMALL\n\n> Minimum donation amount is **\`$10\`**\n> You tried to donate: **\`$${amount}\`**\n\n**💡 Tip:** Small donations help cover transaction fees better with larger amounts.`)
                );

                components.push(minAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (amount > 1000000) {
                const components = [];

                const maxAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                maxAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💎 Maximum Donation Limit\n## AMOUNT TOO LARGE\n\n> Maximum donation amount is **\`$1,000,000\`**\n> You tried to donate: **\`$${amount.toLocaleString()}\`**\n\n**💡 Tip:** Make multiple smaller donations if needed.`)
                );

                components.push(maxAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

  

         
            let donorProfile, recipientProfile;
            
            try {
          
                donorProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
                
                if (typeof donorProfile.wallet !== 'number') {
      
                    donorProfile.wallet = Number(donorProfile.wallet) || 0;
                    await donorProfile.save();
                }
                
                if (!Array.isArray(donorProfile.transactions)) {
             
                    donorProfile.transactions = [];
                    await donorProfile.save();
                }
                
    
                
            } catch (donorError) {
              
                
                const components = [];

                const donorErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                donorErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Donor Profile Error\n## ACCOUNT ACCESS FAILED\n\n> Error accessing your profile. Please try \`!balance\` first to initialize your account.\n\n**💡 Troubleshooting:** Wait 30 seconds and try the command again.`)
                );

                components.push(donorErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            try {
         
                recipientProfile = await EconomyManager.getProfile(target.id, message.guild.id);
                
                if (typeof recipientProfile.wallet !== 'number') {
     
                    recipientProfile.wallet = Number(recipientProfile.wallet) || 0;
                    await recipientProfile.save();
                }
                
                if (!Array.isArray(recipientProfile.transactions)) {
    
                    recipientProfile.transactions = [];
                    await recipientProfile.save();
                }
                

                
            } catch (recipientError) {

                
                const components = [];

                const recipientErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                recipientErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Recipient Profile Error\n## ACCOUNT ACCESS FAILED\n\n> Error accessing **${target.username}**'s profile.\n> They may need to use \`!balance\` first to initialize their account.`)
                );

                components.push(recipientErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

           
            if (donorProfile.wallet < amount) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT COMPLETE DONATION\n\n> You don't have enough money for this donation!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **BALANCE BREAKDOWN**\n\n**Your Current Balance:** \`$${donorProfile.wallet.toLocaleString()}\`\n**Donation Amount:** \`$${amount.toLocaleString()}\`\n**Shortage:** \`$${(amount - donorProfile.wallet).toLocaleString()}\``)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }



          
            try {
                const originalDonorWallet = donorProfile.wallet;
                const originalRecipientWallet = recipientProfile.wallet;
                
               
                const tax = Math.floor(amount * 0.02); 
                const netAmount = amount - tax;

               
                donorProfile.wallet = Math.max(0, donorProfile.wallet - amount);
                recipientProfile.wallet = Math.max(0, recipientProfile.wallet + netAmount);



               
                const timestamp = new Date();
                
                donorProfile.transactions.push({
                    type: 'expense',
                    amount: amount,
                    description: `Donated to ${target.username}`,
                    category: 'donation',
                    timestamp: timestamp
                });

                recipientProfile.transactions.push({
                    type: 'income',
                    amount: netAmount,
                    description: `Received donation from ${message.author.username}`,
                    category: 'donation',
                    timestamp: timestamp
                });

           
                if (typeof donorProfile.experience === 'number') {
                    donorProfile.experience += Math.min(50, Math.floor(amount / 1000));
                } else {
                    donorProfile.experience = Math.min(50, Math.floor(amount / 1000));
                }

                if (typeof recipientProfile.experience === 'number') {
                    recipientProfile.experience += 5;
                } else {
                    recipientProfile.experience = 5;
                }



              
                await donorProfile.save();
                await recipientProfile.save();



               
                const components = [];

              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💝 Donation Successful!\n## GENEROSITY IN ACTION\n\n> **${message.author.username}** donated **\`$${amount.toLocaleString()}\`** to **${target.username}**!\n> Your kindness makes the community stronger!`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **TRANSACTION DETAILS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Donation Amount:** \`$${amount.toLocaleString()}\`\n**💸 Transaction Fee:** \`$${tax.toLocaleString()}\` (2%)\n**💎 Net Received:** \`$${netAmount.toLocaleString()}\`\n**⏰ Timestamp:** \`${timestamp.toLocaleString()}\``)
                );

                components.push(detailsContainer);

               
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balancesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                balancesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🏦 **UPDATED BALANCES**')
                );

                balancesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**${message.author.username}** (You)\n> **New Balance:** \`$${donorProfile.wallet.toLocaleString()}\`\n> **XP Gained:** \`+${Math.min(50, Math.floor(amount / 1000))}\``)
                );

                balancesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**${target.username}** (Recipient)\n> **New Balance:** \`$${recipientProfile.wallet.toLocaleString()}\`\n> **XP Gained:** \`+5\``)
                );

                components.push(balancesContainer);

                await message.channel.send({ 
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });

              
                try {
                    await target.send(`💸 You received a $${netAmount.toLocaleString()} donation from **${message.author.username}** in **${message.guild.name}**!`);
                } catch (dmError) {
                    //console.log(`[DONATE] Could not DM recipient: ${dmError.message}`);
                }

            } catch (transactionError) {
                //console.error(`[DONATE] Transaction execution error:`, transactionError);
                throw transactionError;
            }

        } catch (error) {
            //console.error(`[DONATE] Main error for users ${message.author.id} -> ${args[0]}:`, error);
            
    
            const components = [];

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Donation Failed\n## TRANSACTION ERROR\n\n> An error occurred while processing your donation to **${target?.username || 'unknown user'}**.`)
            );

            components.push(errorContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const errorDetailsContainer = new ContainerBuilder()
                .setAccentColor(0xC0392B);

            errorDetailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🔍 **ERROR DETAILS**')
            );

            errorDetailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Error Message:**\n\`\`\`${error.message || 'Unknown error'}\`\`\``)
            );

            errorDetailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Error Code:** \`${Date.now()}\`\n**Timestamp:** \`${new Date().toLocaleString()}\``)
            );

            components.push(errorDetailsContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const troubleshootContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            troubleshootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🛠️ **TROUBLESHOOTING STEPS**\n\n**1.** Both users should try \`!balance\` first\n**2.** Wait 30 seconds and try again\n**3.** Contact an admin if the issue persists\n**4.** Provide the error code above for faster support`)
            );

            components.push(troubleshootContainer);
                
            return message.reply({ 
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
