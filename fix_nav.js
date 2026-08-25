const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Fix the issue where Backup panel shows up in other modules
// Line ~3961: contentArea.querySelectorAll(".panel:not(...):not(#examPanel)").forEach
const qsaRegex = /contentArea\.querySelectorAll\("\.panel:not\([^"]*#examPanel\)"\)/;
if (code.match(qsaRegex)) {
  code = code.replace(qsaRegex, 'contentArea.querySelectorAll(".panel:not(#facePanel):not(#assistantPanel):not(#waAlertPanel):not(#bd-panel):not(#ai-panel):not(#schoolCalendarPanel):not(#examPanel):not(#backupPanel)")');
}

// 2. Hide backupPanel explicitly when not isBackup
const examPanelHide = `  const examPanel = document.getElementById("examPanel");
  if (isExams && typeof window.renderExamModule === "function") {
    window.renderExamModule();
  } else if (examPanel) {
    examPanel.classList.add("hidden");
    examPanel.style.display = "none";
  }`;
  
const backupHideLogic = `

  const backupPanel = document.getElementById("backupPanel");
  if (backupPanel && !isBackup) {
    backupPanel.style.display = "none";
  }
`;
if (!code.includes('if (backupPanel && !isBackup)')) {
  code = code.replace(examPanelHide, examPanelHide + backupHideLogic);
}


// 3. Fix renderNavEnhanced smart updating to prevent animation bugs
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

  // To prevent icon animation glitches, don't clear innerHTML if it's already built
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
}

`;
  code = code.substring(0, renderNavStart) + newRenderNav + code.substring(renderNavEnd);
}

fs.writeFileSync('public/app.js', code);
console.log('App.js successfully patched');
