const { getUser, setUser, addCoins, getLeaderboard } = require('../utils/economy');

const SHOP = [
  { id: 'vip', name: '⭐ VIP Role Colour', price: 500, description: 'Flex with a VIP tag in the economy system' },
  { id: 'lucky', name: '🍀 Lucky Charm', price: 200, description: '+10% bonus on slots wins for 24h' },
  { id: 'shield', name: '🛡️ Coin Shield', price: 300, description: 'Protect your coins from loss once' },
];

const balanceCmd = {
  name: 'balance',
  aliases: ['bal'],
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const user = getUser(target.id);

    const embed = client.sicEmbed('#f4a261')
      .setTitle(`💰 ${target.username}'s Balance`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '💵 Coins', value: `${user.coins}`, inline: true },
        { name: '🎒 Items', value: user.inventory.length > 0 ? user.inventory.join(', ') : 'None', inline: true }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const dailyCmd = {
  name: 'daily',
  async execute(message, args, client) {
    const user = getUser(message.author.id);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (user.lastDaily && now - new Date(user.lastDaily).getTime() < cooldown) {
      const remaining = cooldown - (now - new Date(user.lastDaily).getTime());
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      return message.reply({
        embeds: [client.sicEmbed('#f4a261').setDescription(`⏱️ Daily already claimed! Come back in **${hours}h ${minutes}m**.`)]
      });
    }

    const amount = 100 + Math.floor(Math.random() * 50);
    user.coins += amount;
    user.lastDaily = new Date().toISOString();
    setUser(message.author.id, user);

    const embed = client.sicEmbed('#06d6a0')
      .setTitle('💰 Daily Coins Claimed!')
      .setDescription(`You received **${amount} coins**!\nCome back in 24 hours for more.`)
      .addFields({ name: '💵 New Balance', value: `${user.coins} coins`, inline: true })
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const shopCmd = {
  name: 'shop',
  async execute(message, args, client) {
    const items = SHOP.map(i => `**${i.name}** — \`${i.price} coins\`\n${i.description}\nBuy: \`m.buy ${i.id}\``).join('\n\n');

    const embed = client.sicEmbed('#5865F2')
      .setTitle('🛒 SIC Corp Shop')
      .setDescription(items)
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const buyCmd = {
  name: 'buy',
  async execute(message, args, client) {
    const itemId = args[0]?.toLowerCase();
    const item = SHOP.find(i => i.id === itemId);

    if (!item)
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription(`❌ Item not found! Check \`m.shop\` for available items.`)] });

    const user = getUser(message.author.id);
    if (user.coins < item.price)
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription(`❌ You need **${item.price} coins** but only have **${user.coins}**.`)] });

    if (user.inventory.includes(item.name))
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription(`⚠️ You already own **${item.name}**!`)] });

    user.coins -= item.price;
    user.inventory.push(item.name);
    setUser(message.author.id, user);

    const embed = client.sicEmbed('#06d6a0')
      .setTitle('✅ Purchase Successful!')
      .addFields(
        { name: 'Item', value: item.name, inline: true },
        { name: 'Cost', value: `${item.price} coins`, inline: true },
        { name: 'Remaining Balance', value: `${user.coins} coins`, inline: true }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const leaderboardCmd = {
  name: 'leaderboard',
  aliases: ['lb'],
  async execute(message, args, client) {
    const top = getLeaderboard();
    if (top.length === 0)
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('No economy data yet!')] });

    const medals = ['🥇', '🥈', '🥉'];
    const lines = await Promise.all(top.map(async (entry, i) => {
      const user = await client.users.fetch(entry.id).catch(() => null);
      const name = user ? user.username : 'Unknown';
      return `${medals[i] || `\`${i + 1}.\``} **${name}** — ${entry.coins} coins`;
    }));

    const embed = client.sicEmbed('#f4a261')
      .setTitle('🏆 SIC Corp Economy Leaderboard')
      .setDescription(lines.join('\n'))
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

module.exports = balanceCmd;
module.exports.extra = [dailyCmd, shopCmd, buyCmd, leaderboardCmd];
