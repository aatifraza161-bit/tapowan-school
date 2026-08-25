const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const searchStart = '        // Priority 1: Core subjects not yet taught today';
const searchEnd = '        // Priority 3: Ignore daily limit and pick any valid (if strictly needed)';

const startIndex = code.indexOf(searchStart);
const endIndex = code.indexOf(searchEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `        let pickedSub = null;

        // Priority 0: Class Teacher MUST teach Period 1 in their own class
        if (period === 1 && c.classTeacher) {
             let ctSubs = validSubs.filter(s => s.teacher === c.classTeacher);
             if (ctSubs.length > 0) {
                 pickedSub = ctSubs[Math.floor(Math.random() * ctSubs.length)];
             }
        }

        // Priority 1: Core subjects not yet taught today (this also keeps core teachers busy in Period 1)
        if (!pickedSub) {
             let coreSubs = validSubs.filter(s => isCore(s.subjectName));
             pickedSub = coreSubs.length > 0 ? coreSubs[Math.floor(Math.random() * coreSubs.length)] : null;
        }
        
        // Priority 2: Any subject
        if (!pickedSub && validSubs.length > 0) {
          pickedSub = validSubs[Math.floor(Math.random() * validSubs.length)];
        }

`;
    code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
    fs.writeFileSync('public/app.js', code);
    console.log("Successfully added Class Teacher Priority for Period 1!");
} else {
    console.log("Failed to find logic block.");
}
