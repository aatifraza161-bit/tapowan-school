const { app } = require('electron');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
globalThis.WebSocket = require('ws');
app.whenReady().then(async () => {
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        const { data, error } = await supabase.from('app_students').select('*').eq('admissionNo', '033');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('FATAL ERROR:', e);
    }
    app.quit();
});
