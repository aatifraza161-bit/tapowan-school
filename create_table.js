require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const q1 = 'DROP TABLE IF EXISTS app_student_sessions;';
const q2 = `CREATE TABLE app_student_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admission_no TEXT UNIQUE,
  student_name TEXT,
  class_name TEXT,
  roll_no TEXT,
  phone TEXT,
  status TEXT,
  device_os TEXT,
  last_login_at TEXT,
  last_active_at TEXT,
  created_at TEXT
);`;

async function run() {
  try {
    await client.execute(q1);
    await client.execute(q2);
    console.log('Recreated table with UNIQUE constraint');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
