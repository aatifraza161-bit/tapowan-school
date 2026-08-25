const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const userTokens = new Map();

const jwtCrypto = require('crypto');
const JWT_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function signStatelessToken(user) {
  const tokenData = { ...user, exp: Date.now() + TOKEN_EXPIRY_MS };
  const payload = Buffer.from(JSON.stringify(tokenData)).toString('base64');
  const signature = jwtCrypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64');
  return payload + '.' + signature;
}

function verifyStatelessToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payload = parts[0];
    const signature = parts[1];
    const expectedSig = jwtCrypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64');
    // Timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature, 'base64');
    const expectedBuf = Buffer.from(expectedSig, 'base64');
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!jwtCrypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
    const parsed = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    // Check token expiry
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed;
  } catch (e) {}
  return null;
}

const cors = require("cors");
const os = require("os");
const http = require("http");
const compression = require("compression");
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenAI } = require('@google/genai');
const pino = require('pino');
const qrcode = require('qrcode');

let waSock = null;
let waStatus = "disconnected"; // "disconnected", "qr", "connected"
let waQr = "";

async function startBaileys() {
    if (process.env.IS_CLOUD) {
        console.log("WhatsApp bot is disabled in cloud mode. Running on local desktop.");
        return;
    }
    if (waStatus === "connected" || waStatus === "qr" || waStatus === "connecting") return;
    waStatus = "connecting";
    try {
        const authFolder = process.env.USER_DATA_PATH ? path.join(process.env.USER_DATA_PATH, 'baileys_auth_info') : path.join(__dirname, 'baileys_auth_info');
        const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = await import('@whiskeysockets/baileys');
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const { version } = await fetchLatestBaileysVersion();
        waSock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['Tapowan School Gateway', 'Chrome', '1.0.0']
        });

        waSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                waStatus = "qr";
                waQr = await qrcode.toDataURL(qr, { margin: 1, color: { dark: '#0f172a', light: '#ffffff' } });
            }
            if (connection === 'close') {
                waStatus = "disconnected";
                waQr = "";
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    console.log("WhatsApp logged out. Please re-scan QR.");
                    try { 
                        const authFolder = process.env.USER_DATA_PATH ? path.join(process.env.USER_DATA_PATH, 'baileys_auth_info') : path.join(__dirname, 'baileys_auth_info');
                        fs.rmSync(authFolder, { recursive: true, force: true }); 
                    } catch(e){}
                } else {
                    console.log("WhatsApp connection closed (reason: " + reason + "). Automatically reconnecting in 5s to protect session...");
                    setTimeout(startBaileys, 5000);
                }
            } else if (connection === 'open') {
                waStatus = "connected";
                waQr = "";
            }
        });
        waSock.ev.on('creds.update', saveCreds);
    } catch (err) {
        waStatus = "disconnected";
        console.error("Baileys initialization failed", err);
    }
}

// Auto-start if session exists
const autoStartAuthFolder = process.env.USER_DATA_PATH ? path.join(process.env.USER_DATA_PATH, 'baileys_auth_info') : path.join(__dirname, 'baileys_auth_info');
if (fs.existsSync(autoStartAuthFolder)) {
    // Delay WhatsApp initialization so the main Node server loads instantly
    setTimeout(startBaileys, 1000);
}


const {
  db,
  MODULES,
  initDb,
  list,
  insert,
  getById,
  update,
  remove,
  replaceAll,
  getStore,
  resetAndSeed,
  runRaw
} = require("./server/db");

const app = express();
app.use(compression());
const PORT = Number(process.env.PORT) || 3000;

// Transparent Proxy for Face Recognition Server (InsightFace) on port 8000
// Must be BEFORE express.json() to handle multipart streams correctly
app.all("/api/face/*", (req, res) => {
  const path = req.params[0] || "";
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: `/${path}`,
    method: req.method,
    headers: { ...req.headers }
  };
  delete options.headers.host;
  delete options.headers.connection;

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({ error: "Face Recognition server unreachable on port 8000" });
  });

  req.pipe(proxyReq);
});

// Proxy for ARIA AI Avatar Server on port 5000
app.all("/api/avatar/*", (req, res) => {
  const path = req.params[0] || "";
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/${path}`,
    method: req.method,
    headers: { ...req.headers }
  };
  delete options.headers.host;
  delete options.headers.connection;

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({ error: "AI Avatar server unreachable on port 5000" });
  });

  req.pipe(proxyReq);
});

// ------------------- GLOBAL SAFETY -------------------
// Prevent silent crashes (you had zero protection)
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});
process.on("uncaughtException", err => {
  console.error("Uncaught Exception:", err);
});

// ------------------- MIDDLEWARE -------------------

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);

    const configured = (process.env.CORS_ORIGIN || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const defaults = [
      "https://aatifakram.github.io",
      "https://tapowanpublicschool-production.up.railway.app",
      "https://tapowan-school.vercel.app",
      "https://tapowan-school.pages.dev"
    ];

    // If no CORS_ORIGIN configured, use defaults only
    if (!configured.length) return cb(null, defaults.includes(origin));

    // Always include defaults alongside configured origins
    const allowed = new Set([...configured, ...defaults]);
    return cb(null, allowed.has(origin));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Bypass-Tunnel-Reminder", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Required behind Railway proxy
app.set("trust proxy", 1);

const sessionStore = new session.MemoryStore();

// Shared configuration for both local and tunnel access
const getSessionConfig = (isSecure) => ({
  name: "tps.sid",
  secret: process.env.SESSION_SECRET || "change-this-secret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // CRITICAL: Use the same store for both!
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure
  }
});

const secureSession = session(getSessionConfig(true));
const localSession = session(getSessionConfig(false));

app.use((req, res, next) => {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const isLocal = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1"));
  
  if (isSecure) {
    return secureSession(req, res, next);
  }
  return localSession(req, res, next);
});


// ------------------- STATIC -------------------

app.use(express.static(path.join(__dirname, "public")));
// REMOVED: express.static(__dirname) — was exposing .env and source code

const templatesDir = path.join(__dirname, "assets");
const cursorTemplatesDir = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  "c-Users-Admin-school-management-system-node-modules",
  "assets"
);

app.use("/templates", express.static(templatesDir));
app.use("/templates", express.static(cursorTemplatesDir));

// ------------------- HEALTH -------------------

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) res.send("✅ Backend is live");
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    time: new Date()
  });
});

// ── IMAGE GENERATION API (Pollinations.ai proxy) ──
app.get("/api/generate-image", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const model = req.query.model || "flux";
    if (!prompt) return res.status(400).json({ error: "Missing 'prompt' query parameter" });

    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&model=${model}`;

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(502).json({ error: "Image generation service unavailable" });
    }

    // Stream the image back to the client from localhost
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

// ------------------- AUTH -------------------

// ------------------- ROLE HELPERS -------------------

const ROLE_LEVEL = {
  administrator: 4,
  principal: 3,
  staff: 3,
  teacher: 2,
  student: 1
};

function getRoleLevel(role) {
  return ROLE_LEVEL[String(role).toLowerCase()] || 0;
}

function isAdmin(user) {
  return String(user?.role).toLowerCase() === "administrator";
}

function isStaffOrAbove(user) {
  return getRoleLevel(user?.role) >= 3;
}

function isTeacherOrAbove(user) {
  return getRoleLevel(user?.role) >= 2;
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const verifiedUser = verifyStatelessToken(token);
    if (verifiedUser) {
      req.session = req.session || {};
      req.session.user = verifiedUser;
      return next();
    }
  }
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function adminRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const verifiedUser = verifyStatelessToken(token);
    if (verifiedUser) {
      req.session = req.session || {};
      req.session.user = verifiedUser;
    }
  }
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  if (!isAdmin(req.session.user)) return res.status(403).json({ error: "Admin access required" });
  next();
}

function canWrite(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const verifiedUser = verifyStatelessToken(token);
    if (verifiedUser) {
      req.session = req.session || {};
      req.session.user = verifiedUser;
    }
  }
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  if (getRoleLevel(req.session.user.role) < 2) {
    return res.status(403).json({ error: "You don't have permission to modify records" });
  }
  next();
}

function canDelete(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });
  if (!isStaffOrAbove(req.session.user) && !isAdmin(req.session.user)) {
    return res.status(403).json({ error: "You don't have permission to delete records" });
  }
  next();
}

