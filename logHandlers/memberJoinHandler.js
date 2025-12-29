const LogConfig = require('../models/serverLogs/LogConfig');
const WelcomeSettings = require('../models/welcome/WelcomeSettings');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { WelcomeCardGenerator } = require('../UI/WelcomeCardGenerator');
const data = require('../UI/banners/welcomecards');
const InviteSettings = require('../models/inviteTracker/inviteSettings');
const Invite = require('../models/inviteTracker/invites');
const VerificationConfig = require('../models/gateVerification/verificationConfig');
const logHandlersIcons = require('../UI/icons/loghandlers');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    MessageFlags
} = require('discord.js');

/**
 * Helper Functions
 */
function getOrdinalSuffix(number) {
    if ([11, 12, 13].includes(number % 100)) return 'th';
    const lastDigit = number % 10;
    return ['st', 'nd', 'rd'][lastDigit - 1] || 'th';
}

function getRandomImage(images) {
    return images[Math.floor(Math.random() * images.length)];
}

function truncateUsername(username, maxLength = 15) {
    return username.length > maxLength ? `${username.slice(0, maxLength)}...` : username;
}

/**
 * Feature-specific handler functions
 */
async function handleVerification(member, verificationConfig) {
    try {
        if (!verificationConfig || !verificationConfig.verificationEnabled) return;
        
        const unverifiedRole = member.guild.roles.cache.get(verificationConfig.unverifiedRoleId);
        if (unverifiedRole) {
            await member.roles.add(unverifiedRole);
            console.log(`✅ Assigned Unverified role to ${member.user.tag}`);
        } else {
            console.log('❌ Unverified role not found.');
        }
    } catch (error) {
        console.error('❌ Error in verification handler:', error);
    }
}

async function handleInviteTracking(client, member) {
    try {
        const guild = member.guild;
        const settings = await InviteSettings.findOne({ guildId: guild.id });
        if (!settings || !settings.status) return;
        
        const newInvites = await guild.invites.fetch();
        const storedInvites = client.invites.get(guild.id) || new Map();
        
        const usedInvite = newInvites.find(inv => storedInvites.has(inv.code) && inv.uses > storedInvites.get(inv.code).uses);
        const inviterId = usedInvite ? usedInvite.inviter.id : null;
        
     
        client.invites.set(guild.id, new Map(newInvites.map(inv => [inv.code, { inviterId: inv.inviter?.id || "Unknown", uses: inv.uses }])));
        
        
        if (inviterId && usedInvite) {
            await Invite.create({
                guildId: guild.id,
                inviterId,
                inviteCode: usedInvite.code,
                uses: usedInvite.uses
            });
        }
        
        
        if (settings.inviteLogChannelId) {
            const channel = guild.channels.cache.get(settings.inviteLogChannelId);
            if (channel) {
                let totalInvites = 0;
                if (inviterId) {
                    const inviteData = await Invite.find({ guildId: guild.id, inviterId });
                    totalInvites = inviteData.length + 1; 
                }
                
                const inviter = inviterId ? `<@${inviterId}>` : "Unknown";
                channel.send(`📩 **Invite Log:** ${member} joined using an invite from ${inviter}. (**Total Invites: ${totalInvites}**)`);
            }
        }
        
        return { usedInvite, inviterId };
    } catch (error) {
        console.error("❌ Error tracking invite:", error);
        return { usedInvite: null, inviterId: null };
    }
}

async function handleMemberJoinLog(client, member) {
    try {
        const { user, guild } = member;
        const guildId = guild.id;
        
        const logConfig = await LogConfig.findOne({ guildId, eventType: 'memberJoin' });
        if (!logConfig?.channelId) return;
        
        const logChannel = client.channels.cache.get(logConfig.channelId);
        if (!logChannel) return;
        
        const logContainer = new ContainerBuilder()
            .setAccentColor(0x00FF00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎉 Member Joined`)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**User**\n${user.tag} (${user.id})\n\n**Joined At**\n${new Date().toLocaleString()}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(user.displayAvatarURL())
                            .setDescription(`Avatar of ${user.tag}`)
                    )
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Logs System • <t:${Math.floor(Date.now() / 1000)}:R>*`)
            );

        await logChannel.send({
            components: [logContainer],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (error) {
        console.error('❌ Error in member join log handler:', error);
    }
}

/**
 * Utility Functions
 */
function truncateUsername(name, maxLength = 15) {
    return name.length > maxLength ? name.slice(0, maxLength - 3) + '...' : name;
}

function getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
}

function getRandomImage(images) {
    return images[Math.floor(Math.random() * images.length)];
}

/**
 * Replace placeholders in text with actual values
 */
function replacePlaceholders(text, data) {
    if (!text) return '';
    return text
        .replace(/\{member\}/g, data.member)
        .replace(/\{username\}/g, data.username)
        .replace(/\{userid\}/g, data.userid)
        .replace(/\{membercount\}/g, data.membercount)
        .replace(/\{suffix\}/g, data.suffix)
        .replace(/\{servername\}/g, data.servername)
        .replace(/\{joindate\}/g, data.joindate)
        .replace(/\{accountcreated\}/g, data.accountcreated);
}

/**
 * Get field value based on field type
 */
function getFieldValue(fieldType, data) {
    switch (fieldType) {
        case 'username': return data.username;
        case 'userid': return data.userid;
        case 'joindate': return data.joindate;
        case 'accountcreated': return data.accountcreated;
        case 'membercount': return `${data.membercount}${data.suffix}`;
        case 'servername': return data.servername;
        case 'none': return 'N/A';
        default: return 'N/A';
    }
}

/**
 * Get thumbnail URL based on type
 */
function getThumbnailURL(type, member) {
    switch (type) {
        case 'userimage': return member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });
        case 'serverimage': return member.guild.iconURL({ format: 'png', dynamic: true, size: 256 });
        case 'none': return null;
        default: return member.guild.iconURL({ format: 'png', dynamic: true, size: 256 });
    }
}

