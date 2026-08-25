const cp = require('child_process');
console.log('Deploying to Vercel...');
cp.execSync('npx vercel --prod --yes', {stdio: 'inherit'});