// Modules teachers can write to
const TEACHER_WRITE_MODULES = new Set(["attendance", "teacherAttendance"]);
// Modules only admin/staff can write to  
const ADMIN_STAFF_ONLY_MODULES = new Set(["users", "payroll", "fees", "dueManagement", "admissions", "schoolInvestments", "schoolIncome", "schoolExpenses", "booksAndDress", "feeStructures", "whatsappAlerts", "settings"]);
// Modules only admin can access at all
const ADMIN_ONLY_MODULES = new Set(["users"]);

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const users = await list("users");

    // Find user by username and active status
    const user = users.find(u =>
      String(u.status).toLowerCase() === "active" &&
      u.username === username
    );

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Compare password — supports both bcrypt hashed and legacy plaintext
    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      // bcrypt hashed password
      passwordValid = bcrypt.compareSync(password, user.password);
    } else {
      // Legacy plaintext — auto-upgrade to bcrypt on successful login
      passwordValid = (user.password === password);
      if (passwordValid) {
        try {
          const hashed = bcrypt.hashSync(password, 10);
          await update("users", user.id, { password: hashed });
          console.log(`[Security] Auto-upgraded password hash for user: ${user.username}`);
        } catch (hashErr) {
          console.error("Failed to auto-upgrade password:", hashErr.message);
        }
      }
    }

    if (!passwordValid) return res.status(401).json({ error: "Invalid credentials" });

    if (!process.env.IS_CLOUD) {
      try {
        // Update lastLogin timestamp
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        await update("users", user.id, { lastLogin: now });
      } catch (updateErr) {
        console.error("Failed to update lastLogin:", updateErr.message);
      }
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      admissionNo: user.admissionNo,
      role: user.role
    };

    // Explicitly save session before responding to prevent race condition
    // where the next API call arrives before the session is persisted
    req.session.save((err) => {
      if (err) {
        console.error("Session save failed:", err);
        return res.status(500).json({ error: "Session save failed" });
      }
      const token = signStatelessToken(req.session.user);
      res.json({ user: req.session.user, token });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── ADMISSION HELPERS ──
function sendAdmissionNotification(student) {
  console.log(`[Notification] Sending Admission SMS/WhatsApp to ${student.phone1} for student ${student.fullName}`);
  // STUB: Here you would integrate with Twilio, MSG91, or a WhatsApp Gateway.
}

app.get("/api/admissions/draft", authRequired, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const all = await list("admissions");
    const draft = all.find(a => String(a.draftUserId) === String(userId) && a.isDraft === "true");
    res.json({ draft: draft || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch draft" });
  }
});

app.post("/api/admissions/draft", authRequired, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const payload = req.body || {};
    payload.isDraft = "true";
    payload.draftUserId = userId;
    payload.status = "Draft";

    const all = await list("admissions");
    const existingDraft = all.find(a => String(a.draftUserId) === String(userId) && a.isDraft === "true");

    if (existingDraft) {
      await update("admissions", existingDraft.id, payload);
      res.json({ message: "Draft updated", id: existingDraft.id });
    } else {
      const row = await insert("admissions", payload);
      res.json({ message: "Draft created", id: row.id });
    }
  } catch (err) {
    console.error("Draft save failed:", err);
    res.status(500).json({ error: "Failed to save draft" });
  }
});

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const { username, fullName, email, password, admissionNo } = req.body || {};
    if (!username || !password || !fullName || !admissionNo) {
      return res.status(400).json({ error: "username, fullName, password and admissionNo are required" });
    }

    // Password minimum length check
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    
    // Validate that the student exists with this admission number and name
    const students = await list("students");
    const matchedStudent = students.find(s => 
      s.admissionNo === admissionNo && 
      String(s.fullName).trim().toLowerCase() === String(fullName).trim().toLowerCase()
    );
    
    if (!matchedStudent) {
      return res.status(404).json({ error: "No student found matching this Full Name and Admission Number." });
    }

    const users = await list("users");
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ error: "Username already taken" });
    }
    if (users.find(u => u.admissionNo === admissionNo)) {
      return res.status(409).json({ error: "An account already exists for this Admission Number" });
    }

    // Hash the password with bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10);

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const newUser = await insert("users", {
      username,
      fullName,
      admissionNo,
      role: "Student",
      email: email || "",
      status: "Active",
      lastLogin: now,
      password: hashedPassword
    });
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      admissionNo: newUser.admissionNo,
      role: newUser.role
    };
    const token = signStatelessToken(req.session.user);
    res.status(201).json({ user: req.session.user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Auth check handled below by detailed route

// ------------------- STORE -------------------

app.get("/api/store", authRequired, async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  try {
    const store = await getStore();
    res.json(store);
  } catch (err) {
    console.error("API /api/store route error:", err);
    res.status(500).json({ error: "Store fetch failed", message: err?.message || String(err), stack: err?.stack });
  }
});

app.get("/api/test-store", async (req, res) => {
  try {
    const store = await getStore();
    res.json({ ok: true, keys: Object.keys(store) });
  } catch (err) {
    res.status(500).json({ error: "Store fetch failed", message: err?.message || String(err), stack: err?.stack });
  }
});

app.get("/api/image/:module/:id/:field", async (req, res) => {
  try {
    const { module: mod, id, field } = req.params;
    if (!MODULES[mod]) return res.status(404).send("Module not found");
    const row = await getById(mod, id);
    if (!row || !row[field]) return res.status(404).send("Image not found");
    const dataUrl = row[field];
    if (typeof dataUrl === 'string' && (dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:application/'))) {
      const commaIdx = dataUrl.indexOf(',');
      const header = dataUrl.substring(0, commaIdx);
      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = dataUrl.substring(commaIdx + 1);
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      return res.send(buffer);
    } else if (typeof dataUrl === 'string' && dataUrl.startsWith('http')) {
      return res.redirect(dataUrl);
    }
    res.status(404).send("Invalid image format");
  } catch (err) {
    res.status(500).send("Server error");
  }
});


let sseClients = [];
global.broadcastEvent = (type, data) => {
  sseClients.forEach(c => {
    c.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  });
};

app.get("/api/events", authRequired, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  sseClients.push(res);
  req.on("close", () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});


// Full database restore from backup JSON
app.post("/api/store/import", adminRequired, express.json({ limit: "50mb" }), async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid backup data" });
    }
    const validModules = Object.keys(MODULES);
    let imported = 0;
    for (const moduleName of validModules) {
      if (Array.isArray(payload[moduleName])) {
        await replaceAll(moduleName, payload[moduleName]);
        imported++;
      }
    }
    res.json({ ok: true, modulesImported: imported });
  } catch (err) {
    console.error("Store import failed:", err);
    res.status(500).json({ error: "Store import failed: " + err.message });
  }
});

// ------------------- COMMUNICATION PROXIES -------------------

// Native WhatsApp Status
app.get("/api/whatsapp/status", authRequired, (req, res) => {
  const user = req.session.user;
  if (!isStaffOrAbove(user) && !isAdmin(user)) return res.status(403).json({ error: "Insufficient permissions" });
  res.json({ status: waStatus, qr: waQr });
});

// Native WhatsApp Start
app.post("/api/whatsapp/start", authRequired, async (req, res) => {
  const user = req.session.user;
  if (!isStaffOrAbove(user) && !isAdmin(user)) return res.status(403).json({ error: "Insufficient permissions" });
  if (waStatus === "disconnected") {
    await startBaileys();
  }
  res.json({ ok: true });
});

// Native WhatsApp Logout
app.post("/api/whatsapp/logout", authRequired, async (req, res) => {
  const user = req.session.user;
  if (!isStaffOrAbove(user) && !isAdmin(user)) return res.status(403).json({ error: "Insufficient permissions" });
  try {
    if (waSock) {
      await waSock.logout();
    }
    waStatus = "disconnected";
    waQr = "";
    // Clean up folder just in case
    const authFolder = process.env.USER_DATA_PATH ? path.join(process.env.USER_DATA_PATH, 'baileys_auth_info') : path.join(__dirname, 'baileys_auth_info');
    if (fs.existsSync(authFolder)) {
      fs.rmSync(authFolder, { recursive: true, force: true });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// Native WhatsApp Send Message
app.post("/api/whatsapp/send", authRequired, async (req, res) => {
  const user = req.session.user;
  if (!isStaffOrAbove(user) && !isAdmin(user)) return res.status(403).json({ error: "Insufficient permissions" });
  const { to, message, attachment } = req.body || {};
  if (!to || (!message && !attachment)) {
    return res.status(400).json({ error: "Missing 'to' or 'message' fields" });
  }

  if (waStatus !== "connected" || !waSock) {
    return res.status(503).json({ error: "WhatsApp is not connected." });
  }

  try {
    let jid = to.replace('@c.us', '');
    if (jid.length === 10) jid = "91" + jid;
    jid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
    
    if (attachment) {
      let buffer, mimetype, fileName = "document";

      if (typeof attachment === 'object' && attachment.base64) {
          // Object format: { base64, mimetype, fileName }
          buffer = Buffer.from(attachment.base64, 'base64');
          mimetype = attachment.mimetype || 'image/jpeg';
          fileName = attachment.fileName || "document";
      } else if (typeof attachment === 'string' && attachment.startsWith('data:')) {
          // Data URI format: data:mimetype;base64,xxxxx
          const parts = attachment.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          mimetype = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          buffer = Buffer.from(parts[1], 'base64');
      } else if (typeof attachment === 'string') {
          // Raw base64 string
          buffer = Buffer.from(attachment, 'base64');
          mimetype = 'image/jpeg';
      } else {
          return res.status(400).json({ error: "Invalid attachment format" });
      }
      
      if (mimetype.includes('pdf')) {
          if (!fileName.endsWith('.pdf')) fileName += '.pdf';
          await waSock.sendMessage(jid, { document: buffer, mimetype, caption: message || "", fileName });
      } else if (mimetype.includes('video')) {
          await waSock.sendMessage(jid, { video: buffer, caption: message || "" });
      } else if (mimetype.includes('audio')) {
          await waSock.sendMessage(jid, { audio: buffer, mimetype });
      } else if (mimetype.includes('image')) {
          await waSock.sendMessage(jid, { image: buffer, caption: message || "" });
      } else {
          // Generic document for other file types
          await waSock.sendMessage(jid, { document: buffer, mimetype, caption: message || "", fileName });
      }
    } else {
      await waSock.sendMessage(jid, { text: message });
    }
    
    res.json({ ok: true, data: { status: "sent" } });
  } catch (err) {
    console.error("WhatsApp Send Error:", err);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

// Auto-discover Android SMS Gateway App
app.get("/api/sms-gateway/discover", authRequired, async (req, res) => {
  const net = require('net');
  const os = require('os');
  
  const interfaces = os.networkInterfaces();
  let localIp = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
      }
    }
  }

  if (!localIp) return res.json({ url: null });

  const baseIp = localIp.split('.').slice(0, 3).join('.');
  
  const checkPort = (ip, port) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(800);
      socket.on('connect', () => {
        socket.destroy();
        resolve(`http://${ip}:${port}/v1/sms/send?phone={phone}&message={message}`);
      });
      socket.on('timeout', () => { socket.destroy(); resolve(null); });
      socket.on('error', () => { socket.destroy(); resolve(null); });
      socket.connect(port, ip);
    });
  };

  const promises = [];
  // Scan common IP range for standard gateway ports
  for (let i = 1; i <= 254; i++) {
    promises.push(checkPort(`${baseIp}.${i}`, 8080));
    promises.push(checkPort(`${baseIp}.${i}`, 8081));
  }

  const results = await Promise.all(promises);
  const foundUrl = results.find(r => r !== null);

  res.json({ url: foundUrl || null });
});



// Face Recognition proxy moved to top of file for stream compatibility

// The PUT /api/store endpoint has been removed for security reasons.
// Bulk overwrites from the frontend are highly dangerous and can lead to data loss or corruption.
// Use the individual module CRUD endpoints instead.

// ------------------- ADMIN -------------------

app.get("/api/settings", authRequired, async (req, res) => {
  try {
    res.json(await list("settings"));
  } catch (err) {
    res.status(500).json({ error: "Settings fetch failed" });
  }
});

// GET seen videos for a specific student
app.get("/api/app-seen-videos/:admissionNo", async (req, res) => {
  const { admissionNo } = req.params;
  try {
    const list = await runRaw("SELECT chapterName FROM app_seen_videos WHERE admissionNo = ?", [admissionNo]);
    res.json(list.map(r => r.chapterName));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch seen videos" });
  }
});

// POST to mark a video as seen
app.post("/api/app-seen-videos", express.json(), async (req, res) => {
  const { admissionNo, chapterName } = req.body || {};
  if (!admissionNo || !chapterName) return res.status(400).json({ error: "Missing admissionNo or chapterName" });
  try {
    await runRaw("INSERT INTO app_seen_videos (admissionNo, chapterName) VALUES (?, ?)", [admissionNo, chapterName]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as seen" });
  }
});

app.get("/api/app-student-sessions", authRequired, async (req, res) => {
  try {
    const rawData = await list("app_student_sessions");
    res.json(rawData || []);
  } catch (err) {
    console.error("Failed to fetch app_student_sessions:", err);
    res.status(500).json({ error: "Failed to fetch student sessions" });
  }
});

app.post("/api/settings", authRequired, async (req, res) => {
  if (req.session.user.role !== "Administrator") return res.status(403).json({ error: "Admin only" });
  try {
    const { key, value, category } = req.body;
    const existing = (await list("settings")).find(s => s.key === key);
    if (existing) {
      await update("settings", existing.id, { value, category, updatedBy: req.session.user.username });
    } else {
      await insert("settings", { key, value, category, updatedBy: req.session.user.username });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Setting save failed" });
  }
});

// The POST /api/admin/reset endpoint has been removed for security reasons.
// Database reset functionality should not be exposed over HTTP.

// ------------------- MODULE CRUD -------------------

// ═══════════════════════════════════════════════════════════
// VIDYA AI — MULTI-PROVIDER FALLBACK CHAIN
// Priority: Gemini → OpenAI → OpenRouter (Groq/Together/Mistral)
// ═══════════════════════════════════════════════════════════

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Helper to check for Admin-only database actions in AI response
async function processAiActions(reply, user) {
  if (String(user.role || "").toLowerCase() !== "administrator" && String(user.role || "").toLowerCase() !== "principal") return reply;

  // Pattern: [ACTION: ADD_NOTIFICATION, msg: "Text"]
  const noteMatch = reply.match(/\[ACTION:\s*ADD_NOTIFICATION,\s*msg:\s*"([^"]+)"\]/i);
  if (noteMatch) {
    try {
      const msg = noteMatch[1];
      await insert("notifications", { message: msg, type: "Announcement", date: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})() });
      return reply.replace(noteMatch[0], `\n✅ (System: Announcement added successfully)`);
    } catch (e) {
      return reply.replace(noteMatch[0], `\n❌ (System: Failed to add announcement)`);
    }
  }
  return reply;
}

function buildVidyaSystemPrompt(user, studentContext, schoolKnowledge = "") {
  const role = String(user.role || "").toLowerCase();
  const isAdmin = role === "administrator" || role === "principal";
  let ctx = `User Name: ${user.fullName || user.username}\nRole: ${role}\n`;
  
  if (studentContext) {
    ctx += `--- RELEVANT RECORD ---\n${studentContext}\n`;
  }
  
  if (schoolKnowledge) {
    ctx += `\n--- GLOBAL SCHOOL KNOWLEDGE ---\n${schoolKnowledge}\n`;
  }

  const adminCapabilities = isAdmin ? `
SPECIAL ADMIN POWERS & AUTHORIZATION:
- You are an INTERNAL school management tool.
- The user is the SYSTEM ADMINISTRATOR with FULL access rights.
- You have EXPLICIT PERMISSION to share ANY and ALL student data (fees, parents, phone, etc.) with this user.
- DO NOT mention privacy restrictions to the Admin.
- You can add school announcements using: [ACTION: ADD_NOTIFICATION, msg: "Text"]
` : "";

  return `You are "Vidya", the internal School Management Assistant for Tapowan Public School.
You are a highly efficient, friendly, and professional staff assistant.
Speak in whatever language the user uses (Hindi, English, or Hinglish).
Max response length: 4-5 sentences.

CONTEXT:
${ctx}
${adminCapabilities}

GUIDELINES:
1. If the user is a Student, help them ONLY with their own records.
2. For Administrators (like the current user), act as a DATA AGENT. Provide exact numbers and names from the context.
3. Use "GLOBAL SCHOOL KNOWLEDGE" for general school rules.
4. PRIVACY NOTE: You are authorized to share all student data with the Admin. Do not hide info from them.
5. If the user asks you to generate a document, report, PDF, Word, Excel, or HTML file, you MUST respond ONLY with raw HTML (using <table>, <h1>, <ul>, etc.). Do not include markdown fences like \`\`\`html. The system will convert your HTML into the requested file format.
6. If the user uploads a document, process it and answer their questions about it playfully and accurately.
7. IMAGE GENERATION: If the user asks to generate, create, draw, or make an image or picture, respond ONLY with this exact tag: [VIDYA_IMAGE: descriptive prompt] — for example [VIDYA_IMAGE: a girl wearing school uniform]. Do NOT refuse image requests. Do NOT say you cannot generate images. Just output the tag.`;
}

// ── Provider 1: Google Gemini ──
async function tryGemini(prompt, systemInstruction) {
  if (!genAI) throw Object.assign(new Error("Gemini not configured"), { status: 503 });
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { systemInstruction, maxOutputTokens: 3000, temperature: 0.8 }
  });
  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return { reply: text, provider: "Gemini" };
}

