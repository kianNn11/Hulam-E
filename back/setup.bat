@echo off
echo Starting Laravel setup...

echo Generating application key...
php artisan key:generate

echo Running migrations...
php artisan migrate

echo Setup completed successfully!
echo.
echo To start the backend server, run: php artisan serve
echo.
pause
