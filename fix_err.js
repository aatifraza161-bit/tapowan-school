const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
  /const errMsg = "Oops! Connection error\. Please try again!";/g,
  'console.error("Vidya err:", err); const errMsg = err.message || "Oops! Connection error. Please try again!";'
);

fs.writeFileSync('public/app.js', code);
console.log('Replaced error handling in app.js');
