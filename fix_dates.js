const fs = require('fs');

const filesToFix = ['public/app.js', 'server.js'];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace all new Date().toISOString().slice(0, 10)
  // Replace all new Date().toISOString().split("T")[0]
  // with a local date logic
  
  const localDateStr = `(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()`;
  
  content = content.replace(/new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)/g, localDateStr);
  content = content.replace(/new Date\(\)\.toISOString\(\)\.split\(['"]T['"]\)\[0\]/g, localDateStr);
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed dates in', file);
}
