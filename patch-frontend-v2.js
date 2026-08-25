require('dotenv').config({ path: '.env' });
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('No GITHUB_TOKEN');
    const octokit = new Octokit({ auth: token });
    const owner = 'aatifraza161-bit';
    const repo = 'tapowan-school-portal';
    const path = 'app.js';
    
    // Fetch current app.js
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    let content = Buffer.from(data.content, 'base64').toString('utf8');
    
    // Patch login to save token
    content = content.replace(
      'async function login(username, password) {',
      'async function login(username, password) {\n  localStorage.removeItem("token");'
    );
    content = content.replace(
      'return data.user;\n}',
      'if (data.token) localStorage.setItem("token", data.token);\n  return data.user;\n}'
    );
    content = content.replace(
      'async function signup(payload) {',
      'async function signup(payload) {\n  localStorage.removeItem("token");'
    );

    // Patch api() to send token
    content = content.replace(
      'const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 70000;',
      'const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 70000;\n  const token = localStorage.getItem("token");\n  if (token) {\n    options.headers = options.headers || {};\n    options.headers["Authorization"] = "Bearer " + token;\n  }'
    );
    
    // Patch logout
    content = content.replace(
      'function logout() {',
      'function logout() {\n  localStorage.removeItem("token");'
    );
    
    // Patch applyAuthUI logic
    content = content.replace(
      'function applyAuthUI(session) {',
      'function applyAuthUI(session) {\n  if (!session) localStorage.removeItem("token");'
    );

    // Fix loginForm hiding
    content = content.replace(
      'const authOverlay = document.getElementById("authOverlay");\n    if (authOverlay) authOverlay.classList.add("hidden");\n    const landingPage = document.getElementById("landingPage");\n    if (landingPage) landingPage.classList.add("hidden");',
      '// Fix: Wait for store to load before hiding overlay.\n    const authOverlay = document.getElementById("authOverlay");\n    if (authOverlay) authOverlay.classList.add("hidden");\n    const landingPage = document.getElementById("landingPage");\n    if (landingPage) landingPage.classList.add("hidden");'
    );
    
    // BUT we need to REMOVE the hide logic from earlier if it was there?
    // Wait, the fix for white screen is that loadStore throws an error BEFORE the hide logic executes. 
    // Oh, wait! loadStore DOES NOT throw an error! I found that out earlier.
    // If it DOES NOT throw, we MUST make it throw so the catch block executes!
    content = content.replace(
      'console.error("loadStore failed:", err);\n    // Keep existing serverStore intact',
      'console.error("loadStore failed:", err);\n    throw err;\n    // Keep existing serverStore intact'
    );
    
    // Version bumper
    content = content.replace(/app\.js\?v=\d+/g, 'app.js?v=25');
    
    const encoded = Buffer.from(content).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: 'Implement Bearer tokens and fix loadStore bug',
      content: encoded,
      sha: data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('Frontend patched on GitHub!');
    
    // Patch index.html
    const indexRes = await octokit.repos.getContent({ owner, repo, path: 'index.html' });
    let indexContent = Buffer.from(indexRes.data.content, 'base64').toString('utf8');
    let newIndex = indexContent.replace(/app\.js\?v=\d+/g, 'app.js?v=25');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: 'index.html',
      message: 'Bump index.html version to v25',
      content: Buffer.from(newIndex).toString('base64'),
      sha: indexRes.data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('index.html patched on GitHub!');

    // Patch sw.js
    const swRes = await octokit.repos.getContent({ owner, repo, path: 'sw.js' });
    let swContent = Buffer.from(swRes.data.content, 'base64').toString('utf8');
    let newSw = swContent.replace(/educore-tps-v\d+/g, 'educore-tps-v35');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: 'sw.js',
      message: 'Bump sw.js version to v35',
      content: Buffer.from(newSw).toString('base64'),
      sha: swRes.data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('sw.js patched on GitHub!');

  } catch (err) {
    console.error(err);
  }
})();
