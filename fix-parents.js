const xlsx = require('xlsx');
const os = require('os');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const excelPath = 'C:\\Users\\Admin\\Desktop\\School Work\\Apaar data\\Students_APAAR_Status_Report_TAPOWAN PUBLIC SCHOOL PREM NAGAR_20241202412 16-07-2026 11-44-07 AM .xlsx';
const workbook = xlsx.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = xlsx.utils.sheet_to_json(sheet, {header: 1}).slice(5);

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'school-management-system', 'school.db');
const db = new sqlite3.Database(dbPath);

console.log("Loading students from DB...");

db.get("SELECT value FROM modules WHERE key = 'students'", (err, row) => {
  if (err) {
    console.error("DB Error:", err);
    return;
  }
  if (!row) {
    console.log("No students module found.");
    return;
  }

  let students = JSON.parse(row.value);
  let updatedCount = 0;

  const isInvalid = (name) => {
    if (!name) return true;
    const lower = name.toLowerCase().trim();
    return ['00', '000', 'nil', '0', 'na', 'n/a'].includes(lower);
  };

  const excelStudents = {};
  for (const r of excelData) {
    if (r && r[2]) {
      const studentName = r[2].toString().toUpperCase().trim();
      excelStudents[studentName] = {
        father: r[5] ? r[5].toString().trim() : '',
        mother: r[6] ? r[6].toString().trim() : ''
      };
    }
  }

  for (let s of students) {
    if (!s.fullName) continue;
    
    let needsUpdate = false;
    if (isInvalid(s.fatherName)) needsUpdate = true;
    if (isInvalid(s.motherName)) needsUpdate = true;
    if (s.parentName && isInvalid(s.parentName)) needsUpdate = true;

    if (needsUpdate) {
      const sName = s.fullName.toUpperCase().trim();
      const excelMatch = excelStudents[sName];
      
      if (excelMatch) {
        const oldF = s.fatherName || '';
        const oldM = s.motherName || '';
        
        let didUpdate = false;
        if (isInvalid(oldF) && excelMatch.father && !isInvalid(excelMatch.father)) {
          s.fatherName = excelMatch.father;
          didUpdate = true;
        }
        if (isInvalid(oldM) && excelMatch.mother && !isInvalid(excelMatch.mother)) {
          s.motherName = excelMatch.mother;
          didUpdate = true;
        }
        if (s.parentName && isInvalid(s.parentName) && excelMatch.father && !isInvalid(excelMatch.father)) {
          s.parentName = excelMatch.father; 
          didUpdate = true;
        }
        
        if (didUpdate) {
          console.log(`Updated ${s.fullName}: Father(${oldF} -> ${s.fatherName}), Mother(${oldM} -> ${s.motherName})`);
          updatedCount++;
        }
      } else {
        // console.log(`Needs update but not found in Excel: ${s.fullName} (Father: ${s.fatherName}, Mother: ${s.motherName})`);
      }
    }
  }

  if (updatedCount > 0) {
    db.run("UPDATE modules SET value = ? WHERE key = 'students'", [JSON.stringify(students)], function(err) {
      if (err) {
        console.error("Update Error:", err);
      } else {
        console.log(`Successfully updated ${updatedCount} students and saved to DB.`);
      }
    });
  } else {
    console.log("No students needed updating or no matches found in Excel.");
  }
});
