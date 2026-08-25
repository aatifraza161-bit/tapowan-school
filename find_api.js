const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
lines.forEach(l => {
    if (l.includes('app.get("/api/')) console.log(l.trim());
});
