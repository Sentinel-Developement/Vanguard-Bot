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
const { setTimeout } = require('timers/promises');
const cmdIcons = require('../../UI/icons/commandicons');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

const activeTimers = new Map();
const activeReminders = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('Manage timers, reminders, and time-related utilities.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('timer')
                .setDescription('Set a countdown timer.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Time duration for the timer in minutes.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1440))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Optional name for the timer.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remind')
                .setDescription('Set a reminder for a task.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Time duration for the reminder in minutes.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1440))
                .addStringOption(option =>
                    option.setName('task')
                        .setDescription('Task to be reminded about.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stopwatch')
                .setDescription('Start a stopwatch.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Optional name for the stopwatch.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop a running timer, reminder, or stopwatch.')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of timer to stop.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Timer', value: 'timer' },
                            { name: 'Reminder', value: 'reminder' },
                            { name: 'Stopwatch', value: 'stopwatch' },
                            { name: 'All', value: 'all' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all active timers and reminders.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timezone')
                .setDescription('Get current time in different timezones.')
                .addStringOption(option =>
                    option.setName('zone')
                        .setDescription('Timezone (e.g., UTC, EST, PST, GMT+5:30)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pomodoro')
                .setDescription('Start a Pomodoro timer session.')
                .addIntegerOption(option =>
                    option.setName('work')
                        .setDescription('Work duration in minutes (default: 25)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(60))
                .addIntegerOption(option =>
                    option.setName('break')
                        .setDescription('Break duration in minutes (default: 5)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(30)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('interval')
                .setDescription('Set an interval timer that repeats.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Interval duration in minutes.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(60))
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of times to repeat (default: unlimited)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to display each interval.')
                        .setRequired(false))),


    name: 'time',
    aliases: ['timer', 'remind', 'stopwatch', 't'],
    description: 'Manage timers, reminders, and time-related utilities.',
    usage: 'time <subcommand> [options]',
    category: 'utility',

    async execute(interaction, args = []) {
     
        if (interaction.isCommand && interaction.isCommand()) {
            return this.handleSlashCommand(interaction);
        }
        
 
        return this.handlePrefixCommand(interaction, args);
    },

    async handleSlashCommand(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        switch (subcommand) {
            case 'timer':
                await this.handleTimer(interaction, userId);
                break;
            case 'remind':
                await this.handleReminder(interaction, userId);
                break;
            case 'stopwatch':
                await this.handleStopwatch(interaction, userId);
                break;
            case 'stop':
                await this.handleStop(interaction, userId);
                break;
            case 'list':
                await this.handleList(interaction, userId);
                break;
            case 'timezone':
                await this.handleTimezone(interaction);
                break;
            case 'pomodoro':
                await this.handlePomodoro(interaction, userId);
                break;
            case 'interval':
                await this.handleInterval(interaction, userId);
                break;
            default:
                await this.showHelp(interaction);
        }
    },

    async handlePrefixCommand(message, args) {
        if (args.length === 0) {
            return this.showHelp(message, true);
        }

        const subcommand = args[0].toLowerCase();
        const userId = message.author.id;

        switch (subcommand) {
            case 'timer':
                await this.handleTimerPrefix(message, args, userId);
                break;
            case 'remind':
                await this.handleReminderPrefix(message, args, userId);
                break;
            case 'stopwatch':
                await this.handleStopwatchPrefix(message, args, userId);
                break;
            case 'stop':
                await this.handleStopPrefix(message, args, userId);
                break;
            case 'list':
                await this.handleListPrefix(message, userId);
                break;
            case 'timezone':
                await this.handleTimezonePrefix(message, args);
                break;
            case 'pomodoro':
                await this.handlePomodoroPrefix(message, args, userId);
                break;
            case 'interval':
                await this.handleIntervalPrefix(message, args, userId);
                break;
            default:
                await this.showHelp(message, true);
        }
    },

    async handleTimer(interaction, userId) {
        const minutes = interaction.options.getInteger('minutes');
        const name = interaction.options.getString('name') || 'Timer';
        const duration = minutes * 60000;

        const timerId = `${userId}-timer-${Date.now()}`;
        activeTimers.set(timerId, {
            userId,
            name,
            duration: minutes,
            startTime: Date.now()
        });

        const timerContainer = new ContainerBuilder()
            .setAccentColor(0xFFA500)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ⏳ Timer Started\nCountdown timer has been activated')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🎯 Timer Name:** ${name}\n**⏱️ Duration:** ${minutes} minutes\n**🚀 Started:** <t:${Math.floor(Date.now() / 1000)}:R>`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${interaction.user.username}'s timer`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Timer will complete in ${minutes} minutes • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [timerContainer],
            flags: MessageFlags.IsComponentsV2 
        });

        await setTimeout(duration);

        if (activeTimers.has(timerId)) {
            activeTimers.delete(timerId);
            
            const finishedContainer = new ContainerBuilder()
                .setAccentColor(0x00FF00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ⏰ Timer Finished!\nYour countdown timer has completed')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`${interaction.user}, your **${name}** (${minutes} minutes) is complete!`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription('Timer completed')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Timer completed • ${new Date().toLocaleString()}*`)
                );

            await interaction.followUp({ 
                components: [finishedContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }
    },

    async handleReminder(interaction, userId) {
        const minutes = interaction.options.getInteger('minutes');
        const task = interaction.options.getString('task');
        const duration = minutes * 60000;

        const reminderId = `${userId}-reminder-${Date.now()}`;
        activeReminders.set(reminderId, {
            userId,
            task,
            duration: minutes,
            startTime: Date.now()
        });

        const reminderContainer = new ContainerBuilder()
            .setAccentColor(0x3498DB)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ✅ Reminder Set\nTask reminder has been scheduled')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**📝 Task:** "${task}"\n**⏱️ Duration:** ${minutes} minutes\n**🔔 Reminder Time:** <t:${Math.floor((Date.now() + duration) / 1000)}:R>`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${interaction.user.username}'s reminder`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Reminder set for ${minutes} minutes • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [reminderContainer],
            flags: MessageFlags.IsComponentsV2 
        });

        await setTimeout(duration);

        if (activeReminders.has(reminderId)) {
            activeReminders.delete(reminderId);
            
            const alertContainer = new ContainerBuilder()
                .setAccentColor(0xFF6B6B)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🔔 Reminder Alert!\nIt\'s time for your scheduled task')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`${interaction.user}, it's time for: **"${task}"**`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription('Reminder alert')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Reminder triggered • ${new Date().toLocaleString()}*`)
                );

            await interaction.followUp({ 
                components: [alertContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }
    },

    async handleStopwatch(interaction, userId) {
        const name = interaction.options.getString('name') || 'Stopwatch';
        const startTime = Date.now();

        const stopwatchContainer = new ContainerBuilder()
            .setAccentColor(0xFF00FF)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ⏱️ Stopwatch Started\nStopwatch is now running and tracking time')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⏱️ Stopwatch:** ${name}\n**🚀 Started:** <t:${Math.floor(startTime / 1000)}:R>\n**📊 Status:** Running`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${interaction.user.username}'s stopwatch`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**💡 Tip:** Use `/time stop stopwatch` to stop and get elapsed time')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Stopwatch started • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [stopwatchContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handlePomodoro(interaction, userId) {
        const workDuration = interaction.options.getInteger('work') || 25;
        const breakDuration = interaction.options.getInteger('break') || 5;

        const pomodoroContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 🍅 Pomodoro Session Started\nProductivity timer with work and break phases')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⚡ Work Phase:** ${workDuration} minutes\n**☕ Break Phase:** ${breakDuration} minutes\n**📊 Status:** Work phase starting...`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Pomodoro session')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**🎯 Pomodoro Technique**\nFocus intensely during work, then take a refreshing break!')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Pomodoro started • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [pomodoroContainer],
            flags: MessageFlags.IsComponentsV2 
        });

  
        await setTimeout(workDuration * 60000);

        const breakContainer = new ContainerBuilder()
            .setAccentColor(0x2ECC71)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 🍅 Break Time!\nTime to rest and recharge your energy')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`${interaction.user}, take a **${breakDuration} minute** break!\n\n**☕ Break Activities:**\n• Stretch your body\n• Get some water\n• Take deep breaths\n• Rest your eyes`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Break time')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Break phase started • ${new Date().toLocaleString()}*`)
            );

        await interaction.followUp({ 
            components: [breakContainer],
            flags: MessageFlags.IsComponentsV2 
        });

       
        await setTimeout(breakDuration * 60000);

        const completeContainer = new ContainerBuilder()
            .setAccentColor(0x3498DB)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 🍅 Pomodoro Complete!\nGreat work! Your productivity session is finished')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`${interaction.user}, your Pomodoro session is complete!\n\n**📈 Session Summary:**\n• Work time: ${workDuration} minutes\n• Break time: ${breakDuration} minutes\n• Status: ✅ Completed\n\nReady for the next one?`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Session completed')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Pomodoro completed • ${new Date().toLocaleString()}*`)
            );

        await interaction.followUp({ 
            components: [completeContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleInterval(interaction, userId) {
        const minutes = interaction.options.getInteger('minutes');
        const count = interaction.options.getInteger('count') || 0;
        const message = interaction.options.getString('message') || 'Interval reminder';

        const intervalId = `${userId}-interval-${Date.now()}`;
        let currentCount = 0;

        const intervalContainer = new ContainerBuilder()
            .setAccentColor(0xF39C12)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 🔄 Interval Timer Started\nRepeating timer with custom intervals')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⏰ Interval:** ${minutes} minutes\n**🔢 Repetitions:** ${count === 0 ? 'Unlimited' : count}\n**💬 Message:** "${message}"`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Interval timer')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('**💡 Interval Timer**\nYou\'ll receive a notification every interval until stopped or completed')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Interval timer started • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [intervalContainer],
            flags: MessageFlags.IsComponentsV2 
        });

        const runInterval = async () => {
            while (count === 0 || currentCount < count) {
                await setTimeout(minutes * 60000);
                currentCount++;

                const alertContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🔄 Interval Alert\nScheduled interval notification')
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`${interaction.user}, **${message}**\n\n**📊 Interval Info:**\n• Current: #${currentCount}\n• Next in: ${minutes} minutes\n• ${count === 0 ? 'Unlimited repeats' : `${count - currentCount} remaining`}`)
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                    .setDescription(`Interval #${currentCount}`)
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*Interval #${currentCount} • ${new Date().toLocaleString()}*`)
                    );

                await interaction.followUp({ 
                    components: [alertContainer],
                    flags: MessageFlags.IsComponentsV2 
                });
            }
        };

        runInterval();
    },

    async handleStop(interaction, userId) {
        const type = interaction.options.getString('type');
        let stopped = 0;

        if (type === 'timer' || type === 'all') {
            for (const [key, timer] of activeTimers.entries()) {
                if (timer.userId === userId) {
                    activeTimers.delete(key);
                    stopped++;
                }
            }
        }

        if (type === 'reminder' || type === 'all') {
            for (const [key, reminder] of activeReminders.entries()) {
                if (reminder.userId === userId) {
                    activeReminders.delete(key);
                    stopped++;
                }
            }
        }

        const stopContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 🛑 Timer Operations Stopped\nActive timers and reminders have been terminated')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(stopped > 0 ? `**📊 Result:** Stopped ${stopped} active ${type === 'all' ? 'timers/reminders' : type}(s)\n**⚡ Action:** All selected timers terminated\n**✅ Status:** Operation completed successfully` : `**📊 Result:** No active ${type}s found\n**💡 Info:** Nothing to stop\n**📋 Suggestion:** Use \`/time list\` to see active timers`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Stop operation')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Stop operation completed • ${new Date().toLocaleString()}*`)
            );

        await interaction.reply({ 
            components: [stopContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleList(interaction, userId) {
        const userTimers = Array.from(activeTimers.entries()).filter(([_, timer]) => timer.userId === userId);
        const userReminders = Array.from(activeReminders.entries()).filter(([_, reminder]) => reminder.userId === userId);

        const listContainer = new ContainerBuilder()
            .setAccentColor(0x17A2B8)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# 📋 Active Timers & Reminders\nYour currently running time-based activities')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            );

        if (userTimers.length === 0 && userReminders.length === 0) {
            listContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('**📭 No Active Items**\nYou have no active timers or reminders running.\n\n**🚀 Get Started:**\n• `/time timer` - Set a countdown timer\n• `/time remind` - Set a task reminder\n• `/time pomodoro` - Start productivity session')
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('No active timers')
                    )
            );
        } else {
            listContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**📊 Summary:**\n• Active Timers: ${userTimers.length}\n• Active Reminders: ${userReminders.length}\n• Total: ${userTimers.length + userReminders.length}`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${interaction.user.username}'s timers`)
                    )
            );

            if (userTimers.length > 0) {
                const timerList = userTimers.map(([_, timer]) => {
                    const elapsed = Math.floor((Date.now() - timer.startTime) / 60000);
                    const remaining = timer.duration - elapsed;
                    return `• **${timer.name}** - ${remaining > 0 ? `${remaining}m remaining` : 'Finishing...'}`;
                }).join('\n');
                
                listContainer.addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⏳ Active Timers**\n${timerList}`)
                );
            }

            if (userReminders.length > 0) {
                const reminderList = userReminders.map(([_, reminder]) => {
                    const elapsed = Math.floor((Date.now() - reminder.startTime) / 60000);
                    const remaining = reminder.duration - elapsed;
                    return `• **${reminder.task}** - ${remaining > 0 ? `${remaining}m remaining` : 'Finishing...'}`;
                }).join('\n');
                
                listContainer.addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔔 Active Reminders**\n${reminderList}`)
                );
            }
        }

        listContainer.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Timer list updated • ${new Date().toLocaleString()}*`)
        );

        await interaction.reply({ 
            components: [listContainer],
            flags: MessageFlags.IsComponentsV2 
        });
    },

    async handleTimezone(interaction) {
        const zone = interaction.options.getString('zone') || 'UTC';
        
        try {
            const now = new Date();
            let timeString;
            
            if (zone.toUpperCase() === 'UTC') {
                timeString = now.toUTCString();
            } else {
                timeString = now.toLocaleString('en-US', { 
                    timeZone: zone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }

            const timezoneContainer = new ContainerBuilder()
                .setAccentColor(0x6C5CE7)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🌍 Timezone Information\nCurrent time in the specified timezone')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🕐 Timezone:** ${zone}\n**📅 Current Time:** ${timeString}\n**🔄 Updated:** Live time display`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder()
                                .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                                .setDescription('Timezone query')
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**🌐 Popular Timezones:**\nUTC, America/New_York, America/Los_Angeles, Europe/London, Asia/Tokyo')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Timezone lookup • ${new Date().toLocaleString()}*`)
                );

            await interaction.reply({ 
                components: [timezoneContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        } catch (error) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid Timezone\nThe specified timezone could not be found')
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**❌ Invalid Timezone:** ${zone}\n\n**✅ Valid Examples:**\n• UTC\n• America/New_York\n• Europe/London\n• Asia/Tokyo\n• Australia/Sydney`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Small)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`*Error occurred • ${new Date().toLocaleString()}*`)
                );

            await interaction.reply({ 
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }
    },


    async handleTimerPrefix(message, args, userId) {
        if (args.length < 2) {
            const usageContainer = new ContainerBuilder()
                .setAccentColor(0xFFAA00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❓ Timer Usage\nUsage: `time timer <minutes> [name]`')
                );
            
            return message.reply({ 
                components: [usageContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
            const invalidContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid Duration\nPlease provide a valid duration (1-1440 minutes)')
                );
                
            return message.reply({ 
                components: [invalidContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const name = args.slice(2).join(' ') || 'Timer';
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'minutes' ? minutes : null,
                getString: (key) => key === 'name' ? name : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handleTimer(mockInteraction, userId);
    },

    async handleReminderPrefix(message, args, userId) {
        if (args.length < 3) {
            const usageContainer = new ContainerBuilder()
                .setAccentColor(0xFFAA00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❓ Reminder Usage\nUsage: `time remind <minutes> <task>`')
                );
                
            return message.reply({ 
                components: [usageContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
            const invalidContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid Duration\nPlease provide a valid duration (1-1440 minutes)')
                );
                
            return message.reply({ 
                components: [invalidContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const task = args.slice(2).join(' ');
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'minutes' ? minutes : null,
                getString: (key) => key === 'task' ? task : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handleReminder(mockInteraction, userId);
    },

    async handleStopwatchPrefix(message, args, userId) {
        const name = args.slice(1).join(' ') || 'Stopwatch';
        
        const mockInteraction = {
            options: {
                getString: (key) => key === 'name' ? name : null
            },
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleStopwatch(mockInteraction, userId);
    },

    async handleListPrefix(message, userId) {
        const mockInteraction = {
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleList(mockInteraction, userId);
    },

    async handleStopPrefix(message, args, userId) {
        const type = args[1] || 'all';
        
        const mockInteraction = {
            options: {
                getString: (key) => key === 'type' ? type : null
            },
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleStop(mockInteraction, userId);
    },

    async handleTimezonePrefix(message, args) {
        const zone = args.slice(1).join(' ') || 'UTC';
        
        const mockInteraction = {
            options: {
                getString: (key) => key === 'zone' ? zone : null
            },
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleTimezone(mockInteraction);
    },

    async handlePomodoroPrefix(message, args, userId) {
        const work = parseInt(args[1]) || 25;
        const breakTime = parseInt(args[1]) || 5;
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'work' ? work : key === 'break' ? breakTime : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handlePomodoro(mockInteraction, userId);
    },

    async handleIntervalPrefix(message, args, userId) {
        if (args.length < 2) {
            const usageContainer = new ContainerBuilder()
                .setAccentColor(0xFFAA00)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❓ Interval Usage\nUsage: `time interval <minutes> [count] [message]`')
                );
                
            return message.reply({ 
                components: [usageContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 60) {
            const invalidContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid Interval\nPlease provide a valid interval (1-60 minutes)')
                );
                
            return message.reply({ 
                components: [invalidContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        }

        const count = parseInt(args[2]) || 0;
        const messageText = args.slice(3).join(' ') || 'Interval reminder';
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'minutes' ? minutes : key === 'count' ? count : null,
                getString: (key) => key === 'message' ? messageText : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handleInterval(mockInteraction, userId);
    },

    async showHelp(interaction, isPrefix = false) {
        const helpContainer = new ContainerBuilder()
            .setAccentColor(0x3498DB)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ⏰ Time Management Commands\nComprehensive time utilities and productivity tools')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(isPrefix ? '**📋 Available Prefix Commands:**' : '**📋 Available Slash Commands:**')
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(cmdIcons.dotIcon || (interaction.user && interaction.user.displayAvatarURL({ dynamic: true, size: 128 })) || (interaction.author && interaction.author.displayAvatarURL({ dynamic: true, size: 128 })) || 'https://cdn.discordapp.com/embed/avatars/0.png')
                            .setDescription('Time commands help')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('Use the appropriate command format to get started with time management!')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Time management system • ${new Date().toLocaleString()}*`)
            );

        if (isPrefix) {
            await interaction.reply({ 
                components: [helpContainer],
                flags: MessageFlags.IsComponentsV2 
            });
        } else {
            await interaction.reply({ 
                components: [helpContainer],
                flags: MessageFlags.IsComponentsV2 
            });
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