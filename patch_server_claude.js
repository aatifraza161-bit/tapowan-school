const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const claudeFunction = `
// ── Provider 4: Claude (via OpenRouter) ──
async function tryClaude(prompt, systemInstruction) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw Object.assign(new Error("OpenRouter not configured"), { status: 503 });

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${key}\`,
      "HTTP-Referer": "https://tapowanpublicschool.com",
      "X-Title": "Tapowan AI Vidya"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    })
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw Object.assign(new Error(errData.error?.message || \`Claude error \${resp.status}\`), { status: resp.status });
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Claude");
  return { reply: text, provider: "Claude 3.5" };
}
`;

if (!code.includes('tryClaude')) {
    code = code.replace('const multer = require(\'multer\');', claudeFunction + '\nconst multer = require(\'multer\');');
    
    // Add to providerFuncs
    code = code.replace(
        '{ name: "OpenRouter", func: tryOpenRouter }',
        '{ name: "OpenRouter", func: tryOpenRouter },\n      { name: "Claude", func: tryClaude }'
    );
    fs.writeFileSync('server.js', code);
    console.log("Claude backend added");
} else {
    console.log("Claude backend already exists");
}
