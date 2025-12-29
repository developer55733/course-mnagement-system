# XAMPP MySQL Quick Setup Guide for Windows

## Prerequisites Checklist

Before running the server, ensure:

- [ ] XAMPP is installed
- [ ] Node.js is installed
- [ ] MySQL is running in XAMPP Control Panel (green indicator)
- [ ] Database `testdb` and `users` table are created

## Quick Start Commands (PowerShell)

### 1. Verify MySQL Connection

```powershell
# Check if MySQL is running on port 3306
netstat -ano | findstr :3306
```

If you see a line with `:3306`, MySQL is running. Otherwise, start XAMPP MySQL.

### 2. Create Database & Table (One Time Only)

Option A - Using Command Line:
```powershell
# Access MySQL CLI (adjust path to your XAMPP installation)
cd "C:\xampp\mysql\bin"
mysql -u root
```

Then paste this SQL:
```sql
CREATE DATABASE IF NOT EXISTS testdb;
USE testdb;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EXIT;
```

Option B - Using phpMyAdmin (Easier):
1. Open `http://localhost/phpmyadmin` in your browser
2. Go to **SQL** tab
3. Paste the SQL above and click **Execute**

### 3. Configure `.env` (if needed)

Edit `.env` file in the project root. Default values work for XAMPP:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=        # Leave empty for XAMPP default (no password)
DB_NAME=testdb
PORT=4000
NODE_ENV=development
```

**If you set a password for MySQL root**, change `DB_PASSWORD` accordingly.

### 4. Install Dependencies & Run

```powershell
# Install packages (do this once)
npm install

# Start the server
npm start

# For development with auto-restart on file changes:
npm run dev
```

### 5. Test the API

In a new PowerShell window:

```powershell
# Health check
curl http://localhost:4000/api/users/health

# Get all users
curl http://localhost:4000/api/users

# Create a user
curl -X POST http://localhost:4000/api/users `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com"}'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL not running. Start it in XAMPP Control Panel |
| `Error: connect EACCES` | Permission issue. Run PowerShell as Administrator |
| `ER_BAD_DB_ERROR` | Database doesn't exist. Create it using phpMyAdmin SQL |
| `Port 4000 already in use` | Change `PORT` in `.env` to another port like `4001` |
| `npm: command not found` | Node.js not installed. Download from nodejs.org |

## File Structure Overview

```
project/
├── server.js              ← Main entry point
├── config/
│   ├── database.js        ← MySQL connection
│   └── config.js          ← Configuration loader
├── models/User.js         ← Database queries
├── controllers/           ← Business logic
├── routes/users.js        ← API endpoints
├── middleware/            ← Error handling
├── .env                   ← Your local config (do NOT commit)
├── package.json           ← Dependencies
└── README.md              ← Full documentation
```

## Important Notes

✓ **Always keep MySQL running** while the backend is active
✓ **`.env` is local only** — never commit it to git (see `.gitignore`)
✓ **Use `npm run dev`** during development for auto-restart
✓ **Do NOT use `root` account in production** — create a limited user

## Next Steps After Setup

1. Test all endpoints with cURL or Postman
2. Explore the code in `controllers/userController.js`
3. Add more routes and models for other entities
4. Set up authentication (JWT, sessions)
5. Deploy to a web server

