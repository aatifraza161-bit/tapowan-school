const fs = require('fs');

// 1. Update style.css to make the modal itself look like a premium card
let css = fs.readFileSync('public/style.css', 'utf8');
const modalRegex = /\.student-profile-modal\{[\s\S]*?\}/;
const modalReplacement = `.student-profile-modal{
  position:fixed;top:50%;left:50%;
  transform:translate(-50%,-50%);
  z-index:201;
  background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  width:95%; max-width:760px;
  max-height:95vh;overflow-y:auto;border-radius:24px;
  border:1px solid rgba(226,232,240,0.8);
  box-shadow:0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.02);
  animation:profileBounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
}`;
css = css.replace(modalRegex, modalReplacement);

const headerRegex = /\.student-profile-header\{[\s\S]*?\}/;
const headerReplacement = `.student-profile-header{display:flex;align-items:flex-start;justify-content:space-between;padding:28px 28px 18px;border-bottom:1px solid rgba(226,232,240,0.6);background:transparent;}`;
css = css.replace(headerRegex, headerReplacement);

const tabsRegex = /\.student-profile-tabs\{[\s\S]*?\}/;
const tabsReplacement = `.student-profile-tabs{display:flex;gap:4px;padding:14px 28px;border-bottom:1px solid rgba(226,232,240,0.6);background:transparent;}`;
css = css.replace(tabsRegex, tabsReplacement);

fs.writeFileSync('public/style.css', css);

// 2. Update app.js to make Documents colourful cards
let appCode = fs.readFileSync('public/app.js', 'utf8');

const docsRegex = /<h4 style="font-size:0\.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #f1f5f9;">Documents \(Optional\)<\/h4>[\s\S]*?<div style="display:flex; flex-wrap:wrap; gap:8px; background:linear-gradient\(135deg, #f8fafc, #f1f5f9\);/g;

const docsReplacement = `<h4 style="font-size:0.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid rgba(226,232,240,0.5);">Documents (Optional)</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px; margin-bottom:20px;">
        <div style="border:1px solid #bfdbfe; border-radius:14px; padding:12px; background:#dbeafe; text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#2563eb; opacity:0.1; pointer-events:none;"></div>
          <b style="position:relative; z-index:1; font-size:0.68rem; color:#1e40af; text-transform:uppercase; letter-spacing:0.04em;">Aadhar</b>
          <div style="position:relative; z-index:1; color:#94a3b8; margin-top:8px;">
            \${student.aadhar ? \`<img src="\${student.aadhar}" class="zoomable" onclick="openImageViewer('\${student.aadhar}', 'Aadhar Card')" alt="Aadhar" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #bfdbfe;" />\` : \`<div style="height:70px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.5); border-radius:8px; border:1px dashed #93c5fd; font-size:0.75rem; color:#3b82f6;">Missing</div>\`}
          </div>
        </div>
        <div style="border:1px solid #e9d5ff; border-radius:14px; padding:12px; background:#f3e8ff; text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#9333ea; opacity:0.1; pointer-events:none;"></div>
          <b style="position:relative; z-index:1; font-size:0.68rem; color:#6b21a8; text-transform:uppercase; letter-spacing:0.04em;">TC</b>
          <div style="position:relative; z-index:1; color:#94a3b8; margin-top:8px;">
            \${student.tc ? \`<img src="\${student.tc}" class="zoomable" onclick="openImageViewer('\${student.tc}', 'Transfer Certificate (TC)')" alt="TC" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #e9d5ff;" />\` : \`<div style="height:70px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.5); border-radius:8px; border:1px dashed #d8b4fe; font-size:0.75rem; color:#a855f7;">Missing</div>\`}
          </div>
        </div>
        <div style="border:1px solid #a7f3d0; border-radius:14px; padding:12px; background:#d1fae5; text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#16a34a; opacity:0.1; pointer-events:none;"></div>
          <b style="position:relative; z-index:1; font-size:0.68rem; color:#065f46; text-transform:uppercase; letter-spacing:0.04em;">Report Card</b>
          <div style="position:relative; z-index:1; color:#94a3b8; margin-top:8px;">
            \${student.reportCard ? \`<img src="\${student.reportCard}" class="zoomable" onclick="openImageViewer('\${student.reportCard}', 'Academic Report Card')" alt="Report" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #a7f3d0;" />\` : \`<div style="height:70px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.5); border-radius:8px; border:1px dashed #6ee7b7; font-size:0.75rem; color:#10b981;">Missing</div>\`}
          </div>
        </div>
        <div style="border:1px solid #fde68a; border-radius:14px; padding:12px; background:#fef3c7; text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#d97706; opacity:0.1; pointer-events:none;"></div>
          <b style="position:relative; z-index:1; font-size:0.68rem; color:#92400e; text-transform:uppercase; letter-spacing:0.04em;">Father Aadhar</b>
          <div style="position:relative; z-index:1; color:#94a3b8; margin-top:8px;">
            \${student.fatherAadhar ? \`<img src="\${student.fatherAadhar}" class="zoomable" onclick="openImageViewer('\${student.fatherAadhar}', 'Father Aadhar Card')" alt="Father Aadhar" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #fde68a;" />\` : \`<div style="height:70px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.5); border-radius:8px; border:1px dashed #fcd34d; font-size:0.75rem; color:#f59e0b;">Missing</div>\`}
          </div>
        </div>
        <div style="border:1px solid #fecaca; border-radius:14px; padding:12px; background:#fee2e2; text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#dc2626; opacity:0.1; pointer-events:none;"></div>
          <b style="position:relative; z-index:1; font-size:0.68rem; color:#991b1b; text-transform:uppercase; letter-spacing:0.04em;">Mother Aadhar</b>
          <div style="position:relative; z-index:1; color:#94a3b8; margin-top:8px;">
            \${student.motherAadhar ? \`<img src="\${student.motherAadhar}" class="zoomable" onclick="openImageViewer('\${student.motherAadhar}', 'Mother Aadhar Card')" alt="Mother Aadhar" style="width:100%; height:70px; object-fit:cover; border-radius:8px; border:1px solid #fecaca;" />\` : \`<div style="height:70px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.5); border-radius:8px; border:1px dashed #fca5a5; font-size:0.75rem; color:#ef4444;">Missing</div>\`}
          </div>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; background:linear-gradient(135deg, #f8fafc, #f1f5f9);`;

