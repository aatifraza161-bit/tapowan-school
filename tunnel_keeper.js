const { spawn, exec } = require("child_process");

const SUBDOMAIN = "tapowan-school-2026-v3"; // Primary subdomain
const FALLBACK_PREFIX = "tapowan-online-v3-";

let currentSubdomain = SUBDOMAIN;
let retryCount = 0;

function startTunnel() {
  console.log(`\n[${new Date().toLocaleTimeString()}] Attempting to start tunnel on port 3000...`);
  console.log(`Subdomain: ${currentSubdomain}`);
  
  // Start localtunnel using npx
  const lt = spawn("npx", ["--yes", "localtunnel", "--port", "3000", "--subdomain", currentSubdomain, "--local-host", "127.0.0.1"], {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let urlFound = false;

  lt.stdout.on("data", (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    if (output.includes("your url is:")) {
      urlFound = true;
      if (!output.includes(currentSubdomain + ".loca.lt")) {
        console.error(`\n[ERROR] Got the WRONG URL! Subdomain '${currentSubdomain}' might be busy.`);
        console.error("Trying a different subdomain in 5 seconds...\n");
        retryCount++;
        currentSubdomain = FALLBACK_PREFIX + Math.floor(Math.random() * 10000);
        lt.kill();
      } else {
        console.log("\n[SUCCESS] Connected to permanent URL!\n");
        retryCount = 0;
      }
    }
  });

  lt.stderr.on("data", (data) => {
    const errorMsg = data.toString();
    process.stderr.write(errorMsg);
    
    if (errorMsg.includes("connection refused") || errorMsg.includes("ECONNREFUSED")) {
      console.error("\n[CRITICAL] Connection refused by localtunnel server.");
      console.error("The relay server is busy or blocking the subdomain.");
      console.error("Swapping subdomain and retrying...\n");
      currentSubdomain = FALLBACK_PREFIX + Math.floor(Math.random() * 10000);
      lt.kill();
    }
  });

  lt.on("close", (code) => {
    console.log(`Tunnel closed (code ${code}). Restarting in 8 seconds...`);
    setTimeout(startTunnel, 8000);
  });
}

// Kill any existing ghost localtunnel processes first
console.log("Cleaning up old tunnel processes...");
exec("taskkill /f /im node.exe /fi \"windowtitle eq npx\"", () => {
  const cleanup = spawn("wmic", ["process", "where", "name='node.exe' and commandline like '%localtunnel%'", "call", "terminate"], { shell: true });
  cleanup.on("close", () => {
    startTunnel();
  });
});
