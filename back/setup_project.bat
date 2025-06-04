@echo off
title Hulame Project Setup
echo ========================================
echo     HULAME PROJECT SETUP SCRIPT
echo ========================================
echo.

:: Check if PHP is installed
echo [1/8] Checking PHP installation...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: PHP is not installed or not in PATH
    echo Please install PHP 8.2+ and add it to your system PATH
    echo Download from: https://windows.php.net/download/
    pause
    exit /b 1
) else (
    echo ✅ PHP is installed
)

:: Check if Composer is installed
echo [2/8] Checking Composer installation...
composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Composer is not installed or not in PATH
    echo Please install Composer and add it to your system PATH
    echo Download from: https://getcomposer.org/download/
    pause
    exit /b 1
) else (
    echo ✅ Composer is installed
)

:: Install PHP dependencies
echo [3/8] Installing PHP dependencies...
echo This may take a few minutes...
composer install --no-dev --optimize-autoloader
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to install PHP dependencies
    pause
    exit /b 1
) else (
    echo ✅ PHP dependencies installed successfully
)

:: Create .env file if it doesn't exist
echo [4/8] Setting up environment configuration...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo ✅ Environment file created from .env.example
    ) else (
        echo Creating new .env file...
        (
            echo APP_NAME=HulameRental
            echo APP_ENV=local
            echo APP_KEY=
            echo APP_DEBUG=true
            echo APP_URL=http://localhost:8000
            echo.
            echo LOG_CHANNEL=stack
            echo LOG_DEPRECATIONS_CHANNEL=null
            echo LOG_LEVEL=debug
            echo.
            echo DB_CONNECTION=mysql
            echo DB_HOST=127.0.0.1
            echo DB_PORT=3306
            echo DB_DATABASE=hulame_rental
            echo DB_USERNAME=root
            echo DB_PASSWORD=
            echo.
            echo BROADCAST_DRIVER=log
            echo CACHE_DRIVER=file
            echo FILESYSTEM_DISK=local
            echo QUEUE_CONNECTION=sync
            echo SESSION_DRIVER=file
            echo SESSION_LIFETIME=120
            echo.
            echo MEMCACHED_HOST=127.0.0.1
            echo.
            echo REDIS_HOST=127.0.0.1
            echo REDIS_PASSWORD=null
            echo REDIS_PORT=6379
            echo.
            echo MAIL_MAILER=smtp
            echo MAIL_HOST=mailhog
            echo MAIL_PORT=1025
            echo MAIL_USERNAME=null
            echo MAIL_PASSWORD=null
            echo MAIL_ENCRYPTION=null
            echo MAIL_FROM_ADDRESS="hello@example.com"
            echo MAIL_FROM_NAME="${APP_NAME}"
        ) > .env
        echo ✅ New environment file created
    )
) else (
    echo ✅ Environment file already exists
)

:: Generate application key
echo [5/8] Generating application key...
php artisan key:generate --force
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to generate application key
    pause
    exit /b 1
) else (
    echo ✅ Application key generated successfully
)

:: Test database connection and run migrations
echo [6/8] Setting up database...
echo Testing database connection...
php artisan migrate:status >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  WARNING: Cannot connect to database
    echo.
    echo Please make sure:
    echo 1. MySQL/XAMPP is running
    echo 2. Database 'hulame_rental' exists
    echo 3. Database credentials in .env are correct
    echo.
    echo Current database settings from .env:
    findstr "DB_" .env
    echo.
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i "%continue%" neq "y" (
        echo Setup cancelled. Please fix database issues first.
        pause
        exit /b 1
    )
) else (
    echo ✅ Database connection successful
    echo Running migrations...
    php artisan migrate --force
    if %errorlevel% neq 0 (
        echo ❌ WARNING: Some migrations may have failed
        echo You may need to run migrations manually later
    ) else (
        echo ✅ Database migrations completed successfully
    )
)

:: Create storage link
echo [7/8] Creating storage link...
php artisan storage:link >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Storage link creation failed (this is usually fine)
) else (
    echo ✅ Storage link created successfully
)

:: Clear caches
echo [8/8] Clearing application caches...
php artisan config:clear >nul 2>&1
php artisan cache:clear >nul 2>&1
php artisan route:clear >nul 2>&1
echo ✅ Caches cleared successfully

echo.
echo ========================================
echo        BACKEND SETUP COMPLETED! 
echo ========================================
echo.
echo ✅ Backend is ready to run!
echo.
echo Next steps:
echo 1. Start the backend server: php artisan serve
echo 2. Setup the frontend (in a new terminal):
echo    - cd ../front
echo    - npm install
echo    - npm start
echo.
echo The backend will be available at: http://localhost:8000
echo The frontend will be available at: http://localhost:3000
echo.
echo If you encounter any database issues, please:
echo 1. Make sure MySQL/XAMPP is running
echo 2. Create database 'hulame_rental' if it doesn't exist
echo 3. Check database credentials in the .env file
echo 4. Run: php artisan migrate
echo.
pause 