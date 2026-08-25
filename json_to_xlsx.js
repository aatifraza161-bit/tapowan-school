const xlsx = require('xlsx');
const fs = require('fs');

const missingData = JSON.parse(fs.readFileSync('missing_parents.json', 'utf8'));

const worksheet = xlsx.utils.json_to_sheet(missingData);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Missing Parents');

const outPath = 'C:\\\\Users\\\\Admin\\\\Desktop\\\\School Work\\\\Apaar data\\\\Missing_Parents_To_Fix.xlsx';
xlsx.writeFile(workbook, outPath);

console.log('Successfully generated ' + outPath);