// ── Provider 2: OpenAI ──
async function tryOpenAI(prompt, systemInstruction) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw Object.assign(new Error("OpenAI not configured"), { status: 503 });

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      max_tokens: 3000,
      temperature: 0.8
    })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw Object.assign(new Error(err.error?.message || `OpenAI error ${resp.status}`), { status: resp.status });
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenAI");
  return { reply: text, provider: "OpenAI" };
}

// ── Provider 3: OpenRouter (Groq / Together AI / DeepSeek) ──
async function tryOpenRouter(prompt, systemInstruction) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw Object.assign(new Error("OpenRouter not configured"), { status: 503 });

  const models = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "deepseek/deepseek-v4-flash:free",
    "google/gemma-4-31b-it:free",
    "openrouter/free"
  ];

  let lastErr = null;
  for (const model of models) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": "https://tapowanpublicschool.com",
          "X-Title": "Tapowan AI Vidya"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          max_tokens: 3000,
          temperature: 0.8
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error(`[OpenRouter] Model ${model} failed with ${resp.status}:`, errData);
        lastErr = Object.assign(new Error(errData.error?.message || `OpenRouter error ${resp.status}`), { status: resp.status });
        continue;
      }
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) { lastErr = new Error("Empty response"); continue; }
      return { reply: text, provider: `OpenRouter (${model.split("/")[1]})` };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All OpenRouter models failed");
}



// ── Provider 4: Claude (via OpenRouter) ──
async function tryClaude(prompt, systemInstruction) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw Object.assign(new Error("OpenRouter not configured"), { status: 503 });

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": "https://tapowanpublicschool.com",
      "X-Title": "Tapowan AI Vidya"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      max_tokens: 3000,
      temperature: 0.7
    })
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw Object.assign(new Error(errData.error?.message || `Claude error ${resp.status}`), { status: resp.status });
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Claude");
  return { reply: text, provider: "Claude 3.5" };
}

const multer = require('multer');
const mammoth = require('mammoth');
const osTmpDir = require('os').tmpdir();
const uploadDir = require('path').join(osTmpDir, 'tapowan-uploads');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

