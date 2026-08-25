const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const targetOld = `    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

const targetNew = `    } else if (editRecordId != null) {
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

const idx = code.indexOf(targetOld);
if (idx !== -1) {
    code = code.substring(0, idx) + targetNew + code.substring(idx + targetOld.length);
    fs.writeFileSync('public/app.js', code);
    console.log("Patched students saveRecord");
} else {
    // try a more generic approach if spaces are different
    console.log("Target not found exactly. Searching...");
    // Let's replace the last 'await addRecord(currentModule, payload);' inside the refs.dynamicForm.addEventListener
    const submitStart = code.indexOf('refs.dynamicForm.addEventListener("submit"');
    const submitEnd = code.indexOf('e.target.reset();', submitStart);
    let submitBlock = code.substring(submitStart, submitEnd);
    
    const addRecordOld = `} else {
      await addRecord(currentModule, payload);
    }`;
    const addRecordNew = `} else {
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
    
    // Replace the LAST occurrence in this block
    const lastIdx = submitBlock.lastIndexOf(addRecordOld);
    if (lastIdx !== -1) {
        submitBlock = submitBlock.substring(0, lastIdx) + addRecordNew + submitBlock.substring(lastIdx + addRecordOld.length);
        code = code.substring(0, submitStart) + submitBlock + code.substring(submitEnd);
        fs.writeFileSync('public/app.js', code);
        console.log("Patched students saveRecord via fallback");
    } else {
        console.log("Fallback also failed");
    }
}
