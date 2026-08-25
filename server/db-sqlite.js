const fs = require("fs");
const path = require("path");
const os = require('os');

const isCloudMode = !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.IS_CLOUD);

// In cloud mode, use HTTP-only client (no native binary needed).
// Locally, use full client for embedded SQLite replica support.
const { createClient } = isCloudMode
  ? require("@libsql/client/http")
  : require("@libsql/client");
const appDataDir = isCloudMode ? os.tmpdir() : (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share"));
const basePath = process.env.USER_DATA_PATH || path.join(appDataDir, 'school-management-system');
try {
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
} catch(e) {}

const dbPath = path.join(basePath, "school-replica.db");
const queuePath = path.join(basePath, "offline-queue.json");

// Offline Queue State
let offlineQueue = [];
if (!isCloudMode) {
  try {
    if (fs.existsSync(queuePath)) offlineQueue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
  } catch (e) {
    console.error("Failed to load offline queue", e);
  }
}

function saveQueue() {
  if (isCloudMode) return;
  try { fs.writeFileSync(queuePath, JSON.stringify(offlineQueue)); } catch(e) {}
}

function isNetworkError(e) {
  const msg = (e.message || "").toLowerCase();
  return msg.includes("fetch failed") || msg.includes("network") || msg.includes("timeout") || msg.includes("offline") || msg.includes("walconflict");
}

// Connect to Turso Cloud
const dbOptions = {};

if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.IS_CLOUD) {
  console.log("? Connecting to Turso via Remote HTTP (Cloud Mode)...");
  dbOptions.url = process.env.TURSO_DATABASE_URL;
  dbOptions.authToken = process.env.TURSO_AUTH_TOKEN;
} else {
  // Local Desktop Mode: Embedded Replica
  dbOptions.url = "file:" + dbPath;
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    console.log("? Connecting Turso Embedded Replica...");
    dbOptions.syncUrl = process.env.TURSO_DATABASE_URL;
    dbOptions.authToken = process.env.TURSO_AUTH_TOKEN;
    dbOptions.syncInterval = 60;
  }
}

let db = createClient(dbOptions);

// ========== SECOND TURSO DATABASE (Fees) ==========
const FEE_MODULES = new Set(['fees', 'dueManagement', 'feeStructures']);
const feeDbPath = path.join(basePath, "school-fee-replica.db");
const feeDbOptions = {};

if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.IS_CLOUD) {
  if (process.env.TURSO_FEE_DATABASE_URL && process.env.TURSO_FEE_AUTH_TOKEN) {
    feeDbOptions.url = process.env.TURSO_FEE_DATABASE_URL;
    feeDbOptions.authToken = process.env.TURSO_FEE_AUTH_TOKEN;
  } else {
    // Fallback: use main DB if fee DB not configured
    feeDbOptions.url = process.env.TURSO_DATABASE_URL;
    feeDbOptions.authToken = process.env.TURSO_AUTH_TOKEN;
  }
} else {
  feeDbOptions.url = "file:" + feeDbPath;
  if (process.env.TURSO_FEE_DATABASE_URL && process.env.TURSO_FEE_AUTH_TOKEN) {
    console.log("💰 Connecting Turso Fee DB Embedded Replica...");
    feeDbOptions.syncUrl = process.env.TURSO_FEE_DATABASE_URL;
    feeDbOptions.authToken = process.env.TURSO_FEE_AUTH_TOKEN;
    feeDbOptions.syncInterval = 60;
  }
}

let feeDb = (process.env.TURSO_FEE_DATABASE_URL && process.env.TURSO_FEE_AUTH_TOKEN)
  ? createClient(feeDbOptions)
  : db; // Fallback to main db if fee db not configured

// Helper: route to the correct database based on module name
function getDb(moduleName) {
  return FEE_MODULES.has(moduleName) ? feeDb : db;
}

