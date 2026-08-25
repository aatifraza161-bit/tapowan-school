const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

const scrapedData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scraped_shorts.json')));

const SECONDARY_CURATED = [
  { yt: 'JJAmk3JjyjY', ch: 'Science & Fun Ashu Sir', sub: 'Science', lang: 'Hinglish', title: 'Science Experiment by Ashu Sir' },
  { yt: 'X2Ole_wsMLQ', ch: 'Science & Fun Ashu Sir', sub: 'Science', lang: 'Hinglish', title: 'Amazing Chemistry Trick' },
  { yt: 'Z6IwZIC21Cw', ch: 'Science & Fun Ashu Sir', sub: 'Science', lang: 'Hinglish', title: 'Physics Magic with Ashu Sir' },
  { yt: 'wIYsdfsRLX8', ch: 'Science & Fun Ashu Sir', sub: 'Science', lang: 'Hinglish', title: 'Fun Science Fact' },
  { yt: 'ocZ90fblvl8', ch: 'Science & Fun Ashu Sir', sub: 'Science', lang: 'Hinglish', title: 'Learn Science Practically' },
  { yt: 'JCfAqN5VAbA', ch: 'Physics Wallah Shorts', sub: 'Science', lang: 'Hinglish', title: 'Motivation by Alakh Sir' },
  { yt: 'TF2Pw-dLdWI', ch: 'Physics Wallah Shorts', sub: 'Science', lang: 'Hinglish', title: 'Physics Wallah Class Tip' },
  { yt: 'hDbS8IFZTNk', ch: 'Physics Wallah Shorts', sub: 'Science', lang: 'Hinglish', title: 'PW Study Hack' },
  { yt: 'LOgYGNTlI1w', ch: 'Physics Wallah Shorts', sub: 'Science', lang: 'Hinglish', title: 'Physics Concept in 60s' },
  { yt: 'XRsturiiJdE', ch: 'Physics Wallah Shorts', sub: 'Science', lang: 'Hinglish', title: 'Alakh Pandey Journey' },
  { yt: 'Uk28waLGPVU', ch: 'Khan Global Studies', sub: 'Social Science', lang: 'Hindi', title: 'Khan Sir Patna G.K.' },
  { yt: 'dH6AaoAhy5k', ch: 'Khan Global Studies', sub: 'Social Science', lang: 'Hindi', title: 'Khan Sir Map Reading' },
  { yt: 'z2omvaz5sLk', ch: 'Khan Global Studies', sub: 'Social Science', lang: 'Hindi', title: 'History with Khan Sir' },
  { yt: 'VVaOqyd67ns', ch: 'Khan Global Studies', sub: 'Social Science', lang: 'Hindi', title: 'Geography Facts Khan Sir' },
  { yt: 'QZMkRNVP_ik', ch: 'Khan Global Studies', sub: 'Social Science', lang: 'Hindi', title: 'Important GK by Khan Sir' },
  { yt: 'yQ7NKlMO7e8', ch: 'Dear Sir', sub: 'Mathematics', lang: 'Hinglish', title: 'Maths Fast Calculation' },
  { yt: 'JKy-N9R3EFA', ch: 'Dear Sir', sub: 'Mathematics', lang: 'Hinglish', title: 'Dear Sir English Trick' },
  { yt: 'ifJG4S1mLN4', ch: 'Dear Sir', sub: 'Mathematics', lang: 'Hinglish', title: 'Maths Shortcut Trick' },
  { yt: 'iy7T6U-liGc', ch: 'Dear Sir', sub: 'Mathematics', lang: 'Hinglish', title: 'Vedic Math Formula' },
  { yt: 'bEthd5g9E88', ch: 'Dear Sir', sub: 'Mathematics', lang: 'Hinglish', title: 'Dear Sir Motivation' },
  { yt: 'PVP-fpubbTs', ch: 'Code With Harry', sub: 'Computer Science', lang: 'Hinglish', title: 'Coding Tips Harry' },
  { yt: 'X89cFg7Zd_o', ch: 'Code With Harry', sub: 'Computer Science', lang: 'Hinglish', title: 'Web Development Basics' },
  { yt: 'gD5Ig1l_STM', ch: 'Code With Harry', sub: 'Computer Science', lang: 'Hinglish', title: 'Python in 60s' },
  { yt: 'z1e87Lq04gM', ch: 'Code With Harry', sub: 'Computer Science', lang: 'Hinglish', title: 'Learn Programming Fast' },
  { yt: 'DhdgE54WdnE', ch: 'Code With Harry', sub: 'Computer Science', lang: 'Hinglish', title: 'Tech Career Advice' },
  { yt: 'VVvVxMOrh14', ch: 'Apna College Shorts', sub: 'Computer Science', lang: 'Hinglish', title: 'Software Engineering Tips' },
  { yt: 'ugn5t8xGHio', ch: 'Apna College Shorts', sub: 'Computer Science', lang: 'Hinglish', title: 'College Placements' },
  { yt: '7oanefWH3y8', ch: 'Apna College Shorts', sub: 'Computer Science', lang: 'Hinglish', title: 'Apna College Study Hack' },
  { yt: 'ALJ-AQpQvNM', ch: 'Apna College Shorts', sub: 'Computer Science', lang: 'Hinglish', title: 'Learn C++ & Java' },
  { yt: 'wu-FshvmMek', ch: 'Apna College Shorts', sub: 'Computer Science', lang: 'Hinglish', title: 'Tech Resume Guide' },
  { yt: '5qap5aO4i9A', ch: 'Lofi Kids Hub', sub: 'General', lang: 'Music', title: 'Lofi Study Beats' },
  { yt: 'M7lc1UVf-VE', ch: 'Google for Developers', sub: 'Computer Science', lang: 'English', title: 'Google Dev Tech' },
  { yt: 'RgKAFK5djSk', ch: 'World Geo Media', sub: 'Social Science', lang: 'English', title: 'World Geography' }
];

