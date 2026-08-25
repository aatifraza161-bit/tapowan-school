const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Update moduleConfig
code = code.replace(
  /"startTime", "endTime", "subject", "teacher", "roomNo"\], columns: \[/g,
  '"startTime", "endTime", "departureTime", "subject", "teacher", "roomNo"], columns: ['
);

code = code.replace(
  /columns: \["date", "className", "studentName", "rollNo", "status"\]/g,
  'columns: ["date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime"]'
);

// 2. Inject helper functions before autoCaptureTick
const helpers = `
function checkDepartureAllowed(store, resolvedClassName, nowTime) {
    const todaysTimetable = (store.timetable || []).filter(t => t.className === resolvedClassName && t.day === new Date().toLocaleDateString('en-US', {weekday: 'long'}));
    const validDepartures = todaysTimetable.map(t => t.departureTime).filter(Boolean);
    if (validDepartures.length > 0) {
       const latestDeparture = validDepartures.sort().pop();
       if (nowTime < latestDeparture) return false;
    }
    return true;
}

async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
  if (typeof sendOpenBspWhatsApp !== "function") return;
  const store = window.getStore ? window.getStore() : window.store;
  if (!store) return;
  const person = (store.students || []).find(s => s.fullName === recognizedName);
  if (!person) return;
  const targetPhone = person.phone || person.mobile || person.parentPhone || person.contactNo;
  if (!targetPhone) return;
  const targetPhoneClean = String(targetPhone).replace(/\\D/g, "");
  const msg = isArrival 
    ? \`\${person.fullName} Arrives at school at \${time}\`
    : \`\${person.fullName} leave from the school at \${time}\`;
  try {
    await sendOpenBspWhatsApp(targetPhoneClean, msg, null);
  } catch(e) { console.warn("WhatsApp auto-send failed:", e); }
}

async function autoCaptureTick() {`;

code = code.replace(/async function autoCaptureTick\(\) \{/g, helpers);

// 3. Patch autoCaptureTick (Student Path)
// Replacing arrival and departure blocks
const capExistingOld = `        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = status;
        } else if (!existing.departureTime) {
          update.departureTime = nowTime;
        }`;
const capExistingNew = `        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = status;
          sendAttendanceWhatsApp(recognizedName, true, nowTime);
        } else if (!existing.departureTime) {
          if (checkDepartureAllowed(store, resolvedClassName, nowTime)) {
            update.departureTime = nowTime;
            sendAttendanceWhatsApp(recognizedName, false, nowTime);
          }
        }`;
code = code.replace(capExistingOld, capExistingNew);

const capNewOld = `        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
      }`;
const capNewNew = `        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        sendAttendanceWhatsApp(recognizedName, true, nowTime);
      }`;
// Careful here, this block exists in teacher path too! But we only want it in Student Path.
// The student path is immediately before `} else { // Teacher Path`
// Let's use a smarter replace for `api("/api/modules/attendance"` in autoCaptureTick
// wait, we can just replace the whole else block for the student path.

const fullCapOld = `      if (existing?.id) {
        const update = { remarks: "Face-recognized" };
        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = status;
        } else if (!existing.departureTime) {
          update.departureTime = nowTime;
        }
        await api(\`/api/modules/attendance/\${existing.id}\`, { method: "PUT", body: JSON.stringify(update) });
      } else {
        const row = {
          id: getNextId(store.attendance || []),
          date: today,
          className: resolvedClassName,
          studentName: recognizedName,
          rollNo: student?.rollNo || "",
          status,
          arrivalTime: nowTime,
          departureTime: "",
          remarks: "Face-recognized"
        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
      }`;

const fullCapNew = `      if (existing?.id) {
        const update = { remarks: "Face-recognized" };
        if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = status;
          sendAttendanceWhatsApp(recognizedName, true, nowTime);
        } else if (!existing.departureTime) {
          if (checkDepartureAllowed(store, resolvedClassName, nowTime)) {
            update.departureTime = nowTime;
            sendAttendanceWhatsApp(recognizedName, false, nowTime);
          }
        }
        await api(\`/api/modules/attendance/\${existing.id}\`, { method: "PUT", body: JSON.stringify(update) });
      } else {
        const row = {
          id: getNextId(store.attendance || []),
          date: today,
          className: resolvedClassName,
          studentName: recognizedName,
          rollNo: student?.rollNo || "",
          status,
          arrivalTime: nowTime,
          departureTime: "",
          remarks: "Face-recognized"
        };
        await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        sendAttendanceWhatsApp(recognizedName, true, nowTime);
      }`;

code = code.replace(fullCapOld, fullCapNew);

// 4. Patch autoBatchCaptureTick (Student Path)
const batchCapOld = `          if (existing?.id) {
            const update = { facePhoto: snap, remarks: "Auto face-recognized" };
            if (!existing.arrivalTime) {
              update.arrivalTime = nowTime;
              update.status = status;
            } else if (!existing.departureTime) {
              update.departureTime = nowTime;
            }
            await api(\`/api/modules/attendance/\${existing.id}\`, { method: "PUT", body: JSON.stringify(update) });
            existing.facePhoto = snap;
            existing.remarks = update.remarks;
            if (update.arrivalTime) existing.arrivalTime = update.arrivalTime;
            if (update.departureTime) existing.departureTime = update.departureTime;
            if (update.status) existing.status = update.status;
          } else {
            const row = {
              id: nextId++,
              date: today,
              className: resolvedClassName,
              studentName: recognizedName,
              rollNo: person?.rollNo || "",
              status,
              arrivalTime: nowTime,
              departureTime: "",
              remarks: "Auto face-recognized",
              facePhoto: snap
            };
            await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
            localAttendance.push(row);
          }`;

const batchCapNew = `          if (existing?.id) {
            const update = { facePhoto: snap, remarks: "Auto face-recognized" };
            if (!existing.arrivalTime) {
              update.arrivalTime = nowTime;
              update.status = status;
              sendAttendanceWhatsApp(recognizedName, true, nowTime);
            } else if (!existing.departureTime) {
              if (checkDepartureAllowed(store, resolvedClassName, nowTime)) {
                update.departureTime = nowTime;
                sendAttendanceWhatsApp(recognizedName, false, nowTime);
              }
            }
            await api(\`/api/modules/attendance/\${existing.id}\`, { method: "PUT", body: JSON.stringify(update) });
            existing.facePhoto = snap;
            existing.remarks = update.remarks;
            if (update.arrivalTime) existing.arrivalTime = update.arrivalTime;
            if (update.departureTime) existing.departureTime = update.departureTime;
            if (update.status) existing.status = update.status;
          } else {
            const row = {
              id: nextId++,
              date: today,
              className: resolvedClassName,
              studentName: recognizedName,
              rollNo: person?.rollNo || "",
              status,
              arrivalTime: nowTime,
              departureTime: "",
              remarks: "Auto face-recognized",
              facePhoto: snap
            };
            await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
            localAttendance.push(row);
            sendAttendanceWhatsApp(recognizedName, true, nowTime);
          }`;

code = code.replace(batchCapOld, batchCapNew);

fs.writeFileSync('public/app.js', code);
console.log("Successfully patched attendance module!");
