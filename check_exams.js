const fs = require('fs');
const lines = fs.readFileSync('public/app.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('activeStudentProfileTab === "exams"'));
if(idx > -1) {
  console.log(lines.slice(idx, idx+60).join('\n'));
} else {
  console.log("Not found!");
}
