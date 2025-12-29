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
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    PermissionFlagsBits,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');
const { 
    createOrUpdateCommand, 
    deleteCommand, 
    getUserCommands
} = require('../../models/customCommands/controller');
const cmdIcons = require('../../UI/icons/commandicons');
const CustomCommand = require('../../models/customCommands/schema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('customcommands')
        .setDescription('📜 Manage custom commands.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new custom command.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The command name (no spaces, max 20 chars).')
                        .setRequired(true)
                        .setMaxLength(20))
                .addStringOption(option =>
                    option.setName('response')
                        .setDescription('The response text (max 200 chars).')
                        .setRequired(true)
                        .setMaxLength(200)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a custom command.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The command name.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show all custom commands you created.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('audit')
                .setDescription('List all custom commands (Admin only).')),

    async execute(interaction) {
        
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
            await interaction.deferReply();
            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            if (subcommand === 'set') {
                const name = interaction.options.getString('name').toLowerCase();
                const response = interaction.options.getString('response');

                // **Restricted words**
                const restrictedNames = ['nuke', 'raid', 'hack', 'shutdown', 'ban', 'delete', 'hentai', 'love'];
                if (restrictedNames.includes(name)) {
                    const restrictedContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Restricted Command Name\nThis command name is not allowed for security reasons.')
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
                                            `**🚫 Restricted Name:** \`${name}\``,
                                            `**📋 Reason:** Security and safety restrictions`,
                                            `**💡 Suggestion:** Try a different command name`,
                                            `**⚡ Status:** Command creation blocked`
                                        ].join('\n'))
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder()
                                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                        .setDescription(`${interaction.user.username}'s attempt`)
                                )
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Security check failed • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [restrictedContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                // **Forbid code injections or malicious content**
                const forbiddenPatterns = [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /drop\s+table\s+/gi,
                    /select\s+\*\s+from\s+/gi,
                    /[`$|{}<>;]/g
                ];
                if (forbiddenPatterns.some(pattern => pattern.test(response))) {
                    const maliciousContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Forbidden Content Detected\nYour response contains potentially malicious content.')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent([
                                    '**🛡️ Security Measures**',
                                    '• Scripts and code injection attempts are blocked',
                                    '• SQL injection patterns are not allowed',
                                    '• Special characters like backticks, pipes, and brackets are restricted',
                                    '',
                                    '**✅ Allowed Content:**',
                                    '• Plain text responses',
                                    '• Valid URLs (https://...)',
                                    '• Basic punctuation and emojis'
                                ].join('\n'))
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Content filtered for security • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [maliciousContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                // **Allow only plain text or URLs**
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const isUrl = urlRegex.test(response);
                const isText = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(response);
                if (!isUrl && !isText) {
                    const invalidContentContainer = new ContainerBuilder()
                        .setAccentColor(0xFFAA00)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ⚠️ Invalid Content Format\nOnly plain text and URLs are allowed in responses.')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent([
                                    '**✅ Valid Formats:**',
                                    '• Plain text: "Hello, welcome to our server!"',
                                    '• URLs: "https://discord.gg/example"',
                                    '• Combined: "Check our website: https://example.com"',
                                    '',
                                    '**❌ Not Allowed:**',
                                    '• Code snippets or scripts',
                                    '• Special formatting characters',
                                    '• Complex markup or commands'
                                ].join('\n'))
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Format validation failed • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [invalidContentContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                await createOrUpdateCommand(userId, name, response);
                
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x00FF00)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# ✅ Custom Command Created\nYour custom command has been successfully configured.')
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
                                        `**📜 Command:** \`/${name}\``,
                                        `**💬 Response:** "${response}"`,
                                        `**👤 Created by:** ${interaction.user.username}`,
                                        `**🏢 Server:** ${interaction.guild.name}`,
                                        `**⚡ Status:** Active and ready to use`
                                    ].join('\n'))
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                    .setDescription(`Created by ${interaction.user.username}`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Custom command configured • ${new Date().toLocaleString()}*`)
                    );

                return interaction.editReply({
                    components: [successContainer],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (subcommand === 'delete') {
                const name = interaction.options.getString('name').toLowerCase();
                const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
                const wasDeleted = await deleteCommand(userId, name, isAdmin);

                if (!wasDeleted) {
                    const deleteFailContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Deletion Failed\nUnable to delete the specified custom command.')
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
                                            `**📜 Command:** \`${name}\``,
                                            `**❌ Issue:** Permission denied or command doesn't exist`,
                                            `**💡 Reasons:**`,
                                            '• Command wasn\'t created by you',
                                            '• Command name doesn\'t exist',
                                            '• You lack administrator permissions for others\' commands'
                                        ].join('\n'))
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder()
                                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                        .setDescription(`${interaction.user.username}'s attempt`)
                                )
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('**💡 Tip:** Use `/customcommands show` to see your commands')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Deletion failed • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [deleteFailContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const deleteSuccessContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🗑️ Custom Command Deleted\nThe custom command has been successfully removed.')
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
                                        `**📜 Deleted Command:** \`/${name}\``,
                                        `**👤 Deleted by:** ${interaction.user.username}`,
                                        `**🏢 Server:** ${interaction.guild.name}`,
                                        `**⚡ Status:** Permanently removed`,
                                        `**🔄 Action:** Command is no longer accessible`
                                    ].join('\n'))
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                    .setDescription(`Deleted by ${interaction.user.username}`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Custom command deleted • ${new Date().toLocaleString()}*`)
                    );

                return interaction.editReply({
                    components: [deleteSuccessContainer],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (subcommand === 'show') {
                const commands = await getUserCommands(userId);

                if (commands.length === 0) {
                    const noCommandsContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# 📜 No Custom Commands\nYou haven\'t created any custom commands yet.')
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
                                            '**🚀 Getting Started**',
                                            'Use `/customcommands set` to create your first command',
                                            '',
                                            '**📝 Features:**',
                                            '• Simple text responses',
                                            '• URL sharing capabilities',
                                            '• Easy management tools',
                                            '• Security-filtered content'
                                        ].join('\n'))
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder()
                                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                        .setDescription(`${interaction.user.username}'s commands`)
                                )
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*No commands created • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [noCommandsContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const commandList = commands.map(cmd => `\`/${cmd.commandName}\` → ${cmd.response}`).join('\n');
                
                const showCommandsContainer = new ContainerBuilder()
                    .setAccentColor(0x00FF00)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 📜 Your Custom Commands\nComplete list of your created custom commands')
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
                                        `**📊 Total Commands:** ${commands.length}`,
                                        `**👤 Owner:** ${interaction.user.username}`,
                                        `**🏢 Server:** ${interaction.guild.name}`,
                                        `**⚡ Status:** All active and functional`
                                    ].join('\n'))
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                    .setDescription(`${interaction.user.username}'s commands`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**📋 Command List**\n${commandList}`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('**💡 Management**\n• Use `/customcommands delete <name>` to remove\n• Use `/customcommands set` to create new ones')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Commands loaded • ${new Date().toLocaleString()}*`)
                    );

                return interaction.editReply({
                    components: [showCommandsContainer],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (subcommand === 'audit') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    const noPermContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Permission Denied\nYou need Administrator permissions to audit commands.')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('**🔒 Required Permission:** Administrator\n**⚡ Your Permissions:** Insufficient access')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Access denied • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [noPermContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const allCommands = await CustomCommand.find({}).lean();

                if (allCommands.length === 0) {
                    const noAuditCommandsContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# 📋 No Commands to Audit\nNo custom commands have been created on this server.')
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
                                            '**📊 Audit Results:**',
                                            '• Total custom commands: 0',
                                            '• Active users: 0',
                                            '• Server activity: None',
                                            '',
                                            '**💡 Admin Note:**',
                                            'Encourage users to create custom commands with `/customcommands set`'
                                        ].join('\n'))
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder()
                                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                        .setDescription('Admin audit')
                                )
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Audit completed • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [noAuditCommandsContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const commandChunks = [];
                let currentChunk = '';

                for (const cmd of allCommands) {
                    const entry = `👤 <@${cmd.userId}> | \`/${cmd.commandName}\` → ${cmd.response}\n`;
                    if ((currentChunk + entry).length > 1024) {
                        commandChunks.push(currentChunk);
                        currentChunk = entry;
                    } else {
                        currentChunk += entry;
                    }
                }
                if (currentChunk) commandChunks.push(currentChunk);

                let page = 0;
                
                // Create v2 container for audit
                const createAuditContainer = (pageIndex) => {
                    return new ContainerBuilder()
                        .setAccentColor(0x0099FF)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# 📋 Custom Commands Audit\nComplete administrative overview of all custom commands')
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
                                            `**📊 Audit Statistics:**`,
                                            `• Total Commands: ${allCommands.length}`,
                                            `• Unique Users: ${new Set(allCommands.map(c => c.userId)).size}`,
                                            `• Current Page: ${pageIndex + 1} of ${commandChunks.length}`,
                                            `• Admin: ${interaction.user.username}`
                                        ].join('\n'))
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder()
                                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                        .setDescription('Administrator audit')
                                )
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**📋 Commands List (Page ${pageIndex + 1})**\n${commandChunks[pageIndex]}`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Administrative audit • Page ${pageIndex + 1} of ${commandChunks.length} • ${new Date().toLocaleString()}*`)
                        );
                };

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(commandChunks.length === 1)
                );

                const reply = await interaction.editReply({ 
                    components: [createAuditContainer(page)],
                    flags: MessageFlags.IsComponentsV2
                });

                // Add traditional buttons for pagination
                if (commandChunks.length > 1) {
                    await interaction.followUp({ 
                        components: [row],
                        ephemeral: true
                    }).then(buttonReply => {
                        const filter = i => (i.customId === 'previous' || i.customId === 'next') && i.user.id === interaction.user.id;
                        const collector = buttonReply.createMessageComponentCollector({ filter, time: 60000 });

                        collector.on('collect', async i => {
                            if (i.customId === 'previous') page--;
                            if (i.customId === 'next') page++;

                            row.components[0].setDisabled(page === 0);
                            row.components[1].setDisabled(page === commandChunks.length - 1);

                            await i.update({ components: [row] });
                            
                            // Update the main message with new page content
                            await interaction.editReply({
                                components: [createAuditContainer(page)],
                                flags: MessageFlags.IsComponentsV2
                            });
                        });

                        collector.on('end', () => {
                            buttonReply.edit({ components: [] }).catch(() => {});
                        });
                    });
                }
            }
        } else {
            const slashOnlyContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🔔 Slash Command Only\nThis command can only be used through slash commands.')
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
                                    '**⚡ How to Use:**',
                                    'Please use `/customcommands` instead',
                                    '',
                                    '**📋 Available Subcommands:**',
                                    '• `/customcommands set` - Create new custom command',
                                    '• `/customcommands show` - View your commands',
                                    '• `/customcommands delete` - Remove a command',
                                    '• `/customcommands audit` - Admin command overview'
                                ].join('\n'))
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(cmdIcons.dotIcon || interaction.client.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription('Command information')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Use slash commands for full functionality • ${new Date().toLocaleString()}*`)
                );

            await interaction.reply({
                components: [slashOnlyContainer],
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