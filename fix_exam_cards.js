const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /const examCards = Object\.values\(byExam\)[\s\S]*?\.join\(""\);/;

const replacement = `const examCards = Object.values(byExam)
      .sort((a, b) => String(a.examName).localeCompare(String(b.examName)))
      .map((e) => {
        const rows = e.marksArray
          .map((m) => {
             const obt = m.total || m.obtained || m.theory || "0";
             const max = m.maxMarks || m.max || "100";
             const pct = max > 0 ? Math.round((parseFloat(obt) / parseFloat(max)) * 100) : 0;
             const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 33 ? 'D' : 'E';
             const color = pct >= 33 ? '#16a34a' : '#dc2626';
             return \`
             <tr style="border-bottom:1px solid #f1f5f9;">
               <td style="padding:10px 12px; font-weight:600; color:#1e293b;">\${m.subject}</td>
               <td style="padding:10px 12px; color:#475569; text-align:center;">\${max}</td>
               <td style="padding:10px 12px; font-weight:700; color:\${color}; text-align:center;">\${obt}</td>
               <td style="padding:10px 12px; font-weight:700; color:\${color}; text-align:center;">\${grade}</td>
             </tr>\`;
          })
          .join("");
          
        return \`
        <div class="panel" style="margin-bottom:20px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
             <h3 style="margin:0; font-size:1.1rem; color:#0f172a; font-weight:700;">\${e.examName}</h3>
             <span style="font-size:0.85rem; padding:4px 12px; border-radius:20px; background:\${e.status === 'Pass' ? '#dcfce7' : '#fee2e2'}; color:\${e.status === 'Pass' ? '#16a34a' : '#dc2626'}; font-weight:700; border:1px solid \${e.status === 'Pass' ? '#bbf7d0' : '#fecaca'};">
               \${e.percentage}% | \${e.status}
             </span>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem;">
              <thead style="background:#f1f5f9; color:#64748b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">
                <tr>
                  <th style="padding:12px; font-weight:600;">Subject</th>
                  <th style="padding:12px; font-weight:600; text-align:center;">Max Marks</th>
                  <th style="padding:12px; font-weight:600; text-align:center;">Obtained</th>
                  <th style="padding:12px; font-weight:600; text-align:center;">Grade</th>
                </tr>
              </thead>
              <tbody>
                \${rows}
              </tbody>
            </table>
          </div>
        </div>\`;
      })
      .join("");`;

code = code.replace(regex, replacement);

fs.writeFileSync('public/app.js', code);
console.log("Successfully replaced the exam cards logic!");
