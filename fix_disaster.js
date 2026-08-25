const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const disasterStart = code.indexOf('contentArea.querySelectorAll(".panel:not(#facePanel):not(#assistantPanel):not(#waAlertPanel):not(#bd-panel):not(#ai-panel):not(#schoolCalendarPanel):not(#examPanel):not(#backupPanel)").forEach(p => {');
const disasterEnd = code.indexOf('window.renderWhatsAppModule();', disasterStart);

const restoredLogic = `contentArea.querySelectorAll(".panel:not(#facePanel):not(#assistantPanel):not(#waAlertPanel):not(#bd-panel):not(#ai-panel):not(#schoolCalendarPanel):not(#examPanel):not(#backupPanel)").forEach(p => {
      p.style.display = (isBD || isWA || isAI || isExams || isDashboard || isBackup) ? "none" : "";
    });
  }

  if (isAI) {
    renderAiAssistant();
    return;
  }

  if (isBackup) {
    renderNav();
    renderHeader();
    renderBackupModule();
    return;
  }

  const bdPanel = document.getElementById("bd-panel");
  if (isBD && typeof window.showBDPanel === "function") {
    window.showBDPanel();
  } else if (bdPanel) {
    bdPanel.style.display = "none";
  }

  const waPanel = document.getElementById("waAlertPanel");
  if (isWA && typeof window.renderWhatsAppModule === "function") {
    `;

if (disasterStart !== -1 && disasterEnd !== -1) {
  code = code.substring(0, disasterStart) + restoredLogic + code.substring(disasterEnd);
  
  // Now add the backup hide logic right before renderNav
  const renderNavCallIndex = code.indexOf('renderNav();', disasterStart + restoredLogic.length);
  if (renderNavCallIndex !== -1) {
    const backupHide = `  const backupPanel = document.getElementById("backupPanel");
  if (backupPanel && !isBackup) {
    backupPanel.style.display = "none";
  }

  `;
    code = code.substring(0, renderNavCallIndex) + backupHide + code.substring(renderNavCallIndex);
  }
  
  fs.writeFileSync('public/app.js', code);
  console.log("Disaster fixed!");
} else {
  console.log("Could not find disaster bounds", disasterStart, disasterEnd);
}
