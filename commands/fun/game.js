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

const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
const {
  Snake, TwoZeroFourEight, Connect4, FastType, FindEmoji, Flood,
  Hangman, MatchPairs, Minesweeper, TicTacToe, Wordle, RockPaperScissors, Trivia
} = require('discord-gamecord');

// Keep track of active games and collectors
const activeGames = new Map();
const activeCollectors = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Play games with your friends')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start a new game'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('challenge')
        .setDescription('Challenge someone to a multiplayer game')
        .addUserOption(option =>
          option
            .setName('opponent')
            .setDescription('The player you want to challenge')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('game')
            .setDescription('The game to play')
            .setRequired(true)
            .addChoices(
              { name: 'Connect4', value: 'connect4' },
              { name: 'TicTacToe', value: 'tictactoe' },
              { name: 'Rock Paper Scissors', value: 'rps' }
            ))),

  async execute(interaction) {
    // Check for existing game by this user
    const existingUserGame = activeGames.get(interaction.user.id);
    if (existingUserGame) {
      return interaction.reply({ 
        content: "You're already in a game! Finish or cancel that one first.", 
        ephemeral: true 
      });
    }
    
    // Handle different subcommands
    if (interaction.options.getSubcommand() === 'challenge') {
      await handleChallenge(interaction);
    } else {
      await handleSinglePlayerMenu(interaction);
    }
  }
};

async function handleSinglePlayerMenu(interaction) {
  // Clean up existing collector for this user if it exists
  const existingCollector = activeCollectors.get(interaction.user.id);
  if (existingCollector) {
    existingCollector.stop();
    activeCollectors.delete(interaction.user.id);
  }

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('game_select')
      .setPlaceholder('Select a game to play')
      .addOptions([
        { label: 'Snake', value: 'snake', description: 'Classic snake game', emoji: '🐍' },
        { label: '2048', value: '2048', description: 'Merge tiles to reach 2048', emoji: '🔢' },
        { label: 'FastType', value: 'fasttype', description: 'Test your typing speed', emoji: '⌨️' },
        { label: 'Find Emoji', value: 'findemoji', description: 'Find the different emoji', emoji: '🔍' },
        { label: 'Flood', value: 'flood', description: 'Fill the board with one color', emoji: '🌊' },
        { label: 'Hangman', value: 'hangman', description: 'Guess the word', emoji: '📝' },
        { label: 'Match Pairs', value: 'matchpairs', description: 'Find matching pairs', emoji: '🔎' },
        { label: 'Minesweeper', value: 'minesweeper', description: 'Avoid the mines', emoji: '💣' },
        { label: 'Wordle', value: 'wordle', description: 'Guess the 5-letter word', emoji: '📚' },
        { label: 'Trivia', value: 'trivia', description: 'Test your knowledge', emoji: '❓' }
      ])
  );

  const multiplayerRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('multiplayer_games')
      .setLabel('Multiplayer Games')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('👥')
  );

  const embed = new EmbedBuilder()
    .setTitle('🎮 Game Center')
    .setDescription('Select a single-player game to play, or click the button below for multiplayer games!')
    .setColor('#5865F2');

  // Use normal reply instead of fetchReply
  const response = await interaction.reply({
    embeds: [embed],
    components: [row, multiplayerRow]
  });
  
  const message = await interaction.fetchReply();

  // Set up collector for single-player game selection
  const filter = i => (i.customId === 'game_select' || i.customId === 'multiplayer_games') && i.user.id === interaction.user.id;
  const collector = message.createMessageComponentCollector({ filter, time: 60000 });
  
  // Store the collector reference
  activeCollectors.set(interaction.user.id, collector);

  collector.on('collect', async i => {
    if (i.customId === 'multiplayer_games') {
      await handleMultiplayerMenu(i);
      collector.stop();
      return;
    }

    const game = i.values[0];
    collector.stop();
    activeCollectors.delete(interaction.user.id);

    // Mark this user as in a game
    activeGames.set(interaction.user.id, {
      gameType: game,
      channelId: interaction.channelId,
      messageId: message.id
    });

    await startGame(game, i, interaction.user);
  });

  collector.on('end', (collected, reason) => {
    activeCollectors.delete(interaction.user.id);
    
    if (reason === 'time' && collected.size === 0) {
      interaction.editReply({
        content: 'Game selection timed out!',
        embeds: [],
        components: []
      }).catch(console.error);
    }
  });
}

