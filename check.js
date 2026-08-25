const db = require('better-sqlite3')('database.sqlite');
console.log('Fees:', db.prepare('SELECT * FROM fees WHERE admissionNo = "797"').all());
console.log('Dues:', db.prepare('SELECT * FROM dueManagement WHERE admissionNo = "797"').all());
