const { createClient } = require('@libsql/client');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';
const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const API_KEY = process.argv[2];
if (!API_KEY) {
  console.error("Please provide the API key as an argument.");
  process.exit(1);
}

const DISTRIBUTIONS = [
  { group: 'KINDERGARTEN', classes: ['Nursery-A', 'LKG-A', 'UKG-A'], terms: ['peppa pig education shorts', 'cocomelon shorts', 'toddler sensory shorts'] },
  { group: 'PRIMARY', classes: ['I-A', 'II-A', 'III-A', 'IV-A'], terms: ['national geographic kids shorts', 'fun facts for kids shorts', 'math tricks for kids shorts'] },
  { group: 'SECONDARY', classes: ['V-A', 'VI-A', 'VII-A', 'VIII-A', 'IX-A', 'X-A'], terms: ['khan academy shorts', 'minute physics shorts', 'veritasium shorts', 'numberphile shorts'] }
];

function fetchFromYouTube(query, pageToken = '') {
  return new Promise((resolve, reject) => {
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(query)}&type=video&videoDuration=short&key=${API_KEY}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function scrapeMoreStrictUnique() {
  console.log('🚀 INITIATING ROUND 3 API SCRAPE (ATTEMPTING TO SQUEEZE REMAINING QUOTA)...');
  
  const existingRes = await db.execute('SELECT DISTINCT youtube_video_id FROM app_reels');
  const existingGlobalSet = new Set(existingRes.rows.map(r => r.youtube_video_id));
  console.log(`🛡️ Loaded ${existingGlobalSet.size} existing unique videos from Turso. Rejecting any duplicates!`);

  let totalNewInserted = 0;
  let quotaHit = false;

  for (const dist of DISTRIBUTIONS) {
    if (quotaHit) break;
    const newUniqueVideos = [];

    for (const term of dist.terms) {
      if (quotaHit) break;
      let nextPageToken = '';
      for (let page = 0; page < 3; page++) {
        try {
          const data = await fetchFromYouTube(term, nextPageToken);
          if (!data.items || data.items.length === 0) break;
          
          for (const item of data.items) {
            const vid = item.id?.videoId;
            if (vid && !existingGlobalSet.has(vid)) {
              existingGlobalSet.add(vid); 
              newUniqueVideos.push({
                yt: vid,
                title: item.snippet.title,
                ch: item.snippet.channelTitle,
                sub: 'Education'
              });
            }
          }
          nextPageToken = data.nextPageToken;
          process.stdout.write(`\r🔍 API Searched "${term}" | Found ${newUniqueVideos.length} BRAND NEW global SHORTS... `);
          if (!nextPageToken) break;
        } catch (err) {
          if (err.message.includes('quota') || err.message.includes('exceeded')) {
            console.log('\n❌ GOOGLE API QUOTA FULLY EXHAUSTED FOR TODAY! Cannot fetch more videos.');
            quotaHit = true;
            break;
          }
          break;
        }
      }
    }

    if (newUniqueVideos.length === 0) continue;

    for (const cls of dist.classes) {
      let classVideos = [...newUniqueVideos].sort(() => Math.random() - 0.5);
      const batch = [];
      let count = 0;
      for (const v of classVideos) {
        const randomLikes = Math.floor(Math.random() * 850) + 150;
        const randomViews = randomLikes * 15 + Math.floor(Math.random() * 250);
        batch.push({
          sql: `INSERT INTO app_reels (title, youtube_video_id, class_name, subject, channel_name, duration_sec, likes_count, views_count, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [v.title, v.yt, cls, v.sub, v.ch, 45, randomLikes, randomViews, `${v.sub.toLowerCase()},india,${cls.toLowerCase()}`]
        });
        count++;
        if (batch.length === 200) { await db.batch(batch, 'write'); batch.length = 0; }
      }
      if (batch.length > 0) { await db.batch(batch, 'write'); }
      totalNewInserted += count;
    }
  }

  console.log(`\n✅ ROUND 3 SYNC COMPLETE! Added ${totalNewInserted} completely new unique rows.`);
}

scrapeMoreStrictUnique().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
