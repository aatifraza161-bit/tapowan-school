const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Fix studentOptions mapped fields
const studentOptionsOld1 = `className: s.className || "",
      parentName: s.parentName || "",
      admissionNo: s.admissionNo || ""`;
const studentOptionsNew1 = `className: s.className || "",
      parentName: s.fatherName || s.parentName || "",
      fatherName: s.fatherName || s.parentName || "",
      admissionNo: s.admissionNo || ""`;
code = code.replaceAll(studentOptionsOld1, studentOptionsNew1);

// 2. Add Fee Structure Automation in saveRecord
const saveRecordEndOld = `} else {
      await addRecord(currentModule, payload);
    }`;
const saveRecordEndNew = `} else {
      await addRecord(currentModule, payload);
    }

    if (currentModule === "students" && payload.monthlyFee && Number(payload.monthlyFee) >= 0) {
      try {
        await api('/api/modules/feeStructures', { 
          method: "POST", 
          body: JSON.stringify({
            className: payload.className,
            studentName: payload.fullName,
            feeType: "Tuition Fee",
            amount: payload.monthlyFee,
            term: "Monthly"
          })
        });
        if (typeof loadFS === "function") await loadFS();
      } catch(e) {
        console.error("Auto fee structure failed", e);
      }
    }`;
// We only want to replace the exact one in the submit handler.
if (code.includes(saveRecordEndOld)) {
    // Replace the first occurrence which is in dynamicForm submit handler
    code = code.replace(saveRecordEndOld, saveRecordEndNew);
}

// 3. Add Fee Structure Automation in submitAdmission
const submitAdmissionOld = `const res = await api("/api/modules/admissions", { method: "POST", body: JSON.stringify(payload) });`;
const submitAdmissionNew = `const res = await api("/api/modules/admissions", { method: "POST", body: JSON.stringify(payload) });
    if (payload.monthlyFee && Number(payload.monthlyFee) >= 0) {
      try {
        await api('/api/modules/feeStructures', { 
          method: "POST", 
          body: JSON.stringify({
            className: payload.className,
            studentName: payload.fullName,
            feeType: "Tuition Fee",
            amount: payload.monthlyFee,
            term: "Monthly"
          })
        });
        if (typeof loadFS === "function") await loadFS();
      } catch(e) {}
    }`;
code = code.replace(submitAdmissionOld, submitAdmissionNew);


fs.writeFileSync('public/app.js', code);
console.log("Patched auto-fill and fee automation");
