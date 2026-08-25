const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const oldLogic = `        // Priority 1: Core subjects not yet taught today
        let pickedSub = validSubs.find(s => isCore(s.subjectName));`;

const newLogic = `        // Priority 1: Core subjects not yet taught today
        let coreSubs = validSubs.filter(s => isCore(s.subjectName));
        let pickedSub = coreSubs.length > 0 ? coreSubs[Math.floor(Math.random() * coreSubs.length)] : null;`;

if (code.includes(oldLogic)) {
    code = code.replace(oldLogic, newLogic);
    fs.writeFileSync('public/app.js', code);
    console.log("Successfully randomized core subject selection!");
} else {
    // try a regex in case of formatting issues
    const regex = /\/\/ Priority 1: Core subjects not yet taught today\s+let pickedSub = validSubs\.find\(s => isCore\(s\.subjectName\)\);/m;
    if (regex.test(code)) {
        code = code.replace(regex, newLogic);
        fs.writeFileSync('public/app.js', code);
        console.log("Successfully randomized via regex!");
    } else {
        console.log("Could not find the target string.");
    }
}
