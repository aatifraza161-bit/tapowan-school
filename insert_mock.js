require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function run() {
  try {
    await client.execute(`
      INSERT INTO app_student_sessions (admission_no, student_name, class_name, roll_no, phone, status, device_os, last_login_at, last_active_at, created_at)
      VALUES ('TEST-001', 'Test Student', 'Class 1', '1', '9876543210', 'active', 'android', datetime('now'), datetime('now'), datetime('now'))
    `);
    console.log('Inserted mock session');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
