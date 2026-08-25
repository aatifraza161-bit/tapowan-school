const Database = require("better-sqlite3");
const db = new Database("C:\\Users\\Admin\\AppData\\Roaming\\school-management-system\\school.db");
const rows = db.prepare("SELECT admissionNo, rollNo, className, fullName FROM students WHERE className IN ('VII-A', 'V-A', 'III-A') AND fullName IN ('ALIMA PERWEEN', 'YASH RAJ', 'KRITIGYA TOPPO')").all();
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
