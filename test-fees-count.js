const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const fees = list('fees');
        console.log('Total fees count:', fees.length);
        console.log('Last fee:', fees[fees.length - 1]);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
