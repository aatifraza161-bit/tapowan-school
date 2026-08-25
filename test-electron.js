const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const dueMgmt = list('dueManagement');
        console.log('Total Due Records:', dueMgmt.length);
        const active = dueMgmt.filter(d => parseFloat(d.balance) > 0 && d.status !== 'Paid');
        console.log('Active Dues (>0 balance):', active.length);
        if (active.length > 0) {
            console.log('Sample:', active[0]);
        }
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
