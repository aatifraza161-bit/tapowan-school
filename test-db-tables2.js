const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const db = require('./server/db-sqlite.js').db;
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
        console.log('Tables:', tables.map(t => t.name).join(', '));
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
