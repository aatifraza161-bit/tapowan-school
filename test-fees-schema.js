const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const db = require('./server/db-sqlite.js').db;
        const schema = db.prepare("PRAGMA table_info(fees);").all();
        console.log(schema);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
