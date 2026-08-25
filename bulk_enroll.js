const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.env.APPDATA, 'school-management-system', 'school.db');
const db = new Database(dbPath);

const students = db.prepare("SELECT fullName, className, photo FROM students WHERE photo IS NOT NULL AND photo != ''").all();

async function processStudents() {
  console.log(`Found ${students.length} students with photos.`);
  let successCount = 0;
  let failCount = 0;
  
  for (const student of students) {
    if (!student.photo.startsWith('data:image')) {
      console.log(`Skipping ${student.fullName}, photo is not base64.`);
      continue;
    }
    
    try {
      const base64Data = student.photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      
      const response = await fetch('http://127.0.0.1:5000/extract', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP Error for ${student.fullName}`);
        failCount++;
        continue;
      }
      
      const data = await response.json();
      if (data.faces && data.faces.length > 0) {
        const embedding = data.faces[0].embedding;
        db.prepare(`DELETE FROM faceEmbeddings WHERE targetType='students' AND name=?`).run(student.fullName);
        db.prepare(`
          INSERT INTO faceEmbeddings (targetType, name, tag, descriptorJson)
          VALUES ('students', ?, ?, ?)
        `).run(student.fullName, student.className || '', JSON.stringify(embedding));
        
        console.log(`✅ Enrolled ${student.fullName}`);
        successCount++;
      } else {
        console.log(`❌ No face detected for ${student.fullName}`);
        failCount++;
      }
    } catch (err) {
      console.log(`Error processing ${student.fullName}: ${err.message}`);
    }
  }
  
  console.log(`\nFinished! Enrolled: ${successCount}, Failed/No Face: ${failCount}`);
}

processStudents();
