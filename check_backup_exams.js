const fs = require('fs');
const backupCode = fs.readFileSync('../../TapowanPublicSchool-fixed/public/app.js', 'utf8');
const lines = backupCode.split('\n');

const examsIdx = lines.findIndex(l => l.includes('activeStudentProfileTab === "exams"'));
console.log('Exams tab starts at line:', examsIdx);

if (examsIdx !== -1) {
    console.log(lines.slice(examsIdx, examsIdx + 50).join('\n'));
}
