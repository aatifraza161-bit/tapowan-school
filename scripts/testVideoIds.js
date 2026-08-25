const https = require('https');

const videoIds = [
  'BELlZKpi1Zs', 'DR-cfDsHCGA', 'W_aXQ4V_6u8', 'q1xNuU7gaAQ', 'mb9b_g2UqQY',
  'R3wK0VnUaWk', 'x1bXzJ5l_mI', 'KM-59ljA4Bs', 'Xk4-6II8l5Q', 's_vD0U2N0c8',
  'vD_9W3K8Lm0', 'LpuPe81bc2w', 'y61_4n42zc4', 'Kou7ur5xt_4', 'EM08G9_hH0g',
  'grnP3m55hmU', 'm2X5i_qZlP8', 'd9b_cZ_0x9A', 'XW_1n0pL9q0', 'kM9ASKAni_s',
  '7_LPdttKXPc', 'nRGL4mE2H48', 'pL0_m2K8Vw0'
];

async function checkId(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ [${res.statusCode}] ${id}: ${json.title.slice(0, 45)}`);
            resolve(true);
          } catch(e) {
            console.log(`❌ [${res.statusCode}] ${id}: JSON error`);
            resolve(false);
          }
        } else {
          console.log(`❌ [${res.statusCode}] ${id}: Video unavailable / not found`);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log(`❌ ${id}: Network error - ${e.message}`);
      resolve(false);
    });
  });
}

(async () => {
  console.log('Testing video IDs against YouTube oEmbed API:\n');
  for (const id of videoIds) {
    await checkId(id);
  }
})();
