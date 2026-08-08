@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale o Node.js para abrir a previa local.
  pause
  exit /b 1
)

call npm run preview:open
endlocal
