const fs = require('fs');

const backupPath = '../../TapowanPublicSchool-fixed/public/app.js';
const currentPath = 'public/app.js';

const backupCode = fs.readFileSync(backupPath, 'utf8');
let currentCode = fs.readFileSync(currentPath, 'utf8');

const startIdx = backupCode.indexOf('if (activeStudentProfileTab === "fees") {');
const endString = 'grid.style.display = "grid";';
const endIdx = backupCode.indexOf(endString, startIdx); // Find the FIRST occurrence of grid display AFTER startIdx

console.log('startIdx:', startIdx);
console.log('endIdx:', endIdx);

const missingCode = backupCode.substring(startIdx, endIdx);

// Now find where to inject it in currentCode
// currentCode looks like:
//      }, 50);
//    }
//    return;
//  }
//  
//  grid.style.display = "grid";

const injectPointStr = 'return;\n  }\n  \n  grid.style.display = "grid";';
const injectPointStrAlternative = 'return;\n  }\n\n  grid.style.display = "grid";';
const injectIdx = currentCode.indexOf(injectPointStr) !== -1 ? currentCode.indexOf(injectPointStr) : currentCode.indexOf(injectPointStrAlternative);

if (injectIdx !== -1) {
    const stringToReplace = currentCode.indexOf(injectPointStr) !== -1 ? injectPointStr : injectPointStrAlternative;
    currentCode = currentCode.replace(stringToReplace, 'return;\n  }\n\n  ' + missingCode + endString);
    fs.writeFileSync('public/app.js', currentCode);
    console.log('Successfully injected missing code!');
} else {
    // Let's just find the first grid.style.display = "grid"; in current code
    const currGridIdx = currentCode.indexOf(endString);
    console.log('currGridIdx:', currGridIdx);
    if (currGridIdx !== -1) {
        // Find the "return;\n  }" right before currGridIdx
        const strBefore = currentCode.substring(currGridIdx - 30, currGridIdx);
        console.log('String before currGridIdx:', strBefore);
        
        const replaceRegex = /return;\s*\}\s*grid\.style\.display = "grid";/;
        if (replaceRegex.test(currentCode)) {
            currentCode = currentCode.replace(replaceRegex, 'return;\n  }\n\n  ' + missingCode + endString);
            fs.writeFileSync('public/app.js', currentCode);
            console.log('Dynamically replaced and injected!');
        } else {
            console.log('Regex did not match!');
        }
    } else {
        console.log('Could not find injection point!');
    }
}
