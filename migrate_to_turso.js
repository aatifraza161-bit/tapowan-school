const { createClient } = require('@libsql/client');
require('dotenv').config();

const localClient = createClient({ url: 'file:C:/Users/Admin/Desktop/My Project/Slip And Receipt/All fixed/TapowanPublicSchool-fixed/server/school.db' });
const remoteClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  console.log("Fetching local tables...");
  const tablesResult = await localClient.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = tablesResult.rows;
  
  for (const tableObj of tables) {
    const table = tableObj.name;
    const createSql = tableObj.sql;
    console.log(`\nMigrating table: ${table}`);
    
    // Create remote table if missing
    if (createSql) {
      await remoteClient.execute(createSql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS'));
      console.log(`  Created remote table ${table}`);
    }
    
    // Clear remote table
    await remoteClient.execute(`DELETE FROM ${table}`);
    console.log(`  Cleared remote table ${table}`);
    
    // Fetch local rows
    const rowsResult = await localClient.execute(`SELECT * FROM ${table}`);
    const rows = rowsResult.rows;
    console.log(`  Found ${rows.length} rows to migrate.`);
    
    if (rows.length === 0) continue;
    
    // We only need the actual columns, not the libsql duplicated properties
    // In libsql, rows are objects and also arrays. We can use Object.keys() and filter out numeric keys.
    const columns = Object.keys(rows[0]).filter(k => isNaN(parseInt(k)));
    
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const batch = rows.map(row => {
      const args = columns.map(col => row[col]);
      return { sql, args };
    });
    
    // Execute in chunks of 50 to avoid limits
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      await remoteClient.batch(chunk, 'write');
      console.log(`  Inserted rows ${i + 1} to ${Math.min(i + 50, batch.length)}`);
    }
  }
  
  console.log("\nMigration completed successfully!");
}

run().catch(console.error);
