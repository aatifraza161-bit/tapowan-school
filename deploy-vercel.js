const cp = require('child_process');
require('dotenv').config({path: '.env'});

const url = 'libsql://tpsfee-im-aatif.aws-ap-northeast-1.turso.io';
const token = process.env.TURSO_FEE_AUTH_TOKEN;

if (!token) {
  console.error('No token found in .env');
  process.exit(1);
}

const envs = ['production', 'preview', 'development'];

for (const env of envs) {
  console.log(`Adding TURSO_FEE_DATABASE_URL to ${env}...`);
  try {
      cp.execSync(`npx vercel env add TURSO_FEE_DATABASE_URL ${env} --value "${url}" --yes`, {stdio: 'inherit'});
  } catch(e) {
      console.log('Might already exist, forcing...');
      cp.execSync(`npx vercel env add TURSO_FEE_DATABASE_URL ${env} --value "${url}" --force --yes`, {stdio: 'inherit'});
  }
  
  console.log(`Adding TURSO_FEE_AUTH_TOKEN to ${env}...`);
  try {
      cp.execSync(`npx vercel env add TURSO_FEE_AUTH_TOKEN ${env} --value "${token}" --yes`, {stdio: 'inherit'});
  } catch(e) {
      console.log('Might already exist, forcing...');
      cp.execSync(`npx vercel env add TURSO_FEE_AUTH_TOKEN ${env} --value "${token}" --force --yes`, {stdio: 'inherit'});
  }
}

console.log('Redeploying to Vercel...');
cp.execSync('npx vercel --prod --yes', {stdio: 'inherit'});
