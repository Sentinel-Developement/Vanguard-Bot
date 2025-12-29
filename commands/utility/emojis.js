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
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize
} = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojis')
        .setDescription('🎭 Ultimate Emoji Management System - 20+ Features')
        .addSubcommand(subcommand =>
            subcommand.setName('show')
                .setDescription('Display server emojis with advanced filtering')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter emojis by name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of emojis to show')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated Only', value: 'animated' },
                            { name: '🖼️ Static Only', value: 'static' },
                            { name: '🌟 All Emojis', value: 'all' }
                        ))
                .addStringOption(option =>
                    option.setName('sort')
                        .setDescription('Sort emojis by')
                        .setRequired(false)
                        .addChoices(
                            { name: '📝 Name (A-Z)', value: 'name' },
                            { name: '📅 Date Added (Newest)', value: 'newest' },
                            { name: '📅 Date Added (Oldest)', value: 'oldest' },
                            { name: '🎲 Random', value: 'random' }
                        ))
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number to display')
                        .setRequired(false)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand.setName('info')
                .setDescription('Get detailed information about a specific emoji')
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji name or ID to get info about')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('search')
                .setDescription('Advanced emoji search with multiple filters')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Search query (name, ID, or keywords)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Filter by emoji type')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated', value: 'animated' },
                            { name: '🖼️ Static', value: 'static' }
                        ))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Search across all bot servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('stats')
                .setDescription('View server emoji statistics and analytics')
                .addBooleanOption(option =>
                    option.setName('detailed')
                        .setDescription('Show detailed statistics')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include global stats from all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('random')
                .setDescription('Get random emojis from the server')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of random emojis to show (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of emojis to randomize')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated', value: 'animated' },
                            { name: '🖼️ Static', value: 'static' },
                            { name: '🌟 All', value: 'all' }
                        ))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include emojis from all bot servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('global')
                .setDescription('Browse emojis from all servers bot is in')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter emojis by name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type filter')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated', value: 'animated' },
                            { name: '🖼️ Static', value: 'static' }
                        ))
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number')
                        .setRequired(false)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand.setName('ids')
                .setDescription('Show emoji IDs and codes for copying')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter by emoji name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('format')
                        .setDescription('Output format')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Discord Format (<:name:id>)', value: 'discord' },
                            { name: 'ID Only', value: 'id' },
                            { name: 'Name and ID', value: 'both' },
                            { name: 'URL Format', value: 'url' }
                        )))
        .addSubcommand(subcommand =>
            subcommand.setName('animated')
                .setDescription('Show only animated emojis')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter by name')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('static')
                .setDescription('Show only static emojis')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter by name')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('newest')
                .setDescription('Show newest emojis')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of newest emojis to show')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(50))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('oldest')
                .setDescription('Show oldest emojis')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of oldest emojis to show')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(50))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('server')
                .setDescription('Browse emojis from a specific server')
                .addStringOption(option =>
                    option.setName('server_name')
                        .setDescription('Server name or ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter by emoji name')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('compare')
                .setDescription('Compare emoji collections between servers')
                .addStringOption(option =>
                    option.setName('server1')
                        .setDescription('First server name/ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('server2')
                        .setDescription('Second server name/ID')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('duplicate')
                .setDescription('Find duplicate emoji names across servers')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Specific emoji name to check')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('export')
                .setDescription('Export emoji list in various formats')
                .addStringOption(option =>
                    option.setName('format')
                        .setDescription('Export format')
                        .setRequired(false)
                        .addChoices(
                            { name: 'JSON', value: 'json' },
                            { name: 'CSV', value: 'csv' },
                            { name: 'Text List', value: 'text' },
                            { name: 'Discord Format', value: 'discord' }
                        ))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('analyze')
                .setDescription('Deep analysis of emoji usage and patterns')
                .addStringOption(option =>
                    option.setName('analysis_type')
                        .setDescription('Type of analysis')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Name Patterns', value: 'patterns' },
                            { name: 'Size Analysis', value: 'sizes' },
                            { name: 'Creation Timeline', value: 'timeline' },
                            { name: 'Server Distribution', value: 'distribution' }
                        )))
        .addSubcommand(subcommand =>
            subcommand.setName('timeline')
                .setDescription('Show emoji creation timeline')
                .addStringOption(option =>
                    option.setName('period')
                        .setDescription('Time period')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Last 7 days', value: '7d' },
                            { name: 'Last 30 days', value: '30d' },
                            { name: 'Last 90 days', value: '90d' },
                            { name: 'All time', value: 'all' }
                        ))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Include all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('lookup')
                .setDescription('Advanced emoji lookup with multiple search methods')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Search by name, ID, or paste emoji')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('exact')
                        .setDescription('Exact match only')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('global')
                        .setDescription('Search all servers')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('leaderboard')
                .setDescription('Top servers by emoji count')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Leaderboard type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Total Emojis', value: 'total' },
                            { name: 'Animated Emojis', value: 'animated' },
                            { name: 'Static Emojis', value: 'static' },
                            { name: 'Recent Activity', value: 'recent' }
                        )))
        .addSubcommand(subcommand =>
            subcommand.setName('bulk-info')
                .setDescription('Get info for multiple emojis at once')
                .addStringOption(option =>
                    option.setName('emojis')
                        .setDescription('Emoji names/IDs separated by spaces or commas')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('format')
                        .setDescription('Display format')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Detailed', value: 'detailed' },
                            { name: 'Compact', value: 'compact' },
                            { name: 'ID List', value: 'ids' }
                        ))),

    aliases: ['emoji', 'emojis', 'showemojis', 'emojilist', 'emotes'],
    category: 'utility',
    description: 'Ultimate emoji management system with 20+ features',

    async execute(interaction, args = [], prefix = '/') {
        const isPrefixCommand = !interaction.isChatInputCommand?.();

        if (!isPrefixCommand) {
            await interaction.deferReply();
        }

        const sendReply = async (components) => {
            const messageData = {
                components: components,
                flags: MessageFlags.IsComponentsV2
            };
            return isPrefixCommand 
                ? await interaction.reply(messageData)
                : await interaction.editReply(messageData);
        };

        try {
            const subcommand = isPrefixCommand ? args[0]?.toLowerCase() || 'show' : interaction.options.getSubcommand();

            switch (subcommand) {
                case 'show':
                case 'list':
                case 'display':
                    return await this.handleShow(interaction, args, isPrefixCommand, sendReply);
                case 'info':
                case 'information':
                case 'details':
                    return await this.handleInfo(interaction, args, isPrefixCommand, sendReply);
                case 'search':
                case 'find':
                case 'lookup':
                    return await this.handleSearch(interaction, args, isPrefixCommand, sendReply);
                case 'stats':
                case 'statistics':
                case 'analytics':
                    return await this.handleStats(interaction, args, isPrefixCommand, sendReply);
                case 'random':
                case 'rand':
                case 'rng':
                    return await this.handleRandom(interaction, args, isPrefixCommand, sendReply);
                case 'global':
                case 'all':
                    return await this.handleGlobal(interaction, args, isPrefixCommand, sendReply);
                case 'ids':
                case 'codes':
                    return await this.handleIds(interaction, args, isPrefixCommand, sendReply);
                case 'animated':
                case 'anim':
                    return await this.handleAnimated(interaction, args, isPrefixCommand, sendReply);
                case 'static':
                case 'still':
                    return await this.handleStatic(interaction, args, isPrefixCommand, sendReply);
                case 'newest':
                case 'new':
                    return await this.handleNewest(interaction, args, isPrefixCommand, sendReply);
                case 'oldest':
                case 'old':
                    return await this.handleOldest(interaction, args, isPrefixCommand, sendReply);
                case 'server':
                case 'guild':
                    return await this.handleServer(interaction, args, isPrefixCommand, sendReply);
                case 'compare':
                case 'comparison':
                    return await this.handleCompare(interaction, args, isPrefixCommand, sendReply);
                case 'duplicate':
                case 'dupes':
                    return await this.handleDuplicate(interaction, args, isPrefixCommand, sendReply);
                case 'export':
                case 'download':
                    return await this.handleExport(interaction, args, isPrefixCommand, sendReply);
                case 'analyze':
                case 'analysis':
                    return await this.handleAnalyze(interaction, args, isPrefixCommand, sendReply);
                case 'timeline':
                case 'history':
                    return await this.handleTimeline(interaction, args, isPrefixCommand, sendReply);
                case 'lookup':
                case 'query':
                    return await this.handleLookup(interaction, args, isPrefixCommand, sendReply);
                case 'leaderboard':
                case 'top':
                    return await this.handleLeaderboard(interaction, args, isPrefixCommand, sendReply);
                case 'bulk-info':
                case 'bulk':
                    return await this.handleBulkInfo(interaction, args, isPrefixCommand, sendReply);
                default:
                    return await this.handleShow(interaction, args, isPrefixCommand, sendReply);
            }

        } catch (error) {
            console.error('Error executing emojis command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Command Error\n## Execution Failed\n\n> An error occurred while processing your request\n> Please try again or contact support`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Error reported by ${interaction.user?.tag || interaction.author?.tag} • ${new Date().toLocaleString()}*`)
                );

            return sendReply([errorContainer]);
        }
    },


    async handleShow(interaction, args, isPrefixCommand, sendReply) {
        let filter, type, sort, requestedPage;

        if (isPrefixCommand) {
            filter = args[1]?.toLowerCase();
            type = args[2]?.toLowerCase() || 'all';
            sort = args[3]?.toLowerCase() || 'name';
            requestedPage = parseInt(args[4]) || 1;
        } else {
            filter = interaction.options.getString('filter')?.toLowerCase();
            type = interaction.options.getString('type') || 'all';
            sort = interaction.options.getString('sort') || 'name';
            requestedPage = interaction.options.getInteger('page') || 1;
        }

        let allEmojis = this.getAllEmojis(interaction.client);
        allEmojis = this.applyFilters(allEmojis, { filter, type });

        if (allEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔍 No Emojis Found\n## Search Results Empty\n\n> No ${type === 'animated' ? 'animated' : type === 'static' ? 'static' : ''} emojis found${filter ? ` matching '${filter}'` : ''}\n> Try adjusting your filters or search terms`)
                );
            return sendReply([errorContainer]);
        }

        allEmojis = this.sortEmojis(allEmojis, sort);

        const pageSize = 20;
        const totalPages = Math.ceil(allEmojis.length / pageSize);
        let currentPage = Math.min(Math.max(1, requestedPage), totalPages) - 1;

        const generateContainer = (page) => {
            const start = page * pageSize;
            const end = Math.min(start + pageSize, allEmojis.length);
            const displayEmojis = allEmojis.slice(start, end);
            const stats = this.getQuickStats(allEmojis);

            return new ContainerBuilder()
                .setAccentColor(this.getTypeColor(type))
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ${this.getTypeIcon(type)} Server Emojis\n## ${filter ? `Filter: "${filter}" • ` : ''}Page ${page + 1}/${totalPages}\n\n> Displaying ${displayEmojis.length} of ${allEmojis.length} emojis\n> Sort: ${sort} • Type: ${type}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎭 **Emoji Collection**\n\n${this.createEmojiGrid(displayEmojis)}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **Quick Stats**\n\n**Total Emojis**\n${stats.total} emojis available\n\n**Animated**\n${stats.animated} animated emojis\n\n**Static**\n${stats.static} static emojis`)
                );
        };

        const createComponents = (page) => {
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setEmoji('⏪')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('random')
                    .setEmoji('🎲')
                    .setLabel('Random')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setEmoji('⏩')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages - 1)
            );

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('emoji_actions')
                    .setPlaceholder('🎛️ Choose an action...')
                    .addOptions([
                        { label: 'View Statistics', value: 'stats', emoji: '📈' },
                        { label: 'Show IDs', value: 'ids', emoji: '🆔' },
                        { label: 'Global Search', value: 'global', emoji: '🌍' },
                        { label: 'Export List', value: 'export', emoji: '💾' },
                        { label: 'Random Emojis', value: 'random_action', emoji: '🎲' }
                    ])
            );

            return [buttons, selectMenu];
        };

        const container = generateContainer(currentPage);
        const components = createComponents(currentPage);
        const message = await sendReply([container, ...components]);

        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async (i) => {
            const originalUserId = isPrefixCommand 
                ? interaction.user?.id || interaction.author?.id
                : interaction.user?.id;
            const interactionUserId = i.member?.user?.id || i.user?.id;

            if (originalUserId && interactionUserId && interactionUserId !== originalUserId) {
                return i.reply({
                    content: "❌ You can't interact with this! Use the command yourself.",
                    ephemeral: true
                });
            }

            if (i.customId === 'emoji_actions') {
                switch (i.values[0]) {
                    case 'stats':
                        return this.handleStatsButton(i);
                    case 'ids':
                        return this.handleIdsButton(i, allEmojis.slice(currentPage * 20, (currentPage + 1) * 20));
                    case 'global':
                        return this.handleGlobalButton(i);
                    case 'export':
                        return this.handleExportButton(i, allEmojis);
                    case 'random_action':
                        return this.handleRandomButton(i);
                }
            } else {
                switch (i.customId) {
                    case 'first':
                        currentPage = 0;
                        break;
                    case 'prev':
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case 'next':
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                        break;
                    case 'last':
                        currentPage = totalPages - 1;
                        break;
                    case 'random':
                        currentPage = Math.floor(Math.random() * totalPages);
                        break;
                }

                const newContainer = generateContainer(currentPage);
                const newComponents = createComponents(currentPage);
                
                await i.update({
                    components: [newContainer, ...newComponents],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        });

        collector.on('end', async () => {
            try {
                const disabledComponents = components.map(row => {
                    const newRow = ActionRowBuilder.from(row);
                    newRow.components.forEach(component => {
                        if (component.setDisabled) component.setDisabled(true);
                    });
                    return newRow;
                });

                await message.edit({ 
                    components: [container, ...disabledComponents],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (err) {
                console.error('Error disabling components:', err);
            }
        });
    },

    async handleInfo(interaction, args, isPrefixCommand, sendReply) {
        const emojiQuery = isPrefixCommand ? args[1] : interaction.options.getString('emoji');

        if (!emojiQuery) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Emoji\n## Invalid Input\n\n> Please provide an emoji name or ID\n> Example: /emojis info poggers`)
                );
            return sendReply([errorContainer]);
        }

        const emoji = this.findEmoji(interaction.client, emojiQuery);

        if (!emoji) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Emoji Not Found\n## Search Failed\n\n> Emoji '${emojiQuery}' not found in this server\n> Use /emojis show to browse available emojis`)
                );
            return sendReply([errorContainer]);
        }

        const infoContainer = new ContainerBuilder()
            .setAccentColor(emoji.animated ? 0xff6b6b : 0x4ecdc4)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${emoji.animated ? '🎭' : '🖼️'} Emoji Information\n## ${emoji.name} Details\n\n> Complete information about this emoji\n> Created <t:${Math.floor(emoji.createdTimestamp / 1000)}:R>`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📝 **Emoji Details**\n\n**Name**\n\`${emoji.name}\`\n\n**ID**\n\`${emoji.id}\`\n\n**Type**\n${emoji.animated ? 'Animated (GIF)' : 'Static (PNG)'}\n\n**Discord Format**\n\`${emoji.emoji}\`\n\n**URL**\n\`${emoji.imageURL()}\`\n\n**Server**\n${emoji.guild ? emoji.guild.name : 'Unknown'}\n\n**Creation Date**\n<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(emoji.imageURL())
                            .setDescription(`${emoji.name} emoji`)
                    )
            );

        return sendReply([infoContainer]);
    },

    async handleSearch(interaction, args, isPrefixCommand, sendReply) {
        const query = isPrefixCommand ? args.slice(1).join(' ') : interaction.options.getString('query');
        const type = isPrefixCommand ? null : interaction.options.getString('type');
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        if (!query) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Query\n## Invalid Search\n\n> Please provide a search query\n> Example: /emojis search pog`)
                );
            return sendReply([errorContainer]);
        }

        const results = global 
            ? this.searchEmojisGlobal(interaction.client, query, type)
            : this.searchEmojis(interaction.client, query, type);

        if (results.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔍 No Results Found\n## Search Empty\n\n> No emojis found matching '${query}'\n> Try different search terms or check spelling`)
                );
            return sendReply([errorContainer]);
        }

        const searchContainer = new ContainerBuilder()
            .setAccentColor(0xf39c12)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔍 Search Results\n## Query: "${query}" ${global ? '(Global)' : ''}\n\n> Found ${results.length} matching emoji${results.length !== 1 ? 's' : ''}\n> Showing ${Math.min(25, results.length)} results`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **Search Results**\n\n${this.createEmojiGridWithServers(results.slice(0, 25), global)}`)
            );

        return sendReply([searchContainer]);
    },

    async handleStats(interaction, args, isPrefixCommand, sendReply) {
        const detailed = isPrefixCommand 
            ? args.includes('detailed') || args.includes('detail') || args.includes('d')
            : interaction.options.getBoolean('detailed');
        const global = isPrefixCommand 
            ? args.includes('global') || args.includes('all')
            : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);
        const stats = this.getDetailedStats(allEmojis, interaction.guild, global);

        const statsContainer = new ContainerBuilder()
            .setAccentColor(0x9b59b6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📊 ${global ? 'Global ' : 'Server '}Emoji Statistics\n## Complete Analytics\n\n> Comprehensive emoji usage and statistics\n> Last updated: <t:${Math.floor(Date.now() / 1000)}:R>`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📈 **Usage Statistics**\n\n**Total Emojis**\n${stats.total} emojis\n\n**Animated Emojis**\n${stats.animated} (${((stats.animated / stats.total) * 100).toFixed(1)}%)\n\n**Static Emojis**\n${stats.static} (${((stats.static / stats.total) * 100).toFixed(1)}%)\n\n${global ? `**Servers**\n${stats.serverCount} servers` : `**Slots Used**\n${stats.total}/${stats.maxEmojis} (${((stats.total / stats.maxEmojis) * 100).toFixed(1)}%)`}\n\n**Average Name Length**\n${stats.avgNameLength} characters`)
            );

        if (detailed) {
            statsContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **Detailed Analytics**\n\n**Longest Name**\n\`${stats.longestName}\` (${stats.longestNameLength} chars)\n\n**Shortest Name**\n\`${stats.shortestName}\` (${stats.shortestNameLength} chars)\n\n**Random Sample**\n${stats.randomEmoji}\n\n${global ? `**Top Server**\n${stats.topServer?.name || 'N/A'} (${stats.topServer?.count || 0} emojis)` : `**Server Tier**\n${interaction.guild?.premiumTier >= 2 ? 'Level 3 (150 emojis)' : interaction.guild?.premiumTier >= 1 ? 'Level 2 (100 emojis)' : 'Level 1 (50 emojis)'}`}`)
            );
        }

        return sendReply([statsContainer]);
    },

    async handleRandom(interaction, args, isPrefixCommand, sendReply) {
        const count = isPrefixCommand ? parseInt(args[1]) || 5 : interaction.options.getInteger('count') || 5;
        const type = isPrefixCommand ? args[2]?.toLowerCase() || 'all' : interaction.options.getString('type') || 'all';
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);
        const filteredEmojis = this.applyFilters(allEmojis, { type });

        if (filteredEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ No Emojis Available\n## Filter Too Restrictive\n\n> No emojis found with the specified filters\n> Try using different filter options`)
                );
            return sendReply([errorContainer]);
        }

        const randomEmojis = this.getRandomEmojis(filteredEmojis, count);

        const randomContainer = new ContainerBuilder()
            .setAccentColor(0xe67e22)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎲 Random Emoji Selection\n## ${count} Random Emojis ${global ? '(Global)' : ''}\n\n> Selected randomly from ${filteredEmojis.length} available emojis\n> Type filter: ${type}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **Random Collection**\n\n${randomEmojis.map(emoji => `${emoji.emoji} \`${emoji.name}\`${global && emoji.guild ? ` (${emoji.guild.name})` : ''}`).join('\n')}`)
            );

        return sendReply([randomContainer]);
    },

    async handleGlobal(interaction, args, isPrefixCommand, sendReply) {
        const filter = isPrefixCommand ? args[1] : interaction.options.getString('filter');
        const type = isPrefixCommand ? args[2] : interaction.options.getString('type');
        const page = isPrefixCommand ? parseInt(args[3]) || 1 : interaction.options.getInteger('page') || 1;

        let allEmojis = this.getAllEmojisGlobal(interaction.client);
        allEmojis = this.applyFilters(allEmojis, { filter, type });

        if (allEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🌍 No Global Emojis Found\n## Search Empty\n\n> No emojis found across all servers\n> The bot might not be in many servers yet`)
                );
            return sendReply([errorContainer]);
        }

        const pageSize = 15;
        const totalPages = Math.ceil(allEmojis.length / pageSize);
        const currentPage = Math.min(Math.max(1, page), totalPages) - 1;
        const start = currentPage * pageSize;
        const end = Math.min(start + pageSize, allEmojis.length);
        const displayEmojis = allEmojis.slice(start, end);

        const serverCount = new Set(allEmojis.map(e => e.guild?.id)).size;

        const globalContainer = new ContainerBuilder()
            .setAccentColor(0x00ff88)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🌍 Global Emoji Browser\n## Page ${currentPage + 1}/${totalPages}\n\n> Browsing ${allEmojis.length} emojis from ${serverCount} servers\n> Bot is in ${interaction.client.guilds.cache.size} servers total`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **Global Emoji Collection**\n\n${this.createEmojiGridWithServers(displayEmojis, true)}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **Global Stats**\n\n**Total Emojis:** ${allEmojis.length}\n**Servers:** ${serverCount}\n**Animated:** ${allEmojis.filter(e => e.animated).length}\n**Static:** ${allEmojis.filter(e => !e.animated).length}`)
            );

        return sendReply([globalContainer]);
    },

