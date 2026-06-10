require('dotenv').config();
const express = require('express');
const app = express();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
    ]
});
client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online!`);
});
// Ping command in DMs only
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (!message.guild && message.content === '!ping') {
        message.reply('✅ Pong! CYPHER XXD is active and running!');
    }
});
// ============================================
// SELFBOT INTEGRATION (SIMPLIFIED)
// ============================================
app.use(express.json());
app.post('/notify', async (req, res) => {
    const { username, server } = req.body;
    if (!username || !server) {
        return res.status(400).json({ error: 'Missing username or server' });
    }
    console.log(`📨 ${username} joined ${server}`);
    const message = `**${username}** has just joined the server ${server} now`;
    try {
        const owner = await client.users.fetch(process.env.OWNER_ID);
        await owner.send(message);
        console.log(`✅ DM sent: ${message}`);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('❌ Failed to DM owner:', err.message);
        res.status(500).json({ error: 'DM failed' });
    }
});
app.get('/', (req, res) => {
    res.send('✅ CYPHER XXD Running!');
});
app.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});
client.login(process.env.BOT_TOKEN);
