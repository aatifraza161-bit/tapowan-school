const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// ============================================================
// FIX 1: Fix the broken "Total Payment Received" icon bubble
// The previous patch broke it by inserting string concatenation
// inside a template literal. Fix: use the li() function properly.
// ============================================================
code = code.replace(
  `<div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">' + li('qhviklyi') + '</div>`,
  `<div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">\${li('qhviklyi')}</div>`
);

// ============================================================
// FIX 2: Remove the SIDEBAR_LORDICONS block (leftover dead code)
// ============================================================
const sidebarLordiconsStart = code.indexOf('const SIDEBAR_LORDICONS = {');
if (sidebarLordiconsStart !== -1) {
  const sidebarLordiconsEnd = code.indexOf('};', sidebarLordiconsStart) + 2;
  code = code.substring(0, sidebarLordiconsStart) + code.substring(sidebarLordiconsEnd);
}

// ============================================================
// FIX 3: Fix the sidebar not loading on first app start.
// The "smart update" logic skips building when no buttons exist
// on first render. Remove the conditional — always rebuild,
// but do it efficiently.
// ============================================================
const renderNavStart = code.indexOf('function renderNavEnhanced() {');
const renderNavEnd = code.indexOf('// Intercept renderNav calls');

if (renderNavStart !== -1 && renderNavEnd !== -1) {
  const newRenderNav = `function renderNavEnhanced() {
  const nav = document.getElementById('moduleNav');
  if (!nav) return;

  const visible = new Set(typeof getVisibleModules === 'function' ? getVisibleModules() : Object.keys(moduleConfig));

  if (!visible.has(currentModule)) {
    currentModule = 'dashboard';
  }

  nav.innerHTML = '';
  for (const [groupName, modules] of Object.entries(NAV_GROUPS)) {
    const visibleInGroup = modules.filter(mod => moduleConfig[mod] && visible.has(mod));
    if (!visibleInGroup.length) continue;

    const label = document.createElement('div');
    label.className = 'nav-group-label';
    label.textContent = groupName;
    nav.appendChild(label);

    visibleInGroup.forEach(mod => {
      const btn = document.createElement('button');
      btn.dataset.module = mod;
      btn.className = mod === currentModule ? 'active' : '';
      btn.setAttribute('aria-current', mod === currentModule ? 'page' : 'false');
      
      let badge = '';
      const store = getStore();
      if (mod === 'admissions') {
        const pending = (store.admissions || []).filter(a => String(a.status).toLowerCase() === 'pending' || !a.status).length;
        if (pending > 0) badge = \`<span class="nav-badge" style="background:#ef4444;color:#fff;">\${pending}</span>\`;
      } else if (mod === 'fees') {
        const pending = (store.fees || []).filter(f => f.status === 'Pending' || f.status === 'Partial').length;
        if (pending > 0) badge = \`<span class="nav-badge" style="background:#f59e0b;color:#fff;">\${pending}</span>\`;
      }

      btn.innerHTML = \`<span class="nav-icon material-symbols-outlined" style="font-size: 20px;">\${MODULE_ICONS[mod] || 'category'}</span><span class="nav-text" style="margin-left: 6px;">\${moduleConfig[mod].title}</span>\${badge}\`;
      btn.addEventListener('click', () => {
        currentModule = mod;
        const si = document.getElementById('searchInput');
        if (si) si.value = '';
        renderAll();
        if (typeof isMobileLayout === 'function' && isMobileLayout()) setMobileSidebarOpen(false);
      });
      nav.appendChild(btn);
    });
  }
}

`;
  code = code.substring(0, renderNavStart) + newRenderNav + code.substring(renderNavEnd);
}

fs.writeFileSync('public/app.js', code);

// Verify
const verify = fs.readFileSync('public/app.js', 'utf8');
console.log('Fix 1 - Broken icon bubble fixed:', !verify.includes("' + li('qhviklyi') + '"));
console.log('Fix 2 - SIDEBAR_LORDICONS removed:', !verify.includes('SIDEBAR_LORDICONS'));
console.log('Fix 3 - Sidebar always rebuilds:', !verify.includes('nav.querySelector('));
console.log('Dashboard li() present:', verify.includes("const li = (id) => `<lord-icon"));
console.log('All fixes applied!');
