const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Revert sidebar to Material Icons
const sidebarLordiconRegex = /const lid = SIDEBAR_LORDICONS\[mod\] \|\| 'dxjqoygy';\s*btn\.innerHTML = `<lord-icon src="https:\/\/cdn\.lordicon\.com\/\$\{lid\}\.json" trigger="hover" style="width:20px;height:20px;margin-right:8px;"><\/lord-icon><span class="nav-text">\$\{moduleConfig\[mod\]\.title\}<\/span>\$\{badge\}`;/g;

code = code.replace(sidebarLordiconRegex, "btn.innerHTML = `<span class=\"nav-icon material-symbols-outlined\" style=\"font-size: 20px;\">${MODULE_ICONS[mod] || 'category'}</span><span class=\"nav-text\" style=\"margin-left: 6px;\">${moduleConfig[mod].title}</span>${badge}`;");

// 2. Add Lordicons to statIcons
const statIconsRegex = /const statIcons = \{[\s\S]*?"Status": "❓"\r?\n\s*\};/;
const li = "(id) => `<lord-icon src=\"https://cdn.lordicon.com/${id}.json\" trigger=\"hover\" style=\"width:32px;height:32px\"></lord-icon>`";

const newStatIcons = `const li = ${li};
    const statIcons = {
      "Total Students": li('dxjqoygy'),
      "Total Teachers": li('bhfjfgqz'),
      "Total Classes": li('qwjfapmb'),
      "Student Present Today": li('egiwmiit'),
      "Teacher Present Today": li('egiwmiit'),
      "Pending Fee Accounts": li('qhviklyi'),
      "Books Issued": li('wxnxiano'),
      "Hostel Active": li('osuxyevn'),
      "System Active Users": li('dxjqoygy'),
      "New Admissions": li('puvaffet'),
      "Pending Admissions": li('nocvdjmh'),
      "My Total Paid": li('qhviklyi'),
      "My Pending Dues": li('qhviklyi'),
      "Days Present": li('egiwmiit'),
      "Days Absent": li('nocvdjmh'),
      "Class & Section": li('qwjfapmb'),
      "Status": li('egiwmiit')
    };`;

code = code.replace(statIconsRegex, newStatIcons);

// Replace icon bubbles for consistency (if present)
code = code.replace(/<div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">.*?<\/div>/, '<div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">\' + li(\'qhviklyi\') + \'</div>');

fs.writeFileSync('public/app.js', code);
console.log("Reverted sidebar and applied Lordicons to dashboard.");
