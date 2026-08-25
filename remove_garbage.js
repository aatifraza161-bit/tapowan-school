const fs = require('fs');
const backupCode = fs.readFileSync('../../TapowanPublicSchool-fixed/public/app.js', 'utf8');
let currentCode = fs.readFileSync('public/app.js', 'utf8');

const startIdx = backupCode.indexOf('if (activeStudentProfileTab === "fees") {');
// missingCode in restore_final.js was: backupCode.substring(startIdx, -1) which equals backupCode.substring(0, startIdx)
const garbageCode = backupCode.substring(0, startIdx);

console.log('Garbage length:', garbageCode.length);

if (currentCode.includes(garbageCode)) {
    console.log('Garbage code found! Removing...');
    currentCode = currentCode.replace(garbageCode, '');
    fs.writeFileSync('public/app.js', currentCode);
    console.log('Garbage code removed successfully!');
} else {
    console.log('Garbage code NOT found directly! Maybe it was modified?');
}
