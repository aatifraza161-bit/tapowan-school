const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Add isBackup constant in renderAll
code = code.replace(
  'const isExams = currentModule === "exams";',
  'const isExams = currentModule === "exams";\r\n  const isBackup = currentModule === "backup";'
);

// 2. Update panel hiding to include isBackup
code = code.replace(
  'p.style.display = (isBD || isWA || isAI || isExams || isDashboard) ? "none" : "";',
  'p.style.display = (isBD || isWA || isAI || isExams || isDashboard || isBackup) ? "none" : "";'
);

// 3. Add backup routing after AI assistant routing
code = code.replace(
  `if (isAI) {\r\n    renderAiAssistant();\r\n    return;\r\n  }`,
  `if (isAI) {\r\n    renderAiAssistant();\r\n    return;\r\n  }\r\n\r\n  if (isBackup) {\r\n    renderNav();\r\n    renderHeader();\r\n    renderBackupModule();\r\n    return;\r\n  }`
);

// 4. Add backup icon to MODULE_ICONS
code = code.replace(
  "dueManagement: 'receipt_long', holidays: 'event'",
  "dueManagement: 'receipt_long', holidays: 'event', backup: 'cloud_download'"
);

// 5. Add the full renderBackupModule function before the toCsv function
const backupFunction = `
// ═══════════════════════════════════════════════════════════════════════
// BACKUP & RESTORE MODULE
// ═══════════════════════════════════════════════════════════════════════

function renderBackupModule() {
  // Remove any existing backup panel
  let panel = document.getElementById("backupPanel");
  if (panel) panel.remove();

  panel = document.createElement("section");
  panel.id = "backupPanel";
  panel.className = "panel";
  panel.style.cssText = "display:block; margin-top:0;";

  const store = getStore();
  const moduleNames = Object.keys(moduleConfig).filter(m => m !== "dashboard" && m !== "myProfile" && m !== "aiAssistant" && m !== "backup" && store[m]);
  const totalRecords = moduleNames.reduce((sum, m) => sum + (store[m] || []).length, 0);
  const today = new Date().toISOString().slice(0, 10);

  panel.innerHTML = \`
    <div style="margin-bottom:32px;">
      <h2 style="margin:0 0 8px 0; font-size:1.6rem; font-weight:900; color:#0f172a;">Backup & Restore Center</h2>
      <p style="margin:0; color:#64748b; font-size:0.95rem;">Manage your school data — export full backups, restore from files, or bulk CSV operations.</p>
    </div>

    <!-- Stats Row -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:32px;">
      <div style="background:linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius:16px; padding:20px; color:#fff; position:relative; overflow:hidden; box-shadow:0 8px 24px rgba(59,130,246,0.25);">
        <div style="position:absolute; right:-15px; bottom:-15px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.1);"></div>
        <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; margin-bottom:6px;">Total Modules</div>
        <div style="font-size:2rem; font-weight:900;">\${moduleNames.length}</div>
      </div>
      <div style="background:linear-gradient(135deg, #8b5cf6, #6d28d9); border-radius:16px; padding:20px; color:#fff; position:relative; overflow:hidden; box-shadow:0 8px 24px rgba(139,92,246,0.25);">
        <div style="position:absolute; right:-15px; bottom:-15px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.1);"></div>
        <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; margin-bottom:6px;">Total Records</div>
        <div style="font-size:2rem; font-weight:900;">\${totalRecords.toLocaleString('en-IN')}</div>
      </div>
      <div style="background:linear-gradient(135deg, #0d9488, #0f766e); border-radius:16px; padding:20px; color:#fff; position:relative; overflow:hidden; box-shadow:0 8px 24px rgba(13,148,136,0.25);">
        <div style="position:absolute; right:-15px; bottom:-15px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.1);"></div>
        <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; margin-bottom:6px;">Today's Date</div>
        <div style="font-size:1.6rem; font-weight:900;">\${today}</div>
      </div>
    </div>

    <!-- Main Grid: 2 columns -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(380px, 1fr)); gap:24px;">
      <!-- Card 1: Full JSON Backup -->
      <div style="background:linear-gradient(145deg, #eff6ff, #dbeafe); border:1px solid #bfdbfe; border-radius:20px; padding:28px; position:relative; overflow:hidden; box-shadow:0 4px 16px rgba(59,130,246,0.08);">
        <div style="position:absolute; right:-30px; top:-30px; width:120px; height:120px; border-radius:50%; background:#bfdbfe; opacity:0.4;"></div>
        <div style="position:relative; z-index:2;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, #3b82f6, #1d4ed8); display:grid; place-items:center; color:#fff; font-size:1.5rem; box-shadow:0 4px 12px rgba(59,130,246,0.3);">
              <span class="material-symbols-outlined" style="font-size:24px;">cloud_download</span>
            </div>
            <div>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#1e40af;">Full Database Backup</h3>
              <p style="margin:2px 0 0; font-size:0.8rem; color:#3b82f6;">Export entire database as JSON</p>
            </div>
          </div>
          <p style="font-size:0.88rem; color:#475569; line-height:1.6; margin-bottom:20px;">Downloads a single <strong>.json</strong> file containing ALL module data. This is a complete snapshot of your entire school database.</p>
          <button id="backupFullJsonBtn" class="dark" style="width:100%; padding:12px; border-radius:12px; font-weight:700; font-size:0.95rem; background:linear-gradient(135deg, #3b82f6, #1d4ed8); border:none; color:#fff; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 4px 12px rgba(59,130,246,0.3);">
            <span class="material-symbols-outlined" style="font-size:18px; vertical-align:middle; margin-right:6px;">download</span>
            Backup Full Database (JSON)
          </button>
        </div>
      </div>

      <!-- Card 2: Full JSON Restore -->
      <div style="background:linear-gradient(145deg, #fef2f2, #fecaca); border:1px solid #fca5a5; border-radius:20px; padding:28px; position:relative; overflow:hidden; box-shadow:0 4px 16px rgba(239,68,68,0.08);">
        <div style="position:absolute; right:-30px; top:-30px; width:120px; height:120px; border-radius:50%; background:#fca5a5; opacity:0.4;"></div>
        <div style="position:relative; z-index:2;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, #ef4444, #b91c1c); display:grid; place-items:center; color:#fff; font-size:1.5rem; box-shadow:0 4px 12px rgba(239,68,68,0.3);">
              <span class="material-symbols-outlined" style="font-size:24px;">cloud_upload</span>
            </div>
            <div>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#991b1b;">Restore from Backup</h3>
              <p style="margin:2px 0 0; font-size:0.8rem; color:#ef4444;">Import JSON backup file</p>
            </div>
          </div>
          <p style="font-size:0.88rem; color:#475569; line-height:1.6; margin-bottom:20px;">Upload a previously exported <strong>.json</strong> backup file to restore your entire database. <strong style="color:#dc2626;">Warning: This will overwrite ALL current data!</strong></p>
          <input type="file" id="restoreJsonInput" accept=".json" style="display:none;" />
          <button id="restoreFullJsonBtn" class="dark" style="width:100%; padding:12px; border-radius:12px; font-weight:700; font-size:0.95rem; background:linear-gradient(135deg, #ef4444, #b91c1c); border:none; color:#fff; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 4px 12px rgba(239,68,68,0.3);">
            <span class="material-symbols-outlined" style="font-size:18px; vertical-align:middle; margin-right:6px;">upload</span>
            Restore Full Database (JSON)
          </button>
        </div>
      </div>

      <!-- Card 3: Export ALL CSVs -->
      <div style="background:linear-gradient(145deg, #f0fdf4, #bbf7d0); border:1px solid #86efac; border-radius:20px; padding:28px; position:relative; overflow:hidden; box-shadow:0 4px 16px rgba(34,197,94,0.08);">
        <div style="position:absolute; right:-30px; top:-30px; width:120px; height:120px; border-radius:50%; background:#86efac; opacity:0.4;"></div>
        <div style="position:relative; z-index:2;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, #22c55e, #15803d); display:grid; place-items:center; color:#fff; font-size:1.5rem; box-shadow:0 4px 12px rgba(34,197,94,0.3);">
              <span class="material-symbols-outlined" style="font-size:24px;">folder_zip</span>
            </div>
            <div>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#166534;">Export All CSVs</h3>
              <p style="margin:2px 0 0; font-size:0.8rem; color:#22c55e;">Download all modules as CSV in ZIP</p>
            </div>
          </div>
          <p style="font-size:0.88rem; color:#475569; line-height:1.6; margin-bottom:20px;">Downloads a <strong>.zip</strong> file containing one CSV per module (Students.csv, Fees.csv, etc.). Great for spreadsheet analysis or migration.</p>
          <button id="exportAllCsvBtn" class="dark" style="width:100%; padding:12px; border-radius:12px; font-weight:700; font-size:0.95rem; background:linear-gradient(135deg, #22c55e, #15803d); border:none; color:#fff; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 4px 12px rgba(34,197,94,0.3);">
            <span class="material-symbols-outlined" style="font-size:18px; vertical-align:middle; margin-right:6px;">folder_zip</span>
            Export All Modules (CSV ZIP)
          </button>
        </div>
      </div>

      <!-- Card 4: Import ALL CSVs -->
      <div style="background:linear-gradient(145deg, #faf5ff, #e9d5ff); border:1px solid #d8b4fe; border-radius:20px; padding:28px; position:relative; overflow:hidden; box-shadow:0 4px 16px rgba(168,85,247,0.08);">
        <div style="position:absolute; right:-30px; top:-30px; width:120px; height:120px; border-radius:50%; background:#d8b4fe; opacity:0.4;"></div>
        <div style="position:relative; z-index:2;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, #a855f7, #7e22ce); display:grid; place-items:center; color:#fff; font-size:1.5rem; box-shadow:0 4px 12px rgba(168,85,247,0.3);">
              <span class="material-symbols-outlined" style="font-size:24px;">upload_file</span>
            </div>
            <div>
              <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#6b21a8;">Import All CSVs</h3>
              <p style="margin:2px 0 0; font-size:0.8rem; color:#a855f7;">Upload multiple CSV files at once</p>
            </div>
          </div>
          <p style="font-size:0.88rem; color:#475569; line-height:1.6; margin-bottom:20px;">Select multiple CSV files — each file name should match a module (e.g. <strong>students.csv</strong>, <strong>fees.csv</strong>). Records will be <strong>added</strong> to existing data.</p>
          <input type="file" id="importAllCsvInput" accept=".csv,.xls,.xlsx" multiple style="display:none;" />
          <button id="importAllCsvBtn" class="dark" style="width:100%; padding:12px; border-radius:12px; font-weight:700; font-size:0.95rem; background:linear-gradient(135deg, #a855f7, #7e22ce); border:none; color:#fff; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 4px 12px rgba(168,85,247,0.3);">
            <span class="material-symbols-outlined" style="font-size:18px; vertical-align:middle; margin-right:6px;">upload_file</span>
            Import All Modules (CSV Files)
          </button>
        </div>
      </div>
    </div>

    <!-- Module Breakdown Table -->
    <div style="margin-top:32px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
      <div style="padding:20px 24px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#0f172a;">Module Data Summary</h3>
        <span style="font-size:0.85rem; color:#64748b;">\${moduleNames.length} modules &bull; \${totalRecords.toLocaleString('en-IN')} total records</span>
      </div>
      <div style="max-height:400px; overflow-y:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9; position:sticky; top:0; z-index:2;">
              <th style="padding:12px 16px; text-align:left; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; font-weight:700;">Module</th>
              <th style="padding:12px 16px; text-align:center; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; font-weight:700;">Records</th>
              <th style="padding:12px 16px; text-align:center; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; font-weight:700;">Fields</th>
            </tr>
          </thead>
          <tbody>
            \${moduleNames.map(m => {
              const config = moduleConfig[m] || {};
              const count = (store[m] || []).length;
              const fields = (config.fields || []).length;
              return \\\`<tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s;">
                <td style="padding:12px 16px; font-weight:600; color:#1e293b;">\${config.title || m}</td>
                <td style="padding:12px 16px; text-align:center; font-weight:700; color:\${count > 0 ? '#0f172a' : '#94a3b8'};">\${count}</td>
                <td style="padding:12px 16px; text-align:center; color:#64748b;">\${fields}</td>
              </tr>\\\`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Status Log -->
    <div id="backupStatusLog" style="margin-top:24px; display:none;">
      <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:16px;">
        <p id="backupStatusText" style="margin:0; color:#166534; font-weight:600;"></p>
      </div>
    </div>
  \`;

  const contentArea = document.querySelector(".content-area");
  contentArea.appendChild(panel);

  // Wire up buttons
  document.getElementById("backupFullJsonBtn").addEventListener("click", backupFullJson);
  document.getElementById("restoreFullJsonBtn").addEventListener("click", () => document.getElementById("restoreJsonInput").click());
  document.getElementById("restoreJsonInput").addEventListener("change", restoreFullJson);
  document.getElementById("exportAllCsvBtn").addEventListener("click", exportAllCsvZip);
  document.getElementById("importAllCsvBtn").addEventListener("click", () => document.getElementById("importAllCsvInput").click());
  document.getElementById("importAllCsvInput").addEventListener("change", importAllCsvFiles);

  // Hover effects on buttons
  panel.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("mouseenter", () => { btn.style.transform = "translateY(-2px)"; btn.style.boxShadow = btn.style.boxShadow.replace(/0\\.3\\)/, "0.5)"); });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

function showBackupStatus(msg, isError) {
  const log = document.getElementById("backupStatusLog");
  const txt = document.getElementById("backupStatusText");
  if (!log || !txt) return;
  log.style.display = "block";
  log.firstElementChild.style.background = isError ? "#fef2f2" : "#f0fdf4";
  log.firstElementChild.style.borderColor = isError ? "#fca5a5" : "#86efac";
  txt.style.color = isError ? "#991b1b" : "#166534";
  txt.textContent = msg;
}

// --- Full JSON Backup ---
async function backupFullJson() {
  const btn = document.getElementById("backupFullJsonBtn");
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;margin-right:6px;animation:spin 1s linear infinite;">progress_activity</span> Preparing backup...';
  try {
    const store = await api("/api/store");
    const json = JSON.stringify(store, null, 2);
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob("TPS_Backup_" + today + ".json", json, "application/json");
    showBackupStatus("✅ Full database backup downloaded successfully! (" + today + ".json)");
  } catch (err) {
    showBackupStatus("❌ Backup failed: " + err.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

// --- Full JSON Restore ---
async function restoreFullJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const confirmed = window.confirm(
    "⚠️ CRITICAL WARNING!\\n\\n" +
    "You are about to OVERWRITE your ENTIRE database with this backup file.\\n\\n" +
    "File: " + file.name + "\\n" +
    "Size: " + (file.size / 1024).toFixed(1) + " KB\\n\\n" +
    "ALL current data will be PERMANENTLY REPLACED.\\n\\n" +
    "Are you absolutely sure you want to proceed?"
  );
  if (!confirmed) { e.target.value = ""; return; }

  const doubleCheck = window.confirm("🔴 FINAL CONFIRMATION\\n\\nThis action CANNOT be undone. Proceed with restore?");
  if (!doubleCheck) { e.target.value = ""; return; }

  try {
    showBackupStatus("⏳ Reading backup file...");
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || typeof data !== "object") throw new Error("Invalid backup file format");

    const moduleCount = Object.keys(data).filter(k => Array.isArray(data[k])).length;
    if (moduleCount === 0) throw new Error("No module data found in the backup file");

    showBackupStatus("⏳ Restoring " + moduleCount + " modules to database...");

    const res = await api("/api/store/import", {
      method: "POST",
      body: JSON.stringify(data)
    });

    showBackupStatus("✅ Database restored successfully! " + res.modulesImported + " modules imported. Refreshing data...");

    // Reload store
    await loadStore();
    setTimeout(() => renderAll(), 500);
  } catch (err) {
    showBackupStatus("❌ Restore failed: " + err.message, true);
  } finally {
    e.target.value = "";
  }
}

// --- Export ALL Modules as CSV ZIP ---
async function exportAllCsvZip() {
  const btn = document.getElementById("exportAllCsvBtn");
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;margin-right:6px;animation:spin 1s linear infinite;">progress_activity</span> Generating ZIP...';

  try {
    const store = getStore();
    const zip = new JSZip();
    const skipFiles = ["photo", "aadhar", "tc", "reportCard", "fatherAadhar", "motherAadhar", "facePhoto", "descriptorJson"];
    let fileCount = 0;

    const moduleNames = Object.keys(moduleConfig).filter(m =>
      m !== "dashboard" && m !== "myProfile" && m !== "aiAssistant" && m !== "backup" && store[m] && store[m].length > 0
    );

    for (const m of moduleNames) {
      const config = moduleConfig[m] || {};
      const rows = store[m];
      const allKeys = config.fields && config.fields.length > 0
        ? config.fields.filter(f => !skipFiles.includes(f))
        : Object.keys(rows[0] || {}).filter(f => f !== "id" && !skipFiles.includes(f));

      if (allKeys.length === 0) continue;

      const csvContent = toCsv(rows, allKeys);
      const fileName = (config.title || m).replace(/[^a-zA-Z0-9_\\- ]/g, '') + ".csv";
      zip.file(fileName, csvContent);
      fileCount++;
    }

    if (fileCount === 0) {
      showBackupStatus("⚠️ No data to export. All modules are empty.", true);
      return;
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const today = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TPS_AllModules_" + today + ".zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showBackupStatus("✅ ZIP downloaded with " + fileCount + " CSV files! (TPS_AllModules_" + today + ".zip)");
  } catch (err) {
    showBackupStatus("❌ CSV export failed: " + err.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

// --- Import ALL CSVs ---
async function importAllCsvFiles(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const confirmed = window.confirm(
    "📂 Import " + files.length + " CSV file(s)?\\n\\n" +
    files.map(f => "• " + f.name).join("\\n") +
    "\\n\\nEach file name should match a module name (e.g. Students.csv, Fees.csv).\\n" +
    "Existing data in those modules will be REPLACED with the CSV data."
  );
  if (!confirmed) { e.target.value = ""; return; }

  let imported = 0;
  let errors = [];

  const validModules = Object.keys(moduleConfig).filter(m => m !== "dashboard" && m !== "myProfile" && m !== "aiAssistant" && m !== "backup");
  const moduleNameMap = {};
  validModules.forEach(m => {
    const config = moduleConfig[m] || {};
    moduleNameMap[m.toLowerCase()] = m;
    moduleNameMap[(config.title || "").toLowerCase().replace(/[^a-z0-9]/g, '')] = m;
    moduleNameMap[(config.title || "").toLowerCase()] = m;
  });

  showBackupStatus("⏳ Importing " + files.length + " file(s)...");

  for (const file of files) {
    try {
      const baseName = file.name.replace(/\\.(csv|xlsx|xls)$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchedModule = moduleNameMap[baseName];

      if (!matchedModule) {
        errors.push(file.name + ": No matching module found");
        continue;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });

      if (!json.length) {
        errors.push(file.name + ": Empty file");
        continue;
      }

      // Map headers to module fields
      const config = moduleConfig[matchedModule] || {};
      const fields = config.fields || [];
      const headerMap = {};
      const csvHeaders = Object.keys(json[0]);
      csvHeaders.forEach(h => {
        const normalized = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = fields.find(f => f.toLowerCase() === normalized || f.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
        if (match) headerMap[h] = match;
        else if (fields.includes(h)) headerMap[h] = h;
      });

      const records = json.map(row => {
        const record = {};
        Object.entries(headerMap).forEach(([csvH, dbField]) => {
          record[dbField] = row[csvH] || "";
        });
        return record;
      });

      // Send each record to the backend
      for (const record of records) {
        await api("/api/modules/" + matchedModule, { method: "POST", body: JSON.stringify(record) });
      }

      imported++;
      showBackupStatus("⏳ Imported " + file.name + " (" + records.length + " records into " + (config.title || matchedModule) + ")...");
    } catch (err) {
      errors.push(file.name + ": " + err.message);
    }
  }

  // Reload
  await loadStore();
  setTimeout(() => renderBackupModule(), 300);

  let msg = "✅ Import complete! " + imported + " of " + files.length + " file(s) imported successfully.";
  if (errors.length) msg += "\\n\\n⚠️ Errors:\\n" + errors.join("\\n");

  showBackupStatus(msg, errors.length > 0);
  e.target.value = "";
}

`;

const insertBefore = 'function toCsv(rows, columns)';
const idx = code.indexOf(insertBefore);
if (idx === -1) {
  console.error('Could not find toCsv function!');
  process.exit(1);
}
code = code.substring(0, idx) + backupFunction + code.substring(idx);

fs.writeFileSync('public/app.js', code, 'utf8');
console.log('✅ Backup module added successfully!');
