const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const badBlock = `      const row = {
        id: getNextId(store.teacherAttendance || []),
        date: today,
        department: resolvedDept,
        teacherName: recognizedName,
        status,
  const tn = String(teacherName ?? "").trim();
  const dept = String(department ?? "").trim();
  const d = String(date ?? "").trim();
  return (store.teacherAttendance || []).find((a) => {
    return String(a.date ?? "").trim() === d
      && String(a.teacherName ?? "").trim() === tn
      && String(a.department ?? "").trim() === dept;
  });
}`;

const goodBlock = `      const row = {
        id: getNextId(store.teacherAttendance || []),
        date: today,
        department: resolvedDept,
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
  const d = String(date ?? "").trim();
  return (store.teacherAttendance || []).find((a) => {
    return String(a.date ?? "").trim() === d
      && String(a.teacherName ?? "").trim() === tn
      && String(a.department ?? "").trim() === dept;
  });
}`;

code = code.replace(badBlock, goodBlock);
fs.writeFileSync('public/app.js', code);
console.log("Fixed syntax error");