async handleIds(interaction, args, isPrefixCommand, sendReply) {
    const filter = isPrefixCommand ? args[1] : interaction.options.getString('filter');
    const format = isPrefixCommand ? args[2] || 'discord' : interaction.options.getString('format') || 'discord';

    let allEmojis = this.getAllEmojis(interaction.client);
    if (filter) {
        allEmojis = allEmojis.filter(emoji => 
            emoji.name.toLowerCase().includes(filter.toLowerCase())
        );
    }

    if (allEmojis.length === 0) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xffa500)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🆔 No Emojis Found\n## Filter Results Empty\n\n> No emojis match your filter criteria\n> Try a different filter or remove it`)
            );
        return sendReply([errorContainer]);
    }

    const formatEmoji = (emoji) => {
        switch (format) {
            case 'id':
                return `${emoji.emoji} \`${emoji.id}\``;
            case 'both':
                return `${emoji.emoji} \`${emoji.name}: ${emoji.id}\``;
            case 'url':
                return `${emoji.emoji} \`${emoji.imageURL()}\``;
            case 'discord':
            default:
                return `${emoji.emoji} \`${emoji.emoji}\``;
        }
    };

    const formatName = {
        'id': 'ID Only',
        'both': 'Name and ID', 
        'url': 'Image URLs',
        'discord': 'Discord Format'
    };

  
    const chunkedList = [];
    const maxLength = 1800; 
    let currentChunk = '';
    
    for (const emoji of allEmojis.slice(0, 200)) { 
        const formatted = formatEmoji(emoji);
        const line = `${formatted}\n`;
        
        if ((currentChunk + line).length > maxLength) {
            if (currentChunk) chunkedList.push(currentChunk);
            currentChunk = line;
        } else {
            currentChunk += line;
        }
    }
    if (currentChunk) chunkedList.push(currentChunk);


    const firstContainer = new ContainerBuilder()
        .setAccentColor(0x3498db)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🆔 Emoji IDs & Codes\n## ${formatName[format]} Format (Part 1/${chunkedList.length})\n\n> Showing ${Math.min(200, allEmojis.length)} of ${allEmojis.length} emojis\n> Format: ${formatName[format]}${filter ? ` • Filter: "${filter}"` : ''}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`## 📋 **Copy-Paste Ready (Part 1)**\n\n${chunkedList[0] || 'No emojis to display'}`)
        );

    if (chunkedList.length > 1) {
        firstContainer.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        ).addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*📝 Sending all ${chunkedList.length} parts with 200ms delay • Please wait...*`)
        );
    }


    await sendReply([firstContainer]);

 
    if (chunkedList.length > 1) {
        for (let i = 1; i < chunkedList.length; i++) {
        
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const chunkContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🆔 Emoji IDs & Codes\n## ${formatName[format]} Format (Part ${i + 1}/${chunkedList.length})\n\n> Continuation of emoji list\n> ${filter ? `Filter: "${filter}"` : 'All emojis'}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **Copy-Paste Ready (Part ${i + 1})**\n\n${chunkedList[i]}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*📝 Part ${i + 1} of ${chunkedList.length} • ${i === chunkedList.length - 1 ? 'Complete!' : 'More coming...'}*`)
                );

            try {
                if (isPrefixCommand) {
                    await interaction.channel.send({
                        components: [chunkContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } else {
                    await interaction.followUp({
                        components: [chunkContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } catch (error) {
                console.error(`Error sending chunk ${i + 1}:`, error);
                
            }
        }
    }
},



    async handleAnimated(interaction, args, isPrefixCommand, sendReply) {
        const filter = isPrefixCommand ? args[1] : interaction.options.getString('filter');
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);
        
        const animatedEmojis = allEmojis.filter(emoji => emoji.animated);
        const filteredEmojis = filter 
            ? animatedEmojis.filter(emoji => emoji.name.toLowerCase().includes(filter.toLowerCase()))
            : animatedEmojis;

        if (filteredEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎭 No Animated Emojis Found\n## Search Empty\n\n> No animated emojis found${filter ? ` matching "${filter}"` : ''}\n> ${global ? 'Try searching other servers' : 'This server may not have animated emojis'}`)
                );
            return sendReply([errorContainer]);
        }

        const animatedContainer = new ContainerBuilder()
            .setAccentColor(0xff6b6b)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎭 Animated Emojis ${global ? '(Global)' : ''}\n## ${filteredEmojis.length} Animated Emojis Found\n\n> Showing all animated emojis${filter ? ` matching "${filter}"` : ''}\n> ${global ? `From ${new Set(filteredEmojis.map(e => e.guild?.id)).size} servers` : 'From current server'}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎬 **Animated Collection**\n\n${this.createEmojiGridWithServers(filteredEmojis.slice(0, 30), global)}`)
            );

        if (filteredEmojis.length > 30) {
            animatedContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🎭 Showing first 30 • ${filteredEmojis.length} total animated emojis*`)
            );
        }

        return sendReply([animatedContainer]);
    },

    async handleStatic(interaction, args, isPrefixCommand, sendReply) {
        const filter = isPrefixCommand ? args[1] : interaction.options.getString('filter');
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);
        
        const staticEmojis = allEmojis.filter(emoji => !emoji.animated);
        const filteredEmojis = filter 
            ? staticEmojis.filter(emoji => emoji.name.toLowerCase().includes(filter.toLowerCase()))
            : staticEmojis;

        if (filteredEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🖼️ No Static Emojis Found\n## Search Empty\n\n> No static emojis found${filter ? ` matching "${filter}"` : ''}\n> ${global ? 'Try searching other servers' : 'This server may not have static emojis'}`)
                );
            return sendReply([errorContainer]);
        }

        const staticContainer = new ContainerBuilder()
            .setAccentColor(0x4ecdc4)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🖼️ Static Emojis ${global ? '(Global)' : ''}\n## ${filteredEmojis.length} Static Emojis Found\n\n> Showing all static emojis${filter ? ` matching "${filter}"` : ''}\n> ${global ? `From ${new Set(filteredEmojis.map(e => e.guild?.id)).size} servers` : 'From current server'}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🖼️ **Static Collection**\n\n${this.createEmojiGridWithServers(filteredEmojis.slice(0, 30), global)}`)
            );

        if (filteredEmojis.length > 30) {
            staticContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🖼️ Showing first 30 • ${filteredEmojis.length} total static emojis*`)
            );
        }

        return sendReply([staticContainer]);
    },

    async handleNewest(interaction, args, isPrefixCommand, sendReply) {
        const count = isPrefixCommand ? parseInt(args[1]) || 10 : interaction.options.getInteger('count') || 10;
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);
        
        const sortedEmojis = allEmojis
            .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
            .slice(0, count);

        if (sortedEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📅 No Recent Emojis\n## No Emojis Found\n\n> No emojis found in ${global ? 'any servers' : 'this server'}\n> The bot might be new or have limited access`)
                );
            return sendReply([errorContainer]);
        }

        const newestContainer = new ContainerBuilder()
            .setAccentColor(0x2ecc71)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📅 Newest Emojis ${global ? '(Global)' : ''}\n## ${count} Most Recent Emojis\n\n> Showing the ${count} newest emojis\n> ${global ? `From ${interaction.client.guilds.cache.size} servers` : 'From current server'}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🆕 **Recently Added**\n\n${sortedEmojis.map(emoji => 
                        `${emoji.emoji} \`${emoji.name}\` - <t:${Math.floor(emoji.createdTimestamp / 1000)}:R>${global && emoji.guild ? ` (${emoji.guild.name})` : ''}`
                    ).join('\n')}`)
            );

        return sendReply([newestContainer]);
    },

    async handleOldest(interaction, args, isPrefixCommand, sendReply) {
        const count = isPrefixCommand ? parseInt(args[1]) || 10 : interaction.options.getInteger('count') || 10;
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);
        
        const sortedEmojis = allEmojis
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            .slice(0, count);

        if (sortedEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📅 No Old Emojis\n## No Emojis Found\n\n> No emojis found in ${global ? 'any servers' : 'this server'}\n> The bot might be new or have limited access`)
                );
            return sendReply([errorContainer]);
        }

        const oldestContainer = new ContainerBuilder()
            .setAccentColor(0x95a5a6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📅 Oldest Emojis ${global ? '(Global)' : ''}\n## ${count} Oldest Emojis\n\n> Showing the ${count} oldest emojis\n> ${global ? `From ${interaction.client.guilds.cache.size} servers` : 'From current server'}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 👴 **Veteran Emojis**\n\n${sortedEmojis.map(emoji => 
                    `${emoji.emoji} \`${emoji.name}\` - <t:${Math.floor(emoji.createdTimestamp / 1000)}:R>${global && emoji.guild ? ` (${emoji.guild.name})` : ''}`
                ).join('\n')}`)
            );

        return sendReply([oldestContainer]);
    },

    async handleServer(interaction, args, isPrefixCommand, sendReply) {
        const serverQuery = isPrefixCommand ? args[1] : interaction.options.getString('server_name');
        const filter = isPrefixCommand ? args[2] : interaction.options.getString('filter');

        if (!serverQuery) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Server\n## Invalid Input\n\n> Please provide a server name or ID\n> Example: /emojis server "My Cool Server"`)
                );
            return sendReply([errorContainer]);
        }

        const guild = this.findGuild(interaction.client, serverQuery);

        if (!guild) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Server Not Found\n## Search Failed\n\n> Server "${serverQuery}" not found\n> The bot must be in the server to view its emojis`)
                );
            return sendReply([errorContainer]);
        }

        const guildEmojis = guild.emojis.cache.map(emoji => ({
            id: emoji.id,
            name: emoji.name,
            animated: emoji.animated,
            imageURL: () => emoji.imageURL(),
            emoji: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
            guild: emoji.guild,
            createdTimestamp: emoji.createdTimestamp
        }));

        const filteredEmojis = filter 
            ? guildEmojis.filter(emoji => emoji.name.toLowerCase().includes(filter.toLowerCase()))
            : guildEmojis;

        if (filteredEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 No Emojis Found\n## Server Empty\n\n> ${guild.name} has no emojis${filter ? ` matching "${filter}"` : ''}\n> Server might not have any emojis uploaded`)
                );
            return sendReply([errorContainer]);
        }

        const serverContainer = new ContainerBuilder()
            .setAccentColor(0x8e44ad)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏠 Server Emojis\n## ${guild.name}\n\n> Showing ${filteredEmojis.length} emojis from ${guild.name}\n> Server ID: ${guild.id}${filter ? ` • Filter: "${filter}"` : ''}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **${guild.name} Collection**\n\n${this.createEmojiGrid(filteredEmojis.slice(0, 30))}`)
            );

        if (filteredEmojis.length > 30) {
            serverContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🏠 Showing first 30 • ${filteredEmojis.length} total emojis in ${guild.name}*`)
            );
        }

        return sendReply([serverContainer]);
    },

    async handleCompare(interaction, args, isPrefixCommand, sendReply) {
        const server1Query = isPrefixCommand ? args[1] : interaction.options.getString('server1');
        const server2Query = isPrefixCommand ? args[2] : interaction.options.getString('server2') || interaction.guild?.name;

        if (!server1Query) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Server\n## Invalid Input\n\n> Please provide at least one server name or ID\n> Example: /emojis compare "Server 1" "Server 2"`)
                );
            return sendReply([errorContainer]);
        }

        const guild1 = this.findGuild(interaction.client, server1Query);
        const guild2 = server2Query ? this.findGuild(interaction.client, server2Query) : null;

        if (!guild1 || (server2Query && !guild2)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Server Not Found\n## Search Failed\n\n> One or more servers not found\n> The bot must be in both servers to compare`)
                );
            return sendReply([errorContainer]);
        }

        const guild1Stats = this.getGuildEmojiStats(guild1);
        const guild2Stats = guild2 ? this.getGuildEmojiStats(guild2) : null;

        const compareContainer = new ContainerBuilder()
            .setAccentColor(0xe74c3c)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚖️ Server Comparison\n## ${guild1.name} vs ${guild2?.name || 'N/A'}\n\n> Comparing emoji collections between servers\n> Analysis of counts, types, and usage`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **Comparison Results**\n\n**${guild1.name}:**\n• Total: ${guild1Stats.total} emojis\n• Animated: ${guild1Stats.animated}\n• Static: ${guild1Stats.static}\n• Usage: ${((guild1Stats.total / guild1Stats.maxEmojis) * 100).toFixed(1)}%\n\n${guild2Stats ? `**${guild2.name}:**\n• Total: ${guild2Stats.total} emojis\n• Animated: ${guild2Stats.animated}\n• Static: ${guild2Stats.static}\n• Usage: ${((guild2Stats.total / guild2Stats.maxEmojis) * 100).toFixed(1)}%` : '**No second server provided**'}`)
            );

        if (guild2Stats) {
            compareContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🏆 **Winner**\n\n**Most Emojis:** ${guild1Stats.total > guild2Stats.total ? guild1.name : guild2.name}\n**Most Animated:** ${guild1Stats.animated > guild2Stats.animated ? guild1.name : guild2.name}\n**Best Usage Rate:** ${(guild1Stats.total / guild1Stats.maxEmojis) > (guild2Stats.total / guild2Stats.maxEmojis) ? guild1.name : guild2.name}`)
            );
        }

        return sendReply([compareContainer]);
    },

    async handleDuplicate(interaction, args, isPrefixCommand, sendReply) {
        const name = isPrefixCommand ? args[1] : interaction.options.getString('name');

        const allEmojis = this.getAllEmojisGlobal(interaction.client);
        
        let duplicates;
        if (name) {
            duplicates = allEmojis.filter(emoji => 
                emoji.name.toLowerCase() === name.toLowerCase()
            );
        } else {
            const nameGroups = {};
            allEmojis.forEach(emoji => {
                const lowerName = emoji.name.toLowerCase();
                if (!nameGroups[lowerName]) nameGroups[lowerName] = [];
                nameGroups[lowerName].push(emoji);
            });
            
            duplicates = Object.values(nameGroups)
                .filter(group => group.length > 1)
                .flat();
        }

        if (duplicates.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0x2ecc71)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ✅ No Duplicates Found\n## All Clear\n\n> ${name ? `No duplicates found for "${name}"` : 'No duplicate emoji names found across servers'}\n> All emoji names are unique!`)
                );
            return sendReply([errorContainer]);
        }

        const duplicateContainer = new ContainerBuilder()
            .setAccentColor(0xf39c12)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔍 Duplicate Emojis Found\n## ${name ? `"${name}" Duplicates` : 'All Duplicates'}\n\n> Found ${duplicates.length} duplicate emoji${duplicates.length !== 1 ? 's' : ''}\n> ${name ? `All instances of "${name}"` : 'Emojis with same names across servers'}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 👥 **Duplicate Emojis**\n\n${duplicates.slice(0, 20).map(emoji => 
                    `${emoji.emoji} \`${emoji.name}\` - ${emoji.guild?.name || 'Unknown Server'}`
                ).join('\n')}`)
            );

        if (duplicates.length > 20) {
            duplicateContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🔍 Showing first 20 • ${duplicates.length} total duplicates found*`)
            );
        }

        return sendReply([duplicateContainer]);
    },

