const fs = require('fs');

const logPath = 'C:/Users/Admin/.gemini/antigravity/brain/56d0e535-9a94-42a0-bfd5-5259afa3e890/.system_generated/logs/transcript.jsonl';
const logData = fs.readFileSync(logPath, 'utf8');
const lines = logData.split('\\n');

let found = false;
let out = [];

for (const line of lines) {
  if (line.includes('replace_file_content') || line.includes('TargetContent')) {
    try {
      const obj = JSON.parse(line);
      // We look inside obj for the original target content that was replaced
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.function && tc.function.arguments) {
            const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
            if (args.TargetContent && args.TargetContent.includes('rowArr.push')) {
              out.push("FOUND IN TARGET CONTENT:");
              out.push(args.TargetContent);
              found = true;
            }
          }
        }
      }
    } catch(e) {}
  }
}

if (!found) {
  out.push("Did not find the deleted block in TargetContent.");
}

fs.writeFileSync('C:/Users/Admin/Desktop/My Project/Slip & Receipt/All fixed/TapowanPublicSchool-fixed/recovery_search.txt', out.join('\\n'));
