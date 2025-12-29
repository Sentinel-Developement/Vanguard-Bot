const CountingConfig = require('./Schema');

class CountingController {
    /**
     * Get counting configuration for a server
     * @param {string} serverId - Discord server ID
     * @returns {Promise<Object|null>}
     */
    static async getCountingConfig(serverId) {
        try {
            return await CountingConfig.findByServerId(serverId);
        } catch (error) {
            console.error('Error fetching counting config:', error);
            return null;
        }
    }

    /**
     * Create or update counting configuration
     * @param {string} serverId - Discord server ID
     * @param {Object} configData - Configuration data
     * @returns {Promise<Object|null>}
     */
    static async createOrUpdateConfig(serverId, configData) {
        try {
            return await CountingConfig.findOneAndUpdate(
                { serverId },
                { serverId, ...configData },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error creating/updating counting config:', error);
            return null;
        }
    }

    /**
     * Delete counting configuration
     * @param {string} serverId - Discord server ID
     * @returns {Promise<boolean>}
     */
    static async deleteConfig(serverId) {
        try {
            const result = await CountingConfig.deleteOne({ serverId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting counting config:', error);
            return false;
        }
    }

    /**
     * Get leaderboard for a server
     * @param {string} serverId - Discord server ID
     * @param {number} limit - Number of entries to return
     * @returns {Promise<Array>}
     */
    static async getLeaderboard(serverId, limit = 10) {
        try {
            return await CountingConfig.getLeaderboard(serverId, limit);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }

    /**
     * Get user statistics for counting
     * @param {string} serverId - Discord server ID
     * @param {string} userId - Discord user ID
     * @returns {Promise<Object|null>}
     */
    static async getUserStats(serverId, userId) {
        try {
            const config = await CountingConfig.findByServerId(serverId);
            if (!config) return null;

            const userEntry = config.leaderboard.find(entry => entry.userId === userId);
            if (!userEntry) return null;

            const userRank = config.leaderboard.findIndex(entry => entry.userId === userId) + 1;

            return {
                count: userEntry.count,
                rank: userRank,
                lastContribution: userEntry.lastContribution,
                totalUsers: config.leaderboard.length
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
    }

    /**
     * Get milestone achievements
     * @param {string} serverId - Discord server ID
     * @returns {Promise<Array>}
     */
    static async getMilestones(serverId) {
        try {
            const config = await CountingConfig.findByServerId(serverId);
            return config ? config.milestones : [];
        } catch (error) {
            console.error('Error fetching milestones:', error);
            return [];
        }
    }

    /**
     * Process a count attempt
     * @param {string} serverId - Discord server ID
     * @param {string} channelId - Discord channel ID
     * @param {string} userId - Discord user ID
     * @param {number} count - The count number
     * @returns {Promise<Object>} Result object with success status and details
     */
    static async processCount(serverId, channelId, userId, count) {
        try {
            const config = await CountingConfig.findOne({ 
                serverId, 
                channelId, 
                status: true 
            });

            if (!config) {
                return { success: false, error: 'Counting not enabled for this channel' };
            }

            const expectedCount = config.currentCount + 1;

            // Validate count
            if (count !== expectedCount) {
                return { 
                    success: false, 
                    error: 'wrong_number', 
                    expected: expectedCount, 
                    received: count 
                };
            }

            // Check same user rule
            if (!config.allowSameUser && config.lastUserId === userId) {
                return { success: false, error: 'same_user_not_allowed' };
            }

            // Update count
            await config.incrementCount(userId);

            return { 
                success: true, 
                newCount: count,
                isHighestCount: count > config.highestCount,
                config: config
            };

        } catch (error) {
            console.error('Error processing count:', error);
            return { success: false, error: 'database_error' };
        }
    }

    /**
     * Reset counting for a server
     * @param {string} serverId - Discord server ID
     * @param {string} userId - User who initiated the reset
     * @returns {Promise<boolean>}
     */
    static async resetCounting(serverId, userId) {
        try {
            const config = await CountingConfig.findByServerId(serverId);
            if (!config) return false;

            await config.resetCounting(userId);
            return true;
        } catch (error) {
            console.error('Error resetting count:', error);
            return false;
        }
    }

    /**
     * Update count manually
     * @param {string} serverId - Discord server ID
     * @param {number} newCount - New count value
     * @returns {Promise<boolean>}
     */
    static async updateCount(serverId, newCount) {
        try {
            const config = await CountingConfig.findByServerId(serverId);
            if (!config) return false;

            config.currentCount = newCount;
            config.lastUserId = null;
            await config.save();

            return true;
        } catch (error) {
            console.error('Error updating count:', error);
            return false;
        }
    }

    /**
     * Get server statistics
     * @param {string} serverId - Discord server ID
     * @returns {Promise<Object|null>}
     */
    static async getServerStats(serverId) {
        try {
            const config = await CountingConfig.findByServerId(serverId);
            if (!config) return null;

            return {
                currentCount: config.currentCount,
                highestCount: config.highestCount,
                totalMessages: config.totalMessages,
                resetCount: config.resetCount,
                totalUsers: config.leaderboard.length,
                milestonesAchieved: config.milestones.length,
                lastUpdated: config.updatedAt,
                channelId: config.channelId,
                status: config.status
            };
        } catch (error) {
            console.error('Error fetching server stats:', error);
            return null;
        }
    }

    /**
     * Check if milestone should be celebrated
     * @param {number} count - Current count
     * @param {Array} existingMilestones - Array of existing milestone counts
     * @returns {boolean}
     */
    static shouldCelebrateMilestone(count, existingMilestones = []) {
        const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
        
        return MILESTONE_THRESHOLDS.includes(count) && 
               !existingMilestones.some(m => m.count === count);
    }

    /**
     * Get next milestone
     * @param {number} currentCount - Current count
     * @returns {number|null}
     */
    static getNextMilestone(currentCount) {
        const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
        
        return MILESTONE_THRESHOLDS.find(milestone => milestone > currentCount) || null;
    }

    /**
     * Get all servers with active counting
     * @returns {Promise<Array>}
     */
    static async getActiveServers() {
        try {
            return await CountingConfig.find({ status: true }).select('serverId channelId currentCount');
        } catch (error) {
            console.error('Error fetching active servers:', error);
            return [];
        }
    }

    /**
     * Backup counting data for a server
     * @param {string} serverId - Discord server ID
     * @returns {Promise<Object|null>}
     */
    static async backupServerData(serverId) {
        try {
            const config = await CountingConfig.findByServerId(serverId);
            if (!config) return null;

            return {
                serverId: config.serverId,
                currentCount: config.currentCount,
                highestCount: config.highestCount,
                totalMessages: config.totalMessages,
                resetCount: config.resetCount,
                leaderboard: config.leaderboard,
                milestones: config.milestones,
                settings: {
                    allowSameUser: config.allowSameUser,
                    deleteWrongMessages: config.deleteWrongMessages,
                    showErrorMessages: config.showErrorMessages,
                    errorMessageDuration: config.errorMessageDuration
                },
                createdAt: config.createdAt,
                updatedAt: config.updatedAt
            };
        } catch (error) {
            console.error('Error backing up server data:', error);
            return null;
        }
    }
}

module.exports = CountingController;