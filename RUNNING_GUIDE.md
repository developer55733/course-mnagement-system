# IT Management System - Running & Testing Guide

## ✅ Project Setup Complete!

Your IT Management System is now fully configured to run on XAMPP with MySQL database on port 4000.

---

## 🚀 Quick Start in 3 Steps

### Step 1: Start XAMPP MySQL
```
1. Open XAMPP Control Panel
2. Find MySQL in the list
3. Click "Start" button
4. Wait until it shows GREEN status
```

### Step 2: Setup Database
```
1. Open web browser → http://localhost/phpmyadmin
2. Click "SQL" tab at the top
3. Open file: database-setup.sql
4. Copy ALL the SQL code
5. Paste into phpMyAdmin SQL editor
6. Click "Go" button
7. You should see: "Query executed successfully"
```

### Step 3: Start Server
```
Option A (Easiest):
  Double-click: START_SERVER.bat

Option B (Command Line):
  1. Open Command Prompt
  2. Navigate to: c:\Users\USER\Desktop\Course
  3. Type: npm run start
  4. Press Enter
```

---

## 🌐 Access the Application

Once server is running (you see "Server listening on port 4000"):

### **Frontend UI:**
```
http://localhost:4000
Open file: IT management system.html
```

### **API Documentation:**
```
http://localhost:4000/api
Shows all available endpoints
```

### **Database Management:**
```
http://localhost/phpmyadmin
View/edit database tables directly
```

---

## 👥 Login with Test Accounts

### Student Account
```
Email:    john@student.edu
Password: password123
```

### Admin Account
```
Email:    admin@system.edu
Password: admin123
Check:    "Login as Admin" checkbox
```

---

## 🧪 Testing the System

### Test 1: Student Login
```
1. Open IT management system.html
2. Enter: john@student.edu
3. Password: password123
4. Click "Login"
5. Should see: Dashboard with modules, timetable, lecturers
```

### Test 2: Student Registration
```
1. Click "Register" tab
2. Fill in:
   - Full Name: Test User
   - Email: test@student.edu
   - Student ID: IT2024001
   - Password: test123
   - Confirm: test123
3. Click "Register"
4. Should see: "Registration successful!"
5. Login with new account to verify
```

### Test 3: Admin Functions
```
1. Login as admin (check "Login as Admin")
2. Go to Dashboard
3. Should see: Admin Panel tab
4. Try:
   - Add a lecturer
   - Schedule a test
   - Change settings
   - View statistics
5. Verify data appears in database (phpMyAdmin)
```

### Test 4: Database Verification
```
1. Open phpMyAdmin → http://localhost/phpmyadmin
2. Click: it_management_system
3. Click: users table
4. Should see: Your test user
5. Click: lecturers table
6. Should see: Added lecturers
```

---

## 📊 API Endpoint Testing

### Test with Browser/Postman

#### Get All Users
```
GET http://localhost:4000/api/users
Response: List of all users
```

#### Get All Lecturers
```
GET http://localhost:4000/api/lecturers
Response: List of all lecturers
```

#### Get All Modules
```
GET http://localhost:4000/api/modules
Response: List of all modules
```

#### Get All Timetables
```
GET http://localhost:4000/api/timetable
Response: List of all test schedules
```

#### Get Settings
```
GET http://localhost:4000/api/settings
Response: System settings (academic year, semester, etc)
```

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
```
1. Check XAMPP MySQL is RUNNING (green status)
2. Verify database-setup.sql was executed
3. Confirm database name: it_management_system
4. Check .env file has correct credentials
5. Restart XAMPP MySQL
6. Restart server (npm run start)
```

### Problem: "Port 4000 already in use"

**Solution:**
```
Option 1: Stop other applications using port 4000
  
Option 2: Change port in .env
  Edit: .env
  Change: PORT=4000 to PORT=5000
  Restart server

Option 3: Kill process on port 4000
  Command: netstat -ano | findstr :4000
  Kill: taskkill /PID <PID> /F
```

