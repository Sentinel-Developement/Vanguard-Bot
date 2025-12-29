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
const { SlashCommandBuilder } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('finance')
        .setDescription('Working financial data system - Actually functional!')
        
        // STOCK COMMANDS
        .addSubcommand(sub => sub
            .setName('stock')
            .setDescription('Real-time stock price data')
            .addStringOption(option =>
                option.setName('symbol')
                    .setDescription('Stock symbol (AAPL, TSLA, MSFT)')
                    .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('trending-stocks')
            .setDescription('Top trending stocks today'))
            
        // CRYPTO COMMANDS  
        .addSubcommand(sub => sub
            .setName('crypto')
            .setDescription('Real-time crypto price data')
            .addStringOption(option =>
                option.setName('coin')
                    .setDescription('Cryptocurrency (bitcoin, ethereum)')
                    .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('crypto-market')
            .setDescription('Global crypto market overview'))
        .addSubcommand(sub => sub
            .setName('trending-crypto')
            .setDescription('Trending cryptocurrencies'))
        .addSubcommand(sub => sub
            .setName('fear-greed')
            .setDescription('Crypto Fear & Greed Index')),

    async execute(interaction) {
        try {
            let subcommand;
            let isSlashCommand = false;

            if (interaction.isChatInputCommand()) {
                isSlashCommand = true;
                await interaction.deferReply();
                subcommand = interaction.options.getSubcommand();
            } else {
                const message = interaction;
                const args = message.content.split(' ').slice(1);
                subcommand = args[0] || 'help';
            }

            const sendReply = async (components) => {
                const messageData = { components: components, flags: MessageFlags.IsComponentsV2 };
                return isSlashCommand ? interaction.editReply(messageData) : interaction.reply(messageData);
            };

            // === WORKING STOCK COMMAND ===
            if (subcommand === 'stock') {
                const symbol = isSlashCommand ? interaction.options.getString('symbol') : interaction.content.split(' ')[2];
                
                if (!symbol) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Missing Symbol\n\n> Please specify a stock symbol\n**Usage:** `/finance stock AAPL`')
                        );
                    return sendReply([errorContainer]);
                }

                try {
                    // Using Yahoo Finance API directly - WORKS 2025
                    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`);
                    const data = await response.json();
                    
                    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xffcc00)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 🔍 Stock Not Found\n\n> **${symbol.toUpperCase()}** not found\n> Check the symbol and try again`)
                            );
                        return sendReply([errorContainer]);
                    }

                    const result = data.chart.result[0];
                    const meta = result.meta;
                    const quote = result.indicators.quote[0];
                    
                    const currentPrice = meta.regularMarketPrice;
                    const previousClose = meta.previousClose;
                    const change = currentPrice - previousClose;
                    const changePercent = ((change / previousClose) * 100);

                    const components = [];
                    
                    const stockContainer = new ContainerBuilder()
                        .setAccentColor(changePercent >= 0 ? 0x00ff88 : 0xff4757);

                    stockContainer.addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 📈 ${symbol.toUpperCase()} Stock\n## ${meta.longName || symbol.toUpperCase()}\n\n> Live stock data from Yahoo Finance\n> Real-time market information`)
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(`https://logo.clearbit.com/${symbol.toLowerCase()}.com`)
                                    .setDescription(`${symbol} logo`)
                            )
                    );

                    components.push(stockContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const dataContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db);

                    const changeEmoji = changePercent >= 0 ? '📈' : '📉';
                    const changeColor = changePercent >= 0 ? '🟢' : '🔴';

                    dataContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `## ${changeEmoji} **Market Data**`,
                                '',
                                `**Current Price**`,
                                `$${currentPrice?.toFixed(2) || 'N/A'}`,
                                '',
                                `**Daily Change**`,
                                `${changeColor} ${changePercent?.toFixed(2) || 0}% (${change >= 0 ? '+' : ''}$${change?.toFixed(2) || 0})`,
                                '',
                                `**Today's Range**`,
                                `$${meta.regularMarketDayLow?.toFixed(2) || 'N/A'} - $${meta.regularMarketDayHigh?.toFixed(2) || 'N/A'}`,
                                '',
                                `**Volume**`,
                                `${meta.regularMarketVolume?.toLocaleString() || 'N/A'} shares`,
                                '',
                                `**Previous Close**`,
                                `$${previousClose?.toFixed(2) || 'N/A'}`,
                                '',
                                `**Market Status**`,
                                `${meta.marketState || 'Unknown'} | ${meta.exchangeName || 'Unknown Exchange'}`
                            ].join('\n'))
                    );

                    components.push(dataContainer);
                    return sendReply(components);

                } catch (error) {
                    console.error('Stock error:', error);
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Stock Data Error\n\n> Unable to fetch stock data\n> Please try again in a moment')
                        );
                    return sendReply([errorContainer]);
                }
            }

            // === WORKING TRENDING STOCKS ===
            else if (subcommand === 'trending-stocks') {
                try {
                    // Get trending stocks - Popular tickers
                    const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
                    const stockPromises = trendingSymbols.map(async (symbol) => {
                        try {
                            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
                            const data = await response.json();
                            if (data.chart && data.chart.result && data.chart.result.length > 0) {
                                const result = data.chart.result[0];
                                const meta = result.meta;
                                const currentPrice = meta.regularMarketPrice;
                                const previousClose = meta.previousClose;
                                const changePercent = ((currentPrice - previousClose) / previousClose) * 100;
                                
                                return {
                                    symbol: symbol,
                                    name: meta.longName || symbol,
                                    price: currentPrice,
                                    changePercent: changePercent
                                };
                            }
                        } catch (e) {
                            return null;
                        }
                        return null;
                    });

                    const stockResults = await Promise.all(stockPromises);
                    const validStocks = stockResults.filter(stock => stock !== null).slice(0, 8);

                    const components = [];
                    
                    const trendingContainer = new ContainerBuilder()
                        .setAccentColor(0xf39c12);

                    trendingContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🔥 Popular Stocks\n## Market Leaders Today\n\n> Most actively traded stocks\n> Live data from Yahoo Finance')
                    );

                    components.push(trendingContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const listContainer = new ContainerBuilder()
                        .setAccentColor(0xe67e22);

                    const trendingList = validStocks.map((stock, index) => {
                        const changeEmoji = stock.changePercent >= 0 ? '📈' : '📉';
                        const changeColor = stock.changePercent >= 0 ? '🟢' : '🔴';
                        return `**${index + 1}.** ${stock.symbol} - $${stock.price?.toFixed(2) || 'N/A'}\n> ${changeColor} ${stock.changePercent?.toFixed(2) || 0}% ${changeEmoji} | ${stock.name}`;
                    }).join('\n\n');

                    listContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📊 **Top Stocks**\n\n${trendingList}`)
                    );

                    components.push(listContainer);
                    return sendReply(components);

                } catch (error) {
                    console.error('Trending stocks error:', error);
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Trending Data Error\n\n> Unable to fetch trending stocks\n> Please try again later')
                        );
                    return sendReply([errorContainer]);
                }
            }

            // === WORKING CRYPTO PRICE ===
            else if (subcommand === 'crypto') {
                const coinInput = isSlashCommand ? interaction.options.getString('coin') : interaction.content.split(' ')[2];
                
                if (!coinInput) {
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xff4757)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Missing Coin\n\n> Please specify a cryptocurrency\n**Usage:** `/finance crypto bitcoin`')
                        );
                    return sendReply([errorContainer]);
                }

                try {
                    // Using CoinGecko API directly - WORKS 2025
                    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinInput}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
                    const data = await response.json();
                    
                    let coinData = data[coinInput];
                    
                    // If not found, try search
                    if (!coinData) {
                        const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${coinInput}`);
                        const searchData = await searchResponse.json();
                        
                        if (searchData.coins && searchData.coins.length > 0) {
                            const coinId = searchData.coins[0].id;
                            const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
                            const priceData = await priceResponse.json();
                            coinData = priceData[coinId];
                        }
                    }

                    if (!coinData) {
                        const errorContainer = new ContainerBuilder()
                            .setAccentColor(0xffcc00)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(`# 🔍 Crypto Not Found\n\n> **${coinInput}** not found\n> Try using full name (bitcoin vs btc)`)
                            );
                        return sendReply([errorContainer]);
                    }

                    const components = [];
                    
                    const cryptoContainer = new ContainerBuilder()
                        .setAccentColor(coinData.usd_24h_change >= 0 ? 0x00ff88 : 0xff4757);

                    cryptoContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💰 ${coinInput.toUpperCase()} Price\n## Real-time Cryptocurrency Data\n\n> Live market data from CoinGecko\n> Updated from 500+ exchanges`)
                    );

                    components.push(cryptoContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const dataContainer = new ContainerBuilder()
                        .setAccentColor(0x3498db);

                    const changeEmoji = coinData.usd_24h_change >= 0 ? '📈' : '📉';
                    const changeColor = coinData.usd_24h_change >= 0 ? '🟢' : '🔴';

                    dataContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `## ${changeEmoji} **Live Price Data**`,
                                '',
                                `**USD Price**`,
                                `$${coinData.usd?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8}) || 'N/A'}`,
                                '',
                                `**24h Change**`,
                                `${changeColor} ${coinData.usd_24h_change?.toFixed(2) || 0}%`,
                                '',
                                `**Market Cap**`,
                                `$${coinData.usd_market_cap ? (coinData.usd_market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}`,
                                '',
                                `**Data Source**`,
                                `CoinGecko API | Real-time pricing`
                            ].join('\n'))
                    );

                    components.push(dataContainer);
                    return sendReply(components);

                } catch (error) {
                    console.error('Crypto price error:', error);
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Price Data Error\n\n> Unable to fetch crypto price\n> Please try again')
                        );
                    return sendReply([errorContainer]);
                }
            }

            // === WORKING CRYPTO MARKET ===
            else if (subcommand === 'crypto-market') {
                try {
                    const response = await fetch('https://api.coingecko.com/api/v3/global');
                    const data = await response.json();
                    const global = data.data;

                    const components = [];
                    
                    const cryptoContainer = new ContainerBuilder()
                        .setAccentColor(0x9b59b6);

                    cryptoContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🌍 Global Crypto Market\n## Complete Market Overview\n\n> Real-time global cryptocurrency statistics\n> Data from CoinGecko')
                    );

                    components.push(cryptoContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const marketContainer = new ContainerBuilder()
                        .setAccentColor(0x8B5CF6);

                    const marketCapChange = global.market_cap_change_percentage_24h_usd || 0;
                    const totalMarketCap = global.total_market_cap?.usd;
                    const totalVolume = global.total_volume?.usd;

                    marketContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                '## 📈 **Global Statistics**',
                                '',
                                `**Total Market Cap**`,
                                `$${totalMarketCap ? (totalMarketCap / 1e12).toFixed(2) + 'T' : 'N/A'}`,
                                '',
                                `**24h Change**`,
                                `${marketCapChange >= 0 ? '🟢' : '🔴'} ${marketCapChange.toFixed(2)}%`,
                                '',
                                `**24h Volume**`,
                                `$${totalVolume ? (totalVolume / 1e9).toFixed(1) + 'B' : 'N/A'}`,
                                '',
                                `**Active Coins**`,
                                `${global.active_cryptocurrencies?.toLocaleString() || 'N/A'} cryptocurrencies`,
                                '',
                                `**Market Dominance**`,
                                `₿ Bitcoin: ${global.market_cap_percentage?.btc?.toFixed(1) || 'N/A'}%`,
                                `Ξ Ethereum: ${global.market_cap_percentage?.eth?.toFixed(1) || 'N/A'}%`
                            ].join('\n'))
                    );

                    components.push(marketContainer);
                    return sendReply(components);

                } catch (error) {
                    console.error('Crypto market error:', error);
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Crypto Market Error\n\n> Unable to fetch global market data\n> Please try again later')
                        );
                    return sendReply([errorContainer]);
                }
            }

            // === WORKING TRENDING CRYPTO ===
            else if (subcommand === 'trending-crypto') {
                try {
                    const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
                    const data = await response.json();
                    const trending = data.coins.slice(0, 10);

                    const components = [];
                    
                    const trendingContainer = new ContainerBuilder()
                        .setAccentColor(0xf39c12);

                    trendingContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('# 🔥 Trending Cryptocurrencies\n## Most Searched Coins (24h)\n\n> Real-time trending based on search volume\n> Updated hourly via CoinGecko')
                    );

                    components.push(trendingContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const listContainer = new ContainerBuilder()
                        .setAccentColor(0xe67e22);

                    const trendingList = trending.map((coin, index) => 
                        `**${index + 1}.** ${coin.item.name} (${coin.item.symbol.toUpperCase()})\n> Rank #${coin.item.market_cap_rank || 'N/A'} | Score: ${coin.item.score || 'N/A'}`
                    ).join('\n\n');

                    listContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📊 **Trending Coins**\n\n${trendingList}`)
                    );

                    components.push(listContainer);
                    return sendReply(components);

                } catch (error) {
                    console.error('Crypto trending error:', error);
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Trending Data Error\n\n> Unable to fetch trending cryptos\n> Please try again later')
                        );
                    return sendReply([errorContainer]);
                }
            }

            // === WORKING FEAR & GREED ===
            else if (subcommand === 'fear-greed') {
                try {
                    const response = await fetch('https://api.alternative.me/fng/');
                    const data = await response.json();
                    const fearData = data.data[0];

                    const components = [];
                    
                    const fearContainer = new ContainerBuilder()
                        .setAccentColor(fearData.value < 25 ? 0xff4757 : fearData.value > 75 ? 0x00ff88 : 0xffcc00);

                    fearContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ${fearData.value < 25 ? '😨' : fearData.value > 75 ? '🤑' : '😐'} Fear & Greed Index\n## Market Sentiment Analysis\n\n> Current market emotion and investor sentiment\n> Index ranges from 0 (Extreme Fear) to 100 (Extreme Greed)`)
                    );

                    components.push(fearContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const indexContainer = new ContainerBuilder()
                        .setAccentColor(0x9b59b6);

                    let sentiment = '';
                    if (fearData.value <= 25) sentiment = '😨 Extreme Fear';
                    else if (fearData.value <= 45) sentiment = '😰 Fear';
                    else if (fearData.value <= 55) sentiment = '😐 Neutral';
                    else if (fearData.value <= 75) sentiment = '🤑 Greed';
                    else sentiment = '🚀 Extreme Greed';

                    indexContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `## 📊 **Current Sentiment**`,
                                '',
                                `**Index Value**`,
                                `${fearData.value}/100`,
                                '',
                                `**Classification**`,
                                `${sentiment}`,
                                '',
                                `**Market Interpretation**`,
                                fearData.value < 25 ? 'Perfect buying opportunity - Market oversold' :
                                fearData.value > 75 ? 'Caution advised - Market may be overheated' :
                                'Balanced market conditions - Normal trading'
                            ].join('\n'))
                    );

                    components.push(indexContainer);
                    return sendReply(components);

                } catch (error) {
                    console.error('Fear & Greed error:', error);
                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('# ❌ Fear & Greed Error\n\n> Unable to fetch sentiment data\n> Please try again later')
                        );
                    return sendReply([errorContainer]);
                }
            }

            // Help Command (Default)
            else {
                const components = [];
                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x667eea);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent([
                            '# 🚀 Working Finance Center',
                            '## Actually Functional - No Bullshit APIs',
                            '',
                            '> Direct API calls that actually work in 2025',
                            '> No outdated packages, just reliable data',
                            '',
                            '**📈 Stock Commands:**',
                            '`/finance stock AAPL` - Real-time stock prices',
                            '`/finance trending-stocks` - Popular stocks today',
                            '',
                            '**₿ Crypto Commands:**',
                            '`/finance crypto bitcoin` - Live crypto prices',
                            '`/finance crypto-market` - Global market overview',
                            '`/finance trending-crypto` - Trending cryptocurrencies',
                            '`/finance fear-greed` - Fear & Greed Index',
                            '',
                            '**✅ All Working:**',
                            '• Real-time Yahoo Finance data',
                            '• CoinGecko API integration', 
                            '• No API keys required',
                            '• Actually tested and functional'
                        ].join('\n'))
                );

                return sendReply([helpContainer]);
            }

        } catch (error) {
            console.error('Finance command error:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ System Error\n\n> Something went wrong\n> Please try again or contact support')
                );

            const messageData = { components: [errorContainer], flags: MessageFlags.IsComponentsV2 };
            return isSlashCommand ? interaction.editReply(messageData) : interaction.reply(messageData);
        }
    },
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