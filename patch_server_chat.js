const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const targetStr = 'const { prompt, studentContext, preferredProvider } = req.body || {};';
const replacementStr = `const { prompt, studentContext, preferredProvider, contextFiles } = req.body || {};`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  
  // also inject contextFiles logic
  const targetDynamicCtx = 'let dynamicContext = "";';
  const replacementDynamicCtx = `let dynamicContext = "";
    if (contextFiles) {
      dynamicContext += "\\n[USER ATTACHED FILES (PROCESS THIS IF REQUESTED)]\\n" + contextFiles + "\\n";
    }`;
  
  if (code.includes(targetDynamicCtx)) {
    code = code.replace(targetDynamicCtx, replacementDynamicCtx);
    fs.writeFileSync('server.js', code);
    console.log('Successfully updated /api/ai/chat for contextFiles');
  } else {
    console.log('Failed to find dynamicContext initialization');
  }
} else {
  console.log('Failed to find req.body destructuring');
}