/**
 * Create Welcome DM Embed
 */
function createWelcomeDMEmbed(member, dmConfig = {}) {
    const user = member.user;
    const username = truncateUsername(user.username, 15);
    const serverIcon = member.guild.iconURL({ format: 'png', dynamic: true, size: 256 });

    // Data object for placeholder replacement
    const placeholderData = {
        username: username,
        servername: member.guild.name
    };

    // Default DM configuration
    const defaultConfig = {
        title: 'Welcome to the Server!',
        description: 'Welcome {username}! Thanks for joining {servername}!',
        color: '#00e5ff',
        footer: { text: 'Enjoy your stay!', iconURL: '' },
        thumbnail: { type: 'userimage' },
        image: { useWcard: false, customURL: '' }
    };

    // Merge with provided config
    const config = {
        title: dmConfig.title || defaultConfig.title,
        description: dmConfig.description || defaultConfig.description,
        color: dmConfig.color || defaultConfig.color,
        footer: { ...defaultConfig.footer, ...dmConfig.footer },
        thumbnail: dmConfig.thumbnail || defaultConfig.thumbnail,
        image: { ...defaultConfig.image, ...dmConfig.image }
    };

    const dmEmbed = new EmbedBuilder()
        .setTitle(replacePlaceholders(config.title, placeholderData))
        .setDescription(replacePlaceholders(config.description, placeholderData))
        .setColor(config.color)
        .setTimestamp();

    // Set footer
    const footerConfig = {
        text: replacePlaceholders(config.footer.text, placeholderData)
    };
    if (config.footer.iconURL) {
        footerConfig.iconURL = config.footer.iconURL || serverIcon;
    } else {
        footerConfig.iconURL = serverIcon;
    }
    dmEmbed.setFooter(footerConfig);

    // Set thumbnail
    const thumbnailURL = getThumbnailURL(config.thumbnail.type, member);
    if (thumbnailURL) dmEmbed.setThumbnail(thumbnailURL);

    // Set custom image if specified and not using Wcard
    if (!config.image.useWcard && config.image.customURL) {
        dmEmbed.setImage(config.image.customURL);
    }

    return dmEmbed;
}

/**
 * Handle Welcome Channel Messages
 */
