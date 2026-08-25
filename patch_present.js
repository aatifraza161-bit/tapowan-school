const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const target1 = '"Student Present Today": (store.attendance || []).filter(x => String(x.status).toLowerCase() === "present").length,';
const target2 = '"Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present").length,';

const rep1 = '"Student Present Today": (store.attendance || []).filter(x => String(x.status).toLowerCase() === "present" && x.date === today).length,';
const rep2 = '"Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present" && x.date === today).length,';

if (code.includes(target1) && code.includes(target2)) {
  code = code.replace(target1, rep1).replace(target2, rep2);
  fs.writeFileSync('public/app.js', code);
  console.log("Fixed Present Today stats!");
} else {
  console.log("Could not find the target lines.");
}
