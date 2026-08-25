const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// The multi_replace tool put the new speak function at the global scope.
// Let's remove any global "async function speak(text)" that was incorrectly placed before mountVidyaAvatar
const globalSpeakRegex = /async function speak\(text\) \{[\s\S]*?speechSynth\.speak\(utter\);\s*\}/m;
code = code.replace(globalSpeakRegex, '');

const localSpeakRegex = /function speak\(text\) \{\s*if \(\!speechSynth\) return;\s*speechSynth\.cancel\(\);[\s\S]*?speechSynth\.speak\(utter\);\s*\}/m;

const newSpeak = `async function speak(text) {
    if (!speechSynth) return;
    if (speechSynth.speaking) speechSynth.cancel();
    if (window.currentVidyaAudio) {
      window.currentVidyaAudio.pause();
      window.currentVidyaAudio = null;
    }
    const cleaned = text.replace(/[*_#\`]/g, "");
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

code = code.replace(localSpeakRegex, newSpeak);
fs.writeFileSync('public/app.js', code);
console.log('Fixed speak function location');
