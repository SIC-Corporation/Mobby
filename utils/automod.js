// List of words or phrases you want Mobby to block
const BANNED_WORDS = [
  'discord.gg/', // Blocks Discord server invites
  'badword1',     // Add whatever words you want to moderate here
  'badword2'
];

const automod = {
  name: 'automod',
  
  // This function will look at every message sent in the server
  handleMessage(message, client) {
    // Ignore bots so Mobby doesn't moderate himself or other bots
    if (message.author.bot) return;

    const contentLower = message.content.toLowerCase();

    // Check if the message contains any banned words
    const containsBannedWord = BANNED_WORDS.some(word => contentLower.includes(word));

    if (containsBannedWord) {
      try {
        // 1. Delete the rule-breaking message
        message.delete().catch(() => null);

        // 2. Warn the user using your custom SIC embed layout
        const warnEmbed = client.sicEmbed('#e63946')
          .setTitle('🛡️ AutoMod Warning')
          .setDescription(`⚠️ ${message.author}, your message was removed because it contained blocked phrases or links.`);

        message.channel.send({ embeds: [warnEmbed] })
          .then(msg => {
            // Automatically delete Mobby's warning after 5 seconds to keep chat clean
            setTimeout(() => msg.delete().catch(() => null), 5000);
          });
          
      } catch (err) {
        console.error('Failed to execute AutoMod action:', err);
      }
    }
  }
};

module.exports = automod;
