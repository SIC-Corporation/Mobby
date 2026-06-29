const https = require('https');

async function askAI(prompt) {
  const body = JSON.stringify({
    inputs: prompt,
    parameters: {
      max_new_tokens: 512,
      temperature: 0.7
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

            if (parsed.error)
              return reject(new Error(parsed.error));

            // HF returns array sometimes
            const output =
              Array.isArray(parsed)
                ? parsed[0]?.generated_text
                : parsed.generated_text;

            resolve(output || 'No response');
          } catch {
            reject(new Error('Failed to parse Hugging Face response'));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
