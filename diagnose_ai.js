const fs = require('fs');
const path = require('path');

// 1. Check .env for API keys
console.log("=== .env API Key Check ===");
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const lines = env.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key] = trimmed.split('=');
    const val = trimmed.slice(key.length + 1).trim();
    if (key.includes('API_KEY') || key.includes('GEMINI') || key.includes('OPENAI') || key.includes('OPENROUTER') || key.includes('DEEPGRAM')) {
      console.log(`  ${key} = ${val ? '***SET*** (length: ' + val.length + ')' : 'EMPTY/MISSING'}`);
    }
  }
} else {
  console.log("  NO .env FILE FOUND!");
}

// 2. Check getApiBaseUrl function in app.js
console.log("\n=== getApiBaseUrl in app.js ===");
const appJs = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
const match = appJs.match(/function getApiBaseUrl[\s\S]*?^}/m);
if (match) {
  console.log(match[0]);
} else {
  // Try finding it differently
  const lines = appJs.split('\n');
  const idx = lines.findIndex(l => l.includes('function getApiBaseUrl'));
  if (idx >= 0) {
    console.log(lines.slice(idx, idx + 12).join('\n'));
  } else {
    console.log("  Could not find getApiBaseUrl function!");
  }
}

// 3. Check how API_BASE_URL is used
console.log("\n=== API_BASE_URL references ===");
const appLines = appJs.split('\n');
for (let i = 0; i < appLines.length; i++) {
  if (appLines[i].includes('API_BASE_URL') && !appLines[i].trim().startsWith('//')) {
    console.log(`  Line ${i+1}: ${appLines[i].trim()}`);
  }
}

// 4. Check sendMessage catch block
console.log("\n=== sendMessage catch block ===");
const sendIdx = appLines.findIndex(l => l.includes('async function sendMessage'));
if (sendIdx >= 0) {
  console.log(appLines.slice(sendIdx, sendIdx + 35).join('\n'));
}
