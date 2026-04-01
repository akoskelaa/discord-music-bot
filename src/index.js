const { Client, GatewayIntentBits, Events } = require('discord.js');
const { handleMessageCreate } = require('./events/messageCreate');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
  handleMessageCreate(message);
});

client.login(process.env.BOT_TOKEN);
