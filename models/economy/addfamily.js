const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('./economy');

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
    description: 'Add a family member to your household',
    usage: '!addfamily <type> <name>',
    async execute(message, args) {
        if (args.length < 2) {
            const types = Object.keys(FAMILY_TEMPLATES).join(', ');
            return message.reply(`❌ Usage: \`!addfamily <type> <name>\`\nTypes: ${types}`);
        }
        
        const type = args[0].toLowerCase();
        const name = args.slice(1).join(' ');
        
        if (!FAMILY_TEMPLATES[type]) {
            return message.reply('❌ Invalid family type! Use: spouse, child, parent, sibling');
        }
        
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
        if (!primaryProperty) {
            return message.reply('❌ You need to own a property to add family members!');
        }
        
        if (profile.familyMembers.length >= primaryProperty.maxFamilyMembers) {
            return message.reply(`❌ Your property can only house ${primaryProperty.maxFamilyMembers} family members!`);
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
            totalTrips: 0
        };
        
        profile.familyMembers.push(familyMember);
        
        // Update overall family bond
        const avgBond = profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length;
        profile.familyBond = Math.floor(avgBond);
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('👨‍👩‍👧‍👦 Family Member Added!')
            .setDescription(`**${name}** has joined your family as your ${type}!`)
            .addFields(
                { name: '👤 Age', value: `${age} years old`, inline: true },
                { name: '💼 Profession', value: profession, inline: true },
                { name: '💰 Salary', value: `$${salary}/work`, inline: true },
                { name: '❤️ Bond', value: '50%', inline: true },
                { name: '👥 Total Family', value: `${profile.familyMembers.length}/${primaryProperty.maxFamilyMembers}`, inline: true }
            )
            .setColor('#FF69B4')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};