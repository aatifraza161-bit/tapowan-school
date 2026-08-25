const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');
code = code.replace(/\\\$\{/g, '${');
fs.writeFileSync('public/app.js', code);
console.log('Fixed all escaped variables!');
