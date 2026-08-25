const fs = require('fs');
let app = fs.readFileSync('public/app.js', 'utf8');
app = app.replace(/\$\{f\.term \|\| ""\}/g, '${window.formatTermString(f.term) || ""}');
app = app.replace(/\$\{f\.term \|\| "-"\}/g, '${window.formatTermString(f.term) || "-"}');
app = app.replace(/\(f\.term\)/g, '(window.formatTermString(f.term))');
fs.writeFileSync('public/app.js', app);
console.log("Done replacing");
