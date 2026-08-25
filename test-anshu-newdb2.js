const { app } = require('electron');
const { createClient } = require('@supabase/supabase-js');
globalThis.WebSocket = require('ws');
app.whenReady().then(async () => {
    try {
        const SUPABASE_QUIZ_URL = 'https://onfdgdevtuyaarhomvmo.supabase.co';
        const SUPABASE_QUIZ_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZmRnZGV2dHV5YWFyaG9tdm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2NjY2OSwiZXhwIjoyMDg4MzQyNjY5fQ.7Dkm1DN5pUZgKlLrxQUrl8UsYbgrla3Yf8ogR4DJvR8';
        const supabaseQuiz = createClient(SUPABASE_QUIZ_URL, SUPABASE_QUIZ_KEY);
        const { data, error } = await supabaseQuiz.from('app_student_dues').select('*').eq('admission_no', '033');
        console.log(JSON.stringify(data, null, 2));
        const total = (data || []).reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
        console.log('Total Due in New DB:', total);
    } catch (e) {
        console.error('FATAL ERROR:', e);
    }
    app.quit();
});
