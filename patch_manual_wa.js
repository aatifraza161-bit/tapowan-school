const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const addRecordOld = `  if (moduleName === "users") {
    if (!record.password) record.password = "welcome123";
    if (!record.lastLogin) record.lastLogin = nowStr();
    if (!record.status) record.status = "Active";
  }
  await api(\`/api/modules/\${moduleName}\`, { method: "POST", body: JSON.stringify(record) });
  await loadStore();
}`;

const addRecordNew = `  if (moduleName === "users") {
    if (!record.password) record.password = "welcome123";
    if (!record.lastLogin) record.lastLogin = nowStr();
    if (!record.status) record.status = "Active";
  }
  await api(\`/api/modules/\${moduleName}\`, { method: "POST", body: JSON.stringify(record) });
  
  // Hook manual attendance creation into WhatsApp alerts
  if (moduleName === "attendance" && typeof sendAttendanceWhatsApp === 'function') {
    if (record.arrivalTime) sendAttendanceWhatsApp(record.studentName, true, record.arrivalTime);
    else if (record.departureTime) sendAttendanceWhatsApp(record.studentName, false, record.departureTime);
  }
  
  await loadStore();
}`;

code = code.replace(addRecordOld, addRecordNew);


const editRecordOld = `    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

const editRecordNew = `    } else if (editRecordId != null) {
      await api(\`/api/modules/\${currentModule}/\${editRecordId}\`, { method: "PUT", body: JSON.stringify(payload) });
      if (currentModule === "attendance" && typeof sendAttendanceWhatsApp === 'function') {
        if (payload.arrivalTime) sendAttendanceWhatsApp(payload.studentName, true, payload.arrivalTime);
        else if (payload.departureTime) sendAttendanceWhatsApp(payload.studentName, false, payload.departureTime);
      }
      editRecordId = null;
    } else {
      await addRecord(currentModule, payload);
    }`;

code = code.replace(editRecordOld, editRecordNew);

fs.writeFileSync('public/app.js', code);
console.log('Patched manual attendance UI for WA alerts.');
