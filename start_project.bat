@echo off
title Blood Donation Project Server
cd /d "%~dp0"

echo ===================================================
echo     Blood Donation System - Server Launcher
echo ===================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b
)

:: 2. Check if dependencies are installed, if not install them
if not exist node_modules (
    echo [INFO] First-time setup: Installing dependencies...
    call npm install
    echo.
)

:: 3. Inform user of URL
echo [INFO] Server is starting on Port 3000...
echo.
echo ===================================================
echo   Open your browser and visit:
echo   http://localhost:3000
echo ===================================================
echo.
echo (Keep this window open while the application is running)
echo Press Ctrl + C to stop the server.
echo.

:: 4. Attempt to open browser automatically
start "" "http://localhost:3000"

:: 5. Run Node.js Server
node server.js

echo.
pause
