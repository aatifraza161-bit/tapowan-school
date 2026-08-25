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
  { group: 'KINDERGARTEN', classes: ['Nursery-A', 'LKG-A', 'UKG-A'], terms: ['preschool learning shorts', 'toddler education shorts', 'kids phonics shorts', 'kindergarten math shorts', 'kids shapes shorts', 'colors song shorts'] },
  { group: 'PRIMARY', classes: ['I-A', 'II-A', 'III-A', 'IV-A'], terms: ['primary school science shorts', 'fun math puzzles shorts', 'kids history facts shorts', 'basic english speaking shorts', 'kids solar system shorts', 'cool science experiments kids shorts'] },
  { group: 'SECONDARY', classes: ['V-A', 'VI-A', 'VII-A', 'VIII-A', 'IX-A', 'X-A'], terms: ['high school chemistry shorts', 'amazing physics facts shorts', 'biology cell animation shorts', 'algebra tricks shorts', 'class 10 science shorts', 'history facts shorts'] }
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
  console.log('🚀 INITIATING STRICTLY UNIQUE API SCRAPE...');
  
  // 1. Load existing globally unique IDs to prevent ANY duplicates
  const existingRes = await db.execute('SELECT DISTINCT youtube_video_id FROM app_reels');
  const existingGlobalSet = new Set(existingRes.rows.map(r => r.youtube_video_id));
  console.log(`🛡️ Loaded ${existingGlobalSet.size} existing unique videos from Turso. Will instantly reject any duplicates!`);

  let totalNewInserted = 0;

  for (const dist of DISTRIBUTIONS) {
    console.log(`\n=== Fetching BRAND NEW videos for ${dist.group} ===`);
    const newUniqueVideos = [];

    for (const term of dist.terms) {
      let nextPageToken = '';
      for (let page = 0; page < 3; page++) { // 3 pages per term
        try {
          const data = await fetchFromYouTube(term, nextPageToken);
          if (!data.items || data.items.length === 0) break;
          
          for (const item of data.items) {
            const vid = item.id?.videoId;
            // STRICT FILTER: If it exists in Turso already OR we already grabbed it in this script, skip it!
            if (vid && !existingGlobalSet.has(vid)) {
              existingGlobalSet.add(vid); // Add to global set so we don't fetch it again
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
          if (err.message.includes('quota')) {
            console.log('\n⚠️ API Quota Exceeded! Stopping fetch and inserting what we have.');
            break;
          }
          break;
        }
      }
    }

    console.log(`\n✅ Secured ${newUniqueVideos.length} brand new unique SHORTS for ${dist.group}.`);
    if (newUniqueVideos.length === 0) continue;

    // Distribute these NEW videos to the classes
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
      console.log(`  🎉 [${cls}] Appended ${count} completely new SHORTS.`);
    }
  }

  console.log(`\n✅ DATABASE STRICT APPEND COMPLETE! Exactly ${totalNewInserted} New Rows Added.`);
}

scrapeMoreStrictUnique().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
