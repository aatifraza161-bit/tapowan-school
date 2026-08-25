const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = "C:/Users/Admin/AppData/Roaming/school-management-system/school.db";
const photosDir = "C:/Users/Admin/Desktop/School Work/Students Photo";

const db = new Database(dbPath);

async function main() {
  const files = fs.readdirSync(photosDir);
  const updatedStudents = [];
  const notFound = [];
  const multipleFound = [];

  for (const file of files) {
    if (file.startsWith('file_') || file === 'v.png') continue;
    
    // Extract name (e.g., "Afreen.png" -> "Afreen")
    const ext = path.extname(file);
    const nameToMatch = path.basename(file, ext).trim();
    
    if (!nameToMatch) continue;

    // Search for student in database
    const queryName = `%${nameToMatch}%`;
    const rows = db.prepare(`SELECT * FROM students WHERE fullName LIKE ? COLLATE NOCASE`).all(queryName);

    if (rows.length === 1) {
      const student = rows[0];
      const filePath = path.join(photosDir, file);
      const fileData = fs.readFileSync(filePath);
      
      // Convert to base64
      let mimeType = 'image/jpeg';
      if (ext.toLowerCase() === '.png') mimeType = 'image/png';
      
      const base64Str = fileData.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Str}`;

      // Update student
      db.prepare(`UPDATE students SET photo = ? WHERE id = ?`).run(dataUrl, student.id);
      
      updatedStudents.push(`${student.fullName} (Matched with ${file})`);
    } else if (rows.length === 0) {
      notFound.push(nameToMatch);
    } else {
      multipleFound.push(nameToMatch);
    }
  }

  console.log("=== SUCCESSFULLY ADDED ===");
  updatedStudents.forEach(s => console.log("- " + s));
  
  console.log("\n=== NOT FOUND IN DATABASE ===");
  notFound.forEach(s => console.log("- " + s));
  
  console.log("\n=== MULTIPLE MATCHES (Skipped) ===");
  multipleFound.forEach(s => console.log("- " + s));
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
