const fs = require('fs');
let appCode = fs.readFileSync('public/app.js', 'utf8');

// 1. Replace Exam Tables
const examTableRegex = /<div class="panel" style="margin-bottom:20px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; overflow:hidden; box-shadow:0 4px 6px -1px rgba\(0,0,0,0\.05\);">\s*<div style="padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">/g;
const examTableReplacement = `<div class="panel" style="margin-bottom:24px; border-radius:var(--radius); border:1px solid #bae6fd; background:linear-gradient(135deg, #f0f9ff, #e0f2fe); overflow:hidden; box-shadow:var(--shadow); position:relative;">
          <div style="position:absolute; right:-20px; bottom:-20px; width:140px; height:140px; border-radius:50%; background:#bae6fd; opacity:0.3; pointer-events:none;"></div>
          <div style="padding:20px 24px; background:rgba(255,255,255,0.4); border-bottom:1px solid #bae6fd; display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; backdrop-filter:blur(4px);">`;
appCode = appCode.replace(examTableRegex, examTableReplacement);

// 2. Replace Growth Report
const growthRegex = /<div style="background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba\(0,0,0,0\.05\);">\s*<h3 style="margin-bottom:12px; font-size:1rem; color:#1e293b;">Growth Report<\/h3>/g;
const growthReplacement = `<div style="background:linear-gradient(135deg, #faf5ff, #f3e8ff); border-radius:var(--radius); padding:24px; margin-bottom:24px; border:1px solid #e9d5ff; box-shadow:var(--shadow); position:relative; overflow:hidden;">
        <div style="position:absolute; right:-20px; bottom:-20px; width:140px; height:140px; border-radius:50%; background:#e9d5ff; opacity:0.4; pointer-events:none;"></div>
        <div style="position:relative; z-index:2;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="margin:0; font-size:1.1rem; color:#6b21a8; font-weight:800;">Growth Report</h3>
            <div style="width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,0.6); display:grid; place-items:center; font-size:1.2rem;">📈</div>
          </div>
        </div>`;
appCode = appCode.replace(growthRegex, growthReplacement);

// Make table headers transparent so it blends with the background
const tableHeaderRegex = /<thead style="background:#f1f5f9; color:#64748b; font-size:0\.75rem; text-transform:uppercase; letter-spacing:0\.05em;">/g;
const tableHeaderReplacement = `<thead style="background:transparent; border-bottom:2px solid #bae6fd; color:#0369a1; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; position:relative; z-index:2;">`;
appCode = appCode.replace(tableHeaderRegex, tableHeaderReplacement);

// Make table body rows transparent
const rowRegex = /<tr style="border-bottom:1px solid #f1f5f9;">/g;
const rowReplacement = `<tr style="border-bottom:1px solid rgba(186,230,253,0.5); position:relative; z-index:2;">`;
appCode = appCode.replace(rowRegex, rowReplacement);


fs.writeFileSync('public/app.js', appCode);
console.log("Styled all white panels into colourful cards!");
