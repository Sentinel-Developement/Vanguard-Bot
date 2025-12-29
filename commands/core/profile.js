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
    AttachmentBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MessageFlags
} = require('discord.js');
const UserProfile = require('../../models/profile/UserProfile');
const { ProfileCardGenerator } = require('../../UI/ProfileCardGenerator');
const path = require('path');

// Component limits
const MAX_BUTTONS_PER_ROW = 5;
const MAX_ROWS = 4;

const platformCategories = {
    gaming: ['steam', 'epic', 'riot', 'minecraft', 'xbox', 'playstation', 'nintendo', 'battlenet', 'fortnite'],
    social: ['youtube', 'twitch', 'instagram', 'twitter', 'facebook', 'linkedin', 'github', 'reddit', 'snapchat'],
    content: ['website', 'portfolio'],
    other: ['spotify', 'soundcloud', 'pinterest', 'telegram', 'whatsapp']
};

const platformEmojis = {
    steam: '🛠️', epic: '🎮', riot: '🔴', minecraft: '⛏️', xbox: '🎯', playstation: '🎮',
    nintendo: '🎮', battlenet: '⚔️', fortnite: '🏆',
    youtube: '📺', twitch: '🟣', instagram: '📸', twitter: '🐦', facebook: '📘',
    tiktok: '🎵', linkedin: '💼', github: '💻', reddit: '🔶', snapchat: '👻',
    website: '🌐', portfolio: '💼',
    spotify: '🎵', soundcloud: '🎧', pinterest: '📌', telegram: '✈️', whatsapp: '💬'
};

// Platform URL generators
const platformUrlGenerators = {
    steam: (data) => data.profileUrl || `https://steamcommunity.com/id/${data.username}`,
    epic: (data) => data.profileUrl || `https://fortnitetracker.com/profile/all/${data.username}`,
    riot: (data) => data.profileUrl || `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(data.riotId)}`,
    minecraft: (data) => data.profileUrl || `https://namemc.com/profile/${data.username}`,
    xbox: (data) => data.profileUrl || `https://account.xbox.com/en-us/profile?gamertag=${data.gamertag}`,
    playstation: (data) => data.profileUrl || `https://psnprofiles.com/${data.psnId}`,
    nintendo: (data) => data.profileUrl || `https://nintendo.com`,
    battlenet: (data) => data.profileUrl || `https://worldofwarcraft.com`,
    fortnite: (data) => data.profileUrl || `https://fortnitetracker.com/profile/all/${data.epicName}`,
    
    // Social - Fixed to match schema
    youtube: (data) => data.channelUrl || `https://youtube.com/@${data.channelName}`,
    twitch: (data) => data.profileUrl || `https://twitch.tv/${data.username}`,
    instagram: (data) => data.profileUrl || `https://instagram.com/${data.username}`,
    twitter: (data) => data.profileUrl || `https://twitter.com/${data.username}`,
    facebook: (data) => data.profileUrl || `https://facebook.com`,
    linkedin: (data) => data.profileUrl || `https://linkedin.com`,
    github: (data) => data.profileUrl || `https://github.com/${data.username}`,
    reddit: (data) => data.profileUrl || `https://reddit.com/user/${data.username}`,
    snapchat: (data) => data.profileUrl || `https://snapchat.com`,
    
    // Content
    website: (data) => data.url,
    portfolio: (data) => data.url,
    
    // Other
    spotify: (data) => data.profileUrl || `https://open.spotify.com/user/${data.displayName}`,
    soundcloud: (data) => data.profileUrl || `https://soundcloud.com/${data.username}`,
    pinterest: (data) => data.profileUrl || `https://pinterest.com/${data.username}`,
    telegram: (data) => data.profileUrl || `https://t.me/${data.username}`,
    whatsapp: (data) => data.profileUrl || `https://wa.me/${data.number}`
};