app.post('/api/ai/upload', authRequired, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = require('fs').readFileSync(filePath);
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const data = await mammoth.extractRawText({ path: filePath });
      extractedText = data.value;
    } else if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'text/csv') {
      extractedText = require('fs').readFileSync(filePath, 'utf8');
    } else if (mimeType.startsWith('image/')) {
      const b64 = require('fs').readFileSync(filePath).toString('base64');
      extractedText = `[IMAGE_DATA:${mimeType}:${b64}]`;
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

// ── Main Chat Endpoint — Auto Fallback Chain ──
app.post("/api/ai/chat", authRequired, async (req, res) => {
  try {
    const { prompt, studentContext, preferredProvider, contextFiles } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // ── IMAGE GENERATION INTERCEPTOR ──
    // Detect image requests BEFORE sending to AI (bypasses AI safety filters)
    const imagePatterns = [
      /(?:generate|create|make|draw|show|produce|give me|bana|banao|dikhao|dikha)\s+(?:a |an |one |ek |)(?:image|picture|photo|pic|tasveer|tasvir|chitra|painting|illustration|art)\s*(?:of |about |showing |with |depicting |ka |ki |ke )?\s*(.+)/i,
      /(?:image|picture|photo|pic|tasveer|tasvir|chitra)\s+(?:generate|create|make|draw|bana|banao)\s*(?:of |about |ka |ki |ke )?\s*(.+)/i,
      /(?:generate|create|make|draw)\s+(.+?)\s+(?:image|picture|photo|pic|tasveer|tasvir)/i,
      /(.+?)\s+(?:ka |ki |ke )?(?:image|picture|photo|pic|tasveer|tasvir|chitra)\s+(?:generate|create|make|draw|bana|banao)/i
    ];

    for (const pattern of imagePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        const imagePrompt = match[1].trim().replace(/[.!?,]+$/, '');
        console.log(`[Vidya AI] Image request intercepted. Prompt: "${imagePrompt}"`);
        return res.json({ 
          reply: `[VIDYA_IMAGE: ${imagePrompt}]`, 
          provider: "Image Generator (Pollinations.ai)" 
        });
      }
    }

    // Also catch simple requests like "generate a image" or "generate image"
    const simpleImageMatch = prompt.match(/^(?:generate|create|make|draw|bana|banao)\s+(?:a |an |ek )?(?:image|picture|photo|pic|tasveer|tasvir|chitra)$/i);
    if (simpleImageMatch) {
      console.log(`[Vidya AI] Simple image request intercepted.`);
      return res.json({ 
        reply: `[VIDYA_IMAGE: beautiful colorful illustration for school]`, 
        provider: "Image Generator (Pollinations.ai)" 
      });
    }

    const user = req.session.user;
    const role = String(user.role || "").toLowerCase();
    const isAdmin = role === "administrator" || role === "principal";
    
    // Fetch School Knowledge from settings
    let schoolKnowledge = "";
    try {
      const allSettings = await list("settings");
      const k = allSettings.find(s => s.key === "ai_school_knowledge");
      if (k) schoolKnowledge = k.value;
    } catch (e) {
      console.warn("[Vidya AI] Could not fetch school knowledge from settings");
    }

    let dynamicContext = "";
    if (contextFiles) {
      dynamicContext += "\n[USER ATTACHED FILES (PROCESS THIS IF REQUESTED)]\n" + contextFiles + "\n";
    }

    // For Admins, inject live database summary
    if (isAdmin) {
      try {
        const students = await list("students");
        const fees = await list("fees");
        const notes = await list("notifications");
        
        // Debug Log
        const logPath = path.join(process.cwd(), "ai_debug.log");
        fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Admin Query: "${prompt}"\n`);

        // --- Active Student Memory & Lookup ---
        const admMatch = prompt.match(/(\d+\/\d+|ADM\d+)/i);
        let s = null;
        
        if (admMatch) {
          const query = admMatch[0].toLowerCase();
          s = students.find(x => String(x.admissionNo).toLowerCase() === query);
          fs.appendFileSync(logPath, `Searching by ID: ${query} -> Found: ${s?.fullName || "None"}\n`);
        } else {
          // Robust Name Search: Check for Maryam, Fatima, etc.
          const searchTerms = prompt.toLowerCase().split(" ").filter(t => t.length > 2);
          s = students.find(x => {
            const fullName = (x.fullName || "").toLowerCase();
            // Match if at least 2 significant words from prompt match the student name
            const matches = searchTerms.filter(t => fullName.includes(t));
            return matches.length >= 2 || (searchTerms.length === 1 && fullName.includes(searchTerms[0]));
          });
          fs.appendFileSync(logPath, `Searching by Name terms: ${searchTerms.join(",")} -> Found: ${s?.fullName || "None"}\n`);
        }

        // If not found in current prompt, check session memory
        if (!s && req.session.lastAiStudentId) {
          s = students.find(x => x.id === req.session.lastAiStudentId);
          if (s) fs.appendFileSync(logPath, `Using Session Memory: ${s.fullName}\n`);
        }

        if (s) {
          req.session.lastAiStudentId = s.id;
          const sf = fees.filter(f => String(f.admissionNo).toLowerCase() === String(s.admissionNo).toLowerCase());
          const totalDue = sf.reduce((sum, f) => sum + Number(f.balance || 0), 0);
          
          dynamicContext += `IMPORTANT: DATA BELOW IS LIVE FROM DATABASE.
[ACTIVE STUDENT RECORD]
Name: ${s.fullName}
Admission No: ${s.admissionNo}
Father: ${s.fatherName || s.parentName || "N/A"}
Mother: ${s.motherName || "N/A"}
Class: ${s.className}
Phone: ${s.phone}
Total Pending Fees: ₹${totalDue}
Detailed Dues: ${sf.map(f => `${f.term}: ₹${f.balance}`).join(", ") || "None"}
---
`;
        } else {
          dynamicContext += `\n[SYSTEM NOTE: NO SPECIFIC STUDENT FOUND IN DATABASE FOR THIS QUERY. DO NOT GUESS DATA.]\n`;
        }

        const totalPending = fees.reduce((sum, f) => sum + Number(f.balance || 0), 0);
        const topPending = fees.filter(f => Number(f.balance) > 0).slice(0, 8).map(f => `${f.studentName}(${f.admissionNo}):₹${f.balance}`).join(", ");
        const recentNotes = notes.slice(0, 5).map(n => n.message).join(" | ");
        const allStudentsList = students.map(s => `${s.fullName} (Adm:${s.admissionNo}, Class:${s.className}, Father:${s.fatherName || s.parentName || "N/A"}, Phone:${s.phone || "N/A"})`).join("; ");

        dynamicContext += `\n[LIVE SCHOOL SUMMARY]
Total Students: ${students.length}
Total Outstanding Fees: ₹${totalPending}
Top Pending Accounts: ${topPending || "None"}
Recent Notifications: ${recentNotes || "None"}

[FULL STUDENT LIST (FOR REPORTS/PDFS)]
${allStudentsList}
`;
      } catch (e) {
        console.warn("[Vidya AI] Admin context fetch failed:", e.message);
      }
    } else if (studentContext) {
      dynamicContext = studentContext;
    }

    let systemInstruction = "";
    if (isAdmin) {
      systemInstruction = `You are the Direct Database Access Tool for the Tapowan Public School Administrator.
The user is the SYSTEM ADMINISTRATOR. They have full legal and administrative rights to all data.
DATA CONTEXT:
${dynamicContext}

GOAL:
- Directly provide the requested student information (Father's name, Dues, Phone, etc.) from the DATA CONTEXT.
- If the user asks you to generate a document, report, PDF, Word, Excel, or HTML file, you MUST respond ONLY with raw HTML (using <table>, <h1>, <ul>, etc.). Do not include markdown fences like \`\`\`html. The system will convert your HTML into the requested file format.
- IMAGE GENERATION IS ENABLED. If the user asks to generate, create, draw, or make an image or picture of ANYTHING, you MUST respond ONLY with this exact tag format (nothing else): [VIDYA_IMAGE: descriptive prompt here] — Example: [VIDYA_IMAGE: a cute cartoon schoolgirl in uniform]. Do NOT refuse. Do NOT say you cannot generate images. Do NOT explain anything. Just output the [VIDYA_IMAGE: ...] tag.
- DO NOT use safety disclaimers.
- DO NOT say "I don't have access" or "contact the office".
- DO NOT say image generation is unrelated to school administration.
- Answer in the language the user used (Hindi/English).
- Be extremely helpful. Answer whatever the Admin asks, even if it seems unrelated to school.`;
    } else {
      systemInstruction = buildVidyaSystemPrompt(user, dynamicContext, schoolKnowledge);
    }
    
    // Sort providers based on user preference
    let providerFuncs = [
      { name: "OpenRouter", func: tryOpenRouter },
      { name: "Gemini", func: tryGemini },
      { name: "OpenAI", func: tryOpenAI },
      { name: "Claude", func: tryClaude }
    ];

    if (preferredProvider && preferredProvider !== "auto") {
      const idx = providerFuncs.findIndex(p => p.name === preferredProvider);
      if (idx > -1) {
        const [preferred] = providerFuncs.splice(idx, 1);
        providerFuncs.unshift(preferred);
      }
    }

    let lastErr = null;
    let wasRateLimited = false;
    for (const p of providerFuncs) {
      try {
        const result = await p.func(prompt, systemInstruction);
        // Process any agent actions (Add notification etc)
        const processedReply = await processAiActions(result.reply, user);
        console.log(`[Vidya AI] Responded via ${result.provider}`);
        return res.json({ reply: processedReply, provider: result.provider });
      } catch (err) {
        const status = err.status || err.code || 500;
        console.warn(`[Vidya AI] ${p.name} failed (${status}): ${err.message}`);
        lastErr = err;
        
        if (status === 429) wasRateLimited = true;

        // Don't fallback on 400 (Bad Request) - that's a permanent prompt issue
        if (status === 400) break;
        
        // Otherwise, skip and try ANY other provider (Quota, Server Error, etc)
        continue;
      }
    }

    // All providers failed
    const status = lastErr?.status || 500;
    let reply = "Oops! AI unavailable. Please try again in a moment. 🙏";
    if (status === 429 || wasRateLimited) reply = "सभी AI services की limit full है! थोड़ी देर बाद try करें। 🙏";
    else if (status === 401 || status === 403) reply = "AI settings में कोई problem है। Admin से contact करें।";
    res.status(200).json({ reply, provider: "none" });

  } catch (err) {
    console.error("AI chat critical error:", err.message || err);
    res.status(200).json({ reply: "कुछ गलत हो गया! Please refresh करके try करें। 🙏", provider: "none" });
  }
});


// ── Deepgram TTS Endpoint ──
app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text, lang } = req.body;
    
    // For Hindi, use free Google Translate TTS to avoid API costs and rate limits
    if (lang === 'hi') {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=hi&client=tw-ob`;
      const resp = await fetch(url);

      if (!resp.ok) {
        throw new Error('Google TTS API error: ' + resp.status);
      }

      res.set('Content-Type', 'audio/mpeg');
      const arrayBuffer = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    }

    // For English, use Deepgram Aura
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) return res.status(503).json({ error: "Deepgram not configured" });

    const model = 'aura-asteria-en'; 

    const resp = await fetch('https://api.deepgram.com/v1/speak?model=' + model, {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!resp.ok) {
      throw new Error('Deepgram API error: ' + resp.status);
    }

    res.set('Content-Type', 'audio/mp3');
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('[Vidya TTS Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ── AI Report Card Remark Generator ──
app.post("/api/ai/generate-remark", authRequired, async (req, res) => {
  try {
    const { studentName, grade, percentage } = req.body || {};
    if (!studentName) return res.status(400).json({ error: "Student data is required" });

    const systemInstruction = `You are a professional school teacher generating a brief, 1-sentence report card remark for a student.
The student is ${studentName}. They received an overall grade of ${grade} (${percentage}%).
If the grade is high (A/A+), praise their excellent performance.
If the grade is average (B/C), offer encouragement to focus and improve.
If the grade is poor (D/E/F), offer constructive advice to work harder.
Keep it encouraging, constructive, and strictly one short sentence. Do not wrap in quotes.`;

    const providerFuncs = [
      { name: "Gemini", func: tryGemini },
      { name: "OpenAI", func: tryOpenAI },
      { name: "OpenRouter", func: tryOpenRouter }
    ];

    for (const p of providerFuncs) {
      try {
        const result = await p.func("Generate the remark.", systemInstruction);
        return res.json({ remark: result.reply.trim().replace(/^["']|["']$/g, ''), provider: result.provider });
      } catch (err) {}
    }
    
    // Fallback if AI fails or no keys configured
    const gradeUpper = (grade || "").toUpperCase();
    let fallback = "Keep working hard and aim higher next term.";
    if (gradeUpper.includes('A')) fallback = "Excellent performance this term, keep it up!";
    else if (gradeUpper.includes('B') || gradeUpper.includes('C')) fallback = "Good effort, but there is room for improvement next term.";
    res.json({ remark: fallback });
  } catch (err) {
    console.error("AI remark error:", err);
    res.json({ remark: "Keep working hard and aim higher next term." });
  }
});

//  Vidya AI Logs Endpoint 
app.get("/api/vidya-logs", authRequired, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const userDataPath = process.env.USER_DATA_PATH || app.getPath?.('userData') || process.env.APPDATA + "\\school-management-system";
    const logPath = path.join(userDataPath, 'system_logs.txt');
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      const lines = content.split('\n').slice(-100); // Send last 100 lines
      res.json({ logs: lines.join('\n') });
    } else {
      res.json({ logs: "No logs found at " + logPath });
    }
  } catch (err) {
    res.json({ logs: "Error reading logs: " + err.message });
  }
});

// ── Voice Call Integration Endpoint ──
app.post("/api/ai/voice-call", async (req, res) => {
  try {
    const { prompt, token } = req.body || {};
    if (token !== (process.env.VOICE_API_SECRET || "TAPOWAN_VOICE_SECRET_123")) return res.status(403).json({ error: "Unauthorized Voice Client" });
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Mock an admin user for full access
    const user = { role: "administrator", fullName: "Vidya AI Receptionist", username: "admin" };
    const isAdmin = true;
    
    let dynamicContext = "";
    try {
        const students = await list("students");
        const fees = await list("fees");
        
        const searchTerms = prompt.toLowerCase().split(" ").filter(t => t.length > 2);
        let s = students.find(x => {
            const fullName = (x.fullName || "").toLowerCase();
            const matches = searchTerms.filter(t => fullName.includes(t));
            return matches.length >= 2 || (searchTerms.length === 1 && fullName.includes(searchTerms[0]));
        });
        
        if (s) {
          const sf = fees.filter(f => String(f.admissionNo).toLowerCase() === String(s.admissionNo).toLowerCase());
          const totalDue = sf.reduce((sum, f) => sum + Number(f.balance || 0), 0);
          
          dynamicContext += `IMPORTANT: DATA BELOW IS LIVE FROM DATABASE.
[ACTIVE STUDENT RECORD]
Name: ${s.fullName}
Admission No: ${s.admissionNo}
Father: ${s.fatherName || s.parentName || "N/A"}
Mother: ${s.motherName || "N/A"}
Class: ${s.className}
Phone: ${s.phone}
Total Pending Fees: ₹${totalDue}
Detailed Dues: ${sf.map(f => `${f.term}: ₹${f.balance}`).join(", ") || "None"}
---
`;
        } else {
            dynamicContext += `\n[SYSTEM NOTE: NO SPECIFIC STUDENT FOUND IN DATABASE FOR THIS QUERY.]\n`;
        }
    } catch(e) {
        console.warn("[Voice AI] DB fetch failed", e);
    }
    
    let systemInstruction = `You are Vidya AI, the Tapowan Public School Receptionist answering a phone call.
You have direct database access.
DATA CONTEXT:
${dynamicContext}

GOAL:
- Directly provide the requested student information.
- Speak conversationally and concisely for a phone call (1-2 sentences).
- Answer in the language the user used (Hindi/English).
- Do not use markdown. Keep it very natural and polite.`;

    let providerFuncs = [
      { name: "Gemini", func: tryGemini },
      { name: "OpenAI", func: tryOpenAI },
      { name: "OpenRouter", func: tryOpenRouter }
    ];

    for (const p of providerFuncs) {
      try {
        const result = await p.func(prompt, systemInstruction);
        console.log(`[Voice AI] Responded via ${result.provider}`);
        return res.json({ reply: result.reply, provider: result.provider });
      } catch (err) {
        // Skip to next provider on error
      }
    }
    return res.status(200).json({ reply: "I'm sorry, I am having trouble connecting to my database right now.", provider: "none" });
  } catch (err) {
    res.status(200).json({ reply: "Sorry, a system error occurred.", provider: "none" });
  }
});

// ── Provider Status Endpoint ──
app.get("/api/ai/status", authRequired, (req, res) => {
  res.json({
    gemini:      !!process.env.GEMINI_API_KEY,
    openai:      !!process.env.OPENAI_API_KEY,
    openrouter:  !!process.env.OPENROUTER_API_KEY,
    activeProviders: [
      process.env.GEMINI_API_KEY     ? "Gemini"     : null,
      process.env.OPENAI_API_KEY     ? "OpenAI"     : null,
      process.env.OPENROUTER_API_KEY ? "OpenRouter" : null,
    ].filter(Boolean)
  });
});
// Dynamic Photo Streaming Endpoint (Fixes mobile memory crashes)
app.get("/api/photo/:moduleName/:id", async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    const colName = req.query.col || 'photo';
    if (!MODULES[moduleName]) return res.status(404).send("Module not found");
    
    const record = await getById(moduleName, id);
    if (!record || !record[colName]) return res.status(404).send("Photo not found");
    
    const photoData = record[colName];
    if (typeof photoData === 'string' && (photoData.startsWith('data:image') || photoData.startsWith('data:application'))) {
      const commaIdx = photoData.indexOf(',');
      const header = photoData.substring(0, commaIdx);
      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = photoData.substring(commaIdx + 1);
      const buffer = Buffer.from(base64Data, 'base64');
      
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', buffer.length);
      // Cache heavily (30 days) to speed up future renders
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      return res.send(buffer);
    } else if (typeof photoData === 'string' && photoData.startsWith('http')) {
      return res.redirect(photoData);
    } else {
      res.redirect(photoData.startsWith('/') ? photoData : `/${photoData}`);
    }
  } catch (err) {
    res.status(500).send("Error fetching photo");
  }
});

app.get("/api/modules/:moduleName", (req, res, next) => {
  if (req.params.moduleName === "faceEmbeddings") return next();
  return authRequired(req, res, next);
}, async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  try {
    const { moduleName } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    // Students can only access limited modules
    const user = req.session?.user;
    const role = String(user?.role || "").toLowerCase();
    if (role === "student" && ADMIN_ONLY_MODULES.has(moduleName)) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(await list(moduleName));
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    let user = req.session.user;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const verifiedUser = verifyStatelessToken(token);
      if (verifiedUser) {
        user = verifiedUser;
        req.session = req.session || {};
        req.session.user = user;
      }
    }
    if (!user) return res.json({ user: null });
    
    const role = String(user.role).toLowerCase();
    const roleColors = { administrator: "#dc2626", principal: "#7c3aed", staff: "#2563eb", teacher: "#059669", student: "#d97706" };
    
    return res.json({ 
      user,
      id: user.id, 
      username: user.username, 
      fullName: user.fullName, 
      admissionNo: user.admissionNo,
      role: user.role, 
      roleColor: roleColors[role] || "#64748b" 
    });
  } catch (err) {
    res.status(500).json({ error: "Auth check failed" });
  }
});

// ------------------- HELPERS -------------------


app.post("/api/modules/:moduleName", authRequired, async (req, res) => {
  try {
    const { moduleName } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const user = req.session.user;
    const role = String(user.role).toLowerCase();

    // Students cannot create anything
    if (role === "student") {
      return res.status(403).json({ error: "Students cannot add records" });
    }
    // Teachers can only write attendance modules
    if (role === "teacher" && !TEACHER_WRITE_MODULES.has(moduleName)) {
      return res.status(403).json({ error: "Teachers can only add attendance records" });
    }
    // Admin-staff-only modules
    if (ADMIN_STAFF_ONLY_MODULES.has(moduleName) && !isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    // Prevent non-admins from creating users with elevated roles
    if (moduleName === "users" && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can manage users" });
    }
    // --- Fee Reconciliation Logic Removed ---

    let payload = req.body || {};
    // ── SPECIALIZED ADMISSION LOGIC ──
    if (moduleName === "admissions") {
      
      // 1. Duplicate Detection (Name + DOB + Phone1) - Skip for drafts
      if (payload.isDraft !== "true") {
        const students = await list("students");
        const admissions = await list("admissions");
        const isDuplicate = [...students, ...admissions].some(s => 
          s.id !== payload.id && // exclude self if updating (though this is POST)
          String(s.fullName || "").toLowerCase().trim() === String(payload.fullName || "").toLowerCase().trim() &&
          String(s.dob || "") === String(payload.dob || "") &&
          String(s.phone1 || "") === String(payload.phone1 || "")
        );

        if (isDuplicate) {
          return res.status(409).json({ error: "Duplicate Student: A student with this Name, DOB and Mobile already exists in the system." });
        }

        // 2. Generate Admission No if missing
        if (!payload.admissionNo || payload.admissionNo.includes("TEMP")) {
          const year = new Date().getFullYear();
          const allAdmissions = await list("admissions");
          const allStudents = await list("students");
          const count = allAdmissions.length + allStudents.length + 1;
          payload.admissionNo = `TPS${year}-${String(count).padStart(4, "0")}`;
        }
      }

      if (payload.isDraft === "true") {
        payload.draftUserId = req.session.user.id;
      }
    }

    const row = await insert(moduleName, payload || req.body || {});
    
    // If successful admission (not draft), send notification
    if (moduleName === "admissions" && row.isDraft !== "true" && row.status === "Pending") {
      sendAdmissionNotification(row);
    }
    
    // --- STOCK DEDUCTION LOGIC ---
    if (moduleName === "fees" && payload.selectedBookIds) {
      try {
        const ids = JSON.parse(payload.selectedBookIds);
        if (Array.isArray(ids) && ids.length > 0) {
          const currentBD = await list("booksAndDress");
          for (const bdId of ids) {
            const item = currentBD.find(b => String(b.id) === String(bdId));
            if (item && item.stock !== undefined && item.stock !== null && item.stock !== "") {
              let currentStock = parseInt(item.stock, 10);
              if (!isNaN(currentStock) && currentStock > 0) {
                await update("booksAndDress", bdId, { stock: String(currentStock - 1) });
              }
            }
          }
        }
      } catch (e) {
        console.error("Stock deduction failed:", e);
      }
    }
    
    // Instant Sync: If Fee Structure or Fees changed, trigger the automation immediately
    if (moduleName === "feeStructures" || moduleName === "fees") {
      console.log(`[Fee Automation] ${moduleName} added, triggering instant sync...`);
      runAutomatedFeeTask().catch(e => console.error("Instant sync error:", e.message));
    }
    
    // Auto-sync announcements to mobile app notices
    if (moduleName === "announcements") {
      try {
        const { runRaw } = require("./server/db-sqlite");
        const title = row.title || 'Official Announcement';
        const content = row.message || '';
        const date = row.date || new Date().toISOString().split('T')[0];
        const category = row.category || 'Announcement';
        runRaw(
          `INSERT INTO app_notices (title, content, date, category, is_active, created_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [title, content, date, category]
        ).catch(e => console.error("Announcement insert sync error:", e.message));
      } catch (e) {
        console.error("Announcement hook error:", e);
      }
    }
    
    res.status(201).json(row);
  } catch (err) {
    console.error("Insert failed:", err);
    res.status(500).json({ error: "Insert failed: " + (err.message || err) });
  }
});

