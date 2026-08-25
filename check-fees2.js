const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const fees = list('fees');
        console.log(fees.map(f => f.id + ' - ' + f.studentName + ' - ' + f.status).join('\n'));
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
