const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Remove the broken duplicate `runSmartTimetableGeneration`
code = code.replace(/function runSmartTimetableGeneration\(\) \{\s*const startTimeStr = document\.getElementById\("st_startTime"\)\.value;[\s\S]*?document\.getElementById\("smartTimetableModal"\)\.remove\(\);\s*\}/, '');

// 2. Add lunch variables to the real `runSmartTimetableGeneration`
code = code.replace(/const extraDur = parseInt\(document\.getElementById\("st_extraDuration"\)\.value\) \|\| 10;\s*const mathSciDur = normalDur \+ extraDur;/, 'const extraDur = parseInt(document.getElementById("st_extraDuration").value) || 10;\n  const lunchDur = parseInt(document.getElementById("st_lunchDuration").value) || 20;\n  const lunchAfter = parseInt(document.getElementById("st_lunchAfter").value) || 4;\n  const mathSciDur = normalDur + extraDur;');

fs.writeFileSync('public/app.js', code);
