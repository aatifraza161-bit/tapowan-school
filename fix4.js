const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const replacement = `function renderAnalyticsCharts(store) {
  if (!window.dashboardCharts) window.dashboardCharts = [];
  window.dashboardCharts.forEach(c => c.destroy && c.destroy());
  window.dashboardCharts = [];
  
  let grid = document.getElementById("analyticsGrid");
  if (!grid) {
    grid = document.createElement("div");
    grid.id = "analyticsGrid";
    grid.className = "analytics-grid";
    if (refs.statsCards && refs.statsCards.parentNode) {
      refs.statsCards.parentNode.insertBefore(grid, refs.statsCards.nextSibling);
    }
  }
  grid.innerHTML = "";

  if (userIsStudent()) return;

  const fees = store.fees || [];`;

code = code.replace(/function renderAnalyticsCharts\(store\) \{\r?\n\s*let grid = document\.getElementById\("analyticsGrid"\);\r?\n\s*if \(!grid\) \{\r?\n\s*grid = document\.createElement\("div"\);\r?\n\s*grid\.id = "analyticsGrid";\r?\n\s*grid\.className = "analytics-grid";\r?\n\s*if \(refs\.statsCards && refs\.statsCards\.parentNode\) \{\r?\n\s*refs\.statsCards\.parentNode\.insertBefore\(grid, refs\.statsCards\.nextSibling\);\r?\n\s*\}\r?\n\s*\}\r?\n\s*grid\.innerHTML = "";\r?\n\r?\n\s*if \(userIsStudent\(\)\) return;\r?\n\r?\n\s*const fees = store\.fees \|\| \[\];/, replacement);

fs.writeFileSync('public/app.js', code);
