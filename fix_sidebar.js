const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

const newRenderNavEnhanced = `const SIDEBAR_LORDICONS = {
  dashboard: 'osuxyevn', 
  aiAssistant: 'bhfjfgqz', 
  admissions: 'puvaffet', 
  students: 'dxjqoygy', 
  teachers: 'bhfjfgqz', 
  classes: 'qwjfapmb',
  subjects: 'wxnxiano', 
  attendance: 'egiwmiit', 
  teacherAttendance: 'egiwmiit',
  exams: 'wxnxiano', 
  fees: 'qhviklyi', 
  library: 'wxnxiano', 
  transport: 'osuxyevn',
  hostel: 'osuxyevn', 
  payroll: 'qhviklyi', 
  users: 'dxjqoygy', 
  timetable: 'qwjfapmb',
  booksAndDress: 'wxnxiano', 
  whatsappAlerts: 'nocvdjmh', 
  dueManagement: 'qhviklyi', 
  holidays: 'osuxyevn', 
  backup: 'nocvdjmh'
};

function renderNavEnhanced() {
  const nav = document.getElementById('moduleNav');
  if (!nav) return;

  const visible = new Set(typeof getVisibleModules === 'function' ? getVisibleModules() : Object.keys(moduleConfig));

  if (!visible.has(currentModule)) {
    currentModule = 'dashboard';
  }

  // To prevent lordicon animation glitches, don't clear innerHTML if it's already built
  if (nav.children.length === 0 || !nav.querySelector('button[data-module]')) {
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

        const lid = SIDEBAR_LORDICONS[mod] || 'dxjqoygy';
        btn.innerHTML = \`<lord-icon src="https://cdn.lordicon.com/\${lid}.json" trigger="hover" style="width:20px;height:20px;margin-right:8px;"></lord-icon><span class="nav-text">\${moduleConfig[mod].title}</span>\${badge}\`;
        
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
  } else {
    // Only update active state and badges to prevent DOM rebuild glitch
    const buttons = nav.querySelectorAll('button[data-module]');
    buttons.forEach(btn => {
      const mod = btn.dataset.module;
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
      
      const existingBadge = btn.querySelector('.nav-badge');
      if (existingBadge && !badge) existingBadge.remove();
      else if (existingBadge && badge) existingBadge.outerHTML = badge;
      else if (!existingBadge && badge) btn.innerHTML += badge;
    });
  }
}`;

code = code.replace(/function renderNavEnhanced\(\) \{[\s\S]*?\}\n\n\/\/ Intercept renderNav calls/m, newRenderNavEnhanced + '\n\n// Intercept renderNav calls');

fs.writeFileSync('public/app.js', code);
console.log("Sidebar patched with Lordicons and smart DOM updates.");
