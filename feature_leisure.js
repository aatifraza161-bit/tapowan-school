const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Fix UNDEFINED - UNDEFINED in matrix header
code = code.replace(
    /let sampleRec = dayRecords\.find\(r => r\.period === col\);\s*let timeStr = sampleRec \? '<br><span.*?<\/span>' : '';/,
    `let sampleRec = dayRecords.find(r => r.period === col && r.startTime);
           let timeStr = (sampleRec && sampleRec.startTime) ? '<br><span style="font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;">' + sampleRec.startTime + ' - ' + sampleRec.endTime + '</span>' : '';`
);


// 2. Add "Free Teachers" button to Timetable module tools
// Right next to "Smart Generate"
const smartGenBtnStr = '<button onclick="openSmartTimetableModal()" class="btn btn-outline" style="color:#f59e0b;border-color:#f59e0b;"><span class="material-icons">flash_on</span> Smart Generate</button>';
const freeTeachersBtnStr = '<button onclick="openFreeTeachersModal()" class="btn btn-outline" style="color:#10b981;border-color:#10b981;"><span class="material-icons">directions_run</span> Free Teachers</button>';

if (!code.includes('openFreeTeachersModal()')) {
    code = code.replace(smartGenBtnStr, smartGenBtnStr + '\\n        ' + freeTeachersBtnStr);
}

// 3. Define openFreeTeachersModal logic
const freeTeachersLogic = `
window.openFreeTeachersModal = function() {
  const store = getStore();
  const teachers = store.teachers || [];
  const timetable = store.timetable || [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const modalHtml = \`
    <div id="freeTeachersModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999; display:flex; align-items:center; justify-content:center;">
      <div style="background:#fff; width:100%; max-width:600px; padding:25px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-top:0; color:#1e293b; display:flex; align-items:center; gap:8px;">
          <span class="material-icons" style="color:#10b981;">directions_run</span> Free Teachers Checker
        </h3>
        <p style="color:#64748b; font-size:0.9rem;">Find out which teachers are available (leisure) for a specific day and period.</p>
        
        <div style="display:flex; gap:15px; margin-top:20px;">
          <div style="flex:1;">
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">Select Day</label>
            <select id="ftDay" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
              \${days.map(d => \`<option value="\${d}">\${d}</option>\`).join('')}
            </select>
          </div>
          <div style="flex:1;">
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#334155;">Select Period</label>
            <select id="ftPeriod" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
              <option value="Period 1">Period 1</option>
              <option value="Period 2">Period 2</option>
              <option value="Period 3">Period 3</option>
              <option value="Period 4">Period 4</option>
              <option value="Period 5">Period 5</option>
              <option value="Period 6">Period 6</option>
              <option value="Period 7">Period 7</option>
              <option value="Period 8">Period 8</option>
            </select>
          </div>
        </div>

        <button onclick="checkFreeTeachers()" style="margin-top:20px; width:100%; padding:12px; border:none; background:#10b981; color:#fff; border-radius:8px; cursor:pointer; font-weight:600; font-size:1rem;">Check Availability</button>

        <div id="ftResults" style="margin-top:25px; max-height:250px; overflow:auto;">
          <!-- Results will appear here -->
        </div>

        <div style="margin-top:25px; display:flex; justify-content:flex-end;">
          <button onclick="document.getElementById('freeTeachersModal').remove()" style="padding:10px 16px; border:none; background:#f1f5f9; color:#475569; border-radius:8px; cursor:pointer; font-weight:600;">Close</button>
        </div>
      </div>
    </div>
  \`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.checkFreeTeachers = function() {
  const day = document.getElementById("ftDay").value;
  const period = document.getElementById("ftPeriod").value;
  
  const store = getStore();
  const allTeachers = (store.teachers || []).map(t => t.fullName || t.name).filter(Boolean);
  
  // Find teachers who ARE busy
  const busyRecords = (store.timetable || []).filter(r => r.day === day && r.period === period && r.teacher);
  const busyTeachers = busyRecords.map(r => r.teacher);

  // Find free teachers
  const freeTeachers = allTeachers.filter(t => !busyTeachers.includes(t));

  const resultsDiv = document.getElementById("ftResults");
  
  if (freeTeachers.length === 0) {
    resultsDiv.innerHTML = \`<div style="padding:15px; background:#fee2e2; color:#ef4444; border-radius:8px; text-align:center; font-weight:600;">No teachers are free during \${period} on \${day}.</div>\`;
    return;
  }

  let html = \`<h4 style="margin:0 0 10px 0; color:#334155;">\${freeTeachers.length} Available Teachers</h4><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">\`;
  
  freeTeachers.forEach(t => {
    html += \`
      <div style="padding:10px 15px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; display:flex; align-items:center; gap:8px;">
        <span class="material-icons" style="color:#22c55e; font-size:1.2rem;">check_circle</span>
        <span style="color:#166534; font-weight:600; font-size:0.9rem;">\${t}</span>
      </div>
    \`;
  });
  html += \`</div>\`;
  
  resultsDiv.innerHTML = html;
};
`;

if (!code.includes('window.openFreeTeachersModal = function')) {
    code += '\\n' + freeTeachersLogic;
}

fs.writeFileSync('public/app.js', code);
console.log('Fixed undefined headers and added Free Teachers tool.');
