# IT Management System - Developer Reference Card

## 📋 Quick Command Reference

### Server Commands
```bash
npm install          # Install dependencies
npm run start        # Start server (production)
npm run dev          # Start with auto-reload (development)
npm list             # Show installed packages
```

### Database Commands
```bash
# Access MySQL from command line
mysql -h 127.0.0.1 -u root

# After connecting
USE it_management_system;
SHOW TABLES;
SELECT * FROM users;
```

---

## 🗄️ Database Schema Quick Reference

### Users Table
```sql
SELECT id, name, email, student_id, role, created_at FROM users;
```

### Add Test User
```sql
INSERT INTO users (name, email, student_id, password, role) 
VALUES ('New User', 'new@test.edu', 'IT2024001', 'hashed_password', 'user');
```

### Lecturers Table
```sql
SELECT id, name, module, phone, created_at FROM lecturers;
```

### Timetable Table
```sql
SELECT id, test, module, date, time, venue FROM timetable ORDER BY date;
```

### Modules Table
```sql
SELECT id, code, name FROM modules;
```

### Settings Table
```sql
SELECT * FROM settings;
UPDATE settings SET academic_year = '2024-2025', semester = 2;
```

---

## 🌐 API Quick Reference

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints
```
POST /users/register
  Body: { name, email, password, confirmPassword, studentId }
  
POST /users/login
  Body: { email, password }
  Response: { id, name, email, studentId, role }

POST /users/admin/create
  Body: { name, email, password, studentId, adminSecret }
```

### User CRUD
```
GET    /users              # All users
GET    /users/:id          # Single user
PUT    /users/:id          # Update user
DELETE /users/:id          # Delete user
```

### Lecturer CRUD
```
GET    /lecturers          # All lecturers
GET    /lecturers/:id      # Single lecturer
GET    /lecturers/module/:module  # By module
POST   /lecturers          # Create
PUT    /lecturers/:id      # Update
DELETE /lecturers/:id      # Delete
```

### Timetable CRUD
```
GET    /timetable          # All schedules
GET    /timetable/:id      # Single entry
GET    /timetable/module/:module # By module
POST   /timetable          # Create
PUT    /timetable/:id      # Update
DELETE /timetable/:id      # Delete
```

### Module CRUD
```
GET    /modules            # All modules
GET    /modules/:id        # Single module
GET    /modules/code/:code # By code
POST   /modules            # Create
PUT    /modules/:id        # Update
DELETE /modules/:id        # Delete
```

### Settings
```
GET    /settings           # Get settings
PUT    /settings           # Update settings
  Body: { academicYear, semester, institutionName }
```

---

## 📁 File Locations

### Configuration
```
.env                         Environment variables
config/config.js             Config loader
config/database.js           MySQL connection
```

### Backend
```
server.js                     Main server
controllers/userController.js             User logic
controllers/lecturerController.js         Lecturer logic
controllers/timetableController.js        Timetable logic
controllers/moduleController.js           Module logic
controllers/settingsController.js         Settings logic
```

### Models
```
models/User.js               User database operations
models/Lecturer.js           Lecturer database operations
models/Timetable.js          Timetable database operations
models/Module.js             Module database operations
models/Settings.js           Settings database operations
```

### Routes
```
routes/users.js              User endpoints
routes/lecturers.js          Lecturer endpoints
routes/timetable.js          Timetable endpoints
routes/modules.js            Module endpoints
routes/settings.js           Settings endpoints
```

### Frontend
```
IT management system.html    Main UI
script.js                    Frontend logic (API calls)
style.css                    Styling
```

### Database & Docs
```
database-setup.sql           Create tables & data
START_SERVER.bat             Windows startup
SETUP_XAMPP.md              Detailed setup
STRUCTURE.md                Project structure
CHECKLIST.md                What was done
RUNNING_GUIDE.md            How to run
```

---

## 🔐 Default Credentials

### Student
```
Email: john@student.edu
StudentID: IT2023001
Password: password123
```

### Admin
```
Email: admin@system.edu
StudentID: ADMIN001
Password: admin123
Admin Secret: admin123
```

---

## 💡 Code Snippets

### API Call in Frontend
```javascript
const response = await fetch(`${API_BASE_URL}/lecturers`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
```

