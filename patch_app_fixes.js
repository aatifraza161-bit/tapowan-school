const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Add Claude Button
const oldToggle = `<div class="vidya-model-toggle" id="vidyaModelToggle">
      <button class="vidya-model-btn active" data-provider="auto">🧠 Auto</button>
      <button class="vidya-model-btn" data-provider="Gemini">♊ Gemini</button>
      <button class="vidya-model-btn" data-provider="OpenRouter">🚀 DeepSeek</button>
      <button class="vidya-model-btn" data-provider="OpenAI">🤖 OpenAI</button>
    </div>`;

const newToggle = `<div class="vidya-model-toggle" id="vidyaModelToggle" style="flex-wrap: wrap;">
      <button class="vidya-model-btn active" data-provider="auto">🧠 Auto</button>
      <button class="vidya-model-btn" data-provider="Gemini">♊ Gemini</button>
      <button class="vidya-model-btn" data-provider="Claude">🟣 Claude</button>
      <button class="vidya-model-btn" data-provider="OpenRouter">🚀 DeepSeek</button>
      <button class="vidya-model-btn" data-provider="OpenAI">🤖 OpenAI</button>
    </div>`;

if (code.includes('data-provider="OpenAI">🤖 OpenAI</button>')) {
   code = code.replace(oldToggle, newToggle);
   if (code.includes('data-provider="Claude"')) {
       console.log("Claude button added");
   } else {
       // fallback manual replacement if exact match failed
       code = code.replace('<button class="vidya-model-btn" data-provider="OpenRouter">🚀 DeepSeek</button>', '<button class="vidya-model-btn" data-provider="Claude">🟣 Claude</button>\n      <button class="vidya-model-btn" data-provider="OpenRouter">🚀 DeepSeek</button>');
       console.log("Claude button added via fallback");
   }
}

// 2. Fix the missing Authorization header in file upload
const oldUpload = `const res = await fetch("/api/ai/upload", {
          method: "POST",
          body: formData
        });`;

const newUpload = `const res = await fetch("/api/ai/upload", {
          method: "POST",
          headers: { "x-session-token": localStorage.getItem("token") },
          credentials: "include",
          body: formData
        });`;

if (code.includes('fetch("/api/ai/upload"')) {
    code = code.replace(oldUpload, newUpload);
    // fallback if spacing is slightly different
    if(!code.includes('credentials: "include"')) {
       code = code.replace('method: "POST",\r\n          body: formData', 'method: "POST",\r\n          headers: { "x-session-token": localStorage.getItem("token") },\r\n          credentials: "include",\r\n          body: formData');
    }
    console.log("Upload auth fixed");
}

fs.writeFileSync('public/app.js', code);
