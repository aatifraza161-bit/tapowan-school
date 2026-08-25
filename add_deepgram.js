const fs = require('fs');

// 1. Update server.js
let serverCode = fs.readFileSync('server.js', 'utf8');

const ttsEndpoint = `
// ── Deepgram TTS Endpoint ──
app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text, lang } = req.body;
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) return res.status(503).json({ error: "Deepgram not configured" });

    // Deepgram currently supports English (aura voices).
    // Hindi can be mapped to a specific deepgram model if they have it, else fallback to asteria.
    const model = lang === 'hi' ? 'aura-asteria-en' : 'aura-asteria-en'; 

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
    resp.body.pipe(res);
  } catch (err) {
    console.error('[Vidya TTS Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});
`;

if (!serverCode.includes('/api/ai/tts')) {
  serverCode = serverCode.replace('// ── AI Report Card Remark Generator ──', ttsEndpoint + '\n\n// ── AI Report Card Remark Generator ──');
  fs.writeFileSync('server.js', serverCode);
  console.log('Added TTS endpoint to server.js');
}

// 2. Update app.js (speak function)
let appCode = fs.readFileSync('public/app.js', 'utf8');

const oldSpeak = `function speak(text) {
    if (!isSoundEnabled) return;
    if (speechSynth.speaking) speechSynth.cancel();
    const cleaned = text.replace(/[\\*\\#\\_\\[\\]]/g, "");
    if (!cleaned.trim()) return;
    const utter = new SpeechSynthesisUtterance(cleaned);
    // Detect Hindi characters
    const hasHindi = /[\\u0900-\\u097F]/.test(cleaned);
    utter.lang = (vidyaLang === "hi" || (vidyaLang === "auto" && hasHindi)) ? "hi-IN" : "en-IN";
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.onstart  = () => { isSpeaking = true;  svgEl?.classList.add("talking"); };
    utter.onend    = () => { isSpeaking = false; svgEl?.classList.remove("talking"); };
    utter.onerror  = () => { isSpeaking = false; svgEl?.classList.remove("talking"); };
    // Pick best voice
    const voices = speechSynth.getVoices();
    const preferred = voices.find(v => v.lang === utter.lang) ||
                      voices.find(v => v.lang.startsWith(utter.lang.split("-")[0]));
    if (preferred) utter.voice = preferred;
    speechSynth.speak(utter);
  }`;

const newSpeak = `async function speak(text) {
    if (!isSoundEnabled) return;
    if (speechSynth.speaking) speechSynth.cancel();
    if (window.currentVidyaAudio) {
      window.currentVidyaAudio.pause();
      window.currentVidyaAudio = null;
    }
    const cleaned = text.replace(/[\\*\\#\\_\\[\\]]/g, "");
    if (!cleaned.trim()) return;

    const hasHindi = /[\\u0900-\\u097F]/.test(cleaned);
    const lang = (vidyaLang === "hi" || (vidyaLang === "auto" && hasHindi)) ? "hi" : "en";

    try {
      const res = await fetch(getApiBaseUrl() + "/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned, lang })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        window.currentVidyaAudio = audio;
        audio.onplay = () => { isSpeaking = true; svgEl?.classList.add("talking"); };
        audio.onended = () => { isSpeaking = false; svgEl?.classList.remove("talking"); URL.revokeObjectURL(url); };
        audio.onerror = () => { isSpeaking = false; svgEl?.classList.remove("talking"); URL.revokeObjectURL(url); };
        await audio.play();
        return;
      }
    } catch(e) {
      console.warn("Deepgram TTS failed, falling back to local TTS", e);
    }

    // Fallback to local TTS
    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.onstart  = () => { isSpeaking = true;  svgEl?.classList.add("talking"); };
    utter.onend    = () => { isSpeaking = false; svgEl?.classList.remove("talking"); };
    utter.onerror  = () => { isSpeaking = false; svgEl?.classList.remove("talking"); };
    const voices = speechSynth.getVoices();
    const preferred = voices.find(v => v.lang === utter.lang) || voices.find(v => v.lang.startsWith(utter.lang.split("-")[0]));
    if (preferred) utter.voice = preferred;
    speechSynth.speak(utter);
  }`;

appCode = appCode.replace(oldSpeak, newSpeak);

// Also fix the Connection Error handling to log the actual error in console so users can debug
appCode = appCode.replace(
  `catch (err) {
      removeTyping();
      const errMsg = "Oops! Connection error. Please try again!";
      addMsg(errMsg, "bot");
      speak(errMsg);
    }`,
  `catch (err) {
      console.error("AI Vidya Fetch Error:", err);
      removeTyping();
      const errMsg = err.message && err.message.includes("Session") 
         ? "Session Expired! Please login again." 
         : "Oops! AI is offline or Connection error. Check server logs.";
      addMsg(errMsg, "bot");
      speak(errMsg);
    }`
);

fs.writeFileSync('public/app.js', appCode);
console.log('Updated app.js with Deepgram TTS support');
