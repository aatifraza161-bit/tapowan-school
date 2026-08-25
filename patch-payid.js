const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new Database(dbPath);

console.log("Patching SQLite database...");

try {
  db.exec("ALTER TABLE fees ADD COLUMN payId TEXT");
  console.log("Added payId to fees");
} catch (e) {
  if (e.message.includes("duplicate column name")) {
    console.log("payId already exists in fees");
  } else {
    console.error("Error patching fees:", e.message);
  }
}

try {
  db.exec("ALTER TABLE dueManagement ADD COLUMN payId TEXT");
  console.log("Added payId to dueManagement");
} catch (e) {
  if (e.message.includes("duplicate column name")) {
    console.log("payId already exists in dueManagement");
  } else {
    console.error("Error patching dueManagement:", e.message);
  }
}

// Generate payIds for existing records
const fees = db.prepare("SELECT id FROM fees WHERE payId IS NULL OR payId = ''").all();
const stmtFees = db.prepare("UPDATE fees SET payId = ? WHERE id = ?");
let feeCount = 0;
for (const f of fees) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let p = '';
  for (let i = 0; i < 6; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
  stmtFees.run(p, f.id);
  feeCount++;
}
console.log(`Generated payIds for ${feeCount} existing fees.`);

const dues = db.prepare("SELECT id FROM dueManagement WHERE payId IS NULL OR payId = ''").all();
const stmtDues = db.prepare("UPDATE dueManagement SET payId = ? WHERE id = ?");
let dueCount = 0;
for (const d of dues) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let p = '';
  for (let i = 0; i < 6; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
  stmtDues.run(p, d.id);
  dueCount++;
}
console.log(`Generated payIds for ${dueCount} existing dues.`);

db.close();
console.log("Done.");
