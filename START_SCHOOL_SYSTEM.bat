@echo off
title TAPOWAN SCHOOL - ALL-IN-ONE SYSTEM
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo ===================================================
echo   TAPOWAN PUBLIC SCHOOL - SYSTEM STARTUP
echo ===================================================
echo.

:: 1. Cleanup old processes
echo [1/4] Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
echo    Done.

:: 2. Start Face Server (Python)
echo [2/4] Starting Face Recognition Server (Port 8000)...
start /min "Face Server" cmd /c "START_FACE_SERVER.bat"
timeout /t 5 >nul

:: 3. Start Cloudflare Tunnel
echo [3/4] Starting Cloudflare Tunnel...
start /min "Tunnel" node tunnel_keeper.js
timeout /t 5 >nul

:: 4. Start Main School Server (Port 3000)...
echo [4/4] Starting Main School Server (Port 3000)...
echo.
echo ===================================================
echo   SYSTEM IS NOW RUNNING!
echo   - Local: http://localhost:3000
echo   - Mobile: (Check tunnel_log.txt on Desktop)
echo ===================================================
echo.
echo Keep this window open. Press Ctrl+C to stop.
node node_modules\electron\cli.js server.js

pause
