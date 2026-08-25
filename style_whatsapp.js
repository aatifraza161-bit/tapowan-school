const fs = require('fs');
let code = fs.readFileSync('public/style.css', 'utf8');

const newCSS = `
/* =========================================
   WHATSAPP MODULE PROFESSIONAL UI OVERRIDE
   ========================================= */

.wa-header {
  background: linear-gradient(135deg, #064e3b 0%, #047857 100%) !important;
  box-shadow: 0 8px 30px rgba(4, 120, 87, 0.25) !important;
  border-radius: 20px 20px 0 0 !important;
  padding: 28px 32px !important;
}
.wa-title {
  font-size: 1.4rem !important;
  letter-spacing: -0.03em !important;
}
.wa-badge-green {
  background: rgba(16, 185, 129, 0.2) !important;
  border: 1px solid rgba(16, 185, 129, 0.4) !important;
  color: #a7f3d0 !important;
}
.wa-badge-red {
  background: rgba(220, 38, 38, 0.2) !important;
  border: 1px solid rgba(220, 38, 38, 0.4) !important;
  color: #fca5a5 !important;
}
.wa-section {
  border: 1px solid var(--border-light) !important;
  border-radius: 20px !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.03) !important;
  padding: 28px 32px !important;
  background: #ffffff !important;
}
.wa-section-title {
  font-size: 1.05rem !important;
  border-bottom: 1px solid var(--border-light) !important;
  padding-bottom: 16px !important;
  margin-bottom: 20px !important;
}
.wa-template-editor {
  background: #1e293b !important;
  color: #f8fafc !important;
  border: 1px solid #334155 !important;
  border-radius: 14px !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.9rem !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
  padding: 20px !important;
}
.wa-template-editor:focus {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15), inset 0 2px 4px rgba(0,0,0,0.1) !important;
}
.wa-btn {
  border-radius: 12px !important;
  padding: 10px 20px !important;
  font-size: 0.9rem !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}
.wa-btn-primary {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3) !important;
}
.wa-btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
}
.wa-btn-secondary {
  background: #f8fafc !important;
  color: #475569 !important;
  border: 1px solid #cbd5e1 !important;
}
.wa-btn-secondary:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
}
.wa-table thead th {
  background: #f8fafc !important;
  color: #64748b !important;
  border-bottom: 2px solid var(--border-light) !important;
}
.wa-table tbody tr:hover {
  background: #f8fafc !important;
}
.wa-status-pending { background: #fef2f2 !important; color: #dc2626 !important; }
.wa-status-paid { background: #ecfdf5 !important; color: #10b981 !important; }
.wa-status-partial { background: #fffbeb !important; color: #d97706 !important; }

/* Upgrade the QR Code Area from app.js */
#waQrCode {
  border-radius: 16px !important;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06) !important;
  border: 1px solid var(--border-light) !important;
  padding: 16px !important;
  background: #fff !important;
}
`;

fs.appendFileSync('public/style.css', newCSS);
