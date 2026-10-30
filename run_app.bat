@echo off
title TruthLens - AI Fake News Detector
color 0B
cls
echo ================================================================
echo               TruthLens - AI Fake News Detector
echo ================================================================
echo.
echo [1/2] Launching Web Server on http://localhost:8000/ ...
echo [2/2] Opening your browser automatically...
echo.
echo ================================================================
echo   * Web App:     http://localhost:8000/
echo   * Alternative: http://127.0.0.1:8000/
echo.
echo   NOTE: KEEP THIS WINDOW OPEN WHILE PRESENTING / TESTING!
echo   To close the server, simply close this window.
echo ================================================================
echo.

start http://localhost:8000/
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
pause