function paginateButtons(buttons) {
    const rows = [];
    for (let i = 0; i < buttons.length; i += MAX_BUTTONS_PER_ROW) {
        const row = new ActionRowBuilder()
            .addComponents(...buttons.slice(i, i + MAX_BUTTONS_PER_ROW));
        rows.push(row);
        if (rows.length >= MAX_ROWS) break;
    }
    return rows;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Manage your complete Discord profile')
        
        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('View your or someone else\'s profile')
            .addUserOption(opt => opt
                .setName('user')
                .setDescription('User to view profile of')
                .setRequired(false)))
                
        .addSubcommand(sub => sub
            .setName('bio')
            .setDescription('Set your profile bio')
            .addStringOption(opt => opt
                .setName('text')
                .setDescription('Your bio text (max 500 characters)')
                .setRequired(true)))
                
        .addSubcommand(sub => sub
            .setName('banner')
            .setDescription('Set your profile banner')
            .addStringOption(opt => opt
                .setName('url')
                .setDescription('Banner image URL')
                .setRequired(true)))
                
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Add a platform account')
            .addStringOption(opt => opt
                .setName('platform')
                .setDescription('Platform to add')
                .setRequired(true)
                .addChoices(
                    { name: '🛠️ Steam', value: 'steam' },
                    { name: '🎮 Epic Games', value: 'epic' },
                    { name: '🔴 Riot Games', value: 'riot' },
                    { name: '⛏️ Minecraft', value: 'minecraft' },
                    { name: '🎯 Xbox', value: 'xbox' },
                    { name: '🎮 PlayStation', value: 'playstation' },
                    { name: '🎮 Nintendo', value: 'nintendo' },
                    { name: '⚔️ Battle.net', value: 'battlenet' },
                    { name: '🏆 Fortnite', value: 'fortnite' },
                    { name: '📺 YouTube', value: 'youtube' },
                    { name: '🟣 Twitch', value: 'twitch' },
                    { name: '📸 Instagram', value: 'instagram' },
                    { name: '🐦 Twitter', value: 'twitter' },
                    { name: '📘 Facebook', value: 'facebook' },
                    { name: '💼 LinkedIn', value: 'linkedin' },
                    { name: '💻 GitHub', value: 'github' },
                    { name: '🔶 Reddit', value: 'reddit' },
                    { name: '👻 Snapchat', value: 'snapchat' },
                    { name: '🌐 Website', value: 'website' },
                    { name: '💼 Portfolio', value: 'portfolio' },
                    { name: '🎵 Spotify', value: 'spotify' },
                    { name: '🎧 SoundCloud', value: 'soundcloud' },
                    { name: '✈️ Telegram', value: 'telegram' },
                    { name: '💬 WhatsApp', value: 'whatsapp' }
                ))
            .addStringOption(opt => opt
                .setName('username')
                .setDescription('Your username/ID for this platform')
                .setRequired(true))
            .addStringOption(opt => opt
                .setName('url')
                .setDescription('Profile URL (optional)')
                .setRequired(false)))
                
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Remove a platform account')
            .addStringOption(opt => opt
                .setName('platform')
                .setDescription('Platform to remove')
                .setRequired(true)))
                
        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Edit a platform account')
            .addStringOption(opt => opt
                .setName('platform')
                .setDescription('Platform to edit')
                .setRequired(true))
            .addStringOption(opt => opt
                .setName('username')
                .setDescription('New username/ID')
                .setRequired(false))
            .addStringOption(opt => opt
                .setName('url')
                .setDescription('New profile URL')
                .setRequired(false)))
                
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('Delete your entire profile'))
            
        .addSubcommand(sub => sub
            .setName('platforms')
            .setDescription('List all your added platforms')),

    async execute(interaction) {
        await interaction.deferReply();
        
        const subcommand = interaction.options.getSubcommand();
        
        switch (subcommand) {
            case 'view':
                await handleView(interaction);
                break;
            case 'bio':
                await handleBio(interaction);
                break;
            case 'banner':
                await handleBanner(interaction);
                break;
            case 'add':
                await handleAdd(interaction);
                break;
            case 'remove':
                await handleRemove(interaction);
                break;
            case 'edit':
                await handleEdit(interaction);
                break;
            case 'delete':
                await handleDelete(interaction);
                break;
            case 'platforms':
                await handlePlatforms(interaction);
                break;
        }
    }
};

// Handler Functions