app.put("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const user = req.session.user;
    const role = String(user.role).toLowerCase();

    // Students cannot edit anything
    if (role === "student") {
      return res.status(403).json({ error: "Students cannot edit records" });
    }
    // Teachers can only edit attendance and announcements
    if (role === "teacher" && !TEACHER_WRITE_MODULES.has(moduleName) && moduleName !== "announcements") {
      return res.status(403).json({ error: "Teachers can only edit attendance and announcements" });
    }
    // Admin-staff-only modules
    if (ADMIN_STAFF_ONLY_MODULES.has(moduleName) && !isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admin and staff can edit this module" });
    }
    // Users module: only admin
    if (moduleName === "users" && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can edit users" });
    }
    const row = await update(moduleName, id, req.body || {});
    if (!row) return res.status(404).json({ error: "Record not found" });

    if (moduleName === "announcements") {
      try {
        const { runRaw } = require("./server/db-sqlite");
        const title = row.title || 'Official Announcement';
        const content = row.message || '';
        const date = row.date || new Date().toISOString().split('T')[0];
        const category = row.category || 'Announcement';
        runRaw(
          `INSERT INTO app_notices (title, content, date, category, is_active, created_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
          [title, content, date, category]
        ).catch(e => console.error("Announcement update sync error:", e.message));
      } catch (e) {
        console.error("Announcement update hook error:", e);
      }
    }

    // Instant Sync: If Fee Structure or Fees changed, trigger the automation immediately
    if (moduleName === "feeStructures" || moduleName === "fees") {
      console.log(`[Fee Automation] ${moduleName} updated, triggering instant sync...`);
      runAutomatedFeeTask().catch(e => console.error("Instant sync error:", e.message));
    }
    
    res.json(row);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Update failed: " + (err.message || err) });
  }
});

app.delete("/api/modules/:moduleName/:id", authRequired, async (req, res) => {
  try {
    const { moduleName, id } = req.params;
    if (!MODULES[moduleName]) {
      return res.status(404).json({ error: "Unknown module" });
    }
    const user = req.session.user;
    // Only admin and principal can delete
    const roleStr = String(user.role || "").toLowerCase();
    if (roleStr !== "administrator" && roleStr !== "principal") {
      return res.status(403).json({ error: "Only Admins and Principals can delete records" });
    }
    // Users module: only admin
    if (moduleName === "users" && !isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can delete users" });
    }

    let existingRow = null;
    if (moduleName === "announcements") {
      try {
        const all = await list("announcements");
        existingRow = all.find(r => String(r.id) === String(id));
      } catch (e) {}
    }

    await remove(moduleName, id);

    // If announcement is deleted, also deactivate notice in app_notices
    if (moduleName === "announcements" && existingRow?.title) {
      try {
        const { runRaw } = require("./server/db-sqlite");
        runRaw(`UPDATE app_notices SET is_active = 0 WHERE title = ?`, [existingRow.title]).catch(() => {});
      } catch (e) {}
    }

    // If a fee is deleted, trigger instant automation to recreate dues if necessary
    if (moduleName === "fees") {
        console.log("[Fee Automation] Fee record deleted. Triggering delayed sync...");
        // Delay to ensure deletion is committed before re-reading data
        setTimeout(() => {
            runAutomatedFeeTask().catch(e => console.error("Instant sync error:", e));
        }, 500);
    }

    res.json({ ok: true });
    } catch (err) {
      console.error("Delete failed:", err);
      res.status(500).json({ error: "Delete failed: " + (err.message || err) });
    }
});

// ------------------- WHATSAPP ALERTS -------------------

// GET /api/whatsapp/due-fees  →  returns pending/partial fee records enriched with parent phone
app.get("/api/whatsapp/due-fees", authRequired, async (req, res) => {
  try {
    const user = req.session.user;
    if (!isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const fees = await list("fees");
    const students = await list("students");
    const dueMgmt = await list("dueManagement");

    const studentAdmMap = {};
    const studentNameMap = {};
    students.forEach(s => { 
      // Avoid mapping dummy admission numbers so it falls back to studentNameMap correctly
      if (s.admissionNo && s.admissionNo !== "00" && s.admissionNo !== "0" && s.admissionNo.toLowerCase() !== "temp") {
          studentAdmMap[s.admissionNo] = s;
      }
      // Only set name map if no collision (BUG-9 fix: prefer admissionNo lookup)
      if (!studentNameMap[s.fullName]) studentNameMap[s.fullName] = s; 
    });

    const results = [];
    // Track which student+month combos we've already added (BUG-8 dedup)
    const seenKeys = new Set();

    // 1. Process standard fees slips
    fees
      .filter(f => {
        const status = String(f.status || "").toLowerCase();
        const bal = parseFloat(f.balance) || 0;
        return (status === "pending" || status === "partial") && bal > 0;
      })
      .forEach(f => {
        const student = studentAdmMap[f.admissionNo] || studentNameMap[f.studentName] || {};
        const dedupKey = `${f.admissionNo || f.studentName}__${f.month || f.term || ""}`;
        seenKeys.add(dedupKey);
        results.push({
          feeId: f.id,
          admissionNo: f.admissionNo || student.admissionNo || "",
          studentName: f.studentName || "",
          className: f.className || student.className || "",
          rollNo: f.rollNo || student.rollNo || "",
          parentName: student.fatherName || student.parentName || "",
          phone: student.phone || "",
          balance: f.balance || "0",
          totalFee: f.totalFee || "0",
          paidAmount: f.paidAmount || "0",
          term: f.term || "Fee Slip",
          status: f.status || "Pending",
          paymentDate: f.paymentDate || "",
          source: "fees"
        });
      });

    // 2. Process manual Due Management items (skip if already covered by a fee slip)
    dueMgmt
      .filter(d => {
        const status = String(d.status || "").toLowerCase();
        const bal = parseFloat(d.balance) || 0;
        return status !== "paid" && bal > 0;
      })
      .forEach(d => {
        // BUG-8 fix: skip if a fee slip already covers this student+month
        const monthFromParticulars = (d.particulars || "").replace("Tuition fee of ", "").replace("Late fee of ", "");
        const dedupKey = `${d.admissionNo || d.studentName}__${monthFromParticulars}`;
        if (seenKeys.has(dedupKey)) return; // Already have a fee slip for this
        
        const student = studentAdmMap[d.admissionNo] || studentNameMap[d.studentName] || {};
        results.push({
          feeId: `dm-${d.id}`,
          admissionNo: d.admissionNo || student.admissionNo || "",
          studentName: d.studentName || "",
          className: d.className || student.className || "",
          rollNo: d.rollNo || student.rollNo || "",
          parentName: student.fatherName || student.parentName || "",
          phone: student.phone || "",
          balance: d.balance || "0",
          totalFee: d.dueAmount || "0",
          paidAmount: d.paidAmount || "0",
          term: d.particulars || "Due Mgmt",
          status: d.status || "Unpaid",
          paymentDate: "",
          source: "dueManagement"
        });
      });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch due fees" });
  }
});

// POST /api/whatsapp/log-alert  →  logs a WhatsApp alert that was sent
app.post("/api/whatsapp/log-alert", authRequired, async (req, res) => {
  try {
    const user = req.session.user;
    if (!isStaffOrAbove(user) && !isAdmin(user)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const { studentName, className, phone, parentName, balance, term, message } = req.body || {};
    const today = (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})();
    const row = await insert("whatsappAlerts", {
      studentName: studentName || "",
      className: className || "",
      phone: phone || "",
      parentName: parentName || "",
      balance: String(balance || ""),
      term: term || "",
      alertDate: today,
      message: message || "",
      status: "Sent"
    });
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log alert" });
  }
});

// POST /api/sms/send  →  Proxies SMS gateway request via backend to bypass CORS and securely handle embedded passwords
app.post("/api/sms/send", authRequired, async (req, res) => {
  try {
     const user = req.session.user;
     if (!isStaffOrAbove(user) && !isAdmin(user)) return res.status(403).json({ error: "Insufficient permissions" });

     const { gatewayUrl, phone, message } = req.body;
     if (!gatewayUrl || !phone || !message) return res.status(400).json({ error: "Missing parameters" });

     // Parse the gateway URL
     const urlObj = new URL(gatewayUrl);
     const headers = {};

     // Handle Basic Auth from URL if present
     if (urlObj.username || urlObj.password) {
         const authStr = Buffer.from(`${urlObj.username}:${urlObj.password}`).toString("base64");
         headers["Authorization"] = `Basic ${authStr}`;
         // Strip credentials from the URL object for safety
         urlObj.username = "";
         urlObj.password = "";
     }
     
     // Build a CLEAN gateway URL string from our parsed object
     const cleanGatewayUrl = urlObj.toString();

     let targetUrl = cleanGatewayUrl;
     let method = 'POST';
     let body = null;

     const isTemplate = gatewayUrl.includes("{phone}") || gatewayUrl.includes("{message}");

     if (isTemplate) {
         // 1. Traditional Android Gateway apps (GET with Template)
         // IMPORTANT: Use ORIGINAL RAW string for replacement because cleanGatewayUrl (via URL object) 
         // encodes curly braces as %7B / %7D, which makes the .replace() fail.
         targetUrl = gatewayUrl.replace("{phone}", phone).replace("{message}", encodeURIComponent(message));
         method = 'GET';
         body = null;
     } else {
         // 2. Specialized or POST-based gateways
         method = 'POST';
         
         if (urlObj.pathname === "/" || urlObj.pathname === "") {
             // Default to Capcom6 style /message if no path provided
             const targetBase = `${urlObj.protocol}//${urlObj.host}`;
             targetUrl = `${targetBase}/message`;
         } else {
             targetUrl = cleanGatewayUrl;
         }

         body = JSON.stringify({
           phoneNumbers: [phone],
           message: message
         });
     }

     // Mask credentials for safe logging
     const maskedUrl = targetUrl.replace(/\/\/[^@]+@/, "//***:***@");
     console.log(`[SMS Backend Proxy] ${method} to ${maskedUrl}...`);
     if (headers["Authorization"]) console.log(`[SMS Backend Proxy] Using Authorization header (Basic)`);
     
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 10000); 

     try {
       const fetchOptions = {
           method: method,
           headers: headers,
           signal: controller.signal
       };

       if (method === 'POST') {
           fetchOptions.body = body;
           headers['Content-Type'] = 'application/json';
       }

       const response = await fetch(targetUrl, fetchOptions);
       clearTimeout(timeoutId);

       const responseText = await response.text();
       console.log(`[SMS Backend Proxy] Result: ${response.status}`, responseText);

       if (!response.ok && response.status !== 202) {
           const errHint = responseText ? `: ${responseText}` : "";
           return res.status(400).json({ 
             error: `Gateway responded with HTTP ${response.status}${errHint}`,
             body: responseText 
           });
       }

       res.json({ success: true });
     } catch (fetchErr) {
       clearTimeout(timeoutId);
       if (fetchErr.name === 'AbortError') {
         return res.status(504).json({ error: "Gateway Timeout: Phone took too long to respond. Check if the app is open and on the same WiFi." });
       }
       throw fetchErr;
     }
  } catch (err) {
     console.error("[SMS Backend Proxy Error]", err.message);
     res.status(500).json({ error: err.message });
  }
});

