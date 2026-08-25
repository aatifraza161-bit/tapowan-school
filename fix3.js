const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const replacement = `function renderAnalyticsCharts(store) {
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

code = code.replace(/function renderAnalyticsCharts\(store\) \{\r?\n\s*\/\/ We recreate the analytics container completely each time\r?\n\s*refs\.analyticsContainer\.innerHTML = "";\r?\n\r?\n\s*if \(userIsStudent\(\)\) return;\r?\n\r?\n\s*const fees = store\.fees \|\| \[\];/, replacement);

fs.writeFileSync('public/app.js', code);
