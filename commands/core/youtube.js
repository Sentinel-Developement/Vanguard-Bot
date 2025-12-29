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
const { SlashCommandBuilder } = require('discord.js');
const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MediaGalleryBuilder
} = require('discord.js');
const ytsr = require('ytsr');
const ytpl = require('ytpl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Complete YouTube browsing suite')
        // Search & Discovery
        .addSubcommand(sub =>
            sub.setName('search')
                .setDescription('Search for videos')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results per page').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('trending')
                .setDescription('Show trending videos')
                .addStringOption(o => o.setName('category').setDescription('Category').addChoices(
                    { name: 'All', value: 'all' },
                    { name: 'Music', value: 'music' },
                    { name: 'Gaming', value: 'gaming' },
                    { name: 'News', value: 'news' }
                ))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('popular')
                .setDescription('Most popular videos right now')
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('new')
                .setDescription('Latest uploaded videos')
                .addStringOption(o => o.setName('topic').setDescription('Topic').setRequired(false))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        // Channel Features
        .addSubcommand(sub =>
            sub.setName('channel')
                .setDescription('Get channel info')
                .addStringOption(o => o.setName('query').setDescription('Channel name or URL').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Recent videos').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('channel-videos')
                .setDescription('Browse channel videos')
                .addStringOption(o => o.setName('query').setDescription('Channel name').setRequired(true))
                .addStringOption(o => o.setName('sort').setDescription('Sort by').addChoices(
                    { name: 'Latest', value: 'latest' },
                    { name: 'Popular', value: 'popular' },
                    { name: 'Oldest', value: 'oldest' }
                ))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('channel-playlists')
                .setDescription('Browse channel playlists')
                .addStringOption(o => o.setName('query').setDescription('Channel name').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('channel-shorts')
                .setDescription('Browse channel shorts')
                .addStringOption(o => o.setName('query').setDescription('Channel name').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        // Playlist Features
        .addSubcommand(sub =>
            sub.setName('playlist')
                .setDescription('Browse playlist videos')
                .addStringOption(o => o.setName('url').setDescription('Playlist URL or ID').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Videos').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('playlist-info')
                .setDescription('Get playlist details')
                .addStringOption(o => o.setName('url').setDescription('Playlist URL or ID').setRequired(true)))
        // Category Searches
        .addSubcommand(sub =>
            sub.setName('music')
                .setDescription('Search music videos')
                .addStringOption(o => o.setName('query').setDescription('Artist or song').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('gaming')
                .setDescription('Search gaming videos')
                .addStringOption(o => o.setName('query').setDescription('Game name').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('live')
                .setDescription('Find live streams')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(false))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('shorts')
                .setDescription('Search YouTube Shorts')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('movie')
                .setDescription('Search movies')
                .addStringOption(o => o.setName('query').setDescription('Movie name').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        // Time-based
        .addSubcommand(sub =>
            sub.setName('today')
                .setDescription('Videos uploaded today')
                .addStringOption(o => o.setName('topic').setDescription('Topic').setRequired(false))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('this-week')
                .setDescription('Videos uploaded this week')
                .addStringOption(o => o.setName('topic').setDescription('Topic').setRequired(false))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('this-month')
                .setDescription('Videos uploaded this month')
                .addStringOption(o => o.setName('topic').setDescription('Topic').setRequired(false))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        // Duration filters
        .addSubcommand(sub =>
            sub.setName('short-videos')
                .setDescription('Videos under 4 minutes')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('long-videos')
                .setDescription('Videos over 20 minutes')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        // Quality filters
        .addSubcommand(sub =>
            sub.setName('hd')
                .setDescription('Search HD videos only')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('4k')
                .setDescription('Search 4K videos only')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        // Special features
        .addSubcommand(sub =>
            sub.setName('vr')
                .setDescription('Search VR/360° videos')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(false))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('subtitles')
                .setDescription('Videos with subtitles')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10)))
        .addSubcommand(sub =>
            sub.setName('creative-commons')
                .setDescription('Creative Commons licensed videos')
                .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(o => o.setName('limit').setDescription('Results').setMinValue(1).setMaxValue(10))),

    async execute(interaction) {
        // Immediate defer to prevent timeout
        await interaction.deferReply();
        
        const sub = interaction.options.getSubcommand();
        const limit = interaction.options.getInteger('limit') || 5;

        // Status update function to keep interaction alive
        const updateStatus = async (message) => {
            try {
                const statusContainer = new ContainerBuilder().setAccentColor(0xFFA500);
                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## ⏳ Loading\n\n${message}`)
                );
                await interaction.editReply({ 
                    components: [statusContainer], 
                    flags: MessageFlags.IsComponentsV2 
                }).catch(() => {});
            } catch (err) {
                // Ignore update errors
            }
        };

        try {
            switch (sub) {
                case 'search':
                    await updateStatus('Searching YouTube...');
                    return await this.handleSearch(interaction, limit);
                case 'trending':
                    await updateStatus('Fetching trending videos...');
                    return await this.handleTrending(interaction, limit);
                case 'popular':
                    await updateStatus('Loading popular videos...');
                    return await this.handlePopular(interaction, limit);
                case 'new':
                    await updateStatus('Finding latest videos...');
                    return await this.handleNew(interaction, limit);
                case 'channel':
                    await updateStatus('Loading channel data...');
                    return await this.handleChannel(interaction, limit);
                case 'channel-videos':
                    await updateStatus('Fetching channel videos...');
                    return await this.handleChannelVideos(interaction, limit);
                case 'channel-playlists':
                    return await this.handleChannelPlaylists(interaction);
                case 'channel-shorts':
                    await updateStatus('Loading shorts...');
                    return await this.handleChannelShorts(interaction, limit);
                case 'playlist':
                    await updateStatus('Loading playlist...');
                    return await this.handlePlaylist(interaction, limit);
                case 'playlist-info':
                    await updateStatus('Fetching playlist info...');
                    return await this.handlePlaylistInfo(interaction);
                case 'music':
                    await updateStatus('Searching music...');
                    return await this.handleMusic(interaction, limit);
                case 'gaming':
                    await updateStatus('Finding gaming videos...');
                    return await this.handleGaming(interaction, limit);
                case 'live':
                    await updateStatus('Searching live streams...');
                    return await this.handleLive(interaction, limit);
                case 'shorts':
                    await updateStatus('Loading shorts...');
                    return await this.handleShorts(interaction, limit);
                case 'movie':
                    await updateStatus('Searching movies...');
                    return await this.handleMovie(interaction, limit);
                case 'today':
                    await updateStatus('Finding today\'s videos...');
                    return await this.handleToday(interaction, limit);
                case 'this-week':
                    await updateStatus('Loading this week\'s videos...');
                    return await this.handleThisWeek(interaction, limit);
                case 'this-month':
                    await updateStatus('Fetching this month\'s videos...');
                    return await this.handleThisMonth(interaction, limit);
                case 'short-videos':
                    await updateStatus('Finding short videos...');
                    return await this.handleShortVideos(interaction, limit);
                case 'long-videos':
                    await updateStatus('Searching long videos...');
                    return await this.handleLongVideos(interaction, limit);
                case 'hd':
                    await updateStatus('Loading HD videos...');
                    return await this.handleHD(interaction, limit);
                case '4k':
                    await updateStatus('Finding 4K videos...');
                    return await this.handle4K(interaction, limit);
                case 'vr':
                    await updateStatus('Searching VR content...');
                    return await this.handleVR(interaction, limit);
                case 'subtitles':
                    await updateStatus('Finding subtitled videos...');
                    return await this.handleSubtitles(interaction, limit);
                case 'creative-commons':
                    await updateStatus('Searching CC videos...');
                    return await this.handleCreativeCommons(interaction, limit);
            }
        } catch (err) {
            console.error('[YouTube Error]', err.message);
            return this.sendError(interaction, 'Failed to fetch YouTube data. Try again later.');
        }
    },

    // Handler methods
    async handleSearch(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(query, 50);
        if (!results.length) return this.sendError(interaction, 'No videos found.');
        return this.renderPaginatedResults(interaction, results, `Search: ${query}`, limit);
    },

    async handleTrending(interaction, limit) {
        const category = interaction.options.getString('category') || 'all';
        const results = await safeYTSearch(`trending ${category}`, 50);
        if (!results.length) return this.sendError(interaction, 'No trending videos found.');
        return this.renderPaginatedResults(interaction, results, `Trending: ${category}`, limit);
    },

    async handlePopular(interaction, limit) {
        const results = await safeYTSearch('most popular', 50);
        if (!results.length) return this.sendError(interaction, 'No popular videos found.');
        return this.renderPaginatedResults(interaction, results, 'Popular Videos', limit);
    },

    async handleNew(interaction, limit) {
        const topic = interaction.options.getString('topic') || '';
        const results = await safeYTSearch(`${topic} latest`, 50);
        if (!results.length) return this.sendError(interaction, 'No new videos found.');
        return this.renderPaginatedResults(interaction, results, 'Latest Videos', limit);
    },

    async handleChannel(interaction, limit) {
        const query = interaction.options.getString('query');
        const { info, videos } = await safeGetChannel(query, limit);
        return this.renderChannel(interaction, info, videos);
    },

    async handleChannelVideos(interaction, limit) {
        const query = interaction.options.getString('query');
        const sort = interaction.options.getString('sort') || 'latest';
        const { videos } = await safeGetChannel(query, 50);
        if (!videos.length) return this.sendError(interaction, 'No videos found.');
        return this.renderPaginatedResults(interaction, videos, `${query} - ${sort}`, limit);
    },

    async handleChannelPlaylists(interaction) {
        return this.sendError(interaction, 'Channel playlists feature coming soon!');
    },

    async handleChannelShorts(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} shorts`, 50);
        if (!results.length) return this.sendError(interaction, 'No shorts found.');
        return this.renderPaginatedResults(interaction, results, `${query} Shorts`, limit);
    },

    async handlePlaylist(interaction, limit) {
        const url = interaction.options.getString('url');
        const videos = await safeGetPlaylist(url, 50);
        if (!videos.length) return this.sendError(interaction, 'No videos found in playlist.');
        return this.renderPaginatedResults(interaction, videos, 'Playlist Videos', limit);
    },

    async handlePlaylistInfo(interaction) {
        const url = interaction.options.getString('url');
        const videos = await safeGetPlaylist(url, 10);
        if (!videos.length) return this.sendError(interaction, 'Playlist not found.');
        
        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎥 Playlist Info\n\n` +
                `**Total Videos:** ${videos.length}\n` +
                `**First Video:** ${videos[0].title}\n\n` +
                `Use \`/youtube playlist\` to browse all videos.`
            )
        );

        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },

    async handleMusic(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} music`, 50);
        if (!results.length) return this.sendError(interaction, 'No music videos found.');
        return this.renderPaginatedResults(interaction, results, `Music: ${query}`, limit);
    },

    async handleGaming(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} gaming`, 50);
        if (!results.length) return this.sendError(interaction, 'No gaming videos found.');
        return this.renderPaginatedResults(interaction, results, `Gaming: ${query}`, limit);
    },

    async handleLive(interaction, limit) {
        const query = interaction.options.getString('query') || 'live';
        const results = await safeYTSearch(`${query} live`, 50);
        if (!results.length) return this.sendError(interaction, 'No live streams found.');
        return this.renderPaginatedResults(interaction, results, 'Live Streams', limit);
    },

    async handleShorts(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} shorts`, 50);
        if (!results.length) return this.sendError(interaction, 'No shorts found.');
        return this.renderPaginatedResults(interaction, results, `Shorts: ${query}`, limit);
    },

    async handleMovie(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} movie`, 50);
        if (!results.length) return this.sendError(interaction, 'No movies found.');
        return this.renderPaginatedResults(interaction, results, `Movie: ${query}`, limit);
    },

    async handleToday(interaction, limit) {
        const topic = interaction.options.getString('topic') || '';
        const results = await safeYTSearch(`${topic} today`, 50);
        if (!results.length) return this.sendError(interaction, 'No videos found.');
        return this.renderPaginatedResults(interaction, results, 'Today\'s Videos', limit);
    },

    async handleThisWeek(interaction, limit) {
        const topic = interaction.options.getString('topic') || '';
        const results = await safeYTSearch(`${topic} this week`, 50);
        if (!results.length) return this.sendError(interaction, 'No videos found.');
        return this.renderPaginatedResults(interaction, results, 'This Week', limit);
    },

    async handleThisMonth(interaction, limit) {
        const topic = interaction.options.getString('topic') || '';
        const results = await safeYTSearch(`${topic} this month`, 50);
        if (!results.length) return this.sendError(interaction, 'No videos found.');
        return this.renderPaginatedResults(interaction, results, 'This Month', limit);
    },

    async handleShortVideos(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} short`, 50);
        if (!results.length) return this.sendError(interaction, 'No short videos found.');
        return this.renderPaginatedResults(interaction, results, `Short: ${query}`, limit);
    },

    async handleLongVideos(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} long`, 50);
        if (!results.length) return this.sendError(interaction, 'No long videos found.');
        return this.renderPaginatedResults(interaction, results, `Long: ${query}`, limit);
    },

    async handleHD(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} HD`, 50);
        if (!results.length) return this.sendError(interaction, 'No HD videos found.');
        return this.renderPaginatedResults(interaction, results, `HD: ${query}`, limit);
    },

    async handle4K(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} 4K`, 50);
        if (!results.length) return this.sendError(interaction, 'No 4K videos found.');
        return this.renderPaginatedResults(interaction, results, `4K: ${query}`, limit);
    },

    async handleVR(interaction, limit) {
        const query = interaction.options.getString('query') || 'VR';
        const results = await safeYTSearch(`${query} 360`, 50);
        if (!results.length) return this.sendError(interaction, 'No VR videos found.');
        return this.renderPaginatedResults(interaction, results, 'VR/360°', limit);
    },

    async handleSubtitles(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} subtitles`, 50);
        if (!results.length) return this.sendError(interaction, 'No videos found.');
        return this.renderPaginatedResults(interaction, results, `Subtitled: ${query}`, limit);
    },

    async handleCreativeCommons(interaction, limit) {
        const query = interaction.options.getString('query');
        const results = await safeYTSearch(`${query} creative commons`, 50);
        if (!results.length) return this.sendError(interaction, 'No CC videos found.');
        return this.renderPaginatedResults(interaction, results, `CC: ${query}`, limit);
    },

    // Render methods
    async renderPaginatedResults(interaction, results, title, pageSize) {
        let page = 0;
        const totalPages = Math.ceil(results.length / pageSize);
        const sessionId = Date.now().toString(36);

        const buildContainer = () => {
            const start = page * pageSize;
            const end = Math.min(start + pageSize, results.length);
            const slice = results.slice(start, end);

            const container = new ContainerBuilder().setAccentColor(0xFF0000);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🎥 ${title}\n\nPage ${page + 1} of ${totalPages} • ${results.length} total results`
                )
            );

            container.addSeparatorComponents(new SeparatorBuilder());

            // Add video thumbnails
            if (slice[0]?.thumbnail) {
                container.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        item => item.setURL(slice[0].thumbnail).setDescription('Video Thumbnail')
                    )
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            }

            // Add videos
            slice.forEach((v, i) => {
                const globalIdx = start + i + 1;
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${globalIdx}.** [${v.title.substring(0, 80)}](${v.url})\n` +
                        ` ${v.duration || 'N/A'} • ${v.views?.toLocaleString() || '–'} views`
                    )
                );
                if (i < slice.length - 1) {
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                }
            });

            return container;
        };

        const buildButtons = (disabled = false) => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`yt_prev_${sessionId}`)
                .setLabel('◀')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0 || disabled),
            new ButtonBuilder()
                .setCustomId(`yt_home_${sessionId}`)
                .setEmoji('🏠')
                .setStyle(ButtonStyle.Success)
                .setDisabled(page === 0 || disabled),
            new ButtonBuilder()
                .setCustomId(`yt_next_${sessionId}`)
                .setLabel('▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages - 1 || disabled)
        );

        const msg = await interaction.editReply({
            components: [buildContainer(), buildButtons()],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = msg.createMessageComponentCollector({
            time: 120000,
            filter: i => i.user.id === interaction.user.id
        });

        collector.on('collect', async i => {
            await i.deferUpdate();

            if (i.customId === `yt_prev_${sessionId}` && page > 0) page--;
            else if (i.customId === `yt_next_${sessionId}` && page < totalPages - 1) page++;
            else if (i.customId === `yt_home_${sessionId}`) page = 0;

            await i.editReply({
                components: [buildContainer(), buildButtons()],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on('end', () => {
            msg.edit({ components: [buildContainer(), buildButtons(true)] }).catch(() => {});
        });
    },

    async renderChannel(interaction, info, videos) {
        const container = new ContainerBuilder().setAccentColor(0xFF0000);

        // Header with channel name and URL
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 📺 [${info.name}](${info.url})\n\nChannel Information`
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        // Channel avatar/logo in MediaGallery
        if (info.avatar) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    item => item
                        .setURL(info.avatar)
                        .setDescription(`${info.name} - Channel Avatar`)
                )
            );
            container.addSeparatorComponents(new SeparatorBuilder());
        }

        // Channel Stats - Clean display of subscriber count
        const subCount = info.subscribers;
        let subDisplay = 'Not available';
        
        // If it's a number or looks like a number (e.g., "1.2M")
        if (typeof subCount === 'number') {
            subDisplay = subCount.toLocaleString();
        } else if (typeof subCount === 'string') {
            // Filter out @ handles and non-numeric text
            if (!subCount.startsWith('@') && (subCount.match(/\d/) || subCount.includes('M') || subCount.includes('K'))) {
                subDisplay = subCount;
            }
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**📊 Statistics**\n\n` +
                `**Subscribers:** ${subDisplay}\n` +
                `**Recent Videos:** ${videos.length}\n` +
                `**Channel:** [Visit Channel](${info.url})`
            )
        );

        // Recent Videos section
        if (videos.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**🎥 Latest Uploads**`)
            );

            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

            videos.slice(0, 5).forEach((v, i) => {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${i + 1}.** [${v.title.substring(0, 80)}](${v.url})\n` +
                        ` ${v.duration || 'N/A'} • ${v.views?.toLocaleString() || '–'} views`
                    )
                );
                if (i < 4) {
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                }
            });
        }

        const linkButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Open Channel')
                .setEmoji('📺')
                .setStyle(ButtonStyle.Link)
                .setURL(info.url),
            new ButtonBuilder()
                .setLabel('View More')
                .setEmoji('🎥')
                .setStyle(ButtonStyle.Link)
                .setURL(`${info.url}/videos`)
        );

        return interaction.editReply({
            components: [container, linkButton],
            flags: MessageFlags.IsComponentsV2
        });
    },

    sendError(interaction, message) {
        const container = new ContainerBuilder().setAccentColor(0xFF0000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ❌ Error\n\n${message}`)
        );
        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};

