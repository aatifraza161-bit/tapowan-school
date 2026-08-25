const fs = require('fs');

function fixApp() {
  let code = fs.readFileSync('public/app.js', 'utf8');

  let lines = code.split('\\n');
  let newLines = [];
  let skip = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (!skip && lines[i].includes('Camera requires HTTPS on mobile!')) {
      skip = true;
      newLines.push("        window.alert('📷 Camera requires HTTPS on mobile!\\n\\nUse this URL instead:\\nhttps://' + location.hostname + ':3443\\n\\n(or configure your device to allow HTTP)');");
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
  
  lines = code.split('\\n');
  let targetIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('payload.month = checkedMonths.join(", ");')) {
      targetIdx = i;
      break;
    }
  }

  if (targetIdx !== -1) {
    const loopMissingContent = "      payload.month = checkedMonths.join(\\", \\");\\n\\n" +
      "      checkedFeeBoxes.forEach(cb => {\\n" +
      "        const label = (cb.dataset.label || \\"\\").trim();\\n" +
      "        const baseAmt = parseFloat(cb.value) || 0;\\n" +
      "        const isMonthly = label.toLowerCase().includes(\\"tuition\\") || (cb.dataset.term || \\"\\").toLowerCase().includes(\\"monthly\\");\\n" +
      "        const amt = isMonthly ? baseAmt * monthCount : baseAmt;\\n" +
      "        const fieldKey = FEE_LABEL_MAP[label.toLowerCase()] || \\"otherFee\\";\\n" +
      "        feeAccum[fieldKey] = (feeAccum[fieldKey] || 0) + amt;\\n" +
      "      });\\n" +
      "      Object.entries(feeAccum).forEach(([k, v]) => { payload[k] = String(v); });\\n" +
      "      payload.feeTypes = checkedFeeBoxes.map(cb => cb.dataset.label || \\"School Fee\\").join(\\", \\");\\n\\n" +
      "      const selectedItems = [];\\n" +
      "      formEl.querySelectorAll(\\".bd-item-checkbox:checked\\").forEach(cb => {\\n" +
      "        selectedItems.push({ id: cb.dataset.id, price: parseFloat(cb.dataset.price || 0) || 0 });\\n" +
      "      });\\n" +
      "      payload.selectedBookIds = JSON.stringify(selectedItems.map(i => i.id));\\n\\n" +
      "      const totalFeeInput = formEl.querySelector(\\"[name='totalFee']\\");\\n" +
      "      const balanceInput  = formEl.querySelector(\\"[name='balance']\\");\\n" +
      "      if (totalFeeInput) payload.totalFee = totalFeeInput.value || \\"0\\";\\n" +
      "      if (balanceInput)  payload.balance  = balanceInput.value  || \\"0\\";\\n\\n" +
      "      const total = parseFloat(payload.totalFee) || 0;\\n" +
      "      const paid  = parseFloat(payload.paidAmount) || 0;\\n" +
      "      const bal   = total - paid;\\n" +
      "      payload.balance = String(Math.max(0, bal));\\n" +
      "      payload.status  = bal <= 0 ? \\"Paid\\" : paid > 0 ? \\"Partial\\" : \\"Pending\\";\\n\\n" +
      "      // ── AUTO-SPLIT LOGIC for Fees Module ──\\n" +
      "      if (checkedMonths.length > 1) {\\n" +
      "        const academicOrder = [\\"Apr\\", \\"May\\", \\"Jun\\", \\"Jul\\", \\"Aug\\", \\"Sep\\", \\"Oct\\", \\"Nov\\", \\"Dec\\", \\"Jan\\", \\"Feb\\", \\"Mar\\"];\\n" +
      "        const sortedMonths = checkedMonths.slice().sort((a,b) => academicOrder.indexOf(a) - academicOrder.indexOf(b));\\n" +
      "        let totalPaidRemaining = parseFloat(payload.paidAmount) || 0;\\n\\n" +
      "        for (let i = 0; i < sortedMonths.length; i++) {";
        
    lines[targetIdx] = loopMissingContent;
  }
  
  fs.writeFileSync('public/app.js', lines.join('\\n'), 'utf8');
  console.log("Applied mega_fix3!");
}

fixApp();
