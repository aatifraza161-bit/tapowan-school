const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const searchStart = '      periods.forEach(period => {';
const searchEnd = "      // Now calculate start and end times for this class's day";

const startIndex = code.indexOf(searchStart);
const endIndex = code.indexOf(searchEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `      const isJunior = !!classSec.toLowerCase().match(/(nursery|lkg|ukg)/);
      const allSchoolTeachers = Array.from(new Set(subjects.map(s => s.teacher).filter(Boolean)));

      periods.forEach(period => {
        // If Junior class and it's after lunch, they leave. No classes.
        if (isJunior && period > lunchAfter) {
           dailySubjectsList.push(null); // Return null instead of "Left" to avoid matrix bugs, it renders as Free/dash
           return;
        }

        // Try to find a subject
        let availableSubs = classSubs.filter(s => !dailyAssigned.has(s.subjectName));
        
        // If all assigned once, just pick any available subject
        if (availableSubs.length === 0) availableSubs = classSubs;

        // Filter out busy teachers
        let validSubs = availableSubs.filter(s => {
          if (!s.teacher) return true;
          return !teacherBusy[day][period].has(s.teacher);
        });

        // Priority 1: Core subjects not yet taught today
        let pickedSub = validSubs.find(s => isCore(s.subjectName));
        
        // Priority 2: Any subject
        if (!pickedSub && validSubs.length > 0) {
          pickedSub = validSubs[Math.floor(Math.random() * validSubs.length)];
        }

        // Priority 3: Ignore daily limit and pick any valid (if strictly needed)
        if (!pickedSub) {
           let backupSubs = classSubs.filter(s => !s.teacher || !teacherBusy[day][period].has(s.teacher));
           if (backupSubs.length > 0) pickedSub = backupSubs[Math.floor(Math.random() * backupSubs.length)];
        }

        // Priority 4: (USER REQUEST) If still no subject (Free period), adjust ANY free teacher (like Junior teachers)
        // and cover a main subject!
        if (!pickedSub) {
           const freeTeachers = allSchoolTeachers.filter(t => !teacherBusy[day][period].has(t));
           if (freeTeachers.length > 0) {
              const substitute = freeTeachers[Math.floor(Math.random() * freeTeachers.length)];
              const cores = ["English", "Hindi", "Math", "Science", "S.st"];
              let neededCores = cores.filter(c => !dailyAssigned.has(c));
              if (neededCores.length === 0) neededCores = cores;
              const randomCore = neededCores[Math.floor(Math.random() * neededCores.length)];
              
              pickedSub = { subjectName: randomCore, teacher: substitute };
           }
        }

        if (pickedSub) {
          dailyAssigned.add(pickedSub.subjectName);
          if (pickedSub.teacher && pickedSub.teacher !== "-") {
             teacherBusy[day][period].add(pickedSub.teacher);
          }
          dailySubjectsList.push(pickedSub);
        } else {
          // Absolute Free period (no teachers available in entire school!)
          dailySubjectsList.push(null);
        }
      });

`;
    code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);
    fs.writeFileSync('public/app.js', code);
    console.log("Successfully applied junior leave and substitute teacher logic!");
} else {
    console.log("Failed to find logic block.");
}
