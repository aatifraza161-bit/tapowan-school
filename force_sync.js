process.env.USER_DATA_PATH = "C:\\Users\\Admin\\AppData\\Roaming\\school-management-system";
const { syncToSupabase } = require('./server/supabase-sync');
async function test() {
  const result = await syncToSupabase();
  console.log("SYNC DONE");
}
test();
