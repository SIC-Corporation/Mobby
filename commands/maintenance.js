function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  const ms = unit === 's' ? value * 1000 : unit === 'm' ? value * 60000 : value * 3600000;
  const label = unit === 's' ? `${value} second(s)` : unit === 'm' ? `${value} minute(s)` : `${value} hour(s)`;
  return { ms, label };
}

const mtCmd = {
  name: 'mt',
  async execute(message, args, client) {
    if (message.author.id !== client.OWNER_ID)
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Only the bot owner can use this!')] });

    const toggle = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(toggle))
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.mt on` or `m.mt off`')] });

    if (toggle === 'on') {
      client.maintenance.active = true;
      client.maintenance.timed = false;
      client.maintenance.endsAt = null;
      client.maintenance.duration = null;
      if (client.maintenance.timer) { clearTimeout(client.maintenance.timer); client.maintenance.timer = null; }

      const embed = client.sicEmbed('#f4a261')
        .setTitle('🔧 Maintenance Mode ON')
        .setDescription('Mobby is now in maintenance mode. Only the owner can use commands.');
      message.reply({ embeds: [embed] });
    } else {
      client.maintenance.active = false;
      client.maintenance.timed = false;
      client.maintenance.endsAt = null;
      if (client.maintenance.timer) { clearTimeout(client.maintenance.timer); client.maintenance.timer = null; }

      const embed = client.sicEmbed('#06d6a0')
        .setTitle('✅ Maintenance Mode OFF')
        .setDescription('Mobby is back online! All commands are available.');
      message.reply({ embeds: [embed] });
    }
  }
};

const tmCmd = {
  name: 'tm',
  async execute(message, args, client) {
    if (message.author.id !== client.OWNER_ID)
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Only the bot owner can use this!')] });

    // Usage: m.tm 5m on  OR  m.tm off
    if (args[0]?.toLowerCase() === 'off') {
      client.maintenance.active = false;
      client.maintenance.timed = false;
      client.maintenance.endsAt = null;
      if (client.maintenance.timer) { clearTimeout(client.maintenance.timer); client.maintenance.timer = null; }
      const embed = client.sicEmbed('#06d6a0')
        .setTitle('✅ Timed Maintenance Cancelled')
        .setDescription('Maintenance has been lifted early. Mobby is back online!');
      return message.reply({ embeds: [embed] });
    }

    const durationStr = args[0];
    const toggle = args[1]?.toLowerCase();

    if (!durationStr || toggle !== 'on') {
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.tm 5m on` or `m.tm off`')] });
    }

    const parsed = parseDuration(durationStr);
    if (!parsed) {
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Invalid duration. Use `5s`, `5m`, or `2h`')] });
    }

    client.maintenance.active = true;
    client.maintenance.timed = true;
    client.maintenance.endsAt = Date.now() + parsed.ms;
    client.maintenance.duration = parsed.label;

    if (client.maintenance.timer) clearTimeout(client.maintenance.timer);
    client.maintenance.timer = setTimeout(() => {
      client.maintenance.active = false;
      client.maintenance.timed = false;
      client.maintenance.endsAt = null;
      client.maintenance.duration = null;
      console.log(`⏱️ Timed maintenance ended after ${parsed.label}`);
    }, parsed.ms);

    const embed = client.sicEmbed('#f4a261')
      .setTitle('⏱️ Timed Maintenance ON')
      .setDescription(`Maintenance mode activated for **${parsed.label}**.\nMobby will automatically come back online after that.`)
      .addFields({ name: 'Ends In', value: parsed.label, inline: true });
    message.reply({ embeds: [embed] });
  }
};

module.exports = mtCmd;
module.exports.extra = [tmCmd];
