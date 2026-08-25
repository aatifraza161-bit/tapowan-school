const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Restore the deleted code block exactly
const restoreOld = `        department: resolvedDept,
        teacherName: recognizedName,
        status,
  const tn = String(teacherName ?? "").trim();
  const dept = String(department ?? "").trim();
  const d = String(date ?? "").trim();`;

const restoreNew = `        department: resolvedDept,
        teacherName: recognizedName,
        status,
        arrivalTime: nowTime,
        departureTime: "",
        remarks: "Face-recognized"
      };
      await api("/api/modules/teacherAttendance", { method: "POST", body: JSON.stringify(row) });
    }
  }
  
  await loadStore();
  const successMsg = \`✅ Attendance marked for \${recognizedName}.\`;
  refs.faceStatusText.textContent = successMsg;
  if (typeof showToast === 'function') showToast(successMsg, 'success');
  if (typeof addLiveLog === 'function') addLiveLog(recognizedName, best?.score || 0.9, status);

  renderAll();
  
  // Trigger Greeting with Role Check
  speakAttendanceGreeting([recognizedName], matchPrefix === "teachers");
}

function findExistingAttendanceRecord(store, studentName, className, date = todayStr()) {
  const sn = String(studentName ?? "").trim();
  const cn = String(className ?? "").trim();
  const d = String(date ?? "").trim();
  return (store.attendance || []).find((a) => {
    return String(a.date ?? "").trim() === d
      && String(a.studentName ?? "").trim() === sn
      && String(a.className ?? "").trim() === cn;
  });
}

function findExistingTeacherAttendanceRecord(store, teacherName, department, date = todayStr()) {
  const tn = String(teacherName ?? "").trim();
  const dept = String(department ?? "").trim();
  const d = String(date ?? "").trim();`;

code = code.replace(restoreOld, restoreNew);

// 2. Fix the WhatsApp bug properly
const waOld = `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
    if (typeof sendOpenBspWhatsApp !== "function") return;
    const store = window.getStore ? window.getStore() : window.store;
    if (!store) return;`;

const waNew = `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
    if (typeof window.sendOpenBspWhatsApp !== "function") {
        console.warn("WhatsApp API not found on window object.");
        return;
    }
    const store = typeof getStore === "function" ? getStore() : (window.store || {});
    if (!store || !store.students) {
        console.warn("Store or students not found.");
        return;
    }
    window.sendOpenBspWhatsApp = window.sendOpenBspWhatsApp; // force ref`;

// Wait, the rest of the function also uses sendOpenBspWhatsApp, I need to replace that too
const waOldCall = `await sendOpenBspWhatsApp(targetPhoneClean, msg, null);`;
const waNewCall = `await window.sendOpenBspWhatsApp(targetPhoneClean, msg, null);`;

code = code.replace(waOld, waNew);
code = code.replace(waOldCall, waNewCall);

fs.writeFileSync('public/app.js', code);
console.log("Successfully restored and patched WhatsApp logic!");
