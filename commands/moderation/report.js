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
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const ReportService = require('../../services/ReportService');
const Report = require('../../models/reportSystem/Report');
const ReportSettings = require('../../models/reportSystem/ReportSettings');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('🔍 Advanced user reporting system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Report a user for violations')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to report')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Report category')
                        .setRequired(true)
             .addChoices(
                       { name: 'Spam', value: 'spam' },
                       { name: 'Harassment', value: 'harassment' },
                       { name: 'NSFW Content', value: 'inappropriate_content' },   // 🔞 remplacé
                       { name: 'Offensive Speech', value: 'hate_speech' },         // 😠 remplacé
                       { name: 'Data Exposure', value: 'doxxing' },                // 🏠 remplacé
                       { name: 'Impersonation', value: 'impersonation' },         // 👤 retiré
                       { name: 'Self-Harm Risk', value: 'self_harm' },            // ⚠️ remplacé
                       { name: 'Malicious Links', value: 'malicious_links' },     // 🔗 retiré
                       { name: 'Raid Behavior', value: 'raid_behavior' },          // ⚡ retiré
                       { name: 'Other', value: 'other' }                           // ❓ retiré
                        ))

                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('Message ID as evidence (optional)')
                        .setRequired(false)))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View reports for a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to view reports for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Filter by status')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Pending', value: 'pending' },
                            { name: 'Under Review', value: 'under_review' },
                            { name: 'Resolved', value: 'resolved' },
                            { name: 'Dismissed', value: 'dismissed' },
                            { name: 'Escalated', value: 'escalated' }
                        )))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('manage')
                .setDescription('Manage a specific report')
                .addStringOption(option =>
                    option.setName('report_id')
                        .setDescription('Report ID to manage')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to take')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Claim', value: 'claim' },
                            { name: 'Resolve', value: 'resolve' },
                            { name: 'Dismiss', value: 'dismiss' },
                            { name: 'Escalate', value: 'escalate' },
                            { name: 'Add Note', value: 'note' }
                        )))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View server report statistics')
                .addStringOption(option =>
                    option.setName('period')
                        .setDescription('Time period')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Today', value: 'day' },
                            { name: 'This Week', value: 'week' },
                            { name: 'This Month', value: 'month' }
                        )))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configure report system settings')
                .addChannelOption(option =>
                    option.setName('reports_channel')
                        .setDescription('Channel for report notifications')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('alerts_channel')
                        .setDescription('Channel for urgent alerts')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('ai_analysis')
                        .setDescription('Enable AI analysis')
                        .setRequired(false))),

    async execute(interaction) {
        if (!interaction.isCommand()) {
            return interaction.reply({ 
                content: '❌ This command only works as a slash command!',
                ephemeral: true 
            });
        }
        if (!await checkPermissions(interaction, 'admin')) return;

        const subcommand = interaction.options.getSubcommand();
        
 
        if (subcommand !== 'user' && subcommand !== 'manage') {
            await interaction.deferReply({ ephemeral: true });
        }
        
        try {
            switch (subcommand) {
                case 'user':
                    await this.handleUserReport(interaction);
                    break;
                case 'view':
                    await this.handleViewReports(interaction);
                    break;
                case 'manage':
                    await this.handleManageReport(interaction);
                    break;
                case 'stats':
                    await this.handleStats(interaction);
                    break;
                case 'setup':
                    await this.handleSetup(interaction);
                    break;
                default:
                  
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.reply({ 
                            content: '❌ Unknown subcommand!', 
                            ephemeral: true 
                        });
                    } else {
                        await interaction.editReply({ content: '❌ Unknown subcommand!' });
                    }
            }
        } catch (error) {
            console.error('Report command error:', error);
            
         
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ An error occurred while processing your request.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({ 
                    content: '❌ An error occurred while processing your request.' 
                });
            }
        }
    },

    async handleUserReport(interaction) {
        const user = interaction.options.getUser('user');
        const category = interaction.options.getString('category');
        const messageId = interaction.options.getString('message_id');
        
        if (user.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ You cannot report yourself!', 
                ephemeral: true 
            });
        }
        
        if (user.bot) {
            return interaction.reply({ 
                content: '❌ You cannot report bots!', 
                ephemeral: true 
            });
        }

     
        const modal = new ModalBuilder()
            .setCustomId(`report_modal_${user.id}_${category}_${messageId || 'none'}`)
            .setTitle(`Report ${user.username}`)
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('reason')
                        .setLabel('Detailed Reason')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Provide detailed information about the violation...')
                        .setRequired(true)
                        .setMaxLength(1000)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('additional_info')
                        .setLabel('Additional Context (Optional)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Any additional context or evidence details...')
                        .setRequired(false)
                        .setMaxLength(500)
                )
            );

    
        await interaction.showModal(modal);
    },

    async handleViewReports(interaction) {
        const user = interaction.options.getUser('user');
        const statusFilter = interaction.options.getString('status');
        
        const query = {
            guildId: interaction.guild.id,
            'reportedUser.userId': user.id
        };
        
        if (statusFilter) {
            query.status = statusFilter;
        }
        
        const reports = await Report.find(query)
            .sort({ 'timestamps.createdAt': -1 })
            .limit(10);
        
        if (!reports.length) {
            return interaction.editReply({ 
                content: `✅ No reports found for **${user.tag}**${statusFilter ? ` with status "${statusFilter}"` : ''}.` 
            });
        }
        
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`📋 Reports for ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        const reportList = reports.map((report, index) => {
            const statusEmoji = {
                pending: '🟡',
                under_review: '🔍',
                resolved: '✅',
                dismissed: '❌',
                escalated: '🚨'
            };
            
            return `${statusEmoji[report.status]} **${report.reportId}**
**Category:** ${report.category}
**Status:** ${report.status}
**Priority:** ${report.priority}
**Created:** <t:${Math.floor(report.timestamps.createdAt.getTime() / 1000)}:R>
**AI Score:** ${report.aiAnalysis.riskScore || 'N/A'}/100`;
        });
        
        embed.setDescription(reportList.join('\n\n'));
        
        await interaction.editReply({ embeds: [embed] });
    },

    async handleManageReport(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ 
                content: '❌ You need "Manage Messages" permission to manage reports!',
                ephemeral: true
            });
        }
        
        const reportId = interaction.options.getString('report_id');
        const action = interaction.options.getString('action');
        
     
        if (action !== 'note') {
            await interaction.deferReply({ ephemeral: true });
        }
        
        const report = await Report.findOne({ 
            reportId, 
            guildId: interaction.guild.id 
        });
        
        if (!report) {
            if (action === 'note') {
                return interaction.reply({ 
                    content: '❌ Report not found!', 
                    ephemeral: true 
                });
            } else {
                return interaction.editReply({ content: '❌ Report not found!' });
            }
        }
        
        switch (action) {
            case 'claim':
                report.assignedModerator = {
                    userId: interaction.user.id,
                    username: interaction.user.username,
                    assignedAt: new Date()
                };
                report.status = 'under_review';
                await report.save();
                
                await interaction.editReply({ 
                    content: `✅ You have claimed report **${reportId}**` 
                });
                break;
                
            case 'resolve':
                report.status = 'resolved';
                report.resolution = {
                    action: 'other',
                    details: 'Resolved via command',
                    resolvedBy: interaction.user.id,
                    resolvedAt: new Date()
                };
                await report.save();
                
                await interaction.editReply({ 
                    content: `✅ Report **${reportId}** has been resolved` 
                });
                break;
                
            case 'dismiss':
                report.status = 'dismissed';
                report.resolution = {
                    action: 'none',
                    details: 'Dismissed - no action needed',
                    resolvedBy: interaction.user.id,
                    resolvedAt: new Date()
                };
                await report.save();
                
                await interaction.editReply({ 
                    content: `✅ Report **${reportId}** has been dismissed` 
                });
                break;
                
            case 'escalate':
                report.status = 'escalated';
                report.priority = 'urgent';
                await report.save();
                
                await interaction.editReply({ 
                    content: `🚨 Report **${reportId}** has been escalated` 
                });
                break;
                
            case 'note':
           
                const modal = new ModalBuilder()
                    .setCustomId(`add_note_${reportId}`)
                    .setTitle('Add Moderator Note')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('note')
                                .setLabel('Note')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                                .setMaxLength(500)
                        )
                    );
                
                await interaction.showModal(modal);
                return;
        }
    },

    async handleStats(interaction) {
        const period = interaction.options.getString('period') || 'week';
        
        const stats = await ReportService.getReportStats(interaction.guild.id, period);
        
        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle(`📊 Report Statistics - ${period.charAt(0).toUpperCase() + period.slice(1)}`)
            .addFields([
                {
                    name: '📋 Total Reports',
                    value: stats.totalReports.toString(),
                    inline: true
                },
                {
                    name: '🟡 Pending',
                    value: stats.pendingReports.toString(),
                    inline: true
                },
                {
                    name: '✅ Resolved',
                    value: stats.resolvedReports.toString(),
                    inline: true
                },
                {
                    name: '🤖 Average AI Confidence',
                    value: `${Math.round(stats.avgConfidence * 100)}%`,
                    inline: true
                },
                {
                    name: '⚠️ Average Risk Score',
                    value: `${Math.round(stats.avgRiskScore)}/100`,
                    inline: true
                },
                {
                    name: '📈 Resolution Rate',
                    value: stats.totalReports > 0 ? 
                        `${Math.round((stats.resolvedReports / stats.totalReports) * 100)}%` : '0%',
                    inline: true
                }
            ])
            .setFooter({ 
                text: `Server: ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();
            
        await interaction.editReply({ embeds: [embed] });
    },

    async handleSetup(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.editReply({ 
                content: '❌ You need "Manage Server" permission to configure settings!' 
            });
        }
        
        const reportsChannel = interaction.options.getChannel('reports_channel');
        const alertsChannel = interaction.options.getChannel('alerts_channel');
        const aiAnalysis = interaction.options.getBoolean('ai_analysis');
        
        let settings = await ReportSettings.findOne({ guildId: interaction.guild.id });
        
        if (!settings) {
            settings = new ReportSettings({ guildId: interaction.guild.id });
        }
        
        let changes = [];
        
        if (reportsChannel) {
            settings.channels.reportsChannel = reportsChannel.id;
            changes.push(`Reports channel: ${reportsChannel}`);
        }
        
        if (alertsChannel) {
            settings.channels.alertsChannel = alertsChannel.id;
            changes.push(`Alerts channel: ${alertsChannel}`);
        }
        
        if (aiAnalysis !== null) {
            settings.autoModeration.aiAnalysis = aiAnalysis;
            changes.push(`AI Analysis: ${aiAnalysis ? 'Enabled' : 'Disabled'}`);
        }
        
        await settings.save();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⚙️ Report System Configuration Updated')
            .setDescription(changes.length ? changes.join('\n') : 'No changes made')
            .setTimestamp();
            
        await interaction.editReply({ embeds: [embed] });
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