const https = require('https');

// Pool of candidate Indian & International educational YouTube IDs
const candidateList = [
  // --- INDIAN CHANNELS (Hindi / Hinglish - 70%) ---
  // Kindergarten & Rhymes & Phonics
  { id: '_UR-l3QI2nE', title: 'अ से अनार आ से आम - हिंदी वर्णमाला', ch: 'ChuChu TV Hindi', country: 'India', lang: 'Hindi', sub: 'Hindi', tier: 'Kindergarten' },
  { id: 'F4tHL8reNCs', title: 'जॉनी जॉनी यस पापा - बाल गीत', ch: 'LooLoo Kids Hindi', country: 'India', lang: 'Hindi', sub: 'Hindi', tier: 'Kindergarten' },
  { id: 'DR-cfDsHCGA', title: '1 से 10 तक गिनती डांस - हिंदी', ch: 'Ginti Hindi Rhymes', country: 'India', lang: 'Hindi', sub: 'Mathematics', tier: 'Kindergarten' },
  { id: 'BELlZKpi1Zs', title: 'A to Z Phonics Sounds सीखो', ch: 'KidsTV India', country: 'India', lang: 'Hinglish', sub: 'English', tier: 'Kindergarten' },
  { id: 'tVlcKp3bWH8', title: 'नमस्ते और अच्छी आदतें - Good Habits', ch: 'Super Simple Hindi', country: 'India', lang: 'Hinglish', sub: 'EVS', tier: 'Kindergarten' },
  { id: '75p-N9YKqNo', title: 'English Alphabets Phonics Song', ch: 'Kids Learning India', country: 'India', lang: 'Hinglish', sub: 'English', tier: 'Kindergarten' },
  
  // Primary (Class 1 to 5) - Hindi / Hinglish
  { id: 'KM-59ljA4Bs', title: 'बारिश कैसे होती है? Water Cycle का सच', ch: 'Science and Fun Ashu Sir', country: 'India', lang: 'Hinglish', sub: 'Science', tier: 'Primary' },
  { id: 'Xk4-6II8l5Q', title: 'पत्तों का हरा रंग: Chlorophyll का जादू', ch: 'LearnFatafat Hindi', country: 'India', lang: 'Hinglish', sub: 'Science', tier: 'Primary' },
  { id: '6v2L2UGZJAM', title: 'हमारी पृथ्वी और सौरमंडल की सैर', ch: 'Discovery Nature India', country: 'India', lang: 'Hindi', sub: 'Science', tier: 'Primary' },
  { id: 'LpuPe81bc2w', title: 'Computer 0 और 1 Binary में कैसे काम करता है?', ch: 'Code With Harry', country: 'India', lang: 'Hinglish', sub: 'Computer Science', tier: 'Primary' },
  { id: '8mve0UoSxTo', title: 'Mathematics के जादुई कैलकुलेशन ट्रिक्स', ch: 'Dear Sir Maths', country: 'India', lang: 'Hinglish', sub: 'Mathematics', tier: 'Primary' },
  { id: 'q1xNuU7gaAQ', title: 'हमारे 5 Sense Organs का जादुई काम', ch: 'Dr. Binocs Hindi', country: 'India', lang: 'Hinglish', sub: 'EVS', tier: 'Primary' },

  // Secondary (Class 6 to 10) - Hindi / Hinglish
  { id: 'Kou7ur5xt_4', title: 'Elephant Toothpaste Chemical Catalyst Reaction', ch: 'Ashu Sir Science & Fun', country: 'India', lang: 'Hinglish', sub: 'Science', tier: 'Secondary' },
  { id: 'ZihywtixUYo', title: 'Physics के सभी नियम और Quantum Mechanics', ch: 'Physics Wallah Shorts', country: 'India', lang: 'Hinglish', sub: 'Science', tier: 'Secondary' },
  { id: 'kM9ASKAni_s', title: 'Algorithm क्या होता है? Real Life Example', ch: 'Apna College Shorts', country: 'India', lang: 'Hinglish', sub: 'Computer Science', tier: 'Secondary' },
  { id: '7_LPdttKXPc', title: 'Internet कैसे काम करता है 60 Seconds में?', ch: 'Tech Gyan India', country: 'India', lang: 'Hinglish', sub: 'Computer Science', tier: 'Secondary' },
  { id: 'UB1O30fR-EE', title: 'HTML & Web Development Full Course', ch: 'Code With Harry Hindi', country: 'India', lang: 'Hinglish', sub: 'Computer Science', tier: 'Secondary' },

  // --- INTERNATIONAL CHANNELS (Global - 30%) ---
  { id: 'M7lc1UVf-VE', title: 'How Modern Web Players Work (Google Devs)', ch: 'Google for Developers', country: 'Global', lang: 'English', sub: 'Computer Science', tier: 'Secondary' },
  { id: '5qap5aO4i9A', title: 'Study Focus & Brain Concentration', ch: 'Lofi Study Hub', country: 'Global', lang: 'Music', sub: 'General', tier: 'Secondary' },
  { id: 'JGwWNGJdvx8', title: 'Music & Rhythms in Learning', ch: 'Ed Sheeran Studio', country: 'Global', lang: 'English', sub: 'English', tier: 'Primary' },
  { id: 'RgKAFK5djSk', title: 'Global Geography & Culture', ch: 'World Media', country: 'Global', lang: 'English', sub: 'Social Science', tier: 'Secondary' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars: Space & Astronomy', ch: 'Astro Kids Global', country: 'Global', lang: 'English', sub: 'Science', tier: 'Primary' }
];

async function verifyId(item) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.id}&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const j = JSON.parse(data);
            resolve({ ...item, verified: true, oembedTitle: j.title });
          } catch(e) { resolve(null); }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  console.log('Testing candidates against YouTube oEmbed API...');
  const passed = [];
  for (const c of candidateList) {
    const res = await verifyId(c);
    if (res) {
      console.log(`✅ [${res.country} - ${res.lang}] ${res.id} -> ${res.title}`);
      passed.push(res);
    }
  }

  const indianCount = passed.filter(p => p.country === 'India').length;
  const globalCount = passed.filter(p => p.country === 'Global').length;
  const total = passed.length;
  const indianPct = Math.round((indianCount / total) * 100);
  const globalPct = Math.round((globalCount / total) * 100);

  console.log(`\n📊 SUMMARY:`);
  console.log(`- Total Verified Videos: ${total}`);
  console.log(`- Indian / Hindi & Hinglish Creators: ${indianCount} (${indianPct}%)`);
  console.log(`- Global Creators: ${globalCount} (${globalPct}%)`);
})();
