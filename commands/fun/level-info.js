/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/
const { 
    SlashCommandBuilder, 
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const levelingController = require('../../models/leveling/levelingController');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-info')
        .setDescription('Get information about leveling system and requirements')
        .addSubcommand(subcommand =>
            subcommand.setName('xp-needed')
                .setDescription('Check XP needed for next level or specific level')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check (defaults to you)')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('target-level')
                        .setDescription('Specific level to check XP requirement for')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('level-rewards')
                .setDescription('Check what rewards are available at different levels')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Specific level to check rewards for')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('calculator')
                .setDescription('Calculate XP and level relationships')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Level to calculate total XP for')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('xp')
                        .setDescription('XP amount to calculate level for')
                        .setMinValue(0)
                        .setMaxValue(10000000)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('system')
                .setDescription('View leveling system information and statistics')),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'xp-needed':
                    await handleXpNeeded(interaction);
                    break;
                case 'level-rewards':
                    await handleLevelRewards(interaction);
                    break;
                case 'calculator':
                    await handleCalculator(interaction);
                    break;
                case 'system':
                    await handleSystemInfo(interaction);
                    break;
            }

        } catch (error) {
            console.error('Level info command error:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**⚠️ LEVEL INFO ERROR**')
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('Failed to retrieve leveling information. Please try again.')
                );

            await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


