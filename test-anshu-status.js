const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const students = list('students');
        const anshu = students.find(s => s.fullName && s.fullName.toUpperCase().includes('ANSHU SHARMA'));
        console.log(anshu);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
