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
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get information')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weather')
                .setDescription('Get weather info for any location')
                .addStringOption(option =>
                    option.setName('location')
                        .setDescription('City name or location')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('github')
                .setDescription('Get info on a GitHub user')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('GitHub username')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reddit')
                .setDescription('Get info on a subreddit')
                .addStringOption(option =>
                    option.setName('subreddit')
                        .setDescription('Subreddit name (without r/)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('npm')
                .setDescription('Get info on an NPM package')
                .addStringOption(option =>
                    option.setName('package')
                        .setDescription('NPM package name')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('steam')
                .setDescription('Get info on a Steam application')
                .addStringOption(option =>
                    option.setName('appid')
                        .setDescription('Steam App ID')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('imdb')
                .setDescription('Get movie information from IMDB')
                .addStringOption(option =>
                    option.setName('movie')
                        .setDescription('Movie or TV show name')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('itunes')
                .setDescription('Search iTunes for songs')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Song or artist to search for')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        try {
            let response, embed;

            switch (subcommand) {
                case 'weather':
                    const location = interaction.options.getString('location');
                    response = await axios.get(`https://api.popcat.xyz/weather?q=${encodeURIComponent(location)}`);
                    
                  
                    if (!response.data || !response.data[0]) {
                        return await interaction.editReply('❌ Location not found. Please try a different location.');
                    }
                    
                    const weatherData = response.data[0];
                    
                    embed = new EmbedBuilder()
                        .setTitle(`🌤️ Weather in ${weatherData.location?.name || location}`)
                        .setColor(0x87CEEB)
                        .addFields(
                            { name: 'Temperature', value: `${weatherData.current?.temperature || 'N/A'}°C`, inline: true },
                            { name: 'Feels Like', value: `${weatherData.current?.feelslike || 'N/A'}°C`, inline: true },
                            { name: 'Humidity', value: `${weatherData.current?.humidity || 'N/A'}%`, inline: true },
                            { name: 'Wind Speed', value: `${weatherData.current?.wind_speed || 'N/A'} km/h`, inline: true },
                            { name: 'Visibility', value: `${weatherData.current?.visibility || 'N/A'} km`, inline: true },
                            { name: 'UV Index', value: weatherData.current?.uv_index?.toString() || 'N/A', inline: true }
                        );
                    
                 
                    if (weatherData.current?.weather_descriptions && weatherData.current.weather_descriptions[0]) {
                        embed.addFields({ name: 'Description', value: weatherData.current.weather_descriptions[0], inline: false });
                    }
                    
                  
                    if (weatherData.current?.weather_icons && weatherData.current.weather_icons[0]) {
                        embed.setThumbnail(weatherData.current.weather_icons[0]);
                    }
                    
                  
                    if (weatherData.location?.region && weatherData.location?.country) {
                        embed.setFooter({ text: `${weatherData.location.region}, ${weatherData.location.country}` });
                    }
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'github':
                    const username = interaction.options.getString('username');
                    response = await axios.get(`https://api.popcat.xyz/github/${username}`);
                    
                   
                    if (!response.data || !response.data.username) {
                        return await interaction.editReply('❌ GitHub user not found. Please check the username and try again.');
                    }
                    
                    embed = new EmbedBuilder()
                        .setTitle(`${response.data.name || response.data.username} (@${response.data.username})`)
                        .setColor(0x333333)
                        .setURL(response.data.url || `https://github.com/${username}`)
                        .setThumbnail(response.data.avatar || null)
                        .addFields(
                            { name: 'Followers', value: response.data.followers ? response.data.followers.toString() : '0', inline: true },
                            { name: 'Following', value: response.data.following ? response.data.following.toString() : '0', inline: true },
                            { name: 'Public Repos', value: response.data.public_repos ? response.data.public_repos.toString() : '0', inline: true },
                            { name: 'Account Created', value: response.data.created_at ? new Date(response.data.created_at).toLocaleDateString() : 'N/A', inline: true }
                        );
                    
                    if (response.data.bio) {
                        embed.setDescription(response.data.bio);
                    }
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'reddit':
                    const subreddit = interaction.options.getString('subreddit');
                    response = await axios.get(`https://api.popcat.xyz/subreddit/${subreddit}`);
                    
                 
                    if (!response.data || !response.data.name) {
                        return await interaction.editReply('❌ Subreddit not found. Please check the subreddit name and try again.');
                    }
                    
                    embed = new EmbedBuilder()
                        .setTitle(`r/${response.data.name}`)
                        .setColor(0xFF4500)
                        .setURL(response.data.url || `https://reddit.com/r/${subreddit}`)
                        .setThumbnail(response.data.icon || null)
                        .addFields(
                            { name: 'Members', value: response.data.members ? response.data.members.toLocaleString() : 'N/A', inline: true },
                            { name: 'Active Users', value: response.data.active_users ? response.data.active_users.toLocaleString() : 'N/A', inline: true },
                            { name: 'Created', value: response.data.created_utc ? new Date(response.data.created_utc * 1000).toLocaleDateString() : 'N/A', inline: true },
                            { name: 'NSFW', value: response.data.over18 ? 'Yes' : 'No', inline: true }
                        )
                        .setDescription(response.data.description || 'No description available');
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'npm':
                    const packageName = interaction.options.getString('package');
                    response = await axios.get(`https://api.popcat.xyz/npm?q=${packageName}`);
                    
              
                    if (!response.data || !response.data.name) {
                        return await interaction.editReply('❌ Package not found. Please check the package name and try again.');
                    }
                    
                    embed = new EmbedBuilder()
                        .setTitle(response.data.name)
                        .setColor(0xCC3534)
                        .setURL(`https://www.npmjs.com/package/${response.data.name}`)
                        .addFields(
                            { name: 'Version', value: response.data.version || 'N/A', inline: true },
                            { name: 'Downloads (Last Month)', value: response.data.downloads_last_month ? response.data.downloads_last_month.toLocaleString() : 'N/A', inline: true },
                            { name: 'Maintainers', value: response.data.maintainers ? response.data.maintainers.toString() : 'N/A', inline: true },
                            { name: 'Last Published', value: response.data.last_published ? new Date(response.data.last_published).toLocaleDateString() : 'N/A', inline: true }
                        )
                        .setDescription(response.data.description || 'No description available');
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'steam':
                    const appId = interaction.options.getString('appid');
                    response = await axios.get(`https://api.popcat.xyz/steam?id=${appId}`);
                    
            
                    let developers = 'N/A';
                    let publishers = 'N/A';
                    
                    if (response.data.developers) {
                        if (Array.isArray(response.data.developers)) {
                            developers = response.data.developers.join(', ');
                        } else if (typeof response.data.developers === 'string') {
                            developers = response.data.developers;
                        }
                    }
                    
                    if (response.data.publishers) {
                        if (Array.isArray(response.data.publishers)) {
                            publishers = response.data.publishers.join(', ');
                        } else if (typeof response.data.publishers === 'string') {
                            publishers = response.data.publishers;
                        }
                    }
                    
                    embed = new EmbedBuilder()
                        .setTitle(response.data.name || 'Unknown Game')
                        .setColor(0x1B2838)
                        .setURL(response.data.website || null)
                        .setImage(response.data.thumbnail || null)
                        .addFields(
                            { name: 'Price', value: response.data.price || 'Free', inline: true },
                            { name: 'Release Date', value: response.data.release_date || 'N/A', inline: true },
                            { name: 'Developers', value: developers, inline: true },
                            { name: 'Publishers', value: publishers, inline: true }
                        );
                    
                  
                    if (response.data.description && response.data.description.length > 0) {
                        const description = response.data.description.length > 1000 
                            ? response.data.description.substring(0, 997) + '...' 
                            : response.data.description;
                        embed.setDescription(description);
                    }
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'imdb':
                    const movie = interaction.options.getString('movie');
                    response = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(movie)}`);
                    
             
                    let genres = 'N/A';
                    if (response.data.genres) {
                        if (Array.isArray(response.data.genres)) {
                            genres = response.data.genres.join(', ');
                        } else if (typeof response.data.genres === 'string') {
                            genres = response.data.genres;
                        }
                    }
                    
                    embed = new EmbedBuilder()
                        .setTitle(response.data.title || 'Unknown Movie')
                        .setColor(0xF5C518)
                        .setThumbnail(response.data.poster || null)
                        .addFields(
                            { name: 'Rating', value: `${response.data.rating || 'N/A'}/10`, inline: true },
                            { name: 'Year', value: response.data.year?.toString() || 'N/A', inline: true },
                            { name: 'Runtime', value: response.data.runtime || 'N/A', inline: true },
                            { name: 'Genre', value: genres, inline: true },
                            { name: 'Director', value: response.data.director || 'N/A', inline: true },
                            { name: 'Awards', value: response.data.awards || 'N/A', inline: true }
                        )
                        .setDescription(response.data.plot || 'No plot available');
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;

                case 'itunes':
                    const query = interaction.options.getString('query');
                    response = await axios.get(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(query)}`);
                    
              
                    if (!response.data || !response.data[0]) {
                        return await interaction.editReply('❌ No songs found. Please try a different search term.');
                    }
                    
                    const track = response.data[0];
                    
                   
                    let duration = 'N/A';
                    if (track.length && typeof track.length === 'number') {
                        const minutes = Math.floor(track.length / 60000);
                        const seconds = Math.floor((track.length % 60000) / 1000);
                        duration = `${minutes}:${String(seconds).padStart(2, '0')}`;
                    }
                    
                    embed = new EmbedBuilder()
                        .setTitle(`${track.name || 'Unknown'} - ${track.artist || 'Unknown Artist'}`)
                        .setColor(0xFA57C1)
                        .setThumbnail(track.image || null)
                        .addFields(
                            { name: 'Album', value: track.album || 'N/A', inline: true },
                            { name: 'Genre', value: track.genre || 'N/A', inline: true },
                            { name: 'Release Date', value: track.release_date ? new Date(track.release_date).toLocaleDateString() : 'N/A', inline: true },
                            { name: 'Duration', value: duration, inline: true }
                        );
                    
                    if (track.url) {
                        embed.setURL(track.url);
                    }
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;
            }

        } catch (error) {
            console.error('Info command error:', error);
            
  
            if (error.response?.status === 404) {
                await interaction.editReply('❌ Not found. Please check your search term and try again.');
            } else if (error.response?.status === 500) {
                await interaction.editReply('❌ The service is temporarily unavailable. Please try again later.');
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                await interaction.editReply('❌ Unable to connect to the service. Please try again later.');
            } else {
                await interaction.editReply('❌ An error occurred while fetching information. Please try again.');
            }
        }
    }
};