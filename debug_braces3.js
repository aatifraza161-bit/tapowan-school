const fs = require('fs');
const code = fs.readFileSync('public/app.js', 'utf8');

let depth = 0;
let lines = code.split('\\n');
let out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // naive block comment parsing isn't here, but usually fine
  // let's do a simple brace match
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
  if (i > 6640 && i < 6850) {
    out.push(`Line ${i + 1} (${depth}): ${line}`);
  }
}
fs.writeFileSync('braces_log.txt', out.join('\\n'), 'utf8');
