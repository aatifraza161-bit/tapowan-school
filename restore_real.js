const fs = require('fs');

const backupCode = fs.readFileSync('../../TapowanPublicSchool-fixed/public/app.js', 'utf8');
let currentCode = fs.readFileSync('public/app.js', 'utf8');

// The exact start string in the backup
const startStr = '  if (activeStudentProfileTab === "fees") {';
const startIdx = backupCode.indexOf(startStr);

// The exact end string in the backup
const endStr = '  grid.style.display = ""; // Ensure it is visible';
const endIdx = backupCode.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find boundaries in backup!');
    process.exit(1);
}

// Extract missing chunk
const missingChunk = backupCode.substring(startIdx, endIdx);

// Now find where to insert it in currentCode
// We need to find the end of the exams block in currentCode.
// It ends with:
//         });
//      }, 50);
//    }
//    return;
//  }
//  
//  grid.style.display = "grid";

const injectMarker = 'return;\n  }\n  \n  grid.style.display = "grid";';
const injectMarker2 = 'return;\n  }\n\n  grid.style.display = "grid";';
const injectMarker3 = 'return;\r\n  }\r\n  \r\n  grid.style.display = "grid";';
const injectMarker4 = 'return;\r\n  }\r\n\r\n  grid.style.display = "grid";';

let marker = null;
if (currentCode.includes(injectMarker)) marker = injectMarker;
else if (currentCode.includes(injectMarker2)) marker = injectMarker2;
else if (currentCode.includes(injectMarker3)) marker = injectMarker3;
else if (currentCode.includes(injectMarker4)) marker = injectMarker4;
else {
    // try finding just the end string
    const gridIdx = currentCode.indexOf('grid.style.display = "grid";');
    if (gridIdx !== -1) {
       // Just insert it before this
       const before = currentCode.substring(0, gridIdx);
       const after = currentCode.substring(gridIdx);
       currentCode = before + missingChunk + after;
       fs.writeFileSync('public/app.js', currentCode);
       console.log('Restored using fallback marker!');
       process.exit(0);
    }
}

if (marker) {
    const replacement = marker.replace('grid.style.display', missingChunk + 'grid.style.display');
    currentCode = currentCode.replace(marker, replacement);
    fs.writeFileSync('public/app.js', currentCode);
    console.log('Successfully restored the missing 700+ lines of code!');
} else {
    console.log('Could not find injection marker in current code!');
}