async function handleXpNeeded(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const targetLevel = interaction.options.getInteger('target-level');

    const userData = await levelingController.getUserRank(targetUser.id, interaction.guild.id);
    
    if (!userData) {
        const noDataContainer = new ContainerBuilder()
            .setAccentColor(0xFF4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**❌ NO USER DATA FOUND**')
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('User needs to be active in the server to have leveling data.')
            );

        return await interaction.editReply({
            components: [noDataContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    let infoText;
    if (targetLevel) {
        const requiredXP = levelingController.calculateXPForLevel(targetLevel);
        const currentXP = userData.totalXp;
        const neededXP = Math.max(0, requiredXP - currentXP);
        
        infoText = [
            `**🎯 Target Level:** ${targetLevel}`,
            `**💫 Required Total XP:** ${requiredXP.toLocaleString()}`,
            `**📊 Current XP:** ${currentXP.toLocaleString()}`,
            `**⬆️ XP Needed:** ${neededXP.toLocaleString()}`,
            `**📈 Progress:** ${neededXP === 0 ? '✅ Already achieved!' : `${Math.round((currentXP / requiredXP) * 100)}% complete`}`
        ];
    } else {
        const currentLevelXP = levelingController.calculateXPForLevel(userData.level);
        const nextLevelXP = levelingController.calculateXPForLevel(userData.level + 1);
        const currentXP = userData.totalXp - currentLevelXP;
        const requiredXP = nextLevelXP - currentLevelXP;
        const neededXP = requiredXP - currentXP;

        infoText = [
            `**🏆 Current Level:** ${userData.level}`,
            `**📈 Next Level:** ${userData.level + 1}`,
            `**📊 Current Progress:** ${Math.max(0, currentXP).toLocaleString()} / ${requiredXP.toLocaleString()}`,
            `**⬆️ XP to Next Level:** ${Math.max(0, neededXP).toLocaleString()}`,
            `**📉 Progress Percentage:** ${Math.round((Math.max(0, currentXP) / requiredXP) * 100)}%`
        ];
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x3B82F6)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**📊 XP REQUIREMENT CALCULATOR**')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(infoText.join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${targetUser.username}'s XP info`)
                )
        );

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

async function handleLevelRewards(interaction) {
    const specificLevel = interaction.options.getInteger('level');


    const levelRewards = [
        { level: 5, reward: '🏷️ **Newcomer** role', description: 'Welcome to the community!' },
        { level: 10, reward: '💬 **Active Member** role', description: 'Access to exclusive channels' },
        { level: 15, reward: '🎨 **Custom Role Color**', description: 'Choose your own role color' },
        { level: 20, reward: '🏆 **Veteran** role', description: 'Respected community member' },
        { level: 25, reward: '🔧 **Moderator Applications**', description: 'Apply to become a moderator' },
        { level: 30, reward: '👑 **VIP** role', description: 'VIP perks and benefits' },
        { level: 40, reward: '⭐ **Server Booster Perks**', description: 'Extra privileges' },
        { level: 50, reward: '🎖️ **Legend** role', description: 'Ultimate achievement!' }
    ];

    let rewardsText;
    
    if (specificLevel) {
        const reward = levelRewards.find(r => r.level === specificLevel);
        if (reward) {
            rewardsText = [
                `**🎯 Level ${specificLevel} Rewards:**`,
                '',
                `**🎁 Reward:** ${reward.reward}`,
                `**📝 Description:** ${reward.description}`,
                '',
                '**💡 How to Earn:**',
                `• Reach level ${specificLevel} by being active`,
                '• Send messages and participate in voice chats',
                '• Maintain daily activity streaks for bonus XP'
            ];
        } else {
            rewardsText = [
                `**🎯 Level ${specificLevel}**`,
                '',
                '**🎁 No specific rewards at this level**',
                '',
                '**🏆 Nearby Reward Levels:**'
            ];
            
       
            const nearbyRewards = levelRewards.filter(r => 
                Math.abs(r.level - specificLevel) <= 5
            ).slice(0, 3);
            
            nearbyRewards.forEach(reward => {
                rewardsText.push(`• **Level ${reward.level}:** ${reward.reward}`);
            });
        }
    } else {
        rewardsText = [
            '**🏆 LEVEL REWARD SYSTEM**',
            '',
            '**🎁 Available Rewards:**'
        ];
        
        levelRewards.forEach(reward => {
            rewardsText.push(`**Level ${reward.level}:** ${reward.reward}`);
        });
        
        rewardsText.push('');
        rewardsText.push('**💡 Pro Tips:**');
        rewardsText.push('• Daily activity gives streak bonuses');
        rewardsText.push('• Voice chat participation earns extra XP');
        rewardsText.push('• Weekend activities have multipliers');
        rewardsText.push('• Server boosters get XP bonuses');
    }

    const container = new ContainerBuilder()
        .setAccentColor(0xF59E0B)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**🎁 LEVEL REWARDS**')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(rewardsText.join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.guild.iconURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.guild.name} rewards`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Rewards info for ${interaction.guild.name} • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

async function handleCalculator(interaction) {
    const inputLevel = interaction.options.getInteger('level');
    const inputXP = interaction.options.getInteger('xp');

    let calculationText;

    if (inputLevel) {
        const totalXP = levelingController.calculateXPForLevel(inputLevel);
        const previousLevelXP = levelingController.calculateXPForLevel(inputLevel - 1);
        const levelXP = totalXP - previousLevelXP;
        
        calculationText = [
            `**📊 LEVEL ${inputLevel} CALCULATIONS**`,
            '',
            `**💫 Total XP Required:** ${totalXP.toLocaleString()}`,
            `**📈 XP for This Level:** ${levelXP.toLocaleString()}`,
            `**📉 Previous Level XP:** ${previousLevelXP.toLocaleString()}`,
            '',
            '**🎯 Level Milestones:**'
        ];

        
        for (let i = Math.max(1, inputLevel - 2); i <= inputLevel + 2; i++) {
            const xp = levelingController.calculateXPForLevel(i);
            const indicator = i === inputLevel ? '👉' : '   ';
            calculationText.push(`${indicator} Level ${i}: ${xp.toLocaleString()} XP`);
        }

    } else if (inputXP) {
        const level = levelingController.calculateLevel(inputXP);
        const currentLevelXP = levelingController.calculateXPForLevel(level);
        const nextLevelXP = levelingController.calculateXPForLevel(level + 1);
        const progressXP = inputXP - currentLevelXP;
        const neededXP = nextLevelXP - inputXP;
        
        calculationText = [
            `**📊 ${inputXP.toLocaleString()} XP CALCULATIONS**`,
            '',
            `**🏆 Current Level:** ${level}`,
            `**📈 Progress in Level:** ${progressXP.toLocaleString()} / ${nextLevelXP - currentLevelXP}`,
            `**⬆️ XP to Next Level:** ${neededXP.toLocaleString()}`,
            `**📉 Progress Percentage:** ${Math.round((progressXP / (nextLevelXP - currentLevelXP)) * 100)}%`
        ];

    } else {
        calculationText = [
            '**🧮 LEVELING SYSTEM CALCULATOR**',
            '',
            '**📊 How it works:**',
            '• Level = √(Total XP ÷ 100) + 1',
            '• Total XP = (Level - 1)² × 100',
            '',
            '**🎯 Example Calculations:**',
            '• Level 1: 0 XP',
            '• Level 5: 1,600 XP',
            '• Level 10: 8,100 XP',
            '• Level 25: 57,600 XP',
            '• Level 50: 240,100 XP',
            '• Level 100: 980,100 XP',
            '',
            '**💡 Use the options to calculate specific values!**'
        ];
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x8B5CF6)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**🧮 LEVEL CALCULATOR**')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(calculationText.join('\n'))
        );

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

async function handleSystemInfo(interaction) {
    const systemInfoText = [
        '**⚙️ LEVELING SYSTEM OVERVIEW**',
        '',
        '**💬 Text XP:**',
        '• Random XP per message (configurable range)',
        '• Cooldown between XP gains',
        '• Length and attachment bonuses',
        '• Weekend and boost multipliers',
        '',
        '**🎤 Voice XP:**',
        '• XP per minute in voice channels',
        '• Activity bonuses (streaming, camera)',
        '• Multiple users bonus',
        '• Channel-specific multipliers',
        '',
        '**🏆 Features:**',
        '• Progressive level formula',
        '• Role rewards at level milestones',
        '• Achievement system',
        '• Daily streak bonuses',
        '• Weekly statistics tracking',
        '',
        '**📊 Available Commands:**',
        '• `/rank` - View your rank card',
        '• `/leaderboard` - Server rankings',
        '• `/level-info` - System information',
        '• `/level-admin` - Admin management (Admin only)'
    ];

    const container = new ContainerBuilder()
        .setAccentColor(0x10B981)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**ℹ️ SYSTEM INFORMATION**')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(systemInfoText.join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.guild.iconURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.guild.name} leveling system`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*System info requested by ${interaction.user.username} • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });
}

/*
 ██████╗ ██╗      █████╗  ██████╗███████╗██╗   ██╗████████╗
██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝╚██╗ ██╔╝╚══██╔══╝
██║  ███╗██║     ███████║██║     █████╗   ╚████╔╝    ██║   
██║   ██║██║     ██╔══██║██║     ██╔══╝    ╚██╔╝     ██║   
╚██████╔╝███████╗██║  ██║╚██████╗███████╗   ██║      ██║   
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝      ╚═╝   

-------------------------------------
📡 Discord : https://discord.gg/xQF9f9yUEM
🌐 Website : https://glaceyt.com
🎥 YouTube : https://youtube.com/@GlaceYT
✅ Verified | 🧩 Tested | ⚙️ Stable
-------------------------------------
> © 2025 GlaceYT.com | All rights reserved.
*/