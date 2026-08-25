const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Find the start of applySmartTimetable
const applyIndex = code.indexOf('async function applySmartTimetable()');

if (applyIndex !== -1) {
    // Cut everything from applySmartTimetable to the end
    code = code.substring(0, applyIndex);

    // Append the clean, correct logic
    code += `async function applySmartTimetable() {
  if (window._pendingSmartTimetable) {
    const store = getStore();
    store.timetable = window._pendingSmartTimetable;
    try {
      await saveStore(store);
      if (typeof showToast === 'function') showToast("Smart Timetable applied successfully!", "success");
      document.getElementById("smartTimetablePreviewModal")?.remove();
      if (window.renderAll) window.renderAll();
    } catch (e) {
      if (typeof showToast === 'function') showToast("Error saving timetable: " + e.message, "error");
    }
  }
}

async function saveStore(store) {
  try {
    await window.api("/api/store/import", {
      method: "POST",
      body: JSON.stringify(store)
    });
    localStorage.setItem("school_data", JSON.stringify(store));
  } catch (e) {
    console.error("Failed to save store:", e);
    throw e;
  }
}

window.deleteClassDayTimetable = async function(className, day) {
  if (confirm('Are you sure you want to clear all timetable entries for ' + className + ' on ' + day + '?')) {
    const store = getStore();
    const beforeCount = store.timetable.length;
    store.timetable = store.timetable.filter(r => !(r.className === className && r.day === day));
    if (store.timetable.length < beforeCount) {
      try {
        await saveStore(store);
        await loadStore();
        if (typeof showToast === 'function') showToast('Timetable cleared for ' + className, 'success');
        if (window.renderAll) window.renderAll();
      } catch (e) {
        if (typeof showToast === 'function') showToast('Error clearing timetable', 'error');
      }
    }
  }
};
`;
    fs.writeFileSync('public/app.js', code);
    console.log('Fixed end of app.js successfully.');
} else {
    console.log('Could not find applySmartTimetable');
}
