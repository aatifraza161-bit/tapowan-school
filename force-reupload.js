try {
    const db = require('./server/db-sqlite').db;
    try {
        db.prepare("UPDATE students SET photoUrl = ''").run();
        console.log('Successfully cleared local photoUrl cache!');
    } catch(e) {
        console.log('Column might not exist yet, ignoring.');
    }
} catch(e) {
    console.error('Error:', e);
}
setTimeout(()=>process.exit(0), 2000);
