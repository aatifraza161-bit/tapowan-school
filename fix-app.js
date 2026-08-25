const fs = require('fs');
const file = 'C:\\\\Users\\\\Admin\\\\Desktop\\\\My Project\\\\Slip & Receipt\\\\All fixed\\\\TapowanPublicSchool-fixed\\\\public\\\\app.js';
let content = fs.readFileSync(file, 'utf8');

const target = '    if (avatarIcon) {\n      avatarIcon.style.background = roleColors[role] || "linear-gradient(135deg, var(--brand), var(--brand-dark))";\n    if (activeName) activeName.textContent = "Guest";';

const replacement = '    if (avatarIcon) {\n      avatarIcon.style.background = roleColors[role] || "linear-gradient(135deg, var(--brand), var(--brand-dark))";\n    }\n  } else {\n    if (activeName) activeName.textContent = "Guest";';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed syntax error in applyAuthUI!');
} else {
  console.log('Target not found!');
}
