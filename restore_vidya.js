const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const targetStr = "'Core': ['admissions', 'dashboard', 'myProfile', 'students', 'teachers', 'classes']";
const replacementStr = "'Core': ['admissions', 'dashboard', 'aiAssistant', 'myProfile', 'students', 'teachers', 'classes']";

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('public/app.js', code);
console.log('Restored aiAssistant to Core NAV_GROUPS');
