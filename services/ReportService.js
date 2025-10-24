const Report = require('../models/reportSystem/Report');
const ReportSettings = require('../models/reportSystem/ReportSettings');
const aiManager = require('../utils/AIManager');
const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

class ReportService {
    
  
    mapAICategoriesToSchema(aiCategories) {
        const categoryMap = {
            'malicious': 'malicious_links',
            'malicious_content': 'inappropriate_content',
            'toxic': 'harassment',
            'offensive': 'hate_speech',
            'scam': 'malicious_links',
            'phishing': 'malicious_links',
            'inappropriate': 'inappropriate_content',
            'nsfw': 'inappropriate_content',
            'adult_content': 'inappropriate_content',
            'violence': 'inappropriate_content',
            'threats': 'harassment',
            'bullying': 'harassment',
            'discrimination': 'hate_speech'
        };
        
        return aiCategories.map(category => {
            const normalizedCategory = category.toLowerCase().replace(/[_\s-]/g, '_');
            return categoryMap[normalizedCategory] || normalizedCategory;
        }).filter(category => [
            'spam', 'harassment', 'inappropriate_content', 'hate_speech',
            'doxxing', 'impersonation', 'self_harm', 'malicious_links',
            'raid_behavior', 'other'
        ].includes(category));
    }

  
    validateCategory(category) {
        const validCategories = [
            'spam', 'harassment', 'inappropriate_content', 'hate_speech',
            'doxxing', 'impersonation', 'self_harm', 'malicious_links',
            'raid_behavior', 'other'
        ];
        
        const categoryMap = {
            'malicious': 'malicious_links',
            'malicious_content': 'inappropriate_content',
            'toxic': 'harassment',
            'offensive': 'hate_speech',
            'scam': 'malicious_links',
            'phishing': 'malicious_links',
            'inappropriate': 'inappropriate_content',
            'nsfw': 'inappropriate_content',
            'adult_content': 'inappropriate_content',
            'violence': 'inappropriate_content',
            'threats': 'harassment',
            'bullying': 'harassment',
            'discrimination': 'hate_speech'
        };
        
        const normalizedCategory = category.toLowerCase().replace(/[_\s-]/g, '_');
        const mappedCategory = categoryMap[normalizedCategory] || normalizedCategory;
        
        return validCategories.includes(mappedCategory) ? mappedCategory : 'other';
    }
    