async function handleMultiplayerMenu(interaction) {
  const multiplayerRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('multiplayer_select')
      .setPlaceholder('Select a multiplayer game')
      .addOptions([
        { label: 'Connect4', value: 'connect4', description: 'Connect 4 pieces in a row', emoji: '🔴' },
        { label: 'TicTacToe', value: 'tictactoe', description: 'Classic X and O game', emoji: '⭕' },
        { label: 'Rock Paper Scissors', value: 'rps', description: 'Challenge a friend', emoji: '✂️' }
      ])
  );

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('back_to_games')
      .setLabel('Back to Games')
      .setStyle(ButtonStyle.Secondary)
  );

  const embed = new EmbedBuilder()
    .setTitle('👥 Multiplayer Games')
    .setDescription('Select a game to challenge someone to play!')
    .setColor('#5865F2');

  // Use deferUpdate before updating components
  await interaction.deferUpdate();
  
  await interaction.editReply({
    embeds: [embed],
    components: [multiplayerRow, backRow]
  });

  // Get the current message
  const message = await interaction.message;
  
  // Create collector for this new menu
  const filter = i => (i.customId === 'multiplayer_select' || i.customId === 'back_to_games') && i.user.id === interaction.user.id;
  const collector = message.createMessageComponentCollector({ filter, time: 60000 });

  activeCollectors.set(interaction.user.id, collector);

  collector.on('collect', async i => {
    if (i.customId === 'back_to_games') {
      collector.stop();
      await handleSinglePlayerMenu(interaction);
      return;
    }

    const game = i.values[0];
    
    // Create user selection menu to challenge someone
    const usersInChannel = Array.from(interaction.channel.members.values())
      .filter(member => !member.user.bot && member.user.id !== interaction.user.id)
      .slice(0, 25); // Discord limits to 25 options

    if (usersInChannel.length === 0) {
      await i.deferUpdate();
      await i.editReply({
        content: "There's no one here to challenge! Invite some friends first.",
        embeds: [],
        components: [backRow]
      });
      return;
    }

    const userOptions = usersInChannel.map(member => ({
      label: member.displayName || member.user.username,
      value: member.user.id,
      description: `Challenge ${member.displayName || member.user.username}`,
      emoji: '👤'
    }));

    const opponentRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('opponent_select')
        .setPlaceholder('Select an opponent')
        .addOptions(userOptions)
    );

    // Store the game selection to use later
    collector.gameSelection = game;

    await i.deferUpdate();
    await i.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('👥 Select Opponent')
          .setDescription(`Choose who you want to challenge to a game of ${gameDisplayNames[game]}!`)
          .setColor('#5865F2')
      ],
      components: [opponentRow, backRow]
    });
    
    // Change collector filter to listen for opponent selection
    collector.filter = j => (j.customId === 'opponent_select' || j.customId === 'back_to_games') && j.user.id === interaction.user.id;
  });

  collector.on('end', (collected, reason) => {
    activeCollectors.delete(interaction.user.id);
    
    if (reason === 'time' && collected.size === 0) {
      interaction.editReply({
        content: 'Game selection timed out!',
        embeds: [],
        components: []
      }).catch(console.error);
    }
  });

  // Add additional listener for opponent selection
  collector.on('collect', async i => {
    if (i.customId === 'opponent_select') {
      const opponentId = i.values[0];
      const opponent = await interaction.guild.members.fetch(opponentId).then(m => m.user);
      const game = collector.gameSelection;
      
      collector.stop();
      
      // Create challenge
      await i.deferUpdate();
      await createChallenge(i, interaction.user, opponent, game);
    }
  });
}

async function handleChallenge(interaction) {
  const game = interaction.options.getString('game');
  const opponent = interaction.options.getUser('opponent');
  
  // Prevent challenging yourself
  if (opponent.id === interaction.user.id) {
    return interaction.reply({ 
      content: "You can't challenge yourself! Choose someone else.",
      ephemeral: true
    });
  }

  // Prevent challenging bots
  if (opponent.bot) {
    return interaction.reply({ 
      content: "You can't challenge a bot! Choose a real person.",
      ephemeral: true
    });
  }

  // Check if opponent is in a game
  if (activeGames.get(opponent.id)) {
    return interaction.reply({ 
      content: `${opponent.username} is already in a game! Try again later.`,
      ephemeral: true
    });
  }

  await createChallenge(interaction, interaction.user, opponent, game);
}

