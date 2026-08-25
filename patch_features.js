const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Add isFreeOfCharge to admissions fields
const adFieldsOld = '"admissionFee", "monthlyFee", "transportFee", "discount",';
const adFieldsNew = '"admissionFee", "monthlyFee", "isFreeOfCharge", "transportFee", "discount",';
if (code.includes(adFieldsOld)) code = code.replace(adFieldsOld, adFieldsNew);

// 2. Add isFreeOfCharge to students fields
const stFieldsOld = '"status", "monthlyFee", "aadhar", "tc",';
const stFieldsNew = '"status", "monthlyFee", "isFreeOfCharge", "aadhar", "tc",';
if (code.includes(stFieldsOld)) code = code.replace(stFieldsOld, stFieldsNew);

// 3. Inject checkbox rendering in renderForm
const checkboxLogic = `} else if (field === "isFreeOfCharge") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.name = field;
        input.style.width = "20px";
        input.style.height = "20px";
        input.addEventListener("change", (e) => {
          const feeField = refs.dynamicForm.querySelector("[name='monthlyFee']");
          if (feeField) {
            feeField.required = !e.target.checked;
            if (e.target.checked) feeField.value = "0";
          }
        });
      } else if (field === "gender") {`;
const genderIf = `} else if (field === "gender") {`;
if (code.includes(genderIf)) code = code.replace(genderIf, checkboxLogic);

// 4. Update submitAdmission auto-add fee
const submitFeeOld = `    if (payload.monthlyFee && Number(payload.monthlyFee) >= 0) {
      try {
        await api('/api/modules/feeStructures', { 
          method: "POST", 
          body: JSON.stringify({
            className: payload.className,
            studentName: payload.fullName,
            feeType: "Tuition Fee",
            amount: payload.monthlyFee,
            term: "Monthly"
          })
        });`;
const submitFeeNew = `    if (String(payload.isFreeOfCharge) !== "true" && String(payload.isFreeOfCharge) !== "on" && payload.monthlyFee && Number(payload.monthlyFee) > 0) {
      try {
        await api('/api/modules/feeStructures', { 
          method: "POST", 
          body: JSON.stringify({
            className: payload.className,
            studentName: payload.fullName,
            fatherName: payload.fatherName || payload.parentName || "",
            feeType: "Tuition Fee",
            amount: payload.monthlyFee,
            term: "Monthly"
          })
        });`;
if (code.includes(submitFeeOld)) code = code.replace(submitFeeOld, submitFeeNew);

// 5. Update saveRecord auto-add fee
const saveFeeOld = `    if (currentModule === "students" && payload.monthlyFee && Number(payload.monthlyFee) >= 0) {
      try {
        await api('/api/modules/feeStructures', { 
          method: "POST", 
          body: JSON.stringify({
            className: payload.className,
            studentName: payload.fullName,
            feeType: "Tuition Fee",
            amount: payload.monthlyFee,
            term: "Monthly"
          })
        });`;
const saveFeeNew = `    if (currentModule === "students" && String(payload.isFreeOfCharge) !== "true" && String(payload.isFreeOfCharge) !== "on" && payload.monthlyFee && Number(payload.monthlyFee) > 0) {
      try {
        await api('/api/modules/feeStructures', { 
          method: "POST", 
          body: JSON.stringify({
            className: payload.className,
            studentName: payload.fullName,
            fatherName: payload.fatherName || payload.parentName || "",
            feeType: "Tuition Fee",
            amount: payload.monthlyFee,
            term: "Monthly"
          })
        });`;
if (code.includes(saveFeeOld)) code = code.replace(saveFeeOld, saveFeeNew);

fs.writeFileSync('public/app.js', code);
console.log("Successfully patched app.js");