    async createReport(options) {
        const {
            guildId,
            reportedUser,
            reporter,
            reason,
            category,
            evidence = {},
            client
        } = options;
        
        try {

            const validatedCategory = this.validateCategory(category);
            
       
            const duplicateReport = await this.checkDuplicateReports(
                guildId,
                reportedUser.id,
                reporter.id,
                reason
            );
            
            if (duplicateReport) {
                return {
                    success: false,
                    message: 'Similar report already exists',
                    existingReport: duplicateReport
                };
            }
            
         
            let joinedServerAt = null;
            try {
                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    const member = await guild.members.fetch(reportedUser.id);
                    if (member) {
                        joinedServerAt = member.joinedAt;
                    }
                }
            } catch (e) {
                console.log('Could not fetch member join date');
            }
            
          
            const reportData = {
                guildId,
                reportedUser: {
                    userId: reportedUser.id,
                    username: reportedUser.username,
                    displayName: reportedUser.displayName,
                    avatarURL: reportedUser.displayAvatarURL(),
                    accountCreatedAt: reportedUser.createdAt,
                    joinedServerAt: joinedServerAt
                },
                reporter: {
                    userId: reporter.id,
                    username: reporter.username,
                    displayName: reporter.displayName,
                    avatarURL: reporter.displayAvatarURL()
                },
                reason,
                category: validatedCategory,
                evidence
            };
            
            const report = new Report(reportData);
            
        
            await this.performAIAnalysis(report, { reportedUser, evidence, client });
            
         
            this.setPriority(report);
            
         
            await report.save();
            
           
            await this.sendReportNotifications(report, client);
            
          
            await this.handleAutoActions(report, client);
            
            return {
                success: true,
                report,
                message: 'Report created successfully'
            };
            
        } catch (error) {
            console.error('Error creating report:', error);
            return {
                success: false,
                message: 'Failed to create report',
                error: error.message
            };
        }
    }
    
    async performAIAnalysis(report, context) {
        try {
            const analysisPrompt = this.buildAnalysisPrompt(report, context);
            
            const analysis = await aiManager.generateContent(analysisPrompt, {
                model: "gemini-2.0-flash",
                timeout: 20000
            });
            
            const aiResult = this.parseAIAnalysis(analysis.text());
            
            report.aiAnalysis = {
                analyzed: true,
                confidence: aiResult.confidence,
                severity: aiResult.severity,
                autoFlags: aiResult.flags || [],
                reasoning: aiResult.reasoning,
                riskScore: aiResult.riskScore,
                categories: aiResult.categories || [],
                analyzedAt: new Date()
            };
            
        } catch (error) {
            console.error('AI analysis failed:', error);
            report.aiAnalysis = {
                analyzed: false,
                confidence: 0.5,
                severity: 'medium',
                reasoning: 'AI analysis unavailable',
                categories: ['other'],
                analyzedAt: new Date()
            };
        }
    }
    
    buildAnalysisPrompt(report, context) {
        return `
Analyze this Discord user report for severity and authenticity:

REPORT DETAILS:
- Reported User: ${report.reportedUser.username}
- Reason: ${report.reason}
- Category: ${report.category}
- Evidence: ${JSON.stringify(report.evidence)}
- Reporter: ${report.reporter.username}

USER CONTEXT:
- Account Age: ${context.reportedUser?.createdAt || 'Unknown'}
- Server Join Date: ${report.reportedUser.joinedServerAt || 'Unknown'}
- Message Content: ${report.evidence.messageContent || 'Not provided'}

IMPORTANT: Use ONLY these exact categories in your response:
- spam
- harassment  
- inappropriate_content
- hate_speech
- doxxing
- impersonation
- self_harm
- malicious_links (use this for any malicious content, scams, phishing)
- raid_behavior
- other

Analyze for:
1. Severity level (low/medium/high/critical)
2. Authenticity (false report detection)
3. Risk factors
4. Recommended actions
5. Auto-moderation flags

Respond in JSON format:
{
    "confidence": number (0-1),
    "severity": "low|medium|high|critical",
    "riskScore": number (0-100),
    "reasoning": "brief explanation",
    "categories": ["use ONLY the categories listed above"],
    "flags": ["auto_timeout", "escalate", "investigate"],
    "recommendedActions": ["warning", "timeout", "ban"],
    "falseReportProbability": number (0-1)
}`;
    }
    
    parseAIAnalysis(text) {
        try {
            let cleanText = text.replace(/``````/g, '').trim();
            
        
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }
            
            const parsed = JSON.parse(cleanText);
            
            return {
                confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
                severity: parsed.severity || 'medium',
                riskScore: Math.max(0, Math.min(100, parsed.riskScore || 50)),
                reasoning: parsed.reasoning || 'Analysis completed',
                categories: this.mapAICategoriesToSchema(parsed.categories || []),
                flags: parsed.flags || [],
                recommendedActions: parsed.recommendedActions || [],
                falseReportProbability: parsed.falseReportProbability || 0
            };
        } catch (error) {
            console.error('Failed to parse AI analysis:', error);
            return {
                confidence: 0.5,
                severity: 'medium',
                riskScore: 50,
                reasoning: 'Failed to parse AI response',
                categories: ['other'],
                flags: []
            };
        }
    }
    
    setPriority(report) {
        const aiAnalysis = report.aiAnalysis;
        
        if (aiAnalysis.severity === 'critical' || aiAnalysis.riskScore >= 80) {
            report.priority = 'urgent';
        } else if (aiAnalysis.severity === 'high' || aiAnalysis.riskScore >= 60) {
            report.priority = 'high';
        } else if (aiAnalysis.severity === 'medium' || aiAnalysis.riskScore >= 40) {
            report.priority = 'medium';
        } else {
            report.priority = 'low';
        }
    }
    
    async sendReportNotifications(report, client) {
        try {
            const settings = await ReportSettings.findOne({ guildId: report.guildId });
            if (!settings || !settings.channels.reportsChannel) return;
            
            const guild = client.guilds.cache.get(report.guildId);
            if (!guild) return;
            
            const reportsChannel = guild.channels.cache.get(settings.channels.reportsChannel);
            if (!reportsChannel) return;
            
            const components = this.createReportComponents(report);
            const buttons = this.createReportButtons(report);
            
            const message = await reportsChannel.send({
                components: [...components, buttons],
                flags: MessageFlags.IsComponentsV2
            });
            
            
            report.evidence.notificationMessageId = message.id;
            await report.save();
            
          
            if (report.priority === 'urgent' && settings.channels.alertsChannel) {
                const alertChannel = guild.channels.cache.get(settings.channels.alertsChannel);
                if (alertChannel) {
                    const alertComponents = this.createAlertComponents(report);
                    await alertChannel.send({
                        components: alertComponents,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }
            
        } catch (error) {
            console.error('Failed to send report notifications:', error);
        }
    }
    
   
    createReportComponents(report) {
        const priorityColors = {
            low: 0x00FF00,
            medium: 0xFFD700,
            high: 0xFF8C00,
            urgent: 0xFF0000
        };
        
        const components = [];
        
       
        const reportContainer = new ContainerBuilder()
            .setAccentColor(priorityColors[report.priority]);

        reportContainer.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📋 Report ${report.reportId}\n## ${['resolved', 'dismissed'].includes(report.status) ? report.status.toUpperCase() + ' - ' : ''}User Report System\n\n> ${['resolved', 'dismissed'].includes(report.status) ? 'This report has been ' + report.status : 'Comprehensive report analysis with AI-powered insights'}\n> Priority level: **${report.priority.toUpperCase()}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(report.reportedUser.avatarURL || 'https://cdn.discordapp.com/embed/avatars/0.png')
                        .setDescription(`${report.reportedUser.username} avatar`)
                )
        );

        components.push(reportContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

      
        const detailsContainer = new ContainerBuilder()
            .setAccentColor(0x3498db);

        detailsContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 👤 **Report Details**',
                    '',
                    `**Reported User**`,
                    `<@${report.reportedUser.userId}> (${report.reportedUser.username})`,
                    '',
                    `**Reporter**`,
                    `<@${report.reporter.userId}> (${report.reporter.username})`,
                    '',
                    `**Category**`,
                    `\`${report.category.replace(/_/g, ' ').toUpperCase()}\``,
                    '',
                    `**Priority Level**`,
                    `\`${report.priority.toUpperCase()}\``,
                    '',
                    `**Report Time**`,
                    `<t:${Math.floor(report.timestamps.createdAt.getTime() / 1000)}:F>`
                ].join('\n'))
        );

        components.push(detailsContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

    
        const reasonContainer = new ContainerBuilder()
            .setAccentColor(0xe74c3c);

        reasonContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '## 📝 **Report Reason**',
                    '',
                    report.reason.length > 800 ? 
                        report.reason.substring(0, 797) + '...' : report.reason
                ].join('\n'))
        );

        components.push(reasonContainer);

  
        if (report.aiAnalysis.analyzed) {
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            
            const aiContainer = new ContainerBuilder()
                .setAccentColor(0x9b59b6);

            aiContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '## 🤖 **AI Analysis Results**',
                        '',
                        `**Severity Assessment**`,
                        `\`${report.aiAnalysis.severity.toUpperCase()}\` - ${report.aiAnalysis.reasoning}`,
                        '',
                        `**Confidence Level**`,
                        `${Math.round(report.aiAnalysis.confidence * 100)}% confidence in analysis`,
                        '',
                        `**Risk Score**`,
                        `${report.aiAnalysis.riskScore}/100 - ${report.aiAnalysis.riskScore >= 80 ? 'Very High Risk' : report.aiAnalysis.riskScore >= 60 ? 'High Risk' : report.aiAnalysis.riskScore >= 40 ? 'Medium Risk' : 'Low Risk'}`,
                        '',
                        `**Detected Categories**`,
                        report.aiAnalysis.categories.map(cat => `\`${cat.replace(/_/g, ' ')}\``).join(', ')
                    ].join('\n'))
            );

            components.push(aiContainer);
        }

     
        if (report.evidence.messageContent) {
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            
            const evidenceContainer = new ContainerBuilder()
                .setAccentColor(0xf39c12);

            evidenceContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '## 📄 **Evidence Attached**',
                        '',
                        `**Channel Context**`,
                        `<#${report.evidence.channelId}>`,
                        '',
                        `**Message Content**`,
                        report.evidence.messageContent.length > 300 ? 
                            report.evidence.messageContent.substring(0, 297) + '...' : 
                            report.evidence.messageContent
                    ].join('\n'))
            );

            components.push(evidenceContainer);
        }

   
        if (['resolved', 'dismissed'].includes(report.status)) {
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            
            const statusContainer = new ContainerBuilder()
                .setAccentColor(report.status === 'resolved' ? 0x00ff88 : 0x95a5a6);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        `## ${report.status === 'resolved' ? '✅ CASE RESOLVED' : '❌ CASE DISMISSED'}`,
                        '',
                        `**Final Status:** ${report.status.toUpperCase()}`,
                        `**Action Taken:** ${report.resolution?.action || 'Unknown'}`,
                        `**Details:** ${report.resolution?.details || 'No details provided'}`,
                        `**Handled By:** ${report.resolution?.resolvedBy || 'System'}`,
                        `**Completed:** <t:${Math.floor(report.resolution?.resolvedAt?.getTime() / 1000 || Date.now() / 1000)}:F>`,
                        '',
                        `**✉️ Notifications sent to all parties**`
                    ].join('\n'))
            );

            components.push(statusContainer);
        }

        return components;
    }

  
    createAlertComponents(report) {
        const components = [];
        
        const alertContainer = new ContainerBuilder()
            .setAccentColor(0xff0000);

        alertContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent([
                    '# 🚨 URGENT REPORT ALERT',
                    `## Report ID: ${report.reportId}`,
                    '',
                    '> **IMMEDIATE ATTENTION REQUIRED**',
                    '> High-priority report detected by AI analysis',
                    '',
                    `**Reported User:** <@${report.reportedUser.userId}>`,
                    `**Category:** \`${report.category.toUpperCase()}\``,
                    `**AI Risk Score:** ${report.aiAnalysis.riskScore}/100`,
                    '',
                    '**🔴 Requires immediate moderator review**'
                ].join('\n'))
        );

        components.push(alertContainer);
        return components;
    }
    
 
    createReportButtons(report, forceDisabled = false) {
       
        const isCompleted = ['resolved', 'dismissed'].includes(report.status);
        const shouldDisable = forceDisabled || isCompleted;
        
     
        if (isCompleted) {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`report_info_${report.reportId}`)
                        .setLabel('Case Closed')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🔒')
                        .setDisabled(true)
                );
        }
        
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`report_claim_${report.reportId}`)
                    .setLabel('Claim')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👤')
                    .setDisabled(shouldDisable || report.status === 'under_review'),
                    
                new ButtonBuilder()
                    .setCustomId(`report_timeout_${report.reportId}`)
                    .setLabel('Timeout')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏰')
                    .setDisabled(shouldDisable),
                    
                new ButtonBuilder()
                    .setCustomId(`report_resolve_${report.reportId}`)
                    .setLabel('Resolve')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
                    .setDisabled(shouldDisable),
                    
                new ButtonBuilder()
                    .setCustomId(`report_escalate_${report.reportId}`)
                    .setLabel('Escalate')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚠️')
                    .setDisabled(shouldDisable),
                    
                new ButtonBuilder()
                    .setCustomId(`report_dismiss_${report.reportId}`)
                    .setLabel('Dismiss')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
                    .setDisabled(shouldDisable)
            );
    }

  
    async sendResolvedDM(reportedUser, report, guild, resolution) {
        try {
            const dmComponents = [];
            
            const dmContainer = new ContainerBuilder()
                .setAccentColor(0x00ff88);

            dmContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# ✅ Report Resolution Notice',
                        `## ${guild.name}`,
                        '',
                        '> A report concerning you has been resolved',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Resolution:** ${resolution.action}`,
                        `**Details:** ${resolution.details}`,
                        `**Resolved By:** ${resolution.resolvedBy}`,
                        '',
                        '*If you have questions about this resolution, please contact server staff.*'
                    ].join('\n'))
            );

            dmComponents.push(dmContainer);

            await reportedUser.send({
                components: dmComponents,
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Failed to send resolved DM to reported user:', error);
        }
    }

  
    async sendResolvedReporterDM(reporter, report, guild, resolution) {
        try {
            const dmComponents = [];
            
            const dmContainer = new ContainerBuilder()
                .setAccentColor(0x00ff88);

            dmContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# ✅ Your Report Has Been Resolved',
                        `## ${guild.name}`,
                        '',
                        '> Thank you for helping keep our community safe!',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Action Taken:** ${resolution.action}`,
                        `**Details:** ${resolution.details}`,
                        `**Handled By:** ${resolution.resolvedBy}`,
                        '',
                        '*Your report has been reviewed and appropriate action has been taken.*'
                    ].join('\n'))
            );

            dmComponents.push(dmContainer);

            await reporter.send({
                components: dmComponents,
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Failed to send resolved DM to reporter:', error);
        }
    }


    async sendDismissedDM(reportedUser, report, guild, reason) {
        try {
            const dmComponents = [];
            
            const dmContainer = new ContainerBuilder()
                .setAccentColor(0x95a5a6);

            dmContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# 📋 Report Dismissal Notice',
                        `## ${guild.name}`,
                        '',
                        '> A report concerning you has been dismissed',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Reason for Dismissal:** ${reason}`,
                        '',
                        '*This means no action was taken and the report is closed.*'
                    ].join('\n'))
            );

            dmComponents.push(dmContainer);

            await reportedUser.send({
                components: dmComponents,
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Failed to send dismissed DM to reported user:', error);
        }
    }

 
    async sendDismissedReporterDM(reporter, report, guild, reason) {
        try {
            const dmComponents = [];
            
            const dmContainer = new ContainerBuilder()
                .setAccentColor(0x95a5a6);

            dmContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# 📋 Report Dismissal Notice',
                        `## ${guild.name}`,
                        '',
                        '> Your report has been reviewed and dismissed',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Reason:** ${reason}`,
                        '',
                        '*After review, no action was deemed necessary for this report.*'
                    ].join('\n'))
            );

            dmComponents.push(dmContainer);

            await reporter.send({
                components: dmComponents,
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Failed to send dismissed DM to reporter:', error);
        }
    }


    async sendTimeoutDMs(reportedUser, reporter, report, guild, duration) {
        try {
           
            const reportedComponents = [];
            
            const reportedContainer = new ContainerBuilder()
                .setAccentColor(0xff8c00);

            reportedContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# ⏰ Timeout Applied',
                        `## ${guild.name}`,
                        '',
                        '> You have been timed out due to a report',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Duration:** ${Math.floor(duration / 1000)} seconds`,
                        `**Reason:** ${report.reason}`,
                        '',
                        '*You will not be able to send messages or join voice channels during this timeout.*'
                    ].join('\n'))
            );

            reportedComponents.push(reportedContainer);

            await reportedUser.send({
                components: reportedComponents,
                flags: MessageFlags.IsComponentsV2
            });

         
            const reporterComponents = [];
            
            const reporterContainer = new ContainerBuilder()
                .setAccentColor(0x00ff88);

            reporterContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# ✅ Report Action Taken',
                        `## ${guild.name}`,
                        '',
                        '> Action has been taken on your report',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Action:** Timeout Applied`,
                        `**Duration:** ${Math.floor(duration / 1000)} seconds`,
                        '',
                        '*Thank you for helping keep our community safe.*'
                    ].join('\n'))
            );

            reporterComponents.push(reporterContainer);

            await reporter.send({
                components: reporterComponents,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Failed to send timeout DMs:', error);
        }
    }

 
    async sendClaimedDM(reporter, report, guild, moderator) {
        try {
            const dmComponents = [];
            
            const dmContainer = new ContainerBuilder()
                .setAccentColor(0x3498db);

            dmContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        '# 👤 Report Claimed',
                        `## ${guild.name}`,
                        '',
                        '> Your report is now being reviewed by a moderator',
                        '',
                        `**Report ID:** ${report.reportId}`,
                        `**Assigned Moderator:** ${moderator.displayName}`,
                        `**Status:** Under Review`,
                        '',
                        '*You will be notified when the review is complete.*'
                    ].join('\n'))
            );

            dmComponents.push(dmContainer);

            await reporter.send({
                components: dmComponents,
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error('Failed to send claimed DM:', error);
        }
    }

  
    async updateReportMessage(report, client) {
        try {
            const settings = await ReportSettings.findOne({ guildId: report.guildId });
            if (!settings || !settings.channels.reportsChannel) return;

            const guild = client.guilds.cache.get(report.guildId);
            if (!guild) return;

            const reportsChannel = guild.channels.cache.get(settings.channels.reportsChannel);
            if (!reportsChannel) return;

            if (!report.evidence.notificationMessageId) return;

            const message = await reportsChannel.messages.fetch(report.evidence.notificationMessageId);
            if (!message) return;

        
            const components = this.createReportComponents(report);
            const buttons = this.createReportButtons(report);

            await message.edit({
                components: [...components, buttons],
                flags: MessageFlags.IsComponentsV2
            });

            console.log(`✅ Updated report message for ${report.reportId} - Status: ${report.status}`);

        } catch (error) {
            console.error('Failed to update report message:', error);
        }
    }
    
    async checkDuplicateReports(guildId, reportedUserId, reporterId, reason) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        return await Report.findOne({
            guildId,
            'reportedUser.userId': reportedUserId,
            'reporter.userId': reporterId,
            'timestamps.createdAt': { $gte: twentyFourHoursAgo },
            $or: [
                { reason: { $regex: reason.substring(0, 50), $options: 'i' } },
                { status: { $in: ['pending', 'under_review'] } }
            ]
        });
    }
    
    async handleAutoActions(report, client) {
        if (!report.aiAnalysis.analyzed) return;
        
        const settings = await ReportSettings.findOne({ guildId: report.guildId });
        if (!settings?.autoModeration.enabled) return;
        
        const { severity, confidence, flags } = report.aiAnalysis;
        
     
        if (settings.autoModeration.autoTimeout.enabled && 
            flags.includes('auto_timeout') && 
            confidence >= 0.8) {
            
            await this.executeAutoTimeout(report, client, settings);
        }
        
        
        if (settings.autoModeration.autoEscalate.enabled && 
            (severity === 'critical' || confidence >= settings.autoModeration.autoEscalate.confidenceThreshold)) {
            
            report.status = 'escalated';
            await report.save();
        }
    }
    
    async executeAutoTimeout(report, client, settings) {
        try {
            const guild = client.guilds.cache.get(report.guildId);
            if (!guild) return;
            
            const member = await guild.members.fetch(report.reportedUser.userId);
            if (!member) return;

            const reporter = await client.users.fetch(report.reporter.userId);
            
            const duration = settings.autoModeration.autoTimeout.duration * 1000; 
            await member.timeout(duration, `Auto-timeout: Report ${report.reportId}`);
            
         
            await this.sendTimeoutDMs(member.user, reporter, report, guild, duration);
            
         
            report.resolution = {
                action: 'timeout',
                details: `Auto-timeout: ${settings.autoModeration.autoTimeout.duration}s`,
                resolvedBy: 'Auto-Moderator',
                resolvedAt: new Date()
            };
            
            report.status = 'resolved';
            await report.save();

   
            await this.updateReportMessage(report, client);
            
        } catch (error) {
            console.error('Auto-timeout failed:', error);
        }
    }
    
    async getReportStats(guildId, period = 'week') {
        const startDate = new Date();
        
        switch (period) {
            case 'day':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
        }
        
        const stats = await Report.aggregate([
            { $match: { guildId, 'timestamps.createdAt': { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalReports: { $sum: 1 },
                    pendingReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    resolvedReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    dismissedReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] }
                    },
                    escalatedReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] }
                    },
                    avgConfidence: { $avg: '$aiAnalysis.confidence' },
                    avgRiskScore: { $avg: '$aiAnalysis.riskScore' }
                }
            }
        ]);
        
        return stats[0] || {
            totalReports: 0,
            pendingReports: 0,
            resolvedReports: 0,
            dismissedReports: 0,
            escalatedReports: 0,
            avgConfidence: 0,
            avgRiskScore: 0
        };
    }
    
    async getReportById(reportId, guildId) {
        return await Report.findOne({ reportId, guildId });
    }
    
    async getReportsByUser(userId, guildId, limit = 10) {
        return await Report.find({
            guildId,
            'reportedUser.userId': userId
        })
        .sort({ 'timestamps.createdAt': -1 })
        .limit(limit);
    }
    
   
    async updateReportStatus(reportId, guildId, status, moderatorId, client) {
        const report = await Report.findOne({ reportId, guildId });
        if (!report) return null;
        
        report.status = status;
        report.timestamps.updatedAt = new Date();
        
        if (moderatorId && !report.assignedModerator?.userId) {
            report.assignedModerator = {
                userId: moderatorId,
                assignedAt: new Date()
            };

            
            if (status === 'under_review') {
                try {
                    const reporter = await client.users.fetch(report.reporter.userId);
                    const guild = client.guilds.cache.get(guildId);
                    const moderator = await client.users.fetch(moderatorId);
                    
                    await this.sendClaimedDM(reporter, report, guild, moderator);
                } catch (error) {
                    console.error('Failed to send claimed DM:', error);
                }
            }
        }
        
        await report.save();
        
      
        if (['resolved', 'dismissed'].includes(status)) {
            await this.updateReportMessage(report, client);
        }
        
        return report;
    }
    
    async addModeratorNote(reportId, guildId, moderatorId, moderatorName, note) {
        const report = await Report.findOne({ reportId, guildId });
        if (!report) return null;
        
        report.moderatorNotes.push({
            moderatorId,
            moderatorName,
            note,
            timestamp: new Date()
        });
        
        await report.save();
        return report;
    }
    
  
    async resolveReport(reportId, guildId, resolution, client) {
        const report = await Report.findOne({ reportId, guildId });
        if (!report) return null;
        
        report.status = 'resolved';
        report.resolution = {
            ...resolution,
            resolvedAt: new Date()
        };
        
        await report.save();

     
        try {
            const reportedUser = await client.users.fetch(report.reportedUser.userId);
            const reporter = await client.users.fetch(report.reporter.userId);
            const guild = client.guilds.cache.get(guildId);
            
           
            await this.sendResolvedDM(reportedUser, report, guild, resolution);
            
          
            await this.sendResolvedReporterDM(reporter, report, guild, resolution);
            
        } catch (error) {
            console.error('Failed to send resolved DMs:', error);
        }

       
        await this.updateReportMessage(report, client);
        
        return report;
    }

  
    async dismissReport(reportId, guildId, reason, client) {
        const report = await Report.findOne({ reportId, guildId });
        if (!report) return null;
        
        report.status = 'dismissed';
        report.resolution = {
            action: 'dismissed',
            details: reason,
            resolvedAt: new Date()
        };
        
        await report.save();

       
        try {
            const reportedUser = await client.users.fetch(report.reportedUser.userId);
            const reporter = await client.users.fetch(report.reporter.userId);
            const guild = client.guilds.cache.get(guildId);
            
         
            await this.sendDismissedDM(reportedUser, report, guild, reason);
            
          
            await this.sendDismissedReporterDM(reporter, report, guild, reason);
            
        } catch (error) {
            console.error('Failed to send dismissed DMs:', error);
        }

    
        await this.updateReportMessage(report, client);
        
        return report;
    }

  
    async applyTimeoutFromReport(reportId, guildId, duration, moderatorId, client) {
        const report = await Report.findOne({ reportId, guildId });
        if (!report) return null;

        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return null;

            const member = await guild.members.fetch(report.reportedUser.userId);
            const reporter = await client.users.fetch(report.reporter.userId);
            
            if (!member) return null;

            await member.timeout(duration * 1000, `Timeout applied via report ${reportId}`);

          
            await this.sendTimeoutDMs(member.user, reporter, report, guild, duration * 1000);

           
            report.status = 'resolved';
            report.resolution = {
                action: 'timeout',
                details: `Manual timeout: ${duration} seconds`,
                resolvedBy: moderatorId,
                resolvedAt: new Date()
            };

            await report.save();

         
            await this.updateReportMessage(report, client);

            return report;
        } catch (error) {
            console.error('Failed to apply timeout:', error);
            return null;
        }
    }
    
    async getPendingReports(guildId, limit = 50) {
        return await Report.find({
            guildId,
            status: { $in: ['pending', 'under_review'] }
        })
        .sort({ priority: -1, 'timestamps.createdAt': -1 })
        .limit(limit);
    }
    
    async getHighPriorityReports(guildId) {
        return await Report.find({
            guildId,
            priority: { $in: ['high', 'urgent'] },
            status: { $in: ['pending', 'under_review', 'escalated'] }
        })
        .sort({ priority: -1, 'timestamps.createdAt': -1 });
    }
}

module.exports = new ReportService();
