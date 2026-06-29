const { GoogleGenAI } = require('@google/genai');

async function askGemini(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const chatCmd = {
  name: 'chat',
  async execute(message, args, client) {
    if (!args.length)
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.chat <message>`')] });

    const prompt = args.join(' ');
    const typing = await message.channel.sendTyping();

    try {
      const response = await askGemini(
        `You are Mobby, a friendly and helpful Discord bot made by SIC Corporation. Keep responses concise and Discord-friendly. User says: ${prompt}`
      );

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
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Gemini AI is unavailable right now.')] });
    }
  }
};

const askCmd = {
  name: 'ask',
  async execute(message, args, client) {
    if (!args.length)
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.ask <question>`')] });

    const question = args.join(' ');
    await message.channel.sendTyping();

    try {
      const response = await askGemini(
        `You are Mobby, a knowledgeable Discord bot by SIC Corporation. Answer this question clearly and concisely: ${question}`
      );

      const embed = client.sicEmbed('#00b4d8')
        .setTitle('❓ Mobby Answers')
        .addFields(
          { name: '❓ Question', value: question.slice(0, 1024) },
          { name: '💡 Answer', value: response.slice(0, 1024) }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Gemini AI is unavailable right now.')] });
    }
  }
};

module.exports = chatCmd;
module.exports.extra = [askCmd];
