const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
  "if (nav.children.length === 0 || !nav.querySelector('button[data-module]')) {",
  "if (!nav.querySelector('button[data-module=\"dashboard\"]')) {"
);

fs.writeFileSync('public/app.js', code);
console.log('Fixed renderNavEnhanced condition');
