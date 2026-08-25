require('dotenv').config();
const { createClient } = require('@libsql/client');
const { MODULES } = require('./server/db-sqlite.js');

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const feeDb = createClient({ url: process.env.TURSO_FEE_DATABASE_URL, authToken: process.env.TURSO_FEE_AUTH_TOKEN });

const FEE_MODULES = new Set(['fees', 'dueManagement', 'feeStructures']);

async function check() {
  const moduleKeys = Object.keys(MODULES);
  for (const m of moduleKeys) {
    const isFee = FEE_MODULES.has(m);
    const client = isFee ? feeDb : db;
    try {
      await client.execute(`SELECT * FROM ${m} LIMIT 1`);
      console.log(`[OK] ${m} (DB: ${isFee ? 'FEE' : 'MAIN'})`);
    } catch (e) {
      console.error(`[ERROR] ${m} (DB: ${isFee ? 'FEE' : 'MAIN'}) -> ${e.message}`);
    }
  }
}
check();
