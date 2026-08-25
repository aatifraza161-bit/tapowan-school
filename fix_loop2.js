const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');
let lines = code.split('\\n');

let targetIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('payload.month = checkedMonths.join(", ");')) {
    targetIdx = i;
    break;
  }
}

if (targetIdx !== -1) {
  const replacement = `      payload.month = checkedMonths.join(", ");

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

        for (let i = 0; i < sortedMonths.length; i++) {`;
        
  lines[targetIdx] = replacement;
  fs.writeFileSync('public/app.js', lines.join('\\n'));
  console.log("Fixed!");
} else {
  console.log("Not found.");
}
