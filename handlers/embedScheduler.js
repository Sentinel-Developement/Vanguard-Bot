const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const Embed = require('../models/embed/embed');
const EmbedSchedule = require('../models/embed/schedule');

class EmbedSchedulerHandler {
    constructor(client) {
        this.client = client;
        this.activeJobs = new Map();
        this.init();
    }

    async init() {
        //console.log('📅 Embed Scheduler Handler loaded!');
        
        // Load existing schedules
        await this.loadSchedules();
        
        // Health check every hour
        cron.schedule('0 * * * *', async () => {
            await this.healthCheck();
        });
        
        // Cleanup failed schedules daily
        cron.schedule('0 3 * * *', async () => {
            await this.cleanupFailedSchedules();
        });
    }

    async loadSchedules() {
        try {
            const schedules = await EmbedSchedule.find({ 
                isActive: true,
                $or: [
                    { maxRuns: { $exists: false } },
                    { $expr: { $lt: ['$runCount', '$maxRuns'] } }
                ]
            });
            
            let loaded = 0;
            for (const schedule of schedules) {
                if (await this.createJob(schedule)) {
                    loaded++;
                }
            }
            
            //console.log(`📊 Loaded ${loaded}/${schedules.length} scheduled embeds`);
        } catch (error) {
            console.error('Error loading embed schedules:', error);
        }
    }

    async createJob(schedule) {
        try {
            const cronExpression = this.getCronExpression(schedule);
            if (!cronExpression) return false;

            const job = cron.schedule(cronExpression, async () => {
                await this.executeSchedule(schedule.scheduleId);
            }, {
                scheduled: true,
                timezone: schedule.timezone || 'UTC'
            });

            this.activeJobs.set(schedule.scheduleId, {
                job,
                schedule,
                lastCheck: new Date()
            });

            return true;
        } catch (error) {
            console.error(`Failed to create job for schedule ${schedule.scheduleId}:`, error);
            await this.recordFailure(schedule.scheduleId, error.message);
            return false;
        }
    }

    getCronExpression(schedule) {
        const [hours, minutes] = schedule.time.split(':').map(Number);
        
        switch (schedule.frequency) {
            case 'hourly':
                return `${minutes} * * * *`;
            case 'daily':
                return `${minutes} ${hours} * * *`;
            case 'weekly_monday':
                return `${minutes} ${hours} * * 1`;
            case 'weekly_tuesday':
                return `${minutes} ${hours} * * 2`;
            case 'weekly_wednesday':
                return `${minutes} ${hours} * * 3`;
            case 'weekly_thursday':
                return `${minutes} ${hours} * * 4`;
            case 'weekly_friday':
                return `${minutes} ${hours} * * 5`;
            case 'weekly_saturday':
                return `${minutes} ${hours} * * 6`;
            case 'weekly_sunday':
                return `${minutes} ${hours} * * 0`;
            case 'monthly':
                return `${minutes} ${hours} 1 * *`;
            case 'custom':
                return schedule.customCron;
            default:
                return null;
        }
    }

    async executeSchedule(scheduleId) {
        try {
            const schedule = await EmbedSchedule.findOne({ 
                scheduleId,
                isActive: true 
            });
            
            if (!schedule) {
                console.log(`Schedule ${scheduleId} not found or inactive`);
                this.removeJob(scheduleId);
                return;
            }

            // Check max runs
            if (schedule.maxRuns && schedule.runCount >= schedule.maxRuns) {
                console.log(`Schedule ${scheduleId} reached max runs limit`);
                await this.deactivateSchedule(scheduleId);
                return;
            }

            // Get embed
            const embed = await Embed.findOne({ embedId: schedule.embedId });
            if (!embed) {
                console.error(`Embed ${schedule.embedId} not found for schedule ${scheduleId}`);
                await this.recordFailure(scheduleId, 'Embed not found');
                return;
            }

            // Get guild and channel
            const guild = this.client.guilds.cache.get(schedule.guildId);
            if (!guild) {
                console.error(`Guild ${schedule.guildId} not found for schedule ${scheduleId}`);
                await this.recordFailure(scheduleId, 'Guild not found');
                return;
            }

            const channel = guild.channels.cache.get(schedule.channelId);
            if (!channel) {
                console.error(`Channel ${schedule.channelId} not found for schedule ${scheduleId}`);
                await this.recordFailure(scheduleId, 'Channel not found');
                return;
            }

            // Build embed
            const discordEmbed = this.buildEmbedFromData(embed);
            
            // Prepare message content
            let content = schedule.messageContent || '';
            if (schedule.mentionRoleId) {
                const role = guild.roles.cache.get(schedule.mentionRoleId);
                if (role) {
                    content = `${role.toString()} ${content}`.trim();
                }
            }

            // Send message
            await channel.send({
                content: content || undefined,
                embeds: [discordEmbed]
            });

            // Update schedule stats
            await EmbedSchedule.updateOne(
                { scheduleId },
                {
                    $inc: { runCount: 1 },
                    $set: { 
                        lastRun: new Date(),
                        failureCount: 0,
                        lastError: null
                    }
                }
            );

            // Update embed usage stats
            await Embed.updateOne(
                { embedId: schedule.embedId },
                {
                    $inc: { usageCount: 1 },
                    $set: { lastUsed: new Date() }
                }
            );

            console.log(`✅ Schedule ${scheduleId} executed successfully in ${channel.name}`);

        } catch (error) {
            console.error(`Error executing schedule ${scheduleId}:`, error);
            await this.recordFailure(scheduleId, error.message);
        }
    }

