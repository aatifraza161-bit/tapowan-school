const fs = require('fs');
let code = fs.readFileSync('public/exam_module.js', 'utf8');

// Add the THO option to getOptions500()
code = code.replace(
  '<option value="state">State Board Layout</option>',
  '<option value="state">State Board Layout</option><option value="tho">Talent Hunt Olympiad (THO)</option>'
);

// We need to inject `getThoAdmitCardHtml` and update the generator switch
const generatorHook = `      if (theme === "primary") return getPrimaryAdmitCardHtml(student, examName, config);`;
const thoHook = `      if (theme === "tho") return getThoAdmitCardHtml(student, examName, config);\n` + generatorHook;
code = code.replace(generatorHook, thoHook);

const thoTemplate = `
function getThoAdmitCardHtml(student, examName, config) {
    const store = typeof getStore !== 'undefined' ? getStore() : {};
    const schoolName = store.schoolName || "TALENT HUNT OLYMPIAD";
    const admNo = student.admissionNo || '-';
    const photoUrl = student.photo || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23e2e8f0' viewBox='0 0 24 24'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
    
    // Exact layout from the screenshot (3 columns)
    return \`
    <div style="width: 210mm; background: #fff; border: 2px solid #b32a22; padding: 3px; font-family: 'Arial', sans-serif; box-sizing: border-box; page-break-inside: avoid; margin-bottom: 20px;">
        <div style="border: 1px solid #b32a22; display: flex; width: 100%; height: auto; align-items: stretch;">
            
            <!-- Left Column: Branding -->
            <div style="width: 30%; background: #c5d886; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-right: 2px solid #fff;">
                <div style="padding: 10px;">
                    <h1 style="margin: 0; color: #000; font-size: 42px; font-weight: 900; letter-spacing: 5px;">T<span style="color:#d8bc3a">H</span>O</h1>
                    <div style="font-size: 10px; font-weight: bold; margin-top: -5px;">TALENT HUNT OLYMPIAD</div>
                </div>
                <div style="width: 100%; background: #92b742; color: #fff; font-weight: bold; font-size: 14px; padding: 8px 0; text-align: center; margin: 10px 0;">
                    ADMIT CARD
                </div>
                <div style="padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
                    <div style="font-size: 9px; font-weight: bold; margin-bottom: 2px;">Head Office :</div>
                    <div style="font-size: 9px;">\${store.schoolAddress || 'Plot No. 99, Sector 44, Gurgaon-122 003 (HR)'}</div>
                    <div style="font-size: 9px;">Tel : \${store.schoolPhone || '0124-4951200'}</div>
                    <div style="font-size: 9px;">e-mail : \${store.schoolEmail || 'info@sofworld.org'}</div>
                </div>
            </div>

            <!-- Middle Column: Details -->
            <div style="flex: 1; background: #fff; padding: 20px; font-size: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; width: 130px;">Date of Exam :</td>
                        <td style="padding: 8px 0; font-weight: bold;" contenteditable="true">SUNDAY, 16th FEBRUARY, 2026</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">Reporting Time :</td>
                        <td style="padding: 8px 0; font-weight: bold;" contenteditable="true">12:30 P.M</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;">Time of Exam :</td>
                        <td style="padding: 8px 0; font-weight: bold;" contenteditable="true">1:00 - 2:00 P.M</td>
                    </tr>
                    <tr><td colspan="2" style="height: 15px;"></td></tr>
                    <tr>
                        <td style="padding: 8px 0;">Name of the Candidate :</td>
                        <td style="padding: 8px 0; font-weight: bold; text-transform: uppercase;" contenteditable="true">\${student.fullName}</td>
                    </tr>
                </table>
                <div style="display: flex; margin-top: 15px;">
                    <div style="flex: 1;">Class : <span style="font-weight: bold;" contenteditable="true">\${student.className}</span></div>
                    <div style="flex: 1;">Roll No. : <span style="font-weight: bold;" contenteditable="true">\${student.rollNo || '-'}</span></div>
                </div>
                <div style="margin-top: 20px;">
                    <div style="margin-bottom: 5px;">Centre of Examination :</div>
                    <div style="font-weight: bold; text-transform: uppercase;" contenteditable="true">
                        \${store.schoolName || 'MAHARANA PRATAP PUBLIC SCHOOL'}<br/>
                        \${store.schoolAddress || 'OPP. SMALL RAILWAY STATION KURUKSHETRA UNIVERSITY ROAD (THANESAR)'}
                    </div>
                </div>
            </div>

            <!-- Right Column: Photo & Signatures -->
            <div style="width: 25%; background: #dae5b3; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 10px; border-left: 2px solid #fff;">
                <div style="width: 120px; height: 140px; background: #fff; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; color: #666; padding: 10px;">
                    <img src="\${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; display: \${student.photo ? 'block' : 'none'};" />
                    <span style="display: \${student.photo ? 'none' : 'block'};">PHOTO<br/>Candidate should paste his/her recent passport size photograph here attested by the School Principal.</span>
                </div>
                <div style="text-align: center; margin-top: 20px; width: 100%;">
                    <div style="height: 30px;"></div>
                    <div style="font-size: 10px;">Signature of the candidate</div>
                </div>
                <div style="text-align: center; margin-top: 20px; width: 100%;">
                    <div style="height: 40px; display:flex; align-items:flex-end; justify-content:center;">
                        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='30' viewBox='0 0 100 30'><path d='M10,20 Q30,5 50,20 T90,10' fill='none' stroke='%23000' stroke-width='2'/></svg>" style="height: 30px; opacity: 0.7;"/>
                    </div>
                    <div style="font-size: 12px; font-weight: bold;">Chairman</div>
                </div>
            </div>

        </div>
    </div>
    \`;
}
`;

code = code + '\n' + thoTemplate;

fs.writeFileSync('public/exam_module.js', code);
console.log('THO template added.');
