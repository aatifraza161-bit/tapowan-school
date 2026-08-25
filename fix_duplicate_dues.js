const fs = require('fs');

// 1. Fix server.js auto-sync logic
let serverCode = fs.readFileSync('server.js', 'utf8');
const serverRegex = /const isTrackedInFees = allFees\.some\(f =>\s*f\.admissionNo === due\.admissionNo &&\s*isMonthMatch\(f\.month, monthStored\)\s*\);/g;
const serverReplacement = `const isTrackedInFees = allFees.some(f => {
                if (f.admissionNo !== due.admissionNo) return false;
                if (isMonthMatch(f.month, monthStored)) return true;
                if (isMonthMatch(f.term, monthStored)) return true;
                if (f.paymentDate) {
                    const payMonth = new Date(f.paymentDate).toLocaleString('default', { month: 'long' });
                    if (isMonthMatch(payMonth, monthStored)) return true;
                }
                return false;
            });`;
serverCode = serverCode.replace(serverRegex, serverReplacement);
fs.writeFileSync('server.js', serverCode);

// 2. Fix app.js Financial Overview and Cards styling
let appCode = fs.readFileSync('public/app.js', 'utf8');
const appRegex = /const dues = \(store\.dueManagement \|\| \[\]\)\.filter\(\(d\) => d\.studentName === student\.fullName\);[\s\S]*?const dueHistory = dues\.map\(\(d\) => \(\{/g;

const appReplacement = `let dues = (store.dueManagement || []).filter((d) => d.studentName === student.fullName);
    
    // Auto-filter out duplicate dues that are already covered by fee records
    dues = dues.filter(d => {
       const isAutoDue = (d.particulars || "").startsWith("Tuition fee of") || (d.particulars || "").startsWith("Late fee of");
       if (isAutoDue) {
           const monthName = d.particulars.replace("Tuition fee of ", "").replace("Late fee of ", "").trim().toLowerCase();
           const feeExists = fees.some(f => {
               if (f.month && String(f.month).toLowerCase().includes(monthName)) return true;
               if (f.term && String(f.term).toLowerCase().includes(monthName)) return true;
               if (f.paymentDate) {
                   const payMonth = new Date(f.paymentDate).toLocaleString('default', { month: 'long' }).toLowerCase();
                   if (payMonth === monthName) return true;
               }
               return false;
           });
           return !feeExists;
       }
       return true;
    });

    let totalFee = fees.reduce((sum, f) => sum + asNum(f.totalFee), 0);
    let paidAmount = fees.reduce((sum, f) => sum + asNum(f.paidAmount), 0);
    let dueAmount = fees.reduce((sum, f) => sum + asNum(f.balance), 0);
    
    totalFee += dues.reduce((sum, d) => sum + asNum(d.dueAmount), 0);
    paidAmount += dues.reduce((sum, d) => sum + asNum(d.paidAmount), 0);
    dueAmount += dues.reduce((sum, d) => sum + asNum(d.balance), 0);
    
    const dueHistory = dues.map((d) => ({`;
appCode = appCode.replace(appRegex, appReplacement);

// 3. Style the fee cards inside app.js
const cardRegex = /<div class="panel" style="margin-bottom:12px; border-radius:12px; padding:16px; box-shadow:0 2px 4px rgba\(0,0,0,0\.02\); position:relative;">[\s\S]*?<\/div>\s*`;\s*}\)\.join\(""\);/g;

const cardReplacement = `<div class="panel" style="margin-bottom:16px; border-radius:16px; padding:18px; border:1px solid #e2e8f0; background:linear-gradient(to bottom right, #ffffff, #f8fafc); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); position:relative;">
          <h3 style="margin-top:0; margin-bottom:12px; font-size:1.1rem; border-bottom:1px solid #f1f5f9; padding-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <span style="display:flex; align-items:center; gap:8px;">
              <span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:\${f.isDueRecord?'#fee2e2':'#e0e7ff'};color:\${f.isDueRecord?'#ef4444':'#4f46e5'};font-size:0.9rem;">
                \${f.isDueRecord ? '⚠️' : '💳'}
              </span>
              <b style="color:#1e293b;">\${f.isDueRecord ? 'OUTSTANDING ARREARS ('+f.term+')' : 'Term: ' + (f.term || "—")}</b>
            </span>
            <span style="font-size:0.75rem; padding:4px 10px; border-radius:20px; background:\${statusColor}20; color:\${statusColor}; font-weight:700; border:1px solid \${statusColor}40; text-transform:uppercase; letter-spacing:0.05em;">
              \${f.status || "Pending"}
            </span>
          </h3>
          <div style="display:flex;justify-content:space-between;font-size:0.9rem; margin-bottom:8px;">
            <span style="color:#475569; display:flex; align-items:center; gap:6px;">
               <span style="color:\${f.isDueRecord?'#ef4444':'#3b82f6'}; font-size:1.1rem;">\${f.isDueRecord ? '◾' : '📚'}</span>
               \${f.particulars || "Fee Details"}
            </span>
            <span style="font-weight:700;color:#0f172a;">₹ \${(parseFloat(f.totalFee)||0).toLocaleString('en-IN')}</span>
          </div>
          <div style="background:#f1f5f9; border-radius:12px; padding:12px; margin-top:12px;">
            <div style="display:flex;justify-content:space-between;font-size:0.85rem; margin-bottom:6px;">
              <span style="color:#64748b;">Total Amount</span><span style="font-weight:600;color:#1e293b;">₹ \${(parseFloat(f.totalFee)||0).toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.85rem; margin-bottom:6px;">
              <span style="color:#64748b;">Amount Paid</span><span style="font-weight:600;color:#16a34a;">₹ \${(parseFloat(f.paidAmount)||0).toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.85rem; border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:2px;">
              <span style="color:#64748b; font-weight:700;">Balance Due</span><span style="font-weight:800;color:#dc2626;">₹ \${(parseFloat(f.balance)||0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          \${!f.isDueRecord ? \`
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
            <div style="color:#94a3b8;font-size:0.75rem;">
              <b>Payment Date:</b> \${f.paymentDate || "-"} &nbsp;•&nbsp; <b>Method:</b> \${f.paymentMethod || "-"}
            </div>
            \${(parseFloat(f.paidAmount) > 0 || String(f.status).toLowerCase() === 'paid') ? \`<button class="print-fee-btn" data-fee-id="\${f.id}" style="font-size:0.75rem;padding:6px 12px;border-radius:8px;background:#4f46e5;color:#fff;border:none;cursor:pointer;font-weight:600;transition:all 0.2s;box-shadow:0 2px 4px rgba(79,70,229,0.2);">🖨️ Download Receipt</button>\` : ''}
          </div>\` : ''}
        </div>
      \`;
      }).join("");`;
appCode = appCode.replace(cardRegex, cardReplacement);
fs.writeFileSync('public/app.js', appCode);

console.log("Done updating server.js and app.js!");
