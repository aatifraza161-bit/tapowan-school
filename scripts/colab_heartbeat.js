const fetch = globalThis.fetch || require('node-fetch');

// Target Colab Cloudflare URL
const COLAB_URL = process.argv[2] || 'https://wav-anderson-nikon-locks.trycloudflare.com';
const INTERVAL_MINUTES = 25; // Ping every 25 minutes to stay well within Colab's 90-min limit

console.log("🚀 Starting TPS Colab GPU Keep-Alive Heartbeat for: " + COLAB_URL);
console.log("⏱️ Interval: Every " + INTERVAL_MINUTES + " minutes\n");

async function sendHeartbeat() {
  const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  try {
    const res = await fetch(COLAB_URL + '/status', { timeout: 10000 });
    if (res.ok) {
      const data = await res.json();
      console.log("[" + timestamp + "] 💚 Heartbeat SUCCESS -> Colab GPU Online:", data);
    } else {
      console.warn("[" + timestamp + "] ⚠️ Heartbeat WARN -> Status code: " + res.status);
    }
  } catch (err) {
    console.error("[" + timestamp + "] ❌ Heartbeat FAILED -> " + err.message);
  }
}

// Initial ping
sendHeartbeat();

// Recurring interval
setInterval(sendHeartbeat, INTERVAL_MINUTES * 60 * 1000);
