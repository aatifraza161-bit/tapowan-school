$envPath = '.env'
$token = (Select-String -Path $envPath -Pattern '^TURSO_FEE_AUTH_TOKEN=(.*)$').Matches.Groups[1].Value.Trim('"', "'", "`r", "`n")
$url = 'libsql://tpsfee-im-aatif.aws-ap-northeast-1.turso.io'

Write-Host "Adding variables..."
npx vercel env add TURSO_FEE_AUTH_TOKEN production --value "$token" --force --yes
npx vercel env add TURSO_FEE_DATABASE_URL preview --value "$url" --force --yes
npx vercel env add TURSO_FEE_AUTH_TOKEN preview --value "$token" --force --yes
npx vercel env add TURSO_FEE_DATABASE_URL development --value "$url" --force --yes
npx vercel env add TURSO_FEE_AUTH_TOKEN development --value "$token" --force --yes

Write-Host "Redeploying to Vercel..."
npx vercel --prod --yes
