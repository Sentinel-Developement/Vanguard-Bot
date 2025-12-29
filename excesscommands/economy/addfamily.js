const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

const FAMILY_TEMPLATES = {
    spouse: {
        relationships: ['spouse'],
        professions: ['Teacher', 'Nurse', 'Engineer', 'Designer', 'Manager'],
        salaryRange: [300, 800]
    },
    child: {
        relationships: ['child'],
        professions: ['Student (Part-time)', 'Intern', 'Babysitter'],
        salaryRange: [50, 200]
    },
    parent: {
        relationships: ['parent'],
        professions: ['Retired Teacher', 'Consultant', 'Small Business Owner'],
        salaryRange: [400, 900]
    },
    sibling: {
        relationships: ['sibling'],
        professions: ['Artist', 'Mechanic', 'Chef', 'Programmer'],
        salaryRange: [250, 600]
    }
};

module.exports = {
    name: 'addfamily',
    aliases: ['family-add'],
    description: 'Add a family member to your household with v2 components',
    usage: '!addfamily <type> <name>',
    async execute(message, args) {
        try {
            if (args.length < 2) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👨‍👩‍👧‍👦 Add Family Member\n## MISSING REQUIRED INFORMATION\n\n> Please specify the family member type and their name!\n> **Usage:** \`!addfamily <type> <name>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const typesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const typesList = Object.entries(FAMILY_TEMPLATES).map(([type, template]) => {
                    const professions = template.professions.slice(0, 2).join(', ');
                    const salaryRange = `$${template.salaryRange[0]}-${template.salaryRange[1]}`;
                    return `**\`${type}\`** - ${professions} (${salaryRange})`;
                }).join('\n');

                typesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **AVAILABLE FAMILY TYPES**\n\n${typesList}\n\n**Examples:**\n> \`!addfamily spouse Emma\`\n> \`!addfamily child Alex\`\n> \`!addfamily parent Robert\``)
                );

                components.push(typesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const type = args[0].toLowerCase();
            const name = args.slice(1).join(' ');
            
            if (!FAMILY_TEMPLATES[type]) {
                const components = [];

                const invalidTypeContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidTypeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Family Type\n## UNRECOGNIZED RELATIONSHIP\n\n> **\`${type}\`** is not a valid family member type!\n> Choose from the available family relationships below.`)
                );

                components.push(invalidTypeContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validTypesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                validTypesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **VALID FAMILY TYPES**\n\n**👫 \`spouse\`** - Life partner, married companion\n**👶 \`child\`** - Son, daughter, adopted child\n**👴 \`parent\`** - Mother, father, guardian\n**👪 \`sibling\`** - Brother, sister, adopted sibling\n\n**💡 Try:** \`!addfamily spouse ${name}\``)
                );

                components.push(validTypesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.properties.length === 0) {
                const components = [];

                const noPropertyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noPropertyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Property Required for Family\n## NO HOME FOR FAMILY MEMBERS\n\n> You need to own a property before adding family members!\n> Family members need a safe and comfortable place to live.`)
                );

                components.push(noPropertyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **GET A HOME FOR YOUR FAMILY**\n\n**Step 1:** Use \`!buyhouse\` to browse available properties\n**Step 2:** Purchase a property with family capacity\n**Step 3:** Set it as your primary residence\n**Step 4:** Return here to add **${name}** as your ${type}!\n\n**💡 Family Benefits:**\n> • Family members contribute to work income\n> • Build relationships through trips and activities\n> • Enhanced household security and companionship\n> • Larger families = more earning potential`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            if (!primaryProperty) {
                profile.primaryResidence = profile.properties[0].propertyId;
                await profile.save();
            }
            
            const activeProperty = primaryProperty || profile.properties[0];
            
            if (profile.familyMembers.length >= activeProperty.maxFamilyMembers) {
                const components = [];

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Family Capacity Limit Reached\n## MAXIMUM HOUSEHOLD SIZE\n\n> Your **${activeProperty.name}** can only house **${activeProperty.maxFamilyMembers}** family members!\n> You currently have **${profile.familyMembers.length}** family members living there.`)
                );

                components.push(capacityContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **EXPAND YOUR FAMILY HOME**\n\n**Current Family:** ${profile.familyMembers.map(m => m.name).join(', ')}\n\n**💡 Solutions:**\n> • Upgrade to a larger property with more family capacity\n> • Purchase an additional property for extended family\n> • Consider which family relationships are most important\n\n**🎯 Goal:** Find a property that can house **${profile.familyMembers.length + 1}+** family members`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (profile.familyMembers.some(member => member.name.toLowerCase() === name.toLowerCase())) {
                const components = [];

                const duplicateNameContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateNameContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Duplicate Family Name\n## NAME ALREADY IN USE\n\n> You already have a family member named **${name}**!\n> Each family member needs a unique name for identification.`)
                );

                components.push(duplicateNameContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const suggestionContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                const existingMember = profile.familyMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
                suggestionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **NAME SUGGESTIONS**\n\n**Existing Member:** **${existingMember.name}** (${existingMember.relationship})\n\n**Try Different Names:**\n> \`!addfamily ${type} ${name}2\`\n> \`!addfamily ${type} ${name.split(' ')[0]} ${name.split(' ')[1] || 'Jr'}\`\n> \`!addfamily ${type} [Choose a different name]\`\n\n**💡 Tip:** Use nicknames or middle names to make each family member unique!`)
                );

                components.push(suggestionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const template = FAMILY_TEMPLATES[type];
            const profession = template.professions[Math.floor(Math.random() * template.professions.length)];
            const salary = Math.floor(Math.random() * (template.salaryRange[1] - template.salaryRange[0] + 1)) + template.salaryRange[0];
            const age = type === 'child' ? Math.floor(Math.random() * 15) + 5 : 
                       type === 'parent' ? Math.floor(Math.random() * 20) + 45 :
                       Math.floor(Math.random() * 30) + 20;
            
            const familyMember = {
                memberId: `${type}_${Date.now()}`,
                name,
                relationship: type,
                age,
                profession,
                salary,
                bond: 50,
                workEfficiency: 1.0,
                totalTrips: 0,
                dateAdded: new Date(),
                lastTrip: null
            };
            
            profile.familyMembers.push(familyMember);
          
            const avgBond = profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length;
            profile.familyBond = Math.floor(avgBond);
            
         
            profile.maxPets = Math.min(10, Math.floor(activeProperty.maxFamilyMembers / 2) + 1);
            
            await profile.save();
            
      
            const components = [];

         
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 👨‍👩‍👧‍👦 Family Member Added!\n## WELCOME TO THE FAMILY\n\n> **${name}** has officially joined your household as your ${type}!\n> Your family is growing stronger and your home feels more complete.`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            const profileContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👤 **NEW FAMILY MEMBER PROFILE**')
            );

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👤 Name:** \`${name}\`\n**💞 Relationship:** \`${type}\`\n**🎂 Age:** \`${age} years old\`\n**💼 Profession:** \`${profession}\`\n**💰 Work Salary:** \`$${salary} per work session\``)
            );

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**❤️ Initial Bond:** \`50%\` (room for growth!)\n**📈 Work Efficiency:** \`100%\` (optimal performance)\n**🚗 Total Trips:** \`0\` (ready for adventures!)\n**📅 Joined Family:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(profileContainer);

     
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const householdContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            householdContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏠 **UPDATED HOUSEHOLD STATUS**')
            );

            const totalFamilyIncome = profile.familyMembers.reduce((sum, member) => {
                return sum + (member.salary * member.workEfficiency * (member.bond / 100));
            }, 0);

            householdContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👥 Total Family Members:** \`${profile.familyMembers.length}/${activeProperty.maxFamilyMembers}\`\n**❤️ Average Family Bond:** \`${profile.familyBond}%\`\n**💰 Combined Family Income:** \`$${Math.floor(totalFamilyIncome)}/work\`\n**🏠 Property:** \`${activeProperty.name}\``)
            );

            householdContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐕 Pet Capacity:** \`${profile.maxPets}\` (updated based on family size)\n**🎯 Family Goal:** Build bonds through trips and activities\n**📈 Work Bonus:** Family contributes to your earnings automatically`)
            );

            components.push(householdContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const bondingContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            bondingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **FAMILY BONDING GUIDE**')
            );

            bondingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Take Family Trips:** Use \`!trip\` to build stronger relationships\n**❤️ Build Bonds:** Higher bonds = better work efficiency and income\n**👨‍👩‍👧‍👦 Expand Family:** Add more members if you have space\n**🏠 Upgrade Home:** Larger properties house bigger families\n**🎯 Long-term Goal:** Reach 100% bond with all family members`)
            );

            bondingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💡 **${name}** is ready to:**\n> • Contribute to your work earnings automatically\n> • Join family trips to build stronger bonds\n> • Help increase your household's overall happiness\n> • Provide companionship and emotional support\n\n> Welcome to your growing family empire!`)
            );

            components.push(bondingContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in addfamily command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAMILY ADDITION ERROR**\n\nSomething went wrong while adding your family member. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
