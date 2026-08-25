const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const targetStr = `    <div class="vidya-input-area">
      <button class="vidya-mic-btn" id="vidyaMicBtn" title="Speak / बोलें">🎤</button>
      <textarea class="vidya-input" id="vidyaInput" rows="1" placeholder="Hindi या English में पूछें..."></textarea>
      <button class="vidya-send-btn" id="vidyaSendBtn">➤</button>
    </div>\`;`;

const replacementStr = `    <div class="vidya-file-preview" id="vidyaFilePreview" style="display:none; padding:4px 8px; font-size:0.8rem; background:rgba(0,0,0,0.1); border-radius:4px; margin-bottom:4px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
    <div class="vidya-input-area">
      <button class="vidya-attach-btn" id="vidyaAttachBtn" title="Attach File" style="background:none;border:none;cursor:pointer;font-size:1.2rem;padding-right:4px;">📎</button>
      <input type="file" id="vidyaFileInput" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*" />
      <button class="vidya-mic-btn" id="vidyaMicBtn" title="Speak / बोलें">🎤</button>
      <textarea class="vidya-input" id="vidyaInput" rows="1" placeholder="Hindi या English में पूछें..."></textarea>
      <button class="vidya-send-btn" id="vidyaSendBtn">➤</button>
    </div>\`;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('public/app.js', code);
  console.log('UI patch successful');
} else {
  console.log('Failed to find UI target in app.js');
}
