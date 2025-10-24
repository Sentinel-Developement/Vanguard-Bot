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
    AttachmentBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MessageFlags
} = require('discord.js');
const levelingController = require('../../models/leveling/levelingController');
const { RankCardGenerator } = require('../../UI/rankCardGenerator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-rank')
        .setDescription('View your or someone else\'s professional rank card')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to view rank for')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('theme')
                .setDescription('Professional rank card theme')
                .addChoices(
                    { name: '🔵 Default - Professional Blue', value: 'default' },
                    { name: '⚫ Dark - Sleek Black', value: 'dark' },
                    { name: '💜 Neon - Cyberpunk Style', value: 'neon' },
                    { name: '⚪ Minimal - Clean White', value: 'minimal' },
                    { name: '🎮 Gaming - Elite Red', value: 'gaming' }
                )
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('detailed')
                .setDescription('Show detailed statistics in embed')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const theme = interaction.options.getString('theme') || 'default';
            const showDetailed = interaction.options.getBoolean('detailed') || false;

            const validThemes = ['default', 'dark', 'neon', 'minimal', 'gaming'];
            const selectedTheme = validThemes.includes(theme) ? theme : 'default';

            const userData = await levelingController.getUserRank(targetUser.id, interaction.guild.id);

            if (!userData) {
                const noDataContainer = new ContainerBuilder()
                    .setAccentColor(0xFF4757)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('**❌ NO DATA FOUND**')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`**👤 User:** ${targetUser.username}\n**📊 Status:** No leveling data found\n**💡 Get Started:** Start chatting to earn XP!`)
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                                    .setDescription(`${targetUser.username}'s profile`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Requested by ${interaction.user.username} • ${new Date().toLocaleString()}*`)
                    );

                return await interaction.editReply({ 
                    components: [noDataContainer],
                    flags: MessageFlags.IsComponentsV2 
                });
            }

         
            const currentLevelXP = levelingController.calculateXPForLevel(userData.level);
            const nextLevelXP = levelingController.calculateXPForLevel(userData.level + 1);
            const currentXP = userData.totalXp - currentLevelXP;
            const requiredXP = nextLevelXP - currentLevelXP;
            const progressPercent = Math.round((Math.max(0, currentXP) / Math.max(1, requiredXP)) * 100);
            const xpToNext = Math.max(0, requiredXP - currentXP);

         
            const cardGenerator = new RankCardGenerator();
            const cardBuffer = await cardGenerator.generateRankCard({
                username: targetUser.username,
                discriminator: targetUser.discriminator || '0000',
                avatarURL: targetUser.displayAvatarURL({ 
                    extension: 'png', 
                    size: 512,
                    forceStatic: false
                }),
                level: userData.level,
                currentXP: Math.max(0, currentXP),
                requiredXP: Math.max(1, requiredXP),
                totalXP: userData.totalXp,
                rank: userData.rank,
                theme: selectedTheme,
                customBackground: userData.rankCard?.background || null,
                badge: userData.rankCard?.badge || null,
                width: 1200,
                height: 400
            });

            const attachment = new AttachmentBuilder(cardBuffer, { 
                name: `${targetUser.username}-rank-${selectedTheme}.png`,
                description: `Professional rank card for ${targetUser.username}`
            });

           
            const themeColors = {
                'default': 0x3B82F6,
                'dark': 0xFF6B35,
                'neon': 0x00FFFF,
                'minimal': 0x64748B,
                'gaming': 0xE94560
            };

            let containerBuilder = new ContainerBuilder()
                .setAccentColor(themeColors[selectedTheme] || 0x3B82F6)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 ${targetUser.username.toUpperCase()}'S RANK CARD**`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent([
                                    `**📈 Level:** ${userData.level}`,
                                    `**🏆 Global Rank:** #${userData.rank}`,
                                    `**💫 Total XP:** ${userData.totalXp.toLocaleString()}`,
                                    `**📊 Progress:** ${progressPercent}% to next level`,
                                    `**🎨 Theme:** ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Style`
                                ].join('\n'))
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription(`${targetUser.username}'s avatar`)
                        )
                );

        
            if (showDetailed) {
                containerBuilder
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**👤 Requested by:** ${interaction.user.username}`,
                                `**📅 Weekly XP:** ${(userData.weeklyXp || 0).toLocaleString()}`,
                                `**💬 Messages Sent:** ${(userData.messageCount || 0).toLocaleString()}`,
                                `**🔥 Daily Streak:** ${userData.streaks?.daily || 0} days`,
                                `**⏱️ Last Active:** ${userData.lastMessageAt ? new Date(userData.lastMessageAt).toLocaleDateString() : 'Unknown'}`
                            ].join('\n'))
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                '**📈 DETAILED STATISTICS**',
                                `**🎯 Current Level XP:** ${Math.max(0, currentXP).toLocaleString()} / ${requiredXP.toLocaleString()}`,
                                `**⬆️ XP to Next Level:** ${xpToNext.toLocaleString()}`,
                                `**📊 Progress Percentage:** ${progressPercent}%`,
                                `**🏅 Card Version:** Professional v2.0`,
                                `**🎨 Selected Theme:** ${selectedTheme.toUpperCase()}`
                            ].join('\n'))
                    );
            } else {
                containerBuilder
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**👤 Requested by:** ${interaction.user.username}`,
                                `**📅 Weekly XP:** ${(userData.weeklyXp || 0).toLocaleString()}`,
                                `**💬 Messages:** ${(userData.messageCount || 0).toLocaleString()}`,
                                `**🔥 Daily Streak:** ${userData.streaks?.daily || 0} days`,
                                `**🎯 XP to Next:** ${xpToNext.toLocaleString()}`
                            ].join('\n'))
                    );
            }

   
            if (!interaction.options.getString('theme')) {
                containerBuilder
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                '**💡 PRO TIP**',
                                '**🎨 Themes Available:** Default, Dark, Neon, Minimal, Gaming',
                                '**🔧 Usage:** Use `/rank theme:<theme>` to try different styles',
                                '**⚡ Features:** Professional design with statistics tracking'
                            ].join('\n'))
                    );
            }

        
            if (cardBuffer) {
                containerBuilder
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder()
                            .addItems(
                                mediaItem => mediaItem
                                    .setURL(`attachment://${targetUser.username}-rank-${selectedTheme}.png`)
                                    .setDescription(`${targetUser.username}'s Professional Rank Card - ${selectedTheme.toUpperCase()} Theme`)
                            )
                    );
            }

        
            containerBuilder
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Professional rank card generated • Theme: ${selectedTheme} • ${new Date().toLocaleString()}*`)
                );

            await interaction.editReply({ 
                components: [containerBuilder],
                files: [attachment],
                flags: MessageFlags.IsComponentsV2 
            });

        } catch (error) {
            console.error('Enhanced rank command error:', error);
            
         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**⚠️ RANK CARD GENERATION FAILED**')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent([
                                    '**🔧 What happened?**',
                                    'Technical issue with rank card generator',
                                    '',
                                    '**🛠️ Solutions:**',
                                    '• Try again in a few moments',
                                    '• Try a different theme',
                                    '• Contact support if issue persists'
                                ].join('\n'))
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(interaction.client.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription('System error notification')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '**📊 ERROR DETAILS**',
                            `**Error Type:** ${error.name || 'Unknown Error'}`,
                            `**User:** ${interaction.user.username}`,
                            `**Guild:** ${interaction.guild.name}`,
                            `**Timestamp:** ${new Date().toLocaleString()}`
                        ].join('\n'))
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('*Error logged for developer review • Please try again later*')
                );

            await interaction.editReply({ 
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }
    }
};
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