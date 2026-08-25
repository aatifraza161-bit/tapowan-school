const { spawn } = require('child_process');
let currentTunnelUrl = null;

async function startTunnelAndSync(port) {
  try {
    console.log(`[Tunnel] Starting SSH tunnel on port ${port} using serveo.net...`);
    
    const ssh = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=60',
      '-R', `80:127.0.0.1:${port}`,
      'serveo.net'
    ]);

    ssh.stdout.on('data', async (d) => {
      const str = d.toString();
      const match = str.match(/https:\/\/[^\s]+\.serveousercontent\.com/);
      if (match) {
        const tunnelUrl = match[0];
        console.log(`[Tunnel] Server is now securely accessible online at: ${tunnelUrl}`);
        
        if (currentTunnelUrl !== tunnelUrl) {
          currentTunnelUrl = tunnelUrl;
          const token = process.env.GITHUB_TOKEN;
          if (token) {
            console.log("[Tunnel] Syncing Tunnel URL to GitHub Pages Master Directory...");
            try {
              const { Octokit } = await import('@octokit/rest');
              const octokit = new Octokit({ auth: token });
              const owner = 'aatifraza161-bit';
              const repo = 'tapowan-school-portal';
              const path = 'api-config.js';
              
              const newContent = `// Auto-updated by Tapowan Server\nwindow.API_BASE_URL = "${tunnelUrl}";\n`;
              const encodedContent = Buffer.from(newContent).toString('base64');

              let fileSha = null;
              try {
                const { data } = await octokit.repos.getContent({ owner, repo, path });
                fileSha = data.sha;
              } catch (e) {}

              await octokit.repos.createOrUpdateFileContents({
                owner, repo, path,
                message: `Auto-update Tunnel URL (Serveo)`,
                content: encodedContent,
                sha: fileSha,
                committer: { name: "Tapowan Auto-Sync", email: "admin@tapowanschool.com" }
              });
              console.log("[Tunnel] ✅ GitHub Pages Master Directory updated successfully.");
            } catch (ghErr) {
              console.error("[Tunnel] Failed to sync with GitHub Pages:", ghErr.message);
            }
          } else {
            console.warn("[Tunnel] GITHUB_TOKEN not found in .env.");
          }
        }
      }
    });

    ssh.on('close', () => {
      console.log("[Tunnel] SSH tunnel closed. Reconnecting...");
      setTimeout(() => startTunnelAndSync(port), 3000);
    });
    
    ssh.on('error', (err) => {
      console.error("[Tunnel] Error:", err);
      setTimeout(() => startTunnelAndSync(port), 3000);
    });

  } catch (err) {
    console.error("[Tunnel] Failed to start tunnel:", err);
    setTimeout(() => startTunnelAndSync(port), 10000);
  }
}

module.exports = { startTunnelAndSync };
