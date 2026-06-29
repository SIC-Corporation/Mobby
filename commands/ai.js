const https = require('https');

async function askAI(prompt) {
  const body = JSON.stringify({
    inputs: `You are Mobby, a Discord assistant. Keep replies short and helpful.\n\nUser: ${prompt}\nMobby:`,
    parameters: {
      max_new_tokens: 512,
      temperature: 0.7,
      return_full_text: false
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api-inference.huggingface.co',
        path: '/models/mistralai/Mistral-7B-Instruct-v0.2',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
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
              return reject(new Error(parsed.error));
            }

            // Hugging Face usually returns an array
            const output =
              Array.isArray(parsed)
                ? parsed[0]?.generated_text
                : parsed.generated_text;

            if (!output) {
              return reject(new Error('Empty AI response'));
            }

            resolve(output.trim());
          } catch (err) {
            reject(new Error('Failed to parse AI response: ' + err.message));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
