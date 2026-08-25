const { list } = require('./server/db-sqlite.js');
const fees = list('fees');
console.log(fees.map(f => f.id + ' - ' + f.studentName + ' - ' + f.status).join('\n'));
