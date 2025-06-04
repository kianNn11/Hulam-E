# Laravel-React Integration Setup Guide

This guide will help you connect the Laravel backend database to the React frontend while preserving the existing design.

## 🚀 Quick Setup

### Backend Setup (Laravel)

1. **Navigate to the backend directory:**
   ```bash
   cd back
   ```

2. **Run the setup script:**
   ```bash
   setup_env.bat
   ```

3. **For manual setup (if script fails):**
   ```bash
   # Install dependencies
   composer install

   # Create and configure .env file
   cp .env.example .env  # If .env.example exists, or create manually

   # Generate application key
   php artisan key:generate

   # Run migrations
   php artisan migrate

   # Start the backend server
   php artisan serve
   ```

### Frontend Setup (React)

1. **Navigate to the frontend directory:**
   ```bash
   cd front
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```

## 🔧 Configuration Details

### Database Configuration

The Laravel backend is configured to work with MySQL. Update your `.env` file in the `back` directory:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hulame_rental
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### For Supabase MySQL:
```env
DB_CONNECTION=mysql
DB_HOST=your-supabase-host
DB_PORT=5432
DB_DATABASE=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

### CORS Configuration

The backend is already configured to accept requests from `http://localhost:3000` (React development server).

## 🔄 Integration Features

### Authentication System
- ✅ **Login/Register forms** now connect to Laravel Sanctum authentication
- ✅ **JWT token management** with automatic token refresh
- ✅ **Protected routes** using authentication middleware
- ✅ **User session persistence** across browser refreshes

### API Integration
- ✅ **Centralized API service** (`front/src/services/api.js`)
- ✅ **Error handling** with user-friendly messages
- ✅ **Loading states** for better UX
- ✅ **Automatic token attachment** to all authenticated requests

### Database Models
- ✅ **Users** - Complete user management with profile fields
- ✅ **Rentals** - Rental listings with full CRUD operations
- ✅ **Transactions** - Rental transactions and booking system
- ✅ **Notifications** - User notification system

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user` - Get current user
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{id}/rentals` - Get user's rentals

### Rentals
- `GET /api/rentals` - Get all rentals
- `POST /api/rentals` - Create new rental
- `GET /api/rentals/{id}` - Get specific rental
- `PUT /api/rentals/{id}` - Update rental
- `DELETE /api/rentals/{id}` - Delete rental

### Contact & Transactions
- `POST /api/contact-rental` - Send rental inquiry

## 🎨 Design Preservation

All frontend components maintain their original design:
- ✅ **Login form** - Same UI with backend integration
- ✅ **Register form** - Preserved design with API validation
- ✅ **Form styling** - All CSS classes and animations intact
- ✅ **Error handling** - Styled error messages matching design
- ✅ **Loading states** - Integrated without design changes

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure Laravel backend is running on `http://localhost:8000`
   - Check `back/config/cors.php` includes frontend URL

2. **Database Connection:**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Run `php artisan migrate` to create tables

3. **Authentication Issues:**
   - Clear browser localStorage
   - Restart both frontend and backend servers
   - Check Laravel logs: `tail -f storage/logs/laravel.log`

4. **API Endpoints Not Working:**
   - Verify routes: `php artisan route:list`
   - Check API prefix in `front/src/services/api.js`

### Testing the Integration

1. **Register a new user** - Should create user in database
2. **Login with credentials** - Should receive auth token
3. **Navigate protected routes** - Should maintain authentication
4. **Logout** - Should clear token and redirect

## 📁 File Structure

```
hulame/
├── back/                    # Laravel Backend
│   ├── app/Models/         # Database Models
│   ├── app/Http/Controllers/ # API Controllers
│   ├── routes/api.php      # API Routes
│   ├── config/cors.php     # CORS Configuration
│   └── .env               # Environment Variables
├── front/                  # React Frontend
│   ├── src/services/api.js # API Service Layer
│   ├── src/Context/AuthContext.jsx # Authentication Context
│   └── src/Components/Forms/ # Updated Form Components
└── INTEGRATION_SETUP.md   # This file
```

## 🚀 Next Steps

After successful setup:
1. **Create rental listings** through the frontend
2. **Test user registration/login flow**
3. **Verify database entries** in your MySQL database
4. **Customize Supabase connection** if needed
5. **Deploy to production** when ready

## 📞 Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check Laravel logs for backend errors
3. Verify all services are running
4. Ensure database connection is established 