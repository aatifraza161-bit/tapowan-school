const xlsx = require('xlsx');
const fs = require('fs');

const excelPath = 'C:\\Users\\Admin\\Desktop\\School Work\\Apaar data\\Students_APAAR_Status_Report_TAPOWAN PUBLIC SCHOOL PREM NAGAR_20241202412 16-07-2026 11-44-07 AM .xlsx';
const workbook = xlsx.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = xlsx.utils.sheet_to_json(sheet, {header: 1}).slice(5);

const excelStudents = {};
for (const row of excelData) {
  if (row && row[2]) {
    const studentName = row[2].toString().toUpperCase().trim();
    excelStudents[studentName] = {
      father: row[5] ? row[5].toString().trim() : '',
      mother: row[6] ? row[6].toString().trim() : ''
    };
  }
}

fs.writeFileSync('excel_parents.json', JSON.stringify(excelStudents, null, 2));
console.log("Exported excel_parents.json successfully.");
