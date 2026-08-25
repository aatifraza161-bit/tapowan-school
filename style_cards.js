const fs = require('fs');
let code = fs.readFileSync('public/style.css', 'utf8');

const glossyDeepCards = `
/* =========================================
   GLOSSY DEEP CARDS OVERRIDE
   ========================================= */

.stat-card {
  color: #fff !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2) !important;
  backdrop-filter: blur(10px);
}

.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none; z-index: 1;
}

.stat-card .stat-top h4, .stat-card .stat-value, .stat-card .stat-trend, .stat-card .stat-label {
  color: #fff !important;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  position: relative; z-index: 2;
}

.stat-card .stat-trend.pos { color: #a7f3d0 !important; }
.stat-card .stat-trend.neg { color: #fca5a5 !important; }

.stat-icon-bubble {
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.2) !important;
  position: relative; z-index: 2;
}

.stat-card::after {
  opacity: 0.3 !important;
  mix-blend-mode: overlay;
  z-index: 0;
}

/* Deep Glossy Gradients */
.stat-card:nth-child(5n+1) { background: linear-gradient(135deg, #1e3a8a, #312e81) !important; }
.stat-card:nth-child(5n+2) { background: linear-gradient(135deg, #0f766e, #042f2e) !important; }
.stat-card:nth-child(5n+3) { background: linear-gradient(135deg, #4c1d95, #2e1065) !important; }
.stat-card:nth-child(5n+4) { background: linear-gradient(135deg, #b45309, #78350f) !important; }
.stat-card:nth-child(5n+5) { background: linear-gradient(135deg, #be123c, #881337) !important; }

/* The specific "Total Payment Received" inline style needs overriding too */
.stat-card[style*="f0fdf4"] {
  background: linear-gradient(135deg, #065f46, #022c22) !important;
  border-color: rgba(255,255,255,0.1) !important;
}
.stat-card[style*="f0fdf4"] h4, .stat-card[style*="f0fdf4"] .stat-value, .stat-card[style*="f0fdf4"] span {
  color: #fff !important;
}
.stat-card[style*="f0fdf4"] .stat-icon-bubble {
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
}
.stat-card[style*="f0fdf4"] > div:nth-of-type(3) {
  background: rgba(255,255,255,0.05) !important;
}
.stat-card[style*="f0fdf4"] .fee-filter-btn {
  color: #fff !important;
}
.stat-card[style*="f0fdf4"] .fee-filter-btn.active {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.1) !important;
}
`;

fs.appendFileSync('public/style.css', glossyDeepCards);
