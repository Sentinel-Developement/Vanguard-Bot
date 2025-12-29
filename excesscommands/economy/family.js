const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'family',
    aliases: ['fam'],
    description: 'View your family members and their status with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.familyMembers.length === 0) {
                const components = [];

                const noFamilyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noFamilyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👨‍👩‍👧‍👦 No Family Members Yet\n## BUILD YOUR FAMILY DYNASTY\n\n> You don't have any family members to support your economy journey!\n> Family members provide work bonuses and emotional support for your adventures.`)
                );

                components.push(noFamilyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏠 **HOW TO BUILD YOUR FAMILY**\n\n**Step 1:** Purchase a property with family capacity\n**Step 2:** Add family members through family management commands\n**Step 3:** Build bonds through trips and activities\n**Step 4:** Enjoy enhanced work earnings and companionship\n\n**💡 Benefits:**\n> • Enhanced work income through family support\n> • Emotional bonds that boost productivity\n> • Family trips and shared experiences\n> • Larger households with more capacity`)
                );

                components.push(solutionContainer);

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
                    .setContent(`# 👨‍👩‍👧‍👦 ${message.author.username}'s Family\n## YOUR LOVING HOUSEHOLD\n\n> Meet your family members who support your economy journey with love, work, and dedication.\n> Strong family bonds lead to better work performance and higher earnings.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

         
            const familyMemberGroups = [];
            for (let i = 0; i < profile.familyMembers.length; i += 3) {
                familyMemberGroups.push(profile.familyMembers.slice(i, i + 3));
            }

            familyMemberGroups.forEach((group, groupIndex) => {
                const memberContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC0CB);

                memberContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **FAMILY MEMBERS ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((member, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const efficiency = (member.bond / 100 * member.workEfficiency * 100).toFixed(0);
                    const lastTripText = member.lastTrip ? 
                        new Date(member.lastTrip).toLocaleDateString() : 'Never';
                    
                    const memberText = `**${actualIndex}. ${member.name}** (${member.relationship})\n` +
                        `> **👔 Profession:** \`${member.profession}\`\n` +
                        `> **💰 Salary:** \`$${member.salary}/work\`\n` +
                        `> **❤️ Bond Level:** \`${member.bond}%\`\n` +
                        `> **📈 Work Efficiency:** \`${efficiency}%\`\n` +
                        `> **🚗 Total Trips:** \`${member.totalTrips}\`\n` +
                        `> **📅 Last Trip:** \`${lastTripText}\``;

                    memberContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(memberText)
                    );
                });

                components.push(memberContainer);
                
                if (groupIndex < familyMemberGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **FAMILY STATISTICS**')
            );

      
            const totalIncome = profile.familyMembers.reduce((sum, member) => {
                return sum + (member.salary * member.workEfficiency * (member.bond / 100));
            }, 0);

            const averageBond = profile.familyMembers.length > 0 ? 
                profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length : 0;

            const totalTrips = profile.familyMembers.reduce((sum, m) => sum + m.totalTrips, 0);

            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            const maxCapacity = primaryProperty ? primaryProperty.maxFamilyMembers : 0;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Combined Work Income:** \`$${Math.floor(totalIncome).toLocaleString()}/work\`\n**❤️ Family Bond Average:** \`${averageBond.toFixed(1)}%\`\n**👥 Family Size:** \`${profile.familyMembers.length}/${maxCapacity} members\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Total Family Trips:** \`${totalTrips}\`\n**🏠 Property Capacity:** \`${maxCapacity} members max\`\n**📈 Work Multiplier Impact:** \`${EconomyManager.calculateWorkMultiplier(profile).toFixed(2)}x\``)
            );

            components.push(statsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const bondContainer = new ContainerBuilder()
                .setAccentColor(0xAD1457);

            bondContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **BOND LEVEL ANALYSIS**')
            );

      
            const highBond = profile.familyMembers.filter(m => m.bond >= 80).length;
            const mediumBond = profile.familyMembers.filter(m => m.bond >= 50 && m.bond < 80).length;
            const lowBond = profile.familyMembers.filter(m => m.bond < 50).length;

            bondContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 High Bond (80%+):** \`${highBond} members\`\n**⭐ Medium Bond (50-79%):** \`${mediumBond} members\`\n**💔 Low Bond (<50%):** \`${lowBond} members\`\n\n**💡 Bond Impact:** Higher bonds = better work efficiency and income!`)
            );

            if (lowBond > 0) {
                bondContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Improvement Tip:** Take your family on trips to boost bonds with members below 50%!`)
                );
            }

            components.push(bondContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x8E24AA);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **FAMILY MANAGEMENT TIPS**\n\n**🚗 Take Trips:** Use \`!trip\` to improve family bonds and relationships\n**💼 Work Benefits:** Family members contribute to your work earnings automatically\n**🏠 Expand:** Upgrade to larger properties to accommodate more family members\n**❤️ Build Bonds:** Higher bond levels = better work efficiency and income\n**📅 Regular Care:** Consistent trips and attention maintain strong family relationships\n\n> A happy family is a productive family!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in family command:', error);

            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAMILY ERROR**\n\nSomething went wrong while retrieving your family information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
