// handlers/boostHandler.js
const BoostSettings = require('../models/boost/BoostSettings');
const { 
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

/**
 * Replace placeholders in text with actual values
 */
function replacePlaceholders(text, data) {
    if (!text) return '';
    return text
        .replace(/\{username\}/g, data.username)
        .replace(/\{servername\}/g, data.servername)
        .replace(/\{boostlevel\}/g, data.boostlevel)
        .replace(/\{boostcount\}/g, data.boostcount);
}

/**
 * Handle boost notifications using Display Components v2
 */
async function handleBoostNotification(oldMember, newMember, isBoost) {
    try {
        const guild = newMember.guild;
        const boostSettings = await BoostSettings.findOne({ serverId: guild.id });
        
        if (!boostSettings?.boostStatus || !boostSettings.boostChannelId) return;
        
        const boostChannel = guild.channels.cache.get(boostSettings.boostChannelId);
        if (!boostChannel) return;

        const user = newMember.user;
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Data for placeholders
        const placeholderData = {
            username: user.username,
            servername: guild.name,
            boostlevel: boostLevel,
            boostcount: boostCount
        };

        const components = [];

        if (isBoost) {
            // Someone started boosting - Display Components v2
            const message = replacePlaceholders(boostSettings.boostMessage, placeholderData);
            
            const boostContainer = new ContainerBuilder()
                .setAccentColor(0xf47fff);

            boostContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🚀 Server Boosted!\n## ${guild.name} Level Up!\n\n> ${message || `Thank you ${user.username} for boosting our server!`}\n> Your support helps make our community amazing!`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(user.displayAvatarURL({ dynamic: true, size: 256 }))
                            .setDescription(`${user.username} avatar`)
                    )
            );

            components.push(boostContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xe91e63);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '## 📊 **Boost Statistics**',
                        '',
                        `**🎯 Booster**`,
                        `${user.tag}`,
                        '',
                        `**⭐ Server Level**`,
                        `Level ${boostLevel} ${getBoostLevelEmoji(boostLevel)}`,
                        '',
                        `**🔥 Total Boosts**`,
                        `${boostCount} boosts`,
                        '',
                        `**💎 Boost Benefits**`,
                        getBoostBenefits(boostLevel)
                    ].join('\n'))
            );

            components.push(statsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const thankYouContainer = new ContainerBuilder()
                .setAccentColor(0x00ff88);

            thankYouContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '## 💖 **Thank You!**',
                        '',
                        '> Your boost helps unlock amazing server features',
                        '> and supports our growing community!',
                        '',
                        `**Boosted:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                        `**Server:** ${guild.name}`,
                        '',
                        '*We truly appreciate your support! 🎉*'
                    ].join('\n'))
            );

            components.push(thankYouContainer);

        } else {
            // Someone stopped boosting - Display Components v2
            const message = replacePlaceholders(boostSettings.removeMessage, placeholderData);
            
            const removeContainer = new ContainerBuilder()
                .setAccentColor(0xff6b6b);

            removeContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 😢 Boost Removed\n## ${guild.name} Boost Update\n\n> ${message || `${user.username} is no longer boosting our server.`}\n> We hope they'll boost again soon!`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(user.displayAvatarURL({ dynamic: true, size: 256 }))
                            .setDescription(`${user.username} avatar`)
                    )
            );

            components.push(removeContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const updatedStatsContainer = new ContainerBuilder()
                .setAccentColor(0x95a5a6);

            updatedStatsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '## 📊 **Updated Statistics**',
                        '',
                        `**👤 User**`,
                        `${user.tag}`,
                        '',
                        `**⭐ Current Server Level**`,
                        `Level ${boostLevel} ${getBoostLevelEmoji(boostLevel)}`,
                        '',
                        `**🔥 Remaining Boosts**`,
                        `${boostCount} boosts`,
                        '',
                        `**💭 Message**`,
                        `We hope they boost again soon!`
                    ].join('\n'))
            );

            components.push(updatedStatsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const hopefulContainer = new ContainerBuilder()
                .setAccentColor(0xf39c12);

            hopefulContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '## 🤞 **Come Back Soon!**',
                        '',
                        '> Every boost helps our server grow and unlock features',
                        '> We appreciate all the support we can get!',
                        '',
                        `**Boost Removed:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                        `**Server:** ${guild.name}`,
                        '',
                        '*Thank you for your past support! 💙*'
                    ].join('\n'))
            );

            components.push(hopefulContainer);
        }

        // Send with Display Components v2
        await boostChannel.send({
            components: components,
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('❌ Error in boost notification handler:', error);
    }
}

/**
 * Get boost level emoji
 */
function getBoostLevelEmoji(level) {
    switch (level) {
        case 0: return '🥉';
        case 1: return '🥈';
        case 2: return '🥇';
        case 3: return '💎';
        default: return '⭐';
    }
}

/**
 * Get boost benefits text
 */
function getBoostBenefits(level) {
    const benefits = {
        0: 'Basic server features',
        1: '• 128kbps audio quality\n• Custom server invite background\n• Animated server icon',
        2: '• 256kbps audio quality\n• Server banner\n• 50MB upload limit\n• Custom emojis: 100\n• Custom stickers: 15',
        3: '• 384kbps audio quality\n• Vanity URL\n• 100MB upload limit\n• Custom emojis: 250\n• Custom stickers: 60'
    };
    
    return benefits[level] || benefits[0];
}

/**
 * Main boost handler - unchanged functionality
 */
module.exports = function boostHandler(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        try {
            // Check if boost status changed - same logic as before
            const oldBoost = oldMember.premiumSince;
            const newBoost = newMember.premiumSince;

            if (!oldBoost && newBoost) {
                // User started boosting
                await handleBoostNotification(oldMember, newMember, true);
            } else if (oldBoost && !newBoost) {
                // User stopped boosting
                await handleBoostNotification(oldMember, newMember, false);
            }

        } catch (error) {
            console.error('❌ Error in boost handler:', error);
        }
    });
};
