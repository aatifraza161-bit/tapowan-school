const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Add arrivalTime to timetable module Config
code = code.replace(
  /"startTime", "endTime", "departureTime", "subject", "teacher", "roomNo"\], columns: \[/g,
  '"startTime", "endTime", "arrivalTime", "departureTime", "subject", "teacher", "roomNo"], columns: ['
);

code = code.replace(
  /columns: \["className", "day", "period", "startTime", "endTime", "subject", "teacher", "roomNo"\] \},/g,
  'columns: ["className", "day", "period", "startTime", "endTime", "arrivalTime", "departureTime", "subject", "teacher", "roomNo"] },'
);

// 2. Update Modal HTML
const modalOld = `<div style="flex:1;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">Lunch After Period #</label>
                <input type="number" id="st_lunchAfter" value="4" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit;">
              </div>
            </div>`;
const modalNew = `<div style="flex:1;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">Lunch After Period #</label>
                <input type="number" id="st_lunchAfter" value="4" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit;">
              </div>
            </div>
            <div style="display:flex; gap:15px; margin-top:15px;">
              <div style="flex:1;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">School Arrival Time</label>
                <input type="time" id="st_arrivalTime" value="07:30" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit;">
              </div>
              <div style="flex:1;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">School Departure Time</label>
                <input type="time" id="st_departureTime" value="14:00" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit;">
              </div>
            </div>`;
code = code.replace(modalOld, modalNew);

// 3. Update Variable Retrieval
const varsOld = `const lunchAfter = parseInt(document.getElementById("st_lunchAfter").value) || 4;
    const mathSciDur = normalDur + extraDur;`;
const varsNew = `const lunchAfter = parseInt(document.getElementById("st_lunchAfter").value) || 4;
    const arriveTime = document.getElementById("st_arrivalTime") ? document.getElementById("st_arrivalTime").value : "07:30";
    const depTime = document.getElementById("st_departureTime") ? document.getElementById("st_departureTime").value : "14:00";
    const mathSciDur = normalDur + extraDur;`;
code = code.replace(varsOld, varsNew);

// 4. Update newTimetable.push
const pushOld = `          newTimetable.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            className: classSec,
            day: day,
            period: "Period " + periodNum,
            startTime: startFmt,
            endTime: endFmt,
            subject: sub ? sub.subjectName : "Free",
            teacher: sub ? (sub.teacher || "") : "",
            roomNo: c.roomNo || ""
          });`;
const pushNew = `          newTimetable.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            className: classSec,
            day: day,
            period: "Period " + periodNum,
            arrivalTime: formatMinutesToTime(parseTimeToMinutes(arriveTime)),
            departureTime: formatMinutesToTime(parseTimeToMinutes(depTime)),
            startTime: startFmt,
            endTime: endFmt,
            subject: sub ? sub.subjectName : "Free",
            teacher: sub ? (sub.teacher || "") : "",
            roomNo: c.roomNo || ""
          });`;
code = code.replace(pushOld, pushNew);

// 5. Safely Replace checkDepartureAllowed
const checkOld = `function checkDepartureAllowed(store, resolvedClassName, nowTime) {
    const todaysTimetable = (store.timetable || []).filter(t => t.className === resolvedClassName && t.day === new Date().toLocaleDateString('en-US', {weekday: 'long'}));
    const validDepartures = todaysTimetable.map(t => t.departureTime).filter(Boolean);
    if (validDepartures.length > 0) {
       const latestDeparture = validDepartures.sort().pop();
       if (nowTime < latestDeparture) return false;
    }
    return true;
}`;
const checkNew = `function checkDepartureAllowed(store, resolvedClassName, nowTime) {
    function to24h(time12h) {
        if (!time12h || typeof time12h !== 'string') return "";
        let parts = time12h.split(' ');
        if (parts.length < 2) return parts[0];
        let [time, modifier] = parts;
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
        return String(hours).padStart(2, '0') + ':' + minutes;
    }
    const todaysTimetable = (store.timetable || []).filter(t => t.className === resolvedClassName && t.day === new Date().toLocaleDateString('en-US', {weekday: 'long'}));
    const validDepartures = todaysTimetable.map(t => t.departureTime).filter(Boolean).map(to24h);
    if (validDepartures.length > 0) {
       const latestDeparture = validDepartures.sort().pop();
       if (nowTime < latestDeparture) return false;
    }
    return true;
}`;
code = code.replace(checkOld, checkNew);

fs.writeFileSync('public/app.js', code);
console.log("Successfully patched generator UI and logic!");
