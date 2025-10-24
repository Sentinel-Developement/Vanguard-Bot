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
    createOrUpdateAutoResponder,
    deleteAutoResponder,
    getUserAutoResponders
} = require('../../models/autoresponses/controller');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoresponder')
        .setDescription('🤖 Manage AutoResponders.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new AutoResponder.')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('The trigger word or phrase.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('channels')
                        .setDescription('Channel(s) (comma-separated IDs or "all").')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('match')
                        .setDescription('Match type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Exact Match', value: 'exact' },
                            { name: 'Partial Match', value: 'partial' },
                            { name: 'Whole Line Match', value: 'whole' }
                        ))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable the AutoResponder.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('text_response')
                        .setDescription('Non-embed response (optional).')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('use_embed')
                        .setDescription('Use embed response? (true = embed, false = text)'))
                .addStringOption(option =>
                    option.setName('embed_title')
                        .setDescription('Embed title (required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_color')
                        .setDescription('Embed color (Hex code, required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_description')
                        .setDescription('Embed description (required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_footer')
                        .setDescription('Embed footer text (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_footer_icon')
                        .setDescription('Footer icon URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_author')
                        .setDescription('Embed author name (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_author_url')
                        .setDescription('Author link URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_image')
                        .setDescription('Embed image URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_thumbnail')
                        .setDescription('Embed thumbnail URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('fields_json')
                        .setDescription('Fields JSON: [{ name, value, inline? }], inline defaults to false.')
                        .setRequired(false))
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an AutoResponder by index.')
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The index number of the AutoResponder.')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View all AutoResponders you created.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            if (!await checkPermissions(interaction)) return;
            await interaction.deferReply();

            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            if (subcommand === 'set') {
                const trigger = interaction.options.getString('trigger').toLowerCase();
                const textResponse = interaction.options.getString('text_response') || null;
                const useEmbed = interaction.options.getBoolean('use_embed') || false;
                const matchType = interaction.options.getString('match');
                const channelInput = interaction.options.getString('channels');
                const status = interaction.options.getBoolean('status');

                const channels = (channelInput === 'all')
                    ? ['all']
                    : channelInput.split(',').map(id => id.trim()).filter(Boolean);

                let embedData = null;
                if (useEmbed) {
                    const embedTitle = interaction.options.getString('embed_title');
                    const embedColor = interaction.options.getString('embed_color');
                    const embedDescription = interaction.options.getString('embed_description');
                    const embedFooter = interaction.options.getString('embed_footer');
                    const embedFooterIcon = interaction.options.getString('embed_footer_icon');
                    const embedImage = interaction.options.getString('embed_image');
                    const embedThumbnail = interaction.options.getString('embed_thumbnail');
                    const embedAuthor = interaction.options.getString('embed_author');
                    const embedAuthorUrl = interaction.options.getString('embed_author_url');

                    if (!embedTitle || !embedColor || !embedDescription) {
                        const missingFieldsContainer = new ContainerBuilder()
                            .setAccentColor(0xFFAA00)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent('# ⚠️ Missing Required Fields\nEmbeds must have `title`, `color`, and `description`.')
                            );

                        return interaction.editReply({
                            components: [missingFieldsContainer],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }

                    const fieldsJson = interaction.options.getString('fields_json');
                    let fields = [];
                    
                    if (!fieldsJson) {
                        const noFieldsContainer = new ContainerBuilder()
                            .setAccentColor(0xFFAA00)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent('# ⚠️ Fields Required\nEmbed fields JSON is required. Provide at least two fields.')
                            );

                        return interaction.editReply({
                            components: [noFieldsContainer],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                    
                    try {
                        const parsedFields = JSON.parse(fieldsJson);
                    
                        if (!Array.isArray(parsedFields)) {
                            const invalidArrayContainer = new ContainerBuilder()
                                .setAccentColor(0xFF0000)
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent('# ❌ Invalid Format\nEmbed fields must be an array of objects.')
                                );

                            return interaction.editReply({
                                components: [invalidArrayContainer],
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                    
                        if (parsedFields.length < 2 || parsedFields.length > 25) {
                            const fieldCountContainer = new ContainerBuilder()
                                .setAccentColor(0xFFAA00)
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent('# ⚠️ Field Count Error\nYou must provide between 2 and 25 fields.')
                                );

                            return interaction.editReply({
                                components: [fieldCountContainer],
                                flags: MessageFlags.IsComponentsV2
                            });
                        }
                    
                        fields = parsedFields.map(field => {
                            if (typeof field.name !== 'string' || typeof field.value !== 'string') {
                                throw new Error('Each field must contain string `name` and `value`.');
                            }
                    
                            return {
                                name: field.name,
                                value: field.value,
                                inline: typeof field.inline === 'boolean' ? field.inline : false
                            };
                        });
                    } catch (error) {
                        console.error('Field JSON parse error:', error);
                        
                        const jsonErrorContainer = new ContainerBuilder()
                            .setAccentColor(0xFF0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ JSON Parse Error\nInvalid JSON format for fields: ${error.message}`)
                            );

                        return interaction.editReply({
                            components: [jsonErrorContainer],
                            flags: MessageFlags.IsComponentsV2
                        });
                    }

                    embedData = {
                        title: embedTitle,
                        color: embedColor,
                        description: embedDescription,
                        author: embedAuthor ? {
                            name: embedAuthor,
                            url: embedAuthorUrl || undefined
                        } : undefined,
                        footer: embedFooter || embedFooterIcon ? {
                            text: embedFooter || '',
                            iconURL: embedFooterIcon || undefined
                        } : undefined,
                        image: embedImage || undefined,
                        thumbnail: embedThumbnail || undefined,
                        fields
                    };
                }

                await createOrUpdateAutoResponder(userId, guildId, trigger, textResponse, embedData, matchType, channels, status);
                
                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x00FF00)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# ✅ AutoResponder Created\nAutoResponder has been successfully configured.')
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
                                        `**🔤 Trigger:** "${trigger}"`,
                                        `**🎯 Match Type:** ${matchType}`,
                                        `**📺 Channels:** ${channels.join(', ')}`,
                                        `**⚡ Status:** ${status ? '✅ Enabled' : '❌ Disabled'}`,
                                        `**📝 Response Type:** ${useEmbed ? 'Embed' : 'Text'}`
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
                            .setContent(`*AutoResponder configured • ${new Date().toLocaleString()}*`)
                    );

                return interaction.editReply({
                    components: [successContainer],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (subcommand === 'delete') {
                const index = interaction.options.getInteger('index') - 1;
                const wasDeleted = await deleteAutoResponder(userId, index);

                if (!wasDeleted) {
                    const deleteErrorContainer = new ContainerBuilder()
                        .setAccentColor(0xFF0000)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Deletion Failed\nInvalid index or you don\'t have permission to delete this AutoResponder.')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('**💡 Tip:** Use `/autoresponder view` to see your AutoResponders and their index numbers.')
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Error occurred • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [deleteErrorContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const deleteSuccessContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🗑️ AutoResponder Deleted\nAutoResponder has been successfully removed.')
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
                                        `**📋 Deleted Index:** #${index + 1}`,
                                        `**👤 Deleted by:** ${interaction.user.username}`,
                                        `**🏢 Server:** ${interaction.guild.name}`,
                                        `**⚡ Action:** Permanent deletion completed`
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
                            .setContent(`*AutoResponder deleted • ${new Date().toLocaleString()}*`)
                    );

                return interaction.editReply({
                    components: [deleteSuccessContainer],
                    flags: MessageFlags.IsComponentsV2
                });

            } else if (subcommand === 'view') {
                const updatedList = await getUserAutoResponders(userId, guildId);

                if (!updatedList.length) {
                    const noRespondersContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# 📭 No AutoResponders Found\nYou haven\'t created any AutoResponders for this server yet.')
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
                                            'Use `/autoresponder set` to create your first AutoResponder',
                                            '',
                                            '**📝 Features:**',
                                            '• Text or embed responses',
                                            '• Multiple trigger types',
                                            '• Channel-specific activation',
                                            '• Easy management tools'
                                        ].join('\n'))
                                )
                                .setThumbnailAccessory(
                                    new ThumbnailBuilder()
                                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                        .setDescription(`${interaction.user.username}'s AutoResponders`)
                                )
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*No AutoResponders configured • ${new Date().toLocaleString()}*`)
                        );

                    return interaction.editReply({
                        components: [noRespondersContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const responderList = updatedList
                    .map((res, i) => `**#${i + 1}** | \`${res.trigger}\` | Channels: ${res.channels.join(', ')} | Status: ${res.status ? '✅' : '❌'}`)
                    .join('\n');

                const viewContainer = new ContainerBuilder()
                    .setAccentColor(0x00FF00)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 📋 Your AutoResponders\nComplete list of your configured AutoResponders')
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
                                        `**📊 Total AutoResponders:** ${updatedList.length}`,
                                        `**🏢 Server:** ${interaction.guild.name}`,
                                        `**👤 Owner:** ${interaction.user.username}`,
                                        `**⚡ Active:** ${updatedList.filter(r => r.status).length}`
                                    ].join('\n'))
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                    .setDescription(`${interaction.user.username}'s AutoResponders`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🔤 AutoResponder List**\n${responderList}`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('**💡 Management Tips**\n• Use `/autoresponder delete <index>` to remove\n• Use `/autoresponder set` to create new ones\n• Index numbers are shown as #1, #2, etc.')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*AutoResponders loaded • ${new Date().toLocaleString()}*`)
                    );

                return interaction.editReply({
                    components: [viewContainer],
                    flags: MessageFlags.IsComponentsV2
                });
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
                                    'Please use `/autoresponder` instead',
                                    '',
                                    '**📋 Available Commands:**',
                                    '• `/autoresponder set` - Create new AutoResponder',
                                    '• `/autoresponder view` - View your AutoResponders',
                                    '• `/autoresponder delete` - Remove AutoResponder'
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