const { db } = require('./server/db');

async function run() {
  try {
    const res = await db.execute("UPDATE users SET password = 'Aatif@123' WHERE username = 'im_aatif'");
    console.log("Rows affected:", res.rowsAffected);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