// ------------------- PROPER AI ASSISTANT -------------------

app.post("/api/chat", authRequired, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: "⚠️ Gemini API Key is missing. Please add GEMINI_API_KEY to your backend environment (.env) to enable the AI." });
    }

    const { prompt, context } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are EduCore AI, a highly intuitive and helpful assistant for a School Management System.
The user is a staff member currently logged in.
Here is the current state of their app right now:
${context || 'No specific context provided.'}

Answer their questions confidently. Keep responses concise and helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error("Gemini AI API Error:", err);
    res.status(500).json({ reply: `❌ AI Error: ${err.message}` });
  }
});

// ------------------- IP CAMERA SNAPSHOT PROXY -------------------
// Fetches a single JPEG frame from the IP camera so the browser can read
// the pixels without cross-origin canvas taint restrictions.

app.get("/api/camera-snapshot", authRequired, async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing ?url= parameter" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("multipart")) {
      // MJPEG stream — read until we get one complete JPEG frame
      const reader = response.body.getReader();
      const chunks = [];
      let totalLen = 0;
      let foundJpeg = false;

      while (!foundJpeg && totalLen < 2 * 1024 * 1024) { // max 2MB
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLen += value.length;

        // Concatenate and look for JPEG markers (FFD8 start, FFD9 end)
        const buf = Buffer.concat(chunks);
        const soi = buf.indexOf(Buffer.from([0xFF, 0xD8]));
        const eoi = buf.indexOf(Buffer.from([0xFF, 0xD9]), soi > -1 ? soi : 0);
        if (soi > -1 && eoi > -1 && eoi > soi) {
          const jpeg = buf.slice(soi, eoi + 2);
          reader.cancel();
          res.set("Content-Type", "image/jpeg");
          res.set("Cache-Control", "no-cache, no-store");
          res.send(jpeg);
          foundJpeg = true;
        }
      }
      if (!foundJpeg) {
        reader.cancel();
        res.status(502).json({ error: "Could not extract JPEG frame from MJPEG stream" });
      }
    } else {
      // Snapshot URL — pipe through
      res.set("Content-Type", contentType || "image/jpeg");
      res.set("Cache-Control", "no-cache, no-store");
      const arrayBuf = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    }
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "IP camera request timed out" });
    }
    console.error("Camera proxy error:", err.message);
    res.status(502).json({ error: "Failed to reach IP camera: " + err.message });
  }
});

