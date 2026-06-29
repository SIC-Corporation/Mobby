const { GoogleGenAI } = require('@google/genai');

// Initialize the Gemini client once here using the new SDK syntax
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askGemini(prompt) {
  // Call the model using the updated SDK method structure
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
  });
  
  return response.text;
}

const chatCmd = {
  name: 'chat',
  async execute(message, args, client) {
    if (!args.length)
      return message.reply({ embeds: [client.sicEmbed('#f4a261').setDescription('❌ Usage: `m.chat <message>`')] });

    const prompt = args.join(' ');
    await message.channel.sendTyping();

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
      console.error(err);
      message.reply({ embeds: [client.sicEmbed('#e63946').setDescription('❌ Gemini AI is unavailable right now.')] });
    }
  }
};

// Clean export for your command handler
module.exports = chatCmd;
module.exports.extra = [askCmd];
