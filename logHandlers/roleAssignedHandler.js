const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    ThumbnailBuilder
} = require('discord.js');
const LogConfig = require('../models/serverLogs/LogConfig');
const QuarantineConfig = require('../models/qurantine/quarantineConfig');
const UserQuarantine = require('../models/qurantine/userQuarantine');
const RoleNickConfig = require('../models/rolenick/RoleNickConfig');
const logHandlersIcons = require('../UI/icons/loghandlers');

module.exports = async function guildMemberUpdateHandler(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        if (!newMember.guild) return;
        const guildId = newMember.guild.id;

        try {
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

            // === 1. Role Assignment Logging ===
            if (addedRoles.size > 0) {
                const config = await LogConfig.findOne({ guildId, eventType: 'roleAssigned' });
                if (config?.channelId) {
                    const logChannel = client.channels.cache.get(config.channelId);
                    if (logChannel) {
                        addedRoles.forEach(async role => {
                            const logContainer = new ContainerBuilder()
                                .setAccentColor(0x0000FF)
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(`# 🔵 Role Assigned\n## Member Permission Granted\n\n> Role assignment event detected\n> User access level upgraded`)
                                )
                                .addSectionComponents(
                                    new SectionBuilder()
                                        .addTextDisplayComponents(
                                            new TextDisplayBuilder()
                                                .setContent(`**User**\n${newMember.user.tag}\n\n**User ID**\n\`${newMember.id}\`\n\n**Assigned Role**\n${role.name}\n\n**Role ID**\n\`${role.id}\`\n\n**Role Color**\n${role.hexColor || '#000000'}\n\n**Role Position**\nPosition ${role.position}\n\n**Role Properties**\n${role.mentionable ? '✅ Mentionable' : '❌ Not mentionable'}\n${role.hoist ? '✅ Hoisted (displayed separately)' : '❌ Not hoisted'}\n\n**Assigned At**\n<t:${Math.floor(Date.now() / 1000)}:F>`)
                                        )
                                        .setThumbnailAccessory(
                                            new ThumbnailBuilder()
                                                .setURL(logHandlersIcons.assignedIcon)
                                                .setDescription(`Role assignment notification`)
                                        )
                                )
                                .addSeparatorComponents(
                                    new SeparatorBuilder()
                                        .setSpacing(SeparatorSpacingSize.Small)
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(`*Logs System • <t:${Math.floor(Date.now() / 1000)}:R>*`)
                                );

                            try {
                                await logChannel.send({
                                    components: [logContainer],
                                    flags: MessageFlags.IsComponentsV2
                                });
                            } catch (e) {
                                //console.warn(`Failed to log role assignment: ${e.message}`);
                            }
                        });
                    }
                }
            }

            // === 2. Quarantine Role Enforcement ===
            const quarantineConfig = await QuarantineConfig.findOne({ guildId });
            if (quarantineConfig?.quarantineEnabled) {
                const quarantineRole = newMember.guild.roles.cache.get(quarantineConfig.quarantineRoleId);
                if (quarantineRole) {
                    const userQuarantine = await UserQuarantine.findOne({ userId: newMember.id, guildId });
                    if (
                        userQuarantine?.isQuarantined &&
                        oldMember.roles.cache.has(quarantineRole.id) &&
                        !newMember.roles.cache.has(quarantineRole.id)
                    ) {
                        try {
                            await newMember.roles.add(quarantineRole);
                        } catch (err) {
                            console.warn(`Failed to reapply quarantine role: ${err.message}`);
                        }

                        try {
                            await newMember.send('⚠ Quarantine Role cannot be removed manually.');
                        } catch {
                            // DM failed silently (user DMs off)
                        }
                    }
                } else {
                    //console.warn(`Quarantine role ID ${quarantineConfig.quarantineRoleId} not found in cache.`);
                }
            }

            // === 3. Auto Nickname Format ===
            const nickConfig = await RoleNickConfig.findOne({ guildId });
            if (nickConfig?.roles?.length > 0 && addedRoles.size > 0) {
                for (const roleEntry of nickConfig.roles) {
                    if (addedRoles.has(roleEntry.roleId)) {
                        const role = newMember.guild.roles.cache.get(roleEntry.roleId);
                        if (!role) continue;

                        const baseName = newMember.displayName;

                        let formattedNickname = roleEntry.nicknameFormat
                            .replace('{ROLE}', role.name)
                            .replace('{USERNAME}', baseName)
                            .trim();

                        if (!formattedNickname.includes(baseName)) {
                            formattedNickname += ` ${baseName}`;
                        }

                        if (formattedNickname.length > 32) {
                            formattedNickname = formattedNickname.slice(0, 32);
                        }

                        try {
                            await newMember.setNickname(formattedNickname);
                        } catch (err) {
                            //console.warn(`Failed to set nickname for ${newMember.user.tag}: ${err.message}`);
                        }

                        break;
                    }
                }
            }

            // === 4. Role Nickname Reversion on Role Removal ===
            if (nickConfig?.roles?.length > 0) {
                const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

                for (const roleEntry of nickConfig.roles) {
                    if (removedRoles.has(roleEntry.roleId)) {
                        const currentNickname = newMember.nickname || null;
                        const displayName = newMember.displayName;

                        const role = newMember.guild.roles.cache.get(roleEntry.roleId);
                        if (!role) continue;

                        const expectedNickname = roleEntry.nicknameFormat
                            .replace('{ROLE}', role.name)
                            .replace('{USERNAME}', displayName)
                            .trim();

                        if (currentNickname && currentNickname.includes(role.name)) {
                            try {
                                await newMember.setNickname(null);
                            } catch (err) {
                                console.warn(`Failed to reset nickname for ${newMember.user.tag}: ${err.message}`);
                            }
                        }

                        break;
                    }
                }
            }

        } catch (err) {
            //console.error('⚠ Error in guildMemberUpdate handler (outer catch):', err);
        }
    });
};
