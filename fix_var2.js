const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /function mountVidyaAvatar\(student\) \{\s*let vidyaLang = "auto";\s*let isSpeaking = false;/;

const newStr = `function mountVidyaAvatar(student) {
  
  let vidyaLang = "auto"; 
  let vidyaPreferredProvider = "OpenRouter";
  let isSpeaking = false;`;

if (regex.test(code)) {
  code = code.replace(regex, newStr);
  fs.writeFileSync('public/app.js', code);
  console.log('Fixed vidyaPreferredProvider declaration');
} else {
  console.log('Could not find target string in app.js');
}