async function createChallenge(interaction, challenger, opponent, game) {
  const acceptRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_challenge')
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('decline_challenge')
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setTitle('🎮 Game Challenge')
    .setDescription(`${challenger.username} has challenged ${opponent.username} to a game of ${gameDisplayNames[game]}!`)
    .setColor('#5865F2')
    .setFooter({ text: 'This challenge expires in 60 seconds' });

  // Check if the interaction is already replied or deferred
  let response;
  if (interaction.deferred || interaction.replied) {
    // If we're continuing from a previous interaction
    if (interaction.replied) {
      // Follow up with a new message
      response = await interaction.followUp({ 
        embeds: [embed], 
        components: [acceptRow]
      });
    } else {
      // Update the deferred interaction
      await interaction.editReply({ 
        embeds: [embed], 
        components: [acceptRow]
      });
      response = await interaction.fetchReply();
    }
  } else {
    // If this is a new standalone interaction (e.g., from slash command)
    response = await interaction.reply({ 
      embeds: [embed], 
      components: [acceptRow],
      fetchReply: true
    });
  }

  // Mark this user as waiting for a challenge
  activeGames.set(challenger.id, {
    gameType: game,
    status: 'waiting',
    opponentId: opponent.id,
    channelId: interaction.channelId,
    messageId: response.id
  });

  const filter = i => 
    (i.customId === 'accept_challenge' || i.customId === 'decline_challenge') && 
    i.user.id === opponent.id;
  
  const collector = response.createMessageComponentCollector({ filter, time: 60000, max: 1 });

  collector.on('collect', async i => {
    if (i.customId === 'accept_challenge') {
      await i.deferUpdate();
      
      // Mark opponent as in a game too
      activeGames.set(opponent.id, {
        gameType: game,
        status: 'playing',
        opponentId: challenger.id,
        channelId: interaction.channelId,
        messageId: response.id
      });
      
      // Update challenger's status
      activeGames.set(challenger.id, {
        ...activeGames.get(challenger.id),
        status: 'playing'
      });

      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🎮 Game Started')
            .setDescription(`${opponent.username} accepted the challenge! Starting game...`)
            .setColor('#5865F2')
        ],
        components: []
      });

      // Start multiplayer game
      await startMultiplayerGame(game, interaction, challenger, opponent);
    } else {
      // Decline challenge
      await i.deferUpdate();
      activeGames.delete(challenger.id);
      
      await i.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Challenge Declined')
            .setDescription(`${opponent.username} declined the challenge.`)
            .setColor('#ED4245')
        ],
        components: []
      });
    }
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time' && collected.size === 0) {
      activeGames.delete(challenger.id);
      
      try {
        if (interaction.replied || interaction.deferred) {
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle('⏱️ Challenge Expired')
                .setDescription(`${opponent.username} didn't respond to the challenge.`)
                .setColor('#ED4245')
            ],
            components: []
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Error updating expired challenge:', error);
      }
    }
  });
}

async function startGame(game, interaction, player) {
  const GameClass = getGameClass(game);
  
  const gameConfig = getGameConfig(game, player);
  
  try {
    // First, defer the update to prevent "interaction not replied" error
    await interaction.deferUpdate().catch(console.error);
    
    const gameInstance = new GameClass({
      message: interaction,
      isSlashGame: true,
      ...gameConfig
    });
    
    gameInstance.startGame();
    gameInstance.on('gameOver', result => {
      console.log(`Game over for ${player.username}: ${JSON.stringify(result)}`);
      // Remove from active games after a short delay to prevent instantly joining a new game
      setTimeout(() => {
        activeGames.delete(player.id);
      }, 2000);
    });
  } catch (error) {
    console.error('Error starting game:', error);
    // Try to follow up instead of editing the reply if there was an error
    try {
      interaction.followUp({
        content: `There was an error starting the game. Please try again later.`,
        ephemeral: true
      }).catch(console.error);
    } catch (followUpError) {
      console.error('Error sending follow-up:', followUpError);
    }
    
    activeGames.delete(player.id);
  }
}

async function startMultiplayerGame(game, interaction, challenger, opponent) {
  const GameClass = getGameClass(game);
  
  const gameConfig = getMultiplayerGameConfig(game, challenger, opponent);
  
  try {
    // Create a followUp for the new game to avoid interaction conflicts
    const gameMessage = await interaction.followUp({
      content: `🎮 Starting ${gameDisplayNames[game]} between ${challenger.username} and ${opponent.username}...`,
      fetchReply: true
    });
    
    const gameInstance = new GameClass({
      message: gameMessage, // Use the new message instead of the interaction
      isSlashGame: false,   // Using normal message for the game
      ...gameConfig
    });
    
    gameInstance.startGame();
    gameInstance.on('gameOver', result => {
      console.log(`Game over for ${challenger.username} vs ${opponent.username}: ${JSON.stringify(result)}`);
      // Remove both players from active games
      setTimeout(() => {
        activeGames.delete(challenger.id);
        activeGames.delete(opponent.id);
      }, 2000);
    });
  } catch (error) {
    console.error('Error starting multiplayer game:', error);
    
    try {
      // If there was an error, try to notify users
      await interaction.followUp({
        content: `There was an error starting the game. Please try again later.`,
        ephemeral: true
      });
    } catch (followUpError) {
      console.error('Error sending follow-up:', followUpError);
    }
    
    activeGames.delete(challenger.id);
    activeGames.delete(opponent.id);
  }
}

