const fs = require('fs');
let appCode = fs.readFileSync('public/app.js', 'utf8');

const regex = /const dueHistory = dues\.map\(d => \(\{[\s\S]*?paymentDate: d\.updatedAt \? displayDate\(d\.updatedAt\.split\(" "\)\[0\]\) : "-"\s*refs\.studentProfileContent\.innerHTML = `/g;

const replacement = `const dueHistory = dues.map(d => ({
        ...d,
        isDueRecord: true,
        term: d.session || "Previous Session",
        totalFee: d.dueAmount,
        paymentDate: d.updatedAt ? displayDate(d.updatedAt.split(" ")[0]) : "-"
    }));
    
    const history = [...dueHistory, ...feeHistory]
      .sort((a, b) => String(b.term).localeCompare(String(a.term)))
      .map((f) => {
        const feeBreakdown = buildFeeBreakdown(f);
        const statusColor = String(f.status||'').toLowerCase()==='paid'?'#16a34a':String(f.status||'').toLowerCase()==='partial'?'#d97706':'#dc2626';
        const statusBg = String(f.status||'').toLowerCase()==='paid'?'#dcfce7':String(f.status||'').toLowerCase()==='partial'?'#fef3c7':'#fee2e2';
        
        return \`
        <div style="background:#fff; border-radius:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); overflow:hidden; position:relative; \${f.isDueRecord ? 'border-left: 4px solid #ef4444;' : 'border-left: 4px solid #3b82f6;'}">
          <div style="padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0; font-size:1.05rem; color:#0f172a; font-weight:700; display:flex; align-items:center; gap:8px;">
              \${f.isDueRecord ? '<span style="font-size:1.2rem;">⚠️</span>' : '<span style="font-size:1.2rem;">💳</span>'}
              \${f.isDueRecord ? 'OUTSTANDING ARREARS ('+f.term+')' : 'Term: ' + (f.term || "—")}
            </h3>
            <span style="font-size:0.8rem; padding:4px 12px; border-radius:20px; background:\${statusBg}; color:\${statusColor}; font-weight:700; border:1px solid \${statusColor}40; text-transform:uppercase; letter-spacing:0.05em;">
              \${f.status || "Pending"}
            </span>
          </div>
          <div style="padding:16px 20px;">
            \${feeBreakdown}
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
              \${(parseFloat(f.paidAmount) > 0 || String(f.status).toLowerCase() === 'paid') ? \`<button class="print-fee-btn" data-fee-id="\${f.id}" style="font-size:0.75rem;padding:6px 12px;border-radius:8px;background:#4f46e5;color:#fff;border:none;cursor:pointer;font-weight:600;transition:all 0.2s;box-shadow:0 2px 4px rgba(79,70,229,0.2);">🖨️ Download</button>\` : ''}
            </div>\` : ''}
          </div>
        </div>
      \`;
      }).join("");

    refs.studentProfileContent.innerHTML = \``;

appCode = appCode.replace(regex, replacement);
fs.writeFileSync('public/app.js', appCode);
console.log("Restored history variable!");
