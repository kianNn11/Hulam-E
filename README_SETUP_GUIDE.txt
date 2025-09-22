# Hulame Project Migration Setup Guide

## Requirements
- PHP >= 8.0
- Composer
- MySQL/MariaDB
- Laravel (already included in this project)

## Database Setup
1. Create a new database named `hulame` in your MySQL/MariaDB server.
   - You can use phpMyAdmin, MySQL Workbench, or the command line:
     ```sh
     mysql -u root
     CREATE DATABASE hulame;
     exit;
     ```
   - No password is required for the root user (as per your setup).

2. Configure your Laravel `.env` file (located in `/back/.env`):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=hulame
   DB_USERNAME=root
   DB_PASSWORD=
   ```

## Running the Migrations
1. Open a terminal and navigate to the `back` directory:
   ```sh
   cd back
   ```
2. Install dependencies (if not already):
   ```sh
   composer install
   ```
3. Run the migrations:
   ```sh
   php artisan migrate
   ```
   This will create all tables as defined in the migration file.

## Notes
- If you want to reset the database, you can use:
  ```sh
  php artisan migrate:fresh
  ```
- Make sure your database server is running before running migrations.
- If you encounter permission issues, ensure your MySQL user has privileges to create tables and databases.

## Ready!
Your database is now set up and ready to use with the Hulame project. 