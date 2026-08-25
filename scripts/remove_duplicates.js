const { createClient } = require('@libsql/client');
const TURSO_URL = 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';
const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function main() {
  console.log('Removing exact duplicates within classes...');
  
  // Find out how many rows before
  const resBefore = await db.execute('SELECT COUNT(*) as c FROM app_reels');
  console.log('Total rows before:', resBefore.rows[0].c);

  // Delete duplicates (keep lowest ID for each youtube_video_id + class_name)
  await db.execute(`
    DELETE FROM app_reels 
    WHERE id NOT IN (
        SELECT MIN(id) 
        FROM app_reels 
        GROUP BY youtube_video_id, class_name
    )
  `);

  // Find out how many rows after
  const resAfter = await db.execute('SELECT COUNT(*) as c FROM app_reels');
  console.log('Total rows after:', resAfter.rows[0].c);
  
  console.log('Removed duplicates successfully.');
}
main().catch(console.error);