async handleExport(interaction, args, isPrefixCommand, sendReply) {
    const format = isPrefixCommand ? args[1] || 'text' : interaction.options.getString('format') || 'text';
    const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

    const allEmojis = global 
        ? this.getAllEmojisGlobal(interaction.client)
        : this.getAllEmojis(interaction.client);

    if (allEmojis.length === 0) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xffa500)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📁 No Emojis to Export\n## Export Empty\n\n> No emojis available for export\n> ${global ? 'Bot has no emoji access' : 'Server has no emojis'}`)
            );
        return sendReply([errorContainer]);
    }

    let exportData = '';
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `emojis_${global ? 'global' : interaction.guild?.name || 'server'}_${timestamp}.${format === 'json' ? 'json' : 'txt'}`;

    switch (format) {
        case 'json':
            exportData = JSON.stringify(
                allEmojis.map(emoji => ({
                    name: emoji.name,
                    id: emoji.id,
                    animated: emoji.animated,
                    url: emoji.imageURL(),
                    server: emoji.guild?.name || 'Unknown',
                    created: new Date(emoji.createdTimestamp).toISOString()
                })), 
                null, 
                2
            );
            break;
        case 'csv':
            exportData = 'Name,ID,Animated,URL,Server,Created\n' + 
                allEmojis.map(emoji => 
                    `"${emoji.name}","${emoji.id}","${emoji.animated}","${emoji.imageURL()}","${emoji.guild?.name || 'Unknown'}","${new Date(emoji.createdTimestamp).toISOString()}"`
                ).join('\n');
            break;
        case 'discord':
            exportData = allEmojis.map(emoji => emoji.emoji).join(' ');
            break;
        case 'text':
        default:
            exportData = allEmojis.map(emoji => 
                `${emoji.emoji} ${emoji.name} - ${emoji.id} - ${emoji.animated ? 'Animated' : 'Static'} - ${emoji.guild?.name || 'Unknown'}`
            ).join('\n');
            break;
    }

  
    const chunks = [];
    const maxLength = 1500;
    let currentChunk = '';
    
    const lines = exportData.split('\n');
    for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }
    if (currentChunk) chunks.push(currentChunk);

  
    const firstContainer = new ContainerBuilder()
        .setAccentColor(0x3498db)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 💾 Emoji Export\n## ${format.toUpperCase()} Format ${global ? '(Global)' : ''} (Part 1/${chunks.length})\n\n> Exported ${allEmojis.length} emojis\n> Format: ${format.toUpperCase()} • File: ${fileName}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`## 📄 **Export Data (Part 1)**\n\n\`\`\`${format}\n${chunks[0]}\`\`\``)
        );

    if (chunks.length > 1) {
        firstContainer.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        ).addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*💾 Sending all ${chunks.length} parts with 200ms delay • Please wait...*`)
        );
    }

    await sendReply([firstContainer]);


    if (chunks.length > 1) {
        for (let i = 1; i < chunks.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const chunkContainer = new ContainerBuilder()
                .setAccentColor(0x3498db)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💾 Emoji Export\n## ${format.toUpperCase()} Format (Part ${i + 1}/${chunks.length})\n\n> Export continuation\n> File: ${fileName}`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📄 **Export Data (Part ${i + 1})**\n\n\`\`\`${format}\n${chunks[i]}\`\`\``)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*💾 Part ${i + 1} of ${chunks.length} • ${i === chunks.length - 1 ? 'Export complete!' : 'More data coming...'}*`)
                );

            try {
                if (isPrefixCommand) {
                    await interaction.channel.send({
                        components: [chunkContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } else {
                    await interaction.followUp({
                        components: [chunkContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } catch (error) {
                console.error(`Error sending export chunk ${i + 1}:`, error);
            }
        }
    }
},

    async handleAnalyze(interaction, args, isPrefixCommand, sendReply) {
        const analysisType = isPrefixCommand ? args[1] || 'patterns' : interaction.options.getString('analysis_type') || 'patterns';

        const allEmojis = this.getAllEmojisGlobal(interaction.client);

        if (allEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📊 No Data to Analyze\n## Analysis Empty\n\n> No emojis available for analysis\n> Bot needs emoji access to perform analysis`)
                );
            return sendReply([errorContainer]);
        }

        let analysisContent = '';
        let analysisTitle = '';

        switch (analysisType) {
            case 'patterns':
                analysisTitle = 'Name Pattern Analysis';
                const patterns = this.analyzeNamePatterns(allEmojis);
                analysisContent = `**Common Prefixes:**\n${patterns.prefixes.slice(0, 5).map(p => `• "${p.prefix}" (${p.count} emojis)`).join('\n')}\n\n**Common Suffixes:**\n${patterns.suffixes.slice(0, 5).map(s => `• "${s.suffix}" (${s.count} emojis)`).join('\n')}\n\n**Name Length Distribution:**\n• Average: ${patterns.avgLength} characters\n• Shortest: ${patterns.shortest} characters\n• Longest: ${patterns.longest} characters`;
                break;
            case 'sizes':
                analysisTitle = 'Size Analysis';
                analysisContent = `**Format Distribution:**\n• Animated (GIF): ${allEmojis.filter(e => e.animated).length}\n• Static (PNG): ${allEmojis.filter(e => !e.animated).length}\n\n**Animation Rate:**\n• ${((allEmojis.filter(e => e.animated).length / allEmojis.length) * 100).toFixed(1)}% animated\n• ${((allEmojis.filter(e => !e.animated).length / allEmojis.length) * 100).toFixed(1)}% static`;
                break;
            case 'timeline':
                analysisTitle = 'Creation Timeline';
                const timeline = this.analyzeTimeline(allEmojis);
                analysisContent = `**Creation Activity:**\n• Most active day: ${timeline.mostActiveDay}\n• Recent activity: ${timeline.recentCount} emojis in last 30 days\n• Growth rate: ${timeline.growthRate} emojis/month\n\n**Peak Period:**\n${timeline.peakPeriod}`;
                break;
            case 'distribution':
                analysisTitle = 'Server Distribution';
                const distribution = this.analyzeServerDistribution(allEmojis);
                analysisContent = `**Top Servers:**\n${distribution.topServers.slice(0, 5).map(s => `• ${s.name}: ${s.count} emojis`).join('\n')}\n\n**Distribution:**\n• Average per server: ${distribution.avgPerServer}\n• Total servers: ${distribution.totalServers}\n• Most emojis: ${distribution.maxEmojis} (${distribution.topServer})`;
                break;
        }

        const analyzeContainer = new ContainerBuilder()
            .setAccentColor(0x9b59b6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔬 Deep Analysis\n## ${analysisTitle}\n\n> Analyzing ${allEmojis.length} emojis from ${interaction.client.guilds.cache.size} servers\n> Advanced pattern recognition and statistics`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📈 **Analysis Results**\n\n${analysisContent}`)
            );

        return sendReply([analyzeContainer]);
    },

    async handleTimeline(interaction, args, isPrefixCommand, sendReply) {
        const period = isPrefixCommand ? args[1] || 'all' : interaction.options.getString('period') || 'all';
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);

        if (allEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📅 No Timeline Data\n## No Emojis Found\n\n> No emojis available for timeline analysis\n> ${global ? 'Bot has no emoji access' : 'Server has no emojis'}`)
                );
            return sendReply([errorContainer]);
        }

        const now = Date.now();
        const periods = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000,
            'all': Infinity
        };

        const cutoff = period === 'all' ? 0 : now - periods[period];
        const filteredEmojis = allEmojis.filter(emoji => emoji.createdTimestamp >= cutoff);
        const sortedEmojis = filteredEmojis.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

        const periodName = {
            '7d': 'Last 7 Days',
            '30d': 'Last 30 Days', 
            '90d': 'Last 90 Days',
            'all': 'All Time'
        };

        const timelineContainer = new ContainerBuilder()
            .setAccentColor(0x1abc9c)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📅 Emoji Timeline\n## ${periodName[period]} ${global ? '(Global)' : ''}\n\n> Showing ${filteredEmojis.length} emojis created in ${periodName[period].toLowerCase()}\n> Chronological order from newest to oldest`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⏰ **Recent Activity**\n\n${sortedEmojis.slice(0, 15).map(emoji => 
                    `${emoji.emoji} \`${emoji.name}\` - <t:${Math.floor(emoji.createdTimestamp / 1000)}:R>${global && emoji.guild ? ` (${emoji.guild.name})` : ''}`
                ).join('\n')}`)
            );

        if (filteredEmojis.length > 15) {
            timelineContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*📅 Showing 15 most recent • ${filteredEmojis.length} total in ${periodName[period].toLowerCase()}*`)
            );
        }

        return sendReply([timelineContainer]);
    },

    async handleLookup(interaction, args, isPrefixCommand, sendReply) {
        const query = isPrefixCommand ? args.slice(1).join(' ') : interaction.options.getString('query');
        const exact = isPrefixCommand ? false : interaction.options.getBoolean('exact');
        const global = isPrefixCommand ? false : interaction.options.getBoolean('global');

        if (!query) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Query\n## Invalid Lookup\n\n> Please provide a search query\n> Can search by name, ID, or paste emoji`)
                );
            return sendReply([errorContainer]);
        }

        const allEmojis = global 
            ? this.getAllEmojisGlobal(interaction.client)
            : this.getAllEmojis(interaction.client);

        let results = [];
        
      
        if (query.match(/^\d+$/)) {
       
            results = allEmojis.filter(emoji => emoji.id === query);
        } else if (query.match(/<a?:[^:]+:\d+>/)) {
           
            const match = query.match(/<a?:([^:]+):(\d+)>/);
            if (match) {
                results = allEmojis.filter(emoji => emoji.name === match[1] && emoji.id === match[2]);
            }
        } else {
       
            if (exact) {
                results = allEmojis.filter(emoji => emoji.name.toLowerCase() === query.toLowerCase());
            } else {
                results = allEmojis.filter(emoji => emoji.name.toLowerCase().includes(query.toLowerCase()));
            }
        }

        if (results.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔍 No Results Found\n## Lookup Empty\n\n> No emojis found matching "${query}"\n> Try different search terms or use non-exact search`)
                );
            return sendReply([errorContainer]);
        }

        const lookupContainer = new ContainerBuilder()
            .setAccentColor(0xe67e22)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔍 Emoji Lookup Results\n## Query: "${query}" ${global ? '(Global)' : ''}\n\n> Found ${results.length} matching emoji${results.length !== 1 ? 's' : ''}\n> Search type: ${exact ? 'Exact match' : 'Partial match'}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **Lookup Results**\n\n${results.slice(0, 20).map(emoji => 
                    `${emoji.emoji} \`${emoji.name}\` (${emoji.id})${global && emoji.guild ? ` - ${emoji.guild.name}` : ''}`
                ).join('\n')}`)
            );

        if (results.length > 20) {
            lookupContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*🔍 Showing first 20 • ${results.length} total results found*`)
            );
        }

        return sendReply([lookupContainer]);
    },

    async handleLeaderboard(interaction, args, isPrefixCommand, sendReply) {
        const type = isPrefixCommand ? args[1] || 'total' : interaction.options.getString('type') || 'total';

        const guilds = interaction.client.guilds.cache;
        const guildStats = guilds.map(guild => {
            const emojis = guild.emojis.cache;
            return {
                name: guild.name,
                id: guild.id,
                total: emojis.size,
                animated: emojis.filter(e => e.animated).size,
                static: emojis.filter(e => !e.animated).size,
                recent: emojis.filter(e => Date.now() - e.createdTimestamp < 7 * 24 * 60 * 60 * 1000).size
            };
        });

        let sortedGuilds = [];
        let typeName = '';

        switch (type) {
            case 'total':
                sortedGuilds = guildStats.sort((a, b) => b.total - a.total);
                typeName = 'Total Emojis';
                break;
            case 'animated':
                sortedGuilds = guildStats.sort((a, b) => b.animated - a.animated);
                typeName = 'Animated Emojis';
                break;
            case 'static':
                sortedGuilds = guildStats.sort((a, b) => b.static - a.static);
                typeName = 'Static Emojis';
                break;
            case 'recent':
                sortedGuilds = guildStats.sort((a, b) => b.recent - a.recent);
                typeName = 'Recent Activity (7 days)';
                break;
        }

        const topGuilds = sortedGuilds.slice(0, 10);

        const leaderboardContainer = new ContainerBuilder()
            .setAccentColor(0xf1c40f)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏆 Server Leaderboard\n## ${typeName}\n\n> Top servers by emoji count\n> Bot is in ${guilds.size} servers total`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🥇 **Top Servers**\n\n${topGuilds.map((guild, index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                        const count = type === 'total' ? guild.total : type === 'animated' ? guild.animated : type === 'static' ? guild.static : guild.recent;
                        return `${medal} **${guild.name}** - ${count} emojis`;
                    }).join('\n')}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **Overall Stats**\n\n**Total Servers:** ${guilds.size}\n**Total Emojis:** ${guildStats.reduce((sum, g) => sum + g.total, 0)}\n**Average per Server:** ${Math.round(guildStats.reduce((sum, g) => sum + g.total, 0) / guilds.size)}\n**Top Server:** ${topGuilds[0]?.name || 'N/A'} (${topGuilds[0]?.total || 0} emojis)`)
            );

        return sendReply([leaderboardContainer]);
    },

    async handleBulkInfo(interaction, args, isPrefixCommand, sendReply) {
        const emojisInput = isPrefixCommand ? args.slice(1).join(' ') : interaction.options.getString('emojis');
        const format = isPrefixCommand ? 'detailed' : interaction.options.getString('format') || 'detailed';

        if (!emojisInput) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Emojis\n## Invalid Input\n\n> Please provide emoji names or IDs\n> Separate multiple emojis with spaces or commas`)
                );
            return sendReply([errorContainer]);
        }

        const emojiQueries = emojisInput.split(/[,\s]+/).filter(q => q.trim());
        const allEmojis = this.getAllEmojisGlobal(interaction.client);
        const foundEmojis = [];

        for (const query of emojiQueries.slice(0, 10)) { 
            const emoji = allEmojis.find(e => 
                e.name.toLowerCase() === query.toLowerCase() || 
                e.id === query ||
                e.emoji === query
            );
            if (emoji) foundEmojis.push(emoji);
        }

        if (foundEmojis.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xffa500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔍 No Emojis Found\n## Search Empty\n\n> None of the provided emojis were found\n> Check spelling and ensure emojis exist`)
                );
            return sendReply([errorContainer]);
        }

        let content = '';
        switch (format) {
            case 'compact':
                content = foundEmojis.map(emoji => 
                    `${emoji.emoji} \`${emoji.name}\` (${emoji.id})`
                ).join('\n');
                break;
            case 'ids':
                content = foundEmojis.map(emoji => 
                    `\`${emoji.id}\``
                ).join('\n');
                break;
            case 'detailed':
            default:
                content = foundEmojis.map(emoji => 
                    `${emoji.emoji} **${emoji.name}**\n• ID: \`${emoji.id}\`\n• Type: ${emoji.animated ? 'Animated' : 'Static'}\n• Server: ${emoji.guild?.name || 'Unknown'}\n• Created: <t:${Math.floor(emoji.createdTimestamp / 1000)}:R>`
                ).join('\n\n');
                break;
        }

        const bulkContainer = new ContainerBuilder()
            .setAccentColor(0x3498db)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📋 Bulk Emoji Info\n## ${foundEmojis.length}/${emojiQueries.length} Found\n\n> Showing information for ${foundEmojis.length} emojis\n> Format: ${format} • Searched: ${emojiQueries.length} queries`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **Emoji Information**\n\n${content}`)
            );

        if (foundEmojis.length < emojiQueries.length) {
            bulkContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            ).addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*📋 ${foundEmojis.length}/${emojiQueries.length} emojis found • Some queries had no results*`)
            );
        }

        return sendReply([bulkContainer]);
    },


    getAllEmojis(client) {
        return client.emojis.cache.map(emoji => ({
            id: emoji.id,
            name: emoji.name,
            animated: emoji.animated,
            imageURL: () => emoji.imageURL(),
            emoji: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
            guild: emoji.guild,
            createdTimestamp: emoji.createdTimestamp
        }));
    },

    getAllEmojisGlobal(client) {
        const globalEmojis = [];
        for (const guild of client.guilds.cache.values()) {
            for (const emoji of guild.emojis.cache.values()) {
                globalEmojis.push({
                    id: emoji.id,
                    name: emoji.name,
                    animated: emoji.animated,
                    imageURL: () => emoji.imageURL(),
                    emoji: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
                    guild: emoji.guild,
                    createdTimestamp: emoji.createdTimestamp
                });
            }
        }
        return globalEmojis;
    },

    applyFilters(emojis, { filter, type }) {
        let filtered = emojis;

        if (type === 'animated') {
            filtered = filtered.filter(emoji => emoji.animated);
        } else if (type === 'static') {
            filtered = filtered.filter(emoji => !emoji.animated);
        }

        if (filter) {
            filtered = filtered.filter(emoji =>
                emoji.name.toLowerCase().includes(filter) ||
                emoji.id.includes(filter)
            );
        }

        return filtered;
    },

    sortEmojis(emojis, sort) {
        switch (sort) {
            case 'name':
                return emojis.sort((a, b) => a.name.localeCompare(b.name));
            case 'newest':
                return emojis.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            case 'oldest':
                return emojis.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            case 'random':
                return emojis.sort(() => Math.random() - 0.5);
            default:
                return emojis;
        }
    },

    createEmojiGrid(emojis) {
        const rows = [];
        for (let i = 0; i < emojis.length; i += 8) {
            const row = emojis.slice(i, i + 8);
            rows.push(row.map(emoji => `${emoji.emoji}`).join(' '));
        }
        return rows.join('\n') || 'No emojis to display';
    },

    createEmojiGridWithServers(emojis, showServers) {
        if (!showServers) return this.createEmojiGrid(emojis);
        
        return emojis.map(emoji => 
            `${emoji.emoji} \`${emoji.name}\`${emoji.guild ? ` - ${emoji.guild.name}` : ''}`
        ).join('\n') || 'No emojis to display';
    },

    findEmoji(client, query) {
        return client.emojis.cache.find(emoji =>
            emoji.name.toLowerCase() === query.toLowerCase() ||
            emoji.id === query ||
            emoji.toString() === query
        );
    },

    findGuild(client, query) {
        return client.guilds.cache.find(guild =>
            guild.name.toLowerCase().includes(query.toLowerCase()) ||
            guild.id === query
        );
    },

    searchEmojis(client, query, type) {
        const allEmojis = this.getAllEmojis(client);
        return this.applyFilters(allEmojis, {
            filter: query.toLowerCase(),
            type
        });
    },

    searchEmojisGlobal(client, query, type) {
        const allEmojis = this.getAllEmojisGlobal(client);
        return this.applyFilters(allEmojis, {
            filter: query.toLowerCase(),
            type
        });
    },

    getRandomEmojis(emojis, count) {
        const shuffled = [...emojis].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, emojis.length));
    },

    getQuickStats(emojis) {
        return {
            total: emojis.length,
            animated: emojis.filter(e => e.animated).length,
            static: emojis.filter(e => !e.animated).length
        };
    },

    getDetailedStats(emojis, guild, global = false) {
        const stats = this.getQuickStats(emojis);

        if (emojis.length === 0) {
            return {
                ...stats,
                maxEmojis: !global && guild ? (guild.premiumTier >= 2 ? 150 : guild.premiumTier >= 1 ? 100 : 50) : 0,
                serverCount: global ? 0 : 1,
                avgNameLength: 0,
                longestName: 'N/A',
                longestNameLength: 0,
                shortestName: 'N/A',
                shortestNameLength: 0,
                randomEmoji: 'N/A',
                topServer: null
            };
        }

        const names = emojis.map(e => e.name);
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        let topServer = null;
        if (global) {
            const serverCounts = {};
            emojis.forEach(emoji => {
                if (emoji.guild) {
                    serverCounts[emoji.guild.id] = serverCounts[emoji.guild.id] || { name: emoji.guild.name, count: 0 };
                    serverCounts[emoji.guild.id].count++;
                }
            });
            topServer = Object.values(serverCounts).sort((a, b) => b.count - a.count)[0];
        }

        return {
            ...stats,
            maxEmojis: !global && guild ? (guild.premiumTier >= 2 ? 150 : guild.premiumTier >= 1 ? 100 : 50) : 0,
            serverCount: global ? new Set(emojis.map(e => e.guild?.id)).size : 1,
            avgNameLength: Math.round(names.reduce((sum, name) => sum + name.length, 0) / names.length),
            longestName: names.reduce((longest, name) => name.length > longest.length ? name : longest, ''),
            longestNameLength: Math.max(...names.map(name => name.length)),
            shortestName: names.reduce((shortest, name) => name.length < shortest.length ? name : shortest, names[0]),
            shortestNameLength: Math.min(...names.map(name => name.length)),
            randomEmoji: randomEmoji.emoji,
            topServer
        };
    },

    getGuildEmojiStats(guild) {
        const emojis = guild.emojis.cache;
        return {
            total: emojis.size,
            animated: emojis.filter(e => e.animated).size,
            static: emojis.filter(e => !e.animated).size,
            maxEmojis: guild.premiumTier >= 2 ? 150 : guild.premiumTier >= 1 ? 100 : 50
        };
    },

    analyzeNamePatterns(emojis) {
        const prefixes = {};
        const suffixes = {};
        const lengths = emojis.map(e => e.name.length);

        emojis.forEach(emoji => {
            const name = emoji.name.toLowerCase();
      
            if (name.length >= 3) {
                const prefix = name.substring(0, 3);
                prefixes[prefix] = (prefixes[prefix] || 0) + 1;
            }
     
            if (name.length >= 3) {
                const suffix = name.substring(name.length - 3);
                suffixes[suffix] = (suffixes[suffix] || 0) + 1;
            }
        });

        const sortedPrefixes = Object.entries(prefixes)
            .map(([prefix, count]) => ({ prefix, count }))
            .sort((a, b) => b.count - a.count);

        const sortedSuffixes = Object.entries(suffixes)
            .map(([suffix, count]) => ({ suffix, count }))
            .sort((a, b) => b.count - a.count);

        return {
            prefixes: sortedPrefixes,
            suffixes: sortedSuffixes,
            avgLength: Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length),
            shortest: Math.min(...lengths),
            longest: Math.max(...lengths)
        };
    },

    analyzeTimeline(emojis) {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const recentEmojis = emojis.filter(e => e.createdTimestamp >= thirtyDaysAgo);

    
        const dayGroups = {};
        emojis.forEach(emoji => {
            const day = new Date(emoji.createdTimestamp).toDateString();
            dayGroups[day] = (dayGroups[day] || 0) + 1;
        });

        const mostActiveDay = Object.entries(dayGroups)
            .sort((a, b) => b[1] - a[1])[0];

     
        const oldestEmoji = Math.min(...emojis.map(e => e.createdTimestamp));
        const ageInMonths = (now - oldestEmoji) / (30 * 24 * 60 * 60 * 1000);
        const growthRate = Math.round(emojis.length / Math.max(ageInMonths, 1));

        return {
            mostActiveDay: mostActiveDay ? `${mostActiveDay[0]} (${mostActiveDay[1]} emojis)` : 'N/A',
            recentCount: recentEmojis.length,
            growthRate,
            peakPeriod: `${Math.max(...Object.values(dayGroups))} emojis in a single day`
        };
    },

    analyzeServerDistribution(emojis) {
        const serverCounts = {};
        emojis.forEach(emoji => {
            if (emoji.guild) {
                serverCounts[emoji.guild.id] = serverCounts[emoji.guild.id] || { name: emoji.guild.name, count: 0 };
                serverCounts[emoji.guild.id].count++;
            }
        });

        const servers = Object.values(serverCounts);
        const topServers = servers.sort((a, b) => b.count - a.count);
        const avgPerServer = Math.round(emojis.length / servers.length);

        return {
            topServers,
            totalServers: servers.length,
            avgPerServer,
            maxEmojis: topServers[0]?.count || 0,
            topServer: topServers[0]?.name || 'N/A'
        };
    },

    getTypeIcon(type) {
        switch (type) {
            case 'animated': return '🎭';
            case 'static': return '🖼️';
            default: return '🌟';
        }
    },

    getTypeColor(type) {
        switch (type) {
            case 'animated': return 0xff6b6b;
            case 'static': return 0x4ecdc4;
            default: return 0x00B0F4;
        }
    },


    async handleStatsButton(interaction) {
        const allEmojis = this.getAllEmojis(interaction.client);
        const stats = this.getDetailedStats(allEmojis, interaction.guild);

        const statsContainer = new ContainerBuilder()
            .setAccentColor(0x9b59b6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📊 Quick Statistics\n## Server Emoji Overview\n\n> Real-time emoji statistics\n> Updated: <t:${Math.floor(Date.now() / 1000)}:T>`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📈 **Current Stats**\n\n**Total Emojis:** ${stats.total}\n**Animated:** ${stats.animated}\n**Static:** ${stats.static}\n**Slots Used:** ${stats.total}/${stats.maxEmojis}\n**Usage:** ${((stats.total / stats.maxEmojis) * 100).toFixed(1)}%\n**Random:** ${stats.randomEmoji}`)
            );

        await interaction.reply({ 
            components: [statsContainer], 
            ephemeral: true,
            flags: MessageFlags.IsComponentsV2 
        });
    },