const TIER_MAPPING = {
  Kindergarten: scrapedData.Kindergarten,
  Primary: scrapedData.Primary,
  Secondary: SECONDARY_CURATED
};

const ALL_13_CLASSES = [
  { name: 'Nursery-A', tier: 'Kindergarten', label: 'Nursery' },
  { name: 'LKG-A', tier: 'Kindergarten', label: 'LKG' },
  { name: 'UKG-A', tier: 'Kindergarten', label: 'UKG' },
  { name: 'I-A', tier: 'Primary', label: 'Class 1' },
  { name: 'II-A', tier: 'Primary', label: 'Class 2' },
  { name: 'III-A', tier: 'Primary', label: 'Class 3' },
  { name: 'IV-A', tier: 'Primary', label: 'Class 4' },
  { name: 'V-A', tier: 'Primary', label: 'Class 5' },
  { name: 'VI-A', tier: 'Secondary', label: 'Class 6' },
  { name: 'VII-A', tier: 'Secondary', label: 'Class 7' },
  { name: 'VIII-A', tier: 'Secondary', label: 'Class 8' },
  { name: 'IX-A', tier: 'Secondary', label: 'Class 9' },
  { name: 'X-A', tier: 'Secondary', label: 'Class 10' }
];

async function initReelsTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_reels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      youtube_video_id TEXT NOT NULL,
      class_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      channel_name TEXT,
      duration_sec INTEGER DEFAULT 45,
      likes_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function generate1000ReelsForClass(cls) {
  const list = [];
  const baseArray = TIER_MAPPING[cls.tier] || TIER_MAPPING.Secondary;
  
  let currentShuffled = shuffle([...baseArray]);
  let indexInShuffle = 0;

  for (let i = 1; i <= 1000; i++) {
    if (indexInShuffle >= currentShuffled.length) {
      currentShuffled = shuffle([...baseArray]);
      indexInShuffle = 0;
    }

    const base = currentShuffled[indexInShuffle];
    indexInShuffle++;

    const randomLikes = Math.floor(Math.random() * 850) + 150;
    const randomViews = randomLikes * 15 + Math.floor(Math.random() * 250);

    const title = base.title || 'Educational Short';
    const yt = base.yt;
    const ch = base.ch || 'Education Channel';
    const sub = base.sub || 'General';
    const lang = base.lang || 'Hinglish';
    const country = base.country || 'India';

    list.push({
      title: `${title} [L${i}]`,
      youtube_video_id: yt,
      class_name: cls.name,
      subject: sub,
      channel_name: ch,
      duration_sec: 45,
      likes_count: randomLikes,
      views_count: randomViews,
      tags: `${sub.toLowerCase()},${lang.toLowerCase()},${country.toLowerCase()},${cls.name.toLowerCase()},${cls.tier.toLowerCase()}`
    });
  }

  return list;
}

async function syncEducationalReels30Min() {
  console.log('===============================================================');
  console.log('🎬 MASSIVE SYNC: 1000 REELS PER CLASS (13,000 TOTAL)');
  console.log('===============================================================');

  await initReelsTable();

  await db.execute('DELETE FROM app_reels');
  console.log(`🗑️ [Step 1] Purged previous batch completely.`);

  let totalInserted = 0;

  for (const cls of ALL_13_CLASSES) {
    const classReels = generate1000ReelsForClass(cls);
    const batch = [];
    
    for (const r of classReels) {
      batch.push({
        sql: `
          INSERT INTO app_reels 
          (title, youtube_video_id, class_name, subject, channel_name, duration_sec, likes_count, views_count, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [r.title, r.youtube_video_id, r.class_name, r.subject, r.channel_name, r.duration_sec, r.likes_count, r.views_count, r.tags]
      });
      totalInserted++;

      if (batch.length === 250) {
        await db.batch(batch, 'write');
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await db.batch(batch, 'write');
    }

    console.log(`  ✅ [${cls.name}] Inserted 1000 Reels with ${cls.tier} Segregation`);
  }

  const afterRes = await db.execute('SELECT COUNT(*) as cnt FROM app_reels');
  const countAfter = Number(afterRes.rows[0].cnt || 0);

  console.log('\n===============================================================');
  console.log(`🎉 SUCCESS: ${countAfter} ISOLATED REELS LIVE IN CLOUD DB!`);
  console.log('===============================================================');
}

if (require.main === module) {
  syncEducationalReels30Min()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Reels sync error:', err);
      process.exit(1);
    });
}
