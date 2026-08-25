const fs = require('fs');
const path = require('path');

function findFiles(dir, filter, res = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findFiles(fullPath, filter, res);
        } else if (file === filter) {
          res.push({ path: fullPath, size: stat.size, mtime: stat.mtime });
        }
      } catch(e) {}
    }
  } catch(e) {}
  return res;
}

const all = findFiles('C:/Users/Admin/Desktop/My Project/Slip & Receipt', 'app.js');
all.sort((a,b) => b.mtime - a.mtime);
for (const f of all.slice(0, 15)) {
  console.log(`${f.mtime.toISOString()} | ${f.size} bytes | ${f.path}`);
}
