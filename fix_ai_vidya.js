const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'public', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

// Fix 1: Make getApiBaseUrl() return "" when running on localhost (Electron desktop app)
// This prevents a stale remote Render URL in localStorage from breaking local API calls.
const oldGetApi = `function getApiBaseUrl() {
  const qs = new URLSearchParams(window.location.search || "");
  const fromQuery = normalizeApiBaseUrl(qs.get("api"));
  if (fromQuery) localStorage.setItem("API_BASE_URL", fromQuery);
  const fromStorage = normalizeApiBaseUrl(localStorage.getItem("API_BASE_URL"));
  const fromWindow = normalizeApiBaseUrl(window.API_BASE_URL);
  return fromQuery || fromStorage || fromWindow || "";
}`;

const newGetApi = `function getApiBaseUrl() {
  // When running locally in Electron (localhost), always use relative URLs
  const host = (window.location.hostname || "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return "";
  
  const qs = new URLSearchParams(window.location.search || "");
  const fromQuery = normalizeApiBaseUrl(qs.get("api"));
  if (fromQuery) localStorage.setItem("API_BASE_URL", fromQuery);
  const fromStorage = normalizeApiBaseUrl(localStorage.getItem("API_BASE_URL"));
  const fromWindow = normalizeApiBaseUrl(window.API_BASE_URL);
  return fromQuery || fromStorage || fromWindow || "";
}`;

if (code.includes(oldGetApi)) {
  code = code.replace(oldGetApi, newGetApi);
  console.log("[FIX 1] getApiBaseUrl() patched to force relative URLs on localhost");
} else {
  console.log("[FIX 1] WARN: Could not find exact getApiBaseUrl() - attempting regex patch");
  // Regex fallback
  code = code.replace(
    /function getApiBaseUrl\(\)\s*\{[^}]*return fromQuery \|\| fromStorage \|\| fromWindow \|\| "";\s*\}/s,
    newGetApi
  );
  console.log("[FIX 1] Applied regex patch for getApiBaseUrl()");
}

fs.writeFileSync(appPath, code);
console.log("\nAll fixes applied to app.js!");
console.log("Root cause: localStorage had a cached remote API URL from a previous Render deployment.");
console.log("Fix: When on localhost (Electron), always use relative URLs (empty API_BASE_URL).");
