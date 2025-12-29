// handlers/birthdayHandlers.js
const { 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    AttachmentBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MediaGalleryBuilder
} = require('discord.js');
const birthdayController = require('../models/birthday/Controller');
const cron = require('node-cron');
const { BirthdayCardGenerator } = require('../UI/birthdayCardGenerator');
const GuildBirthdaySettings = require('../models/birthday/setup');
class BirthdayHandlers {
    constructor(client) {
        this.client = client;
        this.setupEventHandlers();
        this.setupCronJobs();
        //this.triggerTestToday();
    }

    async triggerTestToday() {
        console.log('🔹 [TEST] Sending forced birthday announcement...');

        for (const [guildId, guild] of this.client.guilds.cache) {
            // fake a test birthday entry
            const testBirthdays = [{
                userId: '1004206704994566164', 
                age: 99,
                settings: { allowMentions: true }
            }];
    
            await this.announceBirthdays(guild, testBirthdays);
        }
    }

    setupEventHandlers() {
        // Handle button interactions
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

            try {
                if (interaction.customId === 'birthday_celebrate') {
                    await this.handleCelebrationButton(interaction);
                } else if (interaction.customId === 'birthday_settings') {
                    await this.handleSettingsMenu(interaction);
                } else if (interaction.customId.startsWith('birthday_setting_')) {
                    await this.handleSettingToggle(interaction);
                }
            } catch (error) {
                console.error('Birthday interaction error:', error);
                await interaction.reply({
                    content: 'An error occurred while processing your request.',
                    ephemeral: true
                });
            }
        });
    }

    setupCronJobs() {
        // Daily birthday check at 9 AM
        cron.schedule('0 9 * * *', async () => {
            await this.dailyBirthdayCheck();
        });

        // Weekly reminder for upcoming birthdays (Sundays at 6 PM)
        cron.schedule('0 18 * * 0', async () => {
            await this.weeklyBirthdayReminder();
        });

        // Monthly statistics update (1st of each month at midnight)
        cron.schedule('0 0 1 * *', async () => {
            await this.monthlyStatsUpdate();
        });
    }

    async handleCelebrationButton(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const celebrationContainer = new ContainerBuilder()
            .setAccentColor(0xFF69B4)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 🎉 Celebration!\nThank you for celebrating with us! 🎂✨')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**🎈 Celebration Actions**\n• Send a birthday wish with `/birthday wish`\n• Check upcoming birthdays with `/birthday upcoming`\n• View birthday stats with `/birthday stats`')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Celebration joined • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({ 
            components: [celebrationContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }

    async handleSettingsMenu(interaction) {
        await interaction.deferUpdate();

        const settingType = interaction.values[0];
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        let buttons = [];
        let title = '';
        let description = '';

        switch (settingType) {
            case 'privacy':
                title = '🔒 Privacy Settings';
                description = 'Choose who can see your birthday information';
                buttons = [
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_privacy_public')
                        .setLabel('🌍 Public')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_privacy_private')
                        .setLabel('🔒 Private')
                        .setStyle(ButtonStyle.Secondary)
                ];
                break;

            case 'mentions':
                title = '🔔 Mention Settings';
                description = 'Allow mentions in birthday celebrations';
                buttons = [
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_mentions_enable')
                        .setLabel('🔔 Enable Mentions')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_mentions_disable')
                        .setLabel('🔕 Disable Mentions')
                        .setStyle(ButtonStyle.Secondary)
                ];
                break;

            case 'dms':
                title = '📨 DM Settings';
                description = 'Receive birthday wishes via direct messages';
                buttons = [
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_dms_enable')
                        .setLabel('📨 Enable DMs')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_dms_disable')
                        .setLabel('📪 Disable DMs')
                        .setStyle(ButtonStyle.Secondary)
                ];
                break;

            case 'celebration':
                title = '🎉 Celebration Style';
                description = 'Choose your preferred birthday celebration style';
                buttons = [
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_celebration_simple')
                        .setLabel('🎂 Simple')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_celebration_party')
                        .setLabel('🎉 Party')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_celebration_quiet')
                        .setLabel('🤫 Quiet')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('birthday_setting_celebration_none')
                        .setLabel('🔇 None')
                        .setStyle(ButtonStyle.Danger)
                ];
                break;
        }

        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        const settingsContainer = new ContainerBuilder()
            .setAccentColor(0x4A90E2)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${title}\n${description}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Click a button to update your setting • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({ 
            components: [settingsContainer, ...rows],
            flags: MessageFlags.IsComponentsV2 
        });
    }

    async handleSettingToggle(interaction) {
        await interaction.deferUpdate();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const settingParts = interaction.customId.split('_');
        const settingType = settingParts[2];
        const settingValue = settingParts[3];

        let updateObject = {};

        switch (settingType) {
            case 'privacy':
                updateObject = {
                    'settings.allowPublicView': settingValue === 'public'
                };
                break;
            case 'mentions':
                updateObject = {
                    'settings.allowMentions': settingValue === 'enable'
                };
                break;
            case 'dms':
                updateObject = {
                    'settings.allowDMs': settingValue === 'enable'
                };
                break;
            case 'celebration':
                updateObject = {
                    'settings.celebrationStyle': settingValue
                };
                break;
        }

        const result = await birthdayController.updateSettings(userId, guildId, updateObject);

        let message = '';
        let color = 0x00FF00;

        if (result.success) {
            switch (settingType) {
                case 'privacy':
                    message = `Privacy set to **${settingValue === 'public' ? 'Public 🌍' : 'Private 🔒'}**`;
                    break;
                case 'mentions':
                    message = `Mentions **${settingValue === 'enable' ? 'Enabled 🔔' : 'Disabled 🔕'}**`;
                    break;
                case 'dms':
                    message = `DM notifications **${settingValue === 'enable' ? 'Enabled 📨' : 'Disabled 📪'}**`;
                    break;
                case 'celebration':
                    const styles = { simple: '🎂 Simple', party: '🎉 Party', quiet: '🤫 Quiet', none: '🔇 None' };
                    message = `Celebration style set to **${styles[settingValue]}**`;
                    break;
            }
        } else {
            message = `❌ Error: ${result.error}`;
            color = 0xFF0000;
        }

        const updateContainer = new ContainerBuilder()
            .setAccentColor(color)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Setting Updated\n${message}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Use /birthday settings to modify other preferences • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({ 
            components: [updateContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }

    async dailyBirthdayCheck() {
        console.log('Running daily birthday check...');
        
        for (const [guildId, guild] of this.client.guilds.cache) {
            try {
                const result = await birthdayController.getTodaysBirthdays(guildId);
                
                if (result.success && result.count > 0) {
                    await this.announceBirthdays(guild, result.birthdays);
                }
            } catch (error) {
                console.error(`Error checking birthdays for guild ${guildId}:`, error);
            }
        }
    }

    async announceBirthdays(guild, birthdays) {
        // 1. Load guild birthday settings
        const guildSettings = await GuildBirthdaySettings.findOne({ guildId: guild.id });
    
        // 2. If no settings exist, skip announcements (require explicit setup)
        if (!guildSettings) {
            console.log(`⏩ Skipping birthdays in ${guild.name} - no birthday system configured`);
            return;
        }
    
        // 3. If settings exist but daily announcements are disabled, skip
        if (guildSettings.settings && guildSettings.settings.enableDailyAnnouncements === false) {
            console.log(`⏩ Skipping birthdays in ${guild.name} - daily announcements disabled`);
            return;
        }
    
        let announcementChannel = null;
    
        // 4. If settings specify a channel, use it if bot can send
        if (guildSettings.settings?.announcementChannelId) {
            const ch = guild.channels.cache.get(guildSettings.settings.announcementChannelId);
            if (ch && ch.isTextBased() && ch.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])) {
                announcementChannel = ch;
            } else {
                console.warn(`⚠ Announcement channel set but invalid or no permissions in ${guild.name}`);
            }
        }
    
        // 5. If still no channel, find by name (only if settings exist and announcements are enabled)
        if (!announcementChannel) {
            const channels = guild.channels.cache
                .filter(channel =>
                    channel.isTextBased() &&
                    (channel.name.includes('birthday') ||
                    channel.name.includes('celebration') ||
                    channel.name.includes('general'))
                );
    
            announcementChannel = channels.find(ch => ch.name.includes('birthday')) ||
                                  channels.find(ch => ch.name.includes('celebration')) ||
                                  channels.find(ch => ch.name.includes('general')) ||
                                  guild.systemChannel;
        }
    
        // 6. If no valid channel, stop
        if (!announcementChannel) {
            console.warn(`⚠ No valid birthday channel found for ${guild.name}`);
            return;
        }
    
        // Rest of your code remains the same...
        const cardGenerator = new BirthdayCardGenerator();
    
        for (const birthday of birthdays) {
            try {
                const user = await guild.members.fetch(birthday.userId);
                const age = birthday.age;
    
                // Generate birthday card
                const cardBuffer = await cardGenerator.generateBirthdayCard({
                    username: user.displayName || user.user.username,
                    age: age,
                    theme: birthday.settings?.celebrationStyle === 'party' ? 'celebration' : 
                           birthday.settings?.celebrationStyle === 'quiet' ? 'elegant' : 'fun',
                    avatarURL: user.user.displayAvatarURL({ format: 'png', size: 256 }),
                    customMessage: guildSettings.settings?.customMessage || 
                        `${guild.name} wishes you the happiest of birthdays! May your special day be filled with joy, laughter, and all your favorite things!`,
                    requesterName: guild.name,
                    zodiacSign: birthday.zodiacSign || null
                });
    
                // Create v2 birthday announcement container
                let birthdayContainer = new ContainerBuilder()
                    .setAccentColor(0xFF1493)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('**🎉 HAPPY BIRTHDAY**')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**🎂 ${user.displayName}**`,
                                `**🎈 ${age ? `Turning ${age} today!` : 'Birthday today!'}**`,
                                `**🎪 Server:** ${guild.name}`,
                                birthday.settings?.allowMentions && guildSettings.settings?.mentionRole ? 
                                    `**🎊 <@&${guildSettings.settings.mentionRole}> celebrating <@${user.id}> 🎊**` : 
                                    birthday.settings?.allowMentions ? `**🎊 <@${user.id}> 🎊**` : ''
                            ].filter(Boolean).join('\n'))
                    );
    
                // Add birthday card if generated successfully
                if (cardBuffer) {
                    birthdayContainer
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder()
                                .addItems(
                                    mediaItem => mediaItem
                                        .setURL('attachment://birthday-card.png')
                                        .setDescription(`${user.displayName} Birthday Card - ${age ? `${age} years old` : 'Special Day'}`)
                                )
                        );
                }
    
                birthdayContainer
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*🎂 Celebrating in ${guild.name} • ${new Date().toLocaleString()}*`)
                    );
    
                // Create celebration buttons
                const celebrationButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('birthday_celebrate')
                            .setLabel('🎉 Celebrate!')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setLabel('View User Profile')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/users/${user.id}`)
                    );
    
                // Create attachment from card buffer
                const messageOptions = {
                    components: [birthdayContainer, celebrationButtons],
                    flags: MessageFlags.IsComponentsV2
                };
    
                if (cardBuffer) {
                    const attachment = new AttachmentBuilder(cardBuffer, { 
                        name: 'birthday-card.png' 
                    });
                    messageOptions.files = [attachment];
                }
    
                // Send the birthday announcement with card
                await announcementChannel.send(messageOptions);
    
                // Mark as celebrated
                await birthdayController.celebrateBirthday(birthday.userId, guild.id);
    
                // Add a small delay between announcements if multiple birthdays
                if (birthdays.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
    
            } catch (error) {
                console.error(`Error processing birthday for user ${birthday.userId}:`, error);
                
                // Fallback: send simple container without card if generation fails
                try {
                    const user = await guild.members.fetch(birthday.userId);
                    const fallbackContainer = new ContainerBuilder()
                        .setAccentColor(0xFF1493)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🎉 Happy Birthday!\nToday we celebrate ${user?.displayName || 'someone special'}! 🎂`)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*Birthday celebration • ${new Date().toLocaleString()}*`)
                        );
    
                    await announcementChannel.send({ 
                        components: [fallbackContainer],
                        flags: MessageFlags.IsComponentsV2 
                    });
                    await birthdayController.celebrateBirthday(birthday.userId, guild.id);
                } catch (fallbackError) {
                    console.error(`Fallback birthday announcement failed:`, fallbackError);
                }
            }
        }
    }
    
    

    async weeklyBirthdayReminder() {
        console.log('Running weekly birthday reminder...');
        
        for (const [guildId, guild] of this.client.guilds.cache) {
            try {
                const result = await birthdayController.getUpcomingBirthdays(guildId, 7);
                
                if (result.success && result.count > 0) {
                    await this.sendWeeklyReminder(guild, result.birthdays);
                }
            } catch (error) {
                console.error(`Error sending weekly reminder for guild ${guildId}:`, error);
            }
        }
    }

    async sendWeeklyReminder(guild, birthdays) {
        const channels = guild.channels.cache
            .filter(channel => 
                channel.isTextBased() && 
                (channel.name.includes('birthday') || 
                 channel.name.includes('general'))
            );
        
        let reminderChannel = channels.find(ch => ch.name.includes('birthday')) ||
                             channels.find(ch => ch.name.includes('general')) ||
                             guild.systemChannel;

        if (!reminderChannel) return;

        const reminderContainer = new ContainerBuilder()
            .setAccentColor(0xFFD700)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📅 Upcoming Birthdays This Week\n${birthdays.length} birthday${birthdays.length > 1 ? 's' : ''} coming up!`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            );

        // Add birthday details
        let birthdayList = '';
        for (const birthday of birthdays.slice(0, 5)) {
            try {
                const user = await guild.members.fetch(birthday.userId);
                const daysUntil = Math.ceil(moment(birthday.adjustedBirthday).diff(moment(), 'days', true));
                
                birthdayList += `**🎂 ${user.displayName}**\n📅 ${moment(birthday.adjustedBirthday).format('dddd, MMMM Do')} (${daysUntil} day${daysUntil !== 1 ? 's' : ''})\n\n`;
            } catch (error) {
                console.error(`Error fetching user ${birthday.userId}:`, error);
            }
        }

        if (birthdayList) {
            reminderContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(birthdayList.trim())
            );
        }

        if (birthdays.length > 5) {
            reminderContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📋 More Birthdays**\nAnd ${birthdays.length - 5} more! Use \`/birthday upcoming\` to see all.`)
            );
        }

        reminderContainer.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Use /birthday upcoming to see more details • ${new Date().toLocaleString()}*`)
        );

        try {
            await reminderChannel.send({ 
                components: [reminderContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        } catch (error) {
            console.error(`Error sending weekly reminder in guild ${guild.id}:`, error);
        }
    }

    async monthlyStatsUpdate() {
        console.log('Running monthly stats update...');
        
        for (const [guildId, guild] of this.client.guilds.cache) {
            try {
                const result = await birthdayController.getGuildStats(guildId);
                
                if (result.success) {
                    await this.sendMonthlyStats(guild, result.stats);
                }
            } catch (error) {
                console.error(`Error updating monthly stats for guild ${guildId}:`, error);
            }
        }
    }

    async sendMonthlyStats(guild, stats) {
        const channels = guild.channels.cache
            .filter(channel => 
                channel.isTextBased() && 
                (channel.name.includes('birthday') || 
                 channel.name.includes('stats'))
            );
        
        let statsChannel = channels.find(ch => ch.name.includes('birthday')) ||
                          channels.find(ch => ch.name.includes('stats'));

        if (!statsChannel) return;

        const currentMonth = moment().format('MMMM YYYY');
        
        const statsContainer = new ContainerBuilder()
            .setAccentColor(0x9370DB)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📊 Monthly Birthday Report - ${currentMonth}\nHere's a summary of birthday activity this month!`)
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
                                `**🎂 Total Birthdays:** ${stats.totalBirthdays || 0}`,
                                `**🎁 Wishes Sent:** ${stats.totalWishes || 0}`,
                                `**🎉 Celebrations:** ${stats.totalCelebrations || 0}`,
                                `**📅 This Month:** ${stats.birthdaysThisMonth || 0}`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(guild.iconURL({ dynamic: true }) || this.client.user.displayAvatarURL())
                            .setDescription(`${guild.name} birthday statistics`)
                    )
            );

        if (stats.mostCommonZodiac) {
            const zodiacEmojis = {
                aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
                leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
                sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
            };
            
            statsContainer.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⭐ Most Common Zodiac:** ${zodiacEmojis[stats.mostCommonZodiac]} ${stats.mostCommonZodiac.charAt(0).toUpperCase() + stats.mostCommonZodiac.slice(1)}`)
            );
        }

        statsContainer.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Thank you for making birthdays special! 🎈 • ${new Date().toLocaleString()}*`)
        );

        try {
            await statsChannel.send({ 
                components: [statsContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        } catch (error) {
            console.error(`Error sending monthly stats in guild ${guild.id}:`, error);
        }
    }

    // Utility method to get birthday notification channels
    async getBirthdayChannels(guild) {
        return guild.channels.cache
            .filter(channel => 
                channel.isTextBased() && 
                channel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])
            )
            .sort((a, b) => {
                // Prioritize birthday-related channels
                if (a.name.includes('birthday') && !b.name.includes('birthday')) return -1;
                if (b.name.includes('birthday') && !a.name.includes('birthday')) return 1;
                if (a.name.includes('general') && !b.name.includes('general')) return -1;
                if (b.name.includes('general') && !a.name.includes('general')) return 1;
                return 0;
            });
    }
}

module.exports = BirthdayHandlers;
