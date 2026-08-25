const os = require('os');
const path = require('path');
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Tapowan Public School System', 'school.db');
const db = require('better-sqlite3')(dbPath);
const data = db.prepare("SELECT value FROM modules WHERE key = 'students'").get();
const students = JSON.parse(data.value);
const ifsha = students.find(s => s.fullName && s.fullName.toUpperCase().includes('IFSHA'));
console.log(JSON.stringify(ifsha, null, 2));