### Problem: "MySQL not found" error

**Solution:**
```
1. Verify XAMPP is installed
2. Start XAMPP Control Panel
3. Click "Start" for MySQL
4. Wait for green status
5. Check .env file:
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
```

### Problem: "Login not working"

**Solution:**
```
1. Check database has users table
   → Go to phpMyAdmin → it_management_system → users
2. Verify test data was inserted
   → Should see: john@student.edu and admin@system.edu
3. Check .env database configuration
4. Look for error in browser console (F12)
5. Check server terminal for error messages
```

### Problem: "Admin panel not showing"

**Solution:**
```
1. Make sure you're logged in
2. Check "Login as Admin" checkbox before login
3. Use admin account: admin@system.edu
4. Refresh page (F5)
5. Check browser console for JavaScript errors
```

---

## 📁 Key Files to Know

### Configuration
```
.env                          Environment variables
config/database.js            MySQL connection
```

### Database
```
database-setup.sql            Create tables & insert data
```

### API Code
```
server.js                      Main server
controllers/                   Business logic
models/                        Database queries
routes/                        API endpoints
```

### Frontend
```
IT management system.html      Main page
script.js                      JavaScript (NO localStorage)
style.css                      CSS styling
```

### Documentation
```
QUICK_START.md                 This guide
SETUP_XAMPP.md                 Detailed setup
STRUCTURE.md                   Project structure
CHECKLIST.md                   Implementation checklist
```

---

## 📋 What's Working

✅ Server on port 4000
✅ MySQL database connected
✅ User authentication
✅ Student registration
✅ Admin features
✅ Lecturer management
✅ Timetable scheduling
✅ Module display
✅ Settings management
✅ Statistics display
✅ No localStorage (all data in database)
✅ REST API fully functional

---

## 🎯 Next Steps

1. **Verify Setup:**
   - Start XAMPP MySQL
   - Setup database
   - Start server
   - Login with test account

2. **Explore Features:**
   - View dashboard
   - Check modules/lecturers/timetable
   - Try registration

3. **Test Admin:**
   - Login as admin
   - Add lecturer
   - Schedule test
   - Change settings

4. **Customize:**
   - Add your own modules
   - Add your own lecturers
   - Set academic year
   - Customize settings

5. **Deploy (Future):**
   - Change .env for production
   - Use production database
   - Update CORS origin
   - Enable HTTPS

---

## 📞 Quick Reference

| Task | Command/Location |
|------|------------------|
| Start Server | `npm run start` or `START_SERVER.bat` |
| View Database | http://localhost/phpmyadmin |
| View API Docs | http://localhost:4000/api |
| View App | Open `IT management system.html` |
| Edit Config | `.env` file |
| Add Database Data | `database-setup.sql` |
| Dev Mode | `npm run dev` (auto-reload) |
| Check Logs | Server terminal window |

---

## 🔐 Important Notes

- **Passwords are hashed** - Never stored as plain text
- **Data is persistent** - All data stored in MySQL database
- **No localStorage** - Uses server API for all data
- **CORS enabled** - Can be accessed from different domains
- **Session storage** - Current user stored in browser sessionStorage

---

## 🎓 Learning Resources

### File to Study
1. `server.js` - Understanding Express server
2. `controllers/*.js` - Business logic patterns
3. `models/*.js` - Database queries
4. `script.js` - Frontend API calls
5. `database-setup.sql` - Database schema

### Concepts to Learn
1. REST API principles
2. MVC architecture
3. MySQL relational databases
4. Node.js/Express framework
5. Async/Await patterns
6. Password hashing (bcryptjs)

---

## ✨ You're All Set!

Your IT Management System is ready to use. All data is now stored in XAMPP MySQL database, there's no localStorage, and the system is well-structured with proper MVC architecture.

**Happy coding! 🚀**

---

**For detailed setup, see: SETUP_XAMPP.md**
**For project structure, see: STRUCTURE.md**
**For what was done, see: CHECKLIST.md**
