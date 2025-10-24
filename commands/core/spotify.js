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
const { spotifyApiRequest } = require('../../utils/spotifyToken');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spotify')
        .setDescription('Complete Spotify browsing suite - 25 commands!')
        // Search & Discovery
        .addSubcommand(sub =>
            sub.setName('search')
                .setDescription('Search tracks, albums, artists, or playlists')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Item type')
                        .addChoices(
                            { name: '🎵 Track', value: 'track' },
                            { name: '💿 Album', value: 'album' },
                            { name: '🎤 Artist', value: 'artist' },
                            { name: '📂 Playlist', value: 'playlist' }
                        )
                        .setRequired(true))
                .addStringOption(opt => opt.setName('query').setDescription('Search term').setRequired(true))
                .addIntegerOption(opt => opt.setName('limit').setDescription('Results (1-10)').setMinValue(1).setMaxValue(10)))
        // Featured & Trending
        .addSubcommand(sub =>
            sub.setName('featured')
                .setDescription('Featured playlists')
                .addStringOption(opt => opt.setName('country').setDescription('Country (US, GB, etc.)').setMaxLength(2)))
        .addSubcommand(sub =>
            sub.setName('newreleases')
                .setDescription('New album releases')
                .addStringOption(opt => opt.setName('country').setDescription('Country code').setMaxLength(2))
                .addIntegerOption(opt => opt.setName('limit').setDescription('Results (1-20)').setMinValue(1).setMaxValue(20)))
        .addSubcommand(sub =>
            sub.setName('toptracks')
                .setDescription('Top tracks globally or by country')
                .addStringOption(opt => opt.setName('country').setDescription('global/us/gb').setMaxLength(10)))
        .addSubcommand(sub =>
            sub.setName('trending')
                .setDescription('Trending music now')
                .addStringOption(opt => opt.setName('country').setDescription('Country code').setMaxLength(2)))
        // Categories
        .addSubcommand(sub =>
            sub.setName('categories')
                .setDescription('List available categories')
                .addStringOption(opt => opt.setName('country').setDescription('Country code').setMaxLength(2)))
        .addSubcommand(sub =>
            sub.setName('category')
                .setDescription('Get playlists from category')
                .addStringOption(opt => opt.setName('id').setDescription('Category ID').setRequired(true))
                .addIntegerOption(opt => opt.setName('limit').setDescription('Results (1-20)').setMinValue(1).setMaxValue(20)))
        // Artist Features
        .addSubcommand(sub =>
            sub.setName('artist')
                .setDescription('Artist info and top tracks')
                .addStringOption(opt => opt.setName('name').setDescription('Artist name').setRequired(true))
                .addStringOption(opt => opt.setName('market').setDescription('Market code').setMaxLength(2)))
        .addSubcommand(sub =>
            sub.setName('artistalbums')
                .setDescription('Artist albums')
                .addStringOption(opt => opt.setName('name').setDescription('Artist name').setRequired(true))
                .addStringOption(opt => opt.setName('type').setDescription('Album type').addChoices(
                    { name: 'Albums', value: 'album' },
                    { name: 'Singles', value: 'single' },
                    { name: 'All', value: 'album,single,compilation' }
                ))
                .addIntegerOption(opt => opt.setName('limit').setDescription('Results (1-20)').setMinValue(1).setMaxValue(20)))
        .addSubcommand(sub =>
            sub.setName('artisttop')
                .setDescription('Artist top 10 songs')
                .addStringOption(opt => opt.setName('name').setDescription('Artist name').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('related')
                .setDescription('Related artists')
                .addStringOption(opt => opt.setName('name').setDescription('Artist name').setRequired(true)))
        // Album & Track
        .addSubcommand(sub =>
            sub.setName('album')
                .setDescription('Album details and tracks')
                .addStringOption(opt => opt.setName('name').setDescription('Album name').setRequired(true))
                .addStringOption(opt => opt.setName('artist').setDescription('Artist name (optional)')))
        .addSubcommand(sub =>
            sub.setName('track')
                .setDescription('Track info with audio features')
                .addStringOption(opt => opt.setName('name').setDescription('Track name').setRequired(true))
                .addStringOption(opt => opt.setName('artist').setDescription('Artist name (optional)')))
        .addSubcommand(sub =>
            sub.setName('trackanalysis')
                .setDescription('Detailed track audio analysis')
                .addStringOption(opt => opt.setName('name').setDescription('Track name').setRequired(true)))
        // Playlists
        .addSubcommand(sub =>
            sub.setName('playlist')
                .setDescription('Playlist details')
                .addStringOption(opt => opt.setName('name').setDescription('Playlist name').setRequired(true))
                .addStringOption(opt => opt.setName('user').setDescription('Owner username')))
        .addSubcommand(sub =>
            sub.setName('playlisttracks')
                .setDescription('All playlist tracks')
                .addStringOption(opt => opt.setName('name').setDescription('Playlist name').setRequired(true))
                .addIntegerOption(opt => opt.setName('limit').setDescription('Tracks (1-50)').setMinValue(1).setMaxValue(50)))
        // Recommendations
        .addSubcommand(sub =>
            sub.setName('recommendations')
                .setDescription('Get recommendations')
                .addStringOption(opt => opt.setName('seed_artists').setDescription('Artist names (comma-separated)'))
                .addStringOption(opt => opt.setName('seed_tracks').setDescription('Track names (comma-separated)'))
                .addStringOption(opt => opt.setName('seed_genres').setDescription('Genres (comma-separated)')))
        .addSubcommand(sub =>
            sub.setName('random')
                .setDescription('Random tracks by genre')
                .addStringOption(opt => opt.setName('genre').setDescription('Genre name'))
                .addIntegerOption(opt => opt.setName('limit').setDescription('Tracks (1-20)').setMinValue(1).setMaxValue(20)))
        // Genres & Discovery
        .addSubcommand(sub =>
            sub.setName('genres')
                .setDescription('Available genre seeds'))
        .addSubcommand(sub =>
            sub.setName('genreplaylist')
                .setDescription('Top playlist for genre')
                .addStringOption(opt => opt.setName('genre').setDescription('Genre name').setRequired(true)))
        // Charts & Popular
        .addSubcommand(sub =>
            sub.setName('viral')
                .setDescription('Viral tracks')
                .addStringOption(opt => opt.setName('country').setDescription('Country code').setMaxLength(2)))
        .addSubcommand(sub =>
            sub.setName('topartists')
                .setDescription('Top artists globally')
                .addIntegerOption(opt => opt.setName('limit').setDescription('Results (1-20)').setMinValue(1).setMaxValue(20)))
        .addSubcommand(sub =>
            sub.setName('topalbums')
                .setDescription('Top albums')
                .addStringOption(opt => opt.setName('country').setDescription('Country code').setMaxLength(2)))
        // User & Social
        .addSubcommand(sub =>
            sub.setName('user')
                .setDescription('User profile and playlists')
                .addStringOption(opt => opt.setName('username').setDescription('Spotify username').setRequired(true)))
        // Additional Features
        .addSubcommand(sub =>
            sub.setName('decade')
                .setDescription('Music from a decade')
                .addStringOption(opt => opt.setName('year').setDescription('Decade (1980s, 1990s, 2000s, etc.)').setRequired(true))),

    async execute(interaction) {
        // Immediate defer to prevent timeout
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        // Status update function
        const updateStatus = async (message) => {
            try {
                const statusContainer = new ContainerBuilder().setAccentColor(0x1DB954);
                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## ⏳ Loading\n\n${message}`)
                );
                await interaction.editReply({
                    components: [statusContainer],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => {});
            } catch (err) {
                // Ignore
            }
        };

        try {
            switch (subcommand) {
                case 'search':
                    await updateStatus('Searching Spotify...');
                    return await handleSearch(interaction);
                case 'featured':
                    await updateStatus('Loading featured playlists...');
                    return await handleFeatured(interaction);
                case 'newreleases':
                    await updateStatus('Fetching new releases...');
                    return await handleNewReleases(interaction);
                case 'toptracks':
                    await updateStatus('Loading top tracks...');
                    return await handleTopTracks(interaction);
                case 'trending':
                    await updateStatus('Finding trending music...');
                    return await handleTrending(interaction);
                case 'categories':
                    await updateStatus('Loading categories...');
                    return await handleCategories(interaction);
                case 'category':
                    await updateStatus('Fetching category playlists...');
                    return await handleCategory(interaction);
                case 'artist':
                    await updateStatus('Loading artist info...');
                    return await handleArtist(interaction);
                case 'artistalbums':
                    await updateStatus('Fetching artist albums...');
                    return await handleArtistAlbums(interaction);
                case 'artisttop':
                    await updateStatus('Loading top songs...');
                    return await handleArtistTop(interaction);
                case 'related':
                    await updateStatus('Finding related artists...');
                    return await handleRelated(interaction);
                case 'album':
                    await updateStatus('Loading album...');
                    return await handleAlbum(interaction);
                case 'track':
                    await updateStatus('Fetching track info...');
                    return await handleTrack(interaction);
                case 'trackanalysis':
                    await updateStatus('Analyzing track...');
                    return await handleTrackAnalysis(interaction);
                case 'playlist':
                    await updateStatus('Loading playlist...');
                    return await handlePlaylist(interaction);
                case 'playlisttracks':
                    await updateStatus('Fetching playlist tracks...');
                    return await handlePlaylistTracks(interaction);
                case 'recommendations':
                    await updateStatus('Generating recommendations...');
                    return await handleRecommendations(interaction);
                case 'random':
                    await updateStatus('Finding random tracks...');
                    return await handleRandom(interaction);
                case 'genres':
                    await updateStatus('Loading genres...');
                    return await handleGenres(interaction);
                case 'genreplaylist':
                    await updateStatus('Finding genre playlist...');
                    return await handleGenrePlaylist(interaction);
                case 'viral':
                    await updateStatus('Loading viral tracks...');
                    return await handleViral(interaction);
                case 'topartists':
                    await updateStatus('Fetching top artists...');
                    return await handleTopArtists(interaction);
                case 'topalbums':
                    await updateStatus('Loading top albums...');
                    return await handleTopAlbums(interaction);
                case 'user':
                    await updateStatus('Loading user profile...');
                    return await handleUser(interaction);
                case 'decade':
                    await updateStatus('Finding music from decade...');
                    return await handleDecade(interaction);
                default:
                    return sendError(interaction, 'Unknown subcommand');
            }
        } catch (error) {
            console.error('[Spotify Error]', error.message);
            return sendError(interaction, `Failed to fetch data: ${error.message}`);
        }
    }
};