async function handleView(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const profile = await UserProfile.findOne({ userId: targetUser.id });
    
    if (!profile) {
        const noProfileContainer = new ContainerBuilder()
            .setAccentColor(0x95A5A6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 👤 No Profile Found\nThis user hasn\'t set up a profile yet.')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**User:** ${targetUser.username}\n**Status:** Profile not configured\n**Suggestion:** Use \`/profile bio\` to get started!`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${targetUser.username}'s avatar`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*No profile found • ${new Date().toLocaleString()}*`)
            );

        return interaction.editReply({ 
            components: [noProfileContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    // Generate custom profile card
    let cardBuffer = null;
    let attachment = null;

    try {
        const cardGenerator = new ProfileCardGenerator();
        const platformCount = getPlatformCount(profile);
        
        cardBuffer = await cardGenerator.generateCard(
            targetUser.username,
            profile.bio,
            targetUser.displayAvatarURL({ extension: 'png', size: 512 }),
            profile.customBanner,
            platformCount,
            'Your Elite Profile System'
        );

        if (cardBuffer) {
            attachment = new AttachmentBuilder(cardBuffer, { name: 'profile-card.png' });
        }
    } catch (cardError) {
        console.error('Profile card generation error:', cardError);
    }

    const profileContainer = new ContainerBuilder()
        .setAccentColor(0x0099FF)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 👤 ${targetUser.username}'s Elite Profile\nProfessional profile showcase with custom styling`)
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
                            `**👤 Username:** ${targetUser.username}`,
                            `**🆔 User ID:** ${targetUser.id}`,
                            profile.bio ? `**📝 Bio:** ${profile.bio.substring(0, 100)}${profile.bio.length > 100 ? '...' : ''}` : '**📝 Bio:** Not set',
                            `**🎨 Custom Banner:** ${profile.customBanner ? 'Set' : 'Not Set'}`,
                            `**🔗 Platforms:** ${getPlatformCount(profile)} connected`
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${targetUser.username}'s avatar`)
                )
        );

    if (attachment) {
        profileContainer
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        mediaItem => mediaItem
                            .setURL('attachment://profile-card.png')
                            .setDescription(`${targetUser.username}'s Custom Profile Card`)
                    )
            );
    }

    profileContainer
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Profile generated • ${new Date().toLocaleString()}*`)
        );

    const platformButtons = await createPlatformButtons(profile);
    const allComponents = [profileContainer];
    
    const maxButtonRows = Math.min(platformButtons.length, MAX_ROWS);
    for (let i = 0; i < maxButtonRows; i++) {
        allComponents.push(platformButtons[i]);
    }

    const reply = { 
        components: allComponents,
        flags: MessageFlags.IsComponentsV2 
    };

    if (attachment) {
        reply.files = [attachment];
    }

    await interaction.editReply(reply);
}

async function handleBio(interaction) {
    const bio = interaction.options.getString('text');
    
    if (bio.length > 500) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Bio Too Long\nBio must be 500 characters or less.')
            );

        return interaction.editReply({ 
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    await UserProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        { bio },
        { upsert: true, new: true }
    );
    
    const bioContainer = new ContainerBuilder()
        .setAccentColor(0x00FF00)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# ✅ Bio Updated\nYour profile bio has been successfully set.')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📝 Your New Bio:**\n${bio}`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.user.username}'s profile`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Bio updated • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [bioContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleBanner(interaction) {
    const bannerUrl = interaction.options.getString('url');
    
    if (!bannerUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Invalid URL\nPlease provide a valid image URL (jpg, jpeg, png, gif, webp).')
            );

        return interaction.editReply({ 
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    await UserProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        { customBanner: bannerUrl },
        { upsert: true, new: true }
    );
    
    const bannerContainer = new ContainerBuilder()
        .setAccentColor(0x00FF00)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# ✅ Banner Updated\nYour profile banner has been successfully updated!')
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎨 Banner URL:** ${bannerUrl}\n**📊 Status:** Active and visible`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.user.username}'s profile`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    mediaItem => mediaItem
                        .setURL(bannerUrl)
                        .setDescription('Your new profile banner')
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Banner updated • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [bannerContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleAdd(interaction) {
    const platform = interaction.options.getString('platform');
    const username = interaction.options.getString('username');
    const url = interaction.options.getString('url');
    
    const category = getCategoryForPlatform(platform);
    
    // Handle special platform fields - FIXED TO MATCH SCHEMA
    let updateData = {};
    
    switch (platform) {
        case 'riot':
            updateData = { riotId: username, region: 'global' };
            break;
        case 'xbox':
            updateData = { gamertag: username };
            break;
        case 'playstation':
            updateData = { psnId: username };
            break;
        case 'nintendo':
            updateData = { friendCode: username, username: username };
            break;
        case 'battlenet':
            updateData = { battleTag: username };
            break;
        case 'fortnite':
            updateData = { epicName: username };
            break;
        case 'youtube':
            // FIXED: Match schema exactly
            updateData = { channelName: username };
            if (url) updateData.channelUrl = url;
            break;
        case 'facebook':
        case 'linkedin':
        case 'spotify':
            updateData = { displayName: username };
            break;
        case 'website':
        case 'portfolio':
            updateData = { title: username };
            if (url) updateData.url = url;
            break;
        case 'whatsapp':
            updateData = { number: username, displayName: username };
            break;
        case 'minecraft':
            updateData = { username: username, uuid: null };
            break;
        default:
            updateData = { username };
    }
    
    if (url && !['website', 'portfolio', 'youtube'].includes(platform)) {
        updateData.profileUrl = url;
    }
    
    await UserProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        { [`${category}.${platform}`]: updateData },
        { upsert: true, new: true }
    );
    
    const addContainer = new ContainerBuilder()
        .setAccentColor(0x00FF00)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# ✅ Platform Added\nPlatform account has been successfully added to your profile!')
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
                            `**🎮 Platform:** ${platformEmojis[platform]} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
                            `**👤 Username:** ${username}`,
                            url ? `**🔗 Profile URL:** ${url}` : '**🔗 Profile URL:** Not provided',
                            `**📂 Category:** ${category.charAt(0).toUpperCase() + category.slice(1)}`
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.user.username}'s profile`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Platform added • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [addContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleRemove(interaction) {
    const platform = interaction.options.getString('platform');
    const category = getCategoryForPlatform(platform);
    
    const profile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!profile || !profile[category] || !profile[category][platform]) {
        const notFoundContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Platform Not Found\nYou don't have a ${platform} account set in your profile.`)
            );

        return interaction.editReply({ 
            components: [notFoundContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    await UserProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        { $unset: { [`${category}.${platform}`]: 1 } }
    );
    
    const removeContainer = new ContainerBuilder()
        .setAccentColor(0xE74C3C)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# 🗑️ Platform Removed\nPlatform account has been successfully removed from your profile.')
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
                            `**🎮 Platform:** ${platformEmojis[platform]} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
                            `**📂 Category:** ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                            `**⚡ Action:** Permanently removed`,
                            `**📊 Status:** No longer visible in profile`
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.user.username}'s profile`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Platform removed • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [removeContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleEdit(interaction) {
    const platform = interaction.options.getString('platform');
    const username = interaction.options.getString('username');
    const url = interaction.options.getString('url');
    
    const category = getCategoryForPlatform(platform);
    const profile = await UserProfile.findOne({ userId: interaction.user.id });
    
    if (!profile || !profile[category] || !profile[category][platform]) {
        const notFoundContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Platform Not Found\nYou don't have a ${platform} account to edit. Use \`/profile add\` first.`)
            );

        return interaction.editReply({ 
            components: [notFoundContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    const updateData = {};
    if (username) {
        // Handle special platform fields for editing - FIXED TO MATCH SCHEMA
        switch (platform) {
            case 'riot':
                updateData[`${category}.${platform}.riotId`] = username;
                break;
            case 'xbox':
                updateData[`${category}.${platform}.gamertag`] = username;
                break;
            case 'playstation':
                updateData[`${category}.${platform}.psnId`] = username;
                break;
            case 'nintendo':
                updateData[`${category}.${platform}.friendCode`] = username;
                updateData[`${category}.${platform}.username`] = username;
                break;
            case 'battlenet':
                updateData[`${category}.${platform}.battleTag`] = username;
                break;
            case 'fortnite':
                updateData[`${category}.${platform}.epicName`] = username;
                break;
            case 'youtube':
                // FIXED: Match schema
                updateData[`${category}.${platform}.channelName`] = username;
                break;
            case 'facebook':
            case 'linkedin':
            case 'spotify':
                updateData[`${category}.${platform}.displayName`] = username;
                break;
            case 'website':
            case 'portfolio':
                updateData[`${category}.${platform}.title`] = username;
                break;
            case 'whatsapp':
                updateData[`${category}.${platform}.number`] = username;
                updateData[`${category}.${platform}.displayName`] = username;
                break;
            default:
                updateData[`${category}.${platform}.username`] = username;
        }
    }
    
    if (url) {
        if (['website', 'portfolio'].includes(platform)) {
            updateData[`${category}.${platform}.url`] = url;
        } else if (platform === 'youtube') {
            updateData[`${category}.${platform}.channelUrl`] = url;
        } else {
            updateData[`${category}.${platform}.profileUrl`] = url;
        }
    }
    
    await UserProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        updateData
    );
    
    const editContainer = new ContainerBuilder()
        .setAccentColor(0x00FF00)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# ✅ Platform Updated\nPlatform account has been successfully updated!')
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
                            `**🎮 Platform:** ${platformEmojis[platform]} ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
                            username ? `**👤 New Username:** ${username}` : '**👤 Username:** Unchanged',
                            url ? `**🔗 New URL:** ${url}` : '**🔗 URL:** Unchanged',
                            `**📂 Category:** ${category.charAt(0).toUpperCase() + category.slice(1)}`
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.user.username}'s profile`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Platform updated • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [editContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handleDelete(interaction) {
    const profile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!profile) {
        const noProfileContainer = new ContainerBuilder()
            .setAccentColor(0xFF0000)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ No Profile to Delete\nYou don\'t have a profile to delete.')
            );

        return interaction.editReply({ 
            components: [noProfileContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    await UserProfile.findOneAndDelete({ userId: interaction.user.id });
    
    const deleteContainer = new ContainerBuilder()
        .setAccentColor(0xE74C3C)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# 🗑️ Profile Deleted\nYour entire profile has been permanently deleted.')
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
                            `**👤 User:** ${interaction.user.username}`,
                            `**⚡ Action:** Complete profile deletion`,
                            `**📊 Status:** All data permanently removed`,
                            `**🔄 Recovery:** Not possible - data is gone forever`
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription('Profile deleted')
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Profile deleted • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [deleteContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

async function handlePlatforms(interaction) {
    const profile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!profile) {
        const noPlatformsContainer = new ContainerBuilder()
            .setAccentColor(0x95A5A6)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 📋 No Platforms Found\nYou don\'t have any platforms set up yet.')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**🚀 Getting Started**\nUse `/profile add` to add your first platform account!')
            );

        return interaction.editReply({ 
            components: [noPlatformsContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    }
    
    const platformsContainer = new ContainerBuilder()
        .setAccentColor(0x0099FF)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# 📋 Your Platform Accounts\nAll your connected platform accounts')
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
                            `**👤 User:** ${interaction.user.username}`,
                            `**🔗 Total Platforms:** ${getPlatformCount(profile)}`,
                            `**📊 Profile Status:** ${profile.bio ? 'Complete' : 'Needs Bio'}`,
                            `**🎨 Custom Banner:** ${profile.customBanner ? 'Set' : 'Not Set'}`
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.user.username}'s platforms`)
                )
        );

    const platformList = getPlatformSummary(profile);
    
    if (platformList && platformList !== 'No platforms added. Use `/profile add` to link your accounts.') {
        platformsContainer
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(platformList.substring(0, 3800))
            );
    } else {
        platformsContainer
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**📭 No Platforms Added**\nUse `/profile add` to connect your platform accounts!')
            );
    }

    platformsContainer
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Platform list • ${new Date().toLocaleString()}*`)
        );
    
    await interaction.editReply({ 
        components: [platformsContainer],
        flags: MessageFlags.IsComponentsV2 
    });
}

// Helper Functions

function getCategoryForPlatform(platform) {
    for (const [category, platforms] of Object.entries(platformCategories)) {
        if (platforms.includes(platform)) return category;
    }
    return 'other';
}

// FIXED: Platform detection matching the exact database schema
function getConnectedPlatforms(profile) {
    const connected = [];
    
    for (const [category, platforms] of Object.entries(platformCategories)) {
        if (profile[category]) {
            for (const platform of platforms) {
                if (profile[category][platform]) {
                    const data = profile[category][platform];
                    
                    // Schema-specific validation
                    let hasData = false;
                    
                    switch (platform) {
                        case 'youtube':
                            hasData = data && (data.channelName || data.channelUrl);
                            break;
                        case 'riot':
                            hasData = data && data.riotId;
                            break;
                        case 'xbox':
                            hasData = data && data.gamertag;
                            break;
                        case 'playstation':
                            hasData = data && data.psnId;
                            break;
                        case 'nintendo':
                            hasData = data && (data.friendCode || data.username);
                            break;
                        case 'battlenet':
                            hasData = data && data.battleTag;
                            break;
                        case 'fortnite':
                            hasData = data && data.epicName;
                            break;
                        case 'facebook':
                        case 'linkedin':
                        case 'spotify':
                            hasData = data && data.displayName;
                            break;
                        case 'website':
                        case 'portfolio':
                            hasData = data && (data.url || data.title);
                            break;
                        case 'whatsapp':
                            hasData = data && data.number;
                            break;
                        default:
                            hasData = data && data.username;
                    }
                    
                    if (hasData) {
                        connected.push({
                            platform,
                            category,
                            data
                        });
                    }
                }
            }
        }
    }
    
    return connected;
}

function getPlatformCount(profile) {
    return getConnectedPlatforms(profile).length;
}

function generatePlatformUrl(platform, data) {
    if (!data) return null;
    
    if (platformUrlGenerators[platform]) {
        try {
            return platformUrlGenerators[platform](data);
        } catch (error) {
            console.error(`Error generating URL for ${platform}:`, error);
            return data.profileUrl || data.url || data.channelUrl || null;
        }
    }
    
    return data.profileUrl || data.url || data.channelUrl || null;
}

function getPlatformSummary(profile) {
    const connectedPlatforms = getConnectedPlatforms(profile);
    
    if (connectedPlatforms.length === 0) {
        return 'No platforms added. Use `/profile add` to link your accounts.';
    }
    
    let summary = '';
    const categorizedPlatforms = {};
    
    // Group by category
    for (const { platform, category, data } of connectedPlatforms) {
        if (!categorizedPlatforms[category]) {
            categorizedPlatforms[category] = [];
        }
        
        let displayName;
        switch (platform) {
            case 'youtube':
                displayName = data.channelName || 'YouTube Channel';
                break;
            case 'riot':
                displayName = data.riotId || 'Riot Account';
                break;
            case 'xbox':
                displayName = data.gamertag || 'Xbox Gamertag';
                break;
            case 'playstation':
                displayName = data.psnId || 'PlayStation ID';
                break;
            case 'nintendo':
                displayName = data.friendCode || data.username || 'Nintendo Account';
                break;
            case 'battlenet':
                displayName = data.battleTag || 'Battle.net Account';
                break;
            case 'fortnite':
                displayName = data.epicName || 'Fortnite Account';
                break;
            case 'facebook':
            case 'linkedin':
            case 'spotify':
                displayName = data.displayName || 'Account';
                break;
            case 'website':
            case 'portfolio':
                displayName = data.title || 'Website';
                break;
            case 'whatsapp':
                displayName = data.displayName || data.number || 'WhatsApp';
                break;
            default:
                displayName = data.username || 'Account';
        }
        
        const url = generatePlatformUrl(platform, data);
        const urlText = url ? ` - [View Profile](${url})` : '';
        
        categorizedPlatforms[category].push(
            `${platformEmojis[platform]} **${platform.charAt(0).toUpperCase() + platform.slice(1)}:** ${displayName}${urlText}`
        );
    }
    
    // Build summary
    for (const [category, platforms] of Object.entries(categorizedPlatforms)) {
        summary += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}**\n${platforms.join('\n')}\n`;
    }
    
    return summary;
}

// FIXED: Platform buttons creation with proper field checking
async function createPlatformButtons(profile) {
    const buttons = [];
    const connectedPlatforms = getConnectedPlatforms(profile);
    
    for (const { platform, category, data } of connectedPlatforms) {
        let displayName;
        switch (platform) {
            case 'youtube':
                displayName = data.channelName || 'YouTube';
                break;
            case 'riot':
                displayName = data.riotId || 'Riot';
                break;
            case 'xbox':
                displayName = data.gamertag || 'Xbox';
                break;
            case 'playstation':
                displayName = data.psnId || 'PlayStation';
                break;
            case 'nintendo':
                displayName = data.friendCode || data.username || 'Nintendo';
                break;
            case 'battlenet':
                displayName = data.battleTag || 'Battle.net';
                break;
            case 'fortnite':
                displayName = data.epicName || 'Fortnite';
                break;
            case 'facebook':
            case 'linkedin':
            case 'spotify':
                displayName = data.displayName || platform;
                break;
            case 'website':
            case 'portfolio':
                displayName = data.title || platform;
                break;
            case 'whatsapp':
                displayName = data.displayName || data.number || 'WhatsApp';
                break;
            default:
                displayName = data.username || platform;
        }
        
        const label = `${platformEmojis[platform]} ${displayName}`.substring(0, 80);
        const url = generatePlatformUrl(platform, data);
        
        // Only add button if we have a valid URL
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            buttons.push(
                new ButtonBuilder()
                    .setLabel(label)
                    .setStyle(ButtonStyle.Link)
                    .setURL(url)
            );
        }
    }
    
    return paginateButtons(buttons);
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