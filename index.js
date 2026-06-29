const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();
client.PREFIX = 'm.';
client.OWNER_ID = '1101862076839886971';

// Maintenance state
client.maintenance = {
  active: false,
  timed: false,
  endsAt: null,
  duration: null,
  timer: null,
};

// Load all command files
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.name, cmd);
  if (cmd.aliases) cmd.aliases.forEach(a => client.commands.set(a, cmd));
  if (cmd.extra) cmd.extra.forEach(e => {
    client.commands.set(e.name, e);
    if (e.aliases) e.aliases.forEach(a => client.commands.set(a, e));
  });
}

// SIC Corp embed footer helper
client.sicEmbed = (color = '#5865F2') =>
  new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: 'SIC Corporation • Mobby Bot', iconURL: 'https://i.imgur.com/4M34hi2.png' });

// Maintenance check helper
client.isMaintenanceActive = () => {
  if (!client.maintenance.active) return false;
  if (client.maintenance.timed && client.maintenance.endsAt) {
    if (Date.now() >= client.maintenance.endsAt) {
      client.maintenance.active = false;
      client.maintenance.timed = false;
      client.maintenance.endsAt = null;
      return false;
    }
  }
  return true;
};

client.on('ready', () => {
  console.log(`✅ Mobby is online as ${client.user.tag}`);
  client.user.setActivity('m.help | SIC Corp', { type: 3 });
});

// Auto-mod
const { handleAutoMod } = require('./utils/automod');

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Auto-mod (runs regardless of prefix)
  await handleAutoMod(message, client);

  if (!message.content.startsWith(client.PREFIX)) return;

  const args = message.content.slice(client.PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  // Maintenance check — only owner bypasses
  if (client.isMaintenanceActive() && message.author.id !== client.OWNER_ID) {
    const mt = client.maintenance;
    const embed = client.sicEmbed('#f4a261')
      .setTitle('🔧 Mobby is under Maintenance')
      .setDescription(
        mt.timed && mt.endsAt
          ? `⏱️ Scheduled maintenance is on, please hold on for **${mt.duration}**!\nCheck <#announcements> for updates.`
          : `🔧 Maintenance mode is on!\nScheduled time is in the **announcements channel** of Mobby!`
      );
    return message.reply({ embeds: [embed] });
  }

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    const embed = client.sicEmbed('#e63946')
      .setTitle('❌ Error')
      .setDescription('Something went wrong running that command.');
    message.reply({ embeds: [embed] });
  }
});

// Health check for Render
http.createServer((req, res) => res.end('Mobby is online!')).listen(8080);

client.login(process.env.DISCORD_TOKEN);