    buildEmbedFromData(embedData) {
        const embed = new EmbedBuilder();
        
        // Basic properties
        if (embedData.title) embed.setTitle(embedData.title);
        if (embedData.description) embed.setDescription(embedData.description);
        if (embedData.url) embed.setURL(embedData.url);
        if (embedData.color) {
            try {
                embed.setColor(embedData.color.startsWith('#') ? 
                    parseInt(embedData.color.replace('#', ''), 16) : 
                    embedData.color);
            } catch (e) {
                embed.setColor(0x3498db);
            }
        }
        if (embedData.timestamp) embed.setTimestamp();
        
        // Rich content
        if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
        if (embedData.image) embed.setImage(embedData.image);
        
        // Author
        if (embedData.author?.name) {
            embed.setAuthor({
                name: embedData.author.name,
                iconURL: embedData.author.iconURL || null,
                url: embedData.author.url || null
            });
        }
        
        // Footer
        if (embedData.footer?.text) {
            embed.setFooter({
                text: embedData.footer.text,
                iconURL: embedData.footer.iconURL || null
            });
        }
        
        // Fields
        if (embedData.fields?.length) {
            embed.addFields(embedData.fields.map(f => ({
                name: f.name,
                value: f.value,
                inline: f.inline || false
            })));
        }
        
        return embed;
    }

    async recordFailure(scheduleId, errorMessage) {
        try {
            const result = await EmbedSchedule.updateOne(
                { scheduleId },
                {
                    $inc: { failureCount: 1 },
                    $set: { lastError: errorMessage }
                }
            );

            const schedule = await EmbedSchedule.findOne({ scheduleId });
            if (schedule && schedule.failureCount >= schedule.maxFailures) {
                console.log(`Schedule ${scheduleId} disabled due to max failures`);
                await this.deactivateSchedule(scheduleId);
            }
        } catch (error) {
            console.error(`Error recording failure for schedule ${scheduleId}:`, error);
        }
    }

    async deactivateSchedule(scheduleId) {
        try {
            await EmbedSchedule.updateOne(
                { scheduleId },
                { $set: { isActive: false } }
            );
            this.removeJob(scheduleId);
        } catch (error) {
            console.error(`Error deactivating schedule ${scheduleId}:`, error);
        }
    }

    removeJob(scheduleId) {
        const jobData = this.activeJobs.get(scheduleId);
        if (jobData) {
            jobData.job.stop();
            this.activeJobs.delete(scheduleId);
        }
    }

    async addSchedule(scheduleData) {
        try {
            const schedule = new EmbedSchedule(scheduleData);
            await schedule.save();
            
            if (await this.createJob(schedule)) {
                return { success: true, schedule };
            } else {
                return { success: false, error: 'Failed to create cron job' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async removeSchedule(scheduleId) {
        try {
            await EmbedSchedule.deleteOne({ scheduleId });
            this.removeJob(scheduleId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healthCheck() {
        try {
            const activeSchedules = await EmbedSchedule.find({ isActive: true });
            const jobCount = this.activeJobs.size;
            
            if (activeSchedules.length !== jobCount) {
                console.log(`⚠️ Schedule mismatch: ${activeSchedules.length} in DB, ${jobCount} active jobs`);
                // Reload schedules
                await this.loadSchedules();
            }
            
           // console.log(`💓 Embed scheduler health check: ${jobCount} jobs active`);
        } catch (error) {
           // console.error('Error in embed scheduler health check:', error);
        }
    }

    async cleanupFailedSchedules() {
        try {
            const failedSchedules = await EmbedSchedule.find({
                isActive: false,
                updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days old
            });
            
            for (const schedule of failedSchedules) {
                this.removeJob(schedule.scheduleId);
            }
            
            if (failedSchedules.length > 0) {
                console.log(`🧹 Cleaned up ${failedSchedules.length} failed schedules`);
            }
        } catch (error) {
            console.error('Error cleaning up failed schedules:', error);
        }
    }

    getStats() {
        return {
            activeJobs: this.activeJobs.size,
            jobs: Array.from(this.activeJobs.keys())
        };
    }
}

module.exports = (client) => {
    return new EmbedSchedulerHandler(client);
};
