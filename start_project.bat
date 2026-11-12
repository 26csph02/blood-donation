@echo off
title Blood Donation Project Server
cd /d "%~dp0"
echo ===================================================
echo     Blood Donation System - Server Launcher
echo ===================================================
echo.

:: 1. Check if node_modules exists, if not install it automatically
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
    echo.
)

:: 2. Launch browser to localhost:3000
echo [INFO] Opening Blood Donation System in your browser...
start http://localhost:3000

:: 3. Start Node.js server
echo [INFO] Starting Node.js server on port 3000...
echo Server running at http://localhost:3000
echo Press Ctrl + C to stop the server anytime.
echo.
node server.js
pause
