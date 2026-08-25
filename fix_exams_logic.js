const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex1 = /const byExam = {};\s*exams\.forEach\(\(e\) => \{\s*byExam\[e\.examName\] = byExam\[e\.examName\] \|\| \[\];\s*byExam\[e\.examName\]\.push\(e\);\s*\}\);\s*const totalObtained = exams\.reduce\(\(sum, e\) => sum \+ asNum\(e\.marksObtained\), 0\);\s*const totalMax = exams\.reduce\(\(sum, e\) => sum \+ asNum\(e\.maxMarks\), 0\);\s*const pct = totalMax > 0 \? Math\.round\(\(totalObtained \/ totalMax\) \* 1000\) \/ 10 : 0;\s*const resultStatus = pct >= 50 \? "Pass" : "Fail";\s*\/\/\s*Prepare Growth Data\s*const examGrowthData = \{ labels: \[\], data: \[\] \};\s*Object\.entries\(byExam\)\s*\.sort\(\(a, b\) => String\(a\[0\]\)\.localeCompare\(String\(b\[0\]\)\)\)\s*\.forEach\(\(\[examName, rows\]\) => \{\s*const sumMax = rows\.reduce\(\(s,r\) => s \+ asNum\(r\.maxMarks\), 0\);\s*const sumObt = rows\.reduce\(\(s,r\) => s \+ asNum\(r\.marksObtained\), 0\);\s*const p = sumMax > 0 \? Math\.round\(\(sumObt\/sumMax\)\*100\) : 0;\s*examGrowthData\.labels\.push\(examName\);\s*examGrowthData\.data\.push\(p\);\s*\}\);\s*const examCards = Object\.entries\(byExam\)\s*\.sort\(\(a, b\) => String\(a\[0\]\)\.localeCompare\(String\(b\[0\]\)\)\)\s*\.map\(\(\[examName, rows\]\) => \{\s*const lines = rows\s*\.map\(\(r\) => `<div style="margin-top:6px; font-size:0\.85rem; color:#334155;"><b>\$\{r\.subject\}:<\/b> \$\{r\.marksObtained \|\| ""\}\/\$\{r\.maxMarks \|\| ""\} \(\$\{r\.grade \|\| ""\}\)<\/div>`\)\s*\.join\(""\);\s*return `<div class="panel" style="margin-bottom:12px; border-radius:12px; box-shadow:0 2px 4px rgba\(0,0,0,0\.02\);"><h3 style="margin-bottom:8px; font-size:1rem; color:#0f172a;">\$\{examName\}<\/h3>\$\{lines\}<\/div>`;\s*\}\)\s*\.join\(""\);/;

const replacement1 = `    const byExam = {};
    let grandObtained = 0;
    let grandMax = 0;
    
    exams.forEach((e) => {
      let marksArray = [];
      try { marksArray = JSON.parse(e.subjectMarks || "[]"); } catch(err){}
      
      let examObtained = 0;
      let examMax = 0;
      marksArray.forEach(m => {
          examObtained += asNum(m.total || m.obtained || m.theory);
          examMax += asNum(m.maxMarks || m.max || 100);
      });
      
      if (examObtained === 0 && asNum(e.totalMarks) > 0) {
          examObtained = asNum(e.totalMarks);
          examMax = 100; // Fallback
      }

      grandObtained += examObtained;
      grandMax += examMax;
      
      const p = examMax > 0 ? Math.round((examObtained/examMax)*100) : asNum(e.percentage || "0");
      byExam[e.examName] = {
         examName: e.examName,
         percentage: p,
         status: e.resultStatus || (p >= 33 ? "Pass" : "Fail"),
         marksArray: marksArray
      };
    });

    const totalObtained = grandObtained;
    const totalMax = grandMax;
    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
    const resultStatus = pct >= 33 ? "Pass" : "Fail";

    // Prepare Growth Data
    const examGrowthData = { labels: [], data: [] };
    Object.values(byExam)
      .sort((a, b) => String(a.examName).localeCompare(String(b.examName)))
      .forEach((e) => {
         examGrowthData.labels.push(e.examName);
         examGrowthData.data.push(e.percentage);
      });

    const examCards = Object.values(byExam)
      .sort((a, b) => String(a.examName).localeCompare(String(b.examName)))
      .map((e) => {
        const lines = e.marksArray
          .map((m) => \`<div style="margin-top:6px; font-size:0.85rem; color:#334155;"><b>\${m.subject}:</b> \${m.total || m.obtained || m.theory || "0"}/\${m.maxMarks || m.max || "100"}</div>\`)
          .join("");
        return \`<div class="panel" style="margin-bottom:12px; border-radius:12px; box-shadow:0 2px 4px rgba(0,0,0,0.02);"><h3 style="margin-bottom:8px; font-size:1rem; color:#0f172a; display:flex; justify-content:space-between; align-items:center;"><span>\${e.examName}</span> <span style="font-size:0.8rem; color:\${e.status === 'Pass'?'#16a34a':'#dc2626'}; font-weight:600;">\${e.percentage}% | \${e.status}</span></h3>\${lines}</div>\`;
      })
      .join("");`;

