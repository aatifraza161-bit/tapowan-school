const fs = require('fs');
const lines = fs.readFileSync('public/app.js', 'utf8').split('\n');
let count = 0;
for(let i=0; i<lines.length; i++) {
   if (lines[i].includes('activeStudentProfileTab === "exams"')) {
       console.log('Line ' + i + ': ' + lines[i]);
       count++;
   }
}
console.log('Total occurrences:', count);
