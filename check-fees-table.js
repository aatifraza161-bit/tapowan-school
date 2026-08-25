require('dotenv').config();
const { createClient } = require('@libsql/client');
const feeDbUrl = process.env.TURSO_FEE_DATABASE_URL;
const feeAuthToken = process.env.TURSO_FEE_AUTH_TOKEN;

const feeDb = createClient({ url: feeDbUrl, authToken: feeAuthToken });

async function check() {
  try {
    const res = await feeDb.execute('SELECT count(*) as count FROM dueManagement');
    console.log("dueManagement exists on Fee DB! Count:", res.rows[0].count);
  } catch (err) {
    console.error("Error on Fee DB:", err);
  }
}
check();
