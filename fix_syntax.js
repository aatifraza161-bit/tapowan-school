const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// The mangled block starts with:
//      }
//    } else {
//  }
//  if (refs.smartGenerateBtn) {
// Let's replace the mangled block with the correct code

const mangled = `      if (classOptions.includes(currentVal)) {
        refs.classFilter.value = currentVal;
      }
    } else {
  }
  if (refs.smartGenerateBtn) {
    refs.smartGenerateBtn.classList.toggle("hidden", currentModule !== "timetable" || !canCurrentUserWrite("timetable"));
  }
  if (refs.print4in1Btn) refs.print4in1Btn.classList.toggle("hidden", currentModule !== "fees");`;

const fixed = `      if (classOptions.includes(currentVal)) {
        refs.classFilter.value = currentVal;
      }
    } else {
      refs.classFilter.classList.add("hidden");
    }
  }

  // Students and teachers don't get export CSV/PDF buttons for sensitive modules
  const canExport = userIsAdmin() || userIsStaffOrAbove() || String(currentUser?.role || "").toLowerCase() === "teacher";
  if (refs.exportCsvBtn) refs.exportCsvBtn.style.display = canExport ? "" : "none";
  if (refs.exportPdfBtn) refs.exportPdfBtn.style.display = canExport ? "" : "none";
  if (refs.importDataBtn) {
    const canImport = currentModule !== "dashboard" && canCurrentUserWrite(currentModule);
    refs.importDataBtn.classList.toggle("hidden", !canImport);
  }
  if (refs.smartGenerateBtn) {
    refs.smartGenerateBtn.classList.toggle("hidden", currentModule !== "timetable" || !canCurrentUserWrite("timetable"));
  }
  if (refs.freeTeachersBtn) {
    refs.freeTeachersBtn.classList.toggle("hidden", currentModule !== "timetable");
  }
  if (refs.print4in1Btn) refs.print4in1Btn.classList.toggle("hidden", currentModule !== "fees");`;

if (code.includes(mangled)) {
    code = code.replace(mangled, fixed);
    console.log("Fixed mangled renderModuleTools");
} else {
    console.log("Could not find mangled block!");
}

fs.writeFileSync('public/app.js', code);
