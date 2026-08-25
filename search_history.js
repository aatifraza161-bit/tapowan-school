const fs = require('fs');
const path = require('path');

function searchHistory(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchHistory(fullPath);
      } else if (stat.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('rowArr.push("Free\\n-")') || content.includes('timetable')) {
            console.log(\`Found in: \${fullPath} (Size: \${stat.size})\`);
          }
        } catch(e) {}
      }
    }
  } catch(e) {}
}

console.log("Searching history...");
searchHistory('C:/Users/Admin/AppData/Roaming/Code/User/History');
console.log("Done.");
