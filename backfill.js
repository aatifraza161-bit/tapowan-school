const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log("Starting migration to backfill month in dueManagement...");

// Fetch all dueManagement records
const dues = db.prepare('SELECT id, particulars, month FROM dueManagement').all();
let updateCount = 0;

for (const due of dues) {
    if (!due.month && due.particulars) {
        const p = due.particulars.toLowerCase();
        let monthName = null;
        
        if (p.startsWith("tuition fee of ")) {
            monthName = due.particulars.substring(15).trim();
        } else if (p.startsWith("late fee of ")) {
            monthName = due.particulars.substring(12).trim();
        }
        
        if (monthName) {
            const shortMonth = monthName.substring(0, 3);
            db.prepare('UPDATE dueManagement SET month = ? WHERE id = ?').run(shortMonth, due.id);
            updateCount++;
            console.log(`Updated ID ${due.id} with month: ${shortMonth}`);
        }
    }
}

console.log(`Migration complete. Updated ${updateCount} records.`);
