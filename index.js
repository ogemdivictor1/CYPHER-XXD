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

const selfbotBuffer = [];
let selfbotTimer = null;

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
// SELFBOT INTEGRATION
// ============================================

app.use(express.json());

app.post('/notify', async (req, res) => {
    const { server, username, joinedAt } = req.body;

    if (!server || !username) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    console.log(`📨 Received: ${username} joined ${server}`);

    const entry = `• **${username}** joined **${server}** at ${new Date(joinedAt).toLocaleTimeString()}`;
    selfbotBuffer.push(entry);

    if (selfbotTimer) clearTimeout(selfbotTimer);

    selfbotTimer = setTimeout(async () => {
        if (selfbotBuffer.length === 0) {
            selfbotTimer = null;
            return;
        }

        const allEntries = [...selfbotBuffer];
        selfbotBuffer.length = 0;

        try {
            const owner = await client.users.fetch(process.env.OWNER_ID);
            await owner.send(`🔔 **New member alert:**\n${allEntries.join('\n')}`);
            console.log('✅ DM sent!');
        } catch (err) {
            console.error('❌ Failed to DM owner:', err.message);
        } finally {
            selfbotTimer = null;
        }
    }, 5000);

    res.status(200).json({ success: true });
});

app.get('/', (req, res) => {
    res.send('✅ CYPHER XXD Running!');
});

app.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});

client.login(process.env.BOT_TOKEN);
