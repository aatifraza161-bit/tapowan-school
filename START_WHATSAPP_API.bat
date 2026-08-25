@echo off
title Tapowan WhatsApp API (Evolution API v2)
color 0B
echo ========================================================
echo     TAPOWAN PUBLIC SCHOOL - WhatsApp API (OpenBSP)
echo ========================================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running.
    echo Please install Docker Desktop for Windows and make sure it is running.
    echo Download link: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b
)

echo [OK] Docker is installed.
echo.

REM Check if Docker Desktop daemon is actually running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [WAITING] Docker Desktop is not running yet...
    echo Please start Docker Desktop and wait for it to fully load.
    echo.
    pause
    echo Retrying...
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker is still not running. Please start Docker Desktop first.
        pause
        exit /b
    )
)

echo [OK] Docker daemon is running.
echo.

echo Pulling latest Evolution API image...
docker-compose pull

echo.
echo Starting WhatsApp API container...
docker-compose up -d

echo.
echo ========================================================
echo   WhatsApp API is now running!
echo.
echo   API Endpoint:  http://localhost:8080
echo   API Key:       TapowanSecretKey123
echo.
echo   STEP 1: Create an instance
echo     POST http://localhost:8080/instance/create
echo     Header: apikey: TapowanSecretKey123
echo     Body: {"instanceName": "TapowanSchool", "qrcode": true}
echo.
echo   STEP 2: Get QR Code to pair your phone
echo     GET http://localhost:8080/instance/connect/TapowanSchool
echo     Header: apikey: TapowanSecretKey123
echo.
echo   STEP 3: Use this Gateway URL in your School System:
echo     http://localhost:8080/message/sendText/TapowanSchool
echo.
echo   Or open your School System and go to WhatsApp Alerts
echo   to configure everything from the UI.
echo ========================================================
echo.
pause
