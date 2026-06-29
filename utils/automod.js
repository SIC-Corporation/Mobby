const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const spamMap = new Map(); // userId -> [timestamps]
const SPAM_LIMIT = 5;
const SPAM_WINDOW = 5000; // 5 seconds

const BAD_LINKS = [/discord\.gg\/\w+/i, /bit\.ly\/\w+/i];
const CAPS_THRESHOLD = 0.7; // 70% caps = flagged

async function handleAutoMod(message, client) {
  if (!message.guild) return;
  const member = message.guild.members.cache.get(message.author.id);
  if (!member) return;

  // Skip mods/admins
  if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

  const content = message.content;

  // --- Spam detection ---
  const now = Date.now();
  const timestamps = spamMap.get(message.author.id) || [];
  const recent = timestamps.filter(t => now - t < SPAM_WINDOW);
  recent.push(now);
  spamMap.set(message.author.id, recent);

  if (recent.length >= SPAM_LIMIT) {
    await message.delete().catch(() => {});
    spamMap.set(message.author.id, []);
    const embed = new EmbedBuilder()
      .setColor('#e63946')
      .setFooter({ text: 'SIC Corporation • Mobby Bot' })
      .setDescription(`⚠️ <@${message.author.id}> Slow down! No spamming.`);
    const warn = await message.channel.send({ embeds: [embed] });
    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return;
  }

  // --- Link detection ---
  for (const pattern of BAD_LINKS) {
    if (pattern.test(content)) {
      await message.delete().catch(() => {});
      const embed = new EmbedBuilder()
        .setColor('#e63946')
        .setFooter({ text: 'SIC Corporation • Mobby Bot' })
        .setDescription(`⚠️ <@${message.author.id}> Unauthorized links are not allowed!`);
      const warn = await message.channel.send({ embeds: [embed] });
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }
  }

  // --- Caps detection ---
  if (content.length > 10) {
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 0) {
      const capsRatio = (content.replace(/[^A-Z]/g, '').length) / letters.length;
      if (capsRatio >= CAPS_THRESHOLD) {
        await message.delete().catch(() => {});
        const embed = new EmbedBuilder()
          .setColor('#f4a261')
          .setFooter({ text: 'SIC Corporation • Mobby Bot' })
          .setDescription(`⚠️ <@${message.author.id}> Please don't use excessive caps!`);
        const warn = await message.channel.send({ embeds: [embed] });
        setTimeout(() => warn.delete().catch(() => {}), 5000);
        return;
      }
    }
  }
}

module.exports = { handleAutoMod };
