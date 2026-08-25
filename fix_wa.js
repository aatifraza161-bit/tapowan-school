const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const waOld = `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
    if (typeof sendOpenBspWhatsApp !== "function") return;
    const store = window.getStore ? window.getStore() : window.store;
    if (!store) return;`;

const waNew = `async function sendAttendanceWhatsApp(recognizedName, isArrival, time) {
    if (typeof window.sendOpenBspWhatsApp !== "function") return;
    const store = typeof getStore === "function" ? getStore() : (window.store || {});
    if (!store) return;`;

code = code.replace(waOld, waNew);

fs.writeFileSync('public/app.js', code);
console.log("Successfully fixed WA logic!");
