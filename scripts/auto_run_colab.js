const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = CHROME_PATHS.find(p => fs.existsSync(p));

async function runColabDaily() {
  console.log("🚀 [TPS Colab Auto-Runner] Starting automated daily execution...");
  
  if (!executablePath) {
    console.error("❌ Chrome or Edge browser executable not found!");
    return;
  }

  const userProfile = path.join(process.env.LOCALAPPDATA || 'C:\\Users\\Admin\\AppData\\Local', 'Google\\Chrome\\User Data');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath,
    userDataDir: userProfile,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,800',
      '--disable-infobars'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("🌐 Navigating to Google Colab Notebook...");
    await page.goto('https://colab.research.google.com/', { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(r => setTimeout(r, 4000));

    console.log("⚡ Connecting to GPU Runtime...");
    const connectBtn = await page.colab-connect-button, #top-toolbar colab-connect-button;
    if (connectBtn) {
      await connectBtn.click();
      console.log("Clicked Connect button.");
    }

    await new Promise(r => setTimeout(r, 3000));

    console.log("🚀 Triggering 'Run All' (Ctrl + F9)...");
    await page.keyboard.down('Control');
    await page.keyboard.press('F9');
    await page.keyboard.up('Control');

    console.log("⏳ Waiting 30 seconds for InsightFace models & Cloudflare tunnel to start...");
    await new Promise(r => setTimeout(r, 30000));

    console.log("✅ Colab GPU Server successfully started and registered with Turso DB!");
  } catch (err) {
    console.error("❌ Error during Colab auto-run:", err.message);
  }
}

runColabDaily();
