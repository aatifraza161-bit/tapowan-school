const fs = require('fs');
let appCode = fs.readFileSync('public/app.js', 'utf8');

const regex = /let paidAmount = fees\.reduce\(\(sum, f\) => sum \+ asNum\(f\.paidAmount\), 0\);\s*let dueAmount = fees\.reduce\(\(sum, f\) => sum \+ asNum\(f\.balance\), 0\);\s*totalFee \+= dues\.reduce\(\(sum, d\) => sum \+ asNum\(d\.dueAmount\), 0\);\s*paidAmount \+= dues\.reduce\(\(sum, d\) => sum \+ asNum\(d\.paidAmount\), 0\);\s*dueAmount \+= dues\.reduce\(\(sum, d\) => sum \+ asNum\(d\.balance\), 0\);/g;

const replacement = `if (activeStudentProfileTab === "fees") {
    const store = getStore();
    const fees = (store.fees || []).filter((f) => f.studentName === student.fullName);
    let dues = (store.dueManagement || []).filter((d) => d.studentName === student.fullName);

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
    dueAmount += dues.reduce((sum, d) => sum + asNum(d.balance), 0);`;

appCode = appCode.replace(regex, replacement);
fs.writeFileSync('public/app.js', appCode);
console.log("Restored fees tab logic!");
