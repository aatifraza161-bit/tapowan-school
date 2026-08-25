const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const oldStr = `    const amount = asNum(item.paidAmount);
    "Pending Fee Accounts": (store.fees || []).filter(x => String(x.status).toLowerCase() !== "paid").length,`;

const newStr = `    const amount = asNum(item.paidAmount);
    allTimeTotal += amount;
    
    if (window.currentFeeFilter === 'all') return sum + amount;
    if (window.currentFeeFilter === 'day' && date === today) return sum + amount;
    if (window.currentFeeFilter === 'month' && date.startsWith(curMonth)) return sum + amount;
    if (window.currentFeeFilter === 'year' && date.startsWith(curYear)) return sum + amount;
    
    return sum;
  }, 0);

  const lastThreePayments = fees.slice(0, 3).map(f => ({
    name: f.studentName || "Unknown",
    amount: asNum(f.paidAmount),
    date: displayDate(f.paymentDate) || "No Date"
  }));

  return {
    "Today's System Date": displayDate(today),
    "Total Students": (store.students || []).length,
    "Total Teachers": (store.teachers || []).length,
    "Total Classes": (store.classes || []).length,
    "Student Present Today": (store.attendance || []).filter(x => String(x.status).toLowerCase() === "present" && x.date === today).length,
    "Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present" && x.date === today).length,
    "Pending Fee Accounts": (store.fees || []).filter(x => String(x.status).toLowerCase() !== "paid").length,`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('public/app.js', code);
console.log('Fixed app.js dashboard stats block');
