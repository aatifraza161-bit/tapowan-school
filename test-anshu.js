const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const dueMgmt = list('dueManagement');
        const anshuDues = dueMgmt.filter(d => d.studentName && d.studentName.toUpperCase().includes('ANSHU SHARMA') && d.status !== 'Paid');
        console.log(JSON.stringify(anshuDues, null, 2));
        
        const total = anshuDues.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
        console.log('Calculated Total:', total);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
