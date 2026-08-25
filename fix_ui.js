const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Add freeTeachersBtn to refs
if (!code.includes('freeTeachersBtn: document.getElementById("freeTeachersBtn")')) {
    code = code.replace(/smartGenerateBtn: document\.getElementById\("smartGenerateBtn"\),/g, 'smartGenerateBtn: document.getElementById("smartGenerateBtn"),\\n  freeTeachersBtn: document.getElementById("freeTeachersBtn"),');
}

// 2. Toggle freeTeachersBtn visibility in Timetable
if (!code.includes('refs.freeTeachersBtn.classList.toggle')) {
    code = code.replace(/if \(refs\.smartGenerateBtn\) \{[\\s\\S]*?\}/, '$&\\n  if (refs.freeTeachersBtn) {\\n    refs.freeTeachersBtn.classList.toggle("hidden", currentModule !== "timetable");\\n  }');
}

// 3. Remove period time from Timetable headers
code = code.replace(/let timeStr = \(sampleRec && sampleRec\.startTime\)[\\s\\S]*?;/, 'let timeStr = "";');
// In case the old replace didn't take and it's the old version:
code = code.replace(/let timeStr = sampleRec \? '<br><span[\\s\\S]*?' : '';/, 'let timeStr = "";');

// 4. Custom Sort for Indian Classes
const sortCodeOld = 'uniqueClasses.sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));';
const sortCodeNew = `
    const classOrder = ["nursery", "lkg", "ukg", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];
    uniqueClasses.sort((a, b) => {
        const getBase = (cls) => {
            const parts = cls.split('-');
            let base = parts[0].toLowerCase().trim();
            // handle "class 1"
            base = base.replace('class ', '').replace('class', '');
            return { base, original: cls };
        };
        const baseA = getBase(a).base;
        const baseB = getBase(b).base;
        const idxA = classOrder.indexOf(baseA);
        const idxB = classOrder.indexOf(baseB);
        if (idxA !== -1 && idxB !== -1) {
            return idxA - idxB || a.localeCompare(b);
        } else if (idxA !== -1) {
            return -1;
        } else if (idxB !== -1) {
            return 1;
        }
        return a.localeCompare(b, undefined, {numeric: true});
    });
`;

if (code.includes(sortCodeOld)) {
    code = code.replace(sortCodeOld, sortCodeNew);
} else {
    // If it has weird spacing
    code = code.replace(/uniqueClasses\.sort\(\(a,\s*b\)\s*=>\s*a\.localeCompare\(b,\s*undefined,\s*\{numeric:\s*true\}\)\);/g, sortCodeNew);
}


fs.writeFileSync('public/app.js', code);
console.log('Applied UI fixes.');
