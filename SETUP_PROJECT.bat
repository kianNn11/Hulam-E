@echo off
title Hulame Project Complete Setup
echo ========================================
echo      HULAME PROJECT SETUP WIZARD
echo ========================================
echo.
echo This script will set up the complete Hulame project:
echo - Backend (Laravel)
echo - Frontend (React)
echo.
echo Make sure you have:
echo ✓ PHP 8.2+
echo ✓ Composer
echo ✓ Node.js 18+
echo ✓ MySQL/XAMPP running
echo ✓ Database 'hulame_rental' created
echo.
pause

:: Setup Backend
echo ========================================
echo          SETTING UP BACKEND
echo ========================================
echo.
cd back
if exist setup_project.bat (
    call setup_project.bat
    if %errorlevel% neq 0 (
        echo ❌ Backend setup failed!
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ❌ Backend setup script not found!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo          SETTING UP FRONTEND
echo ========================================
echo.
cd front
if exist setup_frontend.bat (
    call setup_frontend.bat
    if %errorlevel% neq 0 (
        echo ❌ Frontend setup failed!
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ❌ Frontend setup script not found!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo       🎉 SETUP COMPLETED! 🎉
echo ========================================
echo.
echo ✅ Both backend and frontend are ready!
echo.
echo To run the application:
echo.
echo 1. Start Backend (open terminal #1):
echo    cd back
echo    php artisan serve
echo.
echo 2. Start Frontend (open terminal #2):
echo    cd front
echo    npm start
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo.
echo Both servers need to run simultaneously!
echo.
set /p start="Would you like to start the backend server now? (y/n): "
if /i "%start%"=="y" (
    echo.
    echo Starting backend server...
    echo Note: Frontend needs to be started separately in another terminal
    echo.
    cd back
    php artisan serve
)

pause 