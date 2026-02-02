# IT Management System - Railway.app Deployment Guide

## Overview
This is a complete IT Course Management System with a Node.js + Express backend connected to Railway MySQL database.

## Railway.app Deployment

### Prerequisites
1. **Railway Account** - Sign up at https://railway.app/
2. **GitHub Repository** - Push your code to GitHub
3. **Railway MySQL Plugin** - Add MySQL database to your Railway project

### Step 1: Deploy to Railway

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

   **Note:** Railway automatically provides `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` variables when you add the MySQL plugin.

### Step 2: Database Setup

1. **Access Railway MySQL**
   - Go to your MySQL plugin in Railway
   - Click "Open MySQL" to access phpMyAdmin
   - Or use the connection string provided

2. **Run Database Schema**
   - Copy the contents of `database-setup.sql`
   - Execute it in Railway MySQL to create tables and initial data

### Step 3: Verify Deployment

1. **Check Deployment Status**
   - Railway will build and deploy your application
   - Monitor the build logs for any errors

2. **Test API Endpoints**
   - Once deployed, your app will be available at `https://your-app-name.railway.app`
   - Test the health endpoint: `https://your-app-name.railway.app/api`

### Step 4: Access the Application

1. **Main Application**
   - Visit `https://your-app-name.railway.app`
   - The frontend will load and connect to the Railway MySQL database

2. **Admin Panel**
   - Access at `https://your-app-name.railway.app/admin`
   - Use the `ADMIN_SECRET` you configured

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

## Railway-Specific Configuration

### Database Connection
The application is configured to work with Railway MySQL:
- SSL is automatically enabled in production
- Connection pooling is configured for optimal performance
- Graceful fallback if database is temporarily unavailable

### Port Configuration
- Railway automatically assigns a port (usually 8080)
- The application uses the `PORT` environment variable

### Health Checks
- Railway monitors `/api` endpoint for health checks
- The application responds with API documentation

## Troubleshooting

### Build Failures
1. Check the build logs in Railway
2. Ensure all dependencies are in `package.json`
3. Verify the `Procfile` exists and is correct

### Database Connection Issues
1. Verify MySQL plugin is added to the project
2. Check environment variables are set correctly
3. Ensure database schema is created using `database-setup.sql`

### Application Not Starting
1. Check Railway logs for error messages
2. Verify `PORT` environment variable is set
3. Ensure `npm start` command works locally

## Railway Features Used

✅ Automatic Node.js detection
✅ MySQL plugin integration
✅ Environment variable management
✅ SSL database connections
✅ Health checks
✅ Automatic deployments from GitHub
✅ Custom domain support
✅ Log viewing

## Production Considerations

1. **Security**
   - Use a strong `ADMIN_SECRET`
   - Enable HTTPS (Railway provides this automatically)
   - Consider implementing JWT tokens for authentication

2. **Performance**
   - Railway automatically scales your application
   - MySQL connection pooling is configured
   - Static files are served efficiently

3. **Monitoring**
   - Use Railway's built-in monitoring
   - Check application logs regularly
   - Set up alerts for downtime

## Support

For Railway-specific issues:
1. Check Railway documentation: https://docs.railway.app/
2. Review Railway build logs
3. Verify environment variables are correct

For application issues:
1. Check the application logs in Railway
2. Test API endpoints using the provided documentation
3. Verify database schema is correctly created
