const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const dueMgmt = list('dueManagement');
        const alimaDues = dueMgmt.filter(d => d.studentName && d.studentName.toUpperCase().includes('ALIMA PERWEEN') && d.status !== 'Paid');
        console.log(JSON.stringify(alimaDues, null, 2));
        
        const total = alimaDues.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
        console.log('Calculated Total:', total);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