// ========== RECOVERY ==========
async function recoverWalConflict(targetDb, targetOptions, targetPath, label) {
  console.log(`⚠️ [Recovery:${label}] Detected WalConflict! Rebuilding local replica...`);
  try {
    if (targetDb && typeof targetDb.close === 'function') {
      try { targetDb.close(); } catch (e) {}
    }
  } catch(e) {}
  
  try {
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    if (fs.existsSync(targetPath + "-wal")) fs.unlinkSync(targetPath + "-wal");
    if (fs.existsSync(targetPath + "-shm")) fs.unlinkSync(targetPath + "-shm");
    console.log(`⚠️ [Recovery:${label}] Deleted corrupted local replica.`);
  } catch (err) {
    console.log(`⚠️ [Recovery:${label}] Could not delete file (locked). Creating new db file.`);
    targetOptions.url = "file:" + targetPath.replace('.db', `-${Date.now()}.db`);
  }
  
  try {
    const newClient = createClient(targetOptions);
    await newClient.sync();
    console.log(`✅ [Recovery:${label}] Successfully rebuilt local replica from cloud!`);
    if (label === 'main') { db = newClient; }
    else { feeDb = newClient; }
    processOfflineQueue();
  } catch (err) {
    console.error(`❌ [Recovery:${label}] Failed to rebuild replica:`, err.message);
  }
}

function handleSyncError(e) {
  const msg = (e.message || "").toLowerCase();
  console.error("❌ Turso Sync Error:", msg);
  if (msg.includes("walconflict") || msg.includes("wal frame insert conflict")) {
    recoverWalConflict(db, dbOptions, dbPath, 'main');
  }
}

function handleFeeSyncError(e) {
  const msg = (e.message || "").toLowerCase();
  console.error("❌ Turso Fee DB Sync Error:", msg);
  if (msg.includes("walconflict") || msg.includes("wal frame insert conflict")) {
    recoverWalConflict(feeDb, feeDbOptions, feeDbPath, 'fees');
  }
}

