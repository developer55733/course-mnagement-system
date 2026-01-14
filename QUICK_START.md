# IT Management System - Quick Start Guide

## What's Changed?
- ✅ **Removed localStorage** - All data now stored in MySQL database
- ✅ **Connected to XAMPP** - MySQL running on port 3306
- ✅ **Server on port 4000** - Express backend API
- ✅ **Well-structured system** - Proper MVC architecture with models, controllers, routes
- ✅ **Full REST API** - All CRUD operations available

## Quick Start (5 Minutes)

### 1. Start XAMPP MySQL
```
1. Open XAMPP Control Panel
2. Click "Start" next to "MySQL"
3. Wait for it to turn GREEN
```

### 2. Create Database
```
1. Go to http://localhost/phpmyadmin
2. Click "SQL" tab
3. Copy & paste contents of: database-setup.sql
4. Click "Go"
```

### 3. Start the Server
```
Double-click: START_SERVER.bat
OR run in terminal:
npm run start
```

### 4. Open the Application
```
Open file: IT management system.html
Or visit: http://localhost:4000
```

### 5. Login with Test Credentials
```
Student:
- Email: john@student.edu
- Password: password123

Admin:
- Email: admin@system.edu  
- Password: admin123
- Check "Login as Admin"
```

## File Structure
```
course/
├── config/          → Database & server configuration
├── controllers/     → Business logic for each entity
├── models/          → Database interaction layer
├── routes/          → API endpoint definitions
├── middleware/      → Error handling & utilities
├── database-setup.sql → Initial database schema
├── server.js        → Express server (port 4000)
├── script.js        → Frontend API calls (no localStorage)
├── IT management system.html → Main UI
└── .env            → Configuration (XAMPP defaults)
```

## Key Features

### Student Features
- Register & Login
- View Course Modules
- Check Test Timetable
- See Lecturer Contacts
- Personal Dashboard

### Admin Features
- All Student Features +
- Add/Edit/Delete Lecturers
- Schedule Tests (Timetable)
- Manage Modules
- View System Statistics
- Configure Settings (Academic Year, Semester, etc.)

## API Endpoints

All data goes through REST API (no localStorage):

```
Base: http://localhost:4000/api/users

Users:     /users, /users/:id, /users/register, /users/login
Lecturers: /lecturers, /lecturers/:id, /lecturers/module/:module
Timetable: /timetable, /timetable/:id, /timetable/module/:module
Modules:   /modules, /modules/:id, /modules/code/:code
Settings:  /settings
```

## Database Tables

| Table | Purpose | Rows |
|-------|---------|------|
| users | Student & admin accounts | 2 (default) |
| lecturers | Lecturer information | 5 (default) |
| timetable | Test schedules | 5 (default) |
| modules | Course modules | 5 (default) |
| settings | System configuration | 1 (default) |

## Troubleshooting

### ❌ "Cannot connect to database"
```
→ Check XAMPP MySQL is running (green in Control Panel)
→ Verify database-setup.sql was executed in phpMyAdmin
→ Check .env file has correct DB credentials
```

### ❌ "Port 4000 already in use"
```
→ Kill existing process: taskkill /PID <PID> /F
→ Or change PORT in .env file
```

### ❌ "Static files not loading"
```
→ Check public/ folder exists
→ Restart server
```

### ❌ "Login not working"
```
→ Check database has users table
→ Verify .env has correct DB_NAME
→ Try default credentials: john@student.edu / password123
```

## Next Steps

1. ✅ Start server and verify it runs on port 4000
2. ✅ Login with test credentials
3. ✅ Try admin features (add lecturers, schedule tests)
4. ✅ Register a new student account
5. ✅ Customize modules, lecturers, settings as needed

## Important Notes

- **All data is persistent** - Stored in MySQL, not lost on refresh
- **Passwords are hashed** - Using bcryptjs for security
- **CORS enabled** - Can be called from different origins
- **Session management** - Uses browser sessionStorage (frontend only)

## For Development

```bash
# Auto-restart server on code changes
npm run dev

# Run in production
npm run start
```

## Need Help?

Check these files:
- `SETUP_XAMPP.md` - Detailed installation guide
- `.env` - Configuration file
- `database-setup.sql` - Database schema
- Browser Console (F12) - JavaScript errors
- Server terminal - Backend errors

---

**Happy coding! The IT Management System is now ready to use with XAMPP and MySQL.** 🚀
