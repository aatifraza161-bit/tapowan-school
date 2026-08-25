const db = require('better-sqlite3')('database.db');
const results = db.prepare("SELECT * FROM students WHERE fullName LIKE '%TRISHA%'").all();
console.log(results);
