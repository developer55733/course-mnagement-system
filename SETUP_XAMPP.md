# IT Management System - Setup Guide

## Overview
This is a complete IT Course Management System with a Node.js + Express backend connected to XAMPP MySQL database on port 4000.

## System Architecture

```
IT Management System/
├── config/
│   ├── config.js           # Configuration file
│   └── database.js         # MySQL connection pool
├── controllers/
│   ├── userController.js       # User auth & management
│   ├── lecturerController.js   # Lecturer CRUD operations
│   ├── timetableController.js  # Test timetable management
│   ├── moduleController.js     # Course modules
│   └── settingsController.js   # System settings
├── models/
│   ├── User.js             # User model
│   ├── Lecturer.js         # Lecturer model
│   ├── Timetable.js        # Timetable model
│   ├── Module.js           # Module model
│   └── Settings.js         # Settings model
├── routes/
│   ├── users.js            # User routes
│   ├── lecturers.js        # Lecturer routes
│   ├── timetable.js        # Timetable routes
│   ├── modules.js          # Module routes
│   └── settings.js         # Settings routes
├── middleware/
│   └── errorHandler.js     # Error handling middleware
├── public/                 # Static files
├── views/                  # HBS view templates
├── server.js               # Main server file
├── script.js               # Frontend JavaScript
├── style.css               # Frontend CSS
├── IT management system.html   # Main HTML file
├── database-setup.sql      # Database schema & initial data
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md               # This file
```

## Prerequisites

1. **XAMPP** - Download from https://www.apachefriends.org/
2. **Node.js** - Download from https://nodejs.org/
3. **npm** - Comes with Node.js

## Installation Steps

### Step 1: Install XAMPP and Start MySQL

1. Download and install XAMPP
2. Start the XAMPP Control Panel
3. Start **Apache** and **MySQL** services
4. Verify MySQL is running on port 3306

### Step 2: Create Database

1. Open **phpMyAdmin** by visiting `http://localhost/phpmyadmin`
2. Copy the contents of `database-setup.sql`
3. Click on "SQL" tab in phpMyAdmin
4. Paste the SQL code and click "Go"
5. The database `it_management_system` will be created with all tables and initial data

### Step 3: Install Node.js Dependencies

```bash
cd c:\Users\USER\Desktop\Course
npm install
```

This will install:
- express
- mysql2
- bcryptjs
- cors
- dotenv
- nodemon (for development)

### Step 4: Configure Environment Variables

The `.env` file is already configured for XAMPP defaults:

```
PORT=4000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=it_management_system

CORS_ORIGIN=*
ADMIN_SECRET=admin123
```

**Note:** If your XAMPP MySQL has a password, update `DB_PASSWORD` value.

### Step 5: Start the Server

```bash
npm run start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:4000`

You should see:
```
╔════════════════════════════════════════╗
║  Backend Server Started Successfully   ║
╠════════════════════════════════════════╣
║ Port: 4000
║ Environment: development
║ Database: it_management_system@127.0.0.1:3306
║ API: http://localhost:4000
╚════════════════════════════════════════╝
```

### Step 6: Access the Application

1. Open `IT management system.html` in your browser
2. Or visit `http://localhost:4000` (if served from public folder)

## Admin Panel

Access the new admin UI at `http://localhost:4000/admin`.

- Enter the `ADMIN_SECRET` (default `admin123` from `.env`) in the Admin Login box.
- The UI performs admin-protected API calls by sending the `x-admin-secret` header.
- Use the buttons to fetch system summary, list users, and list modules.

## Default Test Credentials

### Student Account
- **Email:** john@student.edu
- **Student ID:** IT2023001
- **Password:** password123

### Admin Account
- **Email:** admin@system.edu
- **Student ID:** ADMIN001
- **Password:** admin123
- **Check "Login as Admin" box** to login as admin

## API Endpoints

### Base URL: `http://localhost:4000/api`

### User Management
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/admin/create` - Create admin account

### Lecturer Management
- `GET /lecturers` - Get all lecturers
- `GET /lecturers/:id` - Get lecturer by ID
- `GET /lecturers/module/:module` - Get lecturers by module
- `POST /lecturers` - Create lecturer (Admin only)
- `PUT /lecturers/:id` - Update lecturer (Admin only)
- `DELETE /lecturers/:id` - Delete lecturer (Admin only)

### Timetable Management
- `GET /timetable` - Get all test schedules
- `GET /timetable/:id` - Get timetable by ID
- `GET /timetable/module/:module` - Get tests by module
- `POST /timetable` - Create test schedule (Admin only)
- `PUT /timetable/:id` - Update test schedule (Admin only)
- `DELETE /timetable/:id` - Delete test schedule (Admin only)

### Module Management
- `GET /modules` - Get all modules
- `GET /modules/:id` - Get module by ID
- `GET /modules/code/:code` - Get module by code
- `POST /modules` - Create module (Admin only)
- `PUT /modules/:id` - Update module (Admin only)
- `DELETE /modules/:id` - Delete module (Admin only)

### Settings Management
- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings (Admin only)

## Data Storage

All data is stored in **XAMPP MySQL database** (not localStorage):

- **users** - User accounts with passwords (bcrypt hashed)
- **lecturers** - Lecturer information
- **timetable** - Test schedules
- **modules** - Course modules
- **settings** - System settings

## Features

✅ User Authentication (Students & Admins)
✅ Student Registration
✅ Course Modules Display
✅ Test Timetable Management
✅ Lecturer Information
✅ Admin Dashboard
✅ System Settings Management
✅ Student Statistics
✅ Password Encryption (bcrypt)
✅ Session Management
✅ CORS Enabled
✅ Full REST API

## Database Tables

### users
- id (Primary Key)
- name
- email (Unique)
- student_id (Unique)
- password (hashed)
- role (user/admin)
- created_at
- updated_at

### lecturers
- id (Primary Key)
- name
- module
- phone
- created_at
- updated_at

### timetable
- id (Primary Key)
- test
- module
- date
- time
- venue
- created_at
- updated_at

### modules
- id (Primary Key)
- code (Unique)
- name
- created_at
- updated_at

### settings
- id (Primary Key)
- academic_year
- semester
- institution_name
- created_at
- updated_at

## Troubleshooting

### Port 4000 already in use
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### MySQL Connection Error
1. Verify XAMPP MySQL is running
2. Check DB credentials in `.env`
3. Ensure database `it_management_system` exists
4. Run `database-setup.sql` again if needed

### CORS Errors
- Verify CORS_ORIGIN in `.env` is set to `*`
- Check that server is running on correct port

### Static Files Not Loading
- Ensure `public` folder exists
- Place CSS/JS files in `public` folder

## Development Notes

- Frontend uses vanilla JavaScript with API calls
- No localStorage used - all data persists in MySQL
- Passwords are hashed with bcrypt
- CORS enabled for development
- Error handling middleware included
- Session management via sessionStorage (frontend only)

## Production Deployment

For production:
1. Update `.env` with production database credentials
2. Set `NODE_ENV=production`
3. Use environment variables from hosting provider
4. Enable HTTPS
5. Implement proper authentication/JWT tokens
6. Add rate limiting
7. Use environment-specific CORS origins
8. Add database backups

## Support

For issues or questions, check:
1. Console errors (F12 in browser)
2. Server logs in terminal
3. Database tables in phpMyAdmin
4. .env configuration