// ------------------- AUTOMATED FEE TASK -------------------

/**
 * Robustly matches a month name against a database month string (could be "Apr" or "April" etc.)
 */
function isMonthMatch(dbMonth, targetMonthName) {
    if (!dbMonth || !targetMonthName) return false;
    const dbVal = String(dbMonth).toLowerCase();
    const targetVal = String(targetMonthName).toLowerCase();
    const shortNames = {
        "january": "jan", "february": "feb", "march": "mar", "april": "apr",
        "may": "may", "june": "jun", "july": "jul", "august": "aug",
        "september": "sep", "october": "oct", "november": "nov", "december": "dec"
    };
    const shortTarget = shortNames[targetVal] || targetVal.substring(0, 3);
    
    // Check for full name or short name in the potentially comma-separated db string or longer text
    const regex = new RegExp(`\\b(${targetVal}|${shortTarget})\\b`, 'i');
    return regex.test(dbVal);
}

let _feeTaskRunning = false; // Concurrency lock
async function runAutomatedFeeTask() {
  if (_feeTaskRunning) { console.log("[Fee Automation] Already running, skipping."); return; }
  _feeTaskRunning = true;
  try {
    const today = new Date();
    const day = today.getDate();
    const monthIndex = today.getMonth();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = months[monthIndex];
    // BUG-1 fix: Dynamic session calculation (Apr-Mar academic year)
    const year = today.getFullYear();
    const sessionStartYear = monthIndex >= 3 ? year : year - 1; // Apr=3 onwards = current year
    const session = `${String(sessionStartYear).slice(2)}-${String(sessionStartYear + 1).slice(2)}`;

    console.log(`[Fee Automation] Checking for ${monthName} dues (Day: ${day})...`);

    const students = await list("students");
    const feeStructures = await list("feeStructures");
    const dueManagement = await list("dueManagement");
    const allFees = await list("fees");

    // ── Auto-Sync: Remove Dues that have since been paid in Fees module ──
    const autoSyncDues = dueManagement.filter(d => 
        d.status === "Unpaid" && (d.particulars || "").includes(" of ")
    );
    if (autoSyncDues.length > 0) {
        let syncCount = 0;
        for (const due of autoSyncDues) {
            const parts = due.particulars.split(" of ");
            if (parts.length < 2) continue;
            const feeName = parts[0].trim();
            const monthStored = parts[1].trim();
            
            // Check if there's ANY fee record for this month with matching feeType
            const isTrackedInFees = allFees.some(f => {
                if (f.admissionNo !== due.admissionNo) return false;
                const isMatch = isMonthMatch(f.month, monthStored) || isMonthMatch(f.term, monthStored);
                if (!isMatch) return false;
                
                return f.feeTypes && f.feeTypes.toLowerCase().includes(feeName.toLowerCase());
            });

            if (isTrackedInFees) {
                console.log(`[Fee Automation] Sync: Found payment for ${due.studentName} (${due.particulars}). Removing redundant due.`);
                await remove("dueManagement", due.id);
                syncCount++;
            }
        }
        if (syncCount > 0) console.log(`[Fee Automation] Sync: Cleaned up ${syncCount} paid records.`);
    }

    // ── Global Sync: Update ALL Unpaid Dues if Fee Structure changed ──
    let globalSyncCount = 0;
    const unpaidDuesToSync = dueManagement.filter(d => d.status === "Unpaid" && (d.particulars || "").includes(" of "));
    for (const due of unpaidDuesToSync) {
        const student = students.find(s => s.admissionNo === due.admissionNo);
        if (!student) continue;

        const className = due.className || student.className;
        const parts = due.particulars.split(" of ");
        if (parts.length < 2) continue;
        const feeName = parts[0].trim();
        
        // Find matching struct by feeType or description
        const struct = feeStructures.find(s => s.className === className && 
            (s.feeType === feeName || (s.feeType === "Other" && s.description === feeName))
        );
        
        if (struct && String(struct.amount) !== String(due.dueAmount)) {
            const alreadyPaid = parseFloat(due.paidAmount) || 0;
            const newBalance = Math.max(0, parseFloat(struct.amount) - alreadyPaid);
            console.log(`[Fee Automation] Global Sync: Updating ${feeName} for ${due.studentName} (${due.particulars}) from ${due.dueAmount} to ${struct.amount} (paid: ${alreadyPaid}, new balance: ${newBalance})`);
            await update("dueManagement", due.id, {
                dueAmount: struct.amount,
                balance: String(newBalance)
            });
            globalSyncCount++;
        }
    }
    if (globalSyncCount > 0) console.log(`[Fee Automation] Global Sync: Updated ${globalSyncCount} records across all months.`);

    // ── Robust Automation: Check all months from April up to current month ──
    const activeMonths = [];
    if (monthIndex >= 3) {
        for (let i = 3; i <= monthIndex; i++) activeMonths.push({ name: months[i], isCurrent: i === monthIndex });
    } else {
        for (let i = 3; i <= 11; i++) activeMonths.push({ name: months[i], isCurrent: false });
        for (let i = 0; i <= monthIndex; i++) activeMonths.push({ name: months[i], isCurrent: i === monthIndex });
    }

    for (const student of students) {
        if (student.status === "Inactive") continue;

        const className = student.className;
        const admNo = student.admissionNo;
        
        // Find all monthly fees applicable to this class
        const classMonthlyFees = feeStructures.filter(s => s.className === className && String(s.term || "").toLowerCase() === "monthly");

        for (const mObj of activeMonths) {
            const mName = mObj.name;
            
            for (const struct of classMonthlyFees) {
                const actualFeeName = struct.feeType === "Other" ? (struct.description || "Custom Fee") : struct.feeType;
                
                // Determine if it should be generated this month
                const isLateFee = actualFeeName.toLowerCase().includes("late");
                if (isLateFee && mName === "April") continue; // Usually no late fee for April
                
                const shouldGenerate = !mObj.isCurrent || (isLateFee ? day >= 11 : day >= 1);
                if (!shouldGenerate) continue;
                
                const particulars = `${actualFeeName} of ${mName}`;
                
                const isTrackedInFees = allFees.some(f => {
                    if (f.admissionNo !== admNo) return false;
                    const isMatch = isMonthMatch(f.month, mName) || isMonthMatch(f.term, mName);
                    if (!isMatch) return false;
                    return f.feeTypes && f.feeTypes.toLowerCase().includes(actualFeeName.toLowerCase());
                });

                const existsInDues = dueManagement.find(d => 
                    d.admissionNo === admNo && 
                    (d.particulars || "").toLowerCase() === particulars.toLowerCase() && 
                    d.session === session
                );
                
                if (!existsInDues && !isTrackedInFees) {
                    const amount = struct.amount || "0";
                    await insert("dueManagement", {
                        admissionNo: admNo,
                        studentName: student.fullName,
                        className: className,
                        rollNo: student.rollNo || "",
                        session: session,
                        month: mName.substring(0,3),
                        particulars: particulars,
                        dueAmount: amount,
                        paidAmount: "0",
                        balance: amount,
                        status: "Unpaid"
                    });
                    console.log(`[Fee Automation] Added [${actualFeeName}: ${amount}] for ${student.fullName} (${admNo}, ${mName})`);
                }
            }
        }
    }
    console.log("[Fee Automation] Task completed successfully.");
  } catch (err) {
    console.error("[Fee Automation] Critical Error:", err);
  } finally {
    _feeTaskRunning = false; // Release concurrency lock
  }
}

// ------------------- DB MIGRATION -------------------
async function migrateInvalidAdmissionNumbers() {
  try {
    const students = await list("students");
    const fees = await list("fees");
    const dues = await list("dueManagement");

    let highestTps = 0;
    
    for (const s of students) {
      if (s.admissionNo && String(s.admissionNo).toUpperCase().startsWith("TPS")) {
         const num = parseInt(String(s.admissionNo).substring(3), 10);
         if (!isNaN(num) && num > highestTps) {
            highestTps = num;
         }
      }
    }

    const isBad = (adm) => {
      if (!adm) return true;
      const str = String(adm).trim().toUpperCase();
      if (str === "" || str === "NIL" || str === "NULL") return true;
      if (/^[0\/\-\s]+$/.test(str)) return true;
      return false;
    };

    let modifiedCount = 0;

    for (const s of students) {
       const adm = String(s.admissionNo || "").trim().toUpperCase();

       if (isBad(adm)) {
          highestTps++;
          const newAdmNo = `TPS${String(highestTps).padStart(2, '0')}`;
          const oldAdmNo = s.admissionNo;

          await update("students", s.id, { ...s, admissionNo: newAdmNo });
          
          const matchingFees = fees.filter(f => 
             String(f.admissionNo) === String(oldAdmNo) && 
             String(f.studentName).trim().toLowerCase() === String(s.fullName).trim().toLowerCase()
          );
          for (const f of matchingFees) {
             await update("fees", f.id, { ...f, admissionNo: newAdmNo });
          }

          const matchingDues = dues.filter(d => 
             String(d.admissionNo) === String(oldAdmNo) && 
             String(d.studentName).trim().toLowerCase() === String(s.fullName).trim().toLowerCase()
          );
          for (const d of matchingDues) {
             await update("dueManagement", d.id, { ...d, admissionNo: newAdmNo });
          }
          
          console.log(`[Migration] Migrated invalid admissionNo "${oldAdmNo}" for ${s.fullName} to "${newAdmNo}"`);
          modifiedCount++;
       }
    }
    
    if (modifiedCount > 0) {
       console.log(`[Migration] Successfully fixed ${modifiedCount} student admission numbers.`);
    }
  } catch (err) {
    console.error("[Migration] Error migrating admission numbers:", err);
  }
}

