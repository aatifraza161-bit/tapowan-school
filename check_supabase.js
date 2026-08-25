const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('app_students')
    .select('*')
    .eq('className', 'VII-A')
    .eq('fullName', 'ALIMA PERWEEN')
    .single();

  console.log(data);
  process.exit();
}
run();
