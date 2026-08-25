const Database = require("better-sqlite3");
const path = require("path");
const os = require('os');
const appDataDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share");
const basePath = process.env.USER_DATA_PATH || path.join(appDataDir, 'school-management-system');
const dbPath = path.join(basePath, "school.db");
const db = new Database(dbPath);

console.log("Fixing existing Pending online payments in DB...");

const pendings = db.prepare("SELECT * FROM fees WHERE status = 'Pending' AND feeTypes = 'Online Payment'").all();
console.log(`Found ${pendings.length} pending payments.`);

let updated = 0;
for (const p of pendings) {
    const stu = db.prepare("SELECT fatherName, rollNo FROM students WHERE admissionNo = ?").get(p.admissionNo) || {};
    const feeStruct = db.prepare("SELECT id FROM feeStructures WHERE className = ? AND (lower(feeType) LIKE '%tuition%' OR lower(feeType) LIKE '%monthly%') LIMIT 1").get(p.className || '');
    
    // Default to August if empty or if it's currently empty
    const monthStr = p.month || "Aug";
    const termStr = p.term || "2026-27";

    db.prepare(`
        UPDATE fees SET 
            rollNo = ?, 
            fatherName = ?, 
            term = ?, 
            month = ?, 
            feeTypes = 'Tuition Fee (Monthly)', 
            consolidatedFeeIds = ? 
        WHERE id = ?
    `).run(
        stu.rollNo || p.rollNo || '',
        stu.fatherName || p.fatherName || '',
        termStr,
        monthStr,
        feeStruct ? feeStruct.id.toString() : '',
        p.id
    );
    updated++;
}

console.log(`Updated ${updated} pending payments.`);