// Helper function to send error
function sendError(interaction, message) {
    const container = new ContainerBuilder().setAccentColor(0xFF0000);
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ❌ Error\n\n${message}`)
    );
    return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Handler functions
async function handleSearch(interaction) {
    const type = interaction.options.getString('type');
    const query = interaction.options.getString('query');
    const limit = interaction.options.getInteger('limit') || 5;

    const data = await spotifyApiRequest(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    let items = [];
    let icon = '🎵';

    switch (type) {
        case 'track':
            items = data.tracks?.items || [];
            icon = '🎵';
            break;
        case 'album':
            items = data.albums?.items || [];
            icon = '💿';
            break;
        case 'artist':
            items = data.artists?.items || [];
            icon = '🎤';
            break;
        case 'playlist':
            items = data.playlists?.items || [];
            icon = '📂';
            break;
    }

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## ${icon} ${type.charAt(0).toUpperCase() + type.slice(1)} Search\n\n` +
            `Query: **${query}** • Found: **${items.length}** results`
        )
    );

    if (items.length === 0) {
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('No results found. Try a different search term.')
        );
    } else {
        container.addSeparatorComponents(new SeparatorBuilder());

        // Add thumbnail
        if (items[0]?.images?.[0]?.url || items[0]?.album?.images?.[0]?.url) {
            const imgUrl = items[0]?.images?.[0]?.url || items[0]?.album?.images?.[0]?.url;
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    item => item.setURL(imgUrl).setDescription(`${type} thumbnail`)
                )
            );
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }

        items.forEach((item, idx) => {
            let text = '';
            switch (type) {
                case 'track':
                    text = `**${idx + 1}.** [${item.name}](${item.external_urls.spotify})\n` +
                        `Artist: ${item.artists.map(a => a.name).join(', ')}\n` +
                        `Album: ${item.album.name}`;
                    break;
                case 'album':
                    text = `**${idx + 1}.** [${item.name}](${item.external_urls.spotify})\n` +
                        `Artist: ${item.artists.map(a => a.name).join(', ')}\n` +
                        `Tracks: ${item.total_tracks}`;
                    break;
                case 'artist':
                    text = `**${idx + 1}.** [${item.name}](${item.external_urls.spotify})\n` +
                        `Followers: ${item.followers.total.toLocaleString()}\n` +
                        `Popularity: ${item.popularity}%`;
                    break;
                case 'playlist':
                    text = `**${idx + 1}.** [${item.name}](${item.external_urls.spotify})\n` +
                        `By: ${item.owner.display_name}\n` +
                        `Tracks: ${item.tracks.total}`;
                    break;
            }

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
            if (idx < items.length - 1) {
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            }
        });
    }

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleFeatured(interaction) {
    const country = interaction.options.getString('country') || 'US';
    const data = await spotifyApiRequest(`/browse/featured-playlists?country=${country}&limit=10`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 🌟 Featured Playlists\n\n${data.message || `Featured playlists for ${country}`}`
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    data.playlists.items.forEach((playlist, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${playlist.name}](${playlist.external_urls.spotify})\n` +
                `Tracks: ${playlist.tracks.total}`
            )
        );
        if (idx < data.playlists.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleNewReleases(interaction) {
    const country = interaction.options.getString('country') || 'US';
    const limit = interaction.options.getInteger('limit') || 10;
    const data = await spotifyApiRequest(`/browse/new-releases?country=${country}&limit=${limit}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🆕 New Releases\n\nLatest albums for ${country}`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    if (data.albums.items[0]?.images?.[0]?.url) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(data.albums.items[0].images[0].url).setDescription('Album Cover')
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    }

    data.albums.items.forEach((album, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${album.name}](${album.external_urls.spotify})\n` +
                `Artist: ${album.artists.map(a => a.name).join(', ')}\n` +
                `Release: ${album.release_date}`
            )
        );
        if (idx < data.albums.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleTopTracks(interaction) {
    const country = (interaction.options.getString('country') || 'global').toLowerCase();

    const playlistIds = {
        global: '37i9dQZEVXbMDoHDwVN2tF',
        us: '37i9dQZEVXbLRQDuF5jeBp',
        gb: '37i9dQZEVXbLnolsZ8PSNw'
    };

    const playlistId = playlistIds[country] || playlistIds.global;
    const data = await spotifyApiRequest(`/playlists/${playlistId}/tracks?limit=10`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 📈 Top Tracks - ${country.toUpperCase()}\n\nMost popular tracks right now`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    data.items.forEach((item, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${item.track.name}](${item.track.external_urls.spotify})\n` +
                `Artist: ${item.track.artists.map(a => a.name).join(', ')}`
            )
        );
        if (idx < data.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleTrending(interaction) {
    const country = interaction.options.getString('country') || 'US';
    const data = await spotifyApiRequest(`/browse/featured-playlists?country=${country}&limit=1`);

    if (!data.playlists.items[0]) {
        return sendError(interaction, 'No trending data found');
    }

    const playlistId = data.playlists.items[0].id;
    const tracks = await spotifyApiRequest(`/playlists/${playlistId}/tracks?limit=10`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🔥 Trending Now\n\nHot tracks in ${country}`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    tracks.items.forEach((item, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${item.track.name}](${item.track.external_urls.spotify})\n` +
                `Artist: ${item.track.artists.map(a => a.name).join(', ')}`
            )
        );
        if (idx < tracks.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleCategories(interaction) {
    const country = interaction.options.getString('country') || 'US';
    const data = await spotifyApiRequest(`/browse/categories?country=${country}&limit=20`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 📚 Spotify Categories\n\nAvailable music categories`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    let catText = '';
    data.categories.items.forEach(cat => {
        catText += `• \`${cat.id}\` - ${cat.name}\n`;
    });

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(catText + `\nUse \`/spotify category\` with an ID to explore`)
    );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleCategory(interaction) {
    const categoryId = interaction.options.getString('id');
    const limit = interaction.options.getInteger('limit') || 10;

    const data = await spotifyApiRequest(`/browse/categories/${categoryId}/playlists?limit=${limit}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 📂 Category: ${categoryId}\n\nPlaylists in this category`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    data.playlists.items.forEach((playlist, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${playlist.name}](${playlist.external_urls.spotify})\n` +
                `By: ${playlist.owner.display_name}`
            )
        );
        if (idx < data.playlists.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleArtist(interaction) {
    const artistName = interaction.options.getString('name');
    const market = interaction.options.getString('market') || 'US';

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
    const artist = searchData.artists.items[0];

    if (!artist) return sendError(interaction, 'Artist not found');

    const topTracksData = await spotifyApiRequest(`/artists/${artist.id}/top-tracks?market=${market}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 🎤 ${artist.name}\n\n` +
            `**Followers:** ${artist.followers.total.toLocaleString()}\n` +
            `**Popularity:** ${artist.popularity}%\n` +
            `**Genres:** ${artist.genres.slice(0, 3).join(', ') || 'N/A'}`
        )
    );

    if (artist.images[0]?.url) {
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(artist.images[0].url).setDescription('Artist Image')
            )
        );
    }

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**🔥 Top Tracks**')
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    topTracksData.tracks.slice(0, 10).forEach((track, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify})\n` +
                `Popularity: ${track.popularity}%`
            )
        );
        if (idx < 9) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    const linkButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Open on Spotify')
            .setEmoji('🎵')
            .setStyle(ButtonStyle.Link)
            .setURL(artist.external_urls.spotify)
    );

    await interaction.editReply({ components: [container, linkButton], flags: MessageFlags.IsComponentsV2 });
}

async function handleArtistAlbums(interaction) {
    const artistName = interaction.options.getString('name');
    const albumType = interaction.options.getString('type') || 'album,single,compilation';
    const limit = interaction.options.getInteger('limit') || 10;

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
    const artist = searchData.artists.items[0];

    if (!artist) return sendError(interaction, 'Artist not found');

    const albumsData = await spotifyApiRequest(`/artists/${artist.id}/albums?include_groups=${albumType}&limit=${limit}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 💿 ${artist.name} - Albums\n\nDiscography`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    albumsData.items.forEach((album, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${album.name}](${album.external_urls.spotify})\n` +
                `Release: ${album.release_date.split('-')[0]} • Tracks: ${album.total_tracks}`
            )
        );
        if (idx < albumsData.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleArtistTop(interaction) {
    const artistName = interaction.options.getString('name');

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
    const artist = searchData.artists.items[0];

    if (!artist) return sendError(interaction, 'Artist not found');

    const topTracksData = await spotifyApiRequest(`/artists/${artist.id}/top-tracks?market=US`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🎵 ${artist.name} - Top 10\n\nMost popular songs`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    topTracksData.tracks.forEach((track, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify})\n` +
                `Album: ${track.album.name} • Popularity: ${track.popularity}%`
            )
        );
        if (idx < topTracksData.tracks.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleRelated(interaction) {
    const artistName = interaction.options.getString('name');

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
    const artist = searchData.artists.items[0];

    if (!artist) return sendError(interaction, 'Artist not found');

    const relatedData = await spotifyApiRequest(`/artists/${artist.id}/related-artists`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🔗 Related to ${artist.name}\n\nSimilar artists`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    relatedData.artists.slice(0, 10).forEach((relArtist, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${relArtist.name}](${relArtist.external_urls.spotify})\n` +
                `Followers: ${relArtist.followers.total.toLocaleString()}`
            )
        );
        if (idx < 9) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleAlbum(interaction) {
    const albumName = interaction.options.getString('name');
    const artistName = interaction.options.getString('artist');

    let searchQuery = albumName;
    if (artistName) searchQuery += ` artist:${artistName}`;

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=1`);
    const album = searchData.albums.items[0];

    if (!album) return sendError(interaction, 'Album not found');

    const tracksData = await spotifyApiRequest(`/albums/${album.id}/tracks?limit=20`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 💿 ${album.name}\n\n` +
            `**Artist:** ${album.artists.map(a => a.name).join(', ')}\n` +
            `**Release:** ${album.release_date}\n` +
            `**Tracks:** ${album.total_tracks}\n` +
            `**Popularity:** ${album.popularity}%`
        )
    );

    if (album.images[0]?.url) {
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(album.images[0].url).setDescription('Album Cover')
            )
        );
    }

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**🎵 Tracks**')
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    tracksData.items.slice(0, 10).forEach((track, idx) => {
        const duration = `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`;
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify}) • ${duration}`
            )
        );
        if (idx < 9) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    const linkButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Play on Spotify')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Link)
            .setURL(album.external_urls.spotify)
    );

    await interaction.editReply({ components: [container, linkButton], flags: MessageFlags.IsComponentsV2 });
}

async function handleTrack(interaction) {
    const trackName = interaction.options.getString('name');
    const artistName = interaction.options.getString('artist');

    let searchQuery = trackName;
    if (artistName) searchQuery += ` artist:${artistName}`;

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`);
    const track = searchData.tracks.items[0];

    if (!track) return sendError(interaction, 'Track not found');

    const audioFeatures = await spotifyApiRequest(`/audio-features/${track.id}`);

    const duration = `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`;

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 🎵 ${track.name}\n\n` +
            `**Artist:** ${track.artists.map(a => a.name).join(', ')}\n` +
            `**Album:** ${track.album.name}\n` +
            `**Duration:** ${duration}\n` +
            `**Popularity:** ${track.popularity}%\n` +
            `**Release:** ${track.album.release_date}`
        )
    );

    if (track.album.images[0]?.url) {
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(track.album.images[0].url).setDescription('Album Art')
            )
        );
    }

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**🎼 Audio Features**\n\n` +
            `**Energy:** ${Math.round(audioFeatures.energy * 100)}%\n` +
            `**Danceability:** ${Math.round(audioFeatures.danceability * 100)}%\n` +
            `**Valence:** ${Math.round(audioFeatures.valence * 100)}%\n` +
            `**Tempo:** ${Math.round(audioFeatures.tempo)} BPM\n` +
            `**Key:** ${audioFeatures.key} • **Mode:** ${audioFeatures.mode === 1 ? 'Major' : 'Minor'}`
        )
    );

    const linkButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Play on Spotify')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Link)
            .setURL(track.external_urls.spotify)
    );

    await interaction.editReply({ components: [container, linkButton], flags: MessageFlags.IsComponentsV2 });
}

async function handleTrackAnalysis(interaction) {
    const trackName = interaction.options.getString('name');

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`);
    const track = searchData.tracks.items[0];

    if (!track) return sendError(interaction, 'Track not found');

    const audioFeatures = await spotifyApiRequest(`/audio-features/${track.id}`);
    const analysis = await spotifyApiRequest(`/audio-analysis/${track.id}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 📊 Track Analysis: ${track.name}\n\n` +
            `Detailed audio analysis`
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**🎵 Overview**\n\n` +
            `**Sections:** ${analysis.sections.length}\n` +
            `**Beats:** ${analysis.beats.length}\n` +
            `**Bars:** ${analysis.bars.length}\n` +
            `**Tatums:** ${analysis.tatums.length}`
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**📈 Features**\n\n` +
            `**Acousticness:** ${Math.round(audioFeatures.acousticness * 100)}%\n` +
            `**Instrumentalness:** ${Math.round(audioFeatures.instrumentalness * 100)}%\n` +
            `**Liveness:** ${Math.round(audioFeatures.liveness * 100)}%\n` +
            `**Speechiness:** ${Math.round(audioFeatures.speechiness * 100)}%\n` +
            `**Loudness:** ${audioFeatures.loudness.toFixed(2)} dB`
        )
    );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handlePlaylist(interaction) {
    const playlistName = interaction.options.getString('name');
    const userName = interaction.options.getString('user');

    let searchQuery = playlistName;
    if (userName) searchQuery += ` owner:${userName}`;

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=1`);
    const playlist = searchData.playlists.items[0];

    if (!playlist) return sendError(interaction, 'Playlist not found');

    const tracksData = await spotifyApiRequest(`/playlists/${playlist.id}/tracks?limit=10`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 📂 ${playlist.name}\n\n` +
            `**Owner:** ${playlist.owner.display_name}\n` +
            `**Followers:** ${playlist.followers.total.toLocaleString()}\n` +
            `**Total Tracks:** ${playlist.tracks.total}`
        )
    );

    if (playlist.images[0]?.url) {
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(playlist.images[0].url).setDescription('Playlist Cover')
            )
        );
    }

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**🎵 Recent Tracks**')
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    tracksData.items.forEach((item, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${item.track.name}](${item.track.external_urls.spotify})\n` +
                `Artist: ${item.track.artists.map(a => a.name).join(', ')}`
            )
        );
        if (idx < tracksData.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    const linkButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Open Playlist')
            .setEmoji('📂')
            .setStyle(ButtonStyle.Link)
            .setURL(playlist.external_urls.spotify)
    );

    await interaction.editReply({ components: [container, linkButton], flags: MessageFlags.IsComponentsV2 });
}

async function handlePlaylistTracks(interaction) {
    const playlistName = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit') || 20;

    const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(playlistName)}&type=playlist&limit=1`);
    const playlist = searchData.playlists.items[0];

    if (!playlist) return sendError(interaction, 'Playlist not found');

    const tracksData = await spotifyApiRequest(`/playlists/${playlist.id}/tracks?limit=${limit}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 📂 ${playlist.name} - All Tracks\n\nShowing ${tracksData.items.length} tracks`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    tracksData.items.forEach((item, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${item.track.name}](${item.track.external_urls.spotify})\n` +
                `Artist: ${item.track.artists.map(a => a.name).join(', ')}`
            )
        );
        if (idx < tracksData.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleRecommendations(interaction) {
    const seedArtists = interaction.options.getString('seed_artists');
    const seedTracks = interaction.options.getString('seed_tracks');
    const seedGenres = interaction.options.getString('seed_genres');

    if (!seedArtists && !seedTracks && !seedGenres) {
        return sendError(interaction, 'Provide at least one seed');
    }

    let seeds = [];

    if (seedArtists) {
        const artistNames = seedArtists.split(',').map(n => n.trim()).slice(0, 2);
        for (const name of artistNames) {
            const data = await spotifyApiRequest(`/search?q=${encodeURIComponent(name)}&type=artist&limit=1`);
            if (data.artists.items[0]) seeds.push(`seed_artists=${data.artists.items[0].id}`);
        }
    }

    if (seedTracks) {
        const trackNames = seedTracks.split(',').map(n => n.trim()).slice(0, 2);
        for (const name of trackNames) {
            const data = await spotifyApiRequest(`/search?q=${encodeURIComponent(name)}&type=track&limit=1`);
            if (data.tracks.items[0]) seeds.push(`seed_tracks=${data.tracks.items[0].id}`);
        }
    }

    if (seedGenres) {
        const genres = seedGenres.split(',').map(g => g.trim().toLowerCase()).slice(0, 2);
        genres.forEach(g => seeds.push(`seed_genres=${g}`));
    }

    if (seeds.length === 0) return sendError(interaction, 'No valid seeds found');

    const data = await spotifyApiRequest(`/recommendations?${seeds.join('&')}&limit=10`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🎯 Recommendations\n\nBased on your seeds`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    data.tracks.forEach((track, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify})\n` +
                `Artist: ${track.artists.map(a => a.name).join(', ')}`
            )
        );
        if (idx < data.tracks.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleRandom(interaction) {
    const genre = interaction.options.getString('genre') || 'pop';
    const limit = interaction.options.getInteger('limit') || 5;

    const data = await spotifyApiRequest(`/recommendations?seed_genres=${genre}&limit=${limit}`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🎲 Random Tracks\n\nGenre: **${genre}**`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    data.tracks.forEach((track, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify})\n` +
                `Artist: ${track.artists.map(a => a.name).join(', ')}`
            )
        );
        if (idx < data.tracks.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleGenres(interaction) {
    const data = await spotifyApiRequest(`/recommendations/available-genre-seeds`);

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🎧 Available Genres\n\nUse these in recommendations or random commands`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    const genres = data.genres.sort().join(', ');
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(genres)
    );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleGenrePlaylist(interaction) {
    const genre = interaction.options.getString('genre');

    const data = await spotifyApiRequest(`/search?q=${encodeURIComponent(genre)}&type=playlist&limit=5`);

    if (!data.playlists.items.length) return sendError(interaction, 'No playlists found for genre');

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 📂 ${genre} Playlists\n\nTop playlists for this genre`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    data.playlists.items.forEach((playlist, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${playlist.name}](${playlist.external_urls.spotify})\n` +
                `By: ${playlist.owner.display_name} • Tracks: ${playlist.tracks.total}`
            )
        );
        if (idx < data.playlists.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}
