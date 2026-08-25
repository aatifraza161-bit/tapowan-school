const { app } = require('electron');
require('dotenv').config();
app.whenReady().then(async () => {
    try {
        const { syncToSupabase } = require('./server/supabase-sync.js');
        await syncToSupabase();
    } catch (e) {
        console.error('FATAL ERROR:', e);
    }
    app.quit();
});
