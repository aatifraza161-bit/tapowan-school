const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const oldStr = `function mountVidyaAvatar(student) {
  
  let vidyaLang = "auto"; 
  let isSpeaking = false;`;

const newStr = `function mountVidyaAvatar(student) {
  
  let vidyaLang = "auto"; 
  let vidyaPreferredProvider = "OpenRouter";
  let isSpeaking = false;`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync('public/app.js', code);
  console.log('Fixed vidyaPreferredProvider declaration');
} else {
  console.log('Could not find target string in app.js');
}