async function handleTopArtists(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;

    // Search for popular artists instead
    const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'r-n-b'];
    const allArtists = [];

    for (const genre of genres.slice(0, 2)) {
        const data = await spotifyApiRequest(`/search?q=genre:${genre}&type=artist&limit=10`);
        allArtists.push(...data.artists.items);
    }

    // Sort by followers
    const sorted = allArtists
        .sort((a, b) => b.followers.total - a.followers.total)
        .slice(0, limit);

    // Remove duplicates
    const unique = [];
    const seenIds = new Set();
    for (const artist of sorted) {
        if (!seenIds.has(artist.id)) {
            seenIds.add(artist.id);
            unique.push(artist);
        }
    }

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🎤 Top Artists\n\nMost popular artists right now`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    unique.slice(0, limit).forEach((artist, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${artist.name}](${artist.external_urls.spotify})\n` +
                `Followers: ${artist.followers.total.toLocaleString()} • Popularity: ${artist.popularity}%`
            )
        );
        if (idx < unique.slice(0, limit).length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleTopAlbums(interaction) {
    const country = interaction.options.getString('country') || 'US';

    // Use new releases as proxy for top albums
    const data = await spotifyApiRequest(`/browse/new-releases?country=${country}&limit=10`);

    if (!data.albums?.items?.length) {
        return sendError(interaction, 'No albums found');
    }

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 💿 Top Albums - ${country}\n\nLatest popular releases`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    if (data.albums.items[0]?.images?.[0]?.url) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(data.albums.items[0].images[0].url).setDescription('Album Cover')
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    }

    data.albums.items.forEach((album, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${album.name}](${album.external_urls.spotify})\n` +
                `Artist: ${album.artists.map(a => a.name).join(', ')} • ${album.total_tracks} tracks`
            )
        );
        if (idx < data.albums.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleViral(interaction) {
    const country = interaction.options.getString('country') || 'US';

    // Search for viral tracks using trending keywords
    const searchTerms = ['viral', 'trending', 'hits'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const data = await spotifyApiRequest(`/search?q=${randomTerm}&type=track&market=${country}&limit=10`);

    if (!data.tracks?.items?.length) {
        return sendError(interaction, 'No viral tracks found');
    }

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🦠 Viral Tracks - ${country.toUpperCase()}\n\nTrending music right now`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    if (data.tracks.items[0]?.album?.images?.[0]?.url) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(data.tracks.items[0].album.images[0].url).setDescription('Track Cover')
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    }

    data.tracks.items.forEach((track, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify})\n` +
                `Artist: ${track.artists.map(a => a.name).join(', ')} • Popularity: ${track.popularity}%`
            )
        );
        if (idx < data.tracks.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function handleUser(interaction) {
    const username = interaction.options.getString('username');

    try {
        const data = await spotifyApiRequest(`/users/${username}`);

        const container = new ContainerBuilder().setAccentColor(0x1DB954);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 👤 ${data.display_name || username}\n\n` +
                `**Username:** ${data.id}\n` +
                `**Followers:** ${data.followers?.total?.toLocaleString() || 'N/A'}\n` +
                `**Profile:** [View on Spotify](${data.external_urls.spotify})`
            )
        );

        if (data.images?.[0]?.url) {
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    item => item.setURL(data.images[0].url).setDescription('Profile Picture')
                )
            );
        }

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
        // If user endpoint fails, search for playlists by that user
        try {
            const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(username)}&type=playlist&limit=5`);
            
            const userPlaylists = searchData.playlists.items.filter(p => 
                p.owner.id.toLowerCase() === username.toLowerCase() || 
                p.owner.display_name.toLowerCase().includes(username.toLowerCase())
            );

            if (userPlaylists.length === 0) {
                return sendError(interaction, `User "${username}" not found`);
            }

            const container = new ContainerBuilder().setAccentColor(0x1DB954);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 👤 ${userPlaylists[0].owner.display_name || username}\n\nPublic playlists`)
            );

            container.addSeparatorComponents(new SeparatorBuilder());

            userPlaylists.forEach((playlist, idx) => {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${idx + 1}.** [${playlist.name}](${playlist.external_urls.spotify})\n` +
                        `Tracks: ${playlist.tracks.total}`
                    )
                );
                if (idx < userPlaylists.length - 1) {
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                }
            });

            await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (fallbackError) {
            return sendError(interaction, `User "${username}" not found`);
        }
    }
}

