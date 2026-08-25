const fs = require('fs');
const code = fs.readFileSync('public/index.html', 'utf8');
const start = code.indexOf('<aside id="sidebar"');
console.log(code.substring(start, start + 600));
