const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:C:/Users/Admin/Desktop/My Project/Slip And Receipt/All fixed/TapowanPublicSchool-fixed/server/school.db' });
async function run() {
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  for (const row of tables.rows) {
    const tableName = row.name;
    const count = await client.execute(`SELECT count(*) as c FROM ${tableName}`);
    console.log(tableName, count.rows[0].c);
  }
}
run().catch(console.error);
