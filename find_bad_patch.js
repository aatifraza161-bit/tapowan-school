const fs = require('fs');
const readline = require('readline');

async function findBadPatch() {
  const logPath = 'C:/Users/Admin/.gemini/antigravity/brain/56d0e535-9a94-42a0-bfd5-5259afa3e890/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let out = [];
  
  for await (const line of rl) {
    if (line.includes('replace_file_content') && line.includes('app.js')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const tc of obj.tool_calls) {
            if (tc.function.name === 'replace_file_content' || tc.function.name === 'default_api:replace_file_content') {
              const args = tc.function.arguments;
              if (args) {
                let parsed = typeof args === 'string' ? JSON.parse(args) : args;
                if (parsed.TargetFile && parsed.TargetFile.includes('app.js')) {
                  out.push("Found patch!");
                  out.push("Target: " + parsed.TargetContent);
                  out.push("Replacement: " + parsed.ReplacementContent);
                  out.push("---------------------");
                }
              }
            }
          }
        }
      } catch (e) {}
    }
  }
  fs.writeFileSync('bad_patches.txt', out.join('\\n'), 'utf8');
}

findBadPatch();
