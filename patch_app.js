const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Patch UI
const uiAnchor = 'id="vidyaSendBtn">➤</button>';
const idx = code.indexOf(uiAnchor);
if (idx !== -1) {
  const closingIdx = code.indexOf('</div>`;', idx);
  if (closingIdx !== -1) {
    const startOfDiv = code.lastIndexOf('<div class="vidya-input-area">', idx);
    if (startOfDiv !== -1) {
      const before = code.substring(0, startOfDiv);
      const after = code.substring(closingIdx + 8);
      
      const replacement = `    <div class="vidya-file-preview" id="vidyaFilePreview" style="display:none; padding:4px 8px; font-size:0.8rem; background:rgba(0,0,0,0.1); border-radius:4px; margin-bottom:4px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
    <div class="vidya-input-area">
      <button class="vidya-attach-btn" id="vidyaAttachBtn" title="Attach File" style="background:none;border:none;cursor:pointer;font-size:1.2rem;padding-right:4px;">📎</button>
      <input type="file" id="vidyaFileInput" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*" />
      <button class="vidya-mic-btn" id="vidyaMicBtn" title="Speak / बोलें">🎤</button>
      <textarea class="vidya-input" id="vidyaInput" rows="1" placeholder="Hindi या English में पूछें..."></textarea>
      <button class="vidya-send-btn" id="vidyaSendBtn">➤</button>
    </div>\`;`;
      code = before + replacement + after;
    }
  }
}

// 2. Patch Logic for upload and file generation
const logicStr = `
  // ── Send button ──
  document.getElementById("vidyaSendBtn").addEventListener("click", () => sendMessage(inputEl.value));
`;

const logicReplacement = `
  let uploadedFileContext = "";
  let uploadedFileName = "";
  const fileInput = document.getElementById("vidyaFileInput");
  const attachBtn = document.getElementById("vidyaAttachBtn");
  const filePreview = document.getElementById("vidyaFilePreview");

  if(attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      uploadedFileName = file.name;
      filePreview.style.display = "block";
      filePreview.textContent = "Uploading " + file.name + "...";

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/ai/upload", {
          method: "POST",
          headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
          body: formData
        });
        const data = await res.json();
        if (data.text) {
          uploadedFileContext = data.text;
          filePreview.textContent = "📎 " + file.name + " (Ready)";
          filePreview.style.background = "rgba(0, 255, 0, 0.1)";
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (err) {
        filePreview.textContent = "❌ " + file.name + " (Failed)";
        filePreview.style.background = "rgba(255, 0, 0, 0.1)";
        uploadedFileContext = "";
      }
    });
  }

  // ── File Generation Download logic ──
  window.downloadGeneratedFile = function(type, contentB64, filename) {
    const content = atob(contentB64);
    if (type === 'pdf') {
      const opt = {
        margin: 10,
        filename: filename + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      if(window.html2pdf) {
        window.html2pdf().set(opt).from(content).save();
      } else {
        alert("PDF generator not loaded.");
      }
    } else if (type === 'excel') {
       if(window.XLSX) {
         const el = document.createElement("div");
         el.innerHTML = content;
         const tbl = el.querySelector("table") || el;
         const wb = window.XLSX.utils.table_to_book(tbl, {sheet:"Sheet1"});
         window.XLSX.writeFile(wb, filename + ".xlsx");
       } else {
         alert("Excel generator not loaded.");
       }
    } else if (type === 'word') {
       const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
       const footer = "</body></html>";
       const sourceHTML = header + content + footer;
       const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
       const fileDownload = document.createElement("a");
       document.body.appendChild(fileDownload);
       fileDownload.href = source;
       fileDownload.download = filename + '.doc';
       fileDownload.click();
       document.body.removeChild(fileDownload);
    } else if (type === 'html') {
       const blob = new Blob([content], { type: "text/html" });
       const link = document.createElement("a");
       link.href = URL.createObjectURL(blob);
       link.download = filename + ".html";
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    }
  };

  // Override addMsg to detect tables/html for file generation
  const origAddMsg = addMsg;
  addMsg = function(msg, sender, providerBadge) {
    if (sender === "bot" && (msg.includes("<table") || msg.includes("<table>") || msg.includes("<ul>") || msg.includes("<h1>"))) {
        const b64 = btoa(unescape(encodeURIComponent(msg)));
        const btns = \`
          <div style="margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;">
            <button onclick="downloadGeneratedFile('pdf', '\${b64}', 'Generated_Report')" style="font-size:0.7rem; padding:3px 6px; background:#ef4444; color:white; border:none; border-radius:3px; cursor:pointer;">PDF</button>
            <button onclick="downloadGeneratedFile('excel', '\${b64}', 'Generated_Report')" style="font-size:0.7rem; padding:3px 6px; background:#10b981; color:white; border:none; border-radius:3px; cursor:pointer;">Excel</button>
            <button onclick="downloadGeneratedFile('word', '\${b64}', 'Generated_Report')" style="font-size:0.7rem; padding:3px 6px; background:#3b82f6; color:white; border:none; border-radius:3px; cursor:pointer;">Word</button>
            <button onclick="downloadGeneratedFile('html', '\${b64}', 'Generated_Report')" style="font-size:0.7rem; padding:3px 6px; background:#6b7280; color:white; border:none; border-radius:3px; cursor:pointer;">HTML</button>
          </div>
        \`;
        origAddMsg(msg + btns, sender, providerBadge);
    } else {
        origAddMsg(msg, sender, providerBadge);
    }
  };

  // ── Send button ──
  document.getElementById("vidyaSendBtn").addEventListener("click", () => sendMessage(inputEl.value));
`;

if (code.includes('document.getElementById("vidyaSendBtn").addEventListener("click", () => sendMessage(inputEl.value));')) {
  code = code.replace(
    '  // ── Send button ──\n  document.getElementById("vidyaSendBtn").addEventListener("click", () => sendMessage(inputEl.value));', 
    logicReplacement
  );
  
  // Update sendMessage payload
  const payloadStr = 'body: JSON.stringify({ \n          prompt: fullPrompt, \n          studentContext: studentCtx,\n          preferredProvider: vidyaPreferredProvider \n        })';
  const payloadReplacement = 'body: JSON.stringify({ \n          prompt: fullPrompt, \n          studentContext: studentCtx,\n          preferredProvider: vidyaPreferredProvider,\n          contextFiles: uploadedFileContext \n        })';
  code = code.replace(payloadStr, payloadReplacement);
  
  // Clear file attachment on send
  const sendStartStr = 'inputEl.value = "";\n    showTyping();';
  const sendStartReplacement = 'inputEl.value = "";\n    showTyping();\n    if(filePreview) { filePreview.style.display="none"; filePreview.textContent=""; }\n    const currentUploadedContext = uploadedFileContext; uploadedFileContext=""; if(fileInput) fileInput.value="";';
  code = code.replace(sendStartStr, sendStartReplacement);
  
  // also fix the body if it fails to find the exact match
  if(!code.includes('contextFiles: uploadedFileContext')) {
     code = code.replace(
       'body: JSON.stringify({ \r\n          prompt: fullPrompt, \r\n          studentContext: studentCtx,\r\n          preferredProvider: vidyaPreferredProvider \r\n        })',
       'body: JSON.stringify({ \r\n          prompt: fullPrompt, \r\n          studentContext: studentCtx,\r\n          preferredProvider: vidyaPreferredProvider,\r\n          contextFiles: currentUploadedContext \r\n        })'
     );
  }

  fs.writeFileSync('public/app.js', code);
  console.log('App patched successfully');
} else {
  console.log('Could not find send button listener');
}
