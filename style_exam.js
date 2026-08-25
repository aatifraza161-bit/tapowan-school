const fs = require('fs');
let code = fs.readFileSync('public/style.css', 'utf8');

const newCSS = `
/* =========================================
   EXAM MODULE & PROFESSIONAL UI UPGRADES
   ========================================= */

/* Exam Tabs & Layout */
.exam-tabs {
  display: flex; gap: 10px; margin-bottom: 24px;
  background: rgba(255,255,255,0.5); padding: 6px;
  border-radius: 14px; border: 1px solid var(--border-light);
}
.exam-tab {
  padding: 10px 20px; font-weight: 700; border-radius: 10px;
  cursor: pointer; color: var(--muted); font-size: 0.95rem;
  transition: all var(--transition);
}
.exam-tab:hover { background: rgba(0,0,0,0.02); color: var(--text-dark); }
.exam-tab.active { background: #fff; color: var(--brand); box-shadow: var(--shadow-sm); }

/* Exam Grid & Fields */
.exam-form-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px; padding: 24px; background: #fff;
  border-radius: var(--radius); box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}
.exam-field { display: flex; flex-direction: column; gap: 8px; }
.exam-field label { font-size: 0.75rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.exam-field input, .exam-field select {
  background: #f8fafc; border: 2px solid var(--border);
  border-radius: 12px; padding: 12px 16px;
  font-size: 0.95rem; font-family: inherit; color: var(--text);
  transition: all var(--transition); outline: none;
  font-weight: 600;
}
.exam-field input:focus, .exam-field select:focus {
  border-color: var(--brand); background: #fff;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
}

/* Exam Buttons */
.exam-btn {
  font-family: inherit; font-size: 0.95rem; font-weight: 700;
  border: none; cursor: pointer; padding: 14px 24px; border-radius: 14px;
  transition: all var(--spring); position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.exam-btn-primary {
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  color: #fff; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
}
.exam-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
}
.exam-btn-primary:active { transform: translateY(0); }

/* Override Inline Styles for Specific Buttons to make them Professional */
#btnOpenResultDesigner, button[style*="#10b981"] {
  background: linear-gradient(135deg, #10B981, #059669) !important;
  color: #fff !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3) !important;
  border-radius: 12px !important; transition: all var(--spring) !important;
}
#btnOpenResultDesigner:hover, button[style*="#10b981"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4) !important;
}

/* Upgrade Global Primary Buttons */
.btn-primary, button.primary {
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
  border-radius: 12px; font-weight: 700; transition: all var(--spring);
}
.btn-primary:hover, button.primary:hover {
  transform: translateY(-2px); box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
}
`;

fs.appendFileSync('public/style.css', newCSS);
