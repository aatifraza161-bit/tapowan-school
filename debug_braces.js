const fs = require('fs');
const code = fs.readFileSync('public/app.js', 'utf8');

let depth = 0;
let lines = code.split('\\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
  if (i > 6650 && i < 6850) {
    console.log(`Line ${i + 1} (${depth}): ${line}`);
  }
}
console.log("Final depth:", depth);
