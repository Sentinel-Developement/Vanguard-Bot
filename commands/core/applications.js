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
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    MessageFlags
} = require('discord.js');

let ContainerBuilder, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize;

try {
    ({
        ContainerBuilder,
        SectionBuilder,
        TextDisplayBuilder,
        ThumbnailBuilder,
        SeparatorBuilder,
        SeparatorSpacingSize
    } = require('discord.js'));
} catch (error) {
    const { EmbedBuilder } = require('discord.js');
}

const checkPermissions = require('../../utils/checkPermissions');
const { 
    createApplication, 
    deleteApplication, 
    activateApplication, 
    getApplication, 
    addQuestion, 
    removeQuestion
} = require('../../models/applications/controller');
const Application = require('../../models/applications/applications');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('applications')
        .setDescription('📋 Manage applications.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new application.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the application.')
                        .setRequired(true)
                        .setMaxLength(30)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an application.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the application.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('activate')
                .setDescription('Activate an application.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the application.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addquestion')
                .setDescription('Add a question to an application.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('The question to add (max 45 characters).')
                        .setRequired(true)
                        .setMaxLength(45)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removequestion')
                .setDescription('Remove a question from an application.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The question index to remove.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setmainchannel')
                .setDescription('Set the main channel for an application.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The main channel for applications.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setresponsechannel')
                .setDescription('Set the response channel for application reviews.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The response channel for application reviews.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Get help with setting up applications.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show all applications and their details.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;

            await interaction.deferReply();
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;

       
            const sendReply = async (content, components = null, isV2 = false) => {
                try {
                    const messageData = {};
                    
                    if (isV2 && ContainerBuilder) {
                        messageData.components = Array.isArray(content) ? content : [content];
                        messageData.flags = MessageFlags.IsComponentsV2;
                    } else {
                      
                        if (typeof content === 'string') {
                            messageData.content = content;
                        } else {
                            messageData.embeds = Array.isArray(content) ? content : [content];
                        }
                        if (components) {
                            messageData.components = components;
                        }
                    }
                    
                    return interaction.editReply(messageData);
                } catch (error) {
                    console.error('Error sending reply:', error);
                  
                    return interaction.editReply({ content: 'An error occurred while processing your request.' });
                }
            };

            if (subcommand === 'create') {
                const name = interaction.options.getString('name');
                
                if (await getApplication(guildId, name)) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Already Exists\n## Duplicate Application Name\n\n> Application **${name}** already exists in this server\n> Please choose a different name for your application`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Small)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`*Error reported by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** already exists.`);
                    }
                }

                await createApplication(guildId, name);

                if (ContainerBuilder) {
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x00ff00)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ✅ Application Created Successfully\n## ${name} - New Application System\n\n> Application **${name}** has been created successfully\n> You can now add questions and configure channels`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Large)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 📋 **Next Steps**\n\n**Add Questions**\n/applications addquestion appname:${name}\n\n**Set Main Channel**\n/applications setmainchannel appname:${name}\n\n**Set Response Channel**\n/applications setresponsechannel appname:${name}\n\n**Activate Application**\n/applications activate name:${name}`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*📋 Application created by ${interaction.user.tag} • Application management system*`)
                        );

                    return sendReply([successContainer], null, true);
                } else {
                    return sendReply(`✅ Application **${name}** has been created.`);
                }

            } else if (subcommand === 'delete') {
                const name = interaction.options.getString('name');
                
                const appExists = await getApplication(guildId, name);
                if (!appExists) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Not Found\n## Missing Application\n\n> Application **${name}** does not exist\n> Use /applications show to view all available applications`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Small)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`*Error reported by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** not found.`);
                    }
                }
                
                const deleted = await deleteApplication(guildId, name);
                
                if (deleted) {
                    if (ContainerBuilder) {
                        const successContainer = new ContainerBuilder()
                            .setAccentColor(0xff6b6b)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 🗑️ Application Deleted\n## ${name} - Removal Complete\n\n> Application **${name}** has been permanently deleted\n> All associated data and questions have been removed`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Small)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`*🗑️ Application deleted by ${interaction.user.tag} • Management action*`)
                            );

                        return sendReply([successContainer], null, true);
                    } else {
                        return sendReply(`🗑️ Application **${name}** has been deleted.`);
                    }
                } else {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Deletion Failed\n## Database Error\n\n> Failed to delete application **${name}**\n> Please try again or contact system administrator`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Small)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`*Error reported by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Failed to delete application **${name}**. Please try again.`);
                    }
                }

            } else if (subcommand === 'activate') {
                const name = interaction.options.getString('name');
                const app = await getApplication(guildId, name);
            
                if (!app) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Not Found\n## Missing Application\n\n> Application **${name}** does not exist\n> Use /applications show to view all available applications`)
                            );
            
                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** not found.`);
                    }
                }
            
                if (!app.mainChannel || !app.responseChannel) {
                    if (ContainerBuilder) {
                        const warningContainer = new ContainerBuilder()
                            .setAccentColor(0xffa500)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ⚠️ Configuration Incomplete\n## Missing Channel Setup\n\n> Please set both main and response channels before activation\n> Use the channel setup commands to configure your application`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`## 🔧 **Required Setup**\n\n**Set Main Channel**\n/applications setmainchannel appname:${name}\n\n**Set Response Channel**\n/applications setresponsechannel appname:${name}`)
                            );
            
                        return sendReply([warningContainer], null, true);
                    } else {
                        return sendReply(`⚠️ Please set the main and response channels first.`);
                    }
                }
            
                await activateApplication(guildId, name, app.mainChannel, app.responseChannel);
            
           
                const mainChannel = interaction.guild.channels.cache.get(app.mainChannel);
                if (mainChannel) {
                    if (ContainerBuilder) {
                        const applicationFormContainer = new ContainerBuilder()
                            .setAccentColor(0x0099ff)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 📋 Application System\n## Welcome To Our Application System\n\n> Application: **${name}**\n\n> Click the button below to fill out the application\n> Make sure to provide accurate information\n> Your responses will be reviewed by the moderators`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Large)
                            )
                            .addSectionComponents(
                                new SectionBuilder()
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder()
                                            .setContent(`## 📝 **Application Guidelines**\n\n**Before Applying**\nRead all requirements carefully\nEnsure you meet the criteria\n\n**Application Process**\nComplete all required fields\nProvide honest and detailed responses\nWait for moderator review\n\n**Support**\nFor any questions, please contact support\nThank you for your interest!`)
                                    )
                                    .setButtonAccessory(
                                        new (require('discord.js').ButtonBuilder)()
                                            .setCustomId(`open_application_modal_${name}`)
                                            .setLabel('Apply Now')
                                            .setStyle(ButtonStyle.Primary)
                                    )
                            );
            
                        await mainChannel.send({ 
                            components: [applicationFormContainer],
                            flags: MessageFlags.IsComponentsV2
                        });
                    } else {
                        
                        const embed = new (require('discord.js').EmbedBuilder)()
                            .setDescription(`Application : **${name}**\n\n- Click the button below to fill out the application.\n- Make sure to provide accurate information.\n- Your responses will be reviewed by the moderators.\n\n- For any questions, please contact support.`)
                            .setColor('Blue')
                            .setAuthor({ name: 'Welcome To Our Application System', iconURL: 'https://cdn.discordapp.com/emojis/1052751247582699621.gif' })
                            .setFooter({ text: 'Thank you for your interest!', iconURL: 'https://cdn.discordapp.com/emojis/798605720626003968.gif' });
            
                        const button = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`open_application_modal_${name}`)
                                .setLabel('Apply Now')
                                .setStyle(ButtonStyle.Primary)
                        );
            
                        await mainChannel.send({ embeds: [embed], components: [button] });
                    }
                }
            
                if (ContainerBuilder) {
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x00ff00)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ✅ Application Activated\n## ${name} - Now Live\n\n> Application **${name}** is now active and accepting submissions\n> Application form has been posted in the designated channel`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*📋 Application activated by ${interaction.user.tag} • System online*`)
                        );
            
                    return sendReply([successContainer], null, true);
                } else {
                    return sendReply(`✅ Application **${name}** is now active.`);
                }
            
            }
                 else if (subcommand === 'addquestion') {
                const name = interaction.options.getString('appname');
                const questionText = interaction.options.getString('question');
            
                const app = await getApplication(guildId, name);
                if (!app) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Not Found\n## Missing Application\n\n> Application **${name}** does not exist\n> Use /applications show to view all available applications`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** not found.`);
                    }
                }

                if (app.questions.length >= 5) {
                    if (ContainerBuilder) {
                        const warningContainer = new ContainerBuilder()
                            .setAccentColor(0xffa500)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ⚠️ Question Limit Reached\n## Maximum Questions Exceeded\n\n> You can't add more than 5 questions to an application\n> Remove existing questions to add new ones`)
                            );

                        return sendReply([warningContainer], null, true);
                    } else {
                        return sendReply(`⚠️ You can't add more than 5 questions.`);
                    }
                }
            
                await addQuestion(guildId, name, questionText);

                if (ContainerBuilder) {
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x00ff00)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ✅ Question Added\n## ${name} - Question Management\n\n> Question successfully added to application **${name}**\n> Users will see this question when applying`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Large)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 📝 **Added Question**\n\n**Question Text**\n${questionText}\n\n**Question Count**\n${app.questions.length + 1}/5 questions\n\n**Next Steps**\nAdd more questions (if needed)\nConfigure channels\nActivate application`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*📝 Question added by ${interaction.user.tag} • Application configuration*`)
                        );

                    return sendReply([successContainer], null, true);
                } else {
                    return sendReply(`✅ Question added to **${name}**.`);
                }

            } else if (subcommand === 'removequestion') {
                const name = interaction.options.getString('appname');
                const index = interaction.options.getInteger('index');

                const app = await getApplication(guildId, name);
                if (!app) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Not Found\n## Missing Application\n\n> Application **${name}** does not exist\n> Use /applications show to view all available applications`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** not found.`);
                    }
                }

                await removeQuestion(guildId, name, index);

                if (ContainerBuilder) {
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0xff6b6b)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🗑️ Question Removed\n## ${name} - Question Management\n\n> Question **#${index}** has been removed from **${name}**\n> The application form has been updated`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*🗑️ Question removed by ${interaction.user.tag} • Application modified*`)
                        );

                    return sendReply([successContainer], null, true);
                } else {
                    return sendReply(`🗑️ Removed question **#${index}** from **${name}**.`);
                }

            } else if (subcommand === 'setmainchannel') {
                const name = interaction.options.getString('appname');
                const channel = interaction.options.getChannel('channel');

                const app = await getApplication(guildId, name);
                if (!app) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Not Found\n## Missing Application\n\n> Application **${name}** does not exist\n> Use /applications show to view all available applications`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** not found.`);
                    }
                }

                await activateApplication(guildId, name, channel.id, app.responseChannel);

                if (ContainerBuilder) {
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 📢 Main Channel Set\n## ${name} - Channel Configuration\n\n> Main channel for **${name}** set to ${channel}\n> This is where users will see the application form`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*📢 Channel configured by ${interaction.user.tag} • Application setup*`)
                        );

                    return sendReply([successContainer], null, true);
                } else {
                    return sendReply(`📢 Main channel for **${name}** set to ${channel}.`);
                }

            } else if (subcommand === 'setresponsechannel') {
                const name = interaction.options.getString('appname');
                const channel = interaction.options.getChannel('channel');

                const app = await getApplication(guildId, name);
                if (!app) {
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Application Not Found\n## Missing Application\n\n> Application **${name}** does not exist\n> Use /applications show to view all available applications`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply(`❌ Application **${name}** not found.`);
                    }
                }

                await activateApplication(guildId, name, app.mainChannel, channel.id);

                if (ContainerBuilder) {
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x2ecc71)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 📥 Response Channel Set\n## ${name} - Channel Configuration\n\n> Response channel for **${name}** set to ${channel}\n> Staff will review applications in this channel`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*📥 Channel configured by ${interaction.user.tag} • Application setup*`)
                        );

                    return sendReply([successContainer], null, true);
                } else {
                    return sendReply(`📥 Response channel for **${name}** set to ${channel}.`);
                }

            } else if (subcommand === 'help') {
                if (ContainerBuilder) {
                    const components = [];

                    const helpContainer = new ContainerBuilder()
                        .setAccentColor(0x1E90FF)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 📋 Application System Setup Guide\n## Complete Configuration Walkthrough\n\n> Follow these steps to create a fully functional application system\n> Each step builds upon the previous one for complete setup`)
                        );

                    components.push(helpContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const step1Container = new ContainerBuilder()
                        .setAccentColor(0x3498DB)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 1️⃣ **Create Application**\n\n**Command**\n/applications create name:<application-name>\n\n**Description**\nCreates a new application with the specified name\n\n**Example**\n/applications create name:Staff Application\n\n**Notes**\nApplication names must be unique per server\nMaximum 30 characters allowed`)
                        );

                    components.push(step1Container);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const step2Container = new ContainerBuilder()
                        .setAccentColor(0x9B59B6)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 2️⃣ **Add Questions**\n\n**Command**\n/applications addquestion appname:<name> question:<text>\n\n**Description**\nAdd questions to your application (max 5 questions)\n\n**Example**\n/applications addquestion appname:Staff Application question:Why do you want to join?\n\n**Notes**\nQuestions limited to 45 characters\nMinimum 1 question required for activation`)
                        );

                    components.push(step2Container);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const step3Container = new ContainerBuilder()
                        .setAccentColor(0xE67E22)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 3️⃣ **Set Main Channel**\n\n**Command**\n/applications setmainchannel appname:<name> channel:<channel>\n\n**Description**\nSet the channel where users can see and apply\n\n**Example**\n/applications setmainchannel appname:Staff Application channel:#applications\n\n**Notes**\nThis channel will display the application form\nUsers need message viewing permissions`)
                        );

                    components.push(step3Container);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const step4Container = new ContainerBuilder()
                        .setAccentColor(0x2ECC71)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 4️⃣ **Set Response Channel**\n\n**Command**\n/applications setresponsechannel appname:<name> channel:<channel>\n\n**Description**\nSet the channel where staff will review submissions\n\n**Example**\n/applications setresponsechannel appname:Staff Application channel:#app-reviews\n\n**Notes**\nStaff-only channel recommended\nAll submissions will be posted here`)
                        );

                    components.push(step4Container);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const step5Container = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 5️⃣ **Activate Application**\n\n**Command**\n/applications activate name:<application-name>\n\n**Description**\nActivates the application and posts the form in main channel\n\n**Example**\n/applications activate name:Staff Application\n\n**Notes**\nRequires all previous steps completed\nApplication form will be posted immediately`)
                        );

                    components.push(step5Container);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const managementContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 📝 **Managing Applications**\n\n**View Applications**\n/applications show - View all applications and their details\n\n**Remove Questions**\n/applications removequestion appname:<name> index:<number>\n\n**Delete Applications**\n/applications delete name:<application-name>\n\n**Requirements**\nApplications must have channels set and at least one question before activation`)
                        );

                    components.push(managementContainer);

                    const footerContainer = new ContainerBuilder()
                        .setAccentColor(0x34495E)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*📋 Application system guide requested by ${interaction.user.tag} • Complete setup documentation*`)
                        );

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    components.push(footerContainer);

                    return sendReply(components, null, true);
                } else {
                    const { EmbedBuilder } = require('discord.js');
                    const helpEmbed = new EmbedBuilder()
                        .setColor(0x1E90FF)
                        .setTitle('📋 Application System Setup Guide')
                        .setDescription('Follow these steps to set up an application system:')
                        .addFields(
                            { name: '1️⃣ Create Application', value: '`/applications create name:<application-name>`\n*Creates a new application with the specified name.*' },
                            { name: '2️⃣ Add Questions', value: '`/applications addquestion appname:<application-name> question:<question-text>`\n*Add questions to your application (max 5 questions).*' },
                            { name: '3️⃣ Set Main Channel', value: '`/applications setmainchannel appname:<application-name> channel:<channel>`\n*Set the channel where users can see and apply.*' },
                            { name: '4️⃣ Set Response Channel', value: '`/applications setresponsechannel appname:<application-name> channel:<channel>`\n*Set the channel where staff will review submissions.*' },
                            { name: '5️⃣ Activate Application', value: '`/applications activate name:<application-name>`\n*Activates the application and posts the application form in the main channel.*' }
                        )
                        .addFields(
                            { name: '📝 Managing Applications', value: '`/applications show` - View all applications\n`/applications removequestion appname:<name> index:<number>` - Remove a question\n`/applications delete name:<application-name>` - Delete an application' }
                        )
                        .setFooter({ text: 'Applications must have channels set and at least one question before activation.' })
                        .setTimestamp();

                    return sendReply([helpEmbed]);
                }

            } else if (subcommand === 'show') {
                try {
                    const guildId = interaction.guild.id;
                    const applications = await Application.find({ guildId });
            
                    if (!applications || applications.length === 0) {
                        if (ContainerBuilder) {
                            const noAppsContainer = new ContainerBuilder()
                                .setAccentColor(0xffa500)
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(`# 📋 No Applications Found\n## Empty Application System\n\n> No applications have been created yet\n> Use /applications create to set up your first application`)
                                )
                                .addSeparatorComponents(
                                    new SeparatorBuilder()
                                        .setSpacing(SeparatorSpacingSize.Small)
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(`*📋 Application list requested by ${interaction.user.tag} • System empty*`)
                                );

                            return sendReply([noAppsContainer], null, true);
                        } else {
                            return sendReply("❌ No applications found.");
                        }
                    }
            
                    const applicationDetails = applications.map((app, index) => {
                        const status = app.isActive ? '🟢 Active' : '🔴 Inactive';
                        const questions = app.questions.length > 0
                            ? app.questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')
                            : 'No questions added.';
                    
                        const mainChannel = app.mainChannel ? `<#${app.mainChannel}>` : 'Not set.';
                        const responseChannel = app.responseChannel ? `<#${app.responseChannel}>` : 'Not set.';
            
                        return `**${index + 1}. ${app.appName}**\n` +
                            `**Status:** ${status}\n` +
                            `**Questions:**\n${questions}\n` +
                            `**Main Channel:** ${mainChannel}\n` +
                            `**Response Channel:** ${responseChannel}\n`;
                    });
            
                 
                    const chunks = [];
                    let currentChunk = '';
            
                    for (const detail of applicationDetails) {
                        if ((currentChunk + detail).length > 2048) {
                            chunks.push(currentChunk);
                            currentChunk = detail;
                        } else {
                            currentChunk += detail + '\n';
                        }
                    }
                    if (currentChunk) chunks.push(currentChunk);
            
                    let currentPage = 0;
            
                    if (ContainerBuilder) {
                      
                        const showContainer = new ContainerBuilder()
                            .setAccentColor(0x1E90FF)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 📋 Applications List\n## Server Application Overview\n\n${chunks[currentPage]}`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Small)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`*Page ${currentPage + 1} of ${chunks.length} • ${applications.length} total applications*`)
                            );
                
                   
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('⬅️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(chunks.length === 1)
                        );
                
                        const reply = await interaction.editReply({ 
                            content: ' ', 
                            components: [showContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        });
                
                    
                        const filter = i => (i.customId === 'previous' || i.customId === 'next') && i.user.id === interaction.user.id;
                        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });
                
                        collector.on('collect', async i => {
                            if (i.customId === 'previous') currentPage--;
                            if (i.customId === 'next') currentPage++;
                
                            const updatedContainer = new ContainerBuilder()
                                .setAccentColor(0x1E90FF)
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(`# 📋 Applications List\n## Server Application Overview\n\n${chunks[currentPage]}`)
                                )
                                .addSeparatorComponents(
                                    new SeparatorBuilder()
                                        .setSpacing(SeparatorSpacingSize.Small)
                                )
                                .addTextDisplayComponents(
                                    new TextDisplayBuilder()
                                        .setContent(`*Page ${currentPage + 1} of ${chunks.length} • ${applications.length} total applications*`)
                                );
                
                            row.components[0].setDisabled(currentPage === 0);
                            row.components[1].setDisabled(currentPage === chunks.length - 1);
                
                            await i.update({ 
                                content: ' ', 
                                components: [updatedContainer],
                                flags: MessageFlags.IsComponentsV2 
                            });
                        });
                
                        collector.on('end', () => {
                            row.components.forEach(comp => comp.setDisabled(true));
                            interaction.editReply({ 
                                content: ' ',
                                components: [showContainer],
                                flags: MessageFlags.IsComponentsV2
                            });
                        });
                    } else {
                    
                        const { EmbedBuilder } = require('discord.js');
                        const embed = new EmbedBuilder()
                            .setColor(0x1E90FF)
                            .setTitle('📋 Applications List')
                            .setDescription(chunks[currentPage])
                            .setFooter({ text: `Page ${currentPage + 1} of ${chunks.length}` })
                            .setTimestamp();
            
                
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('⬅️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(chunks.length === 1)
                        );
            
                        const reply = await interaction.editReply({ embeds: [embed], components: [row] });
            
                   
                        const filter = i => (i.customId === 'previous' || i.customId === 'next') && i.user.id === interaction.user.id;
                        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });
            
                        collector.on('collect', async i => {
                            if (i.customId === 'previous') currentPage--;
                            if (i.customId === 'next') currentPage++;
            
                            embed.setDescription(chunks[currentPage]);
                            embed.setFooter({ text: `Page ${currentPage + 1} of ${chunks.length}` });
            
                            row.components[0].setDisabled(currentPage === 0);
                            row.components[1].setDisabled(currentPage === chunks.length - 1);
            
                            await i.update({ embeds: [embed], components: [row] });
                        });
            
                        collector.on('end', () => {
                            row.components.forEach(comp => comp.setDisabled(true));
                            interaction.editReply({ embeds: [embed], components: [row] });
                        });
                    }
                    
                } catch (error) {
                    console.error('Error fetching applications:', error);
                    
                    if (ContainerBuilder) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xff0000)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# ❌ Database Error\n## System Malfunction\n\n> Database error occurred while fetching applications\n> Please check the bot logs and try again`)
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Small)
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`*Error reported by ${interaction.user.tag} • ${new Date().toLocaleString()}*`)
                            );

                        return sendReply([errorContainer], null, true);
                    } else {
                        return sendReply("❌ Database error! Please check the bot logs.");
                    }
                }
            }
        } else {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ 
                    name: "Alert!", 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash commands!\n- Please use `/applications`')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
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