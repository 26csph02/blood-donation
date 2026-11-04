@echo off
title Push Blood Donation to GitHub
cd /d "%~dp0"
echo ===================================================
echo Pushing Blood Donation Project to GitHub
echo Repository: https://github.com/26csph02/blood-donation.git
echo ===================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Your project has been pushed to GitHub!
) else (
    echo [NOTICE] If prompted, make sure you are signed into your GitHub account (26csph02).
)
echo.
pause
