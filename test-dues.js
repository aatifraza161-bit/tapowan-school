const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const dues = list('dueManagement');
        const chanchalDues = dues.filter(d => d.admissionNo === '021' || d.studentName === 'CHANCHAL KUMARI');
        console.log(chanchalDues);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
