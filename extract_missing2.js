const fs = require('fs');

const tempCode = fs.readFileSync('temp_extract/public/app.js', 'utf8');
const tempLines = tempCode.split('\\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < tempLines.length; i++) {
  if (tempLines[i].includes('rowArr.push("Free')) {
    startIdx = i;
  }
  if (tempLines[i].includes("Please ensure you are importing into the correct module.`)) {")) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  console.log("Found from line " + startIdx + " to " + endIdx);
  const missingBlock = tempLines.slice(startIdx, endIdx + 1).join('\\n');
  fs.writeFileSync('missing_block.txt', missingBlock, 'utf8');
} else {
  console.log("Could not find start or end bounds.");
  console.log("Start:", startIdx, "End:", endIdx);
}
