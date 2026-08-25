const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Recover fee extraction logic
const missingFeeLogic = `
      checkedFeeBoxes.forEach(cb => {
        const label = (cb.dataset.label || "").trim();
        const baseAmt = parseFloat(cb.value) || 0;
        const isMonthly = label.toLowerCase().includes("tuition") || (cb.dataset.term || "").toLowerCase().includes("monthly");
        const amt = isMonthly ? baseAmt * monthCount : baseAmt;
        const fieldKey = FEE_LABEL_MAP[label.toLowerCase()] || "otherFee";
        feeAccum[fieldKey] = (feeAccum[fieldKey] || 0) + amt;
      });
      Object.entries(feeAccum).forEach(([k, v]) => { payload[k] = String(v); });
      payload.feeTypes = checkedFeeBoxes.map(cb => cb.dataset.label || "School Fee").join(", ");
      const paid  = parseFloat(payload.paidAmount) || 0;`;

const badPoint = `      const monthCount = Math.max(1, checkedMonths.length);
      payload.month = checkedMonths.join(", ");
          const rowPayload = { ...payload };`;

const goodPoint = `      const monthCount = Math.max(1, checkedMonths.length);
      payload.month = checkedMonths.join(", ");` + missingFeeLogic + `
          const rowPayload = { ...payload };`;

if (code.includes(badPoint)) {
  code = code.replace(badPoint, goodPoint);
  console.log("Restored fee extraction logic.");
}

// 2. Add student save automation
// Find the exact block
const studentBlock = `    } else if (isEditingStudent) {
      await api(\`/api/modules/students/\${editStudentId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editStudentId = null;
    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

const patchedStudentBlock = studentBlock + `

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

if (code.includes(studentBlock) && !code.includes('className: payload.className,')) {
  code = code.replace(studentBlock, patchedStudentBlock);
  console.log("Patched students monthly fee automation.");
}

fs.writeFileSync('public/app.js', code);
