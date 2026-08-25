const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const badPart = `    let rawDate = item.type === 'fee' ? item.paymentDate : today;
    const date = normalizeToISO(rawDate);
    const amount = asNum(item.paidAmount);
    "Total Teachers": (store.teachers || []).length,
    "Total Classes": (store.classes || []).length,
    "Student Present Today": (store.attendance || []).filter(x => String(x.status).toLowerCase() === "present").length,
    "Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present").length,`;

const goodPart = `    let rawDate = item.type === 'fee' ? item.paymentDate : today;
    const date = normalizeToISO(rawDate);
    const amount = asNum(item.paidAmount);
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
    "Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present" && x.date === today).length,`;

if (code.includes(badPart)) {
    code = code.replace(badPart, goodPart);
    fs.writeFileSync('public/app.js', code);
    console.log("Successfully repaired app.js");
} else {
    console.log("Could not find the bad part to replace.");
}
