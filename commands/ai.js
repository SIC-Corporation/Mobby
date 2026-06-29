const https = require('https');

async function askAI(prompt) {
  const body = JSON.stringify({
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    messages: [
      {
        role: 'system',
        content:
          'You are Mobby, a friendly and helpful Discord bot made by SIC Corporation. Keep responses concise and Discord-friendly.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1024,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://mobby-bot.local',
          'X-Title': 'Mobby Discord Bot',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';

        res.on('data', chunk => (data += chunk));

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              return reject(new Error(parsed.error.message));
            }

            resolve(parsed.choices[0].message.content);
          } catch {
            reject(new Error('Failed to parse OpenRouter response'));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const chatCmd = {
  name: 'chat',
  async execute(message, args, client) {
    if (!args.length)
      return message.reply({
        embeds: [
          client.sicEmbed('#f4a261')
            .setDescription('❌ Usage: `m.chat <message>`')
        ]
      });

    const prompt = args.join(' ');
    await message.channel.sendTyping();

    try {
      const response = await askAI(prompt);

      const embed = client.sicEmbed('#5865F2')
        .setTitle('🤖 Mobby AI')
        .addFields(
          { name: '💬 You asked', value: prompt.slice(0, 1024) },
          { name: '🤖 Mobby says', value: response.slice(0, 1024) }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply({
        embeds: [
          client.sicEmbed('#e63946')
            .setDescription('❌ AI is unavailable right now.')
        ]
      });
    }
  }
};

const askCmd = {
  name: 'ask',
  async execute(message, args, client) {
    if (!args.length)
      return message.reply({
        embeds: [
          client.sicEmbed('#f4a261')
            .setDescription('❌ Usage: `m.ask <question>`')
        ]
      });

    const question = args.join(' ');
    await message.channel.sendTyping();

    try {
      const response = await askAI(question);

      const embed = client.sicEmbed('#00b4d8')
        .setTitle('❓ Mobby Answers')
        .addFields(
          { name: '❓ Question', value: question.slice(0, 1024) },
          { name: '💡 Answer', value: response.slice(0, 1024) }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply({
        embeds: [
          client.sicEmbed('#e63946')
            .setDescription('❌ AI is unavailable right now.')
        ]
      });
    }
  }
};

module.exports = chatCmd;
module.exports.extra = [askCmd];
