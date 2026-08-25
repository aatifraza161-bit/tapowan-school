const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Fix the UI. Let's find exactly the block.
// The block ends with id="vidyaSendBtn">➤</button>\n    </div>`;
let inputAreaStart = code.lastIndexOf('<div class="vidya-input-area">', code.indexOf('id="vidyaSendBtn"'));
let inputAreaEnd = code.indexOf('</div>`;', inputAreaStart) + 8;

if (inputAreaStart !== -1 && inputAreaEnd !== -1) {
    let before = code.substring(0, inputAreaStart);
    let after = code.substring(inputAreaEnd);
    let replacement = `    <div class="vidya-file-preview" id="vidyaFilePreview" style="display:none; padding:4px 8px; font-size:0.8rem; background:rgba(0,0,0,0.1); border-radius:4px; margin-bottom:4px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
    <div class="vidya-input-area" style="position: relative;">
      <button class="vidya-attach-btn" id="vidyaAttachBtn" title="Attach File" style="background:none;border:none;cursor:pointer;font-size:1.4rem;padding:0 8px;color:#6b7280;transition:transform 0.2s;">📎</button>
      <input type="file" id="vidyaFileInput" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*" />
      <button class="vidya-mic-btn" id="vidyaMicBtn" title="Speak / बोलें">🎤</button>
      <textarea class="vidya-input" id="vidyaInput" rows="1" placeholder="Hindi या English में पूछें..."></textarea>
      <button class="vidya-send-btn" id="vidyaSendBtn">➤</button>
    </div>\`;`;
    code = before + replacement + after;
    console.log("UI replaced successfully.");
} else {
    console.log("Could not find UI block.");
}

// 2. Insert Logic safely right after document.getElementById("vidyaSendBtn").addEventListener...
let sendBtnLogic = 'document.getElementById("vidyaSendBtn").addEventListener("click", () => sendMessage(inputEl.value));';
let sendBtnIdx = code.indexOf(sendBtnLogic);

if (sendBtnIdx !== -1) {
    let before = code.substring(0, sendBtnIdx);
    let after = code.substring(sendBtnIdx + sendBtnLogic.length);
    
    let injectedLogic = sendBtnLogic + `

  // ── File Attachment & Generation Logic ──
  window.uploadedFileContext = "";
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
          body: formData
        });
        const data = await res.json();
        if (data.text) {
          window.uploadedFileContext = data.text;
          filePreview.textContent = "📎 " + file.name + " (Ready)";
          filePreview.style.background = "rgba(0, 255, 0, 0.1)";
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (err) {
        filePreview.textContent = "❌ " + file.name + " (Failed)";
        filePreview.style.background = "rgba(255, 0, 0, 0.1)";
        window.uploadedFileContext = "";
      }
    });
  }

  // ── File Generation Download logic ──
  window.downloadGeneratedFile = function(type, contentB64, filename) {
    const content = decodeURIComponent(escape(atob(contentB64)));
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
`;
    code = before + injectedLogic + after;
    console.log("Logic injected successfully.");
} else {
    console.log("Could not find sendBtnLogic.");
}

// 3. Update sendMessage payload
let payloadStr = 'body: JSON.stringify({ \n          prompt: fullPrompt, \n          studentContext: studentCtx,\n          preferredProvider: vidyaPreferredProvider \n        })';
let payloadReplacement = 'body: JSON.stringify({ \n          prompt: fullPrompt, \n          studentContext: studentCtx,\n          preferredProvider: vidyaPreferredProvider,\n          contextFiles: window.uploadedFileContext \n        })';
if(code.includes(payloadStr)) {
    code = code.replace(payloadStr, payloadReplacement);
} else {
   payloadStr = 'body: JSON.stringify({ \r\n          prompt: fullPrompt, \r\n          studentContext: studentCtx,\r\n          preferredProvider: vidyaPreferredProvider \r\n        })';
   payloadReplacement = 'body: JSON.stringify({ \r\n          prompt: fullPrompt, \r\n          studentContext: studentCtx,\r\n          preferredProvider: vidyaPreferredProvider,\r\n          contextFiles: window.uploadedFileContext \r\n        })';
   code = code.replace(payloadStr, payloadReplacement);
}

// 4. Clear file attachment on send
let sendStartStr = 'inputEl.value = "";\n    showTyping();';
let sendStartReplacement = 'inputEl.value = "";\n    showTyping();\n    let filePreviewObj = document.getElementById("vidyaFilePreview"); if(filePreviewObj) { filePreviewObj.style.display="none"; filePreviewObj.textContent=""; }\n    window.uploadedFileContext=""; let fileInputObj = document.getElementById("vidyaFileInput"); if(fileInputObj) fileInputObj.value="";';
if(code.includes(sendStartStr)) {
    code = code.replace(sendStartStr, sendStartReplacement);
} else {
    sendStartStr = 'inputEl.value = "";\r\n    showTyping();';
    sendStartReplacement = 'inputEl.value = "";\r\n    showTyping();\r\n    let filePreviewObj = document.getElementById("vidyaFilePreview"); if(filePreviewObj) { filePreviewObj.style.display="none"; filePreviewObj.textContent=""; }\r\n    window.uploadedFileContext=""; let fileInputObj = document.getElementById("vidyaFileInput"); if(fileInputObj) fileInputObj.value="";';
    code = code.replace(sendStartStr, sendStartReplacement);
}

fs.writeFileSync('public/app.js', code);
console.log('App patched completely and safely.');
