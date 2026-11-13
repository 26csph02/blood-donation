@echo off
title Blood Donation Project Server
cd /d "%~dp0"

echo ===================================================
echo     Blood Donation System - Launcher
echo ===================================================
echo.

:: 1. Clear any stuck process on port 3000
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: 2. Open browser automatically
echo [INFO] Opening Blood Donation System in your browser...
start "" "http://localhost:3000"

:: 3. Start Node.js server
echo [INFO] Server running at http://localhost:3000
echo (Keep this window open while using the project)
echo.
node server.js
pause