appCode = appCode.replace(docsRegex, docsReplacement);

// 3. Let's make sure the whole Profile tab content isn't just floating.
// It's actually fine if the modal background is nice and the docs are cards.
// But what if they want ONE BIG CARD per section in the Profile tab?
// Let's wrap the two main sections in large dashboard cards with gradients!

const profileRegex = /<div style="display:flex; flex-wrap:wrap; gap:20px; margin-bottom:20px;">/g;
const profileReplacement = `<div style="background:linear-gradient(135deg, #ffffff, #f8fafc); border-radius:20px; padding:24px; border:1px solid #e2e8f0; margin-bottom:24px; box-shadow:0 8px 30px rgba(0,0,0,0.02); position:relative; overflow:hidden;">
  <div style="position:absolute; right:-30px; top:-30px; width:150px; height:150px; border-radius:50%; background:linear-gradient(135deg, #eff6ff, #dbeafe); opacity:0.6; pointer-events:none;"></div>
  <h4 style="position:relative; z-index:1; font-size:1rem; font-weight:800; color:#1e293b; margin-bottom:20px; display:flex; align-items:center; gap:8px;"><span style="font-size:1.2rem;">👤</span> Student Identity</h4>
  <div style="display:flex; flex-wrap:wrap; gap:20px; position:relative; z-index:1;">`;

appCode = appCode.replace(profileRegex, profileReplacement);

const familyContactRegex = /<\/div>\s*<\/div>\s*<h4 style="font-size:0\.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #f1f5f9;">Family & Contact<\/h4>/g;
const familyContactReplacement = `</div>\n        </div>\n      </div>\n      <div style="background:linear-gradient(135deg, #ffffff, #f8fafc); border-radius:20px; padding:24px; border:1px solid #e2e8f0; margin-bottom:24px; box-shadow:0 8px 30px rgba(0,0,0,0.02); position:relative; overflow:hidden;">
  <div style="position:absolute; right:-30px; top:-30px; width:150px; height:150px; border-radius:50%; background:linear-gradient(135deg, #f3e8ff, #f5f3ff); opacity:0.6; pointer-events:none;"></div>
  <h4 style="position:relative; z-index:1; font-size:1rem; font-weight:800; color:#1e293b; margin-bottom:20px; display:flex; align-items:center; gap:8px;"><span style="font-size:1.2rem;">👨‍👩‍👧</span> Family & Contact</h4>`;
appCode = appCode.replace(familyContactRegex, familyContactReplacement);

const documentsSectionRegex = /<\/div>\s*<h4 style="font-size:0\.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid rgba\(226,232,240,0\.5\);">Documents \(Optional\)<\/h4>/g;
const documentsSectionReplacement = `</div>\n      </div>\n      <div style="background:linear-gradient(135deg, #ffffff, #f8fafc); border-radius:20px; padding:24px; border:1px solid #e2e8f0; margin-bottom:24px; box-shadow:0 8px 30px rgba(0,0,0,0.02); position:relative; overflow:hidden;">
  <div style="position:absolute; right:-30px; top:-30px; width:150px; height:150px; border-radius:50%; background:linear-gradient(135deg, #d1fae5, #ecfdf5); opacity:0.6; pointer-events:none;"></div>
  <h4 style="position:relative; z-index:1; font-size:1rem; font-weight:800; color:#1e293b; margin-bottom:20px; display:flex; align-items:center; gap:8px;"><span style="font-size:1.2rem;">📄</span> Documents</h4>`;
appCode = appCode.replace(documentsSectionRegex, documentsSectionReplacement);

const closingRegex = /<\/div>\s*<div style="display:flex; flex-wrap:wrap; gap:8px; background:linear-gradient/g;
const closingReplacement = `</div>\n      </div>\n      <div style="display:flex; flex-wrap:wrap; gap:8px; background:linear-gradient`;
appCode = appCode.replace(closingRegex, closingReplacement);

fs.writeFileSync('public/app.js', appCode);
console.log("Applied Big Dashboard Cards to Profile Tab!");
