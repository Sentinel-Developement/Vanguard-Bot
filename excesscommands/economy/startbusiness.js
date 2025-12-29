const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { BUSINESS_TYPES } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'startbusiness',
    aliases: ['business-start', 'newbusiness'],
    description: 'Start a new business for passive income with v2 components',
    usage: '!startbusiness <type>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                
                const components = [];

             
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 Available Business Types\n## START YOUR ENTREPRENEURIAL JOURNEY\n\n> Choose from various business types, each with unique profit potential and requirements`)
                );

                components.push(headerContainer);

            
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

               
                const businessContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                businessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💼 **BUSINESS CATEGORIES**')
                );

          
                const businessEntries = Object.entries(BUSINESS_TYPES);
                const firstHalf = businessEntries.slice(0, 3);
                const secondHalf = businessEntries.slice(3);

            
                const firstBusinessText = firstHalf.map(([id, biz]) =>
                    `**\`${id}\`** - ${biz.name}\n> **Cost:** \`$${biz.baseCost.toLocaleString()}\`\n> **Description:** ${biz.description}\n> **Daily Income:** \`$${biz.dailyIncome[0]}-${biz.dailyIncome[1]}\``
                ).join('\n\n');

                businessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(firstBusinessText)
                );

               
                if (secondHalf.length > 0) {
                    const secondBusinessText = secondHalf.map(([id, biz]) =>
                        `**\`${id}\`** - ${biz.name}\n> **Cost:** \`$${biz.baseCost.toLocaleString()}\`\n> **Description:** ${biz.description}\n> **Daily Income:** \`$${biz.dailyIncome[0]}-${biz.dailyIncome[1]}\``
                    ).join('\n\n');

                    businessContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(secondBusinessText)
                    );
                }

                components.push(businessContainer);

              
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚀 **HOW TO START**\n\n**Command:** \`!startbusiness <type>\`\n**Example:** \`!startbusiness security_company\`\n\n**💡 Tips:**\n> • Each business type has different profit potential\n> • Higher cost businesses usually have better returns\n> • You can upgrade and hire employees later`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const businessType = args[0].toLowerCase();
            const businessData = BUSINESS_TYPES[businessType];

            if (!businessData) {
                const components = [];

                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Business Type\n## BUSINESS NOT FOUND\n\n> **\`${businessType}\`** is not a valid business type!\n> Use \`!startbusiness\` to see all available options.`)
                );

                components.push(errorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

         
            if (profile.businesses.length >= profile.maxBusinesses) {
                const components = [];

                const limitContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                limitContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 Business Limit Reached\n## MAXIMUM CAPACITY\n\n> You can only own **${profile.maxBusinesses}** businesses!\n> Current businesses: **${profile.businesses.length}/${profile.maxBusinesses}**\n\n**💡 Tip:** Upgrade your business skill to increase capacity.`)
                );

                components.push(limitContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

    
            if (profile.businesses.some(b => b.type === businessType)) {
                const components = [];

                const duplicateContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                duplicateContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Business Already Owned\n## DUPLICATE BUSINESS TYPE\n\n> You already own a **${businessData.name}**!\n> Each player can only own one business of each type.`)
                );

                components.push(duplicateContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < businessData.baseCost) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD BUSINESS\n\n> You need **\`$${businessData.baseCost.toLocaleString()}\`** to start **${businessData.name}**!\n> Current wallet: **\`$${profile.wallet.toLocaleString()}\`**\n> Shortage: **\`$${(businessData.baseCost - profile.wallet).toLocaleString()}\`**`)
                );

                components.push(insufficientContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            
            const business = {
                businessId: `${businessType}_${Date.now()}`,
                name: businessData.name,
                type: businessType,
                level: 1,
                employees: 0,
                revenue: 0,
                expenses: 0,
                profit: 0,
                reputation: 50,
                purchasePrice: businessData.baseCost,
                upgradeCost: Math.floor(businessData.baseCost * businessData.upgradeCostMultiplier),
                dailyIncome: 0,
                lastCollection: new Date(),
                efficiency: 1.0
            };

            profile.wallet -= businessData.baseCost;
            profile.businesses.push(business);
            profile.businessSkill = Math.min(100, profile.businessSkill + 5);

        
            profile.transactions.push({
                type: 'expense',
                amount: businessData.baseCost,
                description: `Started business: ${businessData.name}`,
                category: 'business'
            });

            await profile.save();

            const components = [];

        
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏢 Business Started Successfully!\n## WELCOME TO ENTREPRENEURSHIP\n\n> Congratulations! You've successfully started **${businessData.name}** for \`$${businessData.baseCost.toLocaleString()}\`!`)
            );

            components.push(headerContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

     
            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **BUSINESS OVERVIEW**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏢 Business Name:** \`${businessData.name}\`\n**📊 Starting Level:** \`1\`\n**👥 Employees:** \`0\`\n**⭐ Reputation:** \`50%\`\n**🎯 Efficiency:** \`100%\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Daily Income Range:** \`$${businessData.dailyIncome[0].toLocaleString()}-${businessData.dailyIncome[1].toLocaleString()}\`\n**📈 Next Upgrade Cost:** \`$${business.upgradeCost.toLocaleString()}\`\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\``)
            );

            components.push(detailsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const progressContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            progressContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📈 **PROGRESS & REWARDS**')
            );

            progressContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Business Skill Gained:** \`+5%\` (Now ${profile.businessSkill}%)\n**🏢 Total Businesses:** \`${profile.businesses.length}/${profile.maxBusinesses}\`\n**💼 Business Portfolio:** Growing strong!`)
            );

            components.push(progressContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **MANAGEMENT TIPS**\n\n**\`!business\`** - View your business empire\n**\`!business collect\`** - Collect daily profits (24h cooldown)\n**\`!business upgrade <#>\`** - Upgrade for higher income\n**\`!business hire <#> [amount]\`** - Hire employees to boost profits\n\n> Your business will start generating income immediately!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in startbusiness command:', error);

       
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BUSINESS STARTUP ERROR**\n\nSomething went wrong while starting your business. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
