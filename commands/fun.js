const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mobby-Bot/1.0' } }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Parse error')); } });
    }).on('error', reject);
  });
}

const EIGHT_BALL = [
  '✅ It is certain.', '✅ It is decidedly so.', '✅ Without a doubt.',
  '✅ Yes, definitely!', '✅ You may rely on it.', '✅ As I see it, yes.',
  '✅ Most likely.', '✅ Outlook good.', '✅ Yes!', '✅ Signs point to yes.',
  '⚠️ Reply hazy, try again.', '⚠️ Ask again later.', '⚠️ Better not tell you now.',
  '⚠️ Cannot predict now.', '⚠️ Concentrate and ask again.',
  '❌ Don\'t count on it.', '❌ My reply is no.', '❌ My sources say no.',
  '❌ Outlook not so good.', '❌ Very doubtful.',
];

const TRIVIA = [
  { q: 'What is the capital of France?', a: 'paris' },
  { q: 'How many sides does a hexagon have?', a: '6' },
  { q: 'What planet is closest to the sun?', a: 'mercury' },
  { q: 'What is 12 x 12?', a: '144' },
  { q: 'Who wrote Romeo and Juliet?', a: 'shakespeare' },
  { q: 'What is the largest ocean?', a: 'pacific' },
  { q: 'What gas do plants absorb?', a: 'carbon dioxide' },
  { q: 'How many continents are there?', a: '7' },
  { q: 'What is the fastest land animal?', a: 'cheetah' },
  { q: 'What color is the sky on a clear day?', a: 'blue' },
];

const SLOTS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🎰'];

const eightBallCmd = {
  name: '8ball',
  async execute(message, args, client) {
    if (!args.length)
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Ask a question! `m.8ball <question>`')] });

    const question = args.join(' ');
    const answer = EIGHT_BALL[Math.floor(Math.random() * EIGHT_BALL.length)];

    const embed = client.sicEmbed('#5865F2')
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: '❓ Question', value: question },
        { name: '🎱 Answer', value: answer }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const triviaCmd = {
  name: 'trivia',
  async execute(message, args, client) {
    const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];

    const embed = client.sicEmbed('#00b4d8')
      .setTitle('🧠 Trivia Time!')
      .setDescription(`**${q.q}**\n\nYou have **15 seconds** to answer!`)
      .setTimestamp();
    await message.reply({ embeds: [embed] });

    const filter = m => m.author.id === message.author.id;
    try {
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
      const answer = collected.first().content.trim().toLowerCase();

      if (answer.includes(q.a)) {
        const win = client.sicEmbed('#06d6a0')
          .setTitle('✅ Correct!')
          .setDescription(`Nice one **${message.author.username}**! The answer was **${q.a}**. You earned **+50 coins**!`);
        const { addCoins } = require('../utils/economy');
        addCoins(message.author.id, 50);
        message.channel.send({ embeds: [win] });
      } else {
        const lose = client.sicEmbed('#e63946')
          .setTitle('❌ Wrong!')
          .setDescription(`The correct answer was **${q.a}**. Better luck next time!`);
        message.channel.send({ embeds: [lose] });
      }
    } catch {
      const timeout = client.sicEmbed('#f4a261')
        .setTitle('⏱️ Time\'s up!')
        .setDescription(`The correct answer was **${q.a}**!`);
      message.channel.send({ embeds: [timeout] });
    }
  }
};

const memeCmd = {
  name: 'meme',
  async execute(message, args, client) {
    try {
      const data = await fetchJSON('https://meme-api.com/gimme');
      const embed = client.sicEmbed('#5865F2')
        .setTitle(`😂 ${data.title}`)
        .setImage(data.url)
        .addFields(
          { name: '👍 Upvotes', value: `${data.ups}`, inline: true },
          { name: '📌 Subreddit', value: `r/${data.subreddit}`, inline: true }
        )
        .setTimestamp();
      message.reply({ embeds: [embed] });
    } catch {
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Couldn\'t fetch a meme right now, try again!')] });
    }
  }
};

const rpsCmd = {
  name: 'rps',
  async execute(message, args, client) {
    const choices = ['rock', 'paper', 'scissors'];
    const userChoice = args[0]?.toLowerCase();
    if (!choices.includes(userChoice))
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.rps rock/paper/scissors`')] });

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

    let result, color;
    if (userChoice === botChoice) { result = "It's a tie! 🤝"; color = '#f4a261'; }
    else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) { result = 'You win! 🎉'; color = '#06d6a0'; const { addCoins } = require('../utils/economy'); addCoins(message.author.id, 25); }
    else { result = 'Mobby wins! 🤖'; color = '#e63946'; }

    const embed = client.sicEmbed(color)
      .setTitle('✂️ Rock Paper Scissors')
      .addFields(
        { name: 'Your Choice', value: `${emojis[userChoice]} ${userChoice}`, inline: true },
        { name: 'Mobby\'s Choice', value: `${emojis[botChoice]} ${botChoice}`, inline: true },
        { name: 'Result', value: result, inline: false }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

const slotsCmd = {
  name: 'slots',
  async execute(message, args, client) {
    const { getUser, removeCoins, addCoins } = require('../utils/economy');
    const user = getUser(message.author.id);
    const bet = 20;

    if (user.coins < bet)
      return message.reply({ embeds: [client.sicEmbed('#e63946').setDescription(`❌ You need at least **${bet} coins** to spin! You have **${user.coins}**.`)] });

    removeCoins(message.author.id, bet);

    const spin = () => SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const s1 = spin(), s2 = spin(), s3 = spin();
    const result = `${s1} | ${s2} | ${s3}`;

    let outcome, color, winAmount = 0;
    if (s1 === s2 && s2 === s3) {
      winAmount = s1 === '💎' ? bet * 10 : bet * 5;
      addCoins(message.author.id, winAmount);
      outcome = `🎉 JACKPOT! You won **${winAmount} coins**!`;
      color = '#06d6a0';
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      winAmount = bet * 2;
      addCoins(message.author.id, winAmount);
      outcome = `✅ Two of a kind! You won **${winAmount} coins**!`;
      color = '#00b4d8';
    } else {
      outcome = `❌ No match. You lost **${bet} coins**.`;
      color = '#e63946';
    }

    const newBal = getUser(message.author.id).coins;
    const embed = client.sicEmbed(color)
      .setTitle('🎰 Slot Machine')
      .setDescription(`**${result}**\n\n${outcome}`)
      .addFields({ name: '💰 Balance', value: `${newBal} coins`, inline: true })
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }
};

module.exports = eightBallCmd;
module.exports.extra = [triviaCmd, memeCmd, rpsCmd, slotsCmd];
