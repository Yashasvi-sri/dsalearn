@echo off
cd /d "%~dp0"
"C:\Users\123pr\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tools\sync_videos.py
start "DSA Learning Portal Server" "C:\Users\123pr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
timeout /t 2 >nul
start "" http://127.0.0.1:5173
