# XAMPP MySQL Backend System

A complete Node.js + Express + MySQL backend system for communicating with XAMPP-hosted databases. Fully organized with models, controllers, routes, and middleware.

## Project Structure

```
project-root/
├── config/
│   ├── database.js       (MySQL connection pool)
│   └── config.js         (Environment & app config)
├── models/
│   └── User.js           (User model with DB queries)
├── controllers/
│   └── userController.js (Business logic for users)
├── routes/
│   └── users.js          (API endpoints for users)
├── middleware/
│   └── errorHandler.js   (Global error handler)
├── public/               (Static files - CSS, JS, images)
├── views/                (HBS templates)
├── .env                  (Environment variables - local)
├── .env.example          (Template for .env)
├── .gitignore            (Git ignore rules)
├── package.json          (Dependencies & scripts)
├── server.js             (Main server entry point)
└── README.md             (This file)
```

## Prerequisites

- **Node.js** (v14+) — [Download](https://nodejs.org/)
- **XAMPP** with MySQL running — [Download](https://www.apachefriends.org/)

## Setup Instructions

### 1. Start XAMPP MySQL

Open XAMPP Control Panel and click **Start** next to **MySQL**.

### 2. Create Database & Table

Open phpMyAdmin at `http://localhost/phpmyadmin` and run this SQL:

```sql
CREATE DATABASE IF NOT EXISTS testdb;
USE testdb;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Configure Environment

Edit `.env` with your XAMPP credentials (defaults shown below):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=testdb
PORT=4000
NODE_ENV=development
```

**If your XAMPP MySQL has a password**, set `DB_PASSWORD` in `.env`.

### 4. Install Dependencies

```powershell
npm install
```

### 5. Start the Server

**Production:**
```powershell
npm start
```

**Development (with auto-restart on file changes):**
```powershell
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║  Backend Server Started Successfully   ║
╠════════════════════════════════════════╣
║ Port: 4000
║ Environment: development
║ Database: testdb@127.0.0.1:3306
║ API: http://localhost:4000
╚════════════════════════════════════════╝
```

## API Endpoints

### Health Check
```http
GET /api/users/health
```
Response: `{ "success": true, "status": "healthy", "db": "connected" }`

### Get All Users
```http
GET /api/users
```
Response: `{ "success": true, "data": [ { "id": 1, "name": "Alice", "email": "alice@test.com", ... } ] }`

### Get User by ID
```http
GET /api/users/1
```

### Create User
```http
POST /api/users
Content-Type: application/json

{ "name": "John", "email": "john@test.com" }
```

### Update User
```http
PUT /api/users/1
Content-Type: application/json

{ "name": "John Doe", "email": "john.doe@test.com" }
```

### Delete User
```http
DELETE /api/users/1
```

## Testing with cURL or Postman

### cURL Example:
```bash
# Health check
curl http://localhost:4000/api/users/health

# Get all users
curl http://localhost:4000/api/users

# Create user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice\",\"email\":\"alice@test.com\"}"

# Get user by ID
curl http://localhost:4000/api/users/1

# Update user
curl -X PUT http://localhost:4000/api/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Updated\",\"email\":\"alice.new@test.com\"}"

# Delete user
curl -X DELETE http://localhost:4000/api/users/1
```

## File Descriptions

| File | Purpose |
|------|---------|
| **server.js** | Main entry point; initializes Express and routes |
| **config/database.js** | MySQL connection pool setup and testing |
| **config/config.js** | Environment variables and app configuration |
| **models/User.js** | User database model with CRUD methods |
| **controllers/userController.js** | Business logic handling for user operations |
| **routes/users.js** | API route definitions mapped to controllers |
| **middleware/errorHandler.js** | Global error handling middleware |
| **.env** | Local environment variables (do NOT commit) |
| **.gitignore** | Files to exclude from git |

## Troubleshooting

### "ECONNREFUSED" - MySQL Connection Failed
- **Check:** XAMPP MySQL is running (green indicator in XAMPP Control Panel)
- **Check:** `.env` has correct `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- **Restart:** Stop and start MySQL in XAMPP Control Panel

### "Database doesn't exist"
- Run the SQL commands above in phpMyAdmin to create `testdb` and `users` table
- Verify `DB_NAME` in `.env` matches the database name

### "Port 4000 already in use"
- Change `PORT` in `.env` to an available port (e.g., `4001`, `5000`)
- Or kill the process: `netstat -ano | findstr :4000` then `taskkill /PID <PID> /F`

### Module not found errors
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again

## Next Steps

- Add authentication (JWT, sessions)
- Add validation middleware for request data
- Create more models (Products, Orders, etc.)
- Add database migrations
- Deploy to a production server
- Add unit/integration tests

## License

MIT