async function handleWelcomeChannel(member, welcomeSettings) {
    try {
        if (!welcomeSettings?.channelStatus || !welcomeSettings.welcomeChannelId) return;

        const welcomeChannel = member.guild.channels.cache.get(welcomeSettings.welcomeChannelId);
        if (!welcomeChannel) return;

        const user = member.user;
        const memberCount = member.guild.memberCount;
        const suffix = getOrdinalSuffix(memberCount);
        const username = truncateUsername(user.username, 15);
        const joinDate = member.joinedAt.toDateString();
        const creationDate = user.createdAt.toDateString();
        const serverIcon = member.guild.iconURL({ format: 'png', dynamic: true, size: 256 });

        // Data object for placeholder replacement
        const placeholderData = {
            member: member.toString(),
            username: username,
            userid: user.id,
            membercount: memberCount,
            suffix: suffix,
            servername: member.guild.name,
            joindate: joinDate,
            accountcreated: creationDate
        };

        // Get embed configuration (use defaults if not set)
        const embedConfig = welcomeSettings.channelEmbed || {};
        const defaultConfig = {
            title: 'Welcome!',
            description: '{member}, You are the **{membercount}{suffix}** member of our server!',
            color: '#00e5ff',
            author: { name: '', iconURL: '', url: '' },
            footer: { text: "We're glad to have you here!", iconURL: '' },
            thumbnail: { type: 'serverimage' },
            image: { useWcard: true, customURL: '' },
            fields: [
                { name: 'Username', value: 'username', inline: true },
                { name: 'Join Date', value: 'joindate', inline: true },
                { name: 'Account Created', value: 'accountcreated', inline: true }
            ]
        };

        // Merge with defaults
        const config = {
            title: embedConfig.title || defaultConfig.title,
            description: embedConfig.description || defaultConfig.description,
            color: embedConfig.color || defaultConfig.color,
            author: { ...defaultConfig.author, ...embedConfig.author },
            footer: { ...defaultConfig.footer, ...embedConfig.footer },
            thumbnail: embedConfig.thumbnail || defaultConfig.thumbnail,
            image: { ...defaultConfig.image, ...embedConfig.image },
            fields: embedConfig.fields || defaultConfig.fields
        };

        // Create embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(replacePlaceholders(config.title, placeholderData))
            .setDescription(replacePlaceholders(config.description, placeholderData))
            .setColor(config.color)
            .setTimestamp();

        // Set author if provided
        if (config.author.name) {
            const authorConfig = {
                name: replacePlaceholders(config.author.name, placeholderData)
            };
            if (config.author.iconURL) authorConfig.iconURL = replacePlaceholders(config.author.iconURL, placeholderData) || user.displayAvatarURL();
            if (config.author.url) authorConfig.url = config.author.url;
            welcomeEmbed.setAuthor(authorConfig);
        }

        // Set footer
        const footerConfig = {
            text: replacePlaceholders(config.footer.text, placeholderData)
        };
        if (config.footer.iconURL) {
            footerConfig.iconURL = config.footer.iconURL || serverIcon;
        } else {
            footerConfig.iconURL = serverIcon;
        }
        welcomeEmbed.setFooter(footerConfig);

        // Set thumbnail
        const thumbnailURL = getThumbnailURL(config.thumbnail.type, member);
        if (thumbnailURL) welcomeEmbed.setThumbnail(thumbnailURL);

        // Add fields - COMPLETION OF THE CUT-OFF CODE
        config.fields.forEach(field => {
            if (field.value !== 'none' && field.name) {
                const fieldValue = getFieldValue(field.value, placeholderData);
                welcomeEmbed.addFields({
                    name: field.name,
                    value: fieldValue,
                    inline: field.inline !== undefined ? field.inline : true
                });
            }
        });

        // Handle image/attachment
        let attachment = null;
        let messageOptions = {
            content: `Hey ${member}!`,
            embeds: [welcomeEmbed]
        };

        if (config.image.useWcard) {
            try {
                 const cardGen = new WelcomeCardGenerator();
        
                // Generate the welcome card (isLeave: false)
                const cardBuffer = await cardGen.generate({
                    username,
                    serverName: member.guild.name,
                    memberCount,
                    avatarURL: user.displayAvatarURL({ format: 'png', size: 256 }),
                    isLeave: false
                });
        
                attachment = new AttachmentBuilder(cardBuffer, { name: 'welcome.png' });
        
                welcomeEmbed.setImage('attachment://welcome.png');
                messageOptions.files = [attachment];
            } catch (customCardError) {
                console.warn('❌ Error generating custom welcome card, falling back to custom image:', customCardError);
                if (config.image.customURL) {
                    welcomeEmbed.setImage(config.image.customURL);
                }
            }
        } else if (config.image.customURL) {
            welcomeEmbed.setImage(config.image.customURL);
        }
        

        // Send the welcome message
        await welcomeChannel.send(messageOptions);

    } catch (error) {
        console.error('❌ Error in welcome channel handler:', error);
    }
}

/**
 * Handle Welcome DM Messages
 */
async function handleWelcomeDM(member, welcomeSettings) {
    try {
        if (!welcomeSettings?.dmStatus) return;
        
        const dmEmbed = createWelcomeDMEmbed(member, welcomeSettings.dmEmbed);
        await member.user.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.warn(`❌ Failed to send DM to ${member.user.tag}:`, error.message);
    }
}
/**
 * Main Member Join Handler
 */
module.exports = async function memberJoinHandler(client) {
    client.on('guildMemberAdd', async (member) => {
        try {
            const guildId = member.guild.id;
            
            // Fetch all needed configuration in parallel to improve performance
            const [
                welcomeSettings, 
                verificationConfig
            ] = await Promise.all([
                WelcomeSettings.findOne({ serverId: guildId }),
                VerificationConfig.findOne({ guildId })
            ]);

 
            await Promise.allSettled([
            
                handleVerification(member, verificationConfig),
                
             
                handleInviteTracking(client, member),
                
             
                handleMemberJoinLog(client, member),
                
                
                handleWelcomeChannel(member, welcomeSettings),
                
                
                handleWelcomeDM(member, welcomeSettings)
            ]);
            
        } catch (error) {
            console.error('❌ Error in member join handler:', error);
        }
    });
};