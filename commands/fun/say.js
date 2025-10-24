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
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize
} = require('discord.js');

const userCooldowns = new Map();
const COOLDOWN_TIME = 5000; 

const securityFilters = {
    blockedWords: [
        'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'nigger', 'faggot'
    ],
    

    dangerousPatterns: [
        /@everyone|@here/gi,                         
        /discord\.gg\/[\w-]+/gi,                   
        /https?:\/\/[^\s]+/gi,                      
        /[A-Z\s]{25,}/,                          
        /(.)\1{8,}/g,                        
    ]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('🗣️ Make the bot say something with basic safety')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want the bot to say')
                .setRequired(true)
                .setMaxLength(1500))
        .addStringOption(option =>
            option.setName('style')
                .setDescription('How to display the message')
                .setRequired(false)
                .addChoices(
                    { name: '💬 Plain Text', value: 'plain' },
                    { name: '📋 Embed Style', value: 'embed' },
                    { name: '💡 Info Box', value: 'info' },
                    { name: '✨ Announcement', value: 'announcement' }
                )),

    async execute(interaction) {
        if (!interaction.isChatInputCommand?.()) {
            return await this.sendSlashOnlyMessage(interaction);
        }

       
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownEnd = userCooldowns.get(userId);

        if (cooldownEnd && now < cooldownEnd) {
            const timeLeft = Math.ceil((cooldownEnd - now) / 1000);
            return await interaction.reply({
                content: `⏱️ Please wait ${timeLeft}s before using say again!`,
                ephemeral: true
            });
        }

        const message = interaction.options.getString('message');
        const style = interaction.options.getString('style') || 'plain';

       
        const securityResult = this.checkMessageSafety(message);
        
        if (!securityResult.safe) {
            return await interaction.reply({
                content: `❌ Message blocked: ${securityResult.reason}`,
                ephemeral: true
            });
        }

     
        userCooldowns.set(userId, now + COOLDOWN_TIME);

        await interaction.deferReply({ ephemeral: true });

    
        const successContainer = new ContainerBuilder()
            .setAccentColor(0x00ff00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Message Sent!\n## Say Command Success\n\n> Your message has been posted successfully\n> Style: ${style.charAt(0).toUpperCase() + style.slice(1)}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📝 **Message Details**\n\n**Content:** "${message.length > 100 ? message.substring(0, 100) + '...' : message}"\n**Length:** ${message.length} characters\n**Author:** ${interaction.user.displayName}\n**Channel:** ${interaction.channel.name}\n\n**Next Usage:** Available in 5 seconds`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*✅ Posted successfully • ${style} style • ${message.length} chars • All good!*`)
            );

        await interaction.editReply({
            components: [successContainer],
            flags: MessageFlags.IsComponentsV2
        });

    
        await this.sendFormattedMessage(interaction.channel, message, style, interaction.user);
    },

    checkMessageSafety(message) {
        const lowerMessage = message.toLowerCase();
        
   
        for (const word of securityFilters.blockedWords) {
            if (lowerMessage.includes(word)) {
                return { safe: false, reason: 'Contains inappropriate language' };
            }
        }

   
        for (const pattern of securityFilters.dangerousPatterns) {
            if (pattern.test(message)) {
                return { safe: false, reason: 'Contains mentions, links, or excessive spam' };
            }
        }

   
        if (message.trim().length < 1) {
            return { safe: false, reason: 'Message is empty' };
        }

        if (message.length > 1500) {
            return { safe: false, reason: 'Message too long (max 1500 characters)' };
        }

        return { safe: true };
    },

    async sendFormattedMessage(channel, message, style, author) {
        switch (style) {
            case 'embed':
                const embedContainer = new ContainerBuilder()
                    .setAccentColor(0x3498db)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💬 **Message**\n\n${message}`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*📝 Via say command • By ${author.displayName}*`)
                    );

                await channel.send({
                    components: [embedContainer],
                    flags: MessageFlags.IsComponentsV2
                });
                break;

            case 'info':
                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0x17a2b8)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ℹ️ Message\n## From ${author.displayName}\n\n> ${message}`)
                    );

                await channel.send({
                    components: [infoContainer],
                    flags: MessageFlags.IsComponentsV2
                });
                break;

            case 'announcement':
                const announcementContainer = new ContainerBuilder()
                    .setAccentColor(0xffd700)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📢 Announcement\n## Important Message\n\n> ${message}`)
                    )
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*📢 Announcement by ${author.displayName} • ${new Date().toLocaleString()}*`)
                    );

                await channel.send({
                    components: [announcementContainer],
                    flags: MessageFlags.IsComponentsV2
                });
                break;

            default: 
                await channel.send({ content: message });
                break;
        }
    },

    async sendSlashOnlyMessage(interaction) {
        const alertContainer = new ContainerBuilder()
            .setAccentColor(0x3498db)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🗣️ Say Command\n## Slash Commands Only\n\n> Use /say to make the bot speak!\n> Now with reasonable security filters!`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🛡️ **Simple Safety Features**\n\n**What's Blocked:**\n• Truly inappropriate language\n• @everyone/@here mentions\n• Discord invites and links\n• Excessive caps or spam\n\n**What's Allowed:**\n• Normal conversation (hello, hi, etc.)\n• Friendly messages\n• Questions and comments\n• Emojis and punctuation\n\n**Usage:**\n\`/say message:Hello everyone!\`\n\`/say message:Good morning! style:embed\``)
            );

        return await interaction.reply({
            components: [alertContainer],
            flags: MessageFlags.IsComponentsV2
        });
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