const Database = require('better-sqlite3');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

const dbPath = path.join(process.env.APPDATA, 'school-management-system', 'school.db');
const db = new Database(dbPath);

const students = db.prepare("SELECT admissionNo, rollNo, fullName, className, phone, fatherName, motherName FROM students WHERE photo IS NOT NULL AND photo != ''").all();

const data = students.map(s => ({
  'Admission No': s.admissionNo,
  'Roll No': s.rollNo,
  'Name': s.fullName,
  'Class': s.className,
  'Father Name': s.fatherName,
  'Mother Name': s.motherName,
  'Phone': s.phone,
  'Has Profile Photo': 'Yes'
}));

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, 'Students');

const outPath = path.join(process.env.USERPROFILE, 'Desktop', 'Students_With_Photos.xlsx');
xlsx.writeFile(wb, outPath);

fs.writeFileSync('export_log.txt', 'Exported to ' + outPath);
