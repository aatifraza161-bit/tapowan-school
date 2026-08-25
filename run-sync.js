const { app } = require('electron');
const { syncToSupabase } = require('./server/supabase-sync');
app.whenReady().then(async () => {
    try {
        await syncToSupabase();
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
