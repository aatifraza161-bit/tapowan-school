const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const fees = list('fees');
        const chanchalFees = fees.filter(f => f.studentName && f.studentName.toUpperCase().includes('CHANCHAL'));
        console.log(JSON.stringify(chanchalFees, null, 2));
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
