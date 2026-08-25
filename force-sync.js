require('./server/supabase-sync').syncToSupabase().then(() => console.log('Done')).catch(console.error);
