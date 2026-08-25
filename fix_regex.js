const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /const filteredTotal = allCollections\.reduce\(\(sum, item\) => \{[\s\S]*?System Active Users.*?\n\s*\};\n\}/;

const newStr = `const filteredTotal = allCollections.reduce((sum, item) => {
    // Fees use paymentDate, Dues use today for collection day stats
    let rawDate = item.type === 'fee' ? item.paymentDate : today;
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
    "Teacher Present Today": (store.teacherAttendance || []).filter(x => String(x.status).toLowerCase() === "present" && x.date === today).length,
    "Pending Fee Accounts": (store.fees || []).filter(x => String(x.status).toLowerCase() !== "paid").length,
    "Total Payment Received": "₹" + filteredTotal.toLocaleString("en-IN"),
    "Lifetime Collection": "₹" + allTimeTotal.toLocaleString("en-IN"),
    "LastThree": lastThreePayments,
    "Books Issued": (store.library || []).filter(x => String(x.status).toLowerCase() === "issued").length,
    "Hostel Active": (store.hostel || []).filter(x => String(x.status).toLowerCase() === "active").length,
    "New Admissions": (store.admissions || []).length,
    "Pending Admissions": (store.admissions || []).filter(x => String(x.status).toLowerCase() === "pending").length,
    "System Active Users": (store.users || []).filter(x => String(x.status).toLowerCase() === "active").length
  };
}`;

if (regex.test(code)) {
    code = code.replace(regex, newStr);
    fs.writeFileSync('public/app.js', code);
    console.log('Fixed syntax error via regex!');
} else {
    console.log('Regex did not match!');
}
