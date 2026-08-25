const fs = require('fs');

const logPath = 'C:/Users/Admin/.gemini/antigravity/brain/56d0e535-9a94-42a0-bfd5-5259afa3e890/.system_generated/logs/transcript.jsonl';
const logData = fs.readFileSync(logPath, 'utf8');
const lines = logData.split('\\n');

let out = [];

for (const line of lines) {
  if (line.includes('replace_file_content')) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.function && tc.function.arguments) {
            const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
            if (args.TargetContent) {
              const linesCount = args.TargetContent.split('\\n').length;
              if (linesCount > 1000) {
                 out.push("Found massive TargetContent! Lines: " + linesCount);
                 fs.writeFileSync('C:/Users/Admin/Desktop/My Project/Slip & Receipt/All fixed/TapowanPublicSchool-fixed/massive_target.txt', args.TargetContent);
                 out.push("Saved to massive_target.txt");
              }
            }
          }
        }
      }
    } catch(e) {}
  }
}

fs.writeFileSync('C:/Users/Admin/Desktop/My Project/Slip & Receipt/All fixed/TapowanPublicSchool-fixed/recovery_search.txt', out.join('\\n'));
