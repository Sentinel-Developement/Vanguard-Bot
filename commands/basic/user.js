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
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  PermissionsBitField
} = require('discord.js');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Advanced user profile and analytics tools.')
    .addSubcommand(sub =>
      sub.setName('permissions')
        .setDescription('Detailed channel permissions analysis.')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to analyze').setRequired(true))
        .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false))
    )
    .addSubcommand(sub => sub.setName('mutuals').setDescription('Mutual servers analysis.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('nickname')
        .setDescription('Nickname management (Admin only).')
        .addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(true).addChoices({ name: 'view', value: 'view' }, { name: 'reset', value: 'reset' }))
        .addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('info').setDescription('Comprehensive user information and analytics.').addUserOption(o => o.setName('target').setDescription('Target user to analyze').setRequired(false)))
    .addSubcommand(sub => sub.setName('avatar').setDescription('Display user avatar in high resolution.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('banner').setDescription('Show user profile banner.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('roles').setDescription('Analyze user roles and permissions.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('joinedat').setDescription('Server join date and member analytics.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('badges').setDescription('Discord badges and achievements.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('createdat').setDescription('Account creation date and age.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('boosting').setDescription('Server boost status and history.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('activity').setDescription('User activity and presence status.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('security').setDescription('Account security analysis.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub => sub.setName('stats').setDescription('Advanced user statistics.').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(false))),

  async execute(interaction) {
    try {
      let sender = interaction.user;
      let subcommand;
      let targetUser;
      let isSlashCommand = false;
      let channel = null;
      let action = null;

      if (interaction.isCommand && interaction.isCommand()) {
        isSlashCommand = true;
        await interaction.deferReply();
        subcommand = interaction.options.getSubcommand();
        targetUser = interaction.options.getUser('target') || interaction.user;
        channel = interaction.options.getChannel('channel');
        action = interaction.options.getString('action');
      } else {
        const message = interaction;
        sender = message.author;
        const args = message.content.split(' ');
        args.shift();
        subcommand = args[0] || 'help';

        if (args[1]) {
          const userMention = args[1].replace(/[<@!>]/g, '');
          targetUser = await message.client.users.fetch(userMention).catch(() => null) || message.author;
        } else {
          targetUser = message.author;
        }

        if (subcommand === 'permissions' && args[2]) {
          const channelMention = args[2].replace(/[<#>]/g, '');
          channel = message.guild.channels.cache.get(channelMention);
        }

        if (subcommand === 'nickname' && args[2]) {
          action = args[2];
        }
      }

      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
      const client = isSlashCommand ? interaction.client : interaction.client;

      const sendReply = async (components) => {
        const messageData = {
          components: components,
          flags: MessageFlags.IsComponentsV2
        };

        if (isSlashCommand) {
          return interaction.editReply(messageData);
        } else {
          return interaction.reply(messageData);
        }
      };

     
      if (subcommand === 'info') {
        const roles = member?.roles.cache.filter(r => r.name !== '@everyone') || [];
        const joinPosition = member ? (await interaction.guild.members.fetch()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1 : 'N/A';
        const accountAge = moment(targetUser.createdAt).fromNow();
        const serverAge = member ? moment(member.joinedAt).fromNow() : 'Not in server';

        const infoContainer = new ContainerBuilder()
          .setAccentColor(0x00d4ff)
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`# User Profile Analysis\n**${targetUser.tag}** - Complete Identity Overview`)
          )
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`**User ID:** ${targetUser.id}\n**Account Type:** ${targetUser.bot ? 'Bot Account' : 'Human User'}\n**Account Created:** ${accountAge}\n**Server Joined:** ${serverAge}\n**Join Position:** #${joinPosition}`)
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder()
                  .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                  .setDescription(`Avatar of ${targetUser.tag}`)
              )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Large)
          )
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`**Current Status:** ${member?.presence?.status || 'offline'}\n**Activity:** ${member?.presence?.activities[0]?.name || 'None'}\n**Boost Status:** ${member?.premiumSince ? 'Active Booster' : 'Not boosting'}\n**Highest Role:** ${member?.roles.highest.name || 'None'}\n**Total Roles:** ${roles.size}`)
              )
              .setButtonAccessory(
                new ButtonBuilder()
                  .setLabel('Add as Friend')
                  .setStyle(ButtonStyle.Link)
                  .setURL(`https://discord.com/users/${targetUser.id}`)
              )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`*Requested by ${sender.tag} • ${new Date().toLocaleString()}*`)
          );

        return sendReply([infoContainer]);
      }


    
      if (subcommand === 'avatar') {
        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
        const isAnimated = avatarURL.includes('.gif');

        const avatarContainer = new ContainerBuilder()
          .setAccentColor(0x7c3aed)
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`# Avatar Display\n**${targetUser.tag}** - High Resolution Avatar`)
          )
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`**Resolution:** 1024x1024 pixels\n**Format:** ${isAnimated ? 'Animated GIF' : 'Static PNG'}\n**Quality:** Maximum\n\n**Download Links:**\n[PNG Format](${targetUser.displayAvatarURL({ format: 'png', size: 1024 })})\n[WebP Format](${targetUser.displayAvatarURL({ format: 'webp', size: 1024 })})\n${isAnimated ? `[GIF Format](${targetUser.displayAvatarURL({ format: 'gif', size: 1024 })})` : ''}`)
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder()
                  .setURL(avatarURL)
                  .setDescription(`High resolution avatar of ${targetUser.tag}`)
              )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`*Requested by ${sender.tag} • ${new Date().toLocaleString()}*`)
          );

        return sendReply([avatarContainer]);
      }

  
      if (subcommand === 'banner') {
        const user = await client.users.fetch(targetUser.id, { force: true });
        const bannerURL = user.bannerURL({ dynamic: true, size: 1024 });

        const bannerContainer = new ContainerBuilder()
          .setAccentColor(user.accentColor || 0x00ff88)
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`# Profile Banner\n**${targetUser.tag}** - Custom Profile Banner`)
          );

        if (bannerURL) {
          bannerContainer.addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder()
                  .setContent(`**Resolution:** 1920x1080 pixels\n**Accent Color:** ${user.accentColor ? `#${user.accentColor.toString(16).padStart(6, '0')}` : 'Default'}\n**Status:** Premium Feature Active\n\n**Download Links:**\n[PNG Format](${user.bannerURL({ format: 'png', size: 1024 })})\n[WebP Format](${user.bannerURL({ format: 'webp', size: 1024 })})\n[JPG Format](${user.bannerURL({ format: 'jpg', size: 1024 })})`)
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder()
                  .setURL(bannerURL)
                  .setDescription(`Profile banner of ${targetUser.tag}`)
              )
          );
        } else {
          bannerContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`**Status:** No custom banner set\n**Accent Color:** ${user.accentColor ? `#${user.accentColor.toString(16).padStart(6, '0')}` : 'Default Discord'}\n\n**Get Custom Banners:**\n[Discord Nitro Required](https://discord.com/nitro)\n[Profile Customization Guide](https://support.discord.com/hc/en-us/articles/4403147417623-Profile-Customization-Nitro)`)
          );
        }

        bannerContainer.addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
        )
          .addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`*Requested by ${sender.tag} • ${new Date().toLocaleString()}*`)
          );

        return sendReply([bannerContainer]);
      }

     
      if (subcommand === 'roles') {
        const roles = member?.roles.cache.filter(r => r.name !== '@everyone').sort((a, b) => b.position - a.position);

        const components = [];

        const rolesContainer = new ContainerBuilder()
          .setAccentColor(0x8e44ad);

        rolesContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🎭 Role Analysis\n## ${targetUser.tag} Permission Structure\n\n> Complete role hierarchy and permission assessment\n> Server authority and access level evaluation`)
        );

        components.push(rolesContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const roleInfoContainer = new ContainerBuilder()
          .setAccentColor(0x9B59B6);

        if (roles && roles.size > 0) {
          const roleList = roles.map(r => `<@&${r.id}> ${r.name}`).join('\n');
          roleInfoContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 👑 **Role Hierarchy**\n\n**Total Roles**\n${roles.size} assigned roles\n\n**Highest Role**\n${member.roles.highest.name}\n\n**Role Color**\n${member.roles.highest.hexColor}\n\n**Complete Role List**\n${roleList}\n\n**Role Management**\n[Permission Guide](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-a-Role-Exclusive-Channel-)`)
          );
        } else {
          roleInfoContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## ❌ **No Roles Assigned**\n\n**Role Status**\n${member ? 'Member has no custom roles' : 'User not in server'}\n\n**Default Permissions**\n@everyone role only\n\n**Role Assignment**\n[Server Management Guide](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-a-Role-Exclusive-Channel-)`)
          );
        }

        components.push(roleInfoContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🎭 Role analysis requested by ${sender.tag} | Permission structure overview`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

  
      if (subcommand === 'permissions') {
        if (!channel) {
          const components = [];
          const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff0000);

          errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent('# ❌ Invalid Channel\n## Channel Required\n\n> Please specify a valid channel for permission analysis\n> Channel parameter is required for detailed permission scanning')
          );

          components.push(errorContainer);
          return sendReply(components);
        }

        const permissions = channel.permissionsFor(targetUser)?.toArray() || [];
        const adminPerms = permissions.filter(p => ['Administrator', 'ManageGuild', 'ManageChannels', 'ManageRoles'].includes(p));
        const modPerms = permissions.filter(p => ['ManageMessages', 'KickMembers', 'BanMembers', 'ModerateMembers'].includes(p));
        const basicPerms = permissions.filter(p => !adminPerms.includes(p) && !modPerms.includes(p));

        const components = [];

        const permContainer = new ContainerBuilder()
          .setAccentColor(0x3498db);

        permContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🔐 Permission Analysis\n## ${targetUser.tag} Channel Access\n\n> Detailed permission evaluation for ${channel.name}\n> Complete access control assessment and security review`)
        );

        components.push(permContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const permDetailsContainer = new ContainerBuilder()
          .setAccentColor(0x4CAF50);

        permDetailsContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📊 **Permission Summary**\n\n**Target Channel**\n${channel.name} (${channel.type})\n\n**User Analysis**\n${targetUser.tag}\n\n**Total Permissions**\n${permissions.length} granted permissions\n\n**Channel Link**\n<#${channel.id}>\n\n**Permission Guide**\n[Discord Permissions](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-a-Role-Exclusive-Channel-)`)
        );

        components.push(permDetailsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const adminContainer = new ContainerBuilder()
          .setAccentColor(0xE74C3C);

        adminContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🔑 **Administrative Permissions**\n\n${adminPerms.length > 0 ? adminPerms.map(p => `• ${p}`).join('\n') : 'No administrative permissions'}\n\n**Moderation Permissions**\n\n${modPerms.length > 0 ? modPerms.map(p => `• ${p}`).join('\n') : 'No moderation permissions'}`)
        );

        components.push(adminContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const basicContainer = new ContainerBuilder()
          .setAccentColor(0x2196F3);

        const displayBasic = basicPerms.length > 10 ?
          `${basicPerms.slice(0, 10).map(p => `• ${p}`).join('\n')}\n+${basicPerms.length - 10} additional permissions` :
          basicPerms.map(p => `• ${p}`).join('\n');

        basicContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📝 **Basic Permissions**\n\n${basicPerms.length > 0 ? displayBasic : 'No basic permissions'}`)
        );

        components.push(basicContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🔐 Permission analysis requested by ${sender.tag} | Security assessment`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

     
      if (subcommand === 'joinedat') {
        if (!member) {
          const components = [];
          const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff0000);

          errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent('# ❌ User Not Found\n## Server Membership Required\n\n> User is not a member of this server\n> Join date analysis requires active server membership')
          );

          components.push(errorContainer);
          return sendReply(components);
        }

        const joinPosition = (await interaction.guild.members.fetch()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1;
        const joinAge = moment(member.joinedAt).fromNow();
        const daysSinceJoin = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));

        const components = [];

        const joinContainer = new ContainerBuilder()
          .setAccentColor(0x2ecc71);

        joinContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 📅 Server Join Analysis\n## ${targetUser.tag} Membership Timeline\n\n> Complete server membership history and statistics\n> Community integration and participation tracking`)
        );

        components.push(joinContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const membershipContainer = new ContainerBuilder()
          .setAccentColor(0x27AE60);

        const memberStatus = daysSinceJoin > 365 ? 'Veteran Member' :
          daysSinceJoin > 180 ? 'Experienced Member' :
            daysSinceJoin > 30 ? 'Active Member' : 'New Member';

        membershipContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🏆 **Membership Details**\n\n**Join Date**\n<t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n\n**Time Since Joining**\n${joinAge}\n\n**Days Active**\n${daysSinceJoin} days\n\n**Join Position**\n#${joinPosition} member\n\n**Member Status**\n${memberStatus}\n\n**Server Guide**\n[Community Guidelines](https://discord.com/guidelines)`)
        );

        components.push(membershipContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`📅 Join analysis requested by ${sender.tag} | Membership timeline`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

   
      if (subcommand === 'badges') {
        const user = await client.users.fetch(targetUser.id, { force: true });
        const flags = user.flags?.toArray() || [];
        const badgeEmojis = {
          'Staff': '👑',
          'Partner': '🤝',
          'Hypesquad': '🎉',
          'BugHunterLevel1': '🐛',
          'BugHunterLevel2': '🐛',
          'HypesquadOnlineHouse1': '🏠',
          'HypesquadOnlineHouse2': '🏠',
          'HypesquadOnlineHouse3': '🏠',
          'PremiumEarlySupporter': '💎',
          'TeamPseudoUser': '🤖',
          'VerifiedBot': '✅',
          'VerifiedDeveloper': '🔨',
          'CertifiedModerator': '🛡️',
          'BotHTTPInteractions': '🔗',
          'ActiveDeveloper': '⚡'
        };

        const components = [];

        const badgeContainer = new ContainerBuilder()
          .setAccentColor(0xf1c40f);

        badgeContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🏅 Badge Collection\n## ${targetUser.tag} Discord Achievements\n\n> Discord badge and achievement showcase\n> Community recognition and special status indicators`)
        );

        components.push(badgeContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const achievementContainer = new ContainerBuilder()
          .setAccentColor(0xF4D03F);

        if (flags.length > 0) {
          const badgeList = flags.map(badge => `${badgeEmojis[badge] || '🏅'} **${badge.replace(/([A-Z])/g, ' $1').trim()}**`).join('\n');
          achievementContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 🏆 **Achievement Showcase**\n\n**Badge Count**\n${flags.length} earned achievements\n\n**Profile Status**\nDistinguished User\n\n**Earned Badges**\n${badgeList}\n\n**Badge Information**\n[Discord Badges Guide](https://support.discord.com/hc/en-us/articles/360035962891-Profile-Badges-101)`)
          );
        } else {
          achievementContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 📝 **No Badges Earned**\n\n**Badge Status**\nStandard user profile\n\n**Available Achievements**\nDiscord offers various badges for community participation\n\n**Earn Badges**\n[HypeSquad Events](https://discord.com/hypesquad)\n[Bug Hunter Program](https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs)\n[Developer Program](https://discord.com/developers)`)
          );
        }

        components.push(achievementContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🏅 Badge collection requested by ${sender.tag} | Achievement showcase`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

    
      if (subcommand === 'createdat') {
        const accountAge = moment(targetUser.createdAt).fromNow();
        const daysSinceCreation = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
        const accountStatus = daysSinceCreation > 1095 ? 'Veteran Account' : daysSinceCreation > 365 ? 'Mature Account' : daysSinceCreation > 30 ? 'Established Account' : 'New Account';

        const components = [];

        const creationContainer = new ContainerBuilder()
          .setAccentColor(0x2d98da);

        creationContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🎂 Account Creation\n## ${targetUser.tag} Account History\n\n> Complete account timeline and age verification\n> Discord registration history and account maturity`)
        );

        components.push(creationContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const timelineContainer = new ContainerBuilder()
          .setAccentColor(0x3498DB);

        timelineContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📊 **Account Timeline**\n\n**Creation Date**\n<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>\n\n**Account Age**\n${accountAge}\n\n**Days Since Creation**\n${daysSinceCreation} days\n\n**Account Status**\n${accountStatus}\n\n**Experience Level**\n${daysSinceCreation > 730 ? 'Expert User' : daysSinceCreation > 365 ? 'Advanced User' : daysSinceCreation > 90 ? 'Intermediate User' : 'Beginner User'}\n\n**Discord History**\n[Platform Evolution](https://discord.com/company)`)
        );

        components.push(timelineContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const metricsContainer = new ContainerBuilder()
          .setAccentColor(0x5DADE2);

        metricsContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📈 **Account Metrics**\n\n**Years Active**\n${Math.floor(daysSinceCreation / 365)} years\n\n**Months Active**\n${Math.floor(daysSinceCreation / 30)} months\n\n**Account Maturity**\n${((daysSinceCreation / 1095) * 100).toFixed(1)}% of maximum age consideration\n\n**Registration Era**\n${daysSinceCreation > 2555 ? 'Early Discord Era' : daysSinceCreation > 1825 ? 'Growth Period' : daysSinceCreation > 1095 ? 'Expansion Era' : 'Modern Era'}`)
        );

        components.push(metricsContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🎂 Account creation requested by ${sender.tag} | Timeline analysis`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }


      if (subcommand === 'boosting') {
        const boostStatus = member?.premiumSince;
        const boostDuration = boostStatus ? moment(boostStatus).fromNow() : null;
        const boostLevel = interaction.guild.premiumTier;

        const components = [];

        const boostContainer = new ContainerBuilder()
          .setAccentColor(0xe84393);

        boostContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🚀 Server Boost Analysis\n## ${targetUser.tag} Boost Status\n\n> Discord Nitro boost tracking and community support analysis\n> Premium membership and server enhancement contribution`)
        );

        components.push(boostContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const statusContainer = new ContainerBuilder()
          .setAccentColor(0xE91E63);

        if (boostStatus) {
          statusContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 💎 **Active Booster**\n\n**Boost Status**\nActive Community Supporter\n\n**Boost Started**\n${boostDuration}\n<t:${Math.floor(boostStatus / 1000)}:F>\n\n**Server Level**\nLevel ${boostLevel}\n\n**Total Server Boosts**\n${interaction.guild.premiumSubscriptionCount || 0} active boosts\n\n**Contribution Impact**\nServer enhancement active\nExclusive perks unlocked\n\n**Boost Guide**\n[Nitro Benefits](https://discord.com/nitro)`)
          );
        } else {
          statusContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## ❌ **Not Boosting**\n\n**Boost Status**\nNot currently boosting this server\n\n**Server Level**\nLevel ${boostLevel}\n\n**Total Server Boosts**\n${interaction.guild.premiumSubscriptionCount || 0} active boosts\n\n**Boost Benefits**\nHigher audio quality\nCustom server emoji\nEnhanced upload limits\nPriority support\n\n**Get Nitro**\n[Discord Nitro](https://discord.com/nitro)\n[Boost This Server](https://discord.com/channels/${interaction.guild.id})`)
          );
        }

        components.push(statusContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🚀 Boost analysis requested by ${sender.tag} | Premium support tracking`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

    
      if (subcommand === 'mutuals') {
        const mutuals = client.guilds.cache.filter(g => g.members.cache.has(targetUser.id));

        const components = [];

        const mutualsContainer = new ContainerBuilder()
          .setAccentColor(0x1abc9c);

        mutualsContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🌐 Mutual Server Analysis\n## ${targetUser.tag} Network Connections\n\n> Shared server discovery and network relationship mapping\n> Community overlap and connection analysis`)
        );

        components.push(mutualsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const networkContainer = new ContainerBuilder()
          .setAccentColor(0x16A085);

        const mutualList = mutuals.map(g => `• **${g.name}** (${g.memberCount.toLocaleString()} members)`).join('\n');
        const networkReach = mutuals.reduce((acc, g) => acc + g.memberCount, 0);

        networkContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🏰 **Network Summary**\n\n**Mutual Servers**\n${mutuals.size} shared communities\n\n**Network Reach**\n${networkReach.toLocaleString()} total members\n\n**Network Score**\n${mutuals.size > 10 ? 'High Connectivity' : mutuals.size > 5 ? 'Medium Connectivity' : 'Low Connectivity'}\n\n**Average Server Size**\n${mutuals.size > 0 ? Math.floor(networkReach / mutuals.size).toLocaleString() : 0} members`)
        );

        components.push(networkContainer);

        if (mutuals.size > 0) {
          components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          const serverListContainer = new ContainerBuilder()
            .setAccentColor(0x48C9B0);

          const displayList = mutuals.size > 10 ?
            `${mutualList.split('\n').slice(0, 10).join('\n')}\n+${mutuals.size - 10} additional servers` :
            mutualList;

          serverListContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 🏰 **Shared Servers**\n\n${displayList}\n\n**Server Discovery**\n[Find Communities](https://discord.com/discovery)\n[Community Guidelines](https://discord.com/guidelines)`)
          );

          components.push(serverListContainer);
        }

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🌐 Network analysis requested by ${sender.tag} | Connection mapping`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

   
      if (subcommand === 'activity') {
        const presence = member?.presence;
        const status = presence?.status || 'offline';
        const activities = presence?.activities || [];
        const statusEmoji = {
          'online': '🟢',
          'idle': '🟡',
          'dnd': '🔴',
          'offline': '⚫'
        };

        const components = [];

        const activityContainer = new ContainerBuilder()
          .setAccentColor(0x9b59b6);

        activityContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# ⚡ Activity Monitor\n## ${targetUser.tag} Presence Status\n\n> Real-time activity tracking and presence analysis\n> Current status monitoring and platform detection`)
        );

        components.push(activityContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const presenceContainer = new ContainerBuilder()
          .setAccentColor(0x8E44AD);

        const platformInfo = presence?.clientStatus ? Object.keys(presence.clientStatus).join(', ') : 'Unknown';
        presenceContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📊 **Current Presence**\n\n**Status**\n${statusEmoji[status]} ${status.toUpperCase()}\n\n**Active Platforms**\n${platformInfo}\n\n**Activity Count**\n${activities.length} current activities\n\n**Visibility**\n${status !== 'offline' ? 'Online and visible' : 'Offline or invisible'}\n\n**Status Guide**\n[Presence Settings](https://support.discord.com/hc/en-us/articles/115000070311-How-do-I-turn-on-invisible-mode-)`)
        );

        components.push(presenceContainer);

        if (activities.length > 0) {
          components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          const activitiesContainer = new ContainerBuilder()
            .setAccentColor(0x6C3483);

          const activityList = activities.map(activity => {
            const type = activity.type === 0 ? 'Playing' :
              activity.type === 1 ? 'Streaming' :
                activity.type === 2 ? 'Listening to' :
                  activity.type === 3 ? 'Watching' :
                    activity.type === 4 ? 'Custom Status' :
                      activity.type === 5 ? 'Competing in' : 'Unknown';

            return `**${type}** ${activity.name}${activity.details ? `\n${activity.details}` : ''}${activity.state ? `\n${activity.state}` : ''}`;
          }).join('\n\n');

          activitiesContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 🎮 **Current Activities**\n\n${activityList}\n\n**Activity Tracking**\n[Rich Presence Guide](https://discord.com/rich-presence)`)
          );

          components.push(activitiesContainer);
        }

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`⚡ Activity monitoring requested by ${sender.tag} | Presence tracking`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

    
      if (subcommand === 'nickname') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
          const components = [];
          const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff0000);

          errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent('# ❌ Access Denied\n## Insufficient Permissions\n\n> You need Manage Nicknames permission to use this command\n> Contact server administrators for access to nickname management')
          );

          components.push(errorContainer);
          return sendReply(components);
        }

        const nickname = member?.nickname || 'No nickname set';

        if (action === 'reset') {
          try {
            await member.setNickname(null);
            const components = [];
            const successContainer = new ContainerBuilder()
              .setAccentColor(0x00ff00);

            successContainer.addTextDisplayComponents(
              new TextDisplayBuilder()
                .setContent(`# ✅ Nickname Reset\n## Operation Successful\n\n> Successfully reset ${targetUser.tag}'s nickname\n> User will now display their original username`)
            );

            components.push(successContainer);
            return sendReply(components);
          } catch (error) {
            const components = [];
            const errorContainer = new ContainerBuilder()
              .setAccentColor(0xff0000);

            errorContainer.addTextDisplayComponents(
              new TextDisplayBuilder()
                .setContent('# ❌ Reset Failed\n## Operation Error\n\n> Failed to reset nickname - check role hierarchy\n> Ensure your role is higher than the target user')
            );

            components.push(errorContainer);
            return sendReply(components);
          }
        }

        const components = [];

        const nicknameContainer = new ContainerBuilder()
          .setAccentColor(0x34495e);

        nicknameContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🏷️ Nickname Management\n## ${targetUser.tag} Display Name\n\n> Server nickname administration and management\n> Custom display name configuration and control`)
        );

        components.push(nicknameContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const managementContainer = new ContainerBuilder()
          .setAccentColor(0x2C3E50);

        const canModify = member && interaction.member.roles.highest.position > member.roles.highest.position;
        managementContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🔧 **Nickname Details**\n\n**Current Nickname**\n${nickname}\n\n**Display Name**\n${member?.displayName || targetUser.username}\n\n**Modification Rights**\n${canModify ? 'You can modify this nickname' : 'Insufficient role hierarchy'}\n\n**Management Actions**\nUse reset action to clear nickname\nRole hierarchy determines permissions\n\n**Nickname Guide**\n[Server Management](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-a-Role-Exclusive-Channel-)`)
        );

        components.push(managementContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🏷️ Nickname management requested by ${sender.tag} | Display name control`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

    
      if (subcommand === 'security') {
        const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
        const user = await client.users.fetch(targetUser.id, { force: true });
        const flags = user.flags?.toArray() || [];
        const hasAvatar = targetUser.avatar !== null;
        const isVerified = flags.includes('VerifiedBot') || flags.includes('VerifiedDeveloper');

        const securityScore =
          (accountAge > 30 ? 25 : accountAge > 7 ? 15 : 0) +
          (hasAvatar ? 20 : 0) +
          (flags.length > 0 ? 30 : 0) +
          (isVerified ? 25 : 0);

        const components = [];

        const securityContainer = new ContainerBuilder()
          .setAccentColor(securityScore > 70 ? 0x00ff00 : securityScore > 40 ? 0xffff00 : 0xff0000);

        securityContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🔐 Security Analysis\n## ${targetUser.tag} Account Assessment\n\n> Comprehensive account security evaluation and risk assessment\n> Identity verification and authenticity analysis`)
        );

        components.push(securityContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const scoreContainer = new ContainerBuilder()
          .setAccentColor(0x4CAF50);

        const riskLevel = securityScore > 70 ? 'Low Risk' : securityScore > 40 ? 'Medium Risk' : 'High Risk';
        const riskColor = securityScore > 70 ? '🟢' : securityScore > 40 ? '🟡' : '🔴';

        scoreContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📊 **Security Assessment**\n\n**Security Score**\n${securityScore}/100 points\n\n**Risk Level**\n${riskColor} ${riskLevel}\n\n**Assessment Status**\n${securityScore > 70 ? 'Trusted Account' : securityScore > 40 ? 'Moderate Verification' : 'Limited Verification'}\n\n**Security Guide**\n[Account Security](https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication)`)
        );

        components.push(scoreContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const factorsContainer = new ContainerBuilder()
          .setAccentColor(0x2196F3);

        factorsContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🔍 **Security Factors**\n\n**Account Age**\n${accountAge > 30 ? '✅' : accountAge > 7 ? '⚠️' : '❌'} ${accountAge} days old\n\n**Profile Customization**\n${hasAvatar ? '✅' : '❌'} ${hasAvatar ? 'Custom avatar set' : 'Default avatar'}\n\n**Discord Recognition**\n${flags.length > 0 ? '✅' : '❌'} ${flags.length} badges earned\n\n**Verification Status**\n${isVerified ? '✅ Officially verified' : '❌ Standard account'}\n\n**Security Recommendations**\n${securityScore < 70 ? 'Enable 2FA | Complete profile | Participate in community' : 'Account shows strong verification indicators'}`)
        );

        components.push(factorsContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🔐 Security analysis requested by ${sender.tag} | Risk assessment`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

     
      if (subcommand === 'stats') {
        const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
        const serverAge = member ? Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)) : 0;
        const roles = member?.roles.cache.filter(r => r.name !== '@everyone') || [];
        const user = await client.users.fetch(targetUser.id, { force: true });
        const flags = user.flags?.toArray() || [];
        const mutuals = client.guilds.cache.filter(g => g.members.cache.has(targetUser.id));

        const components = [];

        const statsContainer = new ContainerBuilder()
          .setAccentColor(0x16a085);

        const overallScore = Math.floor((accountAge / 10) + (serverAge / 5) + (roles.size * 2) + (flags.length * 5) + (mutuals.size * 3));
        statsContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 📊 Advanced Statistics\n## ${targetUser.tag} Comprehensive Analytics\n\n> Complete user profile analytics and detailed metrics\n> Multi-dimensional analysis and scoring system`)
        );

        components.push(statsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const metricsContainer = new ContainerBuilder()
          .setAccentColor(0x1ABC9C);

        metricsContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📈 **Account Metrics**\n\n**Overall Score**\n${overallScore} analytics points\n\n**Account Age**\n${accountAge} days\n\n**Server Membership**\n${serverAge} days in this server\n\n**Discord Achievements**\n${flags.length} badges earned\n\n**Account Type**\n${targetUser.bot ? 'Bot Account' : 'Human User'}\n\n**Profile Link**\n[View Profile](https://discord.com/users/${targetUser.id})`)
        );

        components.push(metricsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const serverStatsContainer = new ContainerBuilder()
          .setAccentColor(0x48C9B0);

        if (member) {
          serverStatsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## 🎭 **Server Profile**\n\n**Role Count**\n${roles.size} assigned roles\n\n**Highest Role**\n${member.roles.highest.name}\n\n**Boost Status**\n${member.premiumSince ? 'Active Booster' : 'Not boosting'}\n\n**Permissions**\n${member.permissions.has('Administrator') ? 'Administrator' : 'Standard Member'}\n\n**Server Management**\n[Role Guide](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-a-Role-Exclusive-Channel-)`)
          );
        } else {
          serverStatsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
              .setContent(`## ❌ **Server Profile**\n\nUser is not a member of this server\n\nUnable to analyze server-specific statistics`)
          );
        }

        components.push(serverStatsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const networkContainer = new ContainerBuilder()
          .setAccentColor(0x76D7C4);

        const networkReach = mutuals.reduce((acc, g) => acc + g.memberCount, 0);
        const platformInfo = member?.presence?.clientStatus ? Object.keys(member.presence.clientStatus).join(', ') : 'Unknown';

        networkContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🌐 **Network Data**\n\n**Mutual Servers**\n${mutuals.size} shared communities\n\n**Network Reach**\n${networkReach.toLocaleString()} total members\n\n**Current Presence**\n${member?.presence?.status || 'offline'}\n\n**Active Platforms**\n${platformInfo}\n\n**Network Analysis**\n[Server Discovery](https://discord.com/discovery)`)
        );

        components.push(networkContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`📊 Advanced statistics requested by ${sender.tag} | Comprehensive analytics`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

    
      if (subcommand === 'help' || !subcommand) {
        const components = [];

        const helpContainer = new ContainerBuilder()
          .setAccentColor(0x3498db);

        helpContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🔍 User Command Center\n## Advanced User Analytics and Management\n\n> Comprehensive user profile analysis and administrative tools\n> Complete identity verification and relationship mapping`)
        );

        components.push(helpContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const profileContainer = new ContainerBuilder()
          .setAccentColor(0x5DADE2);

        profileContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 📊 **Profile Commands**\n\n**/user info** - Complete user profile analysis\n**/user avatar** - High-resolution avatar display\n**/user banner** - Profile banner viewer\n**/user createdat** - Account creation timeline\n**/user badges** - Discord achievements showcase\n\n**Profile Features**\nIdentity verification | Timeline analysis | Achievement tracking`)
        );

        components.push(profileContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const serverContainer = new ContainerBuilder()
          .setAccentColor(0x3498DB);

        serverContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🏰 **Server Commands**\n\n**/user roles** - Role hierarchy analysis\n**/user permissions** - Channel permissions scanner\n**/user joinedat** - Server join analytics\n**/user boosting** - Boost status tracker\n**/user nickname** - Nickname management (Admin)\n\n**Server Features**\nPermission analysis | Role management | Administrative tools`)
        );

        components.push(serverContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const networkContainer = new ContainerBuilder()
          .setAccentColor(0x2E86AB);

        networkContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`## 🌐 **Network Commands**\n\n**/user mutuals** - Mutual server analysis\n**/user activity** - Presence monitoring\n**/user security** - Account security assessment\n**/user stats** - Advanced statistics\n\n**Network Features**\nConnection mapping | Security analysis | Comprehensive analytics\n\n**Usage Examples**\n/user info @username | /user permissions @user #channel | /user security`)
        );

        components.push(networkContainer);

        const footerContainer = new ContainerBuilder()
          .setAccentColor(0x95A5A6);

        footerContainer.addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🔍 Advanced user tools | Comprehensive analytics platform | Version 2.0`)
        );

        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
        components.push(footerContainer);

        return sendReply(components);
      }

    
      const components = [];
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xff0000);

      errorContainer.addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# ❌ Unknown Command\n## Invalid Subcommand\n\n> Unknown subcommand: ${subcommand}\n> Use /user help to see all available commands`)
      );

      components.push(errorContainer);
      return sendReply(components);

    } catch (error) {
      console.error('Error in user command:', error);

      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xE74C3C);

      errorContainer.addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent('## ❌ **User Command Error**\n\nSomething went wrong while processing the user command. Please try again in a moment.')
      );

      const components = [errorContainer];

      if (isSlashCommand) {
        return interaction.editReply({
          components: components,
          flags: MessageFlags.IsComponentsV2
        });
      } else {
        return interaction.reply({
          components: components,
          flags: MessageFlags.IsComponentsV2
        });
      }
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