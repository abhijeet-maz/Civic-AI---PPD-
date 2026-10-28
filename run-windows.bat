@echo off
title CivicAI
cd /d "%~dp0"
if not exist package.json (
  echo ERROR: package.json not found next to run-windows.bat. Open the folder that contains package.json and run it from there.
  pause & exit /b 1
)
where node >nul 2>nul || (echo Node.js 20+ is required: https://nodejs.org & pause & exit /b 1)
rem node_modules ships built for Windows x64. Re-create links / fetch any missing native binary when needed.
set NEED=0
if not exist node_modules\.bin\concurrently.cmd set NEED=1
if not exist node_modules\@esbuild\win32-x64\package.json set NEED=1
if not exist node_modules\@civicai\shared set NEED=1
if "%NEED%"=="1" (
  echo Preparing project, first run only - needs internet if files are missing...
  call npm install --no-audit --no-fund --prefer-offline
  if errorlevel 1 (echo npm install failed - see the message above & pause & exit /b 1)
)
echo Starting CivicAI: web http://localhost:3000   api http://localhost:5000
call npm run dev
pause
