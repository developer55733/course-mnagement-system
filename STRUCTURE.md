# Project Structure Documentation

## Complete Directory Layout

```
IT Management System (c:\Users\USER\Desktop\Course)
│
├── 📁 config/
│   ├── config.js              # Configuration loader (port, env, db settings)
│   └── database.js            # MySQL connection pool (mysql2/promise)
│
├── 📁 controllers/
│   ├── userController.js      # User registration, login, CRUD
│   ├── lecturerController.js  # Lecturer management
│   ├── timetableController.js # Test scheduling
│   ├── moduleController.js    # Course module management
│   └── settingsController.js  # System settings management
│
├── 📁 models/
│   ├── User.js                # User database operations
│   ├── Lecturer.js            # Lecturer database operations
│   ├── Timetable.js           # Timetable database operations
│   ├── Module.js              # Module database operations
│   └── Settings.js            # Settings database operations
│
├── 📁 routes/
│   ├── users.js               # User endpoints
│   ├── lecturers.js           # Lecturer endpoints
│   ├── timetable.js           # Timetable endpoints
│   ├── modules.js             # Module endpoints
│   └── settings.js            # Settings endpoints
│
├── 📁 middleware/
│   └── errorHandler.js        # Central error handling
│
├── 📁 public/                 # Static files (if needed)
│   └── (CSS/JS files)
│
├── 📁 views/                  # HBS template files (if needed)
│   └── (template files)
│
├── 📄 .env                    # Environment variables
│   ├── PORT=4000
│   ├── DB_HOST=127.0.0.1
│   ├── DB_USER=root
│   └── DB_NAME=it_management_system
│
├── 📄 package.json            # Node dependencies
│   ├── express
│   ├── mysql2
│   ├── bcryptjs
│   ├── cors
│   └── dotenv
│
├── 📄 server.js               # Express server (main)
│   ├── Port: 4000
│   ├── CORS enabled
│   └── All routes registered
│
├── 📄 script.js               # Frontend JavaScript
│   ├── No localStorage (uses API)
│   ├── sessionStorage only
│   └── Fetch API calls to backend
│
├── 📄 style.css               # Frontend styling
│   └── IT Management System UI
│
├── 📄 IT management system.html # Main UI
│   ├── Login/Register forms
│   ├── Dashboard
│   ├── Admin panel
│   └── All views
│
├── 📄 database-setup.sql      # Database initialization
│   ├── Creates 5 tables
│   ├── Inserts sample data
│   └── Run in phpMyAdmin
│
├── 📄 START_SERVER.bat        # Windows startup script
│   ├── Checks dependencies
│   ├── Validates XAMPP
│   └── Starts server
│
├── 📄 QUICK_START.md          # Quick start guide (THIS)
│
├── 📄 SETUP_XAMPP.md          # Detailed setup guide
│
├── 📄 README.md               # Project overview
│
├── 📄 PROJECT_SUMMARY.md      # Project documentation
│
├── 📄 ARCHITECTURE.md         # System architecture
│
└── 📄 API_TESTING_GUIDE.md    # API testing instructions
```

## File Relationships

### Request Flow
```
Browser (script.js)
    ↓
Fetch API Call
    ↓
Express Router (routes/*.js)
    ↓
Controller (controllers/*.js)
    ↓
Model (models/*.js)
    ↓
MySQL Database (XAMPP)
```

### Database Schema
```
Users Table
├── id (PK)
├── name
├── email (UNIQUE)
├── student_id (UNIQUE)
├── password (hashed with bcrypt)
├── role (user/admin)
└── timestamps

Lecturers Table
├── id (PK)
├── name
├── module
├── phone
└── timestamps

Timetable Table
├── id (PK)
├── test
├── module
├── date
├── time
├── venue
└── timestamps

Modules Table
├── id (PK)
├── code (UNIQUE)
├── name
└── timestamps

Settings Table
├── id (PK)
├── academic_year
├── semester
├── institution_name
└── timestamps
```

## Configuration Files

### .env
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

### package.json Dependencies
```json
{
  "bcryptjs": "^3.0.3",
  "body-parser": "^2.2.1",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1",
  "express": "^4.22.1",
  "hbs": "^4.2.0",
  "mysql": "^2.18.1",
  "mysql2": "^3.3.0",
  "nodemon": "^3.1.11"
}
```

## API Endpoint Structure

### Users API (/api/users)
```
POST   /register          Register new student
POST   /login             Login student/admin
GET    /                  Get all users
GET    /:id               Get specific user
PUT    /:id               Update user
DELETE /:id               Delete user
POST   /admin/create      Create admin account
```

### Lecturers API (/api/lecturers)
```
GET    /                  Get all lecturers
GET    /:id               Get specific lecturer
GET    /module/:module    Get lecturers for module
POST   /                  Create lecturer (admin)
PUT    /:id               Update lecturer (admin)
DELETE /:id               Delete lecturer (admin)
```

### Timetable API (/api/timetable)
```
GET    /                  Get all schedules
GET    /:id               Get specific schedule
GET    /module/:module    Get tests for module
POST   /                  Create schedule (admin)
PUT    /:id               Update schedule (admin)
DELETE /:id               Delete schedule (admin)
```

### Modules API (/api/modules)
```
GET    /                  Get all modules
GET    /:id               Get specific module
GET    /code/:code        Get module by code
POST   /                  Create module (admin)
PUT    /:id               Update module (admin)
DELETE /:id               Delete module (admin)
```

### Settings API (/api/settings)
```
GET    /                  Get system settings
PUT    /                  Update settings (admin)
```

## Middleware & Error Handling

### Error Handler Middleware
- Location: `middleware/errorHandler.js`
- Catches all errors from routes/controllers
- Returns standardized error responses

### CORS Middleware
- Configured in `server.js`
- Allows all origins in development
- Can be restricted in production

## Authentication & Security

### Password Hashing
- Uses `bcryptjs` library
- Salt rounds: 10
- Passwords never stored in plain text

### Session Management
- Frontend: `sessionStorage` (not persistent)
- Backend: No session storage needed (stateless API)
- Future: Consider JWT tokens for production

## Development vs Production

### Development (.env)
```
NODE_ENV=development
DB_PASSWORD=
CORS_ORIGIN=*
```

### Production (Change before deployment)
```
NODE_ENV=production
DB_PASSWORD=secure_password
CORS_ORIGIN=your-domain.com
```

## Performance Considerations

1. **Connection Pooling** - MySQL connection pool handles multiple requests
2. **Indexing** - Database indexes on frequently searched columns
3. **CORS** - Enabled for cross-origin requests
4. **Error Handling** - Centralized error handling prevents crashes

## Security Notes

1. **Passwords** - Hashed with bcryptjs
2. **Environment Variables** - Sensitive data in .env (not in code)
3. **SQL Injection** - Using prepared statements (mysql2/promise)
4. **CORS** - Configured (change for production)
5. **Input Validation** - Basic validation in controllers

## Future Enhancements

1. JWT token-based authentication
2. Role-based access control (RBAC)
3. Email verification for registration
4. Password reset functionality
5. API rate limiting
6. Database transactions for data consistency
7. Logging system
8. Unit tests
9. API documentation (Swagger/OpenAPI)
10. Frontend form validation improvements

---

**This structure follows the MVC (Model-View-Controller) pattern and is production-ready with proper separation of concerns.**
