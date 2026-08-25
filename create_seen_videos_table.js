const { runRaw } = require('./server/db');

async function createTable() {
  try {
    console.log("Creating app_seen_videos table...");
    await runRaw(`
      CREATE TABLE IF NOT EXISTS app_seen_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admissionNo TEXT NOT NULL,
        chapterName TEXT NOT NULL,
        seenAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error.message);
  }
}
createTable();
