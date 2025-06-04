# Hulame Project Setup Guide

## 🚀 Complete Setup Instructions for New Installation

This guide will help you set up the Hulame project (Laravel + React) on a new computer from a ZIP file.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

### Required Software:
1. **PHP 8.2 or higher** - [Download PHP](https://windows.php.net/download/)
2. **Composer** - [Download Composer](https://getcomposer.org/download/)
3. **Node.js 18+ and npm** - [Download Node.js](https://nodejs.org/)
4. **MySQL or XAMPP** - [Download XAMPP](https://www.apachefriends.org/download.html) (recommended for Windows)
5. **Git** (optional) - [Download Git](https://git-scm.com/download/win)

### Verify Installation:
Open Command Prompt (cmd) or PowerShell and run:
```bash
php --version
composer --version
node --version
npm --version
```

## 🗂️ Project Setup

### Step 1: Extract the Project
1. Extract the ZIP file to your desired location (e.g., `C:\Projects\hulame`)
2. You should see two folders: `back` (Laravel backend) and `front` (React frontend)

### Step 2: Database Setup

#### Option A: Using XAMPP (Recommended)
1. Start XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Open `http://localhost/phpmyadmin`
4. Click "New" to create a database
5. Name it `hulame_rental`
6. Click "Create"

#### Option B: Using MySQL directly
1. Open MySQL command line or MySQL Workbench
2. Create a new database:
   ```sql
   CREATE DATABASE hulame_rental;
   ```

### Step 3: Backend Setup (Laravel)

1. **Navigate to backend directory:**
   ```bash
   cd path\to\your\project\back
   ```

2. **Run the automated setup script:**
   ```bash
   setup_project.bat
   ```
   
   OR manually follow these steps:

3. **Manual Setup (if script doesn't work):**
   
   a. **Install PHP dependencies:**
   ```bash
   composer install
   ```
   
   b. **Create environment file:**
   ```bash
   copy .env.example .env
   ```
   
   c. **Edit the .env file** (open with notepad):
   ```env
   APP_NAME=HulameRental
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://localhost:8000
   
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=hulame_rental
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   
   d. **Generate application key:**
   ```bash
   php artisan key:generate
   ```
   
   e. **Run database migrations:**
   ```bash
   php artisan migrate
   ```
   
   f. **Create storage link:**
   ```bash
   php artisan storage:link
   ```
   
   g. **Clear caches:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

### Step 4: Frontend Setup (React)

1. **Open a new Command Prompt/PowerShell window**

2. **Navigate to frontend directory:**
   ```bash
   cd path\to\your\project\front
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Starting the Backend (Laravel)
1. Open Command Prompt/PowerShell
2. Navigate to the `back` directory:
   ```bash
   cd path\to\your\project\back
   ```
3. Start the Laravel server:
   ```bash
   php artisan serve
   ```
4. The backend will be available at: `http://localhost:8000`

### Starting the Frontend (React)
1. Open a **NEW** Command Prompt/PowerShell window
2. Navigate to the `front` directory:
   ```bash
   cd path\to\your\project\front
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. The frontend will be available at: `http://localhost:3000`

## 🔧 Troubleshooting

### Common Issues:

#### 1. "composer not recognized"
- Make sure Composer is installed and added to your system PATH
- Restart your command prompt after installation

#### 2. "php not recognized"
- Make sure PHP is installed and added to your system PATH
- If using XAMPP, add `C:\xampp\php` to your PATH

#### 3. "SQLSTATE[HY000] [1049] Unknown database"
- Make sure MySQL is running
- Verify the database `hulame_rental` exists
- Check your `.env` file database credentials

#### 4. "npm not recognized"
- Make sure Node.js is installed properly
- Restart your command prompt after installation

#### 5. "Access denied for user 'root'"
- Check your MySQL password in the `.env` file
- If using XAMPP, the default password is usually empty

#### 6. Windows PowerShell "&& operator" error
- Use Command Prompt (cmd) instead of PowerShell
- Or run commands separately:
  ```cmd
  cd C:\path\to\project\back
  php artisan serve
  ```

### Port Conflicts:
- If port 8000 is busy, Laravel will automatically use 8001, 8002, etc.
- If port 3000 is busy, React will ask if you want to use a different port

## 📁 Project Structure
```
hulame/
├── back/           (Laravel Backend)
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
└── front/          (React Frontend)
    ├── src/
    ├── public/
    └── ...
```

## 🎯 Quick Start Summary

1. **Install prerequisites** (PHP, Composer, Node.js, MySQL)
2. **Extract project** to desired location
3. **Create database** named `hulame_rental`
4. **Backend setup:**
   ```bash
   cd back
   composer install
   copy .env.example .env
   # Edit .env with database credentials
   php artisan key:generate
   php artisan migrate
   php artisan serve
   ```
5. **Frontend setup** (in new terminal):
   ```bash
   cd front
   npm install
   npm start
   ```
6. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📞 Support

If you encounter any issues:
1. Check that all prerequisites are installed correctly
2. Verify database connection and credentials
3. Make sure both servers (backend and frontend) are running
4. Check for any error messages in the command prompt

## 📄 Additional Notes

- The backend includes user authentication and rental management
- The frontend is a React application with dark mode support
- Both servers need to be running simultaneously for full functionality
- Default database uses MySQL, but can be configured for other databases
- The project includes various test files for debugging purposes

---

**Happy coding! 🎉** 