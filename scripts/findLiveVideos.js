const https = require('https');

const hindiCandidates = [
  'y61_4n42zc4',
  '7i3a24Zt274',
  'Xn7KxGuZf10',
  '3C86ETr8_FU',
  'C8kSrkzPe4U',
  '0rZ3B9fT_7g',
  'gDk_0_D5C_U',
  '4Wk1gP2hG9g',
  'P8m1Q7s_32Y',
  'M7lc1UVf-VE',
  'BELlZKpi1Zs',
  'DR-cfDsHCGA',
  'q1xNuU7gaAQ',
  'KM-59ljA4Bs',
  'Xk4-6II8l5Q',
  'LpuPe81bc2w',
  'Kou7ur5xt_4',
  'kM9ASKAni_s',
  '7_LPdttKXPc',
  'tVlcKp3bWH8',
  '75p-N9YKqNo',
  'F4tHL8reNCs',
  'ZihywtixUYo',
  '8mve0UoSxTo',
  '_UR-l3QI2nE',
  '6v2L2UGZJAM',
  'UB1O30fR-EE'
];

async function check(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const j = JSON.parse(data);
            console.log(`✅ [200 OK] id: '${id}', title: '${j.title.slice(0, 45)}', author: '${j.author_name}'`);
            resolve({ id, title: j.title, author: j.author_name });
          } catch(e) { resolve(null); }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const valid = [];
  for (const id of hindiCandidates) {
    const res = await check(id);
    if (res) valid.push(res);
  }
  console.log(`\nVerified count: ${valid.length}`);
})();