### Create in Database
```javascript
const response = await fetch(`${API_BASE_URL}/lecturers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, module, phone })
});
```

### Update in Database
```javascript
const response = await fetch(`${API_BASE_URL}/lecturers/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, module, phone })
});
```

### Delete from Database
```javascript
const response = await fetch(`${API_BASE_URL}/lecturers/${id}`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
});
```

---

## 🧪 Testing in Postman

### Setup
```
1. Open Postman
2. Create new collection: "IT Management System"
3. Create requests for each endpoint
```

### Example Request
```
Method: GET
URL: http://localhost:4000/api/lecturers
Headers:
  Content-Type: application/json
```

### Example Request with Body
```
Method: POST
URL: http://localhost:4000/api/lecturers
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "name": "Dr. John Doe",
  "module": "IT101",
  "phone": "+1234567890"
}
```

---

## 🔧 Environment Variables

### Development (.env)
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

### Production (Change Before Deploy)
```
PORT=80 or 443
NODE_ENV=production
DB_HOST=your-production-host
DB_PORT=3306
DB_USER=prod-user
DB_PASSWORD=secure-password
DB_NAME=it_management_prod
CORS_ORIGIN=yourdomain.com
ADMIN_SECRET=very-secure-secret
```

---

## 📊 Database Table Structure

### Column Types Reference
```
INT              Integer
VARCHAR(n)       String (n characters)
TEXT             Large text
DATE             Date (YYYY-MM-DD)
TIME             Time (HH:MM:SS)
TIMESTAMP        Date & Time
ENUM             Fixed set of values
UNIQUE           No duplicates
PRIMARY KEY      Unique identifier
FOREIGN KEY      Link to another table
INDEX            Faster searching
```

---

## 🚀 Deployment Checklist

```
Database Setup
□ Create production database
□ Run database-setup.sql
□ Verify all tables created
□ Check test data inserted

Configuration
□ Update .env for production
□ Change DB credentials
□ Change ADMIN_SECRET
□ Set NODE_ENV=production
□ Update CORS_ORIGIN

Server
□ Install dependencies: npm install
□ Test server startup: npm run start
□ Check all endpoints responding
□ Test database connectivity

Security
□ Use HTTPS
□ Update passwords
□ Enable CORS restrictions
□ Set up logging
□ Configure error handling

Performance
□ Enable caching
□ Set up CDN if needed
□ Configure database backups
□ Monitor server resources
□ Test under load

Deployment
□ Deploy code to server
□ Start application
□ Verify functionality
□ Monitor logs
□ Set up monitoring alerts
```

---

## 🎯 Common Tasks

### Add New Endpoint
```javascript
// 1. Create function in controller
// controllers/lecturerController.js
exports.getLecturersByName = async (req, res) => { ... };

// 2. Add route
// routes/lecturers.js
router.get('/name/:name', lecturerController.getLecturersByName);

// 3. Use in frontend
fetch('/api/lecturers/name/John');
```

### Add New Database Column
```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

// Update model to include new field
// Update controller to handle new field
// Update frontend to collect new field
```

### Change Database Schema
```sql
-- View current schema
DESCRIBE users;

-- Add column
ALTER TABLE users ADD COLUMN new_column VARCHAR(100);

-- Drop column (careful!)
ALTER TABLE users DROP COLUMN old_column;

-- Add index
ALTER TABLE users ADD INDEX idx_email (email);

-- Add unique constraint
ALTER TABLE users ADD UNIQUE (email);
```

---

## 🐛 Debugging Tips

### Check Database Connection
```javascript
// In terminal
npm run start
// Look for "MySQL connected successfully" message
```

### Debug API Calls
```javascript
// In browser console (F12)
const response = await fetch('/api/users');
console.log(response);
const data = await response.json();
console.log(data);
```

### View Server Logs
```
// All output appears in terminal where npm run start is running
// Look for errors, warnings, and info messages
```

### Check Database Content
```
1. Open http://localhost/phpmyadmin
2. Select it_management_system
3. View each table
4. See actual data
5. Search/filter as needed
```

---

## 📖 Learning Resources

### Files to Study
```
1. server.js          - Entry point, understand Express setup
2. models/User.js     - Understand database operations
3. controllers/*.js   - Understand business logic
4. routes/*.js        - Understand endpoint structure
5. script.js          - Understand frontend API calls
```

### Concepts
```
1. REST API principles
2. HTTP methods (GET, POST, PUT, DELETE)
3. JSON data format
4. Express middleware
5. MySQL queries
6. Promise/async-await
7. Error handling
8. CORS
```

---

## 🎓 Version Info

```
Node.js:  v14.0 or higher
npm:      v6.0 or higher
Express:  v4.22.1
MySQL:    XAMPP default (MySQL 5.7+)
Database: it_management_system
Port:     4000
```

---

## 📞 Support

### When Something Breaks

1. **Check Server Logs**
   - Terminal where npm run start is running
   - Look for error messages

2. **Check Browser Console**
   - F12 in browser
   - Look for JavaScript errors

3. **Check Database**
   - http://localhost/phpmyadmin
   - Verify tables exist
   - Check data is there

4. **Check Configuration**
   - Verify .env file
   - Check database name
   - Verify port 4000 is available

5. **Restart Everything**
   ```
   1. Stop server (Ctrl+C)
   2. Stop XAMPP MySQL
   3. Start XAMPP MySQL
   4. npm run start
   ```

---

**This is your quick reference guide. Bookmark it!** 📌
