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
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    
    // Patch
    let newContent = content.replace(
      'mobileSidebarBackdrop: document.getElementById("mobileSidebarBackdrop"),',
      'mobileSidebarBackdrop: document.getElementById("mobileSidebarBackdrop"),\n  authOverlay: document.getElementById("authOverlay"),'
    );
    
    // Version bumper
    newContent = newContent.replace(/app\.js\?v=\d+/g, 'app.js?v=24');
    
    if (newContent === content) {
      console.log('No change needed or replace failed.');
      return;
    }
    
    const encoded = Buffer.from(newContent).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: 'Fix authOverlay ref bug and bump version',
      content: encoded,
      sha: data.sha,
      committer: { name: 'Tapowan Auto-Sync', email: 'admin@tapowanschool.com' }
    });
    console.log('Patch pushed to GitHub!');
  } catch (err) {
    console.error(err);
  }
})();
