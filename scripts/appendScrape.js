const ytSearch = require('yt-search');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

// GENERATE NEW QUERIES
const QUERIES = { Kindergarten: [], Primary: [], Secondary: [] };

// KINDERGARTEN
const kgTopics = ['learning', 'playtime', 'fun learning', 'preschool activities', 'nursery rhymes collection', 'alphabet song', 'number song', 'color song', 'shape song', 'animal sounds', 'kids story', 'kids craft', 'baby song', 'toddler learning', 'phonics for kids', 'bedtime story', 'toddler dance', 'kids yoga', 'preschool math', 'toddler words'];
const kgPrefixes = ['cute', 'funny', 'educational', 'animated', '3d', 'nursery', 'happy', 'super', 'best', 'new', 'toddler'];
for (const t of kgTopics) {
  for (const p of kgPrefixes) {
    QUERIES.Kindergarten.push({ q: `${p} ${t} shorts`, sub: t });
    QUERIES.Kindergarten.push({ q: `${p} ${t} for kids`, sub: t });
  }
}

// PRIMARY
const priClasses = ['class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'primary school', 'kids grade'];
const priSubjects = ['math tricks', 'science project', 'english words', 'gk facts', 'hindi story', 'environmental science', 'computer basics', 'solar system', 'plants', 'animals', 'history facts', 'geography for kids', 'spelling bee', 'science experiment', 'math puzzles'];
for (const c of priClasses) {
  for (const s of priSubjects) {
    QUERIES.Primary.push({ q: `${c} ${s} education shorts`, sub: s });
    QUERIES.Primary.push({ q: `${c} ${s} study video`, sub: s });
  }
}

// SECONDARY
const secClasses = ['class 6', 'class 7', 'class 8', 'class 9', 'class 10', 'grade 6', 'grade 7', 'grade 8', 'grade 9', 'grade 10', 'ncert', 'cbse', 'high school', 'middle school'];
const secSubjects = ['math shortcut', 'physics concept', 'chemistry experiment', 'biology anatomy', 'history story', 'geography mapping', 'civics facts', 'coding tutorial', 'grammar rules', 'vocabulary', 'algebra tricks', 'geometry visualization', 'periodic table', 'human body 3d', 'space science'];
for (const c of secClasses) {
  for (const s of secSubjects) {
    QUERIES.Secondary.push({ q: `${c} ${s} study shorts`, sub: s });
    QUERIES.Secondary.push({ q: `${c} ${s} explanation`, sub: s });
  }
}

// Randomize query order
QUERIES.Kindergarten = QUERIES.Kindergarten.sort(() => Math.random() - 0.5);
QUERIES.Primary = QUERIES.Primary.sort(() => Math.random() - 0.5);
QUERIES.Secondary = QUERIES.Secondary.sort(() => Math.random() - 0.5);

const ALL_CLASSES = [
  { name: 'Nursery-A', tier: 'Kindergarten' }, { name: 'LKG-A', tier: 'Kindergarten' }, { name: 'UKG-A', tier: 'Kindergarten' },
  { name: 'I-A', tier: 'Primary' }, { name: 'II-A', tier: 'Primary' }, { name: 'III-A', tier: 'Primary' }, { name: 'IV-A', tier: 'Primary' }, { name: 'V-A', tier: 'Primary' },
  { name: 'VI-A', tier: 'Secondary' }, { name: 'VII-A', tier: 'Secondary' }, { name: 'VIII-A', tier: 'Secondary' }, { name: 'IX-A', tier: 'Secondary' }, { name: 'X-A', tier: 'Secondary' }
];

async function runAppendScrape() {
  console.log('=============================================================');
  console.log('🚀 APPENDING 1000 NEW UNIQUE VIDEOS PER CLASS');
  console.log('=============================================================');

  // 1. Fetch existing video IDs
  console.log('📦 Fetching existing videos from DB to avoid duplicates...');
  const existingRes = await db.execute('SELECT youtube_video_id FROM app_reels');
  const existingSet = new Set();
  existingRes.rows.forEach(r => existingSet.add(r.youtube_video_id));
  console.log(`✅ Found ${existingSet.size} existing unique videos across all classes.\n`);

  for (const tier of ['Kindergarten', 'Primary', 'Secondary']) {
    console.log(`\n================= SCRAPING TIER: ${tier} =================`);
    const tierVideosMap = new Map();
    let qCount = 0;
    
    // We want 1000 unique new videos for the tier.
    for (const qObj of QUERIES[tier]) {
      if (tierVideosMap.size >= 1000) break; // Reached target
      
      try {
        if (qCount % 5 === 0) console.log(`🔍 Query ${qCount}/${QUERIES[tier].length} - Found ${tierVideosMap.size}/1000 new unique...`);
        const res = await ytSearch(qObj.q);
        const shorts = res.videos;
        for (const v of shorts) {
          if (!existingSet.has(v.videoId) && !tierVideosMap.has(v.videoId)) {
            tierVideosMap.set(v.videoId, { yt: v.videoId, title: v.title, ch: v.author?.name || 'Edu', sub: qObj.sub });
            existingSet.add(v.videoId); // Prevent cross-tier duplicates just in case
          }
        }
        await new Promise(r => setTimeout(r, 100)); // Small delay
      } catch (err) {}
      qCount++;
    }
    
    const newTierVideos = Array.from(tierVideosMap.values());
    console.log(`✅ Collected ${newTierVideos.length} NEW UNIQUE videos for ${tier} tier.`);
    
    // Insert into DB for each class in the tier
    const classesInTier = ALL_CLASSES.filter(c => c.tier === tier);
    for (const cls of classesInTier) {
      const batch = [];
      let count = 0;
      
      // Shuffle just to be nice, but insert whatever we found up to 1000
      let videosToInsert = newTierVideos.sort(() => Math.random() - 0.5);
      if (videosToInsert.length > 1000) videosToInsert = videosToInsert.slice(0, 1000);

      for (const v of videosToInsert) {
        const randomLikes = Math.floor(Math.random() * 850) + 150;
        const randomViews = randomLikes * 15 + Math.floor(Math.random() * 250);
        batch.push({
          sql: `INSERT INTO app_reels (title, youtube_video_id, class_name, subject, channel_name, duration_sec, likes_count, views_count, tags, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [v.title, v.yt, cls.name, v.sub, v.ch, 45, randomLikes, randomViews, `${v.sub.toLowerCase()},india,${cls.name.toLowerCase()}`]
        });
        count++;
        if (batch.length === 200) { await db.batch(batch, 'write'); batch.length = 0; }
      }
      if (batch.length > 0) { await db.batch(batch, 'write'); }
      console.log(`  🎉 [${cls.name}] Appended EXACTLY ${count} NEW UNIQUE Videos!`);
    }
  }

  const finalRes = await db.execute('SELECT COUNT(*) as cnt FROM app_reels');
  console.log(`\n✅ DATABASE APPEND COMPLETE! Total Reels in DB: ${finalRes.rows[0].cnt}`);
}

runAppendScrape().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
