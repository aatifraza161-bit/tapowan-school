const fs = require('fs');
let appCode = fs.readFileSync('public/app.js', 'utf8');

const regex = /return `\s*<div style="background:\${cardBg}; border-radius:var\(--radius\); margin-bottom:16px; border:1px solid \${cardBorder}; box-shadow:var\(--shadow\); position:relative; overflow:hidden; padding:24px; transition:all 0\.3s var\(--spring\);">[\s\S]*?<h3 style="font-size:1rem; color:#475569; margin-bottom:16px;">Fee History<\/h3>\s*\${history \|\| `<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">No fee or due records found\.<\/div>`}\s*`;/g;

const replacement = `return \`
        <div style="background:\${cardBg}; border-radius:var(--radius); border:1px solid \${cardBorder}; box-shadow:var(--shadow); position:relative; overflow:hidden; padding:24px; transition:all 0.3s var(--spring); display:flex; flex-direction:column;">
          <!-- Dashboard style background circle -->
          <div style="position:absolute; right:-20px; bottom:-20px; width:160px; height:160px; border-radius:50%; background:\${circleBg}; opacity:0.5; pointer-events:none;"></div>
          
          <div style="position:relative; z-index:2; flex:1; display:flex; flex-direction:column;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                <div>
                    <h3 style="margin:0; font-size:1.1rem; color:\${textDark}; font-weight:800; letter-spacing:-0.01em;">
                      \${f.isDueRecord ? 'OUTSTANDING ARREARS ('+f.term+')' : 'Term: ' + (f.term || "—")}
                    </h3>
                    <div style="font-size:0.76rem; color:\${textMuted}; font-weight:600; letter-spacing:0.02em; margin-top:4px; text-transform:uppercase;">
                      \${f.status || "Pending"}
                    </div>
                </div>
                <div style="width:46px; height:46px; border-radius:12px; display:grid; place-items:center; font-size:1.3rem; background:\${iconBg}; color:\${iconColor}; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    \${iconStr}
                </div>
              </div>

              \${feeBreakdown}
              
              <div style="margin-top:auto; padding-top:16px;">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                  <span style="font-size:0.85rem; color:\${textMuted}; font-weight:600;">Total Amount</span>
                  <span style="font-size:1.4rem; font-weight:900; color:\${textDark}; letter-spacing:-0.03em;">₹ \${(parseFloat(f.totalFee)||0).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:0.85rem;">
                  <span style="color:\${textMuted};">Amount Paid</span>
                  <span style="font-weight:700; color:\${textDark};">₹ \${(parseFloat(f.paidAmount)||0).toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; border-top:1px dashed \${circleBg}; padding-top:6px; margin-top:4px;">
                  <span style="color:\${textDark}; font-weight:700;">Balance Due</span>
                  <span style="font-weight:900; color:#dc2626;">₹ \${(parseFloat(f.balance)||0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              \${!f.isDueRecord ? \`
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:16px; border-top:1px solid \${circleBg};">
                <div style="color:\${textMuted}; font-size:0.75rem;">
                  <b>Date:</b> \${f.paymentDate || "-"} &nbsp;•&nbsp; <b>Method:</b> \${f.paymentMethod || "-"}
                </div>
                \${(parseFloat(f.paidAmount) > 0 || String(f.status).toLowerCase() === 'paid') ? \`<button class="print-fee-btn" data-fee-id="\${f.id}" style="font-size:0.75rem; padding:6px 14px; border-radius:8px; background:\${textDark}; color:#fff; border:none; cursor:pointer; font-weight:600; box-shadow:0 2px 4px rgba(0,0,0,0.1);">🖨️ Receipt</button>\` : ''}
              </div>\` : \`
              <div style="display:flex; justify-content:flex-end; margin-top:16px; padding-top:16px; border-top:1px solid \${circleBg};">
                <button onclick="deleteRecord('dueManagement', '\${f.id}').then(() => openStudentProfileById('\${f.admissionNo}'))" style="font-size:0.75rem; padding:6px 14px; border-radius:8px; background:#ef4444; color:#fff; border:none; cursor:pointer; font-weight:600; box-shadow:0 2px 4px rgba(239,68,68,0.2);">🗑️ Delete Arrears</button>
              </div>\`}
          </div>
        </div>
      \`;
      }).join("");

    refs.studentProfileContent.innerHTML = \`
      <div style="background:linear-gradient(135deg, #059669, #047857); border-radius:16px; padding:16px; color:#fff; margin-bottom:24px; box-shadow:0 8px 20px rgba(5,150,105,0.2);">
        <h3 style="margin-bottom:12px; font-size:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Financial Overview</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:12px;">
          <div>
            <div style="font-size:0.65rem; color:#a7f3d0; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Charges</div>
            <div style="font-size:1.3rem; font-weight:800;">₹ \${totalFee.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#a7f3d0; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Paid Amount</div>
            <div style="font-size:1.3rem; font-weight:800;">₹ \${paidAmount.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div style="font-size:0.65rem; color:#a7f3d0; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:3px;">Total Due</div>
            <div style="font-size:1.3rem; font-weight:800; \${dueAmount > 0 ? 'color:#fca5a5;' : 'color:#fff;'}">₹ \${dueAmount.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>
      <h3 style="font-size:1rem; color:#475569; margin-bottom:16px;">Fee History</h3>
      \${history ? \`<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">\${history}</div>\` : \`<div style="text-align:center; padding:40px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">No fee or due records found.</div>\`}
    \`;`;

appCode = appCode.replace(regex, replacement);
fs.writeFileSync('public/app.js', appCode);
console.log("Successfully styled the fee cards into a grid layout!");
