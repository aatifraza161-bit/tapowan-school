const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Update studentOptions to map fatherName correctly.
// The regex finds all instances of `parentName: s.parentName || "",` and adds fatherName below it.
code = code.replace(/parentName:\s*s\.parentName\s*\|\|\s*"",/g, 'parentName: s.parentName || s.fatherName || "",\n      fatherName: s.fatherName || s.parentName || "",');

// 2. Update tomselect and event listener onChange blocks.
// We look for: if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
code = code.replace(/if\s*\(\s*formRefs\.admissionNo\s*\)\s*formRefs\.admissionNo\.value\s*=\s*s\.admissionNo\s*\|\|\s*"";/g, 'if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";\n                            if (formRefs.fatherName) formRefs.fatherName.value = s.fatherName || s.parentName || "";');

fs.writeFileSync('public/app.js', code);
console.log("Patched fatherName autofill correctly");
