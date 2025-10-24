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
    PermissionsBitField, 
    PermissionFlagsBits,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('🎭 Advanced role management and administration system')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to a user with logging')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to give the role to')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to be added')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for adding the role')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from a user with logging')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to remove the role from')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to be removed')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing the role')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new role with advanced settings')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the new role')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Role template type')
                        .setRequired(false)
                        .addChoices(
                            { name: '👑 Administrator', value: 'administrator' },
                            { name: '🛡️ Moderator', value: 'moderator' },
                            { name: '👮 Staff', value: 'staff' },
                            { name: '🎯 Helper', value: 'helper' },
                            { name: '🌟 VIP', value: 'vip' },
                            { name: '💎 Booster', value: 'booster' },
                            { name: '👤 Member', value: 'member' },
                            { name: '🎨 Custom', value: 'custom' }
                        ))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Role color (hex or name: red, blue, green, etc.)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('hoist')
                        .setDescription('Display role separately in member list')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('mentionable')
                        .setDescription('Allow role to be mentioned by everyone')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit an existing role properties')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to edit')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('New role name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('New role color')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('hoist')
                        .setDescription('Display separately in member list')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('mentionable')
                        .setDescription('Allow role mentions')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a role with confirmation')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to delete')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for deletion')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clone')
                .setDescription('Clone an existing role with all settings')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to clone')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name for the cloned role')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get detailed information about a role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to analyze')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('members')
                .setDescription('List all members with a specific role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to check members for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Maximum members to show (1-50)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(50)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all server roles with details')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter roles by type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'All Roles', value: 'all' },
                            { name: 'Administrative', value: 'admin' },
                            { name: 'Mentionable', value: 'mentionable' },
                            { name: 'Hoisted', value: 'hoisted' },
                            { name: 'Bot Roles', value: 'bot' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('massadd')
                .setDescription('Add a role to multiple users at once')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to add to all users')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('users')
                        .setDescription('User IDs separated by spaces (max 10)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for mass role addition')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('massremove')
                .setDescription('Remove a role from multiple users at once')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to remove from all users')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('users')
                        .setDescription('User IDs separated by spaces (max 10)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for mass role removal')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('hierarchy')
                .setDescription('Show server role hierarchy and permissions')
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Number of roles to display (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('permissions')
                .setDescription('Manage role permissions in detail')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to manage permissions for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Permission action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'View Permissions', value: 'view' },
                            { name: 'Add Permissions', value: 'add' },
                            { name: 'Remove Permissions', value: 'remove' },
                            { name: 'Reset Permissions', value: 'reset' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cleanup')
                .setDescription('Remove roles from inactive or left members')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to clean up')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Days of inactivity (default: 30)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(365)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Show comprehensive role statistics')
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Number of roles to analyze (1-50)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(50)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Show comprehensive role management help')),
    
    async execute(interaction) {
        if (!await checkPermissions(interaction, 'admin')) return;

        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;

        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply();
            subcommand = interaction.options.getSubcommand();
        } else {
            return;
        }

        const sendReply = async (components) => {
            if (isSlashCommand) {
                return interaction.editReply({ components: components, flags: MessageFlags.IsComponentsV2 });
            } else {
                return interaction.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }
        };

    
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff0000)
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent('**🔒 ACCESS DENIED**\nRequired Permission: MANAGE_ROLES\nContact server administrators for access.')
                );

            return sendReply([errorContainer]);
        }

        const guild = interaction.guild;

      
        const getColorValue = (color) => {
            const colorOptions = {
                red: 0xFF0000, blue: 0x0000FF, green: 0x008000, yellow: 0xFFFF00,
                purple: 0x800080, orange: 0xFFA500, cyan: 0x00FFFF, pink: 0xFFC0CB,
                white: 0xFFFFFF, black: 0x000000, gold: 0xFFD700, silver: 0xC0C0C0
            };

            if (colorOptions[color?.toLowerCase()]) {
                return colorOptions[color.toLowerCase()];
            } else if (/^#?([0-9A-F]{3}){1,2}$/i.test(color)) {
                return parseInt(color.replace('#', ''), 16);
            }
            return null;
        };

        const getRoleTemplate = (type) => {
            const templates = {
                administrator: {
                    permissions: [PermissionFlagsBits.Administrator],
                    color: 0xFF0000
                },
                moderator: {
                    permissions: [
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.ModerateMembers,
                        PermissionFlagsBits.ManageMessages
                    ],
                    color: 0xFF6B6B
                },
                staff: {
                    permissions: [
                        PermissionFlagsBits.ModerateMembers,
                        PermissionFlagsBits.ManageMessages
                    ],
                    color: 0x3498DB
                },
                helper: {
                    permissions: [PermissionFlagsBits.ManageMessages],
                    color: 0x2ECC71
                },
                vip: {
                    permissions: [PermissionFlagsBits.UseExternalEmojis],
                    color: 0xF39C12
                },
                booster: {
                    permissions: [PermissionFlagsBits.UseExternalEmojis],
                    color: 0xE91E63
                },
                member: {
                    permissions: [],
                    color: 0x95A5A6
                },
                custom: {
                    permissions: [],
                    color: 0x9B59B6
                }
            };
            return templates[type] || templates.custom;
        };

        switch (subcommand) {
            case 'help': {
                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498db)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🎭 ADVANCED ROLE MANAGEMENT SYSTEM**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent('**📋 Comprehensive Role Administration**\nPowerful tools for complete role management and server organization')
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Role management')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**👤 User Role Management:**\n• `add` - Add roles to users with logging\n• `remove` - Remove roles from users\n• `massadd` - Add roles to multiple users\n• `massremove` - Remove roles from multiple users')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**⚙️ Role Creation & Editing:**\n• `create` - Create roles with templates\n• `edit` - Modify existing role properties\n• `clone` - Duplicate roles with settings\n• `delete` - Remove roles safely')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 Information & Analytics:**\n• `info` - Detailed role information\n• `members` - List role members\n• `list` - Server role directory\n• `stats` - Role usage statistics')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🔧 Advanced Features:**\n• `hierarchy` - Role hierarchy display\n• `permissions` - Advanced permission management\n• `cleanup` - Remove inactive member roles\n• **Role Templates** - Pre-configured role types')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🎯 Template Types:**\n👑 Administrator • 🛡️ Moderator • 👮 Staff • 🎯 Helper\n🌟 VIP • 💎 Booster • 👤 Member • 🎨 Custom')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**💡 Usage Examples:**\n• \`/role add @user @role\`\n• \`/role create "Support Staff" type:staff color:blue\`\n• \`/role massadd @role "123 456 789"\`\n\n**Help by ${sender.tag} | Role System v4.0**`)
                    );

                return sendReply([helpContainer]);
            }

            case 'add': {
                const target = interaction.options.getUser('target');
                const role = interaction.options.getRole('role');
                const reason = interaction.options.getString('reason') || 'No reason provided';
                const member = guild.members.cache.get(target.id);

                if (!member) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ MEMBER NOT FOUND**\n**${target.tag}** is not in this server.`)
                        );
                    return sendReply([errorContainer]);
                }

                if (member.roles.cache.has(role.id)) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xffa500)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**⚠️ ROLE ALREADY ASSIGNED**\n**${target.tag}** already has the **${role.name}** role.`)
                        );
                    return sendReply([errorContainer]);
                }

                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ INSUFFICIENT HIERARCHY**\nCannot add **${role.name}** - role is above bot's highest role in hierarchy.`)
                        );
                    return sendReply([errorContainer]);
                }

                try {
                    await member.roles.add(role, `${reason} | Added by ${sender.tag}`);

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**✅ ROLE ADDED SUCCESSFULLY**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addSectionComponents(
                            section => section
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Role Added:** ${role.name}\n**Added By:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                                )
                                .setThumbnailAccessory(
                                    thumbnail => thumbnail
                                        .setURL(target.displayAvatarURL({ dynamic: true }))
                                        .setDescription(`${target.tag} avatar`)
                                )
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Role Color:** ${role.hexColor}\n**Role Position:** ${role.position}\n**Total Roles:** ${member.roles.cache.size + 1}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Operation ID:** ${target.id} | Role management system`)
                        );

                    return sendReply([successContainer]);
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ ROLE ADDITION FAILED**\nFailed to add **${role.name}** to **${target.tag}**.\n\n**Possible causes:** Insufficient permissions, role hierarchy issues, or API error.`)
                        );
                    return sendReply([errorContainer]);
                }
            }

            case 'remove': {
                const target = interaction.options.getUser('target');
                const role = interaction.options.getRole('role');
                const reason = interaction.options.getString('reason') || 'No reason provided';
                const member = guild.members.cache.get(target.id);

                if (!member) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ MEMBER NOT FOUND**\n**${target.tag}** is not in this server.`)
                        );
                    return sendReply([errorContainer]);
                }

                if (!member.roles.cache.has(role.id)) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xffa500)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**⚠️ ROLE NOT ASSIGNED**\n**${target.tag}** does not have the **${role.name}** role.`)
                        );
                    return sendReply([errorContainer]);
                }

                try {
                    await member.roles.remove(role, `${reason} | Removed by ${sender.tag}`);

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0xe74c3c)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**🗑️ ROLE REMOVED SUCCESSFULLY**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addSectionComponents(
                            section => section
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Target:** ${target.tag}\n**Role Removed:** ${role.name}\n**Removed By:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                                )
                                .setThumbnailAccessory(
                                    thumbnail => thumbnail
                                        .setURL(target.displayAvatarURL({ dynamic: true }))
                                        .setDescription(`${target.tag} avatar`)
                                )
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Reason:** ${reason}\n**Role Color:** ${role.hexColor}\n**Role Position:** ${role.position}\n**Remaining Roles:** ${member.roles.cache.size - 1}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Operation ID:** ${target.id} | Role management system`)
                        );

                    return sendReply([successContainer]);
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ ROLE REMOVAL FAILED**\nFailed to remove **${role.name}** from **${target.tag}**.\n\n**Possible causes:** Insufficient permissions, role hierarchy issues, or API error.`)
                        );
                    return sendReply([errorContainer]);
                }
            }

            case 'create': {
                const name = interaction.options.getString('name');
                const type = interaction.options.getString('type') || 'custom';
                const color = interaction.options.getString('color');
                const hoist = interaction.options.getBoolean('hoist') ?? false;
                const mentionable = interaction.options.getBoolean('mentionable') ?? false;

                const template = getRoleTemplate(type);
                const roleColor = getColorValue(color) ?? template.color;

                try {
                    const role = await guild.roles.create({
                        name: name,
                        color: roleColor,
                        permissions: template.permissions,
                        hoist: hoist,
                        mentionable: mentionable,
                        reason: `Role created by ${sender.tag} using role management system`
                    });

                    const createContainer = new ContainerBuilder()
                        .setAccentColor(roleColor)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent('**✨ ROLE CREATED SUCCESSFULLY**')
                        )
                        .addSeparatorComponents(separator => separator)
                        .addSectionComponents(
                            section => section
                                .addTextDisplayComponents(
                                    textDisplay => textDisplay.setContent(`**Role Name:** ${role.name}\n**Template:** ${type}\n**Created By:** ${sender.tag}\n**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                                )
                                .setThumbnailAccessory(
                                    thumbnail => thumbnail
                                        .setURL(sender.displayAvatarURL({ dynamic: true }))
                                        .setDescription('Role creation')
                                )
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**🎨 Appearance:**\n• **Color:** ${role.hexColor}\n• **Hoisted:** ${hoist ? '✅ Yes' : '❌ No'}\n• **Mentionable:** ${mentionable ? '✅ Yes' : '❌ No'}\n• **Position:** ${role.position}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**🔐 Permissions:**\n${template.permissions.length > 0 ? template.permissions.map(p => `• ${Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === p)}`).join('\n') : '• No special permissions'}\n**Total Permissions:** ${template.permissions.length}`)
                        )
                        .addSeparatorComponents(separator => separator)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**Role ID:** ${role.id} | Creation successful`)
                        );

                    return sendReply([createContainer]);
                } catch (error) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            textDisplay => textDisplay.setContent(`**❌ ROLE CREATION FAILED**\nFailed to create role **${name}**.\n\n**Possible causes:** Invalid name, server role limit reached (250 max), or insufficient permissions.`)
                        );
                    return sendReply([errorContainer]);
                }
            }

            case 'info': {
                const role = interaction.options.getRole('role');

                const permissions = role.permissions.toArray();
                const members = role.members;

                const infoContainer = new ContainerBuilder()
                    .setAccentColor(role.color || 0x34495e)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🎭 DETAILED ROLE INFORMATION**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Role Name:** ${role.name}\n**Role ID:** ${role.id}\n**Color:** ${role.hexColor}\n**Position:** ${role.position}`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Role information')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**👥 Member Information:**\n• **Total Members:** ${members.size}\n• **Percentage:** ${((members.size / guild.memberCount) * 100).toFixed(1)}%\n• **Created:** <t:${Math.floor(role.createdTimestamp / 1000)}:F>\n• **Age:** <t:${Math.floor(role.createdTimestamp / 1000)}:R>`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🎨 Display Settings:**\n• **Color Value:** ${role.color}\n• **Hoisted:** ${role.hoist ? '✅ Yes' : '❌ No'}\n• **Mentionable:** ${role.mentionable ? '✅ Yes' : '❌ No'}\n• **Managed:** ${role.managed ? '🤖 Bot Role' : '👤 Regular Role'}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🔐 Permissions Overview:**\n• **Total Permissions:** ${permissions.length}\n• **Administrator:** ${permissions.includes('Administrator') ? '⚠️ Yes' : '✅ No'}\n• **Dangerous Perms:** ${permissions.filter(p => ['Administrator', 'ManageGuild', 'BanMembers', 'KickMembers'].includes(p)).length}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🏆 Top Members:** ${members.size > 0 ? members.first(5).map(m => m.user.username).join(', ') : 'No members'}${members.size > 5 ? `\n**+${members.size - 5} more members...**` : ''}\n\n**Analysis for ${role.id}**`)
                    );

                return sendReply([infoContainer]);
            }

            case 'list': {
                const filter = interaction.options.getString('filter') || 'all';
                let roles = guild.roles.cache;

                switch (filter) {
                    case 'admin':
                        roles = roles.filter(role => role.permissions.has(PermissionFlagsBits.Administrator));
                        break;
                    case 'mentionable':
                        roles = roles.filter(role => role.mentionable);
                        break;
                    case 'hoisted':
                        roles = roles.filter(role => role.hoist);
                        break;
                    case 'bot':
                        roles = roles.filter(role => role.managed);
                        break;
                    default:
                        roles = roles.filter(role => role.name !== '@everyone');
                        break;
                }

                const sortedRoles = roles.sort((a, b) => b.position - a.position).first(15);

                const listContainer = new ContainerBuilder()
                    .setAccentColor(0x9b59b6)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**🎭 SERVER ROLE DIRECTORY**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Server:** ${guild.name}\n**Filter:** ${filter.toUpperCase()}\n**Total Roles:** ${guild.roles.cache.size}\n**Showing:** ${sortedRoles.length} roles`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Server roles')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**📋 Role Listing:**\n${sortedRoles.map(role => {
                            const memberCount = role.members.size;
                            const permissions = role.permissions.toArray().length;
                            const indicators = [];
                            if (role.hoist) indicators.push('📌');
                            if (role.mentionable) indicators.push('💬');
                            if (role.managed) indicators.push('🤖');
                            if (role.permissions.has(PermissionFlagsBits.Administrator)) indicators.push('👑');
                            
                            return `**${role.name}** ${indicators.join('')}\n   └ ${memberCount} members • ${permissions} perms • Pos ${role.position}`;
                        }).join('\n\n')}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**Legend:** 📌 Hoisted • 💬 Mentionable • 🤖 Bot Role • 👑 Admin\n**Directory by ${sender.tag}**`)
                    );

                return sendReply([listContainer]);
            }

            case 'stats': {
                const limit = interaction.options.getInteger('limit') || 20;
                const roles = guild.roles.cache
                    .filter(role => role.name !== '@everyone')
                    .sort((a, b) => b.members.size - a.members.size)
                    .first(limit);

                const totalMembers = guild.memberCount;
                const adminRoles = guild.roles.cache.filter(r => r.permissions.has(PermissionFlagsBits.Administrator)).size;
                const managedRoles = guild.roles.cache.filter(r => r.managed).size;
                const hoistedroles = guild.roles.cache.filter(r => r.hoist).size;

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0xf39c12)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent('**📊 COMPREHENSIVE ROLE STATISTICS**')
                    )
                    .addSeparatorComponents(separator => separator)
                    .addSectionComponents(
                        section => section
                            .addTextDisplayComponents(
                                textDisplay => textDisplay.setContent(`**Server:** ${guild.name}\n**Total Roles:** ${guild.roles.cache.size}\n**Analyzed:** ${roles.length} roles\n**Generated:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                            )
                            .setThumbnailAccessory(
                                thumbnail => thumbnail
                                    .setURL(guild.iconURL({ dynamic: true }) || sender.displayAvatarURL({ dynamic: true }))
                                    .setDescription('Role analytics')
                            )
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**📈 Server Overview:**\n• **Total Members:** ${totalMembers.toLocaleString()}\n• **Admin Roles:** ${adminRoles}\n• **Bot Roles:** ${managedRoles}\n• **Hoisted Roles:** ${hoistedroles}\n• **Mentionable:** ${guild.roles.cache.filter(r => r.mentionable).size}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🏆 Most Popular Roles:**\n${roles.slice(0, 10).map((role, i) => {
                            const percentage = ((role.members.size / totalMembers) * 100).toFixed(1);
                            return `${i + 1}. **${role.name}** - ${role.members.size} members (${percentage}%)`;
                        }).join('\n')}`)
                    )
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**🎨 Color Distribution:**\n• **Custom Colors:** ${guild.roles.cache.filter(r => r.color !== 0).size}\n• **Default Color:** ${guild.roles.cache.filter(r => r.color === 0).size}\n• **Average Members/Role:** ${Math.round(guild.roles.cache.reduce((acc, r) => acc + r.members.size, 0) / guild.roles.cache.size)}`))
                    .addSeparatorComponents(separator => separator)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**📊 Role Health:**\n• **Empty Roles:** ${guild.roles.cache.filter(r => r.members.size === 0 && !r.managed).size}\n• **Single Member:** ${guild.roles.cache.filter(r => r.members.size === 1).size}\n• **Utilization:** ${((guild.roles.cache.filter(r => r.members.size > 0).size / guild.roles.cache.size) * 100).toFixed(1)}%\n\n**Statistics by ${sender.tag}**`)
                    );

                return sendReply([statsContainer]);
            }

            default: {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xff4757)
                    .addTextDisplayComponents(
                        textDisplay => textDisplay.setContent(`**❌ UNKNOWN SUBCOMMAND**\nUnknown subcommand: \`${subcommand}\`\n\nUse \`/role help\` to see all available commands.`)
                    );
                return sendReply([errorContainer]);
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