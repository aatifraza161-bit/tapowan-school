const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Make monthlyFee not required
const requiredOld = 'if (field === "paymentMethod" || field === "paymentDate" || field === "balance" || field === "totalFee" || field === "onlineAmount" || field === "cashAmount") input.required = false;';
const requiredNew = 'if (field === "paymentMethod" || field === "paymentDate" || field === "balance" || field === "totalFee" || field === "onlineAmount" || field === "cashAmount" || field === "monthlyFee") input.required = false;';
if (code.includes(requiredOld)) {
    code = code.replace(requiredOld, requiredNew);
}

// 2. Add Student dropdown to fs-modal
const fsModalOld = `<select id="fs-f-class" required style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;">
                <option value="">Select Class</option>
                \${allClasses().map(c => \`<option value="\${c}">\${c}</option>\`).join("")}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Fee Type *</label>`;

const fsModalNew = `<select id="fs-f-class" required style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;" onchange="
                const st = document.getElementById('fs-f-student');
                st.innerHTML = '<option value=\\'All\\'>All Students</option>';
                if (this.value && store.students) {
                  store.students.filter(s => s.className === this.value).forEach(s => {
                    st.innerHTML += '<option value=\\''+s.fullName+'\\'>'+s.fullName+'</option>';
                  });
                }
              ">
                <option value="">Select Class</option>
                \${allClasses().map(c => \`<option value="\${c}">\${c}</option>\`).join("")}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Student (Optional)</label>
              <select id="fs-f-student" style="width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.88rem;">
                <option value="All">All Students</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.84rem;font-weight:600;color:#475569;margin-bottom:5px;">Fee Type *</label>`;

if (code.includes(fsModalOld)) {
    code = code.replace(fsModalOld, fsModalNew);
}

// 3. Update fs-table headers
const fsTableHeadOld = `<th style="padding:10px 14px;text-align:left;color:#475569;">Class</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Fee Type</th>`;
const fsTableHeadNew = `<th style="padding:10px 14px;text-align:left;color:#475569;">Class</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Student</th>
                <th style="padding:10px 14px;text-align:left;color:#475569;">Fee Type</th>`;

if (code.includes(fsTableHeadOld)) {
    code = code.replace(fsTableHeadOld, fsTableHeadNew);
}

// 4. Update fs-table body in renderFSTable
const renderFSOld = `const fsList = filterClass ? feeStructures.filter(f => f.className === filterClass) : feeStructures;
    fsList.forEach((f, idx) => {
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      const tr = document.createElement("tr");
      tr.style.background = bg;
      tr.innerHTML = \`
        <td style="padding:10px 14px;color:#64748b;">\${idx + 1}</td>
        <td style="padding:10px 14px;color:#0f172a;font-weight:600;">\${f.className}</td>
        <td style="padding:10px 14px;"><span style="background:#e0e7ff;color:#3730a3;padding:4px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;">\${f.feeType}</span></td>`;

const renderFSNew = `const fsList = filterClass ? feeStructures.filter(f => f.className === filterClass) : feeStructures;
    fsList.forEach((f, idx) => {
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      const tr = document.createElement("tr");
      tr.style.background = bg;
      tr.innerHTML = \`
        <td style="padding:10px 14px;color:#64748b;">\${idx + 1}</td>
        <td style="padding:10px 14px;color:#0f172a;font-weight:600;">\${f.className}</td>
        <td style="padding:10px 14px;color:#334155;">\${f.studentName && f.studentName !== "All" ? f.studentName : '<span style="color:#94a3b8">All Students</span>'}</td>
        <td style="padding:10px 14px;"><span style="background:#e0e7ff;color:#3730a3;padding:4px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;">\${f.feeType}</span></td>`;

if (code.includes(renderFSOld)) {
    code = code.replace(renderFSOld, renderFSNew);
}

// 5. openFSModal update
const openFSModalOld = `document.getElementById("fs-f-class").value  = existing?.className || "";
    document.getElementById("fs-f-type").value   = existing?.feeType || "Tuition Fee";`;

const openFSModalNew = `document.getElementById("fs-f-class").value  = existing?.className || "";
    const st = document.getElementById('fs-f-student');
    st.innerHTML = '<option value="All">All Students</option>';
    if (existing?.className && store.students) {
      store.students.filter(s => s.className === existing.className).forEach(s => {
        st.innerHTML += '<option value="'+s.fullName+'">'+s.fullName+'</option>';
      });
    }
    st.value = existing?.studentName || "All";
    document.getElementById("fs-f-type").value   = existing?.feeType || "Tuition Fee";`;

if (code.includes(openFSModalOld)) {
    code = code.replace(openFSModalOld, openFSModalNew);
}

// 6. submit payload update
const payloadOld = `const payload = {
        className:   document.getElementById("fs-f-class").value,
        feeType:     document.getElementById("fs-f-type").value,
        amount:      document.getElementById("fs-f-amount").value,`;

const payloadNew = `const payload = {
        className:   document.getElementById("fs-f-class").value,
        studentName: document.getElementById("fs-f-student").value,
        feeType:     document.getElementById("fs-f-type").value,
        amount:      document.getElementById("fs-f-amount").value,`;

if (code.includes(payloadOld)) {
    code = code.replace(payloadOld, payloadNew);
}

// 7. populateMonthlyFeeSelect
const popOld = `const options = cls
      ? feeStructures.filter(f => f.className === cls)
      : feeStructures;`;

const popNew = `const studentField = document.querySelector("#dynamic-form [name='studentName']");
    let selectedStudent = "";
    if (studentField && studentField.value) {
        selectedStudent = studentField.value;
        if (selectedStudent && store.students) {
           const stuObj = store.students.find(s => s.id == selectedStudent);
           if(stuObj) selectedStudent = stuObj.fullName;
        }
    }

    let options = cls ? feeStructures.filter(f => f.className === cls) : feeStructures;
    
    // Apply student-specific overrides
    const feeTypeMap = {};
    options.filter(f => !f.studentName || f.studentName === "All").forEach(f => {
        feeTypeMap[f.feeType] = f;
    });
    if (selectedStudent) {
        options.filter(f => f.studentName === selectedStudent).forEach(f => {
            feeTypeMap[f.feeType] = f; // Override with student-specific fee structure
        });
    }
    options = Object.values(feeTypeMap);`;

if (code.includes(popOld)) {
    code = code.replace(popOld, popNew);
}

// Trigger update on student selection
const studentTriggerOld = `if (currentModule === "fees" && field === "studentName") {
        input.addEventListener("change", (e) => {
          const sid = e.target.value;`;

const studentTriggerNew = `if (currentModule === "fees" && field === "studentName") {
        input.addEventListener("change", (e) => {
          const clsF = document.querySelector("#dynamic-form [name='className']");
          if(clsF) showBDInfoForClass(clsF.value);
          const sid = e.target.value;`;

if (code.includes(studentTriggerOld)) {
    code = code.replace(studentTriggerOld, studentTriggerNew);
}

fs.writeFileSync('public/app.js', code);
console.log("Successfully patched fees logic!");
