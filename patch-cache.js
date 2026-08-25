require('dotenv').config({ path: '.env' });
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('No GITHUB_TOKEN');
    const octokit = new Octokit({ auth: token });
    const owner = 'aatifraza161-bit';
    const repo = 'tapowan-school-portal';
    
    // --- PATCH INDEX.HTML ---
    let res = await octokit.repos.getContent({ owner, repo, path: 'index.html' });
    let content = Buffer.from(res.data.content, 'base64').toString('utf8');
    let newContent = content.replace(/app\.js\?v=\d+/g, 'app.js?v=24');
    
    if (newContent !== content) {
      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path: 'index.html',
        message: 'Bump app.js version to v=24',
        content: Buffer.from(newContent).toString('base64'),
        sha: res.data.sha,
        committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
      });
      console.log('index.html updated!');
    }

    // --- PATCH SW.JS ---
    res = await octokit.repos.getContent({ owner, repo, path: 'sw.js' });
    content = Buffer.from(res.data.content, 'base64').toString('utf8');
    newContent = content.replace(/educore-tps-v\d+/g, 'educore-tps-v33');
    
    if (newContent !== content) {
      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path: 'sw.js',
        message: 'Bump SW cache version to v33',
        content: Buffer.from(newContent).toString('base64'),
        sha: res.data.sha,
        committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
      });
      console.log('sw.js updated!');
    }

  } catch (err) {
    console.error(err);
  }
})();
