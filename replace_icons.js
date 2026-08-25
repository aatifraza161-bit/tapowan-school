const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const li = (id) => `<lord-icon src="https://cdn.lordicon.com/${id}.json" trigger="hover" style="width:26px;height:26px"></lord-icon>`;

const replacement = `const li = (id) => \`<lord-icon src="https://cdn.lordicon.com/\${id}.json" trigger="hover" style="width:26px;height:26px"></lord-icon>\`;
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

code = code.replace(/const statIcons = \{[\s\S]*?Status.*?};/, replacement);

code = code.replace(/<div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">.*?<\/div>/, '<div class="stat-icon-bubble" style="background:#dcfce7; color:#16a34a;">' + li('qhviklyi') + '</div>');

fs.writeFileSync('public/app.js', code);
