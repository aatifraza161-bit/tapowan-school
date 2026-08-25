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
    
    const targetBlock = `  const fromStorage = normalizeApiBaseUrl(localStorage.getItem("API_BASE_URL"));
  const fromWindow = normalizeApiBaseUrl(window.API_BASE_URL);
  return fromQuery || fromStorage || fromWindow || "";`;

    const newBlock = `  const fromStorage = normalizeApiBaseUrl(localStorage.getItem("API_BASE_URL"));
  const fromWindow = normalizeApiBaseUrl(window.API_BASE_URL);
  
  if (fromWindow && (fromWindow.includes("serveo") || fromWindow.includes("lhr.life"))) {
      if (fromStorage && fromStorage !== fromWindow) {
          localStorage.removeItem("API_BASE_URL");
      }
      return fromQuery || fromWindow;
  }
  
  return fromQuery || fromStorage || fromWindow || "";`;

    content = content.replace(targetBlock, newBlock);
    
    // Bump version again to clear cache
    content = content.replace(/app\.js\?v=\d+/g, 'app.js?v=26');
    
    const encoded = Buffer.from(content).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: 'Fix stuck localStorage API URL bug',
      content: encoded,
      sha: data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('Frontend patched on GitHub!');

    // Patch index.html
    const indexRes = await octokit.repos.getContent({ owner, repo, path: 'index.html' });
    let indexContent = Buffer.from(indexRes.data.content, 'base64').toString('utf8');
    let newIndex = indexContent.replace(/app\.js\?v=\d+/g, 'app.js?v=26');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: 'index.html',
      message: 'Bump index.html version to v26',
      content: Buffer.from(newIndex).toString('base64'),
      sha: indexRes.data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('index.html patched on GitHub!');

    // Patch sw.js
    const swRes = await octokit.repos.getContent({ owner, repo, path: 'sw.js' });
    let swContent = Buffer.from(swRes.data.content, 'base64').toString('utf8');
    let newSw = swContent.replace(/educore-tps-v\d+/g, 'educore-tps-v36');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: 'sw.js',
      message: 'Bump sw.js version to v36',
      content: Buffer.from(newSw).toString('base64'),
      sha: swRes.data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('sw.js patched on GitHub!');

  } catch (err) {
    console.error(err);
  }
})();
