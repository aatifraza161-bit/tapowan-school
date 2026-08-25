const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const targetCondition = "if (!nav.querySelector('button[data-module=\"dashboard\"]')) {";
const newCondition = `  let expectedButtonCount = 0;
  for (const [groupName, modules] of Object.entries(NAV_GROUPS)) {
    const visibleInGroup = modules.filter(mod => moduleConfig[mod] && visible.has(mod));
    expectedButtonCount += visibleInGroup.length;
  }
  const actualCoreButtons = Array.from(nav.querySelectorAll('button[data-module]')).filter(b => b.dataset.module !== 'financeModule');

  if (actualCoreButtons.length !== expectedButtonCount) {`;

code = code.replace(targetCondition, newCondition);

fs.writeFileSync('public/app.js', code);
console.log('Fixed renderNavEnhanced count condition');
