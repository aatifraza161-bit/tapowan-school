const fs = require('fs');
const lines = fs.readFileSync('public/app.js', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('function renderStudentProfile'));
const end = lines.findIndex(l => l.includes('Documents (Optional)'));
console.log(lines.slice(start, end).join('\n'));
