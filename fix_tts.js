const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /app\.post\("\/api\/ai\/tts", async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: err\.message \}\);\n  \}\n\}\);/;

const newRoute = `app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text, lang } = req.body;
    
    // For Hindi, Deepgram Aura doesn't support it well, use OpenAI TTS
    if (lang === 'hi') {
      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) return res.status(503).json({ error: "OpenAI not configured for Hindi TTS" });
      
      const resp = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + openAiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'nova'
        })
      });

      if (!resp.ok) {
        throw new Error('OpenAI TTS API error: ' + resp.status);
      }

      res.set('Content-Type', 'audio/mp3');
      const arrayBuffer = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    }

    // For English, use Deepgram Aura
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) return res.status(503).json({ error: "Deepgram not configured" });

    const model = 'aura-asteria-en'; 

    const resp = await fetch('https://api.deepgram.com/v1/speak?model=' + model, {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!resp.ok) {
      throw new Error('Deepgram API error: ' + resp.status);
    }

    res.set('Content-Type', 'audio/mp3');
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('[Vidya TTS Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});`;

if (regex.test(code)) {
    code = code.replace(regex, newRoute);
    fs.writeFileSync('server.js', code);
    console.log('Successfully updated /api/ai/tts route!');
} else {
    console.log('Regex did not match server.js!');
}
