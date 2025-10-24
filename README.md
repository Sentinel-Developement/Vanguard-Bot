![License](https://img.shields.io/badge/license-DBPL--RHE-red?style=for-the-badge&logo=shield)
![Type](https://img.shields.io/badge/type-Proprietary%20Bot-black?style=for-the-badge&logo=discord)
![Status](https://img.shields.io/badge/Protected%20by%20Owner-✔️-brightgreen?style=for-the-badge)
![Redistribution](https://img.shields.io/badge/redistribution-prohibited-red?style=for-the-badge)
![Hosting](https://img.shields.io/badge/hosting-authorized-blue?style=for-the-badge)

> 🛡️ **This Discord bot is protected under a Proprietary License.**  
> Unauthorized redistribution, or reverse engineering is strictly forbidden.  
> Hosting is only permitted with explicit authorization from the owner.  
>  
> © 2025 [Sentinel Developement]. All rights reserved.



<h1 align="center" style="font-family: Arial, sans-serif; color: #FF6F61; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
  ALL IN ONE BOT 1.4.1.0
</h1>


<p align="center">
  <a href="https://www.youtube.com/channel/sentinel-developement">
    <img src="https://img.shields.io/badge/YouTube-Subscribe-red?style=flat-square&logo=youtube"
      alt="YouTube" />
  </a>

  <a href="https://discord.gg/a7r25Cz2UD">
    <img src="https://img.shields.io/badge/Discord-Join-blue?style=flat-square&logo=discord"
      alt="Join Discord" />
  </a>


<h2>Discord All-in-One BOT Installation Guide</h2>

<h3>How to Install</h3>

<h4>Step 1: Update <code>config.json</code> [ USE ENV FILES ]</h4>

<ol>
  <li>Open the <code>config.json</code> and add your MongoDB URL.</li>
</ol>

<h4>ENV SETUP</h4>

<pre>
TOKEN=
FACEBOOK_ACCESS_TOKEN=
FORTNITE_API_KEY=
YOUTUBE_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
TWITCH_CLIENT_ID=
TWITCH_ACCESS_TOKEN=
INSTAGRAM_ACCESS_TOKEN=
MONGODB_URI=
DISCORD_USER_ID=
BOT_API=
</pre>

<h4>Step 2: Set Up Hosting Service</h4>

<ol>
  <li>Go to your preferred hosting service. For this guide, we use <a href="https://render.com/">Render</a>.</li>
  <li>In the Build & Deploy section, paste your repository URL.</li>
</ol>

<h4>Step 3: Add Build and Start Commands</h4>
<pre>
Run the following commands to install dependencies and start your bot:

npm install
node index.js
</pre>

<h4>Step 4: Get Your Bot Token</h4>
<ol>
  <li>Navigate to the Discord Developer Portal.</li>
  <li>Find your application, and retrieve the bot token from the "Bot" section.</li>
</ol>

<h4>Step 5: Set Environment Variable</h4>
<ol>
  <li>Create an environment variable with the following details:</li>
  <ul>
    <li>Key: TOKEN</li>
    <li>Value: [your bot token]</li>
  </ul>
  <li>Deploy your application using your hosting service’s deployment process.</li>
</ol>

<h4>Step 6: Wait and Test</h4>
<ol>
  <li>Wait approximately five minutes for your bot to deploy and start up.</li>
  <li>Test your bot by sending commands to ensure it is operational.</li>
</ol>

<p>🎉 Congratulations! Your bot is now up and running. 🥳</p>

<h3>Additional Resources</h3>
<p><strong>Video Tutorial:</strong> If you prefer a video guide, watch this YouTube tutorial [ Soon ].</p>
<p><strong>Common Errors:</strong> Consult the errors section for troubleshooting.</p>

<h3>Useful Files</h3>
<ul>
  <li><code>UI/banners/musicard.js</code>: Change, add, or remove music cards here.</li>
  <li><code>UI/icons/musicicons.js</code>: Change, add, or remove music icons here.</li>
</ul>
