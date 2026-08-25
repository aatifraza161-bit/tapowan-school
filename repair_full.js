const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

const brokenSection = `function getDashboardStats(store) {
  const fees = store.fees || [];
  
  if (userIsStudent()) {
    const s = getLinkedStudent();
    if (!s) return { "Status": "No Linked Record" };
      "My Pending Dues": "₹ " + totalBalance.toLocaleString('en-IN'),
      "Days Present": presentDays,
      "Days Absent": absentDays,
      "Class & Section": s.className || "N/A"
    };
  };
}

function renderStatsCards() {`;

const fixedSection = `function getDashboardStats(store) {
  const fees = store.fees || [];
  
  if (userIsStudent()) {
    const s = getLinkedStudent();
    if (!s) return { "Status": "No Linked Record" };
    
    const myFees = fees.filter(f => String(f.admissionNo) === String(s.admissionNo) || String(f.studentName) === String(s.fullName));
    const totalPaid = myFees.reduce((acc, val) => acc + asNum(val.paidAmount), 0);
    const totalBalance = myFees.reduce((acc, val) => acc + asNum(val.balance), 0);
    
    const myAtt = (store.attendance || []).filter(a => String(a.studentName) === String(s.fullName) || String(a.rollNo) === String(s.rollNo));
    const presentDays = myAtt.filter(a => String(a.status).toLowerCase() === "present").length;
    const absentDays = myAtt.filter(a => String(a.status).toLowerCase() === "absent").length;

    return {
      "My Total Paid": "₹ " + totalPaid.toLocaleString('en-IN'),
      "My Pending Dues": "₹ " + totalBalance.toLocaleString('en-IN'),
      "Days Present": presentDays,
      "Days Absent": absentDays,
      "Class & Section": s.className || "N/A"
    };
  }

  // Use robust local date logic instead of UTC to avoid timezone mismatch
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const curMonth = today.slice(0, 7);
  const curYear = today.slice(0, 4);

  const dues = store.dueManagement || [];
  
  const allCollections = [...(store.fees || []).map(f => ({ ...f, type: 'fee' })), ...dues.map(d => ({ ...d, type: 'due' }))];

  let allTimeTotal = 0;
  const filteredTotal = allCollections.reduce((sum, item) => {
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

  const lastThreePayments = (store.fees || []).slice(0, 3).map(f => ({
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
}

function renderStatsCards() {`;

if (code.includes(brokenSection)) {
  code = code.replace(brokenSection, fixedSection);
  fs.writeFileSync('public/app.js', code);
  console.log('Fixed completely!');
} else {
  console.log('Broken section not found! Need to investigate.');
}
