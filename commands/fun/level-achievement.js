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
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const levelingController = require('../../models/leveling/levelingController');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-achievement')
        .setDescription('View or explore leveling achievements')
        .addSubcommand(sub =>
            sub.setName('list')
               .setDescription('List unlocked achievements for a user')
               .addUserOption(opt =>
                   opt.setName('user')
                      .setDescription('User to check (defaults to you)')
                      .setRequired(false))
               .addIntegerOption(opt =>
                   opt.setName('page')
                      .setDescription('Page number')
                      .setMinValue(1)
                      .setMaxValue(10)
                      .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('progress')
               .setDescription('Show progress toward all achievements for a user')
               .addUserOption(opt =>
                   opt.setName('user')
                      .setDescription('User to check (defaults to you)')
                      .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('overview')
               .setDescription('See every achievement and its requirement')),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const sub = interaction.options.getSubcommand();
            if (sub === 'list')        return await listAchievements(interaction);
            if (sub === 'progress')    return await progressAchievements(interaction);
            if (sub === 'overview')    return await overviewAchievements(interaction);
        } catch (err) {
            console.error('Achievement command error:', err);

            const errContainer = new ContainerBuilder()
                .setAccentColor(0xFF4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('**⚠️ ACHIEVEMENT COMMAND FAILED**')
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('Please try again later or contact support.')
                );
            return interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};


async function listAchievements(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const page   = interaction.options.getInteger('page') || 1;
    const per    = 10;                  
    const data   = await levelingController.getUserRank(target.id, interaction.guild.id);
    if (!data) return noData(interaction, target);

    const unlocked = data.achievements || [];
    const total    = levelingController.achievements.length;
    const start    = (page - 1) * per;
    const slice    = unlocked.slice(start, start + per);

    const rows = slice.map(a =>
        `• **${getName(a.id)}** – unlocked <t:${Math.floor(new Date(a.unlockedAt).getTime()/1000)}:R>`
    ).join('\n') || '_No achievements on this page yet._';

    const container = new ContainerBuilder()
        .setAccentColor(0x22C55E)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**🏆 ACHIEVEMENTS UNLOCKED – PAGE ${page}**`)
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(rows))
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(target.displayAvatarURL({ dynamic:true, size:128 }))
                        .setDescription(`${target.username}'s achievements`)
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**Total:** ${unlocked.length}/${total} • *Requested by ${interaction.user.username}*`)
        );

    return interaction.editReply({ components:[container], flags:MessageFlags.IsComponentsV2 });
}

async function progressAchievements(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const data   = await levelingController.getUserRank(target.id, interaction.guild.id);
    if (!data) return noData(interaction, target);

    const lines = levelingController.achievements.map(ach => {
        const unlocked = data.achievements.find(a => a.id === ach.id);
        if (unlocked) return `✅ **${ach.name}** – complete`;
        const prog = currentProgress(ach, data);
        return `▪️ **${ach.name}** – ${prog}/${ach.requirement} ${unit(ach.type)}`;
    });

    const container = new ContainerBuilder()
        .setAccentColor(0x3B82F6)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**📈 ACHIEVEMENT PROGRESS**')
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')))
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(target.displayAvatarURL({ dynamic:true, size:128 }))
                        .setDescription(`${target.username}'s progress`)
                )
        );

    return interaction.editReply({ components:[container], flags:MessageFlags.IsComponentsV2 });
}

async function overviewAchievements(interaction) {
    const rows = levelingController.achievements.map(a =>
        `• **${a.name}** – ${a.description} (${a.requirement} ${unit(a.type)})`
    );

    const container = new ContainerBuilder()
        .setAccentColor(0xF97316)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**📜 ALL ACHIEVEMENTS**')
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(rows.join('\n')))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Total achievements: ${rows.length}*`)
        );

    return interaction.editReply({ components:[container], flags:MessageFlags.IsComponentsV2 });
}

/* ════════════════  HELPERS  ════════════════ */
function noData(interaction, user) {
    const noDataContainer = new ContainerBuilder()
        .setAccentColor(0xFF4757)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('**❌ NO DATA FOUND**')
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`${user.username} has no leveling data yet.`)
        );
    return interaction.editReply({ components:[noDataContainer], flags:MessageFlags.IsComponentsV2 });
}

function getName(id) {
    const ach = levelingController.achievements.find(a => a.id === id);
    return ach ? ach.name : id;
}

function currentProgress(ach, user) {
    switch (ach.type) {
        case 'levels':        return user.level;
        case 'messages':      return user.messageCount;
        case 'voice_minutes': return user.voiceStats.totalMinutes;
        case 'streak':        return user.streaks.daily;
        default:              return 0;
    }
}

function unit(type) {
    return {
        levels:        'levels',
        messages:      'messages',
        voice_minutes: 'minutes',
        streak:        'days'
    }[type] || '';
}

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