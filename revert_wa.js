const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');
const regex = /<div class="wa-header-icon"><svg.*?<\/svg><\/div>/;
const newIcon = '<div class="wa-header-icon">📲</div>';
code = code.replace(regex, newIcon);
fs.writeFileSync('public/app.js', code);
console.log('Reverted WA icon');
