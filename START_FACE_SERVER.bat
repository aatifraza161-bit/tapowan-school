@echo off
title Face Recognition Server
cd /d "%~dp0face_server"
echo Starting Face Recognition Server (InsightFace)...
echo.

:: Priority 1: Use the pre-compiled exe (works on any PC without Python)
if exist "dist\face_server.exe" (
    echo [System] Using compiled face_server.exe...
    "dist\face_server.exe"
    goto :end
)

:: Priority 2: Use the specific Python installation
set "WORKING_PYTHON=C:\Users\Admin\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if exist "%WORKING_PYTHON%" (
    echo [System] Using specific Python installation...
    "%WORKING_PYTHON%" main.py
    goto :end
)

:: Priority 3: Use default system python
echo [System] Using default python...
python main.py

:end
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Face server failed to start.
    echo Please ensure face_server.exe exists in the dist folder.
    pause
)
