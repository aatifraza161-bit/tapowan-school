const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Update both studentOptions mappings
const opt1Old = `      className: s.className || "",
      parentName: s.parentName || "",
      admissionNo: s.admissionNo || ""`;
const opt1New = `      className: s.className || "",
      parentName: s.parentName || s.fatherName || "",
      fatherName: s.fatherName || s.parentName || "",
      admissionNo: s.admissionNo || ""`;
code = code.split(opt1Old).join(opt1New);

// 2. Update tomselect onChange
const tomOld = `                        if (s) {
                            if (formRefs.className) formRefs.className.value = s.className || "";
                            if (formRefs.rollNo) formRefs.rollNo.value = s.rollNo || "";
                            if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
                        }`;
const tomNew = `                        if (s) {
                            if (formRefs.className) formRefs.className.value = s.className || "";
                            if (formRefs.rollNo) formRefs.rollNo.value = s.rollNo || "";
                            if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
                            if (formRefs.fatherName) formRefs.fatherName.value = s.fatherName || s.parentName || "";
                        }`;
code = code.split(tomOld).join(tomNew);

// 3. Update fallback addEventListener
const evOld = `            if (s) {
                if (formRefs.className) formRefs.className.value = s.className || "";
                if (formRefs.rollNo) formRefs.rollNo.value = s.rollNo || "";
                if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
            }`;
const evNew = `            if (s) {
                if (formRefs.className) formRefs.className.value = s.className || "";
                if (formRefs.rollNo) formRefs.rollNo.value = s.rollNo || "";
                if (formRefs.admissionNo) formRefs.admissionNo.value = s.admissionNo || "";
                if (formRefs.fatherName) formRefs.fatherName.value = s.fatherName || s.parentName || "";
            }`;
code = code.split(evOld).join(evNew);

fs.writeFileSync('public/app.js', code);
console.log("Patched fatherName autofill");
