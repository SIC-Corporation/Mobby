const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const WARN_FILE = path.join(__dirname, '../data/warnings.json');

function loadWarnings() {
  if (!fs.existsSync(WARN_FILE)) fs.writeFileSync(WARN_FILE, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(WARN_FILE, 'utf8'));
}

function saveWarnings(data) {
  fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
}

function parseMuteTime(str) {
  const match = str?.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;
  const v = parseInt(match[1]);
  const u = match[2];
  const ms = u === 's' ? v * 1000 : u === 'm' ? v * 60000 : v * 3600000;
  const label = u === 's' ? `${v}s` : u === 'm' ? `${v}m` : `${v}h`;
  return { ms, label };
}

const kickCmd = {
  name: 'kick',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers))
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ You need **Kick Members** permission.')] });

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Mention someone to kick!')] });

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.kick(reason);
      const embed = client.sicEmbed('#e63946')
        .setTitle('👢 Member Kicked')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true }
        )
        .setTimestamp();
      message.reply({ embeds: [embed] });
    } catch {
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Failed to kick. Do I have permission?')] });
    }
  }
};

const banCmd = {
  name: 'ban',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ You need **Ban Members** permission.')] });

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Mention someone to ban!')] });

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.ban({ reason });
      const embed = client.sicEmbed('#e63946')
        .setTitle('🔨 Member Banned')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true }
        )
        .setTimestamp();
      message.reply({ embeds: [embed] });
    } catch {
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Failed to ban. Do I have permission?')] });
    }
  }
};

const muteCmd = {
  name: 'mute',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ You need **Timeout Members** permission.')] });

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Mention someone to mute!')] });

    const timeStr = args[1];
    const parsed = parseMuteTime(timeStr);
    if (!parsed) return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.mute @user 10m` (s/m/h)')] });

    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      await target.timeout(parsed.ms, reason);
      const embed = client.sicEmbed('#f4a261')
        .setTitle('🔇 Member Muted')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Duration', value: parsed.label, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true }
        )
        .setTimestamp();
      message.reply({ embeds: [embed] });
    } catch {
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Failed to mute. Do I have permission?')] });
    }
  }
};

const warnCmd = {
  name: 'warn',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ You need **Manage Messages** permission.')] });

    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Mention someone to warn!')] });

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const data = loadWarnings();
    if (!data[target.id]) data[target.id] = [];
    data[target.id].push({ reason, mod: message.author.tag, date: new Date().toISOString() });
    saveWarnings(data);

    const embed = client.sicEmbed('#f4a261')
      .setTitle('⚠️ Member Warned')
      .addFields(
        { name: 'User', value: `${target.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Total Warnings', value: `${data[target.id].length}`, inline: true },
        { name: 'Moderator', value: message.author.tag, inline: true }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const warningsCmd = {
  name: 'warnings',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const data = loadWarnings();
    const warns = data[target.id] || [];

    if (warns.length === 0) {
      return message.reply({ embeds: [client.sicEmbed('#06d6a0').setDescription(`✅ **${target.username}** has no warnings!`)] });
    }

    const list = warns.map((w, i) => `\`${i + 1}.\` ${w.reason} — by ${w.mod}`).join('\n');
    const embed = client.sicEmbed('#f4a261')
      .setTitle(`⚠️ Warnings for ${target.username} (${warns.length})`)
      .setDescription(list)
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const clearwarnsCmd = {
  name: 'clearwarns',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ You need **Manage Messages** permission.')] });

    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Mention someone to clear warnings!')] });

    const data = loadWarnings();
    data[target.id] = [];
    saveWarnings(data);

    message.reply({ embeds: [client.sicEmbed('#06d6a0').setDescription(`✅ Cleared all warnings for **${target.username}**!`)] });
  }
};

module.exports = kickCmd;
module.exports.extra = [banCmd, muteCmd, warnCmd, warningsCmd, clearwarnsCmd];
