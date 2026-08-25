const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /if \(activeStudentProfileTab === "exams"\) \{[\s\S]*?return;\n  \}/;

const replacement = `if (activeStudentProfileTab === "exams") {
    const store = getStore();
    const exams = (store.exams || []).filter((e) => e.studentName === student.fullName);
    const byExam = {};
    exams.forEach((e) => {
      byExam[e.examName] = byExam[e.examName] || [];
      byExam[e.examName].push(e);
    });
    const totalObtained = exams.reduce((sum, e) => sum + asNum(e.marksObtained), 0);
    const totalMax = exams.reduce((sum, e) => sum + asNum(e.maxMarks), 0);
    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
    const resultStatus = pct >= 50 ? "Pass" : "Fail";

    // Prepare Growth Data
    const examGrowthData = { labels: [], data: [] };
    Object.entries(byExam)
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))) // alphabetical order
      .forEach(([examName, rows]) => {
         const sumMax = rows.reduce((s,r) => s + asNum(r.maxMarks), 0);
         const sumObt = rows.reduce((s,r) => s + asNum(r.marksObtained), 0);
         const p = sumMax > 0 ? Math.round((sumObt/sumMax)*100) : 0;
         examGrowthData.labels.push(examName);
         examGrowthData.data.push(p);
      });

    const examCards = Object.entries(byExam)
      .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
      .map(([examName, rows]) => {
        const lines = rows
          .map((r) => \`<div style="margin-top:6px; font-size:0.85rem; color:#334155;"><b>\${r.subject}:</b> \${r.marksObtained || ""}/\${r.maxMarks || ""} (\${r.grade || ""})</div>\`)
          .join("");
        return \`<div class="panel" style="margin-bottom:12px; border-radius:12px; box-shadow:0 2px 4px rgba(0,0,0,0.02);"><h3 style="margin-bottom:8px; font-size:1rem; color:#0f172a;">\${examName}</h3>\${lines}</div>\`;
      })
      .join("");

    refs.studentProfileContent.innerHTML = \`
      <div style="background:linear-gradient(135deg, #1e3a8a, #312e81); border-radius:16px; padding:16px; color:#fff; margin-bottom:16px; box-shadow:0 8px 20px rgba(30,58,138,0.2);">
        <h3 style="margin-bottom:12px; font-size:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Academic Summary</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:12px;">
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Obtained</div>
            <div style="font-size:1.2rem; font-weight:800;">\${totalObtained}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Max</div>
            <div style="font-size:1.2rem; font-weight:800;">\${totalMax}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Percentage</div>
            <div style="font-size:1.2rem; font-weight:800;">\${pct}%</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Result</div>
            <div style="font-size:1.2rem; font-weight:800; \${resultStatus === 'Pass' ? 'color:#4ade80;' : 'color:#f87171;'}">\${resultStatus}</div>
          </div>
        </div>
      </div>
      
      <!-- Growth Report Chart -->
      \${examGrowthData.labels.length > 0 ? \`
      <div style="background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <h3 style="margin-bottom:12px; font-size:1rem; color:#1e293b;">Growth Report</h3>
        <canvas id="studentGrowthChart" style="max-height:200px; width:100%;"></canvas>
      </div>
      \` : ''}

      \${examCards || \`<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">No exam records found.</div>\`}
    \`;

    if (examGrowthData.labels.length > 0) {
      setTimeout(() => {
         const ctx = document.getElementById('studentGrowthChart');
         if(!ctx) return;
         if(window.studentGrowthChartInstance) { window.studentGrowthChartInstance.destroy(); }
         window.studentGrowthChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
               labels: \${JSON.stringify(examGrowthData.labels)},
               datasets: [{
                  label: 'Percentage (%)',
                  data: \${JSON.stringify(examGrowthData.data)},
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37,99,235,0.1)',
                  fill: true,
                  tension: 0.4,
                  borderWidth: 2,
                  pointBackgroundColor: '#2563eb',
                  pointRadius: 4
               }]
            },
            options: {
               responsive: true,
               maintainAspectRatio: false,
               plugins: { legend: { display: false } },
               scales: { y: { beginAtZero: true, max: 100 } }
            }
         });
      }, 50);
    }
    return;
  }`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('public/app.js', code);
    console.log('Successfully updated exams tab with Growth Report chart!');
} else {
    console.log('Regex did not match app.js!');
}
