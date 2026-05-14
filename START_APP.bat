@echo off
title FoodHub - Starting Servers
color 0A
echo.
echo  ==========================================
echo   FoodHub - Food Delivery Platform
echo  ==========================================
echo.
echo  Starting Backend Server (port 5000)...
start "FoodHub Backend" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 4 /nobreak >nul

echo  Starting Frontend Server (port 3000)...
start "FoodHub Frontend" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo  ==========================================
echo   Both servers are starting!
echo  ==========================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo   Login credentials:
echo   customer@demo.com  / password123
echo   owner@demo.com     / password123
echo   courier@demo.com   / password123
echo.
echo  Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
