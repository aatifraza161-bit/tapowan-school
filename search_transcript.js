const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const logPath = 'C:/Users/Admin/.gemini/antigravity/brain/56d0e535-9a94-42a0-bfd5-5259afa3e890/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let out = [];
  for await (const line of rl) {
    if (line.includes('rowArr.push("Free')) {
      out.push("Found 'Free' in transcript!");
      out.push(line.substring(0, 500));
    }
  }
  fs.writeFileSync('transcript_search.txt', out.join('\\n'), 'utf8');
}

searchTranscript();
