const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { PETS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buypet',
    aliases: ['pet-buy', 'adopt'],
    description: 'Buy a pet for security with v2 components',
    usage: '!buypet <pet_id> <name>',
    async execute(message, args) {
        try {
            if (!args[0]) {
              
                const components = [];

              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF69B4);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐕 Pet Adoption Center\n## LOYAL COMPANIONS AWAIT\n\n> Welcome to the pet adoption center! Choose from our selection of adorable and protective companions.\n> Each pet provides security benefits and companionship for your household.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                
                const petEntries = Object.entries(PETS);
                const petsByType = {};
                
                petEntries.forEach(([id, pet]) => {
                    if (!petsByType[pet.type]) {
                        petsByType[pet.type] = [];
                    }
                    petsByType[pet.type].push([id, pet]);
                });

            
                Object.entries(petsByType).forEach(([type, pets]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getPetTypeColor(type));

                    const emoji = getPetTypeEmoji(type);
                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${emoji} **${type.toUpperCase()} COMPANIONS**`)
                    );

                 
                    for (let i = 0; i < pets.length; i += 3) {
                        const petGroup = pets.slice(i, i + 3);
                        const petText = petGroup.map(([id, pet]) => 
                            `**\`${id}\`** - ${pet.name} (${pet.breed})\n> **Price:** \`$${pet.price.toLocaleString()}\`\n> **Security Level:** \`${pet.securityLevel}/100\`\n> **Type:** ${pet.type}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(petText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

              
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **HOW TO ADOPT**\n\n**Command:** \`!buypet <pet_id> <pet_name>\`\n**Example:** \`!buypet guard_dog Buddy\`\n\n**💡 Benefits:**\n> • Enhanced security against robberies\n> • Loyal companionship for your family\n> • Property protection and surveillance\n> • Customizable pet names for personalization`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const petId = args[0].toLowerCase();
            const petName = args.slice(1).join(' ') || PETS[petId]?.name;
            const petData = PETS[petId];

            if (!petData) {
                const components = [];

                const invalidPetContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidPetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Pet ID\n## PET NOT FOUND\n\n> **\`${petId}\`** is not a valid pet ID!\n> Use \`!buypet\` to see all available pets with their correct IDs.`)
                );

                components.push(invalidPetContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

         
            if (profile.pets.length >= profile.maxPets) {
                const components = [];

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐕 Pet Capacity Limit Reached\n## MAXIMUM PETS OWNED\n\n> You can only have **${profile.maxPets}** pets with your current property!\n> Your home doesn't have space for more furry friends.`)
                );

                components.push(capacityContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏠 **EXPAND YOUR CAPACITY**\n\n**Current Pet Capacity:** \`${profile.maxPets}\`\n**Current Pets:** \`${profile.pets.length}\`\n\n**💡 Solutions:**\n> • Upgrade to a larger property with more space\n> • Properties determine maximum pet capacity\n> • Bigger homes = more furry companions!`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < petData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD PET ADOPTION\n\n> You don't have enough money to adopt **${petData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **ADOPTION FEES**\n\n**Pet:** \`${petData.name} (${petData.breed})\`\n**Adoption Fee:** \`$${petData.price.toLocaleString()}\`\n**Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Shortage:** \`$${(petData.price - profile.wallet).toLocaleString()}\`\n\n**💡 Earning Tips:** Work regularly, complete dailies, or run businesses to save for your new companion!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

    
            profile.wallet -= petData.price;
            profile.pets.push({
                petId: `${petId}_${Date.now()}`,
                name: petName,
                type: petData.type,
                breed: petData.breed,
                securityLevel: petData.securityLevel,
                happiness: 50,
                health: 100,
                hunger: 50,
                cleanliness: 50,
                purchasePrice: petData.price,
                lastFed: new Date(),
                lastGroomed: new Date(),
                lastPlayed: new Date(),
                dateAdopted: new Date()
            });

         
            profile.transactions.push({
                type: 'expense',
                amount: petData.price,
                description: `Adopted pet: ${petName} (${petData.breed})`,
                category: 'pet'
            });

            await profile.save();

          
            const components = [];

        
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🐕 Pet Adoption Successful!\n## WELCOME YOUR NEW COMPANION\n\n> Congratulations! You've successfully adopted **${petName}** the ${petData.breed} for **\`$${petData.price.toLocaleString()}\`**!\n> Your new furry friend is ready to protect your home and bring joy to your family!`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

     
            const specsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🐾 **PET PROFILE**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐕 Pet Name:** \`${petName}\`\n**🏷️ Pet Type:** \`${petData.type}\`\n**🐾 Breed:** \`${petData.breed}\`\n**🛡️ Security Level:** \`${petData.securityLevel}/100\`\n**📅 Adoption Date:** \`${new Date().toLocaleDateString()}\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**❤️ Happiness:** \`50%\` (Starting level)\n**🏥 Health:** \`100%\` (Perfect condition)\n**🍽️ Hunger:** \`50%\` (Well fed)\n**🛁 Cleanliness:** \`50%\` (Groomed and ready)`)
            );

            components.push(specsContainer);

   
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const securityContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **SECURITY BENEFITS**')
            );

            const newSecurityLevel = EconomyManager.calculateSecurityLevel(profile);
            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏠 Enhanced Home Security:** Your property is now better protected!\n**🔒 Robbery Protection:** \`+${petData.securityLevel}%\` security boost\n**📊 Total Security Level:** \`${newSecurityLevel}%\`\n**🎯 Protection Value:** Your pet actively deters potential intruders`)
            );

            components.push(securityContainer);

           
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const careContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💝 **PET CARE GUIDE**\n\n**🍽️ Feeding:** Keep your pet well-fed for optimal health\n**🛁 Grooming:** Regular grooming maintains cleanliness and happiness\n**🎾 Playing:** Interact with your pet to boost their mood\n**🛒 Shop Items:** Purchase pet food and care items from the shop\n**💊 Health:** Monitor your pet's health and happiness levels\n\n> Happy pets provide better security protection for your home!`)
            );

            components.push(careContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x607D8B);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **ADOPTION SUMMARY**\n\n**Adoption Fee:** \`$${petData.price.toLocaleString()}\`\n**Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Total Pets:** \`${profile.pets.length}/${profile.maxPets}\`\n**Transaction Logged:** Adoption recorded in your transaction history\n\n> Your investment in companionship and security is complete!`)
            );

            components.push(financialContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buypet command:', error);

           
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PET ADOPTION ERROR**\n\nSomething went wrong while processing your pet adoption. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getPetTypeColor(type) {
    const colors = {
        'dog': 0xFF69B4,      
        'cat': 0x9B59B6,         
        'bird': 0x3498DB,        
        'security_dog': 0xE74C3C, 
        'guard_cat': 0xF39C12    
    };
    return colors[type] || 0xFF69B4;
}

function getPetTypeEmoji(type) {
    const emojis = {
        'dog': '🐕',
        'cat': '🐱', 
        'bird': '🐦',
        'security_dog': '🐺',
        'guard_cat': '🦁'
    };
    return emojis[type] || '🐾';
}