async function handleDecade(interaction) {
    const year = interaction.options.getString('year');

    // Extract decade years (e.g., "1980s" -> "1980-1989")
    const decadeMatch = year.match(/(\d{4})/);
    if (!decadeMatch) {
        return sendError(interaction, 'Invalid decade format. Use format like: 1980s, 1990s, 2000s');
    }

    const startYear = parseInt(decadeMatch[1]);
    const endYear = startYear + 9;

    // Search for tracks from that decade
    const data = await spotifyApiRequest(`/search?q=year:${startYear}-${endYear}&type=track&limit=10`);

    if (!data.tracks?.items?.length) {
        return sendError(interaction, `No tracks found from ${year}`);
    }

    const container = new ContainerBuilder().setAccentColor(0x1DB954);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 📅 Music from the ${year}\n\nClassic tracks from ${startYear}-${endYear}`)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    if (data.tracks.items[0]?.album?.images?.[0]?.url) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                item => item.setURL(data.tracks.items[0].album.images[0].url).setDescription('Album Cover')
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    }

    data.tracks.items.forEach((track, idx) => {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${idx + 1}.** [${track.name}](${track.external_urls.spotify})\n` +
                `Artist: ${track.artists.map(a => a.name).join(', ')} • Album: ${track.album.name}`
            )
        );
        if (idx < data.tracks.items.length - 1) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
    });

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
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