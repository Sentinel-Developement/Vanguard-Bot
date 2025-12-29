require('dotenv').config();
const { ClusterManager, HeartbeatManager } = require('discord-hybrid-sharding');
const axios = require('axios');
const os = require('os');

// ENV
const TOKEN = process.env.TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_ROLE_ID = process.env.WEBHOOK_ROLE_ID; // rôle à mentionner
const SHARDS_PER_CLUSTER = parseInt(process.env.SHARDS_PER_CLUSTER) || 3;
const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL) || 2000;
const HEARTBEAT_MAX_MISSES = parseInt(process.env.HEARTBEAT_MAX_MISSES) || 5;

// ClusterManager
const manager = new ClusterManager(`${__dirname}/index.js`, {
    totalShards: 'auto',
    shardsPerClusters: SHARDS_PER_CLUSTER,
    totalClusters: 'auto',
    mode: 'process',
    token: TOKEN
});

// Fonction pour récupérer stats système et shards
function getClusterStats(clusterId) {
    const cluster = manager.clusters.get(clusterId);

    if (!cluster || !cluster.shards) {
        return {
            cpuUsage: (os.loadavg()[0] * 100).toFixed(2) + '%',
            loadAvg: os.loadavg().map(n => n.toFixed(2)).join(', '),
            totalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
            freeMem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
            platform: os.platform(),
            arch: os.arch(),
            uptime: (os.uptime() / 3600).toFixed(2) + 'h',
            shardCount: 0,
            shardPing: 'N/A'
        };
    }

    const shardPings = Array.from(cluster.shards.values()).map(shard => shard.ping || 0);

    return {
        cpuUsage: (os.loadavg()[0] * 100).toFixed(2) + '%',
        loadAvg: os.loadavg().map(n => n.toFixed(2)).join(', '),
        totalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
        freeMem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
        platform: os.platform(),
        arch: os.arch(),
        uptime: (os.uptime() / 3600).toFixed(2) + 'h',
        shardCount: cluster.shards.size || 0,
        shardPing: shardPings.length > 0 ? shardPings.join(' ms, ') + ' ms' : 'N/A'
    };
}

// Webhook Logger Embed avec ping rôle
async function logToWebhook(clusterId, status, description) {
    try {
        const stats = getClusterStats(clusterId);
        const embed = {
            title: `🛡️ Vanguard Cluster Log`,
            description: description,
            color: status === 'error' ? 0xE74C3C : 0x1ABC9C,
            timestamp: new Date(),
            footer: { text: 'Vanguard Monitoring System', icon_url: 'https://i.imgur.com/7M6iB7f.png' },
            fields: [
                { name: 'Cluster ID', value: `${clusterId}`, inline: true },
                { name: 'Status', value: `${status.toUpperCase()}`, inline: true },
                { name: 'Bot Status', value: status === 'error' ? '❌ Offline' : '✅ Online', inline: true },
                { name: 'Shards in Cluster', value: stats.shardCount.toString(), inline: true },
                { name: 'Shard Ping', value: stats.shardPing, inline: true },
                { name: 'CPU Usage', value: stats.cpuUsage, inline: true },
                { name: 'RAM Usage', value: `${(stats.totalMem - stats.freeMem).toFixed(2)}GB / ${stats.totalMem}`, inline: true },
                { name: 'Load Average', value: stats.loadAvg, inline: true },
                { name: 'OS', value: `${stats.platform} (${stats.arch})`, inline: true },
                { name: 'Cluster Uptime', value: stats.uptime, inline: true },
                { name: 'Description', value: description.length > 1024 ? description.substring(0, 1021) + '...' : description, inline: false }
            ]
        };

        const content = WEBHOOK_ROLE_ID ? `<@&${WEBHOOK_ROLE_ID}>` : '';
        await axios.post(WEBHOOK_URL, { content, embeds: [embed] }, { timeout: 3000 });
    } catch (error) {
        console.error('[Vanguard/Logger] Failed to send embed:', error);
    }
}

// Heartbeat
manager.extend(new HeartbeatManager({
    interval: HEARTBEAT_INTERVAL,
    maxMissedHeartbeats: HEARTBEAT_MAX_MISSES,
}));

// Monitoring automatique toutes les 5 minutes
const MONITOR_INTERVAL = 5 * 60 * 1000; // 5 min
function logAllClusters() {
    manager.clusters.forEach(cluster => {
        if (cluster && cluster.ready) {
            logToWebhook(cluster.id, 'success', `Automatic cluster monitoring update.`);
        }
    });
}

// Cluster events
manager.on('clusterCreate', cluster => {
    logToWebhook(cluster.id, 'success', `Cluster ${cluster.id} launched.`);
});

manager.on('clusterReady', cluster => {
    logToWebhook(cluster.id, 'success', `Cluster ${cluster.id} is ready and fully operational.`);

    // Lancer l’intervalle de monitoring si pas déjà lancé
    if (!global.monitorIntervalStarted) {
        global.monitorIntervalStarted = true;
        setInterval(logAllClusters, MONITOR_INTERVAL);
    }
});

manager.on('clusterDisconnect', cluster => {
    logToWebhook(cluster.id, 'error', `Cluster ${cluster.id} disconnected unexpectedly. Hybrid-Sharding will handle respawn.`);
});

// Global error handling
process.on('uncaughtException', err => {
    logToWebhook('N/A', 'error', `Uncaught exception:\n${err.stack || err}`);
});

process.on('unhandledRejection', reason => {
    logToWebhook('N/A', 'error', `Unhandled promise rejection:\n${reason}`);
});

// Spawn clusters
manager.spawn({ timeout: -1 });
