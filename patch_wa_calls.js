const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Inject into autoCaptureTick student path (update.arrivalTime = nowTime;)
code = code.replace(
  /if \(\!existing\.arrivalTime\) \{\s*update\.arrivalTime \= nowTime;\s*update\.status \= status;\s*\} else if \(\!existing\.departureTime\) \{\s*update\.departureTime \= nowTime;\s*\}/g,
  `if (!existing.arrivalTime) {
          update.arrivalTime = nowTime;
          update.status = status;
          if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, true, nowTime);
        } else if (!existing.departureTime) {
          if (typeof checkDepartureAllowed === 'function' && checkDepartureAllowed(store, resolvedClassName, nowTime)) {
            update.departureTime = nowTime;
            if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, false, nowTime);
          }
        }`
);

// Inject into autoCaptureTick student path new record insertion
code = code.replace(
  /await api\("\/api\/modules\/attendance", \{ method\: "POST", body\: JSON\.stringify\(row\) \}\);\s*\}/g,
  `await api("/api/modules/attendance", { method: "POST", body: JSON.stringify(row) });
        if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, true, nowTime);
      }`
);

// We need to inject into autoBatchCaptureTick too.
// Wait, autoBatchCaptureTick uses push:
// localAttendance.push(row);
// }
code = code.replace(
  /localAttendance\.push\(row\);\s*\}/g,
  `localAttendance.push(row);
            if (typeof sendAttendanceWhatsApp === 'function') sendAttendanceWhatsApp(recognizedName, true, nowTime);
          }`
);

fs.writeFileSync('public/app.js', code);
console.log("Successfully patched autoCaptureTick and autoBatchCaptureTick with regex!");