// Safe helper functions with error suppression
async function safeYTSearch(query, limit) {
    try {
        const filters = await ytsr.getFilters(query);
        const videoFilter = filters.get('Type')?.get('Video');
        if (!videoFilter) return [];
        
        const res = await ytsr(videoFilter.url, { limit });
        return res.items
            .filter(i => i.type === 'video')
            .map(v => ({
                title: v.title || 'Untitled',
                url: v.url || '',
                duration: v.duration || 'N/A',
                views: v.views || 0,
                thumbnail: v.bestThumbnail?.url || null
            }));
    } catch (err) {
        console.error('[YouTube Search Error]', err.message);
        return [];
    }
}

async function safeGetChannel(query, limit) {
    try {
        const filters = await ytsr.getFilters(query);
        const channelFilter = filters.get('Type')?.get('Channel');
        if (!channelFilter) throw new Error('Channel filter not found');
        
        const chRes = await ytsr(channelFilter.url, { limit: 1 });
        const ch = chRes.items.find(i => i.type === 'channel');
        if (!ch) throw new Error('Channel not found');

        // Extract subscriber count properly (filter out @ handles)
        let subCount = 'Not available';
        const possibleFields = [ch.subscribers, ch.subscriberCount, ch.subCount, ch.subscriberText];
        
        for (const field of possibleFields) {
            if (field && typeof field === 'string' && !field.startsWith('@')) {
                // Check if it contains numbers or K/M indicators
                if (field.match(/\d/) || field.includes('M') || field.includes('K') || field.includes('subscribers')) {
                    subCount = field.replace('subscribers', '').trim();
                    break;
                }
            } else if (typeof field === 'number') {
                subCount = field;
                break;
            }
        }

        const info = {
            name: ch.name || ch.channelName || 'Unknown Channel',
            url: ch.url || '',
            avatar: ch.bestAvatar?.url || ch.thumbnail?.url || ch.thumbnails?.[0]?.url || null,
            subscribers: subCount
        };

        // Get channel videos
        const vidFilters = await ytsr.getFilters(ch.url);
        const videoFilter = vidFilters.get('Type')?.get('Video');
        if (!videoFilter) return { info, videos: [] };
        
        const vidRes = await ytsr(videoFilter.url, { limit });
        const videos = vidRes.items
            .filter(i => i.type === 'video')
            .map(v => ({
                title: v.title || 'Untitled',
                url: v.url || '',
                duration: v.duration || 'N/A',
                views: v.views || 0,
                thumbnail: v.bestThumbnail?.url || null
            }));

        return { info, videos };
    } catch (err) {
        console.error('[Channel Error]', err.message);
        
        // Try alternative method
        try {
            const searchRes = await ytsr(query, { limit: 20 });
            const channel = searchRes.items.find(i => i.type === 'channel');
            
            if (channel) {
                // Extract sub count from channel object
                let subCount = 'Not available';
                const possibleFields = [channel.subscribers, channel.subscriberCount, channel.subCount];
                
                for (const field of possibleFields) {
                    if (field && typeof field === 'string' && !field.startsWith('@') && field.match(/\d/)) {
                        subCount = field;
                        break;
                    } else if (typeof field === 'number') {
                        subCount = field;
                        break;
                    }
                }

                const info = {
                    name: channel.name || 'Unknown',
                    url: channel.url || '',
                    avatar: channel.bestAvatar?.url || channel.thumbnail?.url || null,
                    subscribers: subCount
                };

                const videos = searchRes.items
                    .filter(i => i.type === 'video' && i.author?.name === channel.name)
                    .slice(0, limit)
                    .map(v => ({
                        title: v.title || 'Untitled',
                        url: v.url || '',
                        duration: v.duration || 'N/A',
                        views: v.views || 0,
                        thumbnail: v.bestThumbnail?.url || null
                    }));

                return { info, videos };
            }
        } catch (fallbackErr) {
            console.error('[Channel Fallback Error]', fallbackErr.message);
        }

        return {
            info: { 
                name: query, 
                url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`, 
                avatar: null, 
                subscribers: 'Not available' 
            },
            videos: []
        };
    }
}

async function safeGetPlaylist(url, limit) {
    try {
        const id = await ytpl.getPlaylistID(url);
        const playlist = await ytpl(id, { limit });

        return playlist.items.map(item => ({
            title: item.title || 'Untitled',
            url: item.shortUrl || '',
            duration: item.duration || 'N/A',
            views: item.views || 0,
            thumbnail: item.bestThumbnail?.url || null
        }));
    } catch (err) {
        console.error('[Playlist Error]', err.message);
        return [];
    }
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