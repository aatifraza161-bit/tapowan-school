@echo off
title Tapowan AI Voice Receptionist
color 0A

echo ========================================================
echo       TAPOWAN AI VOICE RECEPTIONIST - STARTUP
echo ========================================================
echo.

echo [1] Configuring Ollama for network access...
set OLLAMA_HOST=0.0.0.0:11434
taskkill /f /im ollama.exe >nul 2>&1
timeout /t 2 >nul
start /b ollama serve >nul 2>&1
timeout /t 3 >nul

echo [2] Starting Asterisk PBX Server inside WSL...
wsl -d Ubuntu -u root service asterisk restart

echo [3] Copying latest code to WSL...
wsl -d Ubuntu -u root cp "/mnt/c/Users/Admin/Desktop/Antigravity/Tapowan_AI_Receptionist/backend/db.js" /opt/ai_receptionist/db.js
wsl -d Ubuntu -u root cp "/mnt/c/Users/Admin/Desktop/Antigravity/Tapowan_AI_Receptionist/backend/server.js" /opt/ai_receptionist/server.js
wsl -d Ubuntu -u root cp "/mnt/c/Users/Admin/Desktop/Antigravity/Tapowan_AI_Receptionist/backend/web_simulator.html" /opt/ai_receptionist/web_simulator.html
wsl -d Ubuntu -u root mkdir -p /tmp/asterisk_ai

echo.
echo [4] Launching AI Voice Backend on port 4000...
echo The AI Receptionist is now ONLINE!
echo.
echo To test from phone:
echo 1. Open Linphone on Android
echo 2. Connect to: 192.168.1.13
echo 3. Username: 100 / Password: secret
echo 4. Dial 7777
echo.
echo Web Simulator: http://localhost:4000
echo.
echo ========================================================
echo Press Ctrl+C to stop the AI Receptionist.
echo ========================================================
wsl -d Ubuntu -u root bash -c "cd /opt/ai_receptionist && OLLAMA_HOST=http://172.19.208.1:11434 node server.js"

pause
