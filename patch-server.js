const fs = require('fs');
let code = fs.readFileSync('C:\\\\Users\\\\Admin\\\\Desktop\\\\My Project\\\\Slip & Receipt\\\\All fixed\\\\TapowanPublicSchool-fixed\\\\server.js', 'utf8');

if (!code.includes('const userTokens = new Map();')) {
  code = code.replace(
    'const session = require("express-session");',
    'const session = require("express-session");\nconst userTokens = new Map();'
  );
  
  code = code.replace(
    'function authRequired(req, res, next) {\n  if (!req.session.user) {',
    `function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (userTokens.has(token)) {
      req.session = req.session || {};
      req.session.user = userTokens.get(token);
      return next();
    }
  }
  if (!req.session.user) {`
  );

  code = code.replace(
    'function adminRequired(req, res, next) {\n  if (!req.session.user) return',
    `function adminRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (userTokens.has(token)) {
      req.session = req.session || {};
      req.session.user = userTokens.get(token);
    }
  }
  if (!req.session.user) return`
  );

  code = code.replace(
    'function canWrite(req, res, next) {\n  if (!req.session.user) return',
    `function canWrite(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (userTokens.has(token)) {
      req.session = req.session || {};
      req.session.user = userTokens.get(token);
    }
  }
  if (!req.session.user) return`
  );

  code = code.replace(
    'app.get("/api/auth/me", async (req, res) => {\n    try {\n      const user = req.session.user;',
    `app.get("/api/auth/me", async (req, res) => {
    try {
      let user = req.session.user;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (userTokens.has(token)) {
          user = userTokens.get(token);
        }
      }`
  );

  code = code.replace(
    'res.json({ message: "Logged in", user: req.session.user });',
    `const token = require('crypto').randomBytes(32).toString('hex');
    userTokens.set(token, req.session.user);
    res.json({ message: "Logged in", user: req.session.user, token });`
  );

  code = code.replace(
    'res.json({ message: "Logged out" });',
    `const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      userTokens.delete(token);
    }
    res.json({ message: "Logged out" });`
  );

  fs.writeFileSync('C:\\\\Users\\\\Admin\\\\Desktop\\\\My Project\\\\Slip & Receipt\\\\All fixed\\\\TapowanPublicSchool-fixed\\\\server.js', code);
  console.log('Backend patched!');
} else {
  console.log('Already patched!');
}
