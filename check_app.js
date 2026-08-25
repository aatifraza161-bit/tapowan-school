const fs = require('fs');
const lines = fs.readFileSync('public/app.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('activeStudentProfileTab === "exams"'));
console.log('Exams tab starts at line:', idx);
if (idx !== -1) {
    console.log(lines.slice(idx, idx + 150).join('\n'));
}

const renderStatsIdx = lines.findIndex(l => l.includes('function renderStatsCards'));
console.log('renderStatsCards at line:', renderStatsIdx);