// Sync main DB
if (dbOptions.syncUrl && !(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
  db.sync().then(() => {
    console.log("✅ Turso synced successfully");
    processOfflineQueue();
  }).catch(handleSyncError);
  setInterval(() => {
    if (db && db.sync) {
      db.sync().then(() => processOfflineQueue()).catch(handleSyncError);
    }
  }, 60000);
}

// Sync fee DB
if (feeDbOptions.syncUrl && !(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) && feeDb !== db) {
  feeDb.sync().then(() => {
    console.log("✅ Turso Fee DB synced successfully");
  }).catch(handleFeeSyncError);
  setInterval(() => {
    if (feeDb && feeDb.sync) {
      feeDb.sync().catch(handleFeeSyncError);
    }
  }, 60000);
}

async function processOfflineQueue() {
  if (!offlineQueue.length) return;
  console.log(`[Offline Sync] Processing ${offlineQueue.length} queued items...`);
  const remaining = [];
  
  for (const item of offlineQueue) {
    try {
      if (item.action === 'insert') {
        const { id, ...realPayload } = item.payload; // remove temp id
        await _insert(item.module, realPayload);
      } else if (item.action === 'remove') {
        // Only attempt to remove real integer IDs, skip TEMP ids which were never synced
        if (typeof item.id !== 'string' || !item.id.startsWith("TEMP-")) {
          await _remove(item.module, item.id);
        }
      } else if (item.action === 'update') {
        await _update(item.module, item.id, item.payload);
      }
      console.log(`[Offline Sync] Successfully synced ${item.action} for ${item.module}`);
    } catch (err) {
      console.error(`[Offline Sync] Failed to sync ${item.action}:`, err.message);
      if (!isNetworkError(err)) {
        // If it's a hard error (like constraint violation), we might want to drop it,
        // but for safety we'll keep it or you could add retry limits.
        // For now, if it's not a network error, we'll assume it's permanently failed and drop it to prevent blocking the queue.
        console.error(`[Offline Sync] Dropping item due to hard error.`);
      } else {
        remaining.push(item);
      }
    }
  }
  
  if (remaining.length !== offlineQueue.length) {
    offlineQueue = remaining;
    saveQueue();
  }
}

const MODULES = {
  app_student_sessions: ["student_name", "class_name", "admission_no", "roll_no", "status", "last_active_at", "last_login_at", "phone", "device_os"],
  students: [
    "admissionNo", "rollNo", "fullName", "className", "section", "gender", "dob", "age",
    "aadhar", "category", "religion", "phone1", "phone2", "whatsapp", "email",
    "village", "post", "district", "state", "pin", "address",
    "fatherName", "motherName", "guardianName", "relation", "occupation", "incomeRange", "emergencyContact",
    "session", "admissionDate", "prevSchool", "lastClassPassed", "tcReceived",
    "photo", "birthCert", "aadharDoc", "tcDoc", "parentIdDoc",
    "admissionFee", "monthlyFee", "transportFee", "discount",
    "status", "remarks", "parentName", "phone", "tc", "reportCard", "fatherAadhar", "motherAadhar",
    "studentAadharNo", "fatherAadharNo", "motherAadharNo"
  ],
  admissions: [
    "admissionNo", "rollNo", "fullName", "className", "section", "gender", "dob", "age",
    "aadhar", "category", "religion", "phone1", "phone2", "whatsapp", "email",
    "village", "post", "district", "state", "pin", "address",
    "fatherName", "motherName", "guardianName", "relation", "occupation", "incomeRange", "emergencyContact",
    "classApplyingFor", "session", "admissionDate", "prevSchool", "lastClassPassed", "tcReceived",
    "photo", "birthCert", "aadharDoc", "tcDoc", "parentIdDoc",
    "admissionFee", "monthlyFee", "transportFee", "discount",
    "status", "remarks", "isDraft", "draftUserId", "parentName", "phone", "tc", "reportCard", "fatherAadhar", "motherAadhar",
    "studentAadharNo", "fatherAadharNo", "motherAadharNo"
  ],
  teachers: ["employeeNo", "fullName", "department", "qualification", "phone", "email", "joinDate", "photo"],
  classes: ["className", "section", "classTeacher", "roomNo", "capacity"],
  subjects: ["subjectCode", "subjectName", "className", "teacher", "credits"],
  attendance: ["date", "className", "studentName", "rollNo", "status", "arrivalTime", "departureTime", "remarks", "facePhoto"],
  teacherAttendance: ["date", "department", "teacherName", "status", "arrivalTime", "departureTime", "remarks"],
  exams: ["examName", "className", "section", "studentName", "rollNo", "admissionNo", "studentPhoto", "session", "examDate", "reportingTime", "examCenter", "subjectMarks", "totalMarks", "percentage", "grade", "gpa", "rank", "resultStatus", "teacherRemark"],
  examSchedules: ["className", "examName", "dates"],
  fees: ["admissionNo", "studentName", "className", "rollNo", "fatherName", "term", "month", "creationDate", "feeTypes", "tuitionFee", "admissionFee", "computerFee", "developmentFee", "labFee", "sportsFee", "libraryFee", "examFee", "transportFee", "hostelFee", "otherFee", "lateFee", "totalFee", "paidAmount", "balance", "status", "paymentDate", "paymentMethod", "onlineAmount", "cashAmount", "monthlyFee", "monthlyFeeLabel", "selectedBookIds", "dueMgmtAmount", "dueMgmtParticulars", "consolidatedFeeIds", "consolidatedDueMgmtIds", "payId"],
  library: ["bookCode", "bookTitle", "author", "issuedTo", "issueDate", "returnDate", "status"],
  transport: ["routeName", "vehicleNo", "driverName", "studentName", "pickupPoint", "monthlyFee"],
  hostel: ["hostelName", "roomNo", "studentName", "warden", "checkInDate", "bedNo", "status"],
  payroll: ["employeeName", "designation", "month", "basicSalary", "allowances", "deductions", "netPay"],
  users: ["username", "fullName", "role", "email", "status", "lastLogin", "password"],
  timetable: ["className", "day", "period", "subject", "teacher", "roomNo"],
  notifications: ["message", "type", "date"],
  faceEmbeddings: ["targetType", "name", "tag", "descriptorJson"],
  schoolInvestments: ["title", "category", "amount", "expectedReturn", "bank", "startDate", "maturityDate", "notes", "status"],
  schoolIncome: ["date", "source", "category", "amount", "mode", "description"],
  schoolExpenses: ["date", "head", "category", "amount", "mode", "description"],
  booksAndDress: ["className", "itemType", "itemName", "price", "term", "stock"],
  feeStructures: ["className", "feeType", "amount", "term", "description"],
  whatsappAlerts: ["studentName", "className", "phone", "parentName", "balance", "term", "alertDate", "message", "status"],
  dueManagement: ["admissionNo", "studentName", "className", "rollNo", "session", "month", "particulars", "dueAmount", "paidAmount", "balance", "status", "remarks", "payId"],
  holidays: ["date", "name", "type", "description"],
  weeklyEvaluation: ["weekStartDate", "weekEndDate", "className", "section", "studentName", "rollNo", "maths", "english", "hindi", "science", "sst", "readingEng", "readingHindi", "writingEng", "writingHindi", "attanDance", "dicipLine", "uniform", "activities", "overall", "teacherRemark"],
  announcements: ["date", "title", "message", "targetAudience", "postedBy", "category", "targetType", "targetClass", "targetAdmissionNo", "targetStudentName", "priority", "status"],
  settings: ["key", "value", "category", "updatedBy"],
  app_student_sessions: ["admission_no", "student_name", "class_name", "roll_no", "phone", "status", "device_os", "last_login_at", "last_active_at", "created_at"]
};

async function runRaw(sql, params = [], moduleName) {
  const targetDb = moduleName ? getDb(moduleName) : db;
  return await targetDb.execute({ sql, args: params });
}

async function createTable(tableName, fields) {
  const cols = fields.map((f) => `${f} TEXT`).join(", ");
  await getDb(tableName).execute(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${cols});`);
}

async function ensureColumns(tableName, fields) {
  const targetDb = getDb(tableName);
  const res = await targetDb.execute(`PRAGMA table_info(${tableName})`);
  const existing = res.rows.map((r) => r.name);
  for (const f of fields) {
    if (!existing.includes(f)) {
      try {
        await targetDb.execute(`ALTER TABLE ${tableName} ADD COLUMN ${f} TEXT`);
      } catch (e) {}
    }
  }
}

async function seedIfEmpty() {
  const res = await db.execute("SELECT COUNT(*) AS c FROM users");
  if (res.rows[0].c > 0) return;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const today = new Date().toISOString().slice(0, 10);

  await insert("students", { admissionNo: "ADM001", rollNo: "10A-01", fullName: "Aarav Sharma", className: "10-A", gender: "Male", dob: "2010-03-12", parentName: "Rohit Sharma", phone: "9876501234", address: "Sector 5", status: "Active", aadhar: "", tc: "", reportCard: "" });
  await insert("students", { admissionNo: "ADM002", rollNo: "9B-07", fullName: "Ananya Singh", className: "9-B", gender: "Female", dob: "2011-07-20", parentName: "Vikas Singh", phone: "9823401234", address: "Green Park", status: "Active", aadhar: "", tc: "", reportCard: "" });
  await insert("teachers", { employeeNo: "EMP100", fullName: "Neha Verma", department: "Science", qualification: "M.Sc", phone: "9900112233", email: "neha@school.com", joinDate: "2018-06-10" });
  await insert("teachers", { employeeNo: "EMP101", fullName: "Amit Kumar", department: "Math", qualification: "M.Ed", phone: "9900112244", email: "amit@school.com", joinDate: "2019-01-05" });
  await insert("classes", { className: "10", section: "A", classTeacher: "Neha Verma", roomNo: "204", capacity: "40" });
  await insert("subjects", { subjectCode: "MAT10", subjectName: "Mathematics", className: "10-A", teacher: "Amit Kumar", credits: "5" });
  await insert("attendance", { date: today, className: "10-A", studentName: "Aarav Sharma", rollNo: "10A-01", status: "Present", remarks: "On time" });
  await insert("teacherAttendance", { date: today, department: "Science", teacherName: "Neha Verma", status: "Present", remarks: "On time" });
  await insert("exams", { examName: "Mid Term", className: "10-A", studentName: "Aarav Sharma", rollNo: "10A-01", session: "2026-27", subjectMarks: JSON.stringify([{subject: "Mathematics", theory: 64, practical: 20, total: 84}]), totalMarks: "84", percentage: "84%", grade: "A", resultStatus: "Pass" });
  await insert("fees", { studentName: "Aarav Sharma", className: "10-A", rollNo: "10A-01", term: "Q1", totalFee: "18000", paidAmount: "15000", balance: "3000", status: "Partial", paymentDate: today, paymentMethod: "Cash" });
  await insert("users", { username: "im_aatif", fullName: "System Admin", role: "Administrator", email: "admin@school.com", status: "Active", lastLogin: now, password: "Aatif@123" });
  await insert("users", { username: "principal", fullName: "School Principal", role: "Principal", email: "principal@school.com", status: "Active", lastLogin: now, password: "principal123" });
  await insert("timetable", { className: "10-A", day: "Monday", period: "1", subject: "Mathematics", teacher: "Amit Kumar", roomNo: "204" });
  await insert("notifications", { message: "Parent meeting on Friday 11 AM", type: "Announcement", date: today });
}

async function seedHolidays() {
  const res = await db.execute("SELECT COUNT(*) AS c FROM holidays");
  if (res.rows[0].c > 0) return;
  const holidays = [
    { date: "2026-01-26", name: "Republic Day", type: "National", description: "Republic Day of India" },
    { date: "2026-01-14", name: "Makar Sankranti", type: "Festival", description: "Harvest festival" },
    { date: "2026-02-26", name: "Maha Shivaratri", type: "Religious", description: "Lord Shiva festival" },
    { date: "2026-03-17", name: "Holi", type: "Festival", description: "Festival of colors" },
    { date: "2026-12-25", name: "Christmas", type: "Festival", description: "Birth of Jesus Christ" }
  ];
  for (const h of holidays) await insert("holidays", h);
}

async function ensureDefaultAdmin() {
  const adminByUsername = await db.execute({ sql: "SELECT * FROM users WHERE username = ?", args: ["im_aatif"] });
  const anyAdmin = await db.execute("SELECT * FROM users WHERE lower(role) = 'administrator' LIMIT 1");
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (adminByUsername.rows.length === 0) {
    await insert("users", {
      username: "im_aatif", fullName: "System Admin", role: "Administrator", email: "admin@school.com",
      status: "Active", lastLogin: now, password: "Aatif@123"
    });
  }
  if (anyAdmin.rows.length > 0 && anyAdmin.rows[0].username !== "im_aatif") {
    await db.execute({ sql: "UPDATE users SET username = ?, password = ? WHERE id = ?", args: ["im_aatif", "Aatif@123", anyAdmin.rows[0].id] });
  }
}

async function resetAndSeed() {
  const tx = await db.transaction();
  for (const moduleName of Object.keys(MODULES)) {
    await tx.execute(`DELETE FROM ${moduleName}`);
    await tx.execute({ sql: `DELETE FROM sqlite_sequence WHERE name = ?`, args: [moduleName] });
  }
  await tx.commit();
  await seedIfEmpty();
}

async function purgeDemoData() {
  for (const tbl of ["schoolInvestments", "schoolIncome", "schoolExpenses"]) {
    try { await db.execute(`DELETE FROM ${tbl} WHERE isDemo = 1 OR isDemo = 'true' OR isDemo = '1'`); } catch (e) {}
  }
}

async function backfillPayIds() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const genId = () => {
    let p = '';
    for (let i = 0; i < 6; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    return p;
  };
  try {
    const dues = await db.execute("SELECT id FROM dueManagement WHERE payId IS NULL OR payId = ''");
    if (dues.rows.length > 0) {
      const tx = await db.transaction();
      for (const d of dues.rows) await tx.execute({ sql: "UPDATE dueManagement SET payId = ? WHERE id = ?", args: [genId(), d.id] });
      await tx.commit();
    }
    const fees = await db.execute("SELECT id FROM fees WHERE payId IS NULL OR payId = ''");
    if (fees.rows.length > 0) {
      const tx = await db.transaction();
      for (const f of fees.rows) await tx.execute({ sql: "UPDATE fees SET payId = ? WHERE id = ?", args: [genId(), f.id] });
      await tx.commit();
    }
  } catch (e) {}
}

async function initDb() {
  for (const [tableName, fields] of Object.entries(MODULES)) {
    await createTable(tableName, fields);
    await ensureColumns(tableName, fields);
  }
  await seedIfEmpty();
  await seedHolidays();
  await purgeDemoData();
  await ensureDefaultAdmin();
  await backfillPayIds();
}

async function list(moduleName) {
  const result = await getDb(moduleName).execute(`SELECT * FROM ${moduleName} ORDER BY id DESC`);
  let rows = result.rows.map(row => {
    if (row.photo && typeof row.photo === 'string' && row.photo.startsWith('data:image')) row.photo = `/api/photo/${moduleName}/${row.id}`;
    if (row.studentPhoto && typeof row.studentPhoto === 'string' && row.studentPhoto.startsWith('data:image')) row.studentPhoto = `/api/photo/${moduleName}/${row.id}?col=studentPhoto`;
    if (row.facePhoto && typeof row.facePhoto === 'string' && row.facePhoto.startsWith('data:image')) row.facePhoto = `/api/photo/${moduleName}/${row.id}?col=facePhoto`;
    return row;
  });

  // Apply offline queue mutations
  const removes = new Set(offlineQueue.filter(q => q.action === 'remove' && q.module === moduleName).map(q => String(q.id)));
  if (removes.size > 0) {
    rows = rows.filter(r => !removes.has(String(r.id)));
  }
  
  const updates = offlineQueue.filter(q => q.action === 'update' && q.module === moduleName);
  updates.forEach(u => {
    const idx = rows.findIndex(r => String(r.id) === String(u.id));
    if (idx !== -1) {
      rows[idx] = { ...rows[idx], ...u.payload };
    }
  });

  const inserts = offlineQueue.filter(q => q.action === 'insert' && q.module === moduleName).map(q => q.payload).reverse(); // newest first
  if (inserts.length > 0) {
    rows = [...inserts, ...rows];
  }

  return rows;
}

function triggerSync() {} // Turso autosyncs in background now

async function _insert(moduleName, payload) {
  if ((moduleName === "fees" || moduleName === "dueManagement") && !payload.payId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let p = ''; for (let i = 0; i < 6; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    payload.payId = p;
  }
  if (moduleName === "faceEmbeddings" && payload.name && payload.targetType) {
    try {
      await getDb(moduleName).execute({
        sql: `DELETE FROM faceEmbeddings WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND targetType = ?`,
        args: [payload.name, payload.targetType]
      });
    } catch(e) {}
  }
  const fields = MODULES[moduleName];
  const cols = fields.join(", ");
  
  // Use positional ? params — Turso embedded replica silently fails with named :params
  const placeholders = fields.map(() => '?').join(", ");
  const values = fields.map(f => payload[f] ?? "");
  
  const res = await getDb(moduleName).execute({ sql: `INSERT INTO ${moduleName} (${cols}) VALUES (${placeholders})`, args: values });
  return await getById(moduleName, Number(res.lastInsertRowid));
}

async function insert(moduleName, payload) {
  try {
    return await _insert(moduleName, payload);
  } catch (err) {
    if (isNetworkError(err) && dbOptions.syncUrl) {
      console.warn(`[Offline Queue] Insert into ${moduleName} failed, queuing locally...`);
      const tempId = "TEMP-" + Date.now();
      const queuedPayload = { id: tempId, ...payload };
      offlineQueue.push({ action: 'insert', module: moduleName, payload: queuedPayload, tempId });
      saveQueue();
      return queuedPayload;
    }
    throw err;
  }
}

async function getById(moduleName, id) {
  const numId = Number(id);
  const finalId = isNaN(numId) ? id : numId;
  
  // Check if it's a queued offline insert
  if (typeof id === 'string' && id.startsWith("TEMP-")) {
    const queued = offlineQueue.find(q => q.action === 'insert' && q.module === moduleName && q.tempId === id);
    if (queued) return queued.payload;
    return undefined;
  }
  const result = await getDb(moduleName).execute({ sql: `SELECT * FROM ${moduleName} WHERE id = ?`, args: [finalId] });
  return result.rows[0];
}

async function _update(moduleName, id, payload) {
  const numId = Number(id);
  const finalId = isNaN(numId) ? id : numId;
  const fields = MODULES[moduleName] || [];
  const allowedKeys = Object.keys(payload || {}).filter((k) => fields.includes(k));
  if (!allowedKeys.length) return await getById(moduleName, id);

  // Use positional ? params — Turso embedded replica silently fails with named :params
  const setSql = allowedKeys.map(k => `${k}=?`).join(", ");
  const values = allowedKeys.map(k => payload[k] ?? "");
  values.push(finalId); // for WHERE id=?
  
  await getDb(moduleName).execute({ sql: `UPDATE ${moduleName} SET ${setSql} WHERE id=?`, args: values });

  if (moduleName === "fees" && String(payload.status).toLowerCase() === "paid") {
      const fee = await getById("fees", id);
      if (fee && fee.consolidatedDueMgmtIds) {
          try {
              const mgmtIds = JSON.parse(fee.consolidatedDueMgmtIds);
              if (Array.isArray(mgmtIds) && mgmtIds.length > 0) {
                  for (const mid of mgmtIds) {
                      await getDb("dueManagement").execute({ sql: "UPDATE dueManagement SET status = 'Paid', paidAmount = dueAmount, balance = '0' WHERE id = ? AND status != 'Paid'", args: [mid] });
                  }
              }
          } catch (e) {}
      }
  }
  return await getById(moduleName, id);
}

async function update(moduleName, id, payload) {
  try {
    // If it's a queued insert, update it in the queue instead of executing SQL
    if (typeof id === 'string' && id.startsWith("TEMP-")) {
      const q = offlineQueue.find(q => q.action === 'insert' && q.module === moduleName && q.tempId === id);
      if (q) {
        q.payload = { ...q.payload, ...payload };
        saveQueue();
        return q.payload;
      }
    }
    return await _update(moduleName, id, payload);
  } catch (err) {
    if (isNetworkError(err) && dbOptions.syncUrl) {
      console.warn(`[Offline Queue] Update ${moduleName}/${id} failed, queuing locally...`);
      offlineQueue.push({ action: 'update', module: moduleName, id, payload });
      saveQueue();
      // Return optimistically updated data
      const oldData = await getById(moduleName, id).catch(() => ({}));
      return { ...oldData, ...payload, id };
    }
    throw err;
  }
}

async function _remove(moduleName, id) {
  const numId = Number(id);
  const finalId = isNaN(numId) ? id : numId;
  if (moduleName === "fees") {
      const fee = await getById("fees", id);
      if (fee && fee.consolidatedDueMgmtIds) {
          try {
              const mgmtIds = JSON.parse(fee.consolidatedDueMgmtIds);
              if (Array.isArray(mgmtIds) && mgmtIds.length > 0) {
                  for (const mid of mgmtIds) {
                     await getDb("dueManagement").execute({ sql: "UPDATE dueManagement SET status = 'Pending', paidAmount = 0, balance = dueAmount WHERE id = ?", args: [mid] });
                  }
              }
          } catch(e) {}
      }
  }
  return await getDb(moduleName).execute({ sql: `DELETE FROM ${moduleName} WHERE id = ?`, args: [finalId] });
}

async function remove(moduleName, id) {
  try {
    // If it's a temporary ID, just remove it from the queue
    if (typeof id === 'string' && id.startsWith("TEMP-")) {
      const idx = offlineQueue.findIndex(q => q.action === 'insert' && q.module === moduleName && q.tempId === id);
      if (idx !== -1) {
        offlineQueue.splice(idx, 1);
        saveQueue();
        return;
      }
    }
    return await _remove(moduleName, id);
  } catch (err) {
    if (isNetworkError(err) && dbOptions.syncUrl) {
      console.warn(`[Offline Queue] Delete from ${moduleName} failed, queuing locally...`);
      offlineQueue.push({ action: 'remove', module: moduleName, id });
      saveQueue();
      return;
    }
    throw err;
  }
}

async function replaceAll(moduleName, rows) {
  const tx = await db.transaction();
  await tx.execute(`DELETE FROM ${moduleName}`);
  await tx.commit();
  for (const r of rows) await insert(moduleName, r);
}

async function rawList(moduleName) {
  const heavyFields = ["photo", "birthCert", "aadharDoc", "tcDoc", "parentIdDoc", "reportCard", "fatherAadhar", "motherAadhar", "aadhar", "tc"];
  
  try {
    const db = getDb(moduleName);
    
    // Fetch actual columns to avoid querying non-existent ones
    const pragmaRes = await db.execute(`PRAGMA table_info(${moduleName})`);
    const actualCols = pragmaRes.rows.map(r => r.name);
    
    const selectCols = actualCols.map(col => {
      if (heavyFields.includes(col)) {
        return `CASE WHEN length("${col}") > 50 THEN 'true' ELSE NULL END as "${col}"`;
      }
      return `"${col}"`;
    });

    const selectClause = selectCols.length > 0 ? selectCols.join(", ") : "*";
    const res = await db.execute(`SELECT ${selectClause} FROM ${moduleName} ORDER BY id DESC`);
    return res.rows;
  } catch (err) {
    console.error(`Error in rawList for ${moduleName}:`, err.message);
    throw err;
  }
}

async function getStore() {
  const store = {};
  const moduleKeys = Object.keys(MODULES);
  const BATCH_SIZE = 5; // Safe limit for Turso free tier

  try {
    for (let i = 0; i < moduleKeys.length; i += BATCH_SIZE) {
      const batch = moduleKeys.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(m => rawList(m)));
      batch.forEach((m, idx) => {
        if (results[idx].status === "fulfilled") {
          store[m] = results[idx].value;
        } else {
          console.error(`[getStore] Failed to load module '${m}':`, results[idx].reason);
          store[m] = [];
        }
      });
    }
    return store;
  } catch (err) {
    console.error("GETSTORE CRITICAL ERROR:", err);
    return store;
  }
}

const withRetry = (fn) => async (...args) => {
  let retries = 0;
  while (true) {
    try {
      return await fn(...args);
    } catch (err) {
      if (err.message && err.message.includes("WalConflict") && retries < 5) {
        retries++;
        console.warn(`[DB] WalConflict detected, forcing sync and retrying (${retries}/5)...`);
        try {
          if (db.sync) await db.sync();
        } catch(e) {
          console.warn("[DB] Sync failed during WalConflict retry:", e.message);
        }
        await new Promise(r => setTimeout(r, retries * 500));
      } else {
        throw err;
      }
    }
  }
};

module.exports = { 
  db, feeDb, MODULES, initDb, list, getById, getStore, resetAndSeed, runRaw, seedIfEmpty,
  insert: withRetry(insert), 
  update: withRetry(update), 
  remove: withRetry(remove), 
  replaceAll: withRetry(replaceAll)
};
