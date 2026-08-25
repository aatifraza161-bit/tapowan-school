const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const originalSendFunc = `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
  // Self-contained: calls backend directly so it works even if WhatsApp tab has never been opened
  const store = typeof getStore === "function" ? getStore() : (window.store || {});
  if (!store || !store.students) { console.warn("WA Alert: Store not ready"); return; }
  const person = store.students.find(s => s.fullName === recognizedName);
  if (!person) { console.warn("WA Alert: Student not found:", recognizedName); return; }
  const rawPhone = person.phone || person.mobile || person.parentPhone || person.contactNo || "";
  if (!rawPhone) { console.warn("WA Alert: No phone for", recognizedName); return; }
  let p = String(rawPhone).replace(/\\D/g, "");
  if (p.length === 10) p = "91" + p;
  if (p.length === 11 && p.startsWith("0")) p = "91" + p.slice(1);
  if (!p || p.length < 10) { console.warn("WA Alert: Invalid phone number:", rawPhone); return; }
  const msg = isArrival
    ? \`\${person.fullName} Arrives at school at \${time}\`
    : \`\${person.fullName} leave from the school at \${time}\`;
  console.log("WA Alert: Sending to", p, ":", msg);
  try {
    const res = await api("/api/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ to: p, message: msg, attachment: null })
    });
    if (res && res.error) console.warn("WA Alert server error:", res.error);
    else console.log("WA Alert sent OK");
  } catch(e) { console.warn("WA Alert failed:", e.message); }
}`;

const newSendFunc = `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
  const store = typeof getStore === "function" ? getStore() : (window.store || {});
  if (!store || !store.students) { 
    console.warn("WA Alert: Store not ready");
    if (typeof showToast === 'function') showToast("⚠ WhatsApp Alert: Store not ready", "warn");
    return; 
  }
  const person = store.students.find(s => s.fullName === recognizedName);
  if (!person) { 
    console.warn("WA Alert: Student not found:", recognizedName);
    return; 
  }
  const rawPhone = person.phone || person.phone1 || person.phone2 || person.whatsapp || person.mobile || person.parentPhone || person.contactNo || "";
  if (!rawPhone) { 
    console.warn("WA Alert: No phone for", recognizedName);
    if (typeof showToast === 'function') showToast(\`⚠ No phone number saved for \${recognizedName}\`, "warn");
    return; 
  }
  let p = String(rawPhone).replace(/\\D/g, "");
  if (p.length === 10) p = "91" + p;
  if (p.length === 11 && p.startsWith("0")) p = "91" + p.slice(1);
  if (!p || p.length < 10) { 
    console.warn("WA Alert: Invalid phone number:", rawPhone);
    if (typeof showToast === 'function') showToast(\`⚠ Invalid phone number for \${recognizedName}: \${rawPhone}\`, "warn");
    return; 
  }
  const msg = isArrival
    ? \`\${person.fullName} Arrives at school at \${time}\`
    : \`\${person.fullName} leave from the school at \${time}\`;
  console.log("WA Alert: Sending to", p, ":", msg);
  try {
    const res = await api("/api/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ to: p, message: msg, attachment: null })
    });
    if (res && res.error) {
      console.warn("WA Alert server error:", res.error);
      if (typeof showToast === 'function') showToast("⚠ WhatsApp not connected. Please scan QR.", "warn");
    } else {
      console.log("WA Alert sent OK");
      if (typeof showToast === 'function') showToast(\`✅ WhatsApp sent to \${recognizedName}\`, "success");
    }
  } catch(e) { 
    console.warn("WA Alert failed:", e.message); 
    if (typeof showToast === 'function') showToast("❌ WhatsApp Alert failed: " + e.message, "error");
  }
}`;

code = code.replace(originalSendFunc, newSendFunc);


const autoCaptureStudentOld = `        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = refs.faceStatus.value;
        } else if (!existing.departureTime) {
          update.departureTime = nowTime;
        }
        await api(\`/api/modules/attendance/\${existing.id}\`, { method: "PUT", body: JSON.stringify(update) });`;

const autoCaptureStudentNew = `        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = refs.faceStatus.value;
          if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, true, nowTime);
        } else if (!existing.departureTime) {
          update.departureTime = nowTime;
          if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, false, nowTime);
        }
        await api(\`/api/modules/attendance/\${existing.id}\`, { method: "PUT", body: JSON.stringify(update) });`;

code = code.replace(autoCaptureStudentOld, autoCaptureStudentNew);

const autoCaptureNewStudentOld = `        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        await loadStore();`;

const autoCaptureNewStudentNew = `        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, true, nowTime);
        await loadStore();`;

code = code.replace(autoCaptureNewStudentOld, autoCaptureNewStudentNew);

fs.writeFileSync('public/app.js', code);
console.log('Patched public/app.js successfully!');
