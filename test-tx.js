const { app } = require('electron');
app.whenReady().then(async () => {
    try {
        const { list } = require('./server/db-sqlite.js');
        const allFees = list('fees');
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 365);
        const cloudTransactions = [];
        for (const fee of allFees) {
          if (!fee.admissionNo || parseFloat(fee.paidAmount) <= 0) continue;
          const txDate = new Date(fee.paymentDate || fee.creationDate);
          if (txDate >= tenDaysAgo) {
            cloudTransactions.push({
              id: fee.id,
              admissionNo: fee.admissionNo,
              amountPaid: parseFloat(fee.paidAmount),
              date: fee.paymentDate || fee.creationDate,
              method: fee.paymentMethod || 'Cash'
            });
          }
        }
        console.log(cloudTransactions);
    } catch (e) {
        console.error(e);
    }
    app.quit();
});
