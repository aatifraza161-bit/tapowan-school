const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const badCode = `      const total = parseFloat(payload.totalFee) || 0;
      const paid  = parseFloat(payload.paidAmount) || 0;
          const rowPayload = { ...payload };
          rowPayload.month = m;`;

const goodCode = `      const total = parseFloat(payload.totalFee) || 0;
      const paid  = parseFloat(payload.paidAmount) || 0;
      const bal   = total - paid;
      payload.balance = String(Math.max(0, bal));
      payload.status  = bal <= 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";

      // ── AUTO-SPLIT LOGIC for Fees Module ──
      if (checkedMonths.length > 1) {
        const academicOrder = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        const sortedMonths = checkedMonths.slice().sort((a,b) => academicOrder.indexOf(a) - academicOrder.indexOf(b));
        let totalPaidRemaining = parseFloat(payload.paidAmount) || 0;

        for (let i = 0; i < sortedMonths.length; i++) {
          const m = sortedMonths[i];
          const rowPayload = { ...payload };
          rowPayload.month = m;`;

if (code.includes(badCode)) {
  code = code.replace(badCode, goodCode);
  console.log("Fixed the mess.");
} else {
  console.log("Could not find bad code block.");
}

const addRecordOld = `    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

const addRecordNew = `    } else if (editRecordId != null) {
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
      } catch(e) {}
    }`;

if (code.includes(addRecordOld)) {
  code = code.replace(addRecordOld, addRecordNew);
  console.log("Patched automation logic properly.");
}

fs.writeFileSync('public/app.js', code);
