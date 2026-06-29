module.exports = {
  name: 'help',
  async execute(message, args, client) {
    const embed = client.sicEmbed('#5865F2')
      .setTitle('📖 Mobby — Command List')
      .setDescription('Prefix: `m.` — Built by **SIC Corporation**')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: '🤖 AI Chat',
          value: '`m.chat <message>` — Chat with Gemini AI\n`m.ask <question>` — Ask Mobby anything',
        },
        {
          name: '🛡️ Moderation',
          value: [
            '`m.kick @user [reason]` — Kick a member',
            '`m.ban @user [reason]` — Ban a member',
            '`m.mute @user [time]` — Timeout a member',
            '`m.warn @user [reason]` — Warn a member',
            '`m.warnings @user` — View warnings',
            '`m.clearwarns @user` — Clear warnings',
          ].join('\n'),
        },
        {
          name: '🎉 Fun',
          value: [
            '`m.8ball <question>` — Ask the magic 8ball',
            '`m.trivia` — Answer a trivia question',
            '`m.meme` — Get a random meme',
            '`m.rps <rock/paper/scissors>` — Play RPS',
            '`m.slots` — Spin the slot machine',
          ].join('\n'),
        },
        {
          name: '💰 Economy',
          value: [
            '`m.balance` — Check your coins',
            '`m.daily` — Claim daily coins',
            '`m.shop` — View the shop',
            '`m.buy <item>` — Buy an item',
            '`m.leaderboard` — Top 10 richest',
          ].join('\n'),
        },
        {
          name: '🔧 Maintenance (Owner Only)',
          value: [
            '`m.mt on/off` — Toggle maintenance mode',
            '`m.tm <time> on/off` — Timed maintenance (e.g. `m.tm 5m on`)',
          ].join('\n'),
        }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
