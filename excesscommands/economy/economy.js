const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

module.exports = {
    name: 'economy',
    aliases: ['eco', 'help-economy', 'guide'],
    description: 'Complete guide to the advanced economy system with v2 components',
    async execute(message) {
        try {
            let currentPage = 0;
            const totalPages = 9;

            const createPage = (pageNum) => {
                const components = [];

                switch (pageNum) {
                    case 0: // Page 1: Command Overview
                        const headerContainer = new ContainerBuilder()
                            .setAccentColor(0x4CAF50);

                        headerContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🏦 ULTIMATE ECONOMY SYSTEM\n## PROFESSIONAL ECONOMY BOT - 35+ COMMANDS\n\n> **Page 1 of 9** | Complete mastery guide for total economy domination\n> Use navigation buttons to explore all advanced systems and strategies`)
                        );

                        components.push(headerContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Basic Economy Commands
                        const basicContainer = new ContainerBuilder()
                            .setAccentColor(0x2196F3);

                        basicContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 💰 **BASIC ECONOMY** (5 Commands)')
                        );

                        basicContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`!balance\`** - Check finances & active effects\n**\`!daily\`** - Daily rewards with streak bonuses\n**\`!weekly\`** - Weekly mega rewards\n**\`!work\`** - Earn money (1 hour cooldown)\n**\`!beg\`** - Emergency money (10 min cooldown)`)
                        );

                        components.push(basicContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Banking & Trading
                        const bankingContainer = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        bankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏦 **BANKING & TRADING** (5 Commands)')
                        );

                        bankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`!deposit\`** - Store money safely in bank\n**\`!withdraw\`** - Take money from bank\n**\`!vault\`** - Family vault deposit/withdraw\n**\`!gamble\`** - Risk money for big wins\n**\`!rob\`** - Rob other players (risky!)`)
                        );

                        components.push(bankingContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Property System
                        const propertyContainer = new ContainerBuilder()
                            .setAccentColor(0x9B59B6);

                        propertyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏠 **PROPERTY SYSTEM** (3 Commands)')
                        );

                        propertyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`!buyhouse\`** - Purchase properties for family\n**\`!myhome\`** - View your property & family\n**\`!addfamily\`** - Add family members to property`)
                        );

                        components.push(propertyContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Vehicle System
                        const vehicleContainer = new ContainerBuilder()
                            .setAccentColor(0xE91E63);

                        vehicleContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🚗 **VEHICLE SYSTEM** (3 Commands)')
                        );

                        vehicleContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`!buycar\`** - Purchase vehicles for racing\n**\`!garage\`** - Manage your car collection\n**\`!race\`** - Race cars for money prizes`)
                        );

                        components.push(vehicleContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Advanced Systems Preview
                        const advancedContainer = new ContainerBuilder()
                            .setAccentColor(0x607D8B);

                        advancedContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🚀 **ADVANCED SYSTEMS PREVIEW**\n\n**👨‍👩‍👧‍👦 Family System** - Build relationships for passive income\n**🐕 Pet System** - Security and companionship\n**🏢 Business Empire** - Passive income generation\n**🎯 Heist System** - Team-based criminal operations\n**🛒 Premium Features** - VIP roles and power-ups\n**📊 Information** - Statistics and leaderboards\n\n> Navigate through all 9 pages to master every aspect of the economy!`)
                        );

                        components.push(advancedContainer);
                        break;

                    case 1: // Page 2: Basic Economy System
                        const basicEconHeader = new ContainerBuilder()
                            .setAccentColor(0x2196F3);

                        basicEconHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 💰 BASIC ECONOMY SYSTEM\n## HOW MONEY WORKS IN THIS ECONOMY\n\n> **Page 2 of 9** | Master the fundamentals\n> Understanding these basics is essential for building your empire`)
                        );

                        components.push(basicEconHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Income Sources
                        const incomeContainer = new ContainerBuilder()
                            .setAccentColor(0x4CAF50);

                        incomeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🔄 **INCOME SOURCES**')
                        );

                        incomeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Daily Rewards:** \`$500-2,000+\` (streak bonuses)\n**Work Earnings:** \`$200-800\` base + family bonus\n**Business Profits:** \`$500-15,000+\` daily passive income\n**Heist Payouts:** \`$50,000-5,000,000\` (high risk/reward)\n**Gambling Wins:** 45-75% chance with luck boosts\n**Racing Victories:** Depends on car quality\n**Family Contributions:** Passive income from members`)
                        );

                        components.push(incomeContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Expenses
                        const expensesContainer = new ContainerBuilder()
                            .setAccentColor(0xF44336);

                        expensesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 💸 **EXPENSES & COSTS**')
                        );

                        expensesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Property Bills:** Monthly rent + utilities\n**Business Expenses:** Employee wages + maintenance\n**Heist Equipment:** \`$5,000-75,000\` per heist\n**Pet Care:** Food, grooming, medical care\n**Car Maintenance:** Repairs, fuel, upgrades\n**Shop Purchases:** Power-ups and boosts\n**Jail Fines:** Penalties for failed heists`)
                        );

                        components.push(expensesContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Money Strategy
                        const strategyContainer = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        strategyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💡 **ADVANCED MONEY STRATEGY**\n\n**🏦 Family Vault:** 50% (protected from robberies)\n**💼 Business Investments:** 30% (passive income)\n**💳 Wallet:** 15% (for daily activities & heists)\n**🏛️ Bank:** 5% (emergency safety fund)\n\n**Why This Works:**\n> • Businesses generate passive income 24/7\n> • Vault protection from robberies\n> • Wallet for opportunities and heist funding`)
                        );

                        components.push(strategyContainer);
                        break;

                    case 2: // Page 3: Property System
                        const propertyHeader = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        propertyHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🏠 PROPERTY SYSTEM - YOUR FOUNDATION\n## PROPERTIES ARE EVERYTHING - YOUR SUCCESS DEPENDS ON THIS\n\n> **Page 3 of 9** | Master property investment\n> Your property determines family capacity, vault size, and security level`)
                        );

                        components.push(propertyHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Starter Properties
                        const starterContainer = new ContainerBuilder()
                            .setAccentColor(0x4CAF50);

                        starterContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏘️ **STARTER PROPERTIES**')
                        );

                        starterContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**STUDIO APARTMENT** - \`$50,000\`\n> • Family Slots: 1 member\n> • Vault Capacity: $10,000\n> • Security Level: 1\n> • Garage: None\n> • Monthly Cost: $950\n\n**2BR APARTMENT** - \`$120,000\`\n> • Family Slots: 3 members\n> • Vault Capacity: $25,000\n> • Security Level: 2\n> • Garage: 1 car\n> • Monthly Cost: $1,750`)
                        );

                        components.push(starterContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Mid-Tier Properties
                        const midTierContainer = new ContainerBuilder()
                            .setAccentColor(0x2196F3);

                        midTierContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏘️ **MID-TIER PROPERTIES**')
                        );

                        midTierContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**FAMILY HOUSE** - \`$300,000\`\n> • Family Slots: 5 members\n> • Vault Capacity: $75,000\n> • Security Level: 4\n> • Garage: 2 cars\n> • Monthly Cost: $2,900\n\n**LUXURY MANSION** - \`$800,000\`\n> • Family Slots: 8 members\n> • Vault Capacity: $200,000\n> • Security Level: 7\n> • Garage: 5 cars\n> • Monthly Cost: $5,800`)
                        );

                        components.push(midTierContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Elite Property
                        const eliteContainer = new ContainerBuilder()
                            .setAccentColor(0x9C27B0);

                        eliteContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🏰 **ELITE PROPERTY**\n\n**PRIVATE ESTATE** - \`$2,000,000\`\n> • Family Slots: 12 members\n> • Vault Capacity: $500,000\n> • Security Level: 10\n> • Garage: 10 cars\n> • Monthly Cost: $11,500\n\n**🎯 End Game Goal:** Estate with 12 family members + multiple businesses earning $50,000+ daily!`)
                        );

                        components.push(eliteContainer);
                        break;

                    case 3: // Page 4: Family & Security
                        const familyHeader = new ContainerBuilder()
                            .setAccentColor(0xE91E63);

                        familyHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 👨‍👩‍👧‍👦 FAMILY & 🛡️ SECURITY\n## YOUR PASSIVE INCOME ENGINE + VAULT PROTECTION\n\n> **Page 4 of 9** | Build your empire and protect it\n> Family members generate automatic work income and pets provide security`)
                        );

                        components.push(familyHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Family Hierarchy
                        const hierarchyContainer = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        hierarchyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 👥 **FAMILY MEMBER HIERARCHY**')
                        );

                        hierarchyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🥇 SPOUSE** (Priority #1)\n> • Salary Range: $300-800 per work\n> • Professions: Teacher, Engineer, Manager\n> • Best ROI and affects other family bonds\n\n**🥈 PARENT** (Priority #2)\n> • Salary Range: $400-900 per work\n> • Professions: Consultant, Business Owner\n> • Stable high income\n\n**🥉 SIBLING** (Fill remaining slots)\n> • Salary Range: $250-600 per work\n> • Professions: Artist, Mechanic, Chef\n\n**🏅 CHILD** (Last resort)\n> • Salary Range: $50-200 per work\n> • Professions: Student, Intern\n> • Lowest income but fills capacity`)
                        );

                        components.push(hierarchyContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Bond Mechanics
                        const bondContainer = new ContainerBuilder()
                            .setAccentColor(0xF44336);

                        bondContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## ❤️ **FAMILY BOND MECHANICS**\n\n**Bond Levels & Income Impact:**\n> • **0-25% Bond:** 0.25x income (25% efficiency)\n> • **26-50% Bond:** 0.50x income (50% efficiency)\n> • **51-75% Bond:** 0.75x income (75% efficiency)\n> • **76-90% Bond:** 0.90x income (90% efficiency)\n> • **91-100% Bond:** 1.00x income (100% efficiency)\n\n**Improving Bonds:**\n> • Family trips: +5-15% bond per trip\n> • Family vacation item: +15% to ALL members\n> • Bonds decay 1-2% weekly without attention`)
                        );

                        components.push(bondContainer);
                        break;

                    case 4: // Page 5: Shop & Effects
                        const shopHeader = new ContainerBuilder()
                            .setAccentColor(0x9C27B0);

                        shopHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ⚡ ACTIVE EFFECTS & 🛒 PREMIUM SHOP\n## POWER-UPS, BOOSTS & STRATEGIC SHOPPING\n\n> **Page 5 of 9** | Master the enhancement systems\n> Strategic shop purchases can multiply your earnings and success rates`)
                        );

                        components.push(shopHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Gambling Luck System
                        const luckContainer = new ContainerBuilder()
                            .setAccentColor(0x4CAF50);

                        luckContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🍀 **GAMBLING LUCK SYSTEM**')
                        );

                        luckContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Rabbit's Foot** - \`$5,000 each\`\n> • Effect: +20% gambling win chance\n> • Duration: 4 hours per use\n> • **Stackable up to 5 times!**\n> • Max boost: 100% extra win chance\n\n**Strategy:** Stack 5x before big gambling sessions\n**Math:** 45% base + 100% luck = 75% win rate!\n**Best Use:** When you have $50,000+ to gamble`)
                        );

                        components.push(luckContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Income Boosters
                        const boostersContainer = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        boostersContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💼 **INCOME BOOSTERS**\n\n**Lucky Charm** - \`$10,000\`\n> • Effect: +50% work income for 7 days\n> • Stacks with family bonuses\n> • Example: $2,000 work becomes $3,000\n\n**Family Vacation Package** - \`$3,000\`\n> • Effect: +15% bond to ALL family members\n> • Instant effect, no cooldown\n> • Cheaper than taking multiple trips\n> • Best when bonds are below 80%`)
                        );

                        components.push(boostersContainer);
                        break;

                    case 5: // Page 6: Vehicles & Pets
                        const vehiclesHeader = new ContainerBuilder()
                            .setAccentColor(0xFF5722);

                        vehiclesHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🚗 VEHICLE SYSTEM & 🐕 PET MANAGEMENT\n## BUILD YOUR RACING EMPIRE & SECURITY FORCE\n\n> **Page 6 of 9** | Dominate races and protect your wealth\n> Cars provide racing income while pets offer security protection`)
                        );

                        components.push(vehiclesHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Car Performance Tiers
                        const carsContainer = new ContainerBuilder()
                            .setAccentColor(0x2196F3);

                        carsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🚗 **CAR PERFORMANCE TIERS**')
                        );

                        carsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**ECONOMY SEDAN** - \`$15,000\`\n> • Stats: 45 Speed, 40 Accel, 50 Handling\n> • Win Rate: ~30% • Winnings: $1,000-3,000\n\n**SPORTS COUPE** - \`$45,000\`\n> • Stats: 70 Speed, 75 Accel, 65 Handling\n> • Win Rate: ~55% • Winnings: $2,000-5,000\n\n**SUPERCAR** - \`$200,000\`\n> • Stats: 95 Speed, 90 Accel, 85 Handling\n> • Win Rate: ~80% • Winnings: $4,000-8,000\n\n**HYPERCAR** - \`$500,000\`\n> • Stats: 100 Speed, 100 Accel, 95 Handling\n> • Win Rate: ~95% • Winnings: $6,000-12,000`)
                        );

                        components.push(carsContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Pet Security Force
                        const petsContainer = new ContainerBuilder()
                            .setAccentColor(0xFF69B4);

                        petsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🐕 **PET SECURITY FORCE**\n\n**HOUSE CAT** - \`$500\`\n> • Security: 10 points • Low maintenance\n> • Good for: Basic starter protection\n\n**GUARD DOG** - \`$2,000\`\n> • Security: 40 points • Medium maintenance\n> • Good for: Standard home protection\n\n**ATTACK DOG** - \`$5,000\`\n> • Security: 70 points • High maintenance\n> • Good for: Maximum vault protection\n\n**SURVEILLANCE BIRD** - \`$3,000\`\n> • Security: 35 points • Medium maintenance\n> • Good for: Balanced security option`)
                        );

                        components.push(petsContainer);
                        break;

                    case 6: // Page 7: Business System
                        const businessHeader = new ContainerBuilder()
                            .setAccentColor(0x4CAF50);

                        businessHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🏢 BUSINESS EMPIRE SYSTEM\n## BUILD YOUR PASSIVE INCOME EMPIRE\n\n> **Page 7 of 9** | Master business domination\n> Businesses generate income 24/7 even when you're offline`)
                        );

                        components.push(businessHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Business Types
                        const businessTypesContainer = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        businessTypesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏢 **BUSINESS TYPES & PROFITABILITY**')
                        );

                        businessTypesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**RESTAURANT CHAIN** - \`$50,000\`\n> • Daily Income: $200-800 per level\n> • Max Level: 10 • Employees: 20\n> • Stable income, family discounts\n\n**TECH STARTUP** - \`$100,000\`\n> • Daily Income: $100-1,500 per level (volatile)\n> • Max Level: 10 • Employees: 15\n> • High risk/reward, IPO potential\n\n**REAL ESTATE AGENCY** - \`$75,000\`\n> • Daily Income: $300-600 per level\n> • Max Level: 10 • Employees: 12\n> • Steady income, market insider bonuses`)
                        );

                        components.push(businessTypesContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Premium Businesses
                        const premiumContainer = new ContainerBuilder()
                            .setAccentColor(0x9C27B0);

                        premiumContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💎 **PREMIUM BUSINESSES**\n\n**CAR DEALERSHIP** - \`$200,000\`\n> • Daily Income: $400-1,000 per level\n> • Max Level: 10 • Employees: 10\n> • Sell to players, exotic car bonuses\n\n**SECURITY COMPANY** - \`$150,000\`\n> • Daily Income: $250-700 per level\n> • Max Level: 10 • Employees: 25\n> • Government contracts, PMC services\n\n**PRIVATE CASINO** - \`$500,000\`\n> • Daily Income: $0-3,000 per level (very volatile)\n> • Max Level: 10 • Employees: 30\n> • Ultimate high-risk business, money laundering`)
                        );

                        components.push(premiumContainer);
                        break;

                    case 7: // Page 8: Heist System
                        const heistHeader = new ContainerBuilder()
                            .setAccentColor(0xFF5722);

                        heistHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🎯 HEIST SYSTEM - TEAM CRIME OPERATIONS\n## PLAN & EXECUTE TEAM-BASED HEISTS\n\n> **Page 8 of 9** | Master criminal operations\n> High risk operations with massive rewards - requires teamwork`)
                        );

                        components.push(heistHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Heist Targets
                        const targetsContainer = new ContainerBuilder()
                            .setAccentColor(0xF44336);

                        targetsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🎯 **HEIST TARGETS & PAYOUTS**')
                        );

                        targetsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**ARMORED TRUCK** - Easy (75% success)\n> • Payout: $50,000-150,000 • Members: 3\n> • Equipment: Weapons, getaway cars\n\n**JEWELRY STORE** - Medium (60% success)\n> • Payout: $100,000-400,000 • Members: 3\n> • Equipment: Glass cutters, masks, cars\n\n**CASINO VAULT** - Hard (25% success)\n> • Payout: $800,000-2,000,000 • Members: 5\n> • Equipment: Keycard cloner, hacking tools\n\n**CENTRAL BANK** - Ultimate (15% success)\n> • Payout: $2,000,000-5,000,000 • Members: 6\n> • Equipment: Thermal lance, EMP, explosives`)
                        );

                        components.push(targetsContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Heist Roles
                        const rolesContainer = new ContainerBuilder()
                            .setAccentColor(0x9C27B0);

                        rolesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 👥 **HEIST ROLES & RESPONSIBILITIES**\n\n**MASTERMIND** (Required)\n> • Plans the heist, gets 1.5x payout share\n> • Must own equipment and recruit team\n\n**HACKER** (Tech heists)\n> • Bypasses security systems, 1.3x payout\n> • Requires high heist skill level\n\n**SAFECRACKER** (Vault heists)\n> • Opens safes and vaults, 1.2x payout\n> • Specialized role for bank jobs\n\n**DRIVER/MUSCLE/LOOKOUT** (Support)\n> • Essential support roles, 1.0x payout\n> • Lower skill requirements`)
                        );

                        components.push(rolesContainer);
                        break;

                    case 8: // Page 9: Pro Strategies
                        const proHeader = new ContainerBuilder()
                            .setAccentColor(0xFFD700);

                        proHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 💡 PRO STRATEGIES & MASTER TIPS\n## ELITE-LEVEL STRATEGIES FOR TOTAL ECONOMY DOMINATION\n\n> **Page 9 of 9** | Become the server's richest player\n> Master these strategies to build an unstoppable criminal empire`)
                        );

                        components.push(proHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Early Game Mastery
                        const earlyGameContainer = new ContainerBuilder()
                            .setAccentColor(0x4CAF50);

                        earlyGameContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🚀 **EARLY GAME MASTERY** (Levels 1-10)')
                        );

                        earlyGameContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Week 1: Foundation**\n1. Claim daily rewards religiously (build streaks)\n2. Work every hour possible\n3. Save $50,000 for Studio Apartment + Restaurant\n4. Immediately add Spouse (highest income)\n5. Buy House Cat for basic security ($500)\n\n**Week 2-3: Business Scaling**\n6. Upgrade restaurant to level 3-4\n7. Hire 5-10 employees for restaurant\n8. Save for 2BR Apartment upgrade\n9. Add Parent as 2nd family member\n10. Collect business profits daily`)
                        );

                        components.push(earlyGameContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Mid Game Tactics
                        const midGameContainer = new ContainerBuilder()
                            .setAccentColor(0xFF9800);

                        midGameContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💎 **MID GAME TACTICS** (Levels 10-25)\n\n**Month 2: Empire Expansion**\n1. Own Restaurant + Tech Startup businesses\n2. Save $300,000 for Family House\n3. Fill all 5 family member slots\n4. Take trips to boost bonds to 80%+\n5. Plan first armored truck heist (easy money)\n\n**Income Targets Per Week:**\n> • Business profits: $20,000-40,000\n> • Work + family: $15,000-25,000\n> • Heist profits: $50,000-200,000\n> • **Total: $85,000-265,000 weekly income**`)
                        );

                        components.push(midGameContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // The 12 Commandments
                        const commandmentsContainer = new ContainerBuilder()
                            .setAccentColor(0xF44336);

                        commandmentsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## ⚠️ **THE 12 COMMANDMENTS OF SUCCESS**\n\n1. **NEVER** attempt heists without full equipment\n2. **ALWAYS** check team members' heist skills\n3. **NEVER** plan heists during high heat periods\n4. **ALWAYS** collect business profits daily\n5. **NEVER** gamble without luck boosts\n6. **ALWAYS** care for pets every 2-3 days\n7. **NEVER** keep more than 25% wealth in wallet\n8. **ALWAYS** upgrade businesses before buying new ones\n9. **NEVER** race with cars below 70% durability\n10. **ALWAYS** recruit experienced heist members\n11. **NEVER** attempt Central Bank with <80 heist skill\n12. **ALWAYS** diversify income: business + family + heists`)
                        );

                        components.push(commandmentsContainer);
                        break;

                    default:
                        components.push(new ContainerBuilder().setAccentColor(0xE74C3C)
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent('Page not found')));
                }

                return components;
            };

            const createNavigationButtons = () => {
                const navContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                const navText = `## 📖 **NAVIGATION**\n\n**Current Page:** ${currentPage + 1} of ${totalPages}\n\n**📚 Guide Sections:**\n> 1. Command Overview • 2. Basic Economy • 3. Property System\n> 4. Family & Security • 5. Shop & Effects • 6. Vehicles & Pets\n> 7. Business Empire • 8. Heist System • 9. Pro Strategies\n\n**⏰ This guide expires in 10 minutes**`;

                if (currentPage > 0) {
                    navContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${navText}\n\n**◀️ Previous:** Page ${currentPage}`)
                    );
                } else if (currentPage < totalPages - 1) {
                    navContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${navText}\n\n**▶️ Next:** Page ${currentPage + 2}`)
                    );
                } else {
                    navContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(navText)
                    );
                }

                return navContainer;
            };

            const sendPage = async (isEdit = false) => {
                const components = createPage(currentPage);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                components.push(createNavigationButtons());

                const messageData = {
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                };

                if (isEdit) {
                    return msg.edit(messageData);
                } else {
                    return message.reply(messageData);
                }
            };

  
            const msg = await sendPage();

        
            await msg.react('◀️');
            await msg.react('▶️');
            await msg.react('❌');

            const reactionCollector = msg.createReactionCollector({
                filter: (reaction, user) => {
                    return ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                },
                time: 600000 
            });

            reactionCollector.on('collect', async (reaction, user) => {
                await reaction.users.remove(user.id);

                switch (reaction.emoji.name) {
                    case '◀️':
                        if (currentPage > 0) {
                            currentPage--;
                            await sendPage(true);
                        }
                        break;
                    case '▶️':
                        if (currentPage < totalPages - 1) {
                            currentPage++;
                            await sendPage(true);
                        }
                        break;
                    case '❌':
                        const closedComponents = [];
                        const closedContainer = new ContainerBuilder()
                            .setAccentColor(0x95A5A6);

                        closedContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 📚 Economy Guide Closed\n## THANK YOU FOR READING\n\n> The comprehensive economy guide has been closed.\n> Use \`!economy\` anytime to reopen this guide.\n\n**💡 Remember:** Master these strategies to dominate the server economy!`)
                        );

                        closedComponents.push(closedContainer);

                        await msg.edit({
                            components: closedComponents,
                            flags: MessageFlags.IsComponentsV2
                        });
                        reactionCollector.stop();
                        break;
                }
            });

            reactionCollector.on('end', () => {
                msg.reactions.removeAll().catch(() => {});
            });

        } catch (error) {
            console.error('Error in economy command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **ECONOMY GUIDE ERROR**\n\nSomething went wrong while loading the economy guide. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
