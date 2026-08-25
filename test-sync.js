const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('sync-log.txt', msg + '\n');
}

log("Starting test-sync...");

try {
    const { syncToSupabase } = require('./server/supabase-sync');
    log("Loaded supabase-sync");

    // Overwrite console.error to catch supabase sync errors
    const origError = console.error;
    console.error = function(...args) {
        origError.apply(console, args);
        fs.appendFileSync('sync-log.txt', 'ERROR: ' + args.join(' ') + '\n');
    };
    const origLog = console.log;
    console.log = function(...args) {
        origLog.apply(console, args);
        fs.appendFileSync('sync-log.txt', 'LOG: ' + args.join(' ') + '\n');
    };

    syncToSupabase().then(() => {
        log("Sync finished.");
        setTimeout(() => process.exit(0), 5000);
    }).catch(e => {
        log("Sync threw error: " + e.message);
        setTimeout(() => process.exit(1), 5000);
    });
} catch (e) {
    log("Failed to load or run: " + e.message);
    setTimeout(() => process.exit(1), 5000);
}
