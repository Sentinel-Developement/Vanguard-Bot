const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'beg',
    aliases: ['ask', 'plead'],
    description: 'Beg for some money from kind strangers using v2 components',
    async execute(message) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            const now = new Date();
            const cooldown = 10 * 60 * 1000; 

          
            if (profile.cooldowns.beg && now - profile.cooldowns.beg < cooldown) {
                const remaining = cooldown - (now - profile.cooldowns.beg);
                const remainingMinutes = Math.ceil(remaining / (60 * 1000));
                
                const components = [];

              
                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xFF6B35);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Begging Cooldown\n## PATIENCE IS A VIRTUE\n\n> You've already begged recently. People need time to feel sorry for you again!`)
                );

                components.push(cooldownContainer);

             
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                infoContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **TIME REMAINING**\n\n**Try again in:** \`${remainingMinutes} minute(s)\`\n**Cooldown Duration:** \`10 minutes\``)
                );

                components.push(infoContainer);

           
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📅 **REQUEST INFO**\n\n**Requested by:** \`${message.author.tag}\`\n**Timestamp:** \`${new Date().toLocaleString()}\``)
                );

                components.push(footerContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

           
            const outcomes = [
                { success: true, min: 25, max: 75, message: "A kind stranger took pity on you!" },
                { success: true, min: 50, max: 100, message: "Someone dropped their wallet and let you keep the change!" },
                { success: true, min: 10, max: 40, message: "A generous person gave you some spare change." },
                { success: true, min: 75, max: 150, message: "A wealthy business person felt generous today!" },
                { success: false, amount: 0, message: "People just walked past you ignoring your pleas..." },
                { success: false, amount: 0, message: "A security guard told you to move along." },
                { success: false, amount: 0, message: "Everyone seems to be in a hurry today." }
            ];

            const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            let earnings = 0;
            
            if (outcome.success) {
                earnings = Math.floor(Math.random() * (outcome.max - outcome.min + 1)) + outcome.min;
                
                
                const levelBonus = Math.floor(profile.level * 2);
                earnings += levelBonus;
            }

           
            const updatedProfile = await EconomyManager.updateWallet(userId, guildId, earnings);
            profile.cooldowns.beg = now;
            
            if (earnings > 0) {
                profile.experience += 5; 
                profile.transactions.push({
                    type: 'income',
                    amount: earnings,
                    description: 'Begging earnings',
                    category: 'begging'
                });
            }

            await profile.save();

            const components = [];

         
            const headerContainer = new ContainerBuilder()
                .setAccentColor(earnings > 0 ? 0x2ECC71 : 0xE74C3C);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${earnings > 0 ? '🙏 Begging Successful!' : '😔 Begging Failed'}\n## ${earnings > 0 ? 'KINDNESS PREVAILS' : 'TOUGH LUCK TODAY'}\n\n> ${outcome.message}`)
            );

            components.push(headerContainer);

      
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            if (earnings > 0) {
             
                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **BEGGING RESULTS**')
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Earnings:** \`$${earnings.toLocaleString()}\`\n**💳 Current Wallet:** \`$${updatedProfile.wallet.toLocaleString()}\`\n**🎯 XP Gained:** \`+5 XP\`\n**📈 Current Level:** \`${profile.level}\``)
                );

       
                const levelBonus = Math.floor(profile.level * 2);
                if (levelBonus > 0) {
                    resultsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🆙 Level Bonus:** \`+$${levelBonus}\` (Level ${profile.level} bonus)\n**💡 Base Amount:** \`$${earnings - levelBonus}\``)
                    );
                }

                components.push(resultsContainer);
            } else {
               
                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💸 **NO LUCK TODAY**')
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💸 Earnings:** \`$0\`\n**💳 Current Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**💡 Tip:** \`Try again in 10 minutes!\`\n**🎲 Better luck next time!**`)
                );

                components.push(failureContainer);
            }

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **SESSION INFO**\n\n**Requested by:** \`${message.author.tag}\`\n**Cooldown:** \`10 minutes\`\n**Next Available:** \`${new Date(now.getTime() + cooldown).toLocaleTimeString()}\``)
            );

            components.push(footerContainer);

          
            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in beg command:', error);
            
    
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BEGGING ERROR**\n\nSomething went wrong while processing your begging attempt. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
