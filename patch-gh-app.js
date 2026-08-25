const { Octokit } = require('@octokit/rest');
require('dotenv').config();

(async () => {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = 'aatifraza161-bit';
    const repo = 'tapowan-school-portal';
    const path = 'app.js';
    
    // Get the current content and its SHA
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    const sha = data.sha;
    let content = Buffer.from(data.content, 'base64').toString('utf8');
    
    const origLogin = `async function login(username, password) {
  localStorage.removeItem("token");
  const data = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  return data.user;
}`;
    
    const newLogin = `async function login(username, password) {
  localStorage.removeItem("token");
  const data = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  if (data.token) localStorage.setItem("token", data.token);
  return data.user;
}`;

    const origSignup = `async function signup(payload) {
  localStorage.removeItem("token");
  const data = await api("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.user;
}`;
    
    const newSignup = `async function signup(payload) {
  localStorage.removeItem("token");
  const data = await api("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (data.token) localStorage.setItem("token", data.token);
  return data.user;
}`;
    
    let patched = false;
    if (content.includes(origLogin)) {
      content = content.replace(origLogin, newLogin);
      console.log('Patched login');
      patched = true;
    } else {
      console.log('Could not find origLogin in app.js on GitHub');
    }
    
    if (content.includes(origSignup)) {
      content = content.replace(origSignup, newSignup);
      console.log('Patched signup');
      patched = true;
    }

    if (!patched) {
      console.log('Nothing patched.');
      return;
    }

    const encodedContent = Buffer.from(content).toString('base64');
    
    await octokit.repos.createOrUpdateFileContents({
      owner, repo, path,
      message: 'Fix token storage bug in auth functions',
      content: encodedContent,
      sha: sha,
      committer: { name: 'Tapowan Fix Bot', email: 'admin@tapowanschool.com' }
    });
    console.log('Successfully pushed app.js to GitHub!');
  } catch (err) {
    console.error(err);
  }
})();
