const fs = require('fs');
const backupCode = fs.readFileSync('../../TapowanPublicSchool-fixed/public/app.js', 'utf8');

console.log('Length:', backupCode.length);
console.log('Has fees:', backupCode.includes('activeStudentProfileTab === "fees"'));

const startIdx = backupCode.indexOf('if (activeStudentProfileTab === "fees") {');
console.log('startIdx:', startIdx);

const endIdx = backupCode.indexOf('function renderAnalyticsCharts');
console.log('endIdx (renderAnalyticsCharts):', endIdx);

const endIdx2 = backupCode.indexOf('function renderStatsCards');
console.log('endIdx2 (renderStatsCards):', endIdx2);

console.log('Has grid display:', backupCode.includes('grid.style.display'));
