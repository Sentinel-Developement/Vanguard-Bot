const { ActivityType } = require('discord.js');

module.exports = {
  ownerId: '',
  status: {
    rotateDefault: [
      { name: 'Netflix', type: ActivityType.Watching },
      { name: 'GTA VI', type: ActivityType.Playing },
      { name: 'on YouTube', type: ActivityType.Streaming, url: 'https://www.twitch.tv/youruser' },
      { name: 'Spotify', type: ActivityType.Custom },
    ],
    songStatus: true
  },
  spotifyClientId: "",
  spotifyClientSecret: "",
}
