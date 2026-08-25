const fs = require('fs');

function fixApp() {
  let code = fs.readFileSync('public/app.js', 'utf8');

  // Fix 1: The broken alert string at line 5333
  // It starts at "window.alert('dY" Camera requires HTTPS on mobile!..." 
  // and ends with "for (let i = 0; i < sortedMonths.length; i++) {"
  // We need to replace that entire broken block with the correct alert.
  
  const badAlertStart = \`window.alert('dY"\\uFFFD Camera requires HTTPS on mobile!\\n\\nUse this URL instead:\\nhttps://' + location.hostname + ':3443\\n\\n      payload.month = checkedMonths.join(", ");\`;
  
  let lines = code.split('\\n');
  let newLines = [];
  let skip = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (!skip && lines[i].includes('Camera requires HTTPS on mobile!')) {
      skip = true;
      newLines.push(\`        window.alert('📷 Camera requires HTTPS on mobile!\\n\\nUse this URL instead:\\nhttps://' + location.hostname + ':3443\\n\\n(or configure your device to allow HTTP)');\`);
      continue;
    }
    
    if (skip) {
      if (lines[i].includes('for (let i = 0; i < sortedMonths.length; i++) {')) {
        skip = false;
      }
      continue;
    }
    
    newLines.push(lines[i]);
  }
  
  code = newLines.join('\\n');
  
  // Fix 2: Now we fix the actual missing loop at line 6710+
  lines = code.split('\\n');
  let targetIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('payload.month = checkedMonths.join(", ");')) {
      targetIdx = i;
      break;
    }
  }

  if (targetIdx !== -1) {
    const loopMissingContent = \`      payload.month = checkedMonths.join(", ");

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

        for (let i = 0; i < sortedMonths.length; i++) {\`;
        
    lines[targetIdx] = loopMissingContent;
  }
  
  // Fix 3: And we also need to close the loop!
  // Wait, did we ever delete the closing braces?
  // Let's just output the code and we'll check syntax.
  
  fs.writeFileSync('public/app.js', lines.join('\\n'), 'utf8');
  console.log("Applied mega_fix!");
}

fixApp();
