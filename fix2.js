const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const targetStr = 'DVR AUTO-FILL';
let firstIndex = code.indexOf(targetStr);
let secondIndex = code.indexOf(targetStr, firstIndex + 10);

if (firstIndex !== -1 && secondIndex !== -1) {
    // We want to delete from the start of the line containing the first target
    // to the start of the line containing the second target.
    // Let's find the preceding `// ====` for both.
    
    let firstCut = code.lastIndexOf('// ======', firstIndex);
    let secondCut = code.lastIndexOf('// ======', secondIndex);
    
    if (firstCut !== -1 && secondCut !== -1) {
        let cleanCode = code.substring(0, firstCut) + code.substring(secondCut);
        fs.writeFileSync('public/app.js', cleanCode);
        console.log('Fixed app.js successfully by removing the bad duplicated block.');
    } else {
        console.log('Could not find cut points.');
    }
} else {
    console.log('Could not find boundaries.');
}
