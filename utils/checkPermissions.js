const { EmbedBuilder } = require('discord.js');
const serverConfigController = require('../models/serverConfig/Controller');
const cmdIcons = require('../UI/icons/commandicons');

/**
 * Check permissions with hierarchical support for both slash commands and prefix commands
 * @param {Object} context - Discord interaction OR message object
 * @param {String} requiredLevel - 'owner' | 'botmanager' | 'admin' | 'moderator'
 * @returns {Boolean} - true if user has permission, false otherwise
 * 
 * Hierarchy: Owner > Bot Manager > Admin > Moderator
 * Higher roles can access lower role commands
 */
module.exports = async function checkPermissions(context, requiredLevel = 'botmanager') {

  const isInteraction = context.isCommand && context.isCommand();
  

  const guild = isInteraction ? context.guild : context.guild;
  const user = isInteraction ? context.user : context.author;
  const member = isInteraction ? context.member : context.member;
  const serverId = guild.id;


  if (!guild || !user || !member) {
    console.error('checkPermissions: Missing guild, user, or member data');
    return false;
  }

  const configData = await serverConfigController.getConfig(serverId);
  const botManagers = configData?.botManagers || [];
  const adminRoles = configData?.adminRoles || [];
  const modRoles = configData?.modRoles || [];

  const isOwner = user.id === guild.ownerId;
  const isBotManager = botManagers.includes(user.id);
  const hasAdminRole = adminRoles.some(roleId => member.roles.cache.has(roleId));
  const hasModRole = modRoles.some(roleId => member.roles.cache.has(roleId));


  let hasPermission = false;
  
  switch (requiredLevel) {
    case 'owner':
      hasPermission = isOwner;
      break;
    
    case 'botmanager':
      hasPermission = isOwner || isBotManager;
      break;
    
    case 'admin':
      hasPermission = isOwner || isBotManager || hasAdminRole;
      break;
    
    case 'moderator':
      hasPermission = isOwner || isBotManager || hasAdminRole || hasModRole;
      break;
    
    default:
      hasPermission = isOwner || isBotManager;
      break;
  }

  if (!hasPermission) {
    const levelText = {
      'owner': '**server owner**',
      'botmanager': '**server owner** or **bot managers**',
      'admin': '**server owner**, **bot managers**, or **admin roles**',
      'moderator': '**server owner**, **bot managers**, **admin roles**, or **moderator roles**'
    }[requiredLevel] || '**authorized users**';

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setAuthor({
        name: 'Permission Denied',
        iconURL: cmdIcons.rippleIcon,
        url: "https://discord.gg/xQF9f9yUEM"
      })
      .setDescription(
        `- Only ${levelText} can use this command.\n` +
        '- If you believe this is a mistake, please contact the server owner or a bot manager.\n' +
        '- If you are the server owner, configure permissions using **/setup-serverconfig**.'
      );


    if (isInteraction) {
      await context.reply({
        embeds: [embed],
        ephemeral: true
      });

      setTimeout(() => {
        context.deleteReply().catch(() => {});
      }, 5000);
    } else {
      const reply = await context.reply({ embeds: [embed] });
      
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);
    }

    return false;
  }

  return true;
};
