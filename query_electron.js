const { app } = require('electron');
const db = require('better-sqlite3')('database.db');
app.whenReady().then(() => {
  const results = db.prepare("SELECT * FROM students WHERE fullName LIKE '%TRISHA%'").all();
  console.log(JSON.stringify(results, null, 2));
  app.quit();
});
