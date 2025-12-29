# Project Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/Postman)                │
│                      GET|POST|PUT|DELETE                        │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
          ┌──────────────────┐        ┌──────────────────┐
          │   HTTP Server    │        │   HTTP Server    │
          │   (Express.js)   │        │   (Express.js)   │
          └────────┬─────────┘        └────────┬─────────┘
                   │                           │
                   └───────────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
          ┌──────────────────┐        ┌──────────────────┐
          │  Route Handler   │        │  Route Handler   │
          │  (/api/users)    │        │  (/api/health)   │
          └────────┬─────────┘        └────────┬─────────┘
                   │                           │
                   └───────────────┬───────────┘
                                   │
                                   ▼
          ┌─────────────────────────────────────┐
          │       Controller Layer               │
          │  (userController.js)                │
          │  - getAllUsers()                    │
          │  - getUserById()                    │
          │  - createUser()                     │
          │  - updateUser()                     │
          │  - deleteUser()                     │
          │  - healthCheck()                    │
          └────────────┬────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────────┐
          │        Model Layer                   │
          │  (User.js)                          │
          │  Database CRUD Operations           │
          │  - User.getAll()                    │
          │  - User.getById(id)                 │
          │  - User.create(name, email)         │
          │  - User.update(id, name, email)    │
          │  - User.delete(id)                  │
          └────────────┬────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────────┐
          │     Database Connection              │
          │  (config/database.js)               │
          │  MySQL2 Connection Pool             │
          │  Host: 127.0.0.1:3306               │
          │  DB: testdb                         │
          └────────────┬────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────────┐
          │      XAMPP MySQL Server              │
          │                                      │
          │  Table: users                       │
          │  ├─ id (INT, PK)                    │
          │  ├─ name (VARCHAR)                  │
          │  ├─ email (VARCHAR, UNIQUE)         │
          │  └─ created_at (TIMESTAMP)          │
          └─────────────────────────────────────┘
```

## Request Flow Example: GET /api/users

```
1. Client Request
   GET http://localhost:4000/api/users

2. Express Server (server.js)
   Routes request to /api/users

3. Route Handler (routes/users.js)
   Matches GET request
   Calls: userController.getAllUsers()

4. Controller (controllers/userController.js)
   Receives request
   Calls: User.getAll()
   Formats response with { success: true, data: [...] }

5. Model (models/User.js)
   Executes SQL: SELECT id, name, email, created_at FROM users
   Returns rows from database

6. Response to Client
   Status: 200 OK
   Body: {
     "success": true,
     "data": [
       { "id": 1, "name": "Alice", "email": "alice@test.com", ... },
       { "id": 2, "name": "Bob", "email": "bob@test.com", ... }
     ]
   }
```

## Folder Structure with Responsibilities

```
project-root/
│
├── server.js
│   └─ Entry point, initializes Express, loads middleware
│
├── config/
│   ├─ database.js      (MySQL connection pool, logging)
│   └─ config.js        (Centralized configuration from .env)
│
├── models/
│   └─ User.js          (Database queries: CRUD operations)
│
├── controllers/
│   └─ userController.js (Business logic, request validation)
│
├── routes/
│   └─ users.js         (API endpoint definitions)
│
├── middleware/
│   └─ errorHandler.js  (Global error handling)
│
├── public/             (Static assets: CSS, JS, images)
├── views/              (HBS templates for rendering)
│
├── .env                (Local environment (GITIGNORED))
├── .env.example        (Template for .env)
├── .gitignore          (Git ignore rules)
├── package.json        (Dependencies & scripts)
├── README.md           (Full documentation)
├── SETUP_GUIDE.md      (Quick setup instructions)
└── ARCHITECTURE.md     (This file)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Server** | Express.js | HTTP request handling & routing |
| **Database** | MySQL (XAMPP) | Data persistence |
| **Driver** | mysql2/promise | MySQL connection with promises |
| **Node Runtime** | Node.js | JavaScript runtime |
| **Dev Tool** | Nodemon | Auto-restart on file changes |
| **Config** | dotenv | Environment variable management |
| **Templating** | HBS | HTML template engine (optional) |

## Security Features Implemented

✓ **Input Validation** - Controller validates required fields
✓ **Prepared Statements** - All SQL uses parameterized queries (prevent SQL injection)
✓ **Error Handling** - Global error handler logs and returns safe error messages
✓ **Connection Pooling** - Efficient database resource management
✓ **CORS Ready** - Can be easily configured for cross-origin requests
✓ **Environment Secrets** - Credentials stored in .env (not in code)

## Scalability Considerations

- **Connection Pool** (10 connections default) - Can increase in `config/database.js`
- **Route Separation** - Easy to add new route files (products.js, orders.js, etc.)
- **Controller Pattern** - Business logic separated from routing
- **Model Layer** - Centralized DB queries for consistency
- **Middleware Stack** - Can add authentication, logging, rate limiting

## Error Handling Flow

```
Request
  │
  ├─ Route Handler
  │   │
  │   ├─ Controller
  │   │   │
  │   │   ├─ Model (throws error if DB fails)
  │   │   └─ Catch error → return to Controller
  │   │
  │   └─ Catch error → return to Route Handler
  │
  └─ Error Handler Middleware
      └─ Format and return error response to Client
```

## Next Steps to Extend

1. **Add More Models** - Product.js, Order.js, Category.js
2. **Add Authentication** - JWT tokens, session management
3. **Add Validation** - Express-validator for input validation
4. **Add Logging** - winston or morgan for request/error logging
5. **Add Tests** - Jest, Mocha for unit/integration tests
6. **Add Migrations** - db-migrate or Flyway for schema versioning
7. **Add Caching** - Redis for performance
8. **Dockerize** - Create Dockerfile for containerization

