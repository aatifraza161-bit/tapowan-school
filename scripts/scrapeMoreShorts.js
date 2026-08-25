const ytSearch = require('yt-search');
const fs = require('fs');

async function scrapeQueries(queries, limitPerQuery) {
  const shortsMap = new Map();
  for (const q of queries) {
    try {
      const res = await ytSearch(q);
      const shorts = res.videos.filter(v => v.seconds <= 60);
      for (const v of shorts.slice(0, limitPerQuery)) {
        shortsMap.set(v.videoId, {
          yt: v.videoId,
          title: v.title,
          ch: v.author.name || q.split(' ')[0],
          sub: 'Education',
          lang: 'Hinglish',
          country: 'India'
        });
      }
    } catch (e) {
      console.log('Error searching:', q, e.message);
    }
  }
  return Array.from(shortsMap.values());
}

async function buildLargeLibrary() {
  console.log('Scraping Kindergarten (Cartoons & Rhymes)...');
  const kgIds = await scrapeQueries([
    'ChuChu TV Hindi Nursery Rhymes shorts',
    'LooLoo Kids Hindi shorts',
    'Hindi Balgeet short video',
    'KidsTV India shorts',
    'Ginti 1 to 10 rhymes shorts',
    'Phonics song shorts hindi'
  ], 25);

  console.log('Scraping Primary (EVS, English, LearnFatafat)...');
  const primaryIds = await scrapeQueries([
    'LearnFatafat Hindi shorts science',
    'Dr Binocs Hindi shorts EVS',
    'Super Simple Songs shorts hindi',
    'Kids learning EVS shorts',
    'Water cycle kids short video',
    'Solar system for kids shorts hindi'
  ], 25);

  console.log('Scraping Secondary (Physics Wallah, Khan Sir, Ashu Sir, Dear Sir, Code with Harry)...');
  const secIds = await scrapeQueries([
    'Khan sir patna shorts history',
    'Physics wallah shorts alakh pandey motivation',
    'Science and fun shorts experiment ashu sir',
    'Dear sir math shortcuts shorts',
    'Code with harry shorts web development',
    'Apna college placement shorts',
    'Khan sir map reading shorts',
    'Physics wallah concepts shorts'
  ], 20);

  const lib = {
    Kindergarten: kgIds,
    Primary: primaryIds,
    Secondary: secIds
  };

  fs.writeFileSync('scraped_shorts.json', JSON.stringify(lib, null, 2));
  console.log(`Saved! KG: ${lib.Kindergarten.length}, Primary: ${lib.Primary.length}, Secondary: ${lib.Secondary.length}`);
}

buildLargeLibrary();
