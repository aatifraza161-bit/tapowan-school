const fs = require('fs');
let appCode = fs.readFileSync('public/app.js', 'utf8');

// --- 1. Fee Card Tab ---
const feeCardTableWrapperRegex = /<div style="background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 4px 12px rgba\(0,0,0,0\.03\);">/g;
const feeCardTableWrapperReplacement = `<div style="margin-bottom:24px; border-radius:var(--radius); border:1px solid #fde68a; background:linear-gradient(135deg, #fffbeb, #fef3c7); overflow:hidden; box-shadow:var(--shadow); position:relative;">
        <div style="position:absolute; right:-20px; bottom:-20px; width:140px; height:140px; border-radius:50%; background:#fde68a; opacity:0.4; pointer-events:none;"></div>
        <div style="position:relative; z-index:2; backdrop-filter:blur(4px);">`;
appCode = appCode.replace(feeCardTableWrapperRegex, feeCardTableWrapperReplacement);

const feeCardHeaderRegex = /<thead style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">/g;
const feeCardHeaderReplacement = `<thead style="background:transparent; border-bottom:2px solid #fde68a;">`;
appCode = appCode.replace(feeCardHeaderRegex, feeCardHeaderReplacement);

const feeCardRowRegex = /<td style="padding:12px; border-bottom:1px solid #f1f5f9;([^"]*)">/g;
const feeCardRowReplacement = `<td style="padding:12px; border-bottom:1px solid rgba(253,230,138,0.5);$1">`;
appCode = appCode.replace(feeCardRowRegex, feeCardRowReplacement);
// Add closing div for the extra wrapper added
const feeCardCloseRegex = /<\/table>\s*<\/div>\s*<p style="margin-top:12px/g;
const feeCardCloseReplacement = `</table>\n        </div>\n      </div>\n      <p style="margin-top:12px`;
appCode = appCode.replace(feeCardCloseRegex, feeCardCloseReplacement);


// --- 2. Attendance Tab ---
const attendanceSummaryRegex = /<div style="background:linear-gradient\(135deg, #6d28d9, #4c1d95\); border-radius:16px; padding:16px; color:#fff; margin-bottom:16px; box-shadow:0 8px 20px rgba\(109,40,217,0\.2\);">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

const attendanceSummaryReplacement = `<h3 style="font-size:1rem; color:#475569; margin-bottom:16px;">Attendance Summary</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
        <!-- Total Days -->
        <div style="background:linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius:var(--radius); border:none; box-shadow:0 8px 20px rgba(59,130,246,0.25); position:relative; overflow:hidden; padding:20px; color:#fff; transition:all 0.3s var(--spring);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:120px; height:120px; border-radius:50%; background:#fff; opacity:0.1; pointer-events:none;"></div>
          <div style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <h4 style="margin:0; font-size:0.85rem; color:#bfdbfe; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Total Days</h4>
              <div style="width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,0.2); display:grid; place-items:center; font-size:1.1rem;">📅</div>
            </div>
            <div style="font-size:1.6rem; font-weight:900; letter-spacing:-0.03em;">\${totalDays}</div>
          </div>
        </div>
        <!-- Present -->
        <div style="background:linear-gradient(135deg, #059669, #047857); border-radius:var(--radius); border:none; box-shadow:0 8px 20px rgba(5,150,105,0.25); position:relative; overflow:hidden; padding:20px; color:#fff; transition:all 0.3s var(--spring);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:120px; height:120px; border-radius:50%; background:#fff; opacity:0.1; pointer-events:none;"></div>
          <div style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <h4 style="margin:0; font-size:0.85rem; color:#a7f3d0; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Present</h4>
              <div style="width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,0.2); display:grid; place-items:center; font-size:1.1rem;">✅</div>
            </div>
            <div style="font-size:1.6rem; font-weight:900; letter-spacing:-0.03em;">\${presentUnique.length}</div>
          </div>
        </div>
        <!-- Absent -->
        <div style="background:linear-gradient(135deg, #dc2626, #b91c1c); border-radius:var(--radius); border:none; box-shadow:0 8px 20px rgba(220,38,38,0.25); position:relative; overflow:hidden; padding:20px; color:#fff; transition:all 0.3s var(--spring);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:120px; height:120px; border-radius:50%; background:#fff; opacity:0.1; pointer-events:none;"></div>
          <div style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <h4 style="margin:0; font-size:0.85rem; color:#fecaca; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Absent</h4>
              <div style="width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,0.2); display:grid; place-items:center; font-size:1.1rem;">❌</div>
            </div>
            <div style="font-size:1.6rem; font-weight:900; letter-spacing:-0.03em;">\${absentUnique.length}</div>
          </div>
        </div>
        <!-- Percentage -->
        <div style="background:linear-gradient(135deg, #8b5cf6, #6d28d9); border-radius:var(--radius); border:none; box-shadow:0 8px 20px rgba(139,92,246,0.25); position:relative; overflow:hidden; padding:20px; color:#fff; transition:all 0.3s var(--spring);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:120px; height:120px; border-radius:50%; background:#fff; opacity:0.1; pointer-events:none;"></div>
          <div style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <h4 style="margin:0; font-size:0.85rem; color:#ddd6fe; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Percentage</h4>
              <div style="width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,0.2); display:grid; place-items:center; font-size:1.1rem;">📊</div>
            </div>
            <div style="font-size:1.6rem; font-weight:900; letter-spacing:-0.03em;">\${pct}%</div>
          </div>
        </div>
      </div>`;
appCode = appCode.replace(attendanceSummaryRegex, attendanceSummaryReplacement);

const attendanceRowRegex = /<div style="padding:8px 10px;border:1px solid rgba\(148,163,184,0\.25\);border-radius:10px;margin-bottom:8px;">\s*<b>\$\{a\.date \|\| ""\}<\/b> • \$\{a\.status \|\| ""\}\$\{a\.arrivalTime \? ` • Arr \$\{a\.arrivalTime\}` : ""\}\$\{a\.departureTime \? ` • Dep \$\{a\.departureTime\}` : ""\}\s*<\/div>/g;
const attendanceRowReplacement = `<div style="background:linear-gradient(135deg, #f8fafc, #f1f5f9); padding:16px 20px; border:1px solid #cbd5e1; border-radius:var(--radius); margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; position:relative; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.03);">
        <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#cbd5e1; opacity:0.3; pointer-events:none;"></div>
        <div style="position:relative; z-index:2; font-weight:800; color:#334155; font-size:0.9rem;">\${a.date || ""}</div>
        <div style="position:relative; z-index:2; font-size:0.8rem; color:#475569; font-weight:700; padding:4px 12px; background:#fff; border-radius:20px; border:1px solid #e2e8f0;">\${a.status || ""}\${a.arrivalTime ? \` • Arr \${a.arrivalTime}\` : ""}\${a.departureTime ? \` • Dep \${a.departureTime}\` : ""}</div>
      </div>`;
appCode = appCode.replace(attendanceRowRegex, attendanceRowReplacement);

fs.writeFileSync('public/app.js', appCode);
console.log("Styled Fee Card and Attendance tabs!");
