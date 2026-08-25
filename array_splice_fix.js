const fs = require('fs');
let lines = fs.readFileSync('public/app.js', 'utf8').split('\n');

// The syntax error starts at line 6204 (index 6203)
// At index 6203, we have `  const tn = String(teacherName ?? "").trim();`
// The broken row object starts at 6198 (index 6197): `    } else {`

const restoreLines = `      const row = {
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

function findExistingTeacherAttendanceRecord(store, teacherName, department, date = todayStr()) {`.split('\n');

// Remove from 6198 (index 6197) to 6203 (index 6202) -> 6 lines
lines.splice(6197, 6, ...restoreLines);

fs.writeFileSync('public/app.js', lines.join('\n'));
console.log("Safely restored app.js via splice!");
