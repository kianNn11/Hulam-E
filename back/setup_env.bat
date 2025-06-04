@echo off
echo Setting up Laravel environment...

echo Creating .env file...
if not exist .env (
    echo APP_NAME=HulameRental > .env
    echo APP_ENV=local >> .env
    echo APP_KEY= >> .env
    echo APP_DEBUG=true >> .env
    echo APP_URL=http://localhost:8000 >> .env
    echo. >> .env
    echo LOG_CHANNEL=stack >> .env
    echo LOG_DEPRECATIONS_CHANNEL=null >> .env
    echo LOG_LEVEL=debug >> .env
    echo. >> .env
    echo DB_CONNECTION=mysql >> .env
    echo DB_HOST=127.0.0.1 >> .env
    echo DB_PORT=3306 >> .env
    echo DB_DATABASE=hulame_rental >> .env
    echo DB_USERNAME=root >> .env
    echo DB_PASSWORD= >> .env
    echo. >> .env
    echo BROADCAST_DRIVER=log >> .env
    echo CACHE_DRIVER=file >> .env
    echo FILESYSTEM_DISK=local >> .env
    echo QUEUE_CONNECTION=sync >> .env
    echo SESSION_DRIVER=file >> .env
    echo SESSION_LIFETIME=120 >> .env
    echo. >> .env
    echo MEMCACHED_HOST=127.0.0.1 >> .env
    echo. >> .env
    echo REDIS_HOST=127.0.0.1 >> .env
    echo REDIS_PASSWORD=null >> .env
    echo REDIS_PORT=6379 >> .env
    echo. >> .env
    echo MAIL_MAILER=smtp >> .env
    echo MAIL_HOST=mailhog >> .env
    echo MAIL_PORT=1025 >> .env
    echo MAIL_USERNAME=null >> .env
    echo MAIL_PASSWORD=null >> .env
    echo MAIL_ENCRYPTION=null >> .env
    echo MAIL_FROM_ADDRESS="hello@example.com" >> .env
    echo MAIL_FROM_NAME="${APP_NAME}" >> .env
    echo. >> .env
    echo Environment file created successfully!
) else (
    echo .env file already exists!
)

echo.
echo Generating application key...
php artisan key:generate

echo.
echo Installing dependencies...
composer install --no-dev --optimize-autoloader

echo.
echo Running migrations...
php artisan migrate

echo.
echo Clearing caches...
php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo.
echo Setup completed successfully!
echo.
echo Frontend setup:
echo 1. Navigate to the front directory: cd ../front
echo 2. Install dependencies: npm install
echo 3. Start frontend: npm start
echo.
echo Backend setup:
echo To start the backend server, run: php artisan serve
echo.
pause 