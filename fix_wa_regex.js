const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. We completely replace the sendAttendanceWhatsApp function using regex
code = code.replace(
  /async function sendAttendanceWhatsApp\([^\{]*\{[\s\S]*?catch\(e\) \{[^\}]*\}\s*\}/g,
  `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
    if (typeof window.sendOpenBspWhatsApp !== "function") {
        console.warn("WhatsApp API not found on window object.");
        return;
    }
    const store = typeof getStore === "function" ? getStore() : (window.store || {});
    if (!store || !store.students) {
        console.warn("Store or students not found.");
        return;
    }
    const person = store.students.find(s => s.fullName === recognizedName);
    if (!person) return;
    const targetPhone = person.phone || person.mobile || person.parentPhone || person.contactNo;
    if (!targetPhone) return;
    const targetPhoneClean = String(targetPhone).replace(/\\D/g, "");
    const msg = isArrival 
      ? \`\${person.fullName} Arrives at school at \${time}\`
      : \`\${person.fullName} leave from the school at \${time}\`;
    try {
      await window.sendOpenBspWhatsApp(targetPhoneClean, msg, null);
    } catch(e) { console.warn("WhatsApp auto-send failed:", e); }
  }`
);

fs.writeFileSync('public/app.js', code);
console.log("Regex patch applied!");
