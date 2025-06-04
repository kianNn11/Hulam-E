@echo off
title Hulame Frontend Setup
echo ========================================
echo    HULAME FRONTEND SETUP SCRIPT
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and npm
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)

:: Check if npm is installed
echo [2/3] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm is not installed or not in PATH
    echo npm should come with Node.js installation
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
    npm --version
)

:: Install dependencies
echo [3/3] Installing Node.js dependencies...
echo This may take a few minutes...
npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to install Node.js dependencies
    echo.
    echo Try running these commands manually:
    echo 1. npm cache clean --force
    echo 2. npm install
    pause
    exit /b 1
) else (
    echo ✅ Node.js dependencies installed successfully
)

echo.
echo ========================================
echo       FRONTEND SETUP COMPLETED!
echo ========================================
echo.
echo ✅ Frontend is ready to run!
echo.
echo To start the frontend development server:
echo npm start
echo.
echo The frontend will be available at: http://localhost:3000
echo.
echo Make sure the backend is also running on: http://localhost:8000
echo.
pause 