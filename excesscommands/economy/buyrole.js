const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { ROLES } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buyrole',
    aliases: ['role-buy'],
    description: 'Purchase premium roles with special benefits using v2 components',
    usage: '!buyrole <role_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
      
                const components = [];

          
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👑 Premium Role Collection\n## EXCLUSIVE MEMBERSHIP BENEFITS\n\n> Unlock premium features and enhanced earnings with our exclusive role collection.\n> Each role provides unique benefits to accelerate your economy journey.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
                const roleEntries = Object.entries(ROLES);
                const rolesByTier = {};
                
                roleEntries.forEach(([id, role]) => {
                    const tier = getRoleTier(role.price);
                    if (!rolesByTier[tier]) {
                        rolesByTier[tier] = [];
                    }
                    rolesByTier[tier].push([id, role]);
                });

           
                Object.entries(rolesByTier).forEach(([tier, roles]) => {
                    const tierContainer = new ContainerBuilder()
                        .setAccentColor(getRoleTierColor(tier));

                    const tierEmoji = getRoleTierEmoji(tier);
                    tierContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${tierEmoji} **${tier.toUpperCase()} TIER ROLES**`)
                    );

               
                    for (let i = 0; i < roles.length; i += 3) {
                        const roleGroup = roles.slice(i, i + 3);
                        const roleText = roleGroup.map(([id, role]) => 
                            `**\`${id}\`** - ${role.name}\n> **Price:** \`$${role.price.toLocaleString()}\` • **Duration:** \`${formatDuration(role.duration)}\`\n> **Work:** ${role.benefits.workMultiplier}x • **Racing:** +${role.benefits.racingBonus} • **Security:** +${role.benefits.robberyProtection}%`
                        ).join('\n\n');

                        tierContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(roleText)
                        );
                    }

                    components.push(tierContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

            
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **HOW TO PURCHASE**\n\n**Command:** \`!buyrole <role_id>\`\n**Example:** \`!buyrole premium_member\`\n\n**💡 Benefits:**\n> • Enhanced work earnings with multipliers\n> • Racing bonuses for competitive advantage\n> • Security boosts against robberies\n> • Exclusive status and recognition\n> • Automatic Discord role assignment`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const roleId = args[0].toLowerCase();
            const roleData = ROLES[roleId];

            if (!roleData) {
                const components = [];

                const invalidRoleContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidRoleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Role ID\n## ROLE NOT FOUND\n\n> **\`${roleId}\`** is not a valid role ID!\n> Use \`!buyrole\` to see all available premium roles with their correct IDs.`)
                );

                components.push(invalidRoleContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

        
            const existingRole = profile.purchasedRoles.find(r => r.roleId === roleId && (!r.expiryDate || r.expiryDate > new Date()));
            if (existingRole) {
                const components = [];

                const activeRoleContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                activeRoleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👑 Role Already Active\n## MEMBERSHIP ALREADY OWNED\n\n> You already have the **${roleData.name}** role active!\n> Your membership expires on: **${new Date(existingRole.expiryDate).toLocaleDateString()}**\n\n**💡 Tip:** Wait for your current membership to expire before purchasing again, or choose a different role to stack benefits.`)
                );

                components.push(activeRoleContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < roleData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD PREMIUM ROLE\n\n> You don't have enough money to purchase the **${roleData.name}** role!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **MEMBERSHIP PRICING**\n\n**Role:** \`${roleData.name}\`\n**Price:** \`$${roleData.price.toLocaleString()}\`\n**Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Shortage:** \`$${(roleData.price - profile.wallet).toLocaleString()}\`\n**Duration:** \`${formatDuration(roleData.duration)}\`\n\n**💡 Investment Tips:** Premium roles pay for themselves through enhanced earnings! Work consistently to afford these valuable upgrades.`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            
            profile.wallet -= roleData.price;
            
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + roleData.duration);
            
            profile.purchasedRoles.push({
                roleId,
                roleName: roleData.name,
                price: roleData.price,
                benefits: roleData.benefits,
                datePurchased: new Date(),
                expiryDate
            });

          
            profile.transactions.push({
                type: 'expense',
                amount: roleData.price,
                description: `Purchased premium role: ${roleData.name}`,
                category: 'role'
            });

            await profile.save();

            
            try {
                const discordRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleData.name.toLowerCase());
                if (discordRole) {
                    await message.member.roles.add(discordRole);
                }
            } catch (error) {
                console.log('Could not assign Discord role:', error.message);
            }

      
            const components = [];

           
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFFD700);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 👑 Premium Role Purchased!\n## MEMBERSHIP ACTIVATED\n\n> Congratulations! You've successfully purchased the **${roleData.name}** role for **\`$${roleData.price.toLocaleString()}\`**!\n> Your premium membership is now active and ready to enhance your earnings!`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

         
            const benefitsContainer = new ContainerBuilder()
                .setAccentColor(0xFFC107);

            benefitsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚡ **PREMIUM BENEFITS ACTIVATED**')
            );

            benefitsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💼 Work Multiplier:** \`${roleData.benefits.workMultiplier}x\` (${((roleData.benefits.workMultiplier - 1) * 100).toFixed(0)}% bonus)\n**🏁 Racing Bonus:** \`+$${roleData.benefits.racingBonus}\` per race win\n**🛡️ Security Bonus:** \`+${roleData.benefits.robberyProtection}%\` robbery protection\n**👑 Status:** Premium member privileges`)
            );

            benefitsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📅 Membership Duration:** \`${formatDuration(roleData.duration)}\`\n**⏰ Activation Date:** \`${new Date().toLocaleDateString()}\`\n**📅 Expiry Date:** \`${expiryDate.toLocaleDateString()}\`\n**🎯 Discord Role:** ${message.guild.roles.cache.find(r => r.name.toLowerCase() === roleData.name.toLowerCase()) ? 'Assigned successfully' : 'Manual assignment may be needed'}`)
            );

            components.push(benefitsContainer);

           
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const projectionContainer = new ContainerBuilder()
                .setAccentColor(0x28A745);

            projectionContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📈 **EARNINGS ENHANCEMENT**')
            );

            const baseWorkEarnings = 350; 
            const enhancedEarnings = Math.floor(baseWorkEarnings * roleData.benefits.workMultiplier);
            const dailyBonus = enhancedEarnings - baseWorkEarnings;
            const totalBonus = dailyBonus * roleData.duration;

            projectionContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Enhanced Work Earnings:** \`$${enhancedEarnings}\` per work (vs \`$${baseWorkEarnings}\` base)\n**📊 Daily Bonus:** \`+$${dailyBonus}\` per work session\n**🎯 Potential Total Bonus:** \`+$${totalBonus.toLocaleString()}\` over membership period\n**💎 ROI Timeline:** Role pays for itself in ${Math.ceil(roleData.price / dailyBonus)} work sessions`)
            );

            components.push(projectionContainer);

           
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x6C757D);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **TRANSACTION SUMMARY**\n\n**Membership Fee:** \`$${roleData.price.toLocaleString()}\`\n**Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Active Roles:** \`${profile.purchasedRoles.filter(r => !r.expiryDate || r.expiryDate > new Date()).length}\`\n**Transaction Logged:** Purchase recorded in your transaction history\n\n> Your investment in premium membership will enhance all your future earnings!`)
            );

            components.push(financialContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buyrole command:', error);

        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **ROLE PURCHASE ERROR**\n\nSomething went wrong while processing your premium role purchase. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function formatDuration(days) {
    if (days < 7) {
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    let result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
    if (remainingDays > 0) {
        result += ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
    
    return result;
}

function getRoleTier(price) {
    if (price <= 5000) return 'basic';
    if (price <= 15000) return 'premium';
    if (price <= 50000) return 'elite';
    return 'ultimate';
}

function getRoleTierColor(tier) {
    const colors = {
        'basic': 0x6C757D,  
        'premium': 0x007BFF,  
        'elite': 0x9B59B6,     
        'ultimate': 0xFFD700  
    };
    return colors[tier] || 0xFFD700;
}

function getRoleTierEmoji(tier) {
    const emojis = {
        'basic': '🥉',
        'premium': '🥈', 
        'elite': '🥇',
        'ultimate': '💎'
    };
    return emojis[tier] || '👑';
}
