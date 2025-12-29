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
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder
} = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('worldclock')
        .setDescription('🌍 Advanced world time display with interactive navigation')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Select a specific region to view')
                .setRequired(false)
                .addChoices(
                    { name: '🌍 Europe', value: 'europe' },
                    { name: '🌎 Americas', value: 'americas' },
                    { name: '🌏 Asia', value: 'asia' },
                    { name: '🌏 Australia & Pacific', value: 'pacific' },
                    { name: '🌍 Middle East & Africa', value: 'mea' }
                )
        )
        .addStringOption(option =>
            option.setName('format')
                .setDescription('Choose time format')
                .setRequired(false)
                .addChoices(
                    { name: '12-hour (AM/PM)', value: '12' },
                    { name: '24-hour', value: '24' }
                )
        ),

    aliases: ['wc', 'time', 'clock', 'worldtime'],
    category: 'utility',
    description: '🌍 Advanced world time display with interactive navigation',
    usage: 'worldclock [region] [format]',

    async execute(interaction, args = [], prefix = '/') {
        const isPrefixCommand = !interaction.isCommand || !interaction.isCommand();
        
        if (!isPrefixCommand) {
            await interaction.deferReply();
        }

    
        const timeZones = {
            "Europe": {
                emoji: "🌍",
                color: 0x3498db,
                cities: [
                    { name: "London", country: "United Kingdom", flag: "🇬🇧", tz: "Europe/London", offset: "GMT+0/+1" },
                    { name: "Berlin", country: "Germany", flag: "🇩🇪", tz: "Europe/Berlin", offset: "GMT+1/+2" },
                    { name: "Paris", country: "France", flag: "🇫🇷", tz: "Europe/Paris", offset: "GMT+1/+2" },
                    { name: "Madrid", country: "Spain", flag: "🇪🇸", tz: "Europe/Madrid", offset: "GMT+1/+2" },
                    { name: "Moscow", country: "Russia", flag: "🇷🇺", tz: "Europe/Moscow", offset: "GMT+3" },
                    { name: "Rome", country: "Italy", flag: "🇮🇹", tz: "Europe/Rome", offset: "GMT+1/+2" },
                    { name: "Stockholm", country: "Sweden", flag: "🇸🇪", tz: "Europe/Stockholm", offset: "GMT+1/+2" },
                    { name: "Amsterdam", country: "Netherlands", flag: "🇳🇱", tz: "Europe/Amsterdam", offset: "GMT+1/+2" },
                    { name: "Zurich", country: "Switzerland", flag: "🇨🇭", tz: "Europe/Zurich", offset: "GMT+1/+2" },
                    { name: "Vienna", country: "Austria", flag: "🇦🇹", tz: "Europe/Vienna", offset: "GMT+1/+2" }
                ]
            },
            "Americas": {
                emoji: "🌎",
                color: 0xe74c3c,
                cities: [
                    { name: "New York", country: "United States", flag: "🇺🇸", tz: "America/New_York", offset: "GMT-5/-4" },
                    { name: "Los Angeles", country: "United States", flag: "🇺🇸", tz: "America/Los_Angeles", offset: "GMT-8/-7" },
                    { name: "Chicago", country: "United States", flag: "🇺🇸", tz: "America/Chicago", offset: "GMT-6/-5" },
                    { name: "Mexico City", country: "Mexico", flag: "🇲🇽", tz: "America/Mexico_City", offset: "GMT-6" },
                    { name: "São Paulo", country: "Brazil", flag: "🇧🇷", tz: "America/Sao_Paulo", offset: "GMT-3" },
                    { name: "Toronto", country: "Canada", flag: "🇨🇦", tz: "America/Toronto", offset: "GMT-5/-4" },
                    { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷", tz: "America/Argentina/Buenos_Aires", offset: "GMT-3" },
                    { name: "Lima", country: "Peru", flag: "🇵🇪", tz: "America/Lima", offset: "GMT-5" },
                    { name: "Vancouver", country: "Canada", flag: "🇨🇦", tz: "America/Vancouver", offset: "GMT-8/-7" },
                    { name: "Miami", country: "United States", flag: "🇺🇸", tz: "America/New_York", offset: "GMT-5/-4" }
                ]
            },
            "Asia": {
                emoji: "🌏",
                color: 0xf39c12,
                cities: [
                    { name: "Beijing", country: "China", flag: "🇨🇳", tz: "Asia/Shanghai", offset: "GMT+8" },
                    { name: "Tokyo", country: "Japan", flag: "🇯🇵", tz: "Asia/Tokyo", offset: "GMT+9" },
                    { name: "Seoul", country: "South Korea", flag: "🇰🇷", tz: "Asia/Seoul", offset: "GMT+9" },
                    { name: "Mumbai", country: "India", flag: "🇮🇳", tz: "Asia/Kolkata", offset: "GMT+5:30" },
                    { name: "Jakarta", country: "Indonesia", flag: "🇮🇩", tz: "Asia/Jakarta", offset: "GMT+7" },
                    { name: "Bangkok", country: "Thailand", flag: "🇹🇭", tz: "Asia/Bangkok", offset: "GMT+7" },
                    { name: "Singapore", country: "Singapore", flag: "🇸🇬", tz: "Asia/Singapore", offset: "GMT+8" },
                    { name: "Hong Kong", country: "Hong Kong", flag: "🇭🇰", tz: "Asia/Hong_Kong", offset: "GMT+8" },
                    { name: "Manila", country: "Philippines", flag: "🇵🇭", tz: "Asia/Manila", offset: "GMT+8" },
                    { name: "Kuala Lumpur", country: "Malaysia", flag: "🇲🇾", tz: "Asia/Kuala_Lumpur", offset: "GMT+8" }
                ]
            },
            "Australia & Pacific": {
                emoji: "🌏",
                color: 0x9b59b6,
                cities: [
                    { name: "Sydney", country: "Australia", flag: "🇦🇺", tz: "Australia/Sydney", offset: "GMT+11/+10" },
                    { name: "Melbourne", country: "Australia", flag: "🇦🇺", tz: "Australia/Melbourne", offset: "GMT+11/+10" },
                    { name: "Perth", country: "Australia", flag: "🇦🇺", tz: "Australia/Perth", offset: "GMT+8" },
                    { name: "Auckland", country: "New Zealand", flag: "🇳🇿", tz: "Pacific/Auckland", offset: "GMT+13/+12" },
                    { name: "Fiji", country: "Fiji", flag: "🇫🇯", tz: "Pacific/Fiji", offset: "GMT+12" },
                    { name: "Honolulu", country: "Hawaii, USA", flag: "🇺🇸", tz: "Pacific/Honolulu", offset: "GMT-10" },
                    { name: "Adelaide", country: "Australia", flag: "🇦🇺", tz: "Australia/Adelaide", offset: "GMT+10:30/+9:30" },
                    { name: "Brisbane", country: "Australia", flag: "🇦🇺", tz: "Australia/Brisbane", offset: "GMT+10" }
                ]
            },
            "Middle East & Africa": {
                emoji: "🌍",
                color: 0x1abc9c,
                cities: [
                    { name: "Dubai", country: "United Arab Emirates", flag: "🇦🇪", tz: "Asia/Dubai", offset: "GMT+4" },
                    { name: "Riyadh", country: "Saudi Arabia", flag: "🇸🇦", tz: "Asia/Riyadh", offset: "GMT+3" },
                    { name: "Istanbul", country: "Turkey", flag: "🇹🇷", tz: "Europe/Istanbul", offset: "GMT+3" },
                    { name: "Cape Town", country: "South Africa", flag: "🇿🇦", tz: "Africa/Johannesburg", offset: "GMT+2" },
                    { name: "Cairo", country: "Egypt", flag: "🇪🇬", tz: "Africa/Cairo", offset: "GMT+2" },
                    { name: "Nairobi", country: "Kenya", flag: "🇰🇪", tz: "Africa/Nairobi", offset: "GMT+3" },
                    { name: "Lagos", country: "Nigeria", flag: "🇳🇬", tz: "Africa/Lagos", offset: "GMT+1" },
                    { name: "Tel Aviv", country: "Israel", flag: "🇮🇱", tz: "Asia/Jerusalem", offset: "GMT+2/+3" }
                ]
            }
        };

    
        let selectedRegion = null;
        let timeFormat = '12';
        const sender = isPrefixCommand ? interaction.author : interaction.user;

        if (isPrefixCommand && args.length > 0) {
            const regionMap = {
                'europe': 'Europe',
                'americas': 'Americas',
                'asia': 'Asia',
                'pacific': 'Australia & Pacific',
                'mea': 'Middle East & Africa'
            };
            
            const regionArg = args[0]?.toLowerCase();
            if (regionMap[regionArg]) {
                selectedRegion = regionMap[regionArg];
            }
            
            if (args[1] === '24' || args[1] === '12') {
                timeFormat = args[1];
            }
        } else if (!isPrefixCommand) {
            const regionOption = interaction.options.getString('region');
            const formatOption = interaction.options.getString('format');
            
            if (regionOption) {
                const regionMap = {
                    'europe': 'Europe',
                    'americas': 'Americas',
                    'asia': 'Asia',
                    'pacific': 'Australia & Pacific',
                    'mea': 'Middle East & Africa'
                };
                selectedRegion = regionMap[regionOption];
            }
            
            if (formatOption) {
                timeFormat = formatOption;
            }
        }

     
        const getTimeIcon = (hour) => {
            if (hour >= 5 && hour < 12) return '🌅'; 
            if (hour >= 12 && hour < 17) return '☀️'; 
            if (hour >= 17 && hour < 21) return '🌆'; 
            return '🌙'; 
        };

        const getTimeStatus = (hour) => {
            if (hour >= 6 && hour < 9) return 'Early Morning';
            if (hour >= 9 && hour < 12) return 'Morning';
            if (hour >= 12 && hour < 17) return 'Afternoon';
            if (hour >= 17 && hour < 21) return 'Evening';
            if (hour >= 21 || hour < 6) return 'Night';
            return 'Dawn';
        };

      
        const sendReply = async (components) => {
            const options = {
                components: components,
                flags: MessageFlags.IsComponentsV2
            };

            if (isPrefixCommand) {
                return interaction.reply(options);
            } else {
                return interaction.editReply(options);
            }
        };

        const getCurrentTimes = (regionData) => {
            return regionData.cities.slice(0, 8).map(place => {
                const date = new Date();
                const timeOptions = {
                    timeZone: place.tz,
                    hour12: timeFormat === '12',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                };
                
                const time = date.toLocaleString("en-US", timeOptions);
                const dateStr = date.toLocaleDateString("en-US", { 
                    timeZone: place.tz,
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
                
              
                const localHour = parseInt(date.toLocaleString("en-US", {
                    timeZone: place.tz,
                    hour12: false,
                    hour: 'numeric'
                }));
                
                const timeIcon = getTimeIcon(localHour);
                const timeStatus = getTimeStatus(localHour);
                
                return `${timeIcon} **${place.name}** ${place.flag}\n📍 ${place.country}\n🕐 ${time} • ${timeStatus}\n📅 ${dateStr} • ${place.offset}`;
            }).join('\n\n');
        };

        const regions = Object.keys(timeZones);
        let currentPage = selectedRegion ? regions.indexOf(selectedRegion) : 0;

        const generateContainer = (page) => {
            const regionKey = regions[page];
            const regionData = timeZones[regionKey];
            
            const container = new ContainerBuilder()
                .setAccentColor(regionData.color)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**🌍 WORLD CLOCK - ${regionKey.toUpperCase()}**`)
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Region:** ${regionKey}\n**Cities Displayed:** ${Math.min(regionData.cities.length, 8)}\n**Time Format:** ${timeFormat === '12' ? '12-hour (AM/PM)' : '24-hour'}\n**Auto-Updated:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setURL(sender.displayAvatarURL({ dynamic: true }))
                                .setDescription('World clock')
                        )
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**${regionData.emoji} LIVE TIME DISPLAY**`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(getCurrentTimes(regionData))
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**📊 Navigation:** Page ${page + 1} of ${regions.length} • **🔄 Refresh:** Live updates available\n**🌐 Coverage:** ${regionData.cities.length} cities • **⏰ Precision:** Real-time sync\n\n**Time zones by ${sender.tag}**`)
                );

            return container;
        };

     
        const createButtons = (page) => {
            return new ActionRowBuilder().addComponents(
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
                    .setCustomId('refresh')
                    .setEmoji('🔄')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === regions.length - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setEmoji('⏩')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === regions.length - 1)
            );
        };

     
        const createSelectMenu = () => {
            const options = regions.map((region, index) => ({
                label: region,
                value: index.toString(),
                emoji: timeZones[region].emoji,
                description: `${timeZones[region].cities.length} cities • Live times`
            }));

            return new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('region_select')
                    .setPlaceholder('🌍 Quick navigate to region...')
                    .addOptions(options)
            );
        };

     
        const createFormatToggle = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('toggle_format')
                    .setEmoji('⏰')
                    .setLabel(`Switch to ${timeFormat === '12' ? '24-hour' : '12-hour'}`)
                    .setStyle(ButtonStyle.Secondary)
            );
        };

        const components = [
            generateContainer(currentPage),
            createButtons(currentPage),
            createSelectMenu(),
            createFormatToggle()
        ];

        let message = await sendReply(components);

     
        const collector = message.createMessageComponentCollector({ 
            time: 300000, 
            filter: i => i.user.id === sender.id
        });

        collector.on('collect', async (i) => {
            try {
                if (i.customId === 'region_select') {
                    currentPage = parseInt(i.values[0]);
                } else if (i.customId === 'first') {
                    currentPage = 0;
                } else if (i.customId === 'last') {
                    currentPage = regions.length - 1;
                } else if (i.customId === 'next') {
                    currentPage = Math.min(currentPage + 1, regions.length - 1);
                } else if (i.customId === 'prev') {
                    currentPage = Math.max(currentPage - 1, 0);
                } else if (i.customId === 'toggle_format') {
                    timeFormat = timeFormat === '12' ? '24' : '12';
                } else if (i.customId === 'refresh') {
                  
                }

                const newComponents = [
                    generateContainer(currentPage),
                    createButtons(currentPage),
                    createSelectMenu(),
                    createFormatToggle()
                ];

                await i.update({ 
                    components: newComponents,
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (error) {
                console.error('World clock interaction error:', error);
                if (!i.replied && !i.deferred) {
                    await i.reply({ 
                        content: '❌ An error occurred while updating the world clock.', 
                        ephemeral: true 
                    });
                }
            }
        });

        collector.on('end', async () => {
            try {
                const expiredContainer = new ContainerBuilder()
                    .setAccentColor(0x95a5a6)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**⏰ WORLD CLOCK SESSION EXPIRED**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**Session Status:** Interactive controls have expired after 5 minutes\n**Action Required:** Use `/worldclock` to generate a fresh world clock\n\n**Pro Tip:** Use the refresh button frequently to get the latest times')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Last update by ${sender.tag}**`)
                    );

                await message.edit({ 
                    components: [expiredContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (error) {
                console.error('Error handling world clock timeout:', error);
            }
        });

        // Handle invalid region for prefix commands
        if (isPrefixCommand && selectedRegion && !timeZones[selectedRegion]) {
            const helpContainer = new ContainerBuilder()
                .setAccentColor(0xe74c3c)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**❌ INVALID REGION**')
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Available Regions:**\n• \`europe\` - European cities\n• \`americas\` - North & South American cities\n• \`asia\` - Asian cities\n• \`pacific\` - Australia & Pacific region\n• \`mea\` - Middle East & African cities`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Usage Examples:**\n• \`${prefix}worldclock\` - View all regions\n• \`${prefix}worldclock europe\` - View Europe only\n• \`${prefix}worldclock americas 24\` - Americas in 24h format\n• \`/worldclock\` - Use slash command for best experience`)
                )
                .addSeparatorComponents(separator => separator)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(`**Help for ${sender.tag}**`)
                );

            return interaction.reply({ 
                components: [helpContainer], 
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