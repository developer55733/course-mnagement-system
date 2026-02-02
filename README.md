# IT Management System - Railway.app Ready



A complete Node.js + Express + MySQL backend system for IT Course Management. Fully organized with models, controllers, routes, and middleware. Ready for deployment on Railway.app.



## Project Structure



```

project-root/

├── config/

│   ├── database.js       (MySQL connection pool with Railway SSL)

│   └── config.js         (Environment & app config)

├── models/

│   ├── User.js           (User model with DB queries)

│   ├── Lecturer.js       (Lecturer model)

│   ├── Timetable.js      (Timetable model)

│   ├── Module.js         (Module model)

│   └── Settings.js       (Settings model)

├── controllers/

│   ├── userController.js (Business logic for users)

│   ├── lecturerController.js (Lecturer CRUD operations)

│   ├── timetableController.js (Test timetable management)

│   ├── moduleController.js (Course modules)

│   └── settingsController.js (System settings)

├── routes/

│   ├── users.js          (API endpoints for users)

│   ├── lecturers.js      (Lecturer routes)

│   ├── timetable.js      (Timetable routes)

│   ├── modules.js        (Module routes)

│   ├── settings.js       (Settings routes)

│   └── admin.js          (Admin routes)

├── middleware/

│   └── errorHandler.js   (Global error handler)

├── public/               (Static files - CSS, JS, images)

├── views/                (HBS templates)

├── railway.json          (Railway deployment configuration)

├── Procfile              (Heroku/Railway process definition)

├── .env.example          (Template for environment variables)

├── .gitignore            (Git ignore rules)

├── package.json          (Dependencies & scripts)

├── server.js             (Main server entry point)

├── database-setup.sql    (Database schema & initial data)

└── RAILWAY_DEPLOYMENT.md (Deployment guide)

```



## Prerequisites



- **Node.js** (v14+) — [Download](https://nodejs.org/)

- **Railway Account** — [Sign up](https://railway.app/)

- **GitHub Repository** — For deployment



## Railway.app Deployment



### 1. Deploy to Railway



1. **Create New Project**

   - Login to Railway.app

   - Click "New Project" → "Deploy from GitHub repo"

   - Select your repository

   - Railway will automatically detect the Node.js application



2. **Add MySQL Database**

   - In your Railway project, click "New" → "Add Plugin"

   - Select "MySQL" from the plugins list

   - Railway will provision a MySQL database



3. **Configure Environment Variables**

   - Go to your project settings → "Variables"

   - Add the following environment variables:



   ```bash

   # Database (Railway provides these automatically)

   DB_HOST=railway

   DB_PORT=3306

   DB_USER=root

   DB_PASSWORD=your_mysql_password

   DB_NAME=railway



   # Server Configuration

   PORT=8080

   NODE_ENV=production



   # Admin Configuration

   ADMIN_SECRET=your_secure_admin_secret_here



   # CORS Configuration

   CORS_ORIGIN=*

   ```



### 2. Database Setup



1. **Access Railway MySQL**

   - Go to your MySQL plugin in Railway

   - Click "Open MySQL" to access phpMyAdmin

   - Or use the connection string provided



2. **Run Database Schema**

   - Copy the contents of `database-setup.sql`

   - Execute it in Railway MySQL to create tables and initial data



### 3. Access the Application



Once deployed, your app will be available at `https://your-app-name.railway.app`



## Local Development



### 1. Install Dependencies



```powershell

npm install

```



### 2. Configure Environment



Copy `.env.example` to `.env` and configure for local development:



```env

PORT=4000

NODE_ENV=development

DB_HOST=127.0.0.1

DB_PORT=3306

DB_USER=root

DB_PASSWORD=

DB_NAME=it_management_system

ADMIN_SECRET=admin123

CORS_ORIGIN=*

```



### 3. Create Local Database



Run the `database-setup.sql` in your local MySQL to create the database schema.



### 4. Start the Server



**Production:**

```powershell

npm start

```



**Development (with auto-restart on file changes):**

```powershell

npm run dev

```



## API Endpoints



### Base URL: `https://your-app-name.railway.app/api`



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

✅ Railway.app Ready

✅ MySQL SSL Support

✅ Environment Variable Configuration



## Railway-Specific Configuration



### Database Connection

- SSL is automatically enabled in production

- Connection pooling is configured for optimal performance

- Graceful fallback if database is temporarily unavailable



### Port Configuration

- Railway automatically assigns a port (usually 8080)

- The application uses the `PORT` environment variable



### Health Checks

- Railway monitors `/api` endpoint for health checks

- The application responds with API documentation



## File Descriptions



| File | Purpose |

|------|---------|

| **server.js** | Main entry point; initializes Express and routes |

| **config/database.js** | MySQL connection pool with Railway SSL support |

| **config/config.js** | Environment variables and app configuration |

| **models/** | Database models with CRUD methods |

| **controllers/** | Business logic handling for all operations |

| **routes/** | API route definitions mapped to controllers |

| **middleware/errorHandler.js** | Global error handling middleware |

| **railway.json** | Railway deployment configuration |

| **Procfile** | Process definition for Railway |

| **database-setup.sql** | Database schema and initial data |

| **RAILWAY_DEPLOYMENT.md** | Detailed deployment guide |



## Troubleshooting



### Railway Deployment Issues

- Check Railway build logs for errors

- Verify environment variables are set correctly

- Ensure MySQL plugin is added to the project



### Database Connection Issues

- Verify MySQL plugin is added to the Railway project

- Check environment variables match Railway MySQL credentials

- Ensure database schema is created using `database-setup.sql`



### Local Development Issues

- Ensure local MySQL is running

- Check `.env` file has correct database credentials

- Run `database-setup.sql` in your local MySQL



## License



MIT

#   c o u r s e - m n a g e m e n t - s y s t e m  
 