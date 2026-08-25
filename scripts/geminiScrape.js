const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const KINDERGARTEN = ['Nursery-A', 'LKG-A', 'UKG-A']; // 5000 total -> 1667 each
const PRIMARY = ['I-A', 'II-A', 'III-A', 'IV-A']; // 10000 total -> 2500 each
const SECONDARY = ['V-A', 'VI-A', 'VII-A', 'VIII-A', 'IX-A', 'X-A']; // 20000 total -> 3334 each

const curatedVideos = [
  { yt: 'JINLXAXYhic', title: 'The Immune System Explained', ch: 'Kurzgesagt', sub: 'Biology' },
  { yt: 'zQGOcOUBi6s', title: 'The Egg - A Short Story', ch: 'Kurzgesagt', sub: 'Philosophy' },
  { yt: 'UjtOGPJ0URM', title: 'Why Black Holes Could Delete The Universe', ch: 'Kurzgesagt', sub: 'Physics' },
  { yt: 'F1Hq8eVOMHs', title: 'The Tailor\'s Enigma', ch: 'Vsauce', sub: 'Science' },
  { yt: 'jHbyQ_AQP8c', title: 'Is The Earth Flat?', ch: 'Vsauce', sub: 'Science' },
  { yt: '3z2gR-X1eZk', title: 'The Most Radioactive Places on Earth', ch: 'Veritasium', sub: 'Physics' },
  { yt: 'c0En-_BVbGc', title: 'The Surprising Secret of Synchronization', ch: 'Veritasium', sub: 'Physics' },
  { yt: 'KqRN2TbdhqU', title: 'How Does the Blockchain Work?', ch: 'TED-Ed', sub: 'Technology' },
  { yt: 'fXb02MQ78yQ', title: 'Questions No One Knows the Answers to', ch: 'TED-Ed', sub: 'Science' },
  { yt: 'bEVcG1N_5g0', title: 'The Fermi Paradox', ch: 'Kurzgesagt', sub: 'Space' },
  { yt: 'sNhhvQGsMEc', title: 'Optimistic Nihilism', ch: 'Kurzgesagt', sub: 'Philosophy' },
  { yt: 'goW1n3y3aIQ', title: 'The Science of Aging', ch: 'AsapSCIENCE', sub: 'Biology' },
  { yt: '3E12nIpfjzQ', title: 'What if You Stopped Sleeping?', ch: 'AsapSCIENCE', sub: 'Biology' },
  { yt: 'ZInL9M7K3Jk', title: 'How an Engine Works', ch: 'SmarterEveryDay', sub: 'Engineering' },
  { yt: 'UqBxoqUq-kU', title: 'The Backwards Brain Bicycle', ch: 'SmarterEveryDay', sub: 'Psychology' },
  { yt: 'hFZFjoX2cGg', title: 'World\'s Largest Lemon Explorer', ch: 'Mark Rober', sub: 'Engineering' },
  { yt: 'aKOPyYcEqmQ', title: 'Liquid Sand Hot Tub', ch: 'Mark Rober', sub: 'Physics' },
  { yt: 'GbrJkXw5P8I', title: 'The Science of Vision', ch: 'Physics Wallah', sub: 'Science' },
  { yt: 'rv4-oig0Yn4', title: 'Math is the hidden secret to understanding the world', ch: 'TED-Ed', sub: 'Mathematics' },
  { yt: 'O5nvB0A11a8', title: 'Chemical Reactions', ch: 'CrashCourse', sub: 'Chemistry' },
  { yt: 'Oqz8Ry7omUU', title: 'Planets for Kids', ch: 'ChuChu TV', sub: 'Education' },
  { yt: 'r2R0u4CBJkc', title: 'Johny Johny Yes Papa', ch: 'ChuChu TV', sub: 'Rhymes' }
];

async function insertGeminiVideos() {
  console.log('🚀 INITIALIZING MASSIVE 35,000 REEL SYNC...');

  let totalInserted = 0;
  
  async function processCategory(classes, totalNeeded) {
    const targetPerClass = Math.ceil(totalNeeded / classes.length);
    for (const cls of classes) {
      const batch = [];
      let count = 0;
      for (let i = 0; i < targetPerClass; i++) {
        const v = curatedVideos[Math.floor(Math.random() * curatedVideos.length)];
        const randomLikes = Math.floor(Math.random() * 5000) + 100;
        const randomViews = randomLikes * 12 + Math.floor(Math.random() * 1000);
        const uniqueTitle = `${v.title} | Fact #${totalInserted + count + 1}`;
        batch.push({
          sql: `INSERT INTO app_reels (title, youtube_video_id, class_name, subject, channel_name, duration_sec, likes_count, views_count, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [uniqueTitle, v.yt, cls, v.sub, v.ch, 55, randomLikes, randomViews, `${v.sub.toLowerCase()},education,${cls.toLowerCase()}`]
        });
        count++;
        
        if (batch.length === 200) {
          await db.batch(batch, 'write');
          batch.length = 0;
        }
      }
      if (batch.length > 0) {
        await db.batch(batch, 'write');
      }
      totalInserted += count;
      console.log(`  🎉 [${cls}] Inserted ${count} videos.`);
    }
  }

  await processCategory(KINDERGARTEN, 5000);
  await processCategory(PRIMARY, 10000);
  await processCategory(SECONDARY, 20000);

  console.log(`\n✅ DATABASE SYNC COMPLETE! Exactly ${totalInserted} Reels Inserted.`);
}

insertGeminiVideos().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
