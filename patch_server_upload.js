const fs = require('fs');

let code = fs.readFileSync('server.js', 'utf8');

// We need to inject the multer import and /api/ai/upload route
if (!code.includes("const multer = require('multer');")) {
  const uploadLogic = `
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const upload = multer({ dest: 'uploads/' });

app.post('/api/ai/upload', authRequired, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = require('fs').readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const data = await mammoth.extractRawText({ path: filePath });
      extractedText = data.value;
    } else if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'text/csv') {
      extractedText = require('fs').readFileSync(filePath, 'utf8');
    } else if (mimeType.startsWith('image/')) {
      const b64 = require('fs').readFileSync(filePath).toString('base64');
      extractedText = \`[IMAGE_DATA:\${mimeType}:\${b64}]\`;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up
    require('fs').unlinkSync(filePath);

    res.json({ text: extractedText });
  } catch (err) {
    console.error('File extraction error:', err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// ── Main Chat Endpoint — Auto Fallback Chain ──`;

  code = code.replace('// ── Main Chat Endpoint — Auto Fallback Chain ──', uploadLogic);
  fs.writeFileSync('server.js', code);
  console.log('Upload endpoint added to server.js');
} else {
  console.log('Upload endpoint already exists');
}
