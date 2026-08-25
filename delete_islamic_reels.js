const { createClient } = require('@libsql/client');

const db = createClient({
  url: 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ'
});

async function run() {
  const f = await db.execute("SELECT id, title FROM app_reels WHERE LOWER(title) LIKE '%khaibar%' OR LOWER(title) LIKE '%khyber%' OR LOWER(title) LIKE '%khabar%' OR LOWER(title) LIKE '%khaber%'");
  console.log('Found Khaibar reels:', f.rows.length);
  f.rows.forEach(r => console.log('  id=' + r.id + ' title=' + r.title));

  const d = await db.execute("DELETE FROM app_reels WHERE LOWER(title) LIKE '%khaibar%' OR LOWER(title) LIKE '%khyber%' OR LOWER(title) LIKE '%khabar%' OR LOWER(title) LIKE '%khaber%' OR LOWER(title) LIKE '%islamic%' OR LOWER(title) LIKE '%quran%' OR LOWER(title) LIKE '%hadith%' OR LOWER(title) LIKE '%battle of%'");
  console.log('Deleted rows:', d.rowsAffected);
  console.log('Done!');
}

run().catch(console.error);
