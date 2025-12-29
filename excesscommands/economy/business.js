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
    name: 'business',
    aliases: ['biz', 'businesses'],
    description: 'Manage your business empire with enhanced v2 components',
    usage: '!business [collect/upgrade/hire/fire/delete] [business_id] [amount]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.businesses.length === 0) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 No Business Empire Yet\n## START YOUR ENTREPRENEURIAL JOURNEY\n\n> You don't own any businesses! Time to start building your empire.`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                infoContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚀 **GET STARTED**\n\n**Command:** \`!startbusiness <type>\`\n**Available Types:** \`restaurant, tech_startup, real_estate, car_dealership, security_company, casino\`\n\n**💡 Enhanced Features:**\n> • Much higher profit margins\n> • Employees now generate significant income\n> • Experience and skill progression\n> • Business selling/deletion options`)
                );

                components.push(infoContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const action = args[0]?.toLowerCase();

            if (!action) {
             
                let totalDailyProfit = 0;
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 Your Business Empire\n## ENHANCED FINANCIAL PORTFOLIO\n\n> Managing ${profile.businesses.length}/${profile.maxBusinesses} businesses with improved profit margins`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **EMPIRE STATISTICS**')
                );

             
                for (let biz of profile.businesses) {
                    const income = await EconomyManager.calculateBusinessIncome(biz);
                    totalDailyProfit += income.profit;
                }

                const totalAssetValue = profile.businesses.reduce((total, biz) => total + biz.purchasePrice, 0);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Total Daily Profit:** \`$${totalDailyProfit.toLocaleString()}\`\n**🏢 Portfolio Value:** \`$${totalAssetValue.toLocaleString()}\`\n**📈 Business Skill:** \`${profile.businessSkill}%\``)
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Experience:** \`${profile.experience.toLocaleString()} XP\`\n**📊 Businesses:** \`${profile.businesses.length}/${profile.maxBusinesses}\`\n**⭐ Average Reputation:** \`${Math.floor(profile.businesses.reduce((sum, biz) => sum + biz.reputation, 0) / profile.businesses.length)}%\``)
                );

                components.push(statsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const businessesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                businessesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🏪 **YOUR BUSINESSES**')
                );

                const businessesToShow = profile.businesses.slice(0, 3);
                
                for (let i = 0; i < businessesToShow.length; i++) {
                    const biz = businessesToShow[i];
                    const bizType = BUSINESS_TYPES[biz.type];
                    const income = await EconomyManager.calculateBusinessIncome(biz);
                    const hoursUntilCollection = biz.lastCollection ?
                        Math.max(0, 24 - Math.floor((Date.now() - biz.lastCollection.getTime()) / (1000 * 60 * 60))) : 0;

                    const businessText = `**${i + 1}. ${biz.name}** (Level ${biz.level})\n` +
                        `> **Type:** \`${bizType?.name || biz.type}\`\n` +
                        `> **💰 Daily Profit:** \`$${income.profit.toLocaleString()}\` (Revenue: $${income.revenue.toLocaleString()})\n` +
                        `> **👥 Employees:** \`${biz.employees}/${bizType.maxEmployees}\` (Cost: $${income.expenses.toLocaleString()})\n` +
                        `> **⭐ Reputation:** \`${biz.reputation}%\` • **🎯 Efficiency:** \`${Math.floor(biz.efficiency * 100)}%\`\n` +
                        `> **⏰ Collection:** \`${hoursUntilCollection > 0 ? `${hoursUntilCollection}h remaining` : 'Ready!'}\``;

                    businessesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(businessText)
                    );
                }

                if (profile.businesses.length > 3) {
                    businessesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*...and ${profile.businesses.length - 3} more businesses*`)
                    );
                }

                components.push(businessesContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **QUICK COMMANDS**\n\n**\`!business collect\`** - Collect daily profits\n**\`!business upgrade <#>\`** - Upgrade business level\n**\`!business hire <#> [amount]\`** - Hire employees\n**\`!business fire <#> [amount]\`** - Fire employees\n**\`!business delete <#>\`** - Sell business\n**\`!business help\`** - Full command list`)
                );

                components.push(footerContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

     
            if (action === 'collect') {
                const result = await EconomyManager.collectBusinessIncome(message.author.id, message.guild.id);

                if (result.totalProfit <= 0) {
                    const components = [];

                    const noCollectionContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noCollectionContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⏰ No Profits Ready\n## PATIENCE PAYS OFF\n\n> No profits ready for collection! Your businesses need 24 hours to generate income.\n\n**💡 Tip:** Use this time to upgrade your businesses or hire more employees!`)
                    );

                    components.push(noCollectionContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

              
                const rewards = await EconomyManager.giveBusinessExperience(profile, 'collect', result.totalProfit);
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Business Profits Collected!\n## SUCCESSFUL COLLECTION\n\n> Your enhanced business empire has generated substantial profits!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **COLLECTION REPORT**')
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Total Profit:** \`$${result.totalProfit.toLocaleString()}\`\n**💳 New Balance:** \`$${profile.wallet.toLocaleString()}\`\n**🏢 Businesses:** \`${result.businessReport.length}\``)
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Gained:** \`+${rewards.expGain} XP\`\n**📈 Skill Gained:** \`+${rewards.skillGain}%\`\n**🎯 Total Experience:** \`${profile.experience.toLocaleString()} XP\``)
                );

               
                if (result.businessReport.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                    
                    const reportContainer = new ContainerBuilder()
                        .setAccentColor(0x1B5E20);

                    reportContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 💼 **BUSINESS BREAKDOWN**')
                    );

                    const reportText = result.businessReport.slice(0, 3).map(biz =>
                        `**${biz.name}**\n> **Revenue:** \`$${biz.revenue.toLocaleString()}\`\n> **Expenses:** \`$${biz.expenses.toLocaleString()}\`\n> **Net Profit:** \`$${biz.profit.toLocaleString()}\``
                    ).join('\n\n');

                    reportContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(reportText)
                    );

                    components.push(reportContainer);
                }

                components.push(resultsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

       
            if (action === 'fire') {
                const businessIndex = parseInt(args[1]) - 1;
                const fireAmount = parseInt(args[2]) || 1;

                if (isNaN(businessIndex) || businessIndex < 0 || businessIndex >= profile.businesses.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Business Number\n## SELECTION ERROR\n\n> Invalid business number! Use \`!business\` to see your businesses numbered 1-${profile.businesses.length}.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const business = profile.businesses[businessIndex];

                if (business.employees < fireAmount) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 👥 Not Enough Employees\n## FIRING BLOCKED\n\n> **${business.name}** only has ${business.employees} employees!\n> You cannot fire ${fireAmount} employees.`)
                    );

                    components.push(insufficientContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

               
                const severanceCost = fireAmount * 200; 
                business.employees -= fireAmount;
                profile.wallet = Math.max(0, profile.wallet - severanceCost);

          
                const rewards = await EconomyManager.giveBusinessExperience(profile, 'fire', fireAmount);
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Employees Fired\n## WORKFORCE REDUCTION\n\n> Fired ${fireAmount} employees from **${business.name}**`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0xE64A19);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💼 **FIRING DETAILS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💸 Severance Cost:** \`$${severanceCost.toLocaleString()}\`\n**👥 Remaining Employees:** \`${business.employees}\`\n**💰 Daily Savings:** \`$${(fireAmount * BUSINESS_TYPES[business.type].employeeCost * 0.6).toLocaleString()}\`\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

        
            if (action === 'delete' || action === 'sell') {
                const businessIndex = parseInt(args[1]) - 1;

                if (isNaN(businessIndex) || businessIndex < 0 || businessIndex >= profile.businesses.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Business Number\n## SELECTION ERROR\n\n> Invalid business number! Use \`!business\` to see your businesses numbered 1-${profile.businesses.length}.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const business = profile.businesses[businessIndex];
                const sellValue = await EconomyManager.sellBusiness(profile, businessIndex);
                
        
                const rewards = await EconomyManager.giveBusinessExperience(profile, 'delete');
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 Business Sold Successfully!\n## DIVESTMENT COMPLETE\n\n> **${business.name}** has been sold for \`$${sellValue.toLocaleString()}\`!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x7B1FA2);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **SALE DETAILS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Sale Value:** \`$${sellValue.toLocaleString()}\`\n**📊 Original Cost:** \`$${business.purchasePrice.toLocaleString()}\`\n**📈 Profit/Loss:** \`$${(sellValue - business.purchasePrice).toLocaleString()}\`\n**💳 New Balance:** \`$${profile.wallet.toLocaleString()}\``)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Gained:** \`+${rewards.expGain} XP\`\n**🏢 Remaining Businesses:** \`${profile.businesses.length}/${profile.maxBusinesses}\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

    
            if (action === 'upgrade') {
                const businessIndex = parseInt(args[1]) - 1;
                if (isNaN(businessIndex) || businessIndex < 0 || businessIndex >= profile.businesses.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Business Number\n## SELECTION ERROR\n\n> Invalid business number! Use \`!business\` to see your businesses numbered 1-${profile.businesses.length}.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const business = profile.businesses[businessIndex];
                const businessType = BUSINESS_TYPES[business.type];

                if (business.level >= businessType.maxLevel) {
                    const components = [];

                    const maxLevelContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    maxLevelContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏆 Maximum Level Reached\n## BUSINESS FULLY UPGRADED\n\n> **${business.name}** is already at maximum level (${businessType.maxLevel})!\n\n**💡 Tip:** Consider starting a new business or hiring more employees!`)
                    );

                    components.push(maxLevelContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                if (profile.wallet < business.upgradeCost) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Funds\n## UPGRADE BLOCKED\n\n> You need \`$${business.upgradeCost.toLocaleString()}\` to upgrade **${business.name}**!\n> Current wallet: \`$${profile.wallet.toLocaleString()}\`\n> Shortage: \`$${(business.upgradeCost - profile.wallet).toLocaleString()}\``)
                    );

                    components.push(insufficientContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

      
                const oldIncome = await EconomyManager.calculateBusinessIncome(business);
                
     
                const upgradeCostPaid = business.upgradeCost;
                profile.wallet -= upgradeCostPaid;
                business.level += 1;
                business.upgradeCost = Math.floor(upgradeCostPaid * businessType.upgradeCostMultiplier);
                business.reputation = Math.min(100, business.reputation + 5);
                business.efficiency = Math.min(2.0, business.efficiency + 0.05);

          
                const newIncome = await EconomyManager.calculateBusinessIncome(business);
                
                profile.transactions.push({
                    type: 'expense',
                    amount: upgradeCostPaid,
                    description: `Upgraded ${business.name} to level ${business.level}`,
                    category: 'business'
                });

              
                const rewards = await EconomyManager.giveBusinessExperience(profile, 'upgrade');
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x2196F3);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📈 Business Upgraded!\n## LEVEL UP SUCCESS\n\n> **${business.name}** has been upgraded to level ${business.level}!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x1976D2);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **UPGRADE BENEFITS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Upgrade Cost:** \`$${upgradeCostPaid.toLocaleString()}\`\n**📊 New Level:** \`${business.level}/${businessType.maxLevel}\`\n**⭐ Reputation:** \`${business.reputation}%\` (+5%)\n**🎯 Efficiency:** \`${Math.floor(business.efficiency * 100)}%\` (+5%)`)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📈 Daily Profit Increase:** \`$${(newIncome.profit - oldIncome.profit).toLocaleString()}\`\n**💎 New Daily Profit:** \`$${newIncome.profit.toLocaleString()}\`\n**⭐ Experience:** \`+${rewards.expGain} XP\`\n**📊 Skill:** \`+${rewards.skillGain}%\``)
                );

                const nextUpgradeText = business.level < businessType.maxLevel ? 
                    `**🔮 Next Upgrade:** \`$${business.upgradeCost.toLocaleString()}\`` : 
                    '**🏆 Max Level Reached!**';
                
                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${nextUpgradeText}\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

    
            if (action === 'hire') {
                const businessIndex = parseInt(args[1]) - 1;
                const hireAmount = parseInt(args[2]) || 1;

                if (isNaN(businessIndex) || businessIndex < 0 || businessIndex >= profile.businesses.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Business Number\n## SELECTION ERROR\n\n> Invalid business number! Use \`!business\` to see your businesses.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const business = profile.businesses[businessIndex];
                const businessType = BUSINESS_TYPES[business.type];

                if (business.employees + hireAmount > businessType.maxEmployees) {
                    const components = [];

                    const maxEmployeesContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    maxEmployeesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 👥 Employee Limit Reached\n## HIRING BLOCKED\n\n> **${business.name}** can only have ${businessType.maxEmployees} employees!\n> Current: ${business.employees}/${businessType.maxEmployees}\n> Requested: +${hireAmount}`)
                    );

                    components.push(maxEmployeesContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

         
                const baseHiringCost = 1000 + (business.level * 200); 
                const hiringCost = hireAmount * baseHiringCost;
                
                if (profile.wallet < hiringCost) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Funds\n## HIRING BLOCKED\n\n> You need \`$${hiringCost.toLocaleString()}\` to hire ${hireAmount} employees!\n> Current wallet: \`$${profile.wallet.toLocaleString()}\`\n> Cost per employee: \`$${baseHiringCost.toLocaleString()}\``)
                    );

                    components.push(insufficientContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

            
                const oldIncome = await EconomyManager.calculateBusinessIncome(business);
                
                profile.wallet -= hiringCost;
                business.employees += hireAmount;
                
                const newIncome = await EconomyManager.calculateBusinessIncome(business);
                const profitIncrease = newIncome.profit - oldIncome.profit;

                
                const rewards = await EconomyManager.giveBusinessExperience(profile, 'hire', hireAmount);
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Employees Hired!\n## WORKFORCE EXPANDED\n\n> Successfully hired ${hireAmount} employees for **${business.name}**!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x7B1FA2);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💼 **HIRING BENEFITS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Hiring Cost:** \`$${hiringCost.toLocaleString()}\`\n**👥 Total Employees:** \`${business.employees}/${businessType.maxEmployees}\`\n**💸 Daily Employee Cost:** \`$${newIncome.expenses.toLocaleString()}\`\n**📈 Daily Profit Increase:** \`$${profitIncrease.toLocaleString()}\``)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 New Daily Profit:** \`$${newIncome.profit.toLocaleString()}\`\n**⭐ Experience:** \`+${rewards.expGain} XP\`\n**📊 Skill:** \`+${rewards.skillGain}%\`\n**💳 Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            if (action === 'help') {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏢 Enhanced Business Management\n## COMPLETE COMMAND GUIDE\n\n> Learn how to manage and grow your business empire with enhanced features`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder()
                    .setAccentColor(0x546E7A);

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📋 **AVAILABLE COMMANDS**')
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**\`!business\`** - View all your businesses with enhanced stats\n**\`!business collect\`** - Collect daily profits (24h cooldown)\n**\`!business upgrade <#>\`** - Upgrade business level for massive income boost`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**\`!business hire <#> [amount]\`** - Hire employees for significant profit boost\n**\`!business fire <#> [amount]\`** - Fire employees to reduce costs\n**\`!business delete <#>\`** - Sell business for 60-80% of purchase price`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**\`!startbusiness <type>\`** - Start a new business with enhanced profits\n\n**💡 Enhanced Features:**\n> • Much higher profit margins\n> • Experience and skill progression\n> • Better employee ROI\n> • Business selling options`)
                );

                components.push(commandsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error('Error in enhanced business command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BUSINESS ERROR**\n\nSomething went wrong while processing your business command. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
