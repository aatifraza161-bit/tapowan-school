const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const badCode = `      Object.entries(feeAccum).forEach(([k, v]) => { payload[k] = String(v); });
      payload.feeTypes = checkedFeeBoxes.map(cb => cb.dataset.label || "School Fee").join(", ");
      const paid  = parseFloat(payload.paidAmount) || 0;`;

const goodCode = `      Object.entries(feeAccum).forEach(([k, v]) => { payload[k] = String(v); });
      payload.feeTypes = checkedFeeBoxes.map(cb => cb.dataset.label || "School Fee").join(", ");

      const selectedItems = [];
      formEl.querySelectorAll(".bd-item-checkbox:checked").forEach(cb => {
        selectedItems.push({ id: cb.dataset.id, price: parseFloat(cb.dataset.price || 0) || 0 });
      });
      payload.selectedBookIds = JSON.stringify(selectedItems.map(i => i.id));

      const totalFeeInput = formEl.querySelector("[name='totalFee']");
      const balanceInput  = formEl.querySelector("[name='balance']");
      if (totalFeeInput) payload.totalFee = totalFeeInput.value || "0";
      if (balanceInput)  payload.balance  = balanceInput.value  || "0";

      const total = parseFloat(payload.totalFee) || 0;
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
          const m = sortedMonths[i];`;

if (code.includes(badCode)) {
  code = code.replace(badCode, goodCode);
  console.log("Fixed the deleted fee logic.");
} else {
  console.log("Could not find the bad fee logic block.");
}

// Now insert the tuition fee logic in saveRecord
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

// Since there are multiple "await addRecord(currentModule, payload);", we need to make sure we replace the LAST one,
// or we use a more specific target block!
const specificOldBlock = `    } else if (isEditingStudent) {
      await api(\`/api/modules/students/\${editStudentId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editStudentId = null;
    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

const specificNewBlock = specificOldBlock + `

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

if (code.includes(specificOldBlock)) {
  code = code.replace(specificOldBlock, specificNewBlock);
  console.log("Patched students automation properly.");
} else {
  console.log("Could not find the specific old block for student saving.");
}

fs.writeFileSync('public/app.js', code);
