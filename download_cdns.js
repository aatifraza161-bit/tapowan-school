const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const urls = [
  'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css',
  'https://cdn.lordicon.com/lordicon.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/babel-standalone@6/babel.min.js'
];

const vendorDir = path.join(__dirname, 'public', 'vendor');
if (!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir);

let indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

async function download(url) {
  const filename = url.split('/').pop();
  const dest = path.join(vendorDir, filename);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
         return download(res.headers.location).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        
        // Update index.html
        indexHtml = indexHtml.replace(url, `vendor/${filename}`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const url of urls) {
    console.log(`Downloading ${url}...`);
    try {
      await download(url);
    } catch (e) {
      console.error(`Failed ${url}:`, e);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), indexHtml);
  console.log('All downloads complete and index.html updated.');
}

run();
