const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'pets',
    aliases: ['mypets'],
    description: 'View your pet collection and their status with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.pets.length === 0) {
                const components = [];

                const noPetsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noPetsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐕 No Pets in Your Collection\n## BUILD YOUR FURRY FAMILY\n\n> You don't have any pets yet! Pets provide security, companionship, and protection for your property.\n> Each pet contributes to your household's overall security level.`)
                );

                components.push(noPetsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const adoptionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                adoptionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐾 **START YOUR PET COLLECTION**\n\n**Step 1:** Use \`!buypet\` to see available pets\n**Step 2:** Choose a pet that fits your budget and needs\n**Step 3:** Give your new companion a loving name\n**Step 4:** Care for them with feeding, grooming, and play!\n\n**💡 Benefits:**\n> • Enhanced security against robberies\n> • Loyal companionship and emotional support\n> • Property protection and surveillance\n> • Building a loving household atmosphere`)
                );

                components.push(adoptionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const components = [];

     
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🐕 ${message.author.username}'s Pet Collection\n## YOUR BELOVED COMPANIONS\n\n> Meet your furry family members who provide security, love, and protection for your household.\n> Well-cared pets are more effective guardians and happier companions!`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            const petGroups = [];
            for (let i = 0; i < profile.pets.length; i += 3) {
                petGroups.push(profile.pets.slice(i, i + 3));
            }

            petGroups.forEach((group, groupIndex) => {
                const petContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC0CB);

                petContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐾 **PET FAMILY ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((pet, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const overallCondition = (pet.happiness + pet.health + pet.cleanliness) / 3;
                    const conditionEmoji = overallCondition > 80 ? '🟢 Excellent' : overallCondition > 50 ? '🟡 Good' : '🔴 Needs Care';
                    const efficiency = ((pet.happiness + pet.health + pet.cleanliness) / 300 * 100).toFixed(0);
                    
              
                    const daysSinceAdoption = pet.dateAdopted ? 
                        Math.floor((new Date() - new Date(pet.dateAdopted)) / (1000 * 60 * 60 * 24)) : 'Unknown';
                    
                    const petText = `**${actualIndex}. ${pet.name}** (${pet.breed})\n` +
                        `> **🛡️ Security Level:** \`${pet.securityLevel}/100\`\n` +
                        `> **📈 Current Efficiency:** \`${efficiency}%\`\n` +
                        `> **🌟 Overall Condition:** ${conditionEmoji}\n` +
                        `> **😊 Happiness:** \`${pet.happiness}%\` • **🏥 Health:** \`${pet.health}%\` • **🛁 Cleanliness:** \`${pet.cleanliness}%\`\n` +
                        `> **🍖 Hunger Level:** \`${pet.hunger}%\`\n` +
                        `> **📅 Days Owned:** \`${daysSinceAdoption}\``;

                    petContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(petText)
                    );
                });

                components.push(petContainer);
                
                if (groupIndex < petGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **PET COLLECTION STATISTICS**')
            );

            const totalSecurity = profile.pets.reduce((sum, pet) => {
                const efficiency = (pet.happiness + pet.health + pet.cleanliness) / 300;
                return sum + (pet.securityLevel * efficiency);
            }, 0);

            const averageCondition = profile.pets.reduce((sum, pet) => {
                return sum + ((pet.happiness + pet.health + pet.cleanliness) / 3);
            }, 0) / profile.pets.length;

            const averageHappiness = profile.pets.reduce((sum, pet) => sum + pet.happiness, 0) / profile.pets.length;
            const averageHealth = profile.pets.reduce((sum, pet) => sum + pet.health, 0) / profile.pets.length;
            const averageCleanliness = profile.pets.reduce((sum, pet) => sum + pet.cleanliness, 0) / profile.pets.length;

        
            const petsNeedingCare = profile.pets.filter(pet => 
                pet.happiness < 70 || pet.health < 70 || pet.cleanliness < 70 || pet.hunger < 30
            ).length;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐾 Total Pets:** \`${profile.pets.length}/${profile.maxPets}\`\n**🛡️ Total Security:** \`${Math.floor(totalSecurity)}\`\n**📊 Average Condition:** \`${averageCondition.toFixed(1)}%\`\n**💰 Full Care Cost:** \`$175 (all pets)\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**😊 Average Happiness:** \`${averageHappiness.toFixed(1)}%\`\n**🏥 Average Health:** \`${averageHealth.toFixed(1)}%\`\n**🛁 Average Cleanliness:** \`${averageCleanliness.toFixed(1)}%\`\n**⚠️ Pets Needing Care:** \`${petsNeedingCare}\``)
            );

            components.push(statsContainer);

     
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const careContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **PET CARE MANAGEMENT**')
            );

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🍖 Feeding:** \`!petcare feed <pet_number>\` - Increases hunger and health\n**🛁 Grooming:** \`!petcare groom <pet_number>\` - Improves cleanliness and happiness\n**🎾 Playing:** \`!petcare play <pet_number>\` - Boosts happiness and bonding\n**🌟 All Care:** \`!petcare all <pet_number>\` - Complete care package\n**💰 Care All Pets:** \`!petcare all 0\` - Care for every pet at once`)
            );

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💡 Care Tips:**\n> • Happy, healthy pets provide better security\n> • Regular care maintains peak efficiency\n> • Well-fed pets are more loyal guardians\n> • Clean pets contribute to household happiness\n\n**🛒 Shop Items:** Purchase pet food and care items from the premium shop!`)
            );

            components.push(careContainer);

         
            if (totalSecurity > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const securityContainer = new ContainerBuilder()
                    .setAccentColor(0x28A745);

                securityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🛡️ **SECURITY CONTRIBUTION**')
                );

                const maxPossibleSecurity = profile.pets.reduce((sum, pet) => sum + pet.securityLevel, 0);
                const securityEfficiency = ((totalSecurity / maxPossibleSecurity) * 100).toFixed(1);

                securityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔒 Current Security Level:** \`${Math.floor(totalSecurity)}\`\n**📊 Security Efficiency:** \`${securityEfficiency}%\`\n**🏆 Maximum Potential:** \`${maxPossibleSecurity}\`\n**💡 Improvement Potential:** \`+${Math.floor(maxPossibleSecurity - totalSecurity)}\` with better care\n\n> Your pets are actively protecting your property and deterring potential threats!`)
                );

                components.push(securityContainer);
            }

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in pets command:', error);

      
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PET COLLECTION ERROR**\n\nSomething went wrong while viewing your pet collection. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
