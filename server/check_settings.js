require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

// Emulate fetch/WebSocket for Node.js
globalThis.WebSocket = require('ws');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function checkSettings() {
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) {
    console.error("Error fetching app_settings:", error);
  } else {
    console.log("Settings in Supabase:");
    console.log(JSON.stringify(data, null, 2));
  }
}

checkSettings();
