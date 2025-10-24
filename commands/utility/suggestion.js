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
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const SuggestionConfig = require('../../models/suggestions/SuggestionConfig');
const Suggestion = require('../../models/suggestions/Suggestion');
const SuggestionVote = require('../../models/suggestions/SuggestionVote');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Manage suggestions')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Submit a suggestion')
                .addStringOption(opt =>
                    opt.setName('title').setDescription('Suggestion title').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('description').setDescription('Suggestion details').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Update the status of a suggestion')
                .addStringOption(opt =>
                    opt.setName('message_id').setDescription('Message ID of the suggestion').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('status')
                        .setDescription('New status')
                        .addChoices(
                            { name: '✅ Approved', value: 'approved' },
                            { name: '❌ Denied', value: 'denied' },
                            { name: '⏳ Under Review', value: 'review' },
                            { name: '🔄 Pending', value: 'pending' }
                        )
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('reason').setDescription('Optional reason for status change'))
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a suggestion')
                .addStringOption(opt =>
                    opt.setName('message_id').setDescription('Message ID of the suggestion').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;

        if (sub === 'add') {
            const config = await SuggestionConfig.findOne({ guildId });
            if (!config || !config.suggestionChannelId) {
                return interaction.editReply({ content: '❌ Suggestions are not set up on this server.' });
            }

            const allowedRoleId = config.allowedRoleId;
            if (allowedRoleId && !interaction.member.roles.cache.has(allowedRoleId)) {
                return interaction.editReply({ content: '❌ You do not have permission to submit suggestions.' });
            }

            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const suggestionChannel = interaction.guild.channels.cache.get(config.suggestionChannelId);

            if (!suggestionChannel) {
                return interaction.editReply({ content: '⚠️ The configured suggestions channel no longer exists.' });
            }

            const embed = new EmbedBuilder()
                .setTitle(`💡 ${title}`)
                .setDescription(description)
                .setColor('#00AAFF')
                .addFields(
                    { name: 'Submitted by', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '👍 Yes Votes', value: '0', inline: true },
                    { name: '👎 No Votes', value: '0', inline: true }
                )
                .setFooter({ text: 'Status: PENDING' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('suggestion_yes').setLabel('👍 Yes').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('suggestion_no').setLabel('👎 No').setStyle(ButtonStyle.Danger),
            );

            const msg = await suggestionChannel.send({ embeds: [embed], components: [row] });

            await Suggestion.create({
                guildId,
                userId: interaction.user.id,
                messageId: msg.id,
                channelId: suggestionChannel.id,
                title,
                description
            });

            return interaction.editReply({ content: '✅ Suggestion submitted successfully!' });
        }

        if (sub === 'status') {
            const messageId = interaction.options.getString('message_id');
            const newStatus = interaction.options.getString('status');
            const reason = interaction.options.getString('reason');

          
            if (!interaction.member.permissions.has('ManageMessages')) {
                return interaction.editReply({ content: '❌ You do not have permission to update suggestions.' });
            }

     
            const suggestion = await Suggestion.findOne({ messageId, guildId });
            if (!suggestion) {
                return interaction.editReply({ content: '❌ Suggestion not found in this server.' });
            }

       
            const config = await SuggestionConfig.findOne({ guildId });
            if (!config) {
                return interaction.editReply({ content: '❌ Suggestion system is not configured for this server.' });
            }

   
            const channel = interaction.guild.channels.cache.get(config.suggestionChannelId);
            if (!channel) {
                return interaction.editReply({ content: '⚠️ The configured suggestions channel no longer exists.' });
            }

            try {
             
                const msg = await channel.messages.fetch(messageId);
                if (!msg) {
                    return interaction.editReply({ content: '❌ Could not find the suggestion message.' });
                }

            
                const allVotes = await SuggestionVote.find({ messageId });
                const yesVotes = allVotes.filter(v => v.vote === 'yes').length;
                const noVotes = allVotes.filter(v => v.vote === 'no').length;

              
                const statusDisplay = {
                    'approved': '✅ APPROVED',
                    'denied': '❌ DENIED',
                    'review': '⏳ UNDER REVIEW',
                    'pending': '🔄 PENDING'
                };

            
                const statusColors = {
                    'approved': '#00FF00',
                    'denied': '#FF0000',
                    'review': '#FFA500',
                    'pending': '#00AAFF'
                };

            
                const originalEmbed = msg.embeds[0];
            
                const updatedEmbed = new EmbedBuilder()
                    .setTitle(originalEmbed.title)
                    .setDescription(originalEmbed.description)
                    .setColor(statusColors[newStatus])
                    .addFields(
                        { name: 'Submitted by', value: originalEmbed.fields[0].value, inline: true },
                        { name: '👍 Yes Votes', value: `${yesVotes}`, inline: true },
                        { name: '👎 No Votes', value: `${noVotes}`, inline: true }
                    )
                    .setFooter({
                        text: `Status: ${statusDisplay[newStatus]}${reason ? ` | Reason: ${reason}` : ''}`
                    })
                    .setTimestamp(new Date(originalEmbed.timestamp));

            
                let components = msg.components;
                if (newStatus !== 'pending') {
                    components = msg.components.map(row => {
                        const actionRow = ActionRowBuilder.from(row);
                        actionRow.components = actionRow.components.map(button =>
                            ButtonBuilder.from(button).setDisabled(true)
                        );
                        return actionRow;
                    });
                }

            
                await msg.edit({ embeds: [updatedEmbed], components });


         
                suggestion.status = newStatus;
                if (reason) suggestion.statusReason = reason;
                suggestion.updatedAt = new Date();
                await suggestion.save();

                return interaction.editReply({
                    content: `✅ Suggestion status updated to **${statusDisplay[newStatus]}**${reason ? ` with reason: "${reason}"` : ''}.`
                });

            } catch (err) {
                console.error('❌ Error updating suggestion status:', err);
                return interaction.editReply({ content: '❌ Failed to update the suggestion. Please check if the message ID is correct and the message exists.' });
            }
        }

        if (sub === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const suggestion = await Suggestion.findOne({ messageId, guildId });

            if (!suggestion) {
                return interaction.editReply({ content: '❌ Suggestion not found in this server.' });
            }

            const isOwner = suggestion.userId === interaction.user.id;
            const isMod = interaction.member.permissions.has('ManageMessages');

            if (!isOwner && !isMod) {
                return interaction.editReply({ content: '❌ You can only delete your own suggestions or need Manage Messages permission.' });
            }

            try {
                
                const config = await SuggestionConfig.findOne({ guildId });
                if (config && config.suggestionChannelId) {
                    const channel = interaction.guild.channels.cache.get(config.suggestionChannelId);
                    if (channel) {
                        try {
                            const msg = await channel.messages.fetch(messageId);
                            await msg.delete();
                        } catch (err) {
                            console.log('⚠️ Could not delete message (might already be deleted)');
                        }
                    }
                }

             
                await Suggestion.deleteOne({ messageId });
                await SuggestionVote.deleteMany({ messageId });

                return interaction.editReply({ content: '🗑️ Suggestion deleted successfully.' });
            } catch (err) {
                console.error('❌ Error deleting suggestion:', err);
                return interaction.editReply({ content: '❌ Failed to delete the suggestion completely.' });
            }
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