const fs = require('fs');
let code = fs.readFileSync('public/style.css', 'utf8');

const newCSS = `
/* =========================================
   PROFESSIONAL DATA TABLES
   ========================================= */
.table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  background: #fff;
  border: 1px solid var(--border-light);
  margin-top: 10px;
}
table {
  width: 100%; border-collapse: collapse;
  min-width: 600px;
}
table th {
  background: #f8fafc !important;
  color: #64748b !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.05em !important;
  padding: 16px 20px !important;
  border-bottom: 2px solid var(--border) !important;
  text-align: left;
  position: sticky; top: 0; z-index: 10;
}
table td {
  padding: 16px 20px !important;
  font-size: 0.92rem !important;
  color: #1e293b !important;
  border-bottom: 1px solid var(--border-light) !important;
  font-weight: 500 !important;
  vertical-align: middle;
}
table tr {
  transition: all var(--transition) !important;
}
table tbody tr:hover {
  background-color: #f8fafc !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
  position: relative; z-index: 5;
}
table tbody tr:last-child td {
  border-bottom: none !important;
}

/* Beautiful Status Badges inside Tables */
.badge {
  font-weight: 700 !important;
  border-radius: 8px !important;
  padding: 4px 10px !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.02em !important;
}

/* Fix generic action buttons in table */
table .btn {
  border-radius: 8px !important;
  transition: all var(--transition) !important;
}
table .btn:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
}
`;

fs.appendFileSync('public/style.css', newCSS);