code = code.replace(regex1, replacement1);


const regex2 = /const totalObtained = exams\.reduce\(\(sum, e\) => sum \+ asNum\(e\.marksObtained\), 0\);\s*const totalMax = exams\.reduce\(\(sum, e\) => sum \+ asNum\(e\.maxMarks\), 0\);\s*const pct = totalMax > 0 \? Math\.round\(\(totalObtained \/ totalMax\) \* 1000\) \/ 10 : 0;\s*const result = pct >= 50 \? "Pass" : "Fail";/;

const replacement2 = `  let grandObtained = 0;
  let grandMax = 0;
  exams.forEach((e) => {
      let marksArray = [];
      try { marksArray = JSON.parse(e.subjectMarks || "[]"); } catch(err){}
      let examObtained = 0;
      let examMax = 0;
      marksArray.forEach(m => {
          examObtained += asNum(m.total || m.obtained || m.theory);
          examMax += asNum(m.maxMarks || m.max || 100);
      });
      grandObtained += examObtained;
      grandMax += examMax;
  });
  const totalObtained = grandObtained;
  const totalMax = grandMax;
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
  const result = pct >= 33 ? "Pass" : "Fail";`;

code = code.replace(regex2, replacement2);


const regex3 = /const byExam = \{\};\s*exams\.forEach\(\(e\) => \{\s*byExam\[e\.examName\] = byExam\[e\.examName\] \|\| \[\];\s*byExam\[e\.examName\]\.push\(e\);\s*\}\);\s*const blocks = Object\.entries\(byExam\)\s*\.map\(\(\[examName, rows\]\) => \{\s*const lines = rows\s*\.map\(\(r\) => `<div class="row"><b>\$\{r\.subject\}:<\/b> \$\{r\.marksObtained \|\| ""\}\/\$\{r\.maxMarks \|\| ""\} \(\$\{r\.grade \|\| ""\}\)<\/div>`\)\s*\.join\(""\);\s*return `<div class="box"><h2>\$\{examName\}<\/h2>\$\{lines\}<\/div>`;\s*\}\)\s*\.join\(""\);/;

const replacement3 = `    const blocks = exams.map(e => {
        let marksArray = [];
        try { marksArray = JSON.parse(e.subjectMarks || "[]"); } catch(err){}
        const lines = marksArray.map(m => \`<div class="row"><b>\${m.subject}:</b> \${m.total || m.obtained || m.theory || "0"}/\${m.maxMarks || m.max || "100"}</div>\`).join("");
        return \`<div class="box"><h2>\${e.examName}</h2>\${lines}</div>\`;
    }).join("");`;

code = code.replace(regex3, replacement3);

fs.writeFileSync('public/app.js', code);
console.log("Exams logic successfully replaced!");
