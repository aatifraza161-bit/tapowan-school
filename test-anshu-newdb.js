const { app } = require('electron');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
globalThis.WebSocket = require('ws');
app.whenReady().then(async () => {
    try {
        const supabase = createClient('https://onfdgdevtuyaarhomvmo.supabase.co', process.env.NEW_DB_KEY);
        const { data, error } = await supabase.from('app_student_dues').select('*').eq('admission_no', '033');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('FATAL ERROR:', e);
    }
    app.quit();
});
