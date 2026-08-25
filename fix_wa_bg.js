const fs = require('fs');
let css = fs.readFileSync('public/style.css', 'utf8');

// Replace the simple dot pattern with dark WhatsApp doodle wallpaper
css = css.replace(
  /\.wa-panel \{[^}]*background: #efeae2 !important;[^}]*\}/s,
  `.wa-panel {
  background: #0b141a !important;
  border-radius: 0 !important;
  padding: 0 !important;
}`
);

// Also update .wa-section cards to work on dark background
css = css.replace(
  '.wa-section {\n  background: #ffffff !important;',
  '.wa-section {\n  background: rgba(255,255,255,0.97) !important;'
);

// Add the doodle background as a new rule at the end
const doodleBg = `

/* WhatsApp Dark Doodle Wallpaper */
.wa-panel {
  position: relative !important;
}
.wa-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #0b141a;
  background-image:
    radial-gradient(circle at 15% 8%, rgba(30,45,55,0.6) 1px, transparent 1px),
    radial-gradient(circle at 45% 12%, rgba(30,45,55,0.5) 1.5px, transparent 1.5px),
    radial-gradient(circle at 75% 6%, rgba(30,45,55,0.6) 1px, transparent 1px),
    radial-gradient(circle at 90% 15%, rgba(30,45,55,0.4) 2px, transparent 2px),
    radial-gradient(circle at 25% 22%, rgba(30,45,55,0.5) 1.5px, transparent 1.5px),
    radial-gradient(circle at 55% 28%, rgba(30,45,55,0.6) 1px, transparent 1px),
    radial-gradient(circle at 85% 25%, rgba(30,45,55,0.5) 1.5px, transparent 1.5px),
    radial-gradient(circle at 10% 35%, rgba(30,45,55,0.4) 2px, transparent 2px),
    radial-gradient(circle at 40% 40%, rgba(30,45,55,0.6) 1px, transparent 1px),
    radial-gradient(circle at 70% 38%, rgba(30,45,55,0.5) 1.5px, transparent 1.5px),
    radial-gradient(circle at 95% 42%, rgba(30,45,55,0.4) 1px, transparent 1px),
    radial-gradient(circle at 20% 55%, rgba(30,45,55,0.5) 2px, transparent 2px),
    radial-gradient(circle at 50% 52%, rgba(30,45,55,0.6) 1px, transparent 1px),
    radial-gradient(circle at 80% 58%, rgba(30,45,55,0.5) 1.5px, transparent 1.5px),
    radial-gradient(circle at 5% 68%, rgba(30,45,55,0.4) 1px, transparent 1px),
    radial-gradient(circle at 35% 72%, rgba(30,45,55,0.6) 1.5px, transparent 1.5px),
    radial-gradient(circle at 65% 65%, rgba(30,45,55,0.5) 1px, transparent 1px),
    radial-gradient(circle at 92% 70%, rgba(30,45,55,0.4) 2px, transparent 2px),
    radial-gradient(circle at 18% 82%, rgba(30,45,55,0.6) 1px, transparent 1px),
    radial-gradient(circle at 48% 88%, rgba(30,45,55,0.5) 1.5px, transparent 1.5px),
    radial-gradient(circle at 78% 85%, rgba(30,45,55,0.4) 1px, transparent 1px),
    radial-gradient(circle at 58% 95%, rgba(30,45,55,0.6) 2px, transparent 2px);
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
}
.wa-panel > * {
  position: relative;
  z-index: 1;
}

/* WhatsApp header icon sizing for SVG */
.wa-header-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.wa-header-icon svg {
  width: 48px !important;
  height: 48px !important;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)) !important;
}

/* Adjust sections on dark background */
.wa-section {
  box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
}
`;

fs.appendFileSync('public/style.css', doodleBg);
fs.writeFileSync('public/style.css', css + doodleBg);
console.log('Dark WhatsApp doodle wallpaper and logo styles added');
