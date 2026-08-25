const https = require('https');

function searchYouTube(query) {
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const regex = /\/shorts\/([a-zA-Z0-9_-]{11})/g;
      const matches = new Set();
      let match;
      while ((match = regex.exec(data)) !== null) {
        matches.add(match[1]);
      }
      console.log(`Results for ${query}:`);
      console.log(Array.from(matches).slice(0, 5));
    });
  }).on('error', err => console.error(err));
}

searchYouTube('Science and fun short ashu sir');
searchYouTube('Physics wallah short alakh pandey');
searchYouTube('Khan sir patna short');
searchYouTube('Dear sir short');
searchYouTube('Code with harry short');
searchYouTube('ChuChu TV Hindi short');
searchYouTube('Dr Binocs Hindi short');
searchYouTube('LearnFatafat Hindi short');
searchYouTube('Apna college short');
