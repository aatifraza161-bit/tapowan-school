const ytSearch = require('yt-search');
const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';
const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const PW_MAPPINGS = [
  { className: 'IV-A', queries: ['pw class 4', 'physics wallah class 4', 'pw little champs 4'] },
  { className: 'V-A', queries: ['pw class 5', 'physics wallah class 5', 'pw little champs 5'] },
  { className: 'VI-A', queries: ['pw class 6', 'physics wallah class 6', 'pw foundation class 6'] },
  { className: 'VII-A', queries: ['pw class 7', 'physics wallah class 7', 'pw foundation class 7'] },
  { className: 'VIII-A', queries: ['pw class 8', 'physics wallah class 8', 'pw foundation class 8'] },
  { className: 'IX-A', queries: ['pw class 9', 'physics wallah class 9', 'pw foundation class 9'] },
  { className: 'X-A', queries: ['pw class 10', 'physics wallah class 10', 'pw foundation class 10', 'physics wallah board 10'] }
];

async function scrapePW() {
  console.log('🚀 INITIATING STEALTH PW SCRAPE (5s Delays to bypass blocks)...');
  
  const existingRes = await db.execute('SELECT DISTINCT youtube_video_id FROM app_reels');
  const existingGlobalSet = new Set(existingRes.rows.map(r => r.youtube_video_id));
  console.log(`🛡️ Loaded ${existingGlobalSet.size} existing unique videos. Rejecting duplicates!`);

  let totalNewInserted = 0;

  for (const mapping of PW_MAPPINGS) {
    console.log(`\n=== Fetching PW videos STRICTLY for ${mapping.className} ===`);
    const newUniqueVideos = [];

    for (const q of mapping.queries) {
      try {
        console.log(`⏳ Waiting 5 seconds before searching "${q}"...`);
        await new Promise(r => setTimeout(r, 5000)); // 5 SECOND DELAY

        const res = await Promise.race([
          ytSearch(q),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        
        for (const v of res.videos) {
          // Keep it under 10 minutes so we don't get 3-hour long streams
          if (v.duration && v.duration.seconds <= 600) {
            if (!existingGlobalSet.has(v.videoId)) {
              existingGlobalSet.add(v.videoId);
              newUniqueVideos.push({
                yt: v.videoId,
                title: v.title,
                ch: v.author?.name || 'Physics Wallah',
                sub: 'Science'
              });
            }
          }
        }
        console.log(`✅ Found ${newUniqueVideos.length} NEW unique videos for ${mapping.className} so far.`);
      } catch (err) {
        console.log(`❌ Query failed or timed out: ${q}`);
      }
    }

    console.log(`\n✅ Secured ${newUniqueVideos.length} completely new PW videos for ${mapping.className}.`);
    
    if (newUniqueVideos.length === 0) continue;

    const batch = [];
    let count = 0;
    
    for (const v of newUniqueVideos) {
      const randomLikes = Math.floor(Math.random() * 5000) + 1000;
      const randomViews = randomLikes * 12 + Math.floor(Math.random() * 5000);
      batch.push({
        sql: `INSERT INTO app_reels (title, youtube_video_id, class_name, subject, channel_name, duration_sec, likes_count, views_count, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        args: [v.title, v.yt, mapping.className, v.sub, v.ch, 120, randomLikes, randomViews, `pw,physics wallah,${mapping.className.toLowerCase()}`]
      });
      count++;
      
      if (batch.length === 200) { await db.batch(batch, 'write'); batch.length = 0; }
    }
    if (batch.length > 0) { await db.batch(batch, 'write'); }
    
    totalNewInserted += count;
    console.log(`  🎉 [${mapping.className}] Appended ${count} strict PW videos.`);
  }

  console.log(`\n✅ PW STEALTH SYNC COMPLETE! Exactly ${totalNewInserted} New PW Videos Added.`);
}

scrapePW().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
