const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Admin/Desktop/My Project/Slip And Receipt/All fixed/TapowanPublicSchool-fixed/server.js', 'utf8').split('\n');
lines.forEach((l, i) => { if (l.includes('app.get(')) console.log(i + 1, l); });
