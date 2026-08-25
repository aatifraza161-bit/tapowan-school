const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const logPath = 'C:/Users/Admin/.gemini/antigravity/brain/56d0e535-9a94-42a0-bfd5-5259afa3e890/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let bestOriginal = "";
  let out = [];
  
  for await (const line of rl) {
    if (line.includes('rowArr.push(\\\\"Free\\\\n-\\\\")') || line.includes('rowArr.push("Free\\n-")')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const tc of obj.tool_calls) {
            if (tc.arguments && tc.arguments.TargetContent) {
              // we don't care about this
            }
          }
        }
        if (obj.content && obj.content.includes('rowArr.push("Free\\n-")')) {
           bestOriginal = obj.content;
        }
      } catch (e) {}
    }
  }
  fs.writeFileSync('transcript_search.txt', bestOriginal.substring(0, 5000), 'utf8');
}

searchTranscript();
