const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Insert the stateless JWT functions near the top
const jwtCode = \
const jwtCrypto = require('crypto');
const JWT_SECRET = process.env.SESSION_SECRET || 'change-this-secret';

function signStatelessToken(user) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64');
  const signature = jwtCrypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64');
  return payload + '.' + signature;
}

function verifyStatelessToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payload = parts[0];
    const signature = parts[1];
    const expectedSig = jwtCrypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64');
    if (signature === expectedSig) {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    }
  } catch (e) {}
  return null;
}
\;

code = code.replace('const userTokens = new Map();', 'const userTokens = new Map();\n' + jwtCode);

// Replace auth middleware token checks
const checkRegex = /if\s*\(userTokens\.has\(token\)\)\s*\{\s*req\.session\s*=\s*req\.session\s*\|\|\s*\{\};\s*req\.session\.user\s*=\s*userTokens\.get\(token\);\s*\}/g;
const replacement = \
    const verifiedUser = verifyStatelessToken(token);
    if (verifiedUser) {
      req.session = req.session || {};
      req.session.user = verifiedUser;
    }
\.trim();
code = code.replace(checkRegex, replacement);

// Replace API token generation in login/signup
code = code.replace(/const crypto = require\("crypto"\);\s*const token = crypto\.randomBytes\(32\)\.toString\("hex"\);\s*userTokens\.set\(token, req\.session\.user\);\s*res\.json\(\{ user: req\.session\.user, token \}\);/g, 
  'const token = signStatelessToken(req.session.user);\n      res.json({ user: req.session.user, token });');

code = code.replace(/const crypto = require\("crypto"\);\s*const token = crypto\.randomBytes\(32\)\.toString\("hex"\);\s*userTokens\.set\(token, req\.session\.user\);\s*res\.status\(201\)\.json\(\{ user: req\.session\.user, token \}\);/g,
  'const token = signStatelessToken(req.session.user);\n    res.status(201).json({ user: req.session.user, token });');

// Replace in web socket handler if any
code = code.replace(/if\s*\(userTokens\.has\(token\)\)\s*\{\s*user\s*=\s*userTokens\.get\(token\);\s*\}/g,
  'const verifiedUser = verifyStatelessToken(token); if (verifiedUser) { user = verifiedUser; }');

fs.writeFileSync('server.js', code);
console.log('Patched server.js with stateless tokens!');
