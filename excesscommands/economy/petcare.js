const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'petcare',
    aliases: ['feed', 'groom', 'play'],
    description: 'Take care of your pets to improve their security effectiveness with v2 components',
    usage: '!petcare <action> [pet_index]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.pets.length === 0) {
                const components = [];

                const noPetsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noPetsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐕 No Pets to Care For\n## ADOPT A COMPANION FIRST\n\n> You don't have any pets to take care of!\n> Pets need regular care including feeding, grooming, and playtime to stay happy and effective.`)
                );

                components.push(noPetsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const adoptionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                adoptionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐾 **GET STARTED WITH PETS**\n\n**Step 1:** Use \`!buypet\` to adopt your first companion\n**Step 2:** Choose a loving name for your new friend\n**Step 3:** Return here to provide daily care\n**Step 4:** Watch them become loyal guardians!\n\n**💡 Benefits of Pet Care:**\n> • Happy pets provide better security\n> • Well-fed pets are more loyal\n> • Regular care maintains peak effectiveness\n> • Builds strong bonds with your companions`)
                );

                components.push(adoptionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0]?.toLowerCase();
            const petIndex = parseInt(args[1]) || 1;
            
            if (!action || !['feed', 'groom', 'play', 'all'].includes(action)) {
                const components = [];

                const invalidActionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidActionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Care Action\n## PLEASE SPECIFY CARE TYPE\n\n> Please specify what kind of care you want to provide!\n> Your pets are waiting for your loving attention.`)
                );

                components.push(invalidActionContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const actionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                actionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐾 **AVAILABLE CARE OPTIONS**\n\n**🍖 \`feed\`** - Feed your pet to reduce hunger and boost health (\`$50\`)\n**🛁 \`groom\`** - Groom your pet for cleanliness and happiness (\`$100\`)\n**🎾 \`play\`** - Play with your pet to increase happiness and bonding (\`$25\`)\n**🌟 \`all\`** - Complete care package for maximum effect (\`$175\`)\n\n**Examples:**\n> \`!petcare feed 1\` - Feed your first pet\n> \`!petcare all 2\` - Complete care for second pet`)
                );

                components.push(actionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (petIndex < 1 || petIndex > profile.pets.length) {
                const components = [];

                const invalidPetContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidPetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐕 Invalid Pet Selection\n## PET NUMBER OUT OF RANGE\n\n> Pet number must be between **1** and **${profile.pets.length}**!\n> Use \`!pets\` to see your numbered pet list.`)
                );

                components.push(invalidPetContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const petListContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                petListContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐾 **YOUR PET FAMILY**\n\n${profile.pets.map((pet, index) => 
                            `**${index + 1}.** ${pet.name} (${pet.breed})`
                        ).join('\n')}\n\n**💡 Tip:** Choose the number of the pet you want to care for!`)
                );

                components.push(petListContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const pet = profile.pets[petIndex - 1];
            const costs = { feed: 50, groom: 100, play: 25, all: 175 };
            const cost = costs[action];
            
            if (profile.wallet < cost) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds for Pet Care\n## CANNOT AFFORD ${action.toUpperCase()} CARE\n\n> You need **\`$${cost}\`** to provide **${action}** care for **${pet.name}**!\n> Your wallet has **\`$${profile.wallet.toLocaleString()}\`**`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const earningContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                earningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **EARN MONEY FOR PET CARE**\n\n**Shortage:** \`$${cost - profile.wallet}\`\n\n**💡 Quick Earning Tips:**\n> • Use \`!work\` to earn regular income\n> • Complete \`!daily\` rewards\n> • Try your luck with \`!gamble\`\n> • Run businesses for passive income\n\n**🐾 Your pet is counting on you!**`)
                );

                components.push(earningContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            const beforeStats = {
                hunger: pet.hunger,
                health: pet.health,
                cleanliness: pet.cleanliness,
                happiness: pet.happiness
            };
            
            profile.wallet -= cost;
            
            
            if (action === 'feed' || action === 'all') {
                pet.hunger = Math.min(100, pet.hunger + 30);
                pet.health = Math.min(100, pet.health + 5);
                pet.lastFed = new Date();
            }
            
            if (action === 'groom' || action === 'all') {
                pet.cleanliness = Math.min(100, pet.cleanliness + 40);
                pet.happiness = Math.min(100, pet.happiness + 10);
                pet.lastGroomed = new Date();
            }
            
            if (action === 'play' || action === 'all') {
                pet.happiness = Math.min(100, pet.happiness + 25);
                pet.health = Math.min(100, pet.health + 5);
                pet.lastPlayed = new Date();
            }

         
            profile.transactions.push({
                type: 'expense',
                amount: cost,
                description: `Pet care (${action}) for ${pet.name}`,
                category: 'pet_care'
            });
            
            await profile.save();

        
            const components = [];

         
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🐕 Pet Care Complete!\n## ${pet.name.toUpperCase()} FEELS LOVED\n\n> You provided wonderful **${action}** care for **${pet.name}**!\n> Your furry friend is happier and more effective as a guardian.`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

         
            const resultsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **CARE RESULTS**')
            );

          
            const improvements = [];
            if (pet.hunger > beforeStats.hunger) improvements.push(`🍖 Hunger: \`${beforeStats.hunger}%\` → \`${pet.hunger}%\` (+${pet.hunger - beforeStats.hunger})`);
            if (pet.health > beforeStats.health) improvements.push(`🏥 Health: \`${beforeStats.health}%\` → \`${pet.health}%\` (+${pet.health - beforeStats.health})`);
            if (pet.cleanliness > beforeStats.cleanliness) improvements.push(`🛁 Cleanliness: \`${beforeStats.cleanliness}%\` → \`${pet.cleanliness}%\` (+${pet.cleanliness - beforeStats.cleanliness})`);
            if (pet.happiness > beforeStats.happiness) improvements.push(`😊 Happiness: \`${beforeStats.happiness}%\` → \`${pet.happiness}%\` (+${pet.happiness - beforeStats.happiness})`);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Care Cost:** \`$${cost}\`\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**🎯 Care Type:** \`${action.toUpperCase()}\`\n**⏰ Care Time:** \`${new Date().toLocaleString()}\``)
            );

            if (improvements.length > 0) {
                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📈 IMPROVEMENTS:**\n${improvements.join('\n')}`)
                );
            }

            components.push(resultsContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statusContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🐾 **PET STATUS AFTER CARE**')
            );

            const overallCondition = (pet.happiness + pet.health + pet.cleanliness) / 3;
            const conditionStatus = overallCondition > 80 ? '🟢 Excellent' : overallCondition > 50 ? '🟡 Good' : '🔴 Needs Care';
            const efficiency = ((pet.happiness + pet.health + pet.cleanliness) / 300 * 100).toFixed(0);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐕 Pet:** \`${pet.name} (${pet.breed})\`\n**🌟 Overall Condition:** ${conditionStatus}\n**📈 Security Efficiency:** \`${efficiency}%\`\n**🛡️ Security Level:** \`${pet.securityLevel}/100\``)
            );

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Current Stats:**\n🍖 Hunger: \`${pet.hunger}%\`\n🏥 Health: \`${pet.health}%\`\n🛁 Cleanliness: \`${pet.cleanliness}%\`\n😊 Happiness: \`${pet.happiness}%\``)
            );

            components.push(statusContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const securityContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **SECURITY IMPACT**')
            );

            const beforeEfficiency = ((beforeStats.happiness + beforeStats.health + beforeStats.cleanliness) / 300 * 100).toFixed(0);
            const afterEfficiency = efficiency;
            const securityImprovement = (afterEfficiency - beforeEfficiency).toFixed(0);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Security Efficiency:** \`${beforeEfficiency}%\` → \`${afterEfficiency}%\` ${securityImprovement > 0 ? `(+${securityImprovement}%)` : ''}\n**Effective Security:** \`${(pet.securityLevel * afterEfficiency / 100).toFixed(1)}\`\n**Maximum Potential:** \`${pet.securityLevel}\`\n\n**💡 Impact:** ${securityImprovement > 0 ? `Your care improved ${pet.name}'s protective abilities!` : `${pet.name} maintains their protective effectiveness!`}`)
            );

            components.push(securityContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const recommendationsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            recommendationsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💡 **CARE RECOMMENDATIONS**')
            );

            const careNeeds = [];
            if (pet.hunger < 70) careNeeds.push('🍖 **Feed** your pet to restore hunger');
            if (pet.cleanliness < 70) careNeeds.push('🛁 **Groom** your pet for cleanliness');
            if (pet.happiness < 70) careNeeds.push('🎾 **Play** with your pet for happiness');
            if (pet.health < 70) careNeeds.push('🏥 Pet **health** could use attention');

            if (careNeeds.length > 0) {
                recommendationsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Next Care Suggestions:**\n${careNeeds.join('\n')}\n\n**💰 Care Costs:** Feed \`$50\` • Groom \`$100\` • Play \`$25\` • All \`$175\``)
                );
            } else {
                recommendationsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🌟 Perfect Care!** ${pet.name} is in excellent condition!\n\n**🎯 Maintenance:** Check back regularly to maintain this level of care\n**💡 Tip:** Well-cared pets provide maximum security benefits`)
                );
            }

            components.push(recommendationsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in petcare command:', error);

   
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PET CARE ERROR**\n\nSomething went wrong while caring for your pet. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
