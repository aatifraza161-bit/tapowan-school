const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const searchStr = '  const skipFiles = ["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar", "id"];';

const newTimetableLogic = `
  if (currentModule === "timetable") {
    const daySelect = refs.dayFilter?.value || "Monday";
    const dayRecords = rows.filter(r => r.day === daySelect);
    if (!dayRecords.length) return window.alert("No timetable records found for " + daySelect);

    const uniqueClasses = Array.from(new Set(dayRecords.map(r => r.className)));
    const classOrder = ["nursery", "lkg", "ukg", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];
    uniqueClasses.sort((a, b) => {
        const getBase = (cls) => {
            let base = cls.split('-')[0].toLowerCase().trim();
            base = base.replace('class ', '').replace('class', '');
            return base;
        };
        const idxA = classOrder.indexOf(getBase(a));
        const idxB = classOrder.indexOf(getBase(b));
        if (idxA !== -1 && idxB !== -1) return idxA - idxB || a.localeCompare(b);
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b, undefined, {numeric: true});
    });

    const allPeriods = Array.from(new Set(dayRecords.map(r => parseInt(r.period.replace(/\\D/g,'')) || 0))).filter(p=>p>0).sort((a,b)=>a-b);
    let lunchAfter = 4;
    
    let head = ["CLASS"];
    let headerCols = [];
    allPeriods.forEach(p => {
       if (p > lunchAfter && !headerCols.includes("LUNCH")) headerCols.push("LUNCH");
       headerCols.push("Period " + p);
    });
    
    headerCols.forEach(col => {
       if (col === "LUNCH") head.push("LUNCH BREAK");
       else head.push(col.toUpperCase());
    });

    const body = uniqueClasses.map(cls => {
       let rowArr = [cls];
       let classRecords = dayRecords.filter(r => r.className === cls);
       
       headerCols.forEach(col => {
          if (col === "LUNCH") {
              rowArr.push("---");
          } else {
              let rec = classRecords.find(r => r.period === col);
              if (rec) {
                 rowArr.push(rec.subject + "\\n" + (rec.teacher || "-"));
              } else {
                 rowArr.push("Free\\n-");
              }
          }
       });
       return rowArr;
    });

    const doc = new window.jspdf.jsPDF('landscape', 'pt', 'a4');
    doc.setFontSize(14);
    doc.text(\`Timetable - \${daySelect}\`, 40, 40);
    
    doc.autoTable({ 
       head: [head], 
       body: body, 
       startY: 50, 
       styles: { fontSize: 8, cellPadding: 4, halign: 'center', valign: 'middle' },
       headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
       columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } }
    });
    
    doc.save(\`timetable-\${daySelect}-\${todayStr()}.pdf\`);
    return;
  }

`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, newTimetableLogic + searchStr);
    fs.writeFileSync('public/app.js', code);
    console.log("Successfully added timetable PDF export!");
} else {
    console.log("Could not find insertion point!");
}
