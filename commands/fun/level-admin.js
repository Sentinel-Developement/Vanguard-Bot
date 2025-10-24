const { 
    SlashCommandBuilder, 
    PermissionFlagsBits,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const levelingController = require('../../models/leveling/levelingController');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-admin')
        .setDescription('Admin commands for managing user levels and XP')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('add-xp')
                .setDescription('Add XP to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to add XP to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to add')
                        .setMinValue(1)
                        .setMaxValue(100000)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for adding XP')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove-xp')
                .setDescription('Remove XP from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove XP from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to remove')
                        .setMinValue(1)
                        .setMaxValue(100000)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing XP')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('set-level')
                .setDescription('Set user to specific level')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to set level for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Level to set user to')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for setting level')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('reset-user')
                .setDescription('Reset user leveling data')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to reset')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('What to reset')
                        .addChoices(
                            { name: 'Everything - Complete Reset', value: 'all' },
                            { name: 'XP & Levels Only', value: 'xp' },
                            { name: 'Voice Stats Only', value: 'voice' },
                            { name: 'Weekly Stats Only', value: 'weekly' }
                        )
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for reset')
                        .setRequired(false))),

    async execute(interaction) {
        await interaction.deferReply();
        if (!await checkPermissions(interaction)) return;
        try {
            const subcommand = interaction.options.getSubcommand();
            const targetUser = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
         
            let result;
            let successMessage = '';

            switch (subcommand) {
                case 'add-xp':
                    const addAmount = interaction.options.getInteger('amount');
                    result = await levelingController.addUserXP(targetUser.id, interaction.guild.id, addAmount);
                    successMessage = `Added ${addAmount.toLocaleString()} XP to ${targetUser.username}`;
                    break;

                case 'remove-xp':
                    const removeAmount = interaction.options.getInteger('amount');
                    result = await levelingController.removeUserXP(targetUser.id, interaction.guild.id, removeAmount);
                    successMessage = `Removed ${removeAmount.toLocaleString()} XP from ${targetUser.username}`;
                    break;

                case 'set-level':
                    const level = interaction.options.getInteger('level');
                    result = await levelingController.setUserLevel(targetUser.id, interaction.guild.id, level);
                    successMessage = `Set ${targetUser.username} to level ${level}`;
                    break;

                case 'reset-user':
                    const resetType = interaction.options.getString('type') || 'all';
                    result = await levelingController.resetUserData(targetUser.id, interaction.guild.id, resetType);
                    successMessage = `Reset ${resetType === 'all' ? 'all data' : resetType} for ${targetUser.username}`;
                    break;
            }

            if (!result) {
                throw new Error('Operation failed - user data not found or invalid operation');
            }

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x00FF88)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**✅ ADMIN ACTION SUCCESSFUL**')
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
                                    `**🎯 Action:** ${successMessage}`,
                                    `**👤 Target:** ${targetUser.username}`,
                                    `**👨‍💼 Admin:** ${interaction.user.username}`,
                                    `**📝 Reason:** ${reason}`
                                ].join('\n'))
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription(`${targetUser.username}'s updated profile`)
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '**📊 Updated Stats:**',
                            `**🏆 Current Level:** ${result.level}`,
                            `**💫 Total XP:** ${result.totalXp.toLocaleString()}`,
                            `**💬 Messages:** ${result.messageCount.toLocaleString()}`,
                            `**🎤 Voice Minutes:** ${result.voiceStats.totalMinutes.toLocaleString()}`
                        ].join('\n'))
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Admin action completed • ${new Date().toLocaleString()}*`)
                );

            await interaction.editReply({
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Level admin command error:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xFF4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**⚠️ ADMIN ACTION FAILED**')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '**🔧 Error Details:**',
                            error.message || 'Unknown error occurred',
                            '',
                            '**💡 Possible Solutions:**',
                            '• Check if the user exists in the server',
                            '• Verify the user has leveling data',
                            '• Check your permission levels',
                            '• Try again with different parameters'
                        ].join('\n'))
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Error logged • Admin: ${interaction.user.username} • ${new Date().toLocaleString()}*`)
                );

            await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
