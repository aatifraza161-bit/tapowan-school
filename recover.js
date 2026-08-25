const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const missingBlock = `
  // Inject Due Alert Container for Fees module
  if (currentModule === "fees") {
    const dueContainer = document.createElement("div");
    dueContainer.id = "bd-due-alert-container";
    dueContainer.style.width = "100%";
    dueContainer.style.gridColumn = "1 / -1";
    dueContainer.style.marginBottom = "10px";
    refs.dynamicForm.appendChild(dueContainer);
  }

  if (currentModule === "dueManagement") {
    const store = getStore();
    const studentOptions = (store.students || []).map((s) => ({
      value: s.fullName,
      label: \`\${s.admissionNo ? \`\${s.admissionNo} - \` : ""}\${s.fullName}\${s.rollNo ? \` (\${s.rollNo})\` : ""}\${s.fatherName || s.parentName ? \` (F: \${s.fatherName || s.parentName})\` : ""}\${s.className ? \` - \${s.className}\` : ""}\`,
      rollNo: s.rollNo || "",
      className: s.className || "",
      parentName: s.fatherName || s.parentName || "",
      fatherName: s.fatherName || s.parentName || "",
      admissionNo: s.admissionNo || ""
    }));
    const classOptions = Array.from(new Set((store.classes || []).map((x) => [x.className, x.section].filter(Boolean).join("-")).filter(Boolean)));
    const formRefs = {};
    
    let initialValues = {};
    if (editRecordId != null) {
      initialValues = (store.dueManagement || []).find(r => r.id === editRecordId) || {};
    }

    renderDueManagementForm(cfg, studentOptions, classOptions, initialValues, formRefs);
    return;
  }
  const store = getStore();

  const classOptions = Array.from(new Set((store.classes || []).map((x) => [x.className, x.section].filter(Boolean).join("-")).filter(Boolean)));
  const studentOptions = (store.students || []).map((s) => ({
      value: s.fullName,
      label: \`\${s.admissionNo ? \`\${s.admissionNo} - \` : ""}\${s.fullName}\${s.rollNo ? \` (\${s.rollNo})\` : ""}\${s.fatherName || s.parentName ? \` (F: \${s.fatherName || s.parentName})\` : ""}\${s.className ? \` - \${s.className}\` : ""}\`,
      rollNo: s.rollNo || "",
      className: s.className || "",
      parentName: s.fatherName || s.parentName || "",
      fatherName: s.fatherName || s.parentName || "",
      admissionNo: s.admissionNo || ""
  }));
  `;

const targetAnchor = `const teacherOptions = (store.teachers || []).map((t) => ({`;
if (code.includes(targetAnchor)) {
  code = code.replace(targetAnchor, missingBlock + targetAnchor);
  fs.writeFileSync('public/app.js', code);
  console.log("Recovered the deleted block in app.js");
} else {
  console.log("Could not find the target anchor.");
}
