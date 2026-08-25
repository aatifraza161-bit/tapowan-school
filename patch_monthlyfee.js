const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const submitAdmissionOld = `    const res = await api("/api/modules/admissions", { method: "POST", body: JSON.stringify(payload) });
    hideLoader();`;

const submitAdmissionNew = `    const res = await api("/api/modules/admissions", { method: "POST", body: JSON.stringify(payload) });
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
    }
    hideLoader();`;

if (code.includes(submitAdmissionOld)) {
  code = code.replace(submitAdmissionOld, submitAdmissionNew);
} else {
  console.log("Could not find submitAdmission block");
}

const saveRecordEndOld = `    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

const saveRecordEndNew = `    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
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

if (code.includes(saveRecordEndOld)) {
  code = code.replace(saveRecordEndOld, saveRecordEndNew);
} else {
  console.log("Could not find saveRecord block");
}

fs.writeFileSync('public/app.js', code);
console.log("Patch complete.");