async handleIdsButton(interaction, emojis) {
    const idsContainer = new ContainerBuilder()
        .setAccentColor(0x3498db)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 🆔 Page Emoji IDs\n## Discord Format Codes\n\n> Copy-paste ready emoji codes\n> Current page emojis only`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`## 📋 **Copy These Codes**\n\n${emojis.map(emoji => `${emoji.emoji} \`${emoji.emoji}\` ${emoji.name}`).join('\n')}`)
        );

    await interaction.reply({ 
        components: [idsContainer], 
        ephemeral: true,
        flags: MessageFlags.IsComponentsV2 
    });
},


    async handleGlobalButton(interaction) {
        const globalEmojis = this.getAllEmojisGlobal(interaction.client);
        const serverCount = new Set(globalEmojis.map(e => e.guild?.id)).size;
        const randomSample = this.getRandomEmojis(globalEmojis, 10);

        const globalContainer = new ContainerBuilder()
            .setAccentColor(0x00ff88)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🌍 Global Emoji Preview\n## Cross-Server Collection\n\n> ${globalEmojis.length} emojis from ${serverCount} servers\n> Random sample from global collection`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **Global Sample**\n\n${randomSample.map(emoji => 
                    `${emoji.emoji} \`${emoji.name}\` - ${emoji.guild?.name || 'Unknown'}`
                ).join('\n')}`)
            );

        await interaction.reply({ 
            components: [globalContainer], 
            ephemeral: true,
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleExportButton(interaction, emojis) {
        const exportData = emojis.map(emoji => 
            `${emoji.name} - ${emoji.id} - ${emoji.animated ? 'Animated' : 'Static'}`
        ).join('\n');

        const exportContainer = new ContainerBuilder()
            .setAccentColor(0x3498db)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💾 Quick Export\n## Text Format\n\n> Export of current emoji data\n> ${emojis.length} emojis included`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📄 **Export Data**\n\n\`\`\`\n${exportData.substring(0, 1500)}${exportData.length > 1500 ? '\n...' : ''}\`\`\``)
            );

        await interaction.reply({ 
            components: [exportContainer], 
            ephemeral: true,
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleRandomButton(interaction) {
        const allEmojis = this.getAllEmojis(interaction.client);
        const randomEmojis = this.getRandomEmojis(allEmojis, 5);

        const randomContainer = new ContainerBuilder()
            .setAccentColor(0xe67e22)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎲 Random Emojis\n## Quick Random Selection\n\n> 5 randomly selected emojis\n> From ${allEmojis.length} available emojis`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎭 **Random Selection**\n\n${randomEmojis.map(emoji => `${emoji.emoji} \`${emoji.name}\``).join('\n')}`)
            );

        await interaction.reply({ 
            components: [randomContainer], 
            ephemeral: true,
            flags: MessageFlags.IsComponentsV2 
        });
    },


    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const subcommand = interaction.options.getSubcommand();

     
        switch (subcommand) {
            case 'info':
            case 'lookup':
                const allEmojis = this.getAllEmojisGlobal(interaction.client);
                const filtered = allEmojis
                    .filter(emoji => emoji.name.toLowerCase().includes(focusedValue.toLowerCase()))
                    .slice(0, 25)
                    .map(emoji => ({
                        name: `${emoji.animated ? '🎭' : '🖼️'} ${emoji.name}${emoji.guild ? ` (${emoji.guild.name})` : ''}`,
                        value: emoji.name
                    }));
                await interaction.respond(filtered);
                break;

            case 'server':
            case 'compare':
                const guilds = interaction.client.guilds.cache
                    .filter(guild => guild.name.toLowerCase().includes(focusedValue.toLowerCase()))
                    .first(25)
                    .map(guild => ({
                        name: `${guild.name} (${guild.emojis.cache.size} emojis)`,
                        value: guild.name
                    }));
                await interaction.respond(guilds);
                break;

            default:
                await interaction.respond([]);
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