// ------------------- DB MIGRATION -------------------
async function migrateDueManagementMonths() {
  try {
    const dues = await list("dueManagement");
    let modifiedCount = 0;
    for (const d of dues) {
      if (!d.month && d.particulars) {
        let monthName = "";
        const p = d.particulars.toLowerCase();
        if (p.startsWith("tuition fee of ")) {
          monthName = d.particulars.substring(15).trim();
        } else if (p.startsWith("late fee of ")) {
          monthName = d.particulars.substring(12).trim();
        }
        if (monthName) {
          const shortMonth = monthName.substring(0, 3);
          await update("dueManagement", d.id, { ...d, month: shortMonth });
          modifiedCount++;
        }
      }
    }
    if (modifiedCount > 0) {
      console.log(`[Migration] Successfully backfilled month for ${modifiedCount} due records.`);
    }
  } catch (err) {
    console.error("[Migration] Error migrating due months:", err);
  }
}

// ------------------- VOICE RECEPTIONIST AI -------------------
app.post("/api/voice-receptionist", authRequired, express.json(), async (req, res) => {
  try {
    const transcript = req.body.transcript || "";
    if (!transcript) return res.json({ response: "I'm sorry, I didn't quite catch that." });
    
    if (!genAI) {
      return res.json({ response: "AI features are not configured. Please add the Gemini API key." });
    }

    // Prepare context
    const students = await list("students") || [];
    const fees = await list("fees") || [];
    const attendance = await list("attendance") || [];
    const timetable = await list("timetable") || [];
    const teachers = await list("teachers") || [];

    // Optimize context by stripping base64 photos and unneeded fields
    const minStudents = students.map(s => ({
      name: s.fullName,
      class: s.className,
      roll: s.rollNo,
      father: s.fatherName,
      phone: s.phone
    }));
    const minFees = fees.map(f => ({
      name: f.studentName,
      class: f.className,
      month: f.feeMonth,
      total: f.totalAmount,
      paid: f.paidAmount,
      due: f.dueAmount,
      status: f.status
    }));
    const minTimetable = timetable.map(t => ({
      class: t.className,
      day: t.day,
      period: t.period,
      subject: t.subject,
      teacher: t.teacher,
      room: t.roomNo
    }));
    const minTeachers = teachers.map(t => ({
      name: t.fullName,
      dept: t.department,
      phone: t.phone
    }));

    const systemPrompt = `You are an AI receptionist for Tapowan Public School. Be polite, concise, and helpful. Keep your answers brief (1-3 short sentences max) because you are speaking out loud.
IMPORTANT: You MUST respond ONLY in Hindi (using Latin/Hinglish script or Devanagari). Never reply in English.
If the visitor asks about a student, look them up in the provided JSON data. If they ask about fees, provide the due amount.
If the visitor mentions a student name (e.g. "alim amber"), look for an exact match first. Only if an exact match is NOT found, then use your best judgement to find the closest match based on phonetic or spelling variations (e.g. "aalim amber", "alim raza").
You also have access to the school timetable and teacher directory to answer related queries accurately.
If the visitor asks general knowledge or public questions (like current events, movies, politicians, general trivia, etc.), you MUST answer them intelligently and helpfully.
Visitor's transcript: "${transcript}"

--- SCHOOL DATABASE (JSON) ---
Students: ${JSON.stringify(minStudents)}
Fees: ${JSON.stringify(minFees)}
Timetable: ${JSON.stringify(minTimetable)}
Teachers: ${JSON.stringify(minTeachers)}
------------------------------`;

    let providerFuncs = [
      { name: "OpenRouter", func: tryOpenRouter },
      { name: "Gemini", func: tryGemini },
      { name: "OpenAI", func: tryOpenAI }
    ];

    let responseText = "";
    let lastErr = null;

    for (const p of providerFuncs) {
      try {
        // Pass empty transcript as prompt since the transcript is embedded heavily in systemPrompt already
        // Or just pass the transcript as prompt.
        const result = await p.func(transcript, systemPrompt);
        responseText = result.reply;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`[Voice AI] ${p.name} failed: ${err.message}`);
        continue;
      }
    }

    if (!responseText) {
      throw lastErr || new Error("All AI providers failed");
    }

    res.json({ response: responseText });
  } catch (err) {
    console.error("Voice AI Error:", err);
    res.json({ response: "I'm sorry, I experienced an error while checking the records." });
  }
});

// ------------------- START SERVER -------------------
async function startServer() {
  try {
    await initDb();
    console.log("✅ Database connected");
    if (!process.env.IS_CLOUD) {
      await migrateInvalidAdmissionNumbers();
      await migrateDueManagementMonths();
    }
  } catch (err) {
    console.error("⚠️ DB failed but server continues:", err.message);
  }

    // Start Tunnel and GitHub Sync
if (!process.env.IS_CLOUD) {
    const { startTunnelAndSync } = require('./tunnel-manager');
    startTunnelAndSync(PORT);
} else {
    console.log("Serveo Tunnel disabled in cloud mode.");
}

    // UDP Auto-Discovery Broadcast for Mobile App
    try {
      const dgram = require('dgram');
      const udpServer = dgram.createSocket('udp4');
      udpServer.bind(() => {
        udpServer.setBroadcast(true);
        setInterval(() => {
          const message = Buffer.from(JSON.stringify({ type: 'TAPOWAN_SERVER', port: PORT }));
          udpServer.send(message, 0, message.length, 50000, '255.255.255.255');
        }, 3000);
      });
      console.log(`[UDP] Broadcasting presence on port 50000`);
    } catch(err) {
      console.error("[UDP] Failed to start broadcast:", err);
    }

  if (process.env.VERCEL || process.env.NETLIFY || process.env.NETLIFY_LOCAL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  module.exports = app;
} else {
  app.listen(PORT, "0.0.0.0", () => {

    console.log(`\n🚀 ============================================`);
    console.log(`✅  TAPOWAN SCHOOL SERVER IS LIVE!`);
    console.log(`📡  HTTP PORT: ${PORT}`);
    console.log(`🌐  URL:  http://localhost:${PORT}`);
    console.log(`==============================================\n`);
    // Run automation task on start and then every hour
    runAutomatedFeeTask();
    setInterval(runAutomatedFeeTask, 6 * 60 * 60 * 1000);
    
    // Cloud Sync logic (Desktop only)
    if (!process.env.IS_CLOUD) {
      const { syncToSupabase } = require('./server/supabase-sync');
      // Run once on startup after 2s (full sync)
      setTimeout(() => syncToSupabase(false), 2000);
      setInterval(() => syncToSupabase(true), 10 * 1000); // Poll every 10 seconds for instant sync (PULL ONLY)
      setInterval(() => syncToSupabase(false), 2 * 60 * 1000); // Push to cloud every 2 minutes per user request
    }

    // AI Quiz Generation logic: Auto-generate 20 questions for each subject daily at 12:00 AM midnight (IST)
    const cron = require('node-cron');
    const { generateDailyQuizzes } = require('./server/generate-quiz');

    // 12:00 AM Midnight Cron Schedule (IST)
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ [12:00 AM CRON] Auto-triggering Daily AI Quiz Generation for all subjects...');
      try {
        await generateDailyQuizzes();
      } catch (err) {
        console.error('[12:00 AM CRON Error]:', err.message);
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Run 20s after server startup if needed
    setTimeout(generateDailyQuizzes, 20000);
  });

  // Dedicated Admin API Endpoint to trigger Daily AI Quiz Generation on demand
  app.post('/api/admin/quiz/generate-daily-ai', async (req, res) => {
    try {
      const { generateDailyQuizzes } = require('./server/generate-quiz');
      const results = await generateDailyQuizzes();
      res.json({ success: true, message: 'Daily 20 questions generated for all subjects via AI', results });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  // ── HTTPS Server on port 3443 (for Camera Attendance on network devices) ──
  try {
    const forge = require('node-forge');
    const https = require('https');

    // Check if SSL cert already exists, otherwise generate one
    // Use USER_DATA_PATH for writable storage (important inside Electron/ASAR)
    const sslBase = process.env.USER_DATA_PATH || __dirname;
    const certDir = path.join(sslBase, 'ssl');
    const keyPath = path.join(certDir, 'server.key');
    const certPath = path.join(certDir, 'server.crt');

    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.log('[HTTPS] Generating self-signed SSL certificate...');
      const pki = forge.pki;
      const keys = pki.rsa.generateKeyPair(2048);
      const cert = pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

      const attrs = [
        { name: 'commonName', value: 'Tapowan Public School' },
        { name: 'organizationName', value: 'Tapowan Public School' },
        { name: 'countryName', value: 'IN' }
      ];
      cert.setSubject(attrs);
      cert.setIssuer(attrs);

      // Add SAN (Subject Alternative Names) for local network IPs
      const altNames = [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' }
      ];
      // Add all local network IPs
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            altNames.push({ type: 7, ip: net.address });
          }
        }
      }
      cert.setExtensions([
        { name: 'subjectAltName', altNames: altNames },
        { name: 'basicConstraints', cA: true }
      ]);

      cert.sign(keys.privateKey, forge.md.sha256.create());

      fs.writeFileSync(keyPath, pki.privateKeyToPem(keys.privateKey));
      fs.writeFileSync(certPath, pki.certificateToPem(cert));
      console.log('[HTTPS] SSL certificate generated successfully.');
    }

    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    const HTTPS_PORT = 3443;
    https.createServer(httpsOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
      console.log(`🔒  HTTPS PORT: ${HTTPS_PORT}`);
      console.log(`🔒  URL:  https://localhost:${HTTPS_PORT}`);
      // Get local IP for easy access
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`📱  Network: https://${net.address}:${HTTPS_PORT}`);
          }
        }
      }
      console.log(`==============================================\n`);
    });
  } catch (err) {
    console.error('[HTTPS] Failed to start HTTPS server:', err.message);
    console.log('[HTTPS] Camera attendance will only work on localhost.');
  }

  // The 30-Minute Educational YouTube Reels Rolling Scheduler has been REMOVED.
  // It was automatically executing 'DELETE FROM app_reels' on every server cold start,
  // which wiped out the 25,000 custom reels we scraped. 
} // Closes else block for app.listen
} // Closes startServer()

if (process.env.VERCEL || process.env.NETLIFY || process.env.NETLIFY_LOCAL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  module.exports = app;
} else {
  startServer();
}
