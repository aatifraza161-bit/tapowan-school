const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const fees = list('feeCollection');
        console.log('feeCollection count:', fees.length);
        const dues = list('dueManagement');
        console.log('dueManagement count:', dues.length);
        const slips = list('slip');
        console.log('slip count:', slips.length);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
