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

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const birthdayController = require('../../models/birthday/Controller');
const moment = require('moment-timezone');

const ZODIAC_EMOJIS = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
    leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
    sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
};

const CELEBRATION_STYLES = {
    simple: '🎂 Simple celebration',
    party: '🎉 Party mode',
    quiet: '🤫 Quiet celebration',
    none: '🔇 No celebration'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('🎂 Advanced birthday management system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set your birthday with advanced options')
                .addStringOption(option =>
                    option.setName('date')
                        .setDescription('Birthday (MM-DD-YYYY, MM-DD, DD/MM/YYYY, etc.)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('timezone')
                        .setDescription('Your timezone (e.g., America/New_York)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('private')
                        .setDescription('Keep your birthday private')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check birthday information')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check (leave empty for yourself)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('upcoming')
                .setDescription('View upcoming birthdays')
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Days ahead to check (1-365)')
                        .setMinValue(1)
                        .setMaxValue(365)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('today')
                .setDescription('Check today\'s birthdays'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('wish')
                .setDescription('Send a birthday wish')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to wish happy birthday')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Your birthday message')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('anonymous')
                        .setDescription('Send wish anonymously')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Manage your birthday settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View server birthday statistics'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('zodiac')
                .setDescription('View birthdays by zodiac sign')
                .addStringOption(option =>
                    option.setName('sign')
                        .setDescription('Zodiac sign to filter by')
                        .setRequired(true)
                        .addChoices(
                            { name: '♈ Aries', value: 'aries' },
                            { name: '♉ Taurus', value: 'taurus' },
                            { name: '♊ Gemini', value: 'gemini' },
                            { name: '♋ Cancer', value: 'cancer' },
                            { name: '♌ Leo', value: 'leo' },
                            { name: '♍ Virgo', value: 'virgo' },
                            { name: '♎ Libra', value: 'libra' },
                            { name: '♏ Scorpio', value: 'scorpio' },
                            { name: '♐ Sagittarius', value: 'sagittarius' },
                            { name: '♑ Capricorn', value: 'capricorn' },
                            { name: '♒ Aquarius', value: 'aquarius' },
                            { name: '♓ Pisces', value: 'pisces' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('View birthday leaderboard (most wishes received)'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your birthday from the system')),

    async execute(interaction) {
        await interaction.deferReply();
        
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'set':
                    await this.handleSetBirthday(interaction, userId, guildId);
                    break;
                case 'check':
                    await this.handleCheckBirthday(interaction, userId, guildId);
                    break;
                case 'upcoming':
                    await this.handleUpcomingBirthdays(interaction, guildId);
                    break;
                case 'today':
                    await this.handleTodaysBirthdays(interaction, guildId);
                    break;
                case 'wish':
                    await this.handleBirthdayWish(interaction, userId, guildId);
                    break;
                case 'settings':
                    await this.handleSettings(interaction, userId, guildId);
                    break;
                case 'stats':
                    await this.handleStats(interaction, guildId);
                    break;
                case 'zodiac':
                    await this.handleZodiac(interaction, guildId);
                    break;
                case 'leaderboard':
                    await this.handleLeaderboard(interaction, guildId);
                    break;
                case 'remove':
                    await this.handleRemoveBirthday(interaction, userId, guildId);
                    break;
            }
        } catch (error) {
            console.error('Birthday command error:', error);
            await interaction.editReply({
                embeds: [this.createErrorEmbed('An unexpected error occurred. Please try again later.')]
            });
        }
    },

    async handleSetBirthday(interaction, userId, guildId) {
        const date = interaction.options.getString('date');
        const timezone = interaction.options.getString('timezone') || 'UTC';
        const isPrivate = interaction.options.getBoolean('private') || false;

        const options = {
            settings: {
                allowPublicView: !isPrivate,
                allowMentions: true,
                allowDMs: false,
                celebrationStyle: 'simple'
            }
        };

        const result = await birthdayController.setBirthday(userId, guildId, date, timezone, options);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle('🎂 Birthday Set Successfully!')
            .setDescription(`Your birthday has been set to **${moment(result.birthday.birthday).format('MMMM Do')}**`)
            .addFields(
                { name: '🎂 Age', value: result.birthday.age ? `${result.birthday.age} years old` : 'Not calculated', inline: true },
                { name: '⏰ Timezone', value: result.birthday.timezone, inline: true },
                { name: '♈ Zodiac Sign', value: `${ZODIAC_EMOJIS[result.birthday.zodiacSign] || '❓'} ${result.birthday.zodiacSign?.charAt(0).toUpperCase() + result.birthday.zodiacSign?.slice(1) || 'Unknown'}`, inline: true },
                { name: '📅 Days Until Birthday', value: `${result.birthday.daysUntilBirthday} days`, inline: true },
                { name: '👁️ Privacy', value: isPrivate ? '🔒 Private' : '🌍 Public', inline: true }
            )
            .setFooter({ text: `Use /birthday settings to customize your birthday preferences` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleCheckBirthday(interaction, userId, guildId) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const result = await birthdayController.getBirthday(targetUser.id, guildId);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        const birthday = result.birthday;
        const birthdayDate = moment(birthday.birthday);
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`🎂 ${targetUser.username}'s Birthday`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '📅 Birthday', value: birthdayDate.format('MMMM Do'), inline: true },
                { name: '🎂 Age', value: result.age ? `${result.age} years old` : 'Not calculated', inline: true },
                { name: '⏰ Timezone', value: birthday.timezone, inline: true },
                { name: '♈ Zodiac Sign', value: `${ZODIAC_EMOJIS[result.zodiacSign] || '❓'} ${result.zodiacSign?.charAt(0).toUpperCase() + result.zodiacSign?.slice(1) || 'Unknown'}`, inline: true },
                { name: '📅 Days Until Birthday', value: `${result.daysUntil} days`, inline: true },
                { name: '🎁 Total Wishes', value: `${birthday.stats.totalWishes}`, inline: true }
            )
            .setFooter({ text: `Last celebrated: ${birthday.stats.lastCelebrated ? moment(birthday.stats.lastCelebrated).format('MMMM Do, YYYY') : 'Never'}` })
            .setTimestamp();

        if (birthday.wishes.length > 0 && targetUser.id === userId) {
            const recentWishes = birthday.wishes.slice(-3).map(wish => 
                `${wish.isAnonymous ? '🕵️ Anonymous' : `<@${wish.fromUserId}>`}: ${wish.message}`
            ).join('\n');
            embed.addFields({ name: '💌 Recent Wishes', value: recentWishes || 'No wishes yet', inline: false });
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleUpcomingBirthdays(interaction, guildId) {
        const days = interaction.options.getInteger('days') || 30;
        const result = await birthdayController.getUpcomingBirthdays(guildId, days);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        if (result.count === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('📅 No Upcoming Birthdays')
                    .setDescription(`No birthdays found in the next ${days} days.`)]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle(`🎉 Upcoming Birthdays (${days} days)`)
            .setDescription(`Found ${result.count} upcoming birthday${result.count > 1 ? 's' : ''}!`)
            .setTimestamp();

        for (const birthday of result.birthdays.slice(0, 10)) {
            try {
                const user = await interaction.client.users.fetch(birthday.userId);
                const birthdayMoment = moment(birthday.adjustedBirthday);
                const daysUntil = Math.ceil(moment(birthday.adjustedBirthday).diff(moment(), 'days', true));
                
                embed.addFields({
                    name: `${ZODIAC_EMOJIS[birthday.zodiacSign] || '🎂'} ${user.username}`,
                    value: `📅 ${birthdayMoment.format('MMMM Do')} (${daysUntil} day${daysUntil !== 1 ? 's' : ''})`,
                    inline: true
                });
            } catch (error) {
                console.error(`Error fetching user ${birthday.userId}:`, error);
            }
        }

        if (result.count > 10) {
            embed.setFooter({ text: `Showing first 10 of ${result.count} upcoming birthdays` });
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleTodaysBirthdays(interaction, guildId) {
        const result = await birthdayController.getTodaysBirthdays(guildId);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        if (result.count === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('🎂 No Birthdays Today')
                    .setDescription('No one has a birthday today. Check back tomorrow!')]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF1493')
            .setTitle('🎉 Today\'s Birthday Celebrations!')
            .setDescription(`🎂 ${result.count} birthday${result.count > 1 ? 's' : ''} today!`)
            .setTimestamp();

        for (const birthday of result.birthdays) {
            try {
                const user = await interaction.client.users.fetch(birthday.userId);
                const age = birthday.age;
                
                embed.addFields({
                    name: `🎂 ${user.username}`,
                    value: `${age ? `Turning ${age} today!` : 'Birthday today!'} ${ZODIAC_EMOJIS[birthday.zodiacSign] || '🎈'}`,
                    inline: false
                });

             
                await birthdayController.celebrateBirthday(birthday.userId, guildId);
            } catch (error) {
                console.error(`Error fetching user ${birthday.userId}:`, error);
            }
        }

        const celebrateButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('birthday_celebrate')
                    .setLabel('🎉 Celebrate!')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.editReply({ embeds: [embed], components: [celebrateButton] });
    },

    async handleBirthdayWish(interaction, userId, guildId) {
        const targetUser = interaction.options.getUser('user');
        const message = interaction.options.getString('message');
        const isAnonymous = interaction.options.getBoolean('anonymous') || false;

        if (targetUser.id === userId) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed('You cannot send a birthday wish to yourself!')]
            });
        }

        const result = await birthdayController.addWish(targetUser.id, guildId, userId, message, isAnonymous);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🎁 Birthday Wish Sent!')
            .setDescription(`Your ${isAnonymous ? 'anonymous ' : ''}birthday wish has been sent to ${targetUser.username}!`)
            .addFields({ name: '💌 Your Message', value: message })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

 
        try {
            const birthdayResult = await birthdayController.getBirthday(targetUser.id, guildId);
            if (birthdayResult.success && birthdayResult.birthday.settings.allowDMs) {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF69B4')
                    .setTitle('🎁 You received a birthday wish!')
                    .setDescription(`Someone sent you a birthday wish in **${interaction.guild.name}**!`)
                    .addFields({ 
                        name: '💌 Message', 
                        value: message,
                        inline: false 
                    })
                    .addFields({ 
                        name: '👤 From', 
                        value: isAnonymous ? '🕵️ Anonymous' : interaction.user.username,
                        inline: true 
                    })
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            }
        } catch (error) {
            console.log(`Could not DM user ${targetUser.username}: ${error.message}`);
        }
    },

    async handleSettings(interaction, userId, guildId) {
        const result = await birthdayController.getBirthday(userId, guildId);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed('You need to set your birthday first using `/birthday set`')]
            });
        }

        const birthday = result.birthday;
        const settings = birthday.settings;

        const settingsMenu = new StringSelectMenuBuilder()
            .setCustomId('birthday_settings')
            .setPlaceholder('Choose a setting to modify')
            .addOptions([
                {
                    label: 'Privacy Settings',
                    description: `Currently: ${settings.allowPublicView ? 'Public' : 'Private'}`,
                    value: 'privacy',
                    emoji: settings.allowPublicView ? '🌍' : '🔒'
                },
                {
                    label: 'Mention Preferences',
                    description: `Currently: ${settings.allowMentions ? 'Enabled' : 'Disabled'}`,
                    value: 'mentions',
                    emoji: settings.allowMentions ? '🔔' : '🔕'
                },
                {
                    label: 'DM Notifications',
                    description: `Currently: ${settings.allowDMs ? 'Enabled' : 'Disabled'}`,
                    value: 'dms',
                    emoji: settings.allowDMs ? '📨' : '📪'
                },
                {
                    label: 'Celebration Style',
                    description: `Currently: ${CELEBRATION_STYLES[settings.celebrationStyle]}`,
                    value: 'celebration',
                    emoji: '🎉'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(settingsMenu);

        const embed = new EmbedBuilder()
            .setColor('#4A90E2')
            .setTitle('⚙️ Birthday Settings')
            .setDescription('Customize your birthday preferences using the dropdown below.')
            .addFields(
                { name: '🌍 Privacy', value: settings.allowPublicView ? 'Public' : 'Private', inline: true },
                { name: '🔔 Mentions', value: settings.allowMentions ? 'Enabled' : 'Disabled', inline: true },
                { name: '📨 DM Notifications', value: settings.allowDMs ? 'Enabled' : 'Disabled', inline: true },
                { name: '🎉 Celebration Style', value: CELEBRATION_STYLES[settings.celebrationStyle], inline: false }
            )
            .setFooter({ text: 'Settings are saved automatically when changed' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [row] });
    },

    async handleStats(interaction, guildId) {
        const result = await birthdayController.getGuildStats(guildId);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        const stats = result.stats;
        
        const embed = new EmbedBuilder()
            .setColor('#9370DB')
            .setTitle(`📊 Birthday Statistics for ${interaction.guild.name}`)
            .addFields(
                { name: '🎂 Total Birthdays', value: `${stats.totalBirthdays || 0}`, inline: true },
                { name: '🎁 Total Wishes', value: `${stats.totalWishes || 0}`, inline: true },
                { name: '🎉 Total Celebrations', value: `${stats.totalCelebrations || 0}`, inline: true },
                { name: '📅 This Month', value: `${stats.birthdaysThisMonth || 0}`, inline: true },
                { name: '♈ Most Common Zodiac', value: stats.mostCommonZodiac ? `${ZODIAC_EMOJIS[stats.mostCommonZodiac]} ${stats.mostCommonZodiac.charAt(0).toUpperCase() + stats.mostCommonZodiac.slice(1)}` : 'None', inline: true }
            )
            .setFooter({ text: `Server statistics as of ${new Date().toLocaleDateString()}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async handleZodiac(interaction, guildId) {
        const zodiacSign = interaction.options.getString('sign');
        const result = await birthdayController.getBirthdaysByZodiac(guildId, zodiacSign);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        if (result.count === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(`${ZODIAC_EMOJIS[zodiacSign]} No ${zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)} Birthdays`)
                    .setDescription(`No users found with the zodiac sign ${zodiacSign}.`)]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#DA70D6')
            .setTitle(`${ZODIAC_EMOJIS[zodiacSign]} ${zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)} Birthdays`)
            .setDescription(`Found ${result.count} user${result.count > 1 ? 's' : ''} with this zodiac sign!`)
            .setTimestamp();

        for (const birthday of result.birthdays.slice(0, 10)) {
            try {
                const user = await interaction.client.users.fetch(birthday.userId);
                const birthdayDate = moment(birthday.birthday);
                
                embed.addFields({
                    name: `🎂 ${user.username}`,
                    value: `📅 ${birthdayDate.format('MMMM Do')} (${birthday.age ? birthday.age + ' years old' : 'Age unknown'})`,
                    inline: true
                });
            } catch (error) {
                console.error(`Error fetching user ${birthday.userId}:`, error);
            }
        }

        if (result.count > 10) {
            embed.setFooter({ text: `Showing first 10 of ${result.count} ${zodiacSign} birthdays` });
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleLeaderboard(interaction, guildId) {
        const result = await birthdayController.getBirthdayLeaderboard(guildId);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        if (result.leaderboard.length === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('🏆 No Birthday Data')
                    .setDescription('No birthday data available for leaderboard.')]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Birthday Leaderboard')
            .setDescription('Users with the most birthday wishes received!')
            .setTimestamp();

        const medals = ['🥇', '🥈', '🥉'];
        
        for (let i = 0; i < result.leaderboard.length && i < 10; i++) {
            const birthday = result.leaderboard[i];
            try {
                const user = await interaction.client.users.fetch(birthday.userId);
                const medal = i < 3 ? medals[i] : `**${i + 1}.**`;
                const zodiacEmoji = ZODIAC_EMOJIS[birthday.zodiacSign] || '🎂';
                
                embed.addFields({
                    name: `${medal} ${user.username}`,
                    value: `${zodiacEmoji} ${birthday.stats.totalWishes} wish${birthday.stats.totalWishes !== 1 ? 'es' : ''}`,
                    inline: true
                });
            } catch (error) {
                console.error(`Error fetching user ${birthday.userId}:`, error);
            }
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleRemoveBirthday(interaction, userId, guildId) {
        const result = await birthdayController.removeBirthday(userId, guildId);

        if (!result.success) {
            return interaction.editReply({
                embeds: [this.createErrorEmbed(result.error)]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF4444')
            .setTitle('🗑️ Birthday Removed')
            .setDescription('Your birthday has been successfully removed from the system.')
            .setFooter({ text: 'You can set it again anytime using /birthday set' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    createErrorEmbed(message) {
        return new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Error')
            .setDescription(message)
            .setTimestamp();
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