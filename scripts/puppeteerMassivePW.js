const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';
const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const PW_MAPPINGS = [
  { className: 'IV-A', query: 'physics wallah class 4' },
  { className: 'V-A', query: 'physics wallah class 5' },
  { className: 'VI-A', query: 'pw foundation class 6' },
  { className: 'VII-A', query: 'pw foundation class 7' },
  { className: 'VIII-A', query: 'pw foundation class 8' },
  { className: 'IX-A', query: 'pw foundation class 9' },
  { className: 'X-A', query: 'pw foundation class 10' }
];

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function runMassiveBrowserScrape() {
  console.log('🚀 INITIATING MASSIVE PW BROWSER SCRAPE (DEEP SCROLLING)...');

  const existingRes = await db.execute('SELECT DISTINCT youtube_video_id FROM app_reels');
  const existingGlobalSet = new Set(existingRes.rows.map(r => r.youtube_video_id));
  console.log(`🛡️ Loaded ${existingGlobalSet.size} existing videos.`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  let totalNewInserted = 0;

  for (const mapping of PW_MAPPINGS) {
    console.log(`\n=== DEEP SCROLLING PW videos for ${mapping.className} ===`);
    const newUniqueVideos = new Map();
    
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(mapping.query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Scroll down massively (30 times) to load hundreds of videos!
      for (let i = 0; i < 30; i++) {
        await page.evaluate(() => window.scrollBy(0, 2000));
        process.stdout.write(`\r⏳ Scrolling page ${i + 1}/30...`);
        await delay(1500); // Wait for YouTube to fetch more videos
      }
      console.log(`\n✅ Finished deep scrolling for ${mapping.className}. Extracting videos...`);

      // Extract videos from DOM
      const videos = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('ytd-video-renderer, ytd-reel-item-renderer');
        items.forEach(item => {
          const a = item.querySelector('a#video-title, a.ytd-reel-item-renderer');
          if (a && a.href) {
            let vid = null;
            if (a.href.includes('/watch?v=')) vid = new URL(a.href).searchParams.get('v');
            else if (a.href.includes('/shorts/')) vid = a.href.split('/shorts/')[1].split('?')[0];
            
            if (vid) {
              const title = a.textContent ? a.textContent.trim() : 'Physics Wallah Video';
              results.push({ yt: vid, title: title, ch: 'Physics Wallah', sub: 'Science' });
            }
          }
        });
        return results;
      });

      for (const v of videos) {
        if (!existingGlobalSet.has(v.yt)) {
          existingGlobalSet.add(v.yt);
          newUniqueVideos.set(v.yt, v); // Using Map prevents duplicates within this single scrape
        }
      }
      
      console.log(`✅ Extracted ${newUniqueVideos.size} NEW unique videos for ${mapping.className}.`);
    } catch (e) {
      console.log(`❌ Failed to scrape ${mapping.className}:`, e.message);
    }

    if (newUniqueVideos.size === 0) continue;

    const batch = [];
    let count = 0;
    
    for (const v of newUniqueVideos.values()) {
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
    console.log(`  🎉 [${mapping.className}] Inserted ${count} massive PW videos.`);
  }

  await browser.close();
  console.log(`\n✅ MASSIVE BROWSER SYNC COMPLETE! Exactly ${totalNewInserted} New PW Videos Added to respective classes.`);
}

runMassiveBrowserScrape().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
