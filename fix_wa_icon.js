const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Replace the emoji icon with WhatsApp SVG logo
const oldIcon = '<div class="wa-header-icon">\u{1F4F2}</div>';
const waSvg = `<svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4C12.954 4 4 12.954 4 24c0 3.535.922 6.855 2.535 9.738L4 44l10.572-2.472A19.92 19.92 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4z" fill="#25D366"/><path d="M24 7.2C14.723 7.2 7.2 14.723 7.2 24c0 3.194.896 6.177 2.449 8.717L7.6 40.4l7.88-2.07A16.72 16.72 0 0024 40.8c9.277 0 16.8-7.523 16.8-16.8S33.277 7.2 24 7.2z" fill="#25D366"/><path fill-rule="evenodd" clip-rule="evenodd" d="M18.2 15.3c-.4-.9-.82-.92-1.2-.94h-1.02c-.36 0-.94.14-1.44.68s-1.88 1.84-1.88 4.48 1.92 5.2 2.19 5.56c.26.36 3.72 5.94 9.16 8.1 4.52 1.8 5.44 1.44 6.42 1.35.98-.09 3.16-1.29 3.61-2.54.44-1.25.44-2.32.31-2.54-.14-.22-.5-.36-1.06-.63-.55-.27-3.26-1.61-3.76-1.79-.51-.18-.88-.27-1.25.27s-1.43 1.79-1.76 2.16c-.32.36-.65.41-1.2.14-.55-.27-2.33-.86-4.44-2.74-1.64-1.46-2.75-3.27-3.07-3.82-.32-.55-.03-.85.24-1.12.25-.25.55-.63.82-.95.27-.32.36-.55.55-.91.18-.36.09-.68-.05-.95-.14-.27-1.22-3.01-1.7-4.11z" fill="#fff"/></svg>`;
const newIcon = `<div class="wa-header-icon">${waSvg}</div>`;

if (code.includes(oldIcon)) {
  code = code.replace(oldIcon, newIcon);
  fs.writeFileSync('public/app.js', code);
  console.log('WhatsApp logo SVG added successfully');
} else {
  console.log('Old icon not found, trying alternate search...');
  // Try to find it by class
  const regex = /<div class="wa-header-icon">.*?<\/div>/;
  if (regex.test(code)) {
    code = code.replace(regex, newIcon);
    fs.writeFileSync('public/app.js', code);
    console.log('WhatsApp logo SVG added via regex');
  } else {
    console.log('Could not find wa-header-icon div');
  }
}
