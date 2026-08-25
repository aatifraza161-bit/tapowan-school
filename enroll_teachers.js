const fs = require('fs');
const path = require('path');
const { db } = require('./server/db-sqlite.js'); // Use the existing DB connection

async function enrollTeachers() {
  const photosDir = 'C:\\Users\\Admin\\Desktop\\School Work\\Teachers Photos';
  const files = fs.readdirSync(photosDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  
  for (const file of files) {
    const fullName = file.replace('.jpg', '').replace('.png', '');
    const filePath = path.join(photosDir, file);
    console.log(`Processing ${fullName}...`);
    
    // Read file and convert to base64
    const fileData = fs.readFileSync(filePath);
    const base64Data = 'data:image/jpeg;base64,' + fileData.toString('base64');
    
    // Send to InsightFace API
    const formData = new FormData();
    formData.append('file', new Blob([fileData], { type: 'image/jpeg' }), 'photo.jpg');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/extract', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.error(`Failed to extract face for ${fullName}: HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      if (data.faces && data.faces.length > 0) {
        const embedding = data.faces[0].embedding;
        
        // Ensure teachers table has a photo column
        try {
          db.prepare('ALTER TABLE teachers ADD COLUMN photo TEXT').run();
        } catch(e) { /* Column might already exist */ }
        
        // Insert or update teacher
        const existingTeacher = db.prepare('SELECT id FROM teachers WHERE fullName = ?').get(fullName);
        let phone = "";
        let role = "Teacher";
        
        if (fullName === "Rizwan") { phone = "9470109644"; role = "Administrator"; }
        if (fullName === "Raju Gupta") { phone = "9546477994"; role = "Administrator"; }
        
        if (existingTeacher) {
          db.prepare('UPDATE teachers SET photo = ?, phone = ? WHERE id = ?').run(base64Data, phone, existingTeacher.id);
        } else {
          db.prepare('INSERT INTO teachers (fullName, department, phone, photo) VALUES (?, ?, ?, ?)').run(fullName, role === 'Administrator' ? 'Management' : 'Staff', phone, base64Data);
        }
        
        // Insert or update faceEmbedding
        db.prepare("DELETE FROM faceEmbeddings WHERE targetType='teachers' AND name=?").run(fullName);
        db.prepare("INSERT INTO faceEmbeddings (targetType, name, tag, descriptorJson) VALUES (?, ?, ?, ?)").run('teachers', fullName, 'teacher', JSON.stringify(embedding));
        
        // Add to users if owner
        if (role === "Administrator") {
          const username = fullName.replace(/\s+/g, '').toLowerCase();
          const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
          if (existingUser) {
            db.prepare('UPDATE users SET role = ?, password = ? WHERE id = ?').run('Administrator', 'admin123', existingUser.id);
          } else {
            db.prepare('INSERT INTO users (username, fullName, role, password, status) VALUES (?, ?, ?, ?, ?)').run(username, fullName, 'Administrator', 'admin123', 'Active');
          }
          console.log(`Added ${fullName} as Administrator (Username: ${username}, Password: admin123)`);
        }
        
        console.log(`Enrolled ${fullName} successfully.`);
      } else {
        console.log(`No face detected in photo for ${fullName}`);
      }
    } catch (err) {
      console.error(`Error processing ${fullName}:`, err.message);
    }
  }
}

enrollTeachers().then(() => {
  console.log('Finished enrolling teachers!');
  process.exit(0);
});
