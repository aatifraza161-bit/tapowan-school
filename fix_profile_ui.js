const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /<div style="flex:1; min-width:250px; display:grid; grid-template-columns:repeat\(auto-fit, minmax\(110px, 1fr\)\); gap:10px;">([\s\S]*?)<div style="display:flex; align-items:center; gap:12px;">\s*<div style="width:36px; height:36px; background:#fefce8; color:#eab308; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">📍<\/div>\s*<div>\s*<div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Full Address<\/div>\s*<div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\$\{student.address \|\| \(student.village \? `\$\{student.village\}, \$\{student.district \|\| ''\}, \$\{student.pin \|\| ''\}` : "-"\)\}<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const replacement = `<div style="flex:1; min-width:250px; display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px;">
          
          <!-- FULL NAME (Blue) -->
          <div style="background:#dbeafe; padding:12px; border-radius:14px; border:1px solid #bfdbfe; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#2563eb; opacity:0.1;"></div>
            <div style="position:relative; z-index:1;">
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Full Name</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.fullName || "-"}</div>
            </div>
          </div>
          
          <!-- CLASS & SEC (Purple) -->
          <div style="background:#f3e8ff; padding:12px; border-radius:14px; border:1px solid #e9d5ff; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#9333ea; opacity:0.1;"></div>
            <div style="position:relative; z-index:1;">
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Class & Sec</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${split.classPart || "-"} \${split.sectionPart ? \`(\${split.sectionPart})\` : ""}</div>
            </div>
          </div>
          
          <!-- ROLL NO (Green) -->
          <div style="background:#d1fae5; padding:12px; border-radius:14px; border:1px solid #a7f3d0; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#16a34a; opacity:0.1;"></div>
            <div style="position:relative; z-index:1;">
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Roll Number</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.rollNo || "-"}</div>
            </div>
          </div>
          
          <!-- DOB (Yellow) -->
          <div style="background:#fef3c7; padding:12px; border-radius:14px; border:1px solid #fde68a; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#d97706; opacity:0.1;"></div>
            <div style="position:relative; z-index:1;">
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Date of Birth</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.dob || "-"}</div>
            </div>
          </div>
          
          <!-- GENDER (Red) -->
          <div style="background:#fee2e2; padding:12px; border-radius:14px; border:1px solid #fecaca; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#dc2626; opacity:0.1;"></div>
            <div style="position:relative; z-index:1;">
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Gender</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.gender || "-"}</div>
            </div>
          </div>
          
          <!-- ADDRESS (Blue again) -->
          <div style="background:#dbeafe; padding:12px; border-radius:14px; border:1px solid #bfdbfe; grid-column:1/-1; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#2563eb; opacity:0.1;"></div>
            <div style="position:relative; z-index:1;">
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.04em;">Address</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.address || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <h4 style="font-size:0.82rem; font-weight:800; color:#334155; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #f1f5f9;">Family & Contact</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:20px;">
        
        <!-- PARENT / GUARDIAN (Purple) -->
        <div style="display:flex; align-items:center; gap:12px; background:#f3e8ff; padding:12px 14px; border-radius:14px; border:1px solid #e9d5ff; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#9333ea; opacity:0.1;"></div>
          <div style="position:relative; z-index:1; display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:#fff; color:#9333ea; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 2px 4px rgba(147,51,234,0.1);">👨‍👩‍👧</div>
            <div>
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Parent / Guardian</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.fatherName || student.parentName || "-"}</div>
            </div>
          </div>
        </div>
        
        <!-- MOTHER'S NAME (Green) -->
        <div style="display:flex; align-items:center; gap:12px; background:#d1fae5; padding:12px 14px; border-radius:14px; border:1px solid #a7f3d0; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#16a34a; opacity:0.1;"></div>
          <div style="position:relative; z-index:1; display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:#fff; color:#16a34a; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 2px 4px rgba(22,163,74,0.1);">👩</div>
            <div>
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Mother's Name</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.motherName || "-"}</div>
            </div>
          </div>
        </div>
        
        <!-- MOBILE NUMBER (Yellow) -->
        <div style="display:flex; align-items:center; justify-content:space-between; background:#fef3c7; padding:12px 14px; border-radius:14px; border:1px solid #fde68a; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#d97706; opacity:0.1;"></div>
          <div style="position:relative; z-index:1; display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:#fff; color:#d97706; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 2px 4px rgba(217,119,6,0.1);">📞</div>
            <div>
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Mobile Number</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.phone1 || student.phone || "-"}</div>
            </div>
          </div>
          \${(student.phone1 || student.phone) ? \`<a href="https://wa.me/91\${(student.phone1 || student.phone).replace(/\\D/g,'')}" target="_blank" title="WhatsApp Parent" style="width:32px; height:32px; background:linear-gradient(135deg, #25D366, #128C7E); color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; text-decoration:none; position:relative; z-index:2;">💬</a>\` : ''}
        </div>
        
        <!-- FULL ADDRESS (Red) -->
        <div style="display:flex; align-items:center; justify-content:space-between; background:#fee2e2; padding:12px 14px; border-radius:14px; border:1px solid #fecaca; grid-column:1/-1; position:relative; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="position:absolute; right:-20px; bottom:-20px; width:80px; height:80px; border-radius:50%; background:#dc2626; opacity:0.1;"></div>
          <div style="position:relative; z-index:1; display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:#fff; color:#dc2626; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 2px 4px rgba(220,38,38,0.1);">📍</div>
            <div>
              <div style="font-size:0.62rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">Full Address</div>
              <div style="color:#0f172a; font-weight:700; font-size:0.85rem;">\${student.address || (student.village ? \`\${student.village}, \${student.district || ''}, \${student.pin || ''}\` : "-")}</div>
            </div>
          </div>
        </div>
      </div>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('public/app.js', code);
    console.log('Successfully updated profile cards design!');
} else {
    console.log('Regex did not match app.js!');
}
