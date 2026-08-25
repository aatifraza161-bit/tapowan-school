const fs = require('fs');

const waCSS = `
/* =========================================
   WHATSAPP-AUTHENTIC DESIGN OVERRIDE
   ========================================= */

/* ── Main Panel: WhatsApp chat wallpaper ── */
.wa-panel {
  background: #efeae2 !important;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23d4cfc6' opacity='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23p)'/%3E%3C/svg%3E") !important;
  border-radius: 0 !important;
  padding: 0 !important;
}

/* ── Header: WhatsApp dark teal ── */
.wa-header {
  background: #075E54 !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
  border-radius: 0 !important;
  padding: 16px 24px !important;
  gap: 14px !important;
}
.wa-header-icon {
  font-size: 2.2rem !important;
  filter: none !important;
  animation: none !important;
}
.wa-title {
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
}
.wa-sub {
  font-size: 0.75rem !important;
  opacity: 0.75 !important;
}

/* ── Badges: WhatsApp style pills ── */
.wa-badge {
  border-radius: 20px !important;
  font-size: 0.72rem !important;
  padding: 4px 12px !important;
}
.wa-badge-green {
  background: #25D366 !important;
  color: #fff !important;
  border: none !important;
}
.wa-badge-red {
  background: #e74c3c !important;
  color: #fff !important;
  border: none !important;
}

/* ── Sections: WhatsApp card style ── */
.wa-section {
  background: #ffffff !important;
  border: none !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
  padding: 20px 22px !important;
  margin: 12px 16px !important;
}
.wa-section-title {
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  color: #075E54 !important;
  border-bottom: 1px solid #e8e8e8 !important;
  padding-bottom: 12px !important;
  margin-bottom: 16px !important;
}
.wa-section-hint {
  background: #dcf8c6 !important;
  color: #075E54 !important;
  border: none !important;
  font-weight: 700 !important;
}

/* ── Template Editor: WhatsApp chat bubble ── */
.wa-template-editor {
  background: #dcf8c6 !important;
  color: #303030 !important;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 0.88rem !important;
  border: none !important;
  border-radius: 0 8px 8px 8px !important;
  padding: 12px 16px !important;
  line-height: 1.5 !important;
  box-shadow: 0 1px 1px rgba(0,0,0,0.06) !important;
  position: relative;
}
.wa-template-editor:focus {
  border: none !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
}

/* ── Buttons: WhatsApp teal style ── */
.wa-btn {
  border-radius: 24px !important;
  padding: 8px 18px !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
}
.wa-btn-primary {
  background: #075E54 !important;
  color: #fff !important;
  box-shadow: none !important;
}
.wa-btn-primary:hover {
  background: #064e45 !important;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(7,94,84,0.3) !important;
}
.wa-btn-secondary {
  background: transparent !important;
  color: #075E54 !important;
  border: 1.5px solid #075E54 !important;
}
.wa-btn-secondary:hover {
  background: rgba(7,94,84,0.05) !important;
  border-color: #075E54 !important;
}
.wa-btn-green {
  background: #25D366 !important;
  color: #fff !important;
  border-radius: 24px !important;
  box-shadow: none !important;
}
.wa-btn-green:hover {
  background: #1fba59 !important;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(37,211,102,0.3) !important;
}

/* ── Table: clean WhatsApp style ── */
.wa-table-wrap {
  border: none !important;
  border-radius: 8px !important;
  overflow: hidden;
}
.wa-table thead th {
  background: #075E54 !important;
  color: #fff !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  border-bottom: none !important;
  padding: 10px 14px !important;
}
.wa-table tbody tr {
  border-bottom: 1px solid #f0f0f0 !important;
}
.wa-table tbody tr:hover {
  background: #dcf8c6 !important;
}
.wa-table tbody tr:nth-child(even) {
  background: #fafafa !important;
}
.wa-table tbody tr:nth-child(even):hover {
  background: #dcf8c6 !important;
}

/* ── Status badges ── */
.wa-status-pending {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  border-radius: 12px !important;
}
.wa-status-paid {
  background: #dcf8c6 !important;
  color: #075E54 !important;
  border-radius: 12px !important;
}
.wa-status-partial {
  background: #fef3c7 !important;
  color: #92400e !important;
  border-radius: 12px !important;
}

/* ── Balance tag ── */
.wa-balance {
  background: #fff !important;
  border: 1px solid #e74c3c !important;
  border-radius: 6px !important;
}

/* ── Checkboxes ── */
.wa-row-check {
  accent-color: #075E54 !important;
}

/* ── Empty state ── */
.wa-empty {
  color: #8696a0 !important;
}

/* ── Gateway / QR area styling ── */
#waQrCode {
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
  border: none !important;
  background: #fff !important;
}

/* ── WhatsApp-style animations ── */
@keyframes waSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
`;

fs.appendFileSync('public/style.css', waCSS);
console.log('WhatsApp-authentic CSS appended successfully');
