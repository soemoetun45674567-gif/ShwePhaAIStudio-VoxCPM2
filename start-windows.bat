@echo off
cd /d %~dp0
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
if not exist .env (
  copy .env.example .env
  echo.
  echo Please edit .env and add GEMINI_API_KEY and ATHANLAB_API_KEY, then run this file again.
  pause
  exit /b
)
npm run dev
