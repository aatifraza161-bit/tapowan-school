const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const cdnLinks = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
`;

if (!code.includes('html2pdf.bundle.min.js')) {
  code = code.replace('</head>', cdnLinks + '</head>');
  fs.writeFileSync('public/index.html', code);
  console.log('Added CDNs to index.html');
} else {
  console.log('CDNs already present in index.html');
}