// Helper functions for clean code organization
function getGameClass(game) {
  const games = {
    snake: Snake,
    '2048': TwoZeroFourEight,
    connect4: Connect4,
    fasttype: FastType,
    findemoji: FindEmoji,
    flood: Flood,
    hangman: Hangman,
    matchpairs: MatchPairs,
    minesweeper: Minesweeper,
    tictactoe: TicTacToe,
    wordle: Wordle,
    rps: RockPaperScissors,
    trivia: Trivia
  };
  
  return games[game];
}

const gameDisplayNames = {
  snake: 'Snake',
  '2048': '2048',
  connect4: 'Connect 4',
  fasttype: 'Fast Type',
  findemoji: 'Find Emoji',
  flood: 'Flood',
  hangman: 'Hangman',
  matchpairs: 'Match Pairs',
  minesweeper: 'Minesweeper',
  tictactoe: 'Tic Tac Toe',
  wordle: 'Wordle',
  rps: 'Rock Paper Scissors',
  trivia: 'Trivia'
};

function getGameConfig(game, player) {
  const baseConfig = {
    embed: {
      title: `${gameDisplayNames[game]}`,
      color: '#5865F2'
    },
    timeoutTime: 60000,
    buttonStyle: 'PRIMARY', // Using string instead of ButtonStyle enum
    playerOnlyMessage: `Only ${player.username} can use these buttons.`
  };
  
  const gameSpecificConfigs = {
    rps: {
      opponent: player, // For single player, the bot is the opponent
      buttons: {
        rock: 'Rock',
        paper: 'Paper',
        scissors: 'Scissors'
      },
      emojis: {
        rock: '🌑',
        paper: '📰',
        scissors: '✂️'
      },
      mentionUser: true,
      pickMessage: 'You choose {emoji}.',
      winMessage: '**{player}** won the Game! Congratulations!',
      tieMessage: 'The Game tied! No one won the Game!',
      timeoutMessage: 'The Game went unfinished! No one won the Game!'
    },
    trivia: {
      embed: {
        ...baseConfig.embed,
        description: 'You have 60 seconds to guess the answer.'
      },
      trueButtonStyle: 'SUCCESS', // Using string instead of ButtonStyle enum
      falseButtonStyle: 'DANGER', // Using string instead of ButtonStyle enum
      mode: 'multiple',
      difficulty: 'medium',
      winMessage: 'You won! The correct answer is {answer}.',
      loseMessage: 'You lost! The correct answer is {answer}.',
      errMessage: 'Unable to fetch question data! Please try again.'
    }
  };
  
  return { ...baseConfig, ...(gameSpecificConfigs[game] || {}) };
}

function getMultiplayerGameConfig(game, challenger, opponent) {
  const baseConfig = {
    embed: {
      title: `${gameDisplayNames[game]} - ${challenger.username} vs ${opponent.username}`,
      color: '#5865F2'
    },
    timeoutTime: 120000, // Longer timeout for multiplayer
    buttonStyle: 'PRIMARY', // Using string instead of ButtonStyle enum
    playerOnlyMessage: `Only players in this game can use these buttons.`
  };
  
  const gameSpecificConfigs = {
    connect4: {
      opponent: opponent,
      player1: challenger,
      player2: opponent,
      mentionUser: true,
      emojis: {
        player1: '🔴',
        player2: '🟡'
      },
      turnMessage: '{emoji} | It\'s {player}\'s turn!',
      winMessage: '{emoji} | **{player}** won the Connect 4 Game!',
      tieMessage: 'The Game tied! No one won the Game!',
      timeoutMessage: 'The Game went unfinished! No one won the Game!'
    },
    tictactoe: {
      opponent: opponent,
      player1: challenger,
      player2: opponent,
      mentionUser: true,
      xEmoji: '❌',
      oEmoji: '⭕',
      turnMessage: '{emoji} | It\'s {player}\'s turn!',
      winMessage: '{emoji} | **{player}** won the Tic Tac Toe Game!',
      tieMessage: 'The Game tied! No one won the Game!',
      timeoutMessage: 'The Game went unfinished! No one won the Game!'
    },
    rps: {
      opponent: opponent,
      buttons: {
        rock: 'Rock',
        paper: 'Paper',
        scissors: 'Scissors'
      },
      emojis: {
        rock: '🌑',
        paper: '📰',
        scissors: '✂️'
      },
      mentionUser: true,
      pickMessage: '{player} choose {emoji}.',
      winMessage: '**{player}** won the Game! Congratulations!',
      tieMessage: 'The Game tied! No one won the Game!',
      timeoutMessage: 'The Game went unfinished! No one won the Game!'
    }
  };
  
  return { ...baseConfig, ...(gameSpecificConfigs[game] || {}) };
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