const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

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

const regex3 = /const examsHtml = \(\(\) => \{\s*if \(\!exams\.length\) return `<div class="box">No exam records\.<\/div>`;\s*const byExam = \{\};\s*exams\.forEach\(\(e\) => \{\s*byExam\[e\.examName\] = byExam\[e\.examName\] \|\| \[\];\s*byExam\[e\.examName\]\.push\(e\);\s*\}\);\s*const blocks = Object\.entries\(byExam\)\s*\.map\(\(\[examName, rows\]\) => \{\s*const lines = rows\s*\.map\(\(r\) => `<div class="row"><b>\$\{r\.subject\}:<\/b> \$\{r\.marksObtained \|\| ""\}\/\$\{r\.maxMarks \|\| ""\} \(\$\{r\.grade \|\| ""\}\)<\/div>`\)\s*\.join\(""\);\s*return `<div class="box"><h2>\$\{examName\}<\/h2>\$\{lines\}<\/div>`;\s*\}\)\s*\.join\(""\);\s*return blocks;\s*\}\)\(\);/;

const replacement3 = `const examsHtml = (() => {
    if (!exams.length) return \`<div class="box">No exam records.</div>\`;
    const blocks = exams.map(e => {
        let marksArray = [];
        try { marksArray = JSON.parse(e.subjectMarks || "[]"); } catch(err){}
        const lines = marksArray.map(m => \`<div class="row"><b>\${m.subject}:</b> \${m.total || m.obtained || m.theory || "0"}/\${m.maxMarks || m.max || "100"}</div>\`).join("");
        return \`<div class="box"><h2>\${e.examName}</h2>\${lines}</div>\`;
    }).join("");
    return blocks;
  })();`;

code = code.replace(regex3, replacement3);

fs.writeFileSync('public/app.js', code);
console.log("Successfully replaced the print report exams logic!");
