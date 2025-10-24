const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Heist } = require('../../models/economy/economy');
const { HEIST_TARGETS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'joinheist',
    aliases: ['heist-join'],
    description: 'Join a planned heist with v2 components',
    usage: '!joinheist <heist_id> <role>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤝 Join Heist Crew\n## MISSING REQUIRED INFORMATION\n\n> Please specify the heist ID and your desired role!\n> **Usage:** \`!joinheist <heist_id> <role>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const rolesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                rolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🎭 **AVAILABLE HEIST ROLES**')
                );

                rolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💻 \`hacker\`** - Disable security systems and cameras\n**🚗 \`driver\`** - Handle getaway vehicle and escape routes\n**💪 \`muscle\`** - Provide physical security and intimidation\n**👁️ \`lookout\`** - Monitor for police and security threats\n**🔓 \`safecracker\`** - Break into safes and secure areas`)
                );

                rolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Examples:**\n> \`!joinheist ABC123 hacker\`\n> \`!joinheist DEF456 driver\`\n\n**💡 Tip:** Choose a role that matches your skills and the heist requirements!`)
                );

                components.push(rolesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const heistId = args[0];
            const role = args[1]?.toLowerCase();
            
            if (!role || !['hacker', 'driver', 'muscle', 'lookout', 'safecracker'].includes(role)) {
                const components = [];

                const invalidRoleContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidRoleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Heist Role\n## UNRECOGNIZED SPECIALIZATION\n\n> **\`${role || 'none'}\`** is not a valid heist role!\n> Each crew member must have a specific specialization.`)
                );

                components.push(invalidRoleContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validRolesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                validRolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **VALID HEIST ROLES**\n\n**💻 \`hacker\`** - Technology specialist\n**🚗 \`driver\`** - Escape route expert\n**💪 \`muscle\`** - Physical security\n**👁️ \`lookout\`** - Surveillance specialist\n**🔓 \`safecracker\`** - Lock and safe expert\n\n**💡 Try:** \`!joinheist ${heistId} hacker\``)
                );

                components.push(validRolesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const heist = await Heist.findOne({ heistId, guildId: message.guild.id });
            if (!heist) {
                const components = [];

                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Heist Not Found\n## INVALID HEIST IDENTIFIER\n\n> Heist ID **\`${heistId}\`** doesn't exist or has been completed!\n> Double-check the heist ID and try again.`)
                );

                components.push(notFoundContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔍 **FIND ACTIVE HEISTS**\n\n**Check Available Heists:** Use \`!heist\` to see your active operations\n**Browse All Heists:** Look for heists in recruiting status\n**Plan New Heist:** Use \`!planheist\` to start your own operation\n\n**💡 Tip:** Heist IDs are case-sensitive - copy them exactly!`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (heist.status !== 'recruiting') {
                const components = [];

                const notRecruitingContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                notRecruitingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Heist Not Recruiting\n## CREW ASSEMBLY CLOSED\n\n> The **${heist.targetName}** heist is not currently recruiting new members!\n> **Current Status:** \`${heist.status.toUpperCase()}\``)
                );

                components.push(notRecruitingContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statusContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                let statusMessage = '';
                switch (heist.status) {
                    case 'planning':
                        statusMessage = '**Planning Phase:** The heist is still being organized\n**Wait:** Check back later when recruitment opens';
                        break;
                    case 'ready':
                        statusMessage = '**Ready to Execute:** The crew is complete and preparing\n**Too Late:** No more slots available';
                        break;
                    case 'executing':
                        statusMessage = '**In Progress:** The heist is currently being executed\n**Missed Opportunity:** Wait for the next heist';
                        break;
                    case 'completed':
                        statusMessage = '**Completed:** This heist has been successfully finished\n**New Opportunities:** Look for other active heists';
                        break;
                    case 'failed':
                        statusMessage = '**Failed:** This heist operation has failed\n**Learn:** Study what went wrong for future planning';
                        break;
                    default:
                        statusMessage = '**Unknown Status:** Contact a moderator for assistance';
                }

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **HEIST STATUS DETAILS**\n\n${statusMessage}\n\n**💡 Alternative:** Use \`!planheist\` to organize your own criminal operation!`)
                );

                components.push(statusContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
        
            if (profile.jailTime && profile.jailTime > new Date()) {
                const hoursLeft = Math.ceil((profile.jailTime - new Date()) / (1000 * 60 * 60));
                const components = [];

                const jailContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                jailContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚔 Currently Incarcerated\n## BEHIND BARS\n\n> You're currently in jail and cannot participate in criminal activities!\n> **Time Remaining:** \`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}\``)
                );

                components.push(jailContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const waitContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                waitContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏰ **RELEASE INFORMATION**\n\n**Expected Release:** \`${profile.jailTime.toLocaleString()}\`\n**Current Time:** \`${new Date().toLocaleString()}\`\n\n**💡 While You Wait:**\n> • Plan your next heist strategy\n> • Study successful heist techniques\n> • Network with other criminals\n> • Prepare for your return to the streets`)
                );

                components.push(waitContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
     
            if (heist.members.some(m => m.userId === message.author.id)) {
                const components = [];

                const alreadyMemberContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                const currentRole = heist.members.find(m => m.userId === message.author.id)?.role;

                alreadyMemberContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤝 Already Crew Member\n## DUPLICATE MEMBERSHIP\n\n> You're already part of the **${heist.targetName}** heist crew!\n> **Your Current Role:** \`${currentRole}\``)
                );

                components.push(alreadyMemberContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statusContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **YOUR HEIST STATUS**\n\n**Target:** \`${heist.targetName}\`\n**Role:** \`${currentRole}\`\n**Team Status:** \`${heist.members.length}/${heist.requiredMembers} members\`\n**Expected Share:** \`$${Math.floor(heist.potential_payout / heist.requiredMembers).toLocaleString()}\`\n\n**💡 Next Steps:** Use \`!heist\` to check when the operation is ready to execute!`)
                );

                components.push(statusContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
          
            if (heist.members.some(m => m.role === role)) {
                const components = [];

                const roleTakenContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                const existingMember = heist.members.find(m => m.role === role);
                roleTakenContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎭 Role Already Assigned\n## POSITION OCCUPIED\n\n> The **${role}** role is already taken by another crew member!\n> **Current ${role.charAt(0).toUpperCase() + role.slice(1)}:** \`${existingMember?.username || 'Unknown'}\``)
                );

                components.push(roleTakenContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const availableRolesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const targetData = HEIST_TARGETS[heist.targetType];
                const takenRoles = heist.members.map(m => m.role);
                const availableRoles = targetData.requiredRoles.filter(r => !takenRoles.includes(r));

                if (availableRoles.length > 0) {
                    availableRolesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🎯 **AVAILABLE ROLES**\n\n${availableRoles.map(r => `**${r.charAt(0).toUpperCase() + r.slice(1)}** - \`!joinheist ${heistId} ${r}\``).join('\n')}\n\n**💡 Quick Join:** Choose an available role to secure your spot!`)
                    );
                } else {
                    availableRolesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🚫 **NO ROLES AVAILABLE**\n\nAll required roles for this heist have been filled.\n**Team Status:** \`${heist.members.length}/${heist.requiredMembers} members\`\n\n**💡 Alternative:** Look for other heists that are recruiting or plan your own operation!`)
                    );
                }

                components.push(availableRolesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const targetData = HEIST_TARGETS[heist.targetType];
            
          
            if (!targetData.requiredRoles.includes(role)) {
                const components = [];

                const roleNotRequiredContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                roleNotRequiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Role Not Required\n## SPECIALIZATION NOT NEEDED\n\n> The **${heist.targetName}** heist doesn't require a **${role}**!\n> This target has different security requirements.`)
                );

                components.push(roleNotRequiredContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const requiredRolesContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                const takenRoles = heist.members.map(m => m.role);
                const requiredRolesList = targetData.requiredRoles.map(r => {
                    const status = takenRoles.includes(r) ? '✅ Filled' : '🔓 Available';
                    return `**${r.charAt(0).toUpperCase() + r.slice(1)}:** ${status}`;
                }).join('\n');

                requiredRolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **REQUIRED ROLES FOR ${heist.targetName.toUpperCase()}**\n\n${requiredRolesList}\n\n**💡 Choose Available:** Join with a role this heist actually needs!`)
                );

                components.push(requiredRolesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
         
            if (heist.members.length >= heist.requiredMembers) {
                const components = [];

                const fullTeamContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                fullTeamContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Heist Team Full\n## MAXIMUM CREW SIZE REACHED\n\n> The **${heist.targetName}** heist crew is already at maximum capacity!\n> **Team Status:** \`${heist.members.length}/${heist.requiredMembers} members\``)
                );

                components.push(fullTeamContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const teamRosterContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                const currentCrew = heist.members.map((member, index) => 
                    `**${index + 1}.** ${member.username} (${member.role})`
                ).join('\n');

                teamRosterContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎭 **CURRENT CREW ROSTER**\n\n${currentCrew}\n\n**💡 Alternatives:**\n> • Look for other heists that are recruiting\n> • Use \`!planheist\` to organize your own operation\n> • Wait for new heists to be planned`)
                );

                components.push(teamRosterContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
      
            heist.members.push({
                userId: message.author.id,
                username: message.author.username,
                role,
                confirmed: true,
                equipment: [],
                joinedAt: new Date()
            });
            
        
            const wasReady = heist.status === 'ready';
            if (heist.members.length === heist.requiredMembers) {
                heist.status = 'ready';
            }
            
            await heist.save();
            
       
            profile.activeHeists.push(heistId);
            await profile.save();
            
          
            const components = [];

          
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🤝 Successfully Joined Heist Crew!\n## WELCOME TO THE TEAM\n\n> Congratulations! You've successfully joined the **${heist.targetName}** heist as the **${role}**!\n> Your criminal expertise is now part of this dangerous operation.`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
            const roleContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            roleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🎭 **YOUR ASSIGNMENT**')
            );

            const individualPayout = Math.floor(heist.potential_payout / heist.requiredMembers);
            roleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Target:** \`${heist.targetName}\`\n**🎭 Your Role:** \`${role.charAt(0).toUpperCase() + role.slice(1)}\`\n**👥 Team Status:** \`${heist.members.length}/${heist.requiredMembers} members\`\n**💰 Your Share:** \`$${individualPayout.toLocaleString()}\`\n**🆔 Heist ID:** \`${heistId}\``)
            );

            roleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📅 Joined:** \`${new Date().toLocaleString()}\`\n**📊 Target Difficulty:** \`${targetData.difficulty}/10\`\n**🎯 Success Rate:** \`${targetData.baseSuccessRate}%\` (base)`)
            );

            components.push(roleContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const teamContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👥 **CURRENT CREW ROSTER**')
            );

            const crewList = heist.members.map((member, index) => 
                `**${index + 1}.** ${member.username} (${member.role})`
            ).join('\n');

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(crewList)
            );

            if (heist.members.length < heist.requiredMembers) {
                const stillNeeded = targetData.requiredRoles.filter(r => 
                    !heist.members.some(m => m.role === r)
                );
                teamContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Still Needed:** ${stillNeeded.join(', ')}\n\n> Waiting for more specialists to complete the crew...`)
                );
            }

            components.push(teamContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            if (heist.status === 'ready' && !wasReady) {
                nextStepsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚨 **CREW COMPLETE - READY FOR ACTION!**\n\n**🎯 Mission Status:** READY TO EXECUTE\n**⚡ Next Step:** Use \`!executeheist ${heistId}\` to begin the operation\n**⏰ Timing:** Strike while security is optimal\n**🎲 Success Depends On:** Team coordination and skill\n\n> **ALERT:** Your crew is assembled and ready for the big score!`)
                );
            } else {
                nextStepsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **WHAT HAPPENS NEXT?**\n\n**⏳ Wait for Full Crew:** ${heist.requiredMembers - heist.members.length} more specialist${heist.requiredMembers - heist.members.length !== 1 ? 's' : ''} needed\n**📊 Check Status:** Use \`!heist\` to monitor progress\n**🎯 Prepare:** Review your role responsibilities\n**💬 Coordinate:** Discuss strategy with your crew\n\n> Patience is key - wait for the perfect moment to strike!`)
                );
            }

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        
            if (heist.status === 'ready' && !wasReady) {
                setTimeout(() => {
                    const notificationComponents = [];

                    const readyNotificationContainer = new ContainerBuilder()
                        .setAccentColor(0xFF5722);

                    readyNotificationContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🎯 HEIST TEAM READY!\n## ${heist.targetName.toUpperCase()} CREW ASSEMBLED\n\n> The heist crew is now complete and ready for action!\n> **Execute Command:** \`!executeheist ${heistId}\`\n\n**⚠️ ATTENTION ALL CREW MEMBERS:** The operation can now begin!`)
                    );

                    notificationComponents.push(readyNotificationContainer);

                    message.channel.send({
                        components: notificationComponents,
                        flags: MessageFlags.IsComponentsV2
                    });
                }, 1000);
            }

        } catch (error) {
            console.error('Error in joinheist command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **HEIST JOINING ERROR**\n\nSomething went wrong while joining the heist crew. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
