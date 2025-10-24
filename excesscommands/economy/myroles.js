const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'myroles',
    aliases: ['roles'],
    description: 'View your purchased premium roles with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const now = new Date();
            const activeRoles = profile.purchasedRoles.filter(role => 
                !role.expiryDate || new Date(role.expiryDate) > now
            );
            
            const expiredRoles = profile.purchasedRoles.filter(role => 
                role.expiryDate && new Date(role.expiryDate) <= now
            );
            
            if (activeRoles.length === 0 && expiredRoles.length === 0) {
                const components = [];

                const noRolesContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noRolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👑 No Premium Roles Found\n## BUILD YOUR PREMIUM COLLECTION\n\n> You don't have any premium roles yet! Premium roles provide significant advantages in your economy journey.\n> Unlock enhanced earnings, bonuses, and exclusive benefits with role memberships.`)
                );

                components.push(noRolesContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const purchaseContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                purchaseContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **GET YOUR FIRST PREMIUM ROLE**\n\n**Step 1:** Use \`!buyrole\` to see available premium memberships\n**Step 2:** Choose a role that fits your budget and goals\n**Step 3:** Enjoy enhanced earnings and exclusive benefits\n**Step 4:** Stack multiple roles for maximum advantage!\n\n**💡 Benefits of Premium Roles:**\n> • Enhanced work earnings with multipliers\n> • Racing bonuses for competitive advantage\n> • Security boosts against robberies\n> • Family bonuses for household management\n> • Exclusive status and recognition`)
                );

                components.push(purchaseContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const components = [];

          
            const headerContainer = new ContainerBuilder()
                .setAccentColor(activeRoles.length > 0 ? 0xFFD700 : 0x808080);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 👑 ${message.author.username}'s Premium Roles\n## YOUR EXCLUSIVE MEMBERSHIPS\n\n> Welcome to your premium role collection! These memberships provide valuable bonuses and enhance your economy experience.\n> ${activeRoles.length > 0 ? `You have ${activeRoles.length} active membership${activeRoles.length !== 1 ? 's' : ''} working for you!` : 'All your memberships have expired - time to renew!'}`)
            );

            components.push(headerContainer);

            
            if (activeRoles.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const activeContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                activeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🟢 **ACTIVE PREMIUM MEMBERSHIPS**')
                );

                activeRoles.forEach((role, index) => {
                    const daysLeft = role.expiryDate ? 
                        Math.ceil((new Date(role.expiryDate) - now) / (1000 * 60 * 60 * 24)) : 
                        'Permanent';

                    const timeLeftText = typeof daysLeft === 'number' ? 
                        daysLeft > 0 ? `${daysLeft} days remaining` : 'Expires today!' :
                        daysLeft;

                    const purchaseDate = role.datePurchased ? 
                        new Date(role.datePurchased).toLocaleDateString() : 'Unknown';

                    const roleText = `**${index + 1}. ${role.roleName}**\n` +
                        `> **⏰ Status:** \`${timeLeftText}\`\n` +
                        `> **💼 Work Multiplier:** \`${role.benefits.workMultiplier}x\` bonus\n` +
                        `> **🏁 Racing Bonus:** \`+$${role.benefits.racingBonus}\` per win\n` +
                        `> **🛡️ Security Bonus:** \`+${role.benefits.robberyProtection}%\` protection\n` +
                        `> **👨‍👩‍👧‍👦 Family Bonus:** \`+${role.benefits.familyBonus}\` multiplier\n` +
                        `> **💰 Purchase Price:** \`$${role.price?.toLocaleString() || 'Unknown'}\`\n` +
                        `> **📅 Purchased:** \`${purchaseDate}\``;

                    activeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(roleText)
                    );
                });

                components.push(activeContainer);

            
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const benefitsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                benefitsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **COMBINED BENEFITS ACTIVE**')
                );

                const totalWorkMultiplier = activeRoles.reduce((sum, role) => 
                    sum + (role.benefits.workMultiplier - 1), 0) + 1;
                const totalRacingBonus = activeRoles.reduce((sum, role) => 
                    sum + role.benefits.racingBonus, 0);
                const totalSecurityBonus = activeRoles.reduce((sum, role) => 
                    sum + role.benefits.robberyProtection, 0);
                const totalFamilyBonus = activeRoles.reduce((sum, role) => 
                    sum + role.benefits.familyBonus, 0);

                benefitsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💼 Total Work Multiplier:** \`${totalWorkMultiplier.toFixed(2)}x\` (${((totalWorkMultiplier - 1) * 100).toFixed(0)}% bonus)\n**🏁 Total Racing Bonus:** \`+$${totalRacingBonus}\` per race win\n**🛡️ Total Security Bonus:** \`+${totalSecurityBonus}%\` robbery protection\n**👨‍👩‍👧‍👦 Total Family Bonus:** \`+${totalFamilyBonus}\` family multiplier`)
                );

                benefitsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 ROI Status:** Your premium roles are actively enhancing every aspect of your economy!\n\n> These bonuses are applied automatically to all relevant activities.`)
                );

                components.push(benefitsContainer);
            }

           
            if (expiredRoles.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const expiredContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                expiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🔴 **EXPIRED MEMBERSHIPS**')
                );

                const recentExpired = expiredRoles.slice(-3);
                recentExpired.forEach((role, index) => {
                    const expiredDate = role.expiryDate ? 
                        new Date(role.expiryDate).toLocaleDateString() : 'Unknown';

                    const expiredText = `**${index + 1}. ${role.roleName}** (Expired)\n` +
                        `> **📅 Expired On:** \`${expiredDate}\`\n` +
                        `> **💡 Status:** Benefits no longer active`;

                    expiredContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(expiredText)
                    );
                });

                if (expiredRoles.length > 3) {
                    expiredContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*...and ${expiredRoles.length - 3} more expired roles*`)
                    );
                }

                expiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔄 Renewal:** Use \`!buyrole\` to purchase new memberships and restore your premium benefits!`)
                );

                components.push(expiredContainer);
            }

      
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💡 **ROLE MANAGEMENT TIPS**')
            );

            if (activeRoles.length > 0) {
                const soonToExpire = activeRoles.filter(role => {
                    if (!role.expiryDate) return false;
                    const daysLeft = Math.ceil((new Date(role.expiryDate) - now) / (1000 * 60 * 60 * 24));
                    return daysLeft <= 3;
                });

                if (soonToExpire.length > 0) {
                    managementContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⚠️ EXPIRATION ALERT:** ${soonToExpire.length} role${soonToExpire.length !== 1 ? 's' : ''} expiring soon!\n**🔄 Action Needed:** Consider renewing to maintain your premium benefits.`)
                    );
                }

                managementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🛒 Expand Collection:** Use \`!buyrole\` to add more premium roles\n**📊 Monitor Benefits:** Your roles are actively boosting your earnings\n**💰 ROI Tracking:** Premium roles typically pay for themselves quickly\n**⏰ Renewal Planning:** Plan renewals before expiration to avoid benefit gaps`)
                );
            } else {
                managementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Rebuild Your Collection:** All your memberships have expired\n**💡 Strategic Restart:** Choose roles that align with your current goals\n**📈 Compounding Benefits:** Multiple roles stack for maximum advantage\n**🔄 Fresh Start:** Use your experience to make better role choices`)
                );
            }

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in myroles command:', error);

        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **ROLE COLLECTION ERROR**\n\nSomething went wrong while retrieving your premium roles. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
