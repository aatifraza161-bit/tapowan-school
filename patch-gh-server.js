const { Octokit } = require('@octokit/rest');
require('dotenv').config();
const fs = require('fs');

(async () => {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = 'aatifraza161-bit';
    const repo = 'tapowan-school-portal';
    const path = 'server.js';
    
    console.log("Fetching current server.js from GitHub...");
    const { data: fileData } = await octokit.repos.getContent({ owner, repo, path });
    
    console.log("Reading local server.js...");
    const localContent = fs.readFileSync('server.js', 'utf8');
    
    console.log("Updating server.js on GitHub...");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'Fix: implement missing bearer token generation and validation to fix 401 Unauthorized errors in cross-origin apps (Electron)',
      content: Buffer.from(localContent).toString('base64'),
      sha: fileData.sha
    });
    
    console.log("Successfully updated server.js on GitHub!");
  } catch (err) {
    console.error("Error updating server.js:", err);
  }
})();
