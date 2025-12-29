const { getApplication } = require('../models/applications/controller');
const ReportService = require('../services/ReportService');
const Report = require('../models/reportSystem/Report');
const ReportSettings = require('../models/reportSystem/ReportSettings');
const {
    ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle,
    EmbedBuilder,
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
module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        const guildId = interaction.guild?.id;
        if (!guildId) return;

        // ===== APPLICATION SYSTEM HANDLERS =====

        if (interaction.isButton() && interaction.customId.startsWith('open_application_modal_')) {
            const appName = interaction.customId.replace('open_application_modal_', '');
            const app = await getApplication(guildId, appName);
            if (!app) return interaction.reply({ content: '❌ Application not found.', ephemeral: true });
            if (!app.isActive) return interaction.reply({ content: '❌ This application is not currently active.', ephemeral: true });

            const modal = new ModalBuilder().setCustomId(`application_form_${appName}`).setTitle(`Apply: ${appName}`);
            app.questions.forEach((question, i) => {
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId(`question_${i}`).setLabel(question.text).setStyle(TextInputStyle.Short)
                ));
            });
            await interaction.showModal(modal);
        }

        else if (interaction.isModalSubmit() && interaction.customId.startsWith('application_form_')) {
            const appName = interaction.customId.replace('application_form_', '');
            const app = await getApplication(guildId, appName);
            if (!app) return interaction.reply({ content: '❌ Application not found.', ephemeral: true });
            if (!app.isActive) return interaction.reply({ content: '❌ This application is not currently active.', ephemeral: true });

            const answers = app.questions.map((_, i) => interaction.fields.getTextInputValue(`question_${i}`));
            const responseChannel = interaction.guild.channels.cache.get(app.responseChannel);
            if (!responseChannel) return interaction.reply({ content: '❌ Response channel not found.', ephemeral: true });

            // Helper function to check for V2 components
            const hasV2Components = () => {
                try {
                    return ContainerBuilder && TextDisplayBuilder;
                } catch {
                    return false;
                }
            };

            // Always create functional buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_application_${interaction.user.id}_${appName}`)
                    .setLabel('✅ Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_application_${interaction.user.id}_${appName}`)
                    .setLabel('❌ Deny')
                    .setStyle(ButtonStyle.Danger)
            );

            if (hasV2Components()) {
                // V2 Components Version - FIXED: Send as two separate messages or combine properly
                const applicationContainer = new ContainerBuilder()
                    .setAccentColor(0x0099ff)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📥 New Application Submission\n## ${appName} - Pending Review\n\n> **Applicant:** ${interaction.user.tag} (${interaction.user.id})\n> **Submitted:** <t:${Math.floor(Date.now() / 1000)}:F>\n> **Status:** Awaiting moderator review`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📋 **Application Responses**\n\n${answers.map((a, i) => `**Q${i + 1}:** ${app.questions[i].text}\n**A${i + 1}:** ${a}`).join('\n\n')}`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🔍 **Moderator Actions**\n\n**Review Guidelines**\nEvaluate responses for completeness\nCheck against server requirements\nConsider user's Discord history\n\n**Decision Required**\nAccept or deny this application\nUser will be notified of the decision`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*📋 Application submitted by ${interaction.user.tag} • Moderation system*`)
                    );

                // FIXED: Send V2 container first, then buttons in separate message
                await responseChannel.send({
                    components: [applicationContainer],
                    flags: MessageFlags.IsComponentsV2
                });

                // Send buttons as separate message for functionality
                await responseChannel.send({
                    components: [row]
                });

            } else {
                // Fallback to legacy embed
                const embed = new EmbedBuilder()
                    .setTitle(`📥 Application - ${appName}`)
                    .setDescription(answers.map((a, i) => `**Q${i + 1}:** ${app.questions[i].text}\n**A${i + 1}:** ${a}`).join('\n\n'))
                    .setColor('Blue')
                    .setFooter({ text: `From: ${interaction.user.tag} (${interaction.user.id}) | App: ${appName}` });

                await responseChannel.send({ embeds: [embed], components: [row] });
            }

            await interaction.reply({ content: '✅ Your application has been submitted!', ephemeral: true });
        }
        else if (interaction.isButton() &&
            (interaction.customId.startsWith('accept_application_') || interaction.customId.startsWith('deny_application_'))) {

            // Parse the custom ID to get user ID and app name
            const parts = interaction.customId.split('_');
            const action = parts[0]; // 'accept' or 'deny'
            const userId = parts[2]; // User ID
            const appName = parts.slice(3).join('_'); // App name (rejoin in case it has underscores)

            const status = action === 'accept' ? 'accepted' : 'denied';
            const color = status === 'accepted' ? 0x00ff00 : 0xff0000;

            // Helper function to check for V2 components
            const hasV2Components = () => {
                try {
                    return ContainerBuilder && TextDisplayBuilder;
                } catch {
                    return false;
                }
            };

            // Get original application data
            let applicantInfo = '';
            let applicationContent = '';

            if (interaction.message.embeds.length > 0) {
                // Legacy embed
                const embed = interaction.message.embeds[0];
                applicantInfo = embed.footer.text.replace('From: ', '').split(' | App:')[0];
                applicationContent = embed.description;
            } else {
                // V2 component - extract from content (fallback)
                applicantInfo = `User ID: ${userId}`;
                applicationContent = 'Application details available in original message';
            }

            // Update the message immediately
            if (hasV2Components()) {
                // V2 Components Version
                const updatedContainer = new ContainerBuilder()
                    .setAccentColor(color)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📥 Application ${status.toUpperCase()}\n## ${appName} - Review Complete\n\n> **Applicant:** ${applicantInfo.split(' (')[0]}\n> **Decision:** ${status.toUpperCase()}\n> **Reviewed by:** ${interaction.user.tag}\n> **Date:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📋 **Original Application**\n\n${applicationContent}`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Large)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ✅ **Review Complete**\n\n**Decision Made**\nApplication has been ${status}\nApplicant will be notified via DM\n\n**Status**\n${status === 'accepted' ? '✅ ACCEPTED - User can now access server features' : '❌ DENIED - Application did not meet requirements'}`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*📋 Application ${status} by ${interaction.user.tag} • Decision final*`)
                    );

                // Disabled buttons to show final decision
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('processed_accept')
                        .setLabel(status === 'accepted' ? '✅ ACCEPTED' : '✅ Accept')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('processed_deny')
                        .setLabel(status === 'denied' ? '❌ DENIED' : '❌ Deny')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

                await interaction.update({
                    components: [updatedContainer],
                    components: [disabledRow],
                    flags: MessageFlags.IsComponentsV2,
                    embeds: []
                });
            } else {
                // Fallback to legacy embed update
                const embed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setTitle(`📥 Application ${status.toUpperCase()} - ${appName}`)
                    .setColor(status === 'accepted' ? 'Green' : 'Red')
                    .addFields({ name: 'Reviewed by', value: interaction.user.tag, inline: true })
                    .addFields({ name: 'Decision Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true });

                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('done_accept')
                        .setLabel(status === 'accepted' ? '✅ ACCEPTED' : '✅ Accept')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('done_deny')
                        .setLabel(status === 'denied' ? '❌ DENIED' : '❌ Deny')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

                await interaction.update({ embeds: [embed], components: [disabledRow] });
            }

            // Send DM to user
            try {
                const user = await client.users.fetch(userId);

                if (hasV2Components()) {
                    // V2 DM Components
                    const dmContainer = new ContainerBuilder()
                        .setAccentColor(color)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🎉 Application ${status.toUpperCase()}\n## ${interaction.guild.name} - Decision Update\n\n> Your application for **${appName}** has been **${status}**\n> Thank you for your interest in our community`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Large)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## ${status === 'accepted' ? '✅ **Welcome!**' : '❌ **Application Status**'}\n\n${status === 'accepted'
                                    ? '**Congratulations!**\nYour application has been approved'
                                    : '**Application Decision**\nYour application did not meet our requirements\nYou may reapply in the future\nThank you for your understanding\n\n**Feedback**\nReview server requirements\nImprove your application\nContact staff with questions'}`)
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder()
                                .setSpacing(SeparatorSpacingSize.Small)
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*🎉 Decision from ${interaction.guild.name} • ${status === 'accepted' ? 'Welcome!' : 'Try again later'}*`)
                        );

                    await user.send({
                        components: [dmContainer],
                        flags: MessageFlags.IsComponentsV2
                    });
                } else {
                    // Fallback to legacy DM embed
                    const dm = new EmbedBuilder()
                        .setTitle(`🎉 Application ${status.toUpperCase()}`)
                        .setDescription(`Your application for **${appName}** to **${interaction.guild.name}** was **${status}**.`)
                        .setColor(status === 'accepted' ? 'Green' : 'Red')
                        .addFields([
                            {
                                name: status === 'accepted' ? '🎉 Welcome!' : '📝 What\'s Next?',
                                value: status === 'accepted'
                                    ? 'Welcome to our community! Read the rules and introduce yourself.'
                                    : 'You can reapply in the future. Review the requirements and improve your application.'
                            }
                        ])
                        .setTimestamp();
                    await user.send({ embeds: [dm] });
                }

                // Follow up to let moderator know DM was sent
                await interaction.followUp({ content: '📬 User has been notified via DM.', ephemeral: true });
            } catch (error) {
                console.error('DM Error:', error);
                await interaction.followUp({ content: '⚠️ Could not DM the user, but decision has been recorded.', ephemeral: true });
            }
        }
        // ===== REPORT SYSTEM HANDLERS =====

        // Handle report submission modal
        else if (interaction.isModalSubmit() && interaction.customId.startsWith('report_modal_')) {
            const customIdParts = interaction.customId.split('_');
            const userId = customIdParts[2];
            const messageId = customIdParts[customIdParts.length - 1];

            const categoryParts = customIdParts.slice(3, -1);
            const category = categoryParts.join('_');

            const reason = interaction.fields.getTextInputValue('reason');
            const additionalInfo = interaction.fields.getTextInputValue('additional_info') || '';

            await interaction.deferReply({ ephemeral: true });

            try {
                const reportedUser = await interaction.client.users.fetch(userId);

                let evidence = {};
                if (messageId !== 'none') {
                    try {
                        const message = await interaction.channel.messages.fetch(messageId);
                        evidence = {
                            messageId: message.id,
                            messageContent: message.content,
                            channelId: message.channel.id,
                            channelName: message.channel.name,
                            attachments: message.attachments.map(att => att.url)
                        };
                    } catch (e) {
                        console.log('Could not fetch evidence message:', e.message);
                    }
                }

                const fullReason = additionalInfo ? `${reason}\n\nAdditional Info: ${additionalInfo}` : reason;

                const result = await ReportService.createReport({
                    guildId: interaction.guild.id,
                    reportedUser,
                    reporter: interaction.user,
                    reason: fullReason,
                    category,
                    evidence,
                    client: interaction.client
                });

                if (result.success) {
                    const embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ Report Submitted Successfully')
                        .setDescription(`**Report ID:** \`${result.report.reportId}\`
**User:** ${reportedUser.tag}
**Category:** ${category}
**Priority:** ${result.report.priority}
**AI Analysis:** ${result.report.aiAnalysis.analyzed ?
                                `${result.report.aiAnalysis.severity} (${Math.round(result.report.aiAnalysis.confidence * 100)}%)` :
                                'Processing...'}`)
                        .addFields([
                            {
                                name: '📝 Your Report',
                                value: reason.length > 200 ? reason.substring(0, 197) + '...' : reason
                            }
                        ])
                        .setFooter({ text: 'Moderators have been notified' })
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.editReply({
                        content: `❌ ${result.message}`
                    });
                }

            } catch (error) {
                console.error('Report submission error:', error);
                await interaction.editReply({
                    content: '❌ Failed to submit report. Please try again later.'
                });
            }
        }

        // Handle moderator note modal
        else if (interaction.isModalSubmit() && interaction.customId.startsWith('add_note_')) {
            const reportId = interaction.customId.replace('add_note_', '');
            const note = interaction.fields.getTextInputValue('note');

            await interaction.deferReply({ ephemeral: true });

            try {
                const report = await Report.findOne({ reportId, guildId: interaction.guild.id });

                if (!report) {
                    return interaction.editReply({ content: '❌ Report not found!' });
                }

                report.moderatorNotes.push({
                    moderatorId: interaction.user.id,
                    moderatorName: interaction.user.username,
                    note,
                    timestamp: new Date()
                });

                await report.save();

                await interaction.editReply({
                    content: `✅ Note added to report **${reportId}**`
                });
            } catch (error) {
                console.error('Error adding note:', error);
                await interaction.editReply({
                    content: '❌ Failed to add note. Please try again.'
                });
            }
        }

        // 🔥 Handle resolve modal submission with confirmation
        else if (interaction.isModalSubmit() && interaction.customId.startsWith('resolve_modal_')) {
            const reportId = interaction.customId.replace('resolve_modal_', '');
            const resolutionDetails = interaction.fields.getTextInputValue('resolution_details');

            await interaction.deferReply({ ephemeral: true });

            try {
                const report = await Report.findOne({ reportId, guildId: interaction.guild.id });

                if (!report) {
                    return interaction.editReply({ content: '❌ Report not found!' });
                }

                // Set resolution details but don't mark as resolved yet
                report.resolution = {
                    action: 'other',
                    details: resolutionDetails,
                    resolvedBy: interaction.user.id,
                    resolvedAt: new Date()
                };
                await report.save();

                // Show confirmation dialogue
                const confirmEmbed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('❓ Confirm Resolution')
                    .setDescription(`Are you sure you want to resolve this report?
                    
**Report:** ${reportId}
**User:** ${report.reportedUser.username}
**Resolution:** ${resolutionDetails}

This will mark the report as completed and disable all buttons.`)
                    .setTimestamp();

                const confirmRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirm_resolve_${reportId}`)
                            .setLabel('✅ Confirm Resolution')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`cancel_resolve_${reportId}`)
                            .setLabel('❌ Cancel')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.editReply({ embeds: [confirmEmbed], components: [confirmRow] });

            } catch (error) {
                console.error('Error processing resolve modal:', error);
                await interaction.editReply({
                    content: '❌ Failed to process resolution. Please try again.'
                });
            }
        }

        // Handle report management buttons
        else if (interaction.isButton() && interaction.customId.startsWith('report_')) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({
                    content: '❌ You need "Manage Messages" permission to manage reports!',
                    ephemeral: true
                });
            }

            const [, action, reportId] = interaction.customId.split('_');

            if (action !== 'resolve') {
                await interaction.deferReply({ ephemeral: true });
            }

            try {
                const report = await Report.findOne({ reportId, guildId: interaction.guild.id });

                if (!report) {
                    const errorContent = '❌ Report not found!';
                    if (action === 'resolve') {
                        return interaction.reply({ content: errorContent, ephemeral: true });
                    } else {
                        return interaction.editReply({ content: errorContent });
                    }
                }

                switch (action) {
                    case 'claim':
                        await handleReportClaim(interaction, report);
                        break;
                    case 'resolve':
                        await handleReportResolve(interaction, report);
                        break;
                    case 'escalate':
                        await handleReportEscalate(interaction, report);
                        break;
                    case 'dismiss':
                        await handleReportDismiss(interaction, report);
                        break;
                    case 'timeout':
                        await handleReportTimeout(interaction, report, client);
                        break;
                    case 'ban':
                        await handleReportBan(interaction, report, client);
                        break;
                    default:
                        await interaction.editReply({ content: '❌ Unknown action!' });
                }
            } catch (error) {
                console.error('Report action error:', error);
                const errorContent = '❌ Failed to perform action. Please try again.';
                if (action === 'resolve' && !interaction.replied) {
                    await interaction.reply({ content: errorContent, ephemeral: true });
                } else if (!interaction.replied) {
                    await interaction.editReply({ content: errorContent });
                }
            }
        }

        // 🔥 Handle dismiss confirmation
        else if (interaction.isButton() && interaction.customId.startsWith('confirm_dismiss_')) {
            const reportId = interaction.customId.replace('confirm_dismiss_', '');

            await interaction.deferUpdate();

            try {
                const report = await Report.findOne({ reportId, guildId: interaction.guild.id });
                if (!report) {
                    return interaction.editReply({
                        content: '❌ Report not found!',
                        components: []
                    });
                }

                report.status = 'dismissed';
                report.resolution = {
                    action: 'none',
                    details: 'Report dismissed - no action needed',
                    resolvedBy: interaction.user.id,
                    resolvedAt: new Date()
                };
                await report.save();

                await updateReportMessage(interaction, report);

                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Report Dismissed')
                    .setDescription(`Report **${report.reportId}** has been successfully dismissed.
                    
**Dismissed by:** ${interaction.user}
**Reason:** No action needed`)
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [successEmbed],
                    components: []
                });

            } catch (error) {
                console.error('Error dismissing report:', error);
                await interaction.editReply({
                    content: '❌ Failed to dismiss report. Please try again.',
                    components: []
                });
            }
        }

        // 🔥 Handle resolve confirmation
        else if (interaction.isButton() && interaction.customId.startsWith('confirm_resolve_')) {
            const reportId = interaction.customId.replace('confirm_resolve_', '');

            await interaction.deferUpdate();

            try {
                const report = await Report.findOne({ reportId, guildId: interaction.guild.id });
                if (!report) {
                    return interaction.editReply({
                        content: '❌ Report not found!',
                        components: []
                    });
                }

                report.status = 'resolved';
                await report.save();

                await updateReportMessage(interaction, report);

                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Report Resolved')
                    .setDescription(`Report **${report.reportId}** has been successfully resolved.
                    
**Resolved by:** ${interaction.user}
**Action:** ${report.resolution.details}`)
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [successEmbed],
                    components: []
                });

            } catch (error) {
                console.error('Error confirming resolve:', error);
                await interaction.editReply({
                    content: '❌ Failed to confirm resolution. Please try again.',
                    components: []
                });
            }
        }

        // Handle report action confirmation buttons
        else if (interaction.isButton() && interaction.customId.startsWith('confirm_')) {
            const [, action, reportId] = interaction.customId.split('_', 3);

            await interaction.deferUpdate();

            try {
                const report = await Report.findOne({ reportId, guildId: interaction.guild.id });
                if (!report) return;

                switch (action) {
                    case 'timeout':
                        await executeTimeout(interaction, report, client);
                        break;
                    case 'ban':
                        await executeBan(interaction, report, client);
                        break;
                }
            } catch (error) {
                console.error('Confirmation action error:', error);
            }
        }

        // Handle report action cancellation
        else if (interaction.isButton() && interaction.customId.startsWith('cancel_')) {
            await interaction.deferUpdate();

            const embed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('❌ Action Cancelled')
                .setDescription('The action has been cancelled.')
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed],
                components: []
            });
        }
    });

    // ===== REPORT SYSTEM HELPER FUNCTIONS =====

    async function handleReportClaim(interaction, report) {
        if (report.assignedModerator?.userId) {
            return interaction.editReply({
                content: `❌ Report already claimed by **${report.assignedModerator.username}**`
            });
        }

        report.assignedModerator = {
            userId: interaction.user.id,
            username: interaction.user.username,
            assignedAt: new Date()
        };
        report.status = 'under_review';
        await report.save();

        await updateReportMessage(interaction, report);

        await interaction.editReply({
            content: `✅ You have claimed report **${report.reportId}**`
        });
    }

    async function handleReportResolve(interaction, report) {
        if (report.status === 'resolved' || report.status === 'dismissed') {
            return interaction.reply({
                content: `❌ Report **${report.reportId}** is already ${report.status}!`,
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`resolve_modal_${report.reportId}`)
            .setTitle('Resolve Report')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('resolution_details')
                        .setLabel('Resolution Details')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Describe what action was taken...')
                        .setRequired(true)
                        .setMaxLength(500)
                )
            );

        await interaction.showModal(modal);
    }

    async function handleReportEscalate(interaction, report) {
        report.status = 'escalated';
        report.priority = 'urgent';
        await report.save();

        await updateReportMessage(interaction, report);

        const settings = await ReportSettings.findOne({ guildId: interaction.guild.id });
        if (settings?.channels.alertsChannel) {
            const alertChannel = interaction.guild.channels.cache.get(settings.channels.alertsChannel);
            if (alertChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🚨 ESCALATED REPORT')
                    .setDescription(`Report **${report.reportId}** has been escalated by ${interaction.user}`)
                    .addFields([
                        {
                            name: 'Reported User',
                            value: `<@${report.reportedUser.userId}>`,
                            inline: true
                        },
                        {
                            name: 'Category',
                            value: report.category,
                            inline: true
                        },
                        {
                            name: 'Priority',
                            value: report.priority,
                            inline: true
                        }
                    ])
                    .setTimestamp();

                await alertChannel.send({ embeds: [embed] });
            }
        }

        await interaction.editReply({
            content: `🚨 Report **${report.reportId}** has been escalated to urgent priority`
        });
    }

    // 🔥 Updated dismiss with confirmation
    async function handleReportDismiss(interaction, report) {
        const confirmEmbed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('❓ Confirm Dismiss')
            .setDescription(`Are you sure you want to dismiss this report?
            
**Report:** ${report.reportId}
**User:** ${report.reportedUser.username}
**Reason:** ${report.reason.length > 100 ? report.reason.substring(0, 97) + '...' : report.reason}

This will mark the report as dismissed with no action taken.`)
            .setTimestamp();

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_dismiss_${report.reportId}`)
                    .setLabel('✅ Confirm Dismiss')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`cancel_dismiss_${report.reportId}`)
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({ embeds: [confirmEmbed], components: [confirmRow] });
    }

    async function handleReportTimeout(interaction, report, client) {
        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('⏰ Confirm Timeout')
            .setDescription(`Are you sure you want to timeout **${report.reportedUser.username}**?
            
**Report:** ${report.reportId}
**Reason:** ${report.category}
**Duration:** 10 minutes`)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_timeout_${report.reportId}`)
                    .setLabel('✅ Confirm Timeout')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`cancel_timeout_${report.reportId}`)
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    }

    async function handleReportBan(interaction, report, client) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🔨 Confirm Ban')
            .setDescription(`Are you sure you want to BAN **${report.reportedUser.username}**?
            
**Report:** ${report.reportId}
**Reason:** ${report.category}
**This action is permanent and cannot be undone!**`)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_ban_${report.reportId}`)
                    .setLabel('🔨 Confirm Ban')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`cancel_ban_${report.reportId}`)
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    }

    async function executeTimeout(interaction, report, client) {
        try {
            const member = await interaction.guild.members.fetch(report.reportedUser.userId);
            if (!member) {
                return interaction.editReply({
                    content: '❌ User not found in server',
                    components: []
                });
            }

            await member.timeout(10 * 60 * 1000, `Report: ${report.reportId} - ${report.category}`);

            report.status = 'resolved';
            report.resolution = {
                action: 'timeout',
                details: '10 minute timeout applied',
                resolvedBy: interaction.user.id,
                resolvedAt: new Date()
            };
            await report.save();

            await updateReportMessage(interaction, report);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Timeout Applied')
                .setDescription(`**${report.reportedUser.username}** has been timed out for 10 minutes.
                
**Report:** ${report.reportId}
**Resolved by:** ${interaction.user}`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], components: [] });

            // Try to notify user
            try {
                const user = await client.users.fetch(report.reportedUser.userId);
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('⏰ You have been timed out')
                    .setDescription(`You were timed out in **${interaction.guild.name}** for **${report.category}**.
                    
**Duration:** 10 minutes
**Report ID:** ${report.reportId}`)
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (e) {
                console.log('Could not DM user about timeout');
            }

        } catch (error) {
            console.error('Timeout execution error:', error);
            await interaction.editReply({
                content: '❌ Failed to timeout user. Check bot permissions.',
                components: []
            });
        }
    }

    async function executeBan(interaction, report, client) {
        try {
            await interaction.guild.members.ban(report.reportedUser.userId, {
                reason: `Report: ${report.reportId} - ${report.category}`,
                deleteMessageDays: 1
            });

            report.status = 'resolved';
            report.resolution = {
                action: 'ban',
                details: 'User banned from server',
                resolvedBy: interaction.user.id,
                resolvedAt: new Date()
            };
            await report.save();

            await updateReportMessage(interaction, report);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 User Banned')
                .setDescription(`**${report.reportedUser.username}** has been banned from the server.
                
**Report:** ${report.reportId}
**Resolved by:** ${interaction.user}`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], components: [] });

        } catch (error) {
            console.error('Ban execution error:', error);
            await interaction.editReply({
                content: '❌ Failed to ban user. Check bot permissions.',
                components: []
            });
        }
    }

    // 🔥 Enhanced updateReportMessage with proper button disabling
    async function updateReportMessage(interaction, report) {
        if (!report.evidence.notificationMessageId) return;

        const settings = await ReportSettings.findOne({ guildId: interaction.guild.id });
        if (!settings?.channels.reportsChannel) return;

        try {
            const reportsChannel = interaction.guild.channels.cache.get(settings.channels.reportsChannel);
            if (!reportsChannel) return;

            const message = await reportsChannel.messages.fetch(report.evidence.notificationMessageId);
            if (!message) return;

            const statusColors = {
                'pending': '#ffd700',
                'under_review': '#3498db',
                'resolved': '#00ff00',
                'dismissed': '#95a5a6',
                'escalated': '#ff0000'
            };

            // Create status field with resolution info
            let statusValue = `**Status:** \`${report.status.toUpperCase()}\`
**Assigned:** ${report.assignedModerator ? `<@${report.assignedModerator.userId}>` : 'None'}
**Last Updated:** <t:${Math.floor(Date.now() / 1000)}:R>`;

            if (report.resolution) {
                statusValue += `\n**Resolution:** ${report.resolution.details}
**Resolved by:** <@${report.resolution.resolvedBy}>
**Resolved at:** <t:${Math.floor(report.resolution.resolvedAt.getTime() / 1000)}:F>`;
            }

            const updatedEmbed = EmbedBuilder.from(message.embeds[0])
                .setColor(statusColors[report.status])
                .setFields(
                    message.embeds[0].fields[0], // Keep original reason field
                    message.embeds[0].fields[1] || { name: '\u200b', value: '\u200b', inline: false }, // Keep AI analysis or spacer
                    {
                        name: '📊 Status Update',
                        value: statusValue,
                        inline: false
                    }
                );

            // 🔥 Enhanced button logic based on status
            let components = [];

            if (report.status === 'resolved') {
                const resolvedRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('resolved_status')
                            .setLabel(`✅ RESOLVED by Moderator`)
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true)
                    );
                components = [resolvedRow];

            } else if (report.status === 'dismissed') {
                const dismissedRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('dismissed_status')
                            .setLabel(`❌ DISMISSED by Moderator`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );
                components = [dismissedRow];

            } else if (report.status === 'pending' || report.status === 'under_review') {
                const actionRow1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`report_claim_${report.reportId}`)
                            .setLabel('Claim')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('👤')
                            .setDisabled(!!report.assignedModerator?.userId),
                        new ButtonBuilder()
                            .setCustomId(`report_timeout_${report.reportId}`)
                            .setLabel('Timeout')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⏰'),
                        new ButtonBuilder()
                            .setCustomId(`report_resolve_${report.reportId}`)
                            .setLabel('Resolve')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✅'),
                        new ButtonBuilder()
                            .setCustomId(`report_escalate_${report.reportId}`)
                            .setLabel('Escalate')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('⚠️')
                    );

                const actionRow2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`report_dismiss_${report.reportId}`)
                            .setLabel('Dismiss')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('❌')
                    );

                components = [actionRow1, actionRow2];

            } else if (report.status === 'escalated') {
                const escalatedRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`report_timeout_${report.reportId}`)
                            .setLabel('Timeout')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⏰'),
                        new ButtonBuilder()
                            .setCustomId(`report_resolve_${report.reportId}`)
                            .setLabel('Resolve')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✅'),
                        new ButtonBuilder()
                            .setCustomId(`report_dismiss_${report.reportId}`)
                            .setLabel('Dismiss')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('❌'),
                        new ButtonBuilder()
                            .setCustomId('escalated_status')
                            .setLabel('🚨 ESCALATED')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    );

                components = [escalatedRow];
            }

            await message.edit({ embeds: [updatedEmbed], components });

            console.log(`✅ Updated report message for ${report.reportId} - Status: ${report.status}`);

        } catch (error) {
            console.error('Failed to update report message:', error);
        }
    }
};
