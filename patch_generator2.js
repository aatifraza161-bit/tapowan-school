const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Remove arrivalTime from config, keep departureTime
code = code.replace(
  /"startTime", "endTime", "arrivalTime", "departureTime", "subject", "teacher", "roomNo"\], columns: \[/g,
  '"startTime", "endTime", "departureTime", "subject", "teacher", "roomNo"], columns: ['
);

code = code.replace(
  /columns: \["className", "day", "period", "startTime", "endTime", "arrivalTime", "departureTime", "subject", "teacher", "roomNo"\] \},/g,
  'columns: ["className", "day", "period", "startTime", "endTime", "departureTime", "subject", "teacher", "roomNo"] },'
);

// 2. Inject Modal HTML (Departure Time only) using regex targeting st_lunchAfter
// We find the div holding st_lunchAfter and inject our new div right after its parent's parent (the flex container)
code = code.replace(
  /(<input type="number" id="st_lunchAfter"[^>]*>\s*<\/div>\s*<\/div>)/g,
  `$1
            <div style="margin-top:15px;">
              <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">School Departure Time</label>
              <input type="time" id="st_departureTime" value="14:00" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit;">
            </div>`
);

// 3. Update Variable Retrieval using regex targeting mathSciDur
code = code.replace(
  /(const mathSciDur = normalDur \+ extraDur;)/g,
  `const depTime = document.getElementById("st_departureTime") ? document.getElementById("st_departureTime").value : "14:00";\n    $1`
);

// 4. Update newTimetable.push using regex targeting endTime
code = code.replace(
  /(endTime: endFmt,)/g,
  `$1\n            departureTime: formatMinutesToTime(parseTimeToMinutes(depTime)),`
);

fs.writeFileSync('public/app.js', code);
console.log("Successfully patched departure time generator UI and logic!");
