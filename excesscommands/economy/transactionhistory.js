const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'transactionhistory',
    aliases: ['transactions', 'th', 'history'],
    description: 'View your transaction history with filtering options using v2 components',
    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
            
           
            if (targetUser.id !== message.author.id && !message.member.permissions.has('Administrator')) {
                const components = [];

                const permissionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                permissionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Access Denied\n## PRIVACY PROTECTION\n\n> You can only view your own transaction history!\n> Financial records are private and protected.`)
                );

                components.push(permissionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(targetUser.id, message.guild.id);
            
            
            const filterType = args.find(arg => ['income', 'expense', 'transfer', 'investment', 'trade', 'racing', 'robbery', 'family_work', 'gambling', 'shop'].includes(arg.toLowerCase()));
            const filterCategory = args.find(arg => ['business', 'heist', 'racing', 'gambling', 'shop', 'family', 'work'].includes(arg.toLowerCase()));
            
          
            let transactions = [...(profile.transactions || [])];
            
            if (filterType) {
                transactions = transactions.filter(t => t.type === filterType.toLowerCase());
            }
            
            if (filterCategory) {
                transactions = transactions.filter(t => t.category === filterCategory.toLowerCase());
            }
            
         
            transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            if (transactions.length === 0) {
                const components = [];

                const noTransactionsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                noTransactionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📝 No Transactions Found\n## EMPTY TRANSACTION HISTORY\n\n> ${filterType || filterCategory ? 'No transactions match your filter criteria' : 'No transactions recorded yet'}!\n> Start using the economy to build your financial history.`)
                );

                components.push(noTransactionsContainer);

                if (filterType || filterCategory) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const filterContainer = new ContainerBuilder()
                        .setAccentColor(0x3498DB);

                    filterContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🔍 **ACTIVE FILTERS**\n\n${filterType ? `**Type:** \`${filterType}\`` : ''}${filterType && filterCategory ? '\n' : ''}${filterCategory ? `**Category:** \`${filterCategory}\`` : ''}\n\n**💡 Try:** Remove filters or use \`!transactions\` to see all records`)
                    );

                    components.push(filterContainer);
                }

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
          
            const itemsPerPage = 8;
            const totalPages = Math.ceil(transactions.length / itemsPerPage);
            let currentPage = 1;
            
            
            const pageArg = args.find(arg => !isNaN(arg) && parseInt(arg) > 0);
            if (pageArg) {
                currentPage = Math.min(parseInt(pageArg), totalPages);
            }
            
            const generatePageComponents = (page) => {
                const components = [];
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageTransactions = transactions.slice(start, end);
                
              
                const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const netProfit = totalIncome - totalExpenses;
                
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(netProfit >= 0 ? 0x4CAF50 : 0xF44336);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💳 ${targetUser.username}'s Transaction History\n## FINANCIAL RECORD ANALYSIS\n\n> **Page ${page} of ${totalPages}** | ${transactions.length} total transactions${filterType || filterCategory ? ' (filtered)' : ''}\n> Comprehensive financial activity tracking and analysis`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                
                const summaryContainer = new ContainerBuilder()
                    .setAccentColor(0x2196F3);

                summaryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **FINANCIAL SUMMARY**')
                );

                const profitColor = netProfit >= 0 ? '+' : '';
                summaryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💚 Total Income:** \`$${totalIncome.toLocaleString()}\`\n**💸 Total Expenses:** \`$${totalExpenses.toLocaleString()}\`\n**📈 Net Profit/Loss:** \`${profitColor}$${netProfit.toLocaleString()}\`\n**📝 Transaction Count:** \`${transactions.length} records\``)
                );

                components.push(summaryContainer);

              
                if (filterType || filterCategory) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const filtersContainer = new ContainerBuilder()
                        .setAccentColor(0xFF9800);

                    filtersContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🔍 **ACTIVE FILTERS**\n\n${filterType ? `**Type Filter:** \`${filterType}\`` : ''}${filterType && filterCategory ? '\n' : ''}${filterCategory ? `**Category Filter:** \`${filterCategory}\`` : ''}\n\n**💡 Note:** Showing filtered results - use \`!transactions\` for complete history`)
                    );

                    components.push(filtersContainer);
                }

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

               
                const transactionGroups = [];
                for (let i = 0; i < pageTransactions.length; i += 4) {
                    transactionGroups.push(pageTransactions.slice(i, i + 4));
                }

                transactionGroups.forEach((group, groupIndex) => {
                    const transactionContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6);

                    transactionContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💼 **TRANSACTION RECORDS ${groupIndex > 0 ? `(Continued)` : ''}**`)
                    );

                    group.forEach((transaction, index) => {
                        const emoji = getTransactionEmoji(transaction.type, transaction.category);
                        const sign = transaction.type === 'income' ? '+' : '-';
                        const amount = `${sign}$${transaction.amount.toLocaleString()}`;
                        const date = new Date(transaction.timestamp).toLocaleDateString();
                        const description = transaction.description || 'No description';
                        
                        const transactionText = `${emoji} **${amount}** - ${description}\n` +
                            `> **Date:** \`${date}\`\n` +
                            `> **Type:** \`${transaction.type}\`${transaction.category ? ` • **Category:** \`${transaction.category}\`` : ''}`;

                        transactionContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(transactionText)
                        );
                    });

                    components.push(transactionContainer);

                    if (groupIndex < transactionGroups.length - 1) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    }
                });

              
                if (totalPages > 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const navigationContainer = new ContainerBuilder()
                        .setAccentColor(0x607D8B);

                    const navText = `## 📄 **PAGE NAVIGATION**\n\n**Current Page:** ${page} of ${totalPages}\n**Records on Page:** ${pageTransactions.length}\n**Total Records:** ${transactions.length}\n\n**💡 Navigation Tips:**\n> • Use \`!transactions ${page > 1 ? page - 1 : 1}\` for previous page\n> • Use \`!transactions ${page < totalPages ? page + 1 : totalPages}\` for next page\n> • Use \`!transactions 1\` to return to first page`;

                    navigationContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(navText)
                    );

                    components.push(navigationContainer);
                }

               
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const filterGuideContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                filterGuideContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **FILTERING OPTIONS**\n\n**By Type:** \`income\`, \`expense\`, \`transfer\`\n**By Category:** \`business\`, \`heist\`, \`racing\`, \`gambling\`, \`shop\`, \`family\`, \`work\`\n\n**Examples:**\n> • \`!transactions income\` - Only income records\n> • \`!transactions gambling\` - Only gambling transactions\n> • \`!transactions expense shop\` - Only shop purchases\n> • \`!transactions 2\` - Jump to page 2\n\n**💡 Combine filters and pages for precise record searching!`)
                );

                components.push(filterGuideContainer);

                return components;
            };

            const pageComponents = generatePageComponents(currentPage);

           
            const msg = await message.reply({
                components: pageComponents,
                flags: MessageFlags.IsComponentsV2
            });

            if (totalPages > 1) {
       
                await msg.react('⏮️'); 
                await msg.react('◀️'); 
                await msg.react('▶️'); 
                await msg.react('⏭️'); 
                await msg.react('❌'); 

                const reactionCollector = msg.createReactionCollector({
                    filter: (reaction, user) => {
                        return ['⏮️', '◀️', '▶️', '⏭️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                    },
                    time: 300000 
                });

                reactionCollector.on('collect', async (reaction, user) => {
                    await reaction.users.remove(user.id);

                    let newPage = currentPage;
                    switch (reaction.emoji.name) {
                        case '⏮️':
                            newPage = 1;
                            break;
                        case '◀️':
                            newPage = Math.max(1, currentPage - 1);
                            break;
                        case '▶️':
                            newPage = Math.min(totalPages, currentPage + 1);
                            break;
                        case '⏭️':
                            newPage = totalPages;
                            break;
                        case '❌':
                            const closedComponents = [];
                            const closedContainer = new ContainerBuilder()
                                .setAccentColor(0x95A5A6);

                            closedContainer.addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 📝 Transaction History Closed\n## SESSION TERMINATED\n\n> Transaction history viewing session has been closed.\n> Use \`!transactions\` anytime to reopen your financial records.\n\n**💡 Remember:** Keep track of your transactions for better financial management!`)
                            );

                            closedComponents.push(closedContainer);

                            await msg.edit({
                                components: closedComponents,
                                flags: MessageFlags.IsComponentsV2
                            });
                            reactionCollector.stop();
                            return;
                    }

                    if (newPage !== currentPage) {
                        currentPage = newPage;
                        const newComponents = generatePageComponents(currentPage);
                        await msg.edit({
                            components: newComponents,
                            flags: MessageFlags.IsComponentsV2
                        });
                    }
                });

                reactionCollector.on('end', () => {
                    msg.reactions.removeAll().catch(() => {});
                });
            }

        } catch (error) {
            console.error('Error in transactionhistory command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **TRANSACTION HISTORY ERROR**\n\nSomething went wrong while retrieving your transaction history. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getTransactionEmoji(type, category) {
    const emojiMap = {
        income: {
            business: '🏢',
            heist: '💰',
            racing: '🏁',
            gambling: '🎰',
            work: '💼',
            family_work: '👨‍👩‍👧‍👦',
            default: '💚'
        },
        expense: {
            shop: '🛒',
            gambling: '🎲',
            heist: '🚨',
            pet_care: '🐕',
            family: '👨‍👩‍👧‍👦',
            default: '💸'
        },
        transfer: '🔄',
        investment: '📈',
        trade: '🤝',
        racing: '🏁',
        robbery: '🔓'
    };
    
    if (type === 'income' || type === 'expense') {
        return emojiMap[type][category] || emojiMap[type].default;
    }
    
    return emojiMap[type] || '💳';
}
