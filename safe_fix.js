const fs = require('fs');

function fixApp() {
  let code = fs.readFileSync('public/app.js', 'utf8');

  // Fix 1: Clean the broken window.alert
  let lines = code.split('\\n');
  let newLines = [];
  let skip = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (!skip && lines[i].includes('Camera requires HTTPS on mobile!')) {
      skip = true;
      newLines.push("        window.alert('📷 Camera requires HTTPS on mobile!\\n\\nUse this URL instead:\\nhttps://' + location.hostname + ':3443\\n\\n(or configure your device to allow HTTP)');");
      continue;
    }
    
    if (skip) {
      if (lines[i].includes('for (let i = 0; i < sortedMonths.length; i++) {')) {
        skip = false;
      }
      continue;
    }
    
    newLines.push(lines[i]);
  }
  
  code = newLines.join('\\n');
  
  // Fix 2: Inject the missing fee loop correctly
  lines = code.split('\\n');
  let targetIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('payload.month = checkedMonths.join(", ");')) {
      targetIdx = i;
      break;
    }
  }

  if (targetIdx !== -1) {
    const loopMissingContent = fs.readFileSync('loop_code.txt', 'utf8');
    lines[targetIdx] = loopMissingContent;
  }
  
  fs.writeFileSync('public/app.js', lines.join('\\n'), 'utf8');
  console.log("Applied safe_fix.js!");
}

fixApp();
