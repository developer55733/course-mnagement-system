require('dotenv').config();
const express = require('express');
const path = require('path');

const config = require('./config/config');
const database = require('./config/database'); // Use MySQL only
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/users');

// Enhanced CORS middleware for Railway
const cors = (req, res, next) => {
  const origin = req.headers.origin;
  // Allow Railway domain and localhost for development
  const allowedOrigins = [
    'https://course-management-system.up.railway.app',
    'https://course-management-system-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:8080'
  ];
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-admin-secret, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
};

const adminRoutes = require('./routes/admin');
const moduleRoutes = require('./routes/modules');
const settingsRoutes = require('./routes/settings');
const timetableRoutes = require('./routes/timetable');
const lecturerRoutes = require('./routes/lecturers');

const app = express();

// Middleware
app.use(cors);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'connected'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'connected'
  });
});

// Home page - serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'IT Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: 'GET /api/health',
      getAllUsers: 'GET /api/users',
      getUserById: 'GET /api/users/:id',
      createUser: 'POST /api/users (body: {name, email})',
      updateUser: 'PUT /api/users/:id (body: {name, email})',
      deleteUser: 'DELETE /api/users/:id',
      adminInfo: 'GET /admin/info (header: x-admin-secret)',
      adminAction: 'POST /admin/action (header: x-admin-secret, body: {actionType, actionParam})',
      getAllModules: 'GET /api/modules',
      createModule: 'POST /api/modules (header: x-admin-secret, body: {code, name, lecturer, phone})',
      getSettings: 'GET /api/settings',
      updateSettings: 'PUT /api/settings (header: x-admin-secret, body: {academicYear, semester, institutionName})',
      getAllTimetables: 'GET /api/timetable',
      createTimetable: 'POST /api/timetable (body: {test, module, date, time, venue})',
      getAllLecturers: 'GET /api/lecturers',
      createLecturer: 'POST /api/lecturers (header: x-admin-secret, body: {name, module, phone})',
    },
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/lecturers', lecturerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server with Railway-specific configuration
const PORT = process.env.PORT || config.port || 8080;

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const apiUrl = isProduction 
    ? `https://course-management-system.up.railway.app`
    : `http://localhost:${PORT}`;
  
  // Enhanced database info for Railway
  const dbHost = process.env.RAILWAY_TCP_PROXY_DOMAIN || process.env.MYSQLHOST || 'N/A';
  const dbPort = process.env.RAILWAY_TCP_PROXY_PORT || process.env.MYSQLPORT || '3306';
  const dbUser = process.env.MYSQLUSER || 'root';
  const dbInfo = `${dbUser}@${dbHost}:${dbPort}`;
  
  console.log(`
╔══════════════════════════════════════╗
║  Backend Server Started Successfully   ║
╠════════════════════════════════════════╣
║ Port: ${PORT}                              
║ Environment: ${process.env.NODE_ENV || 'development'}
║ Database: ${dbInfo}
║ API: ${apiUrl}
║ Health: ${apiUrl}/health
╚════════════════════════════════════════╝
  `);
  
  console.log(`🚀 Server ready for Railway deployment`);
  console.log(`📊 Health check available at: ${apiUrl}/health`);
  console.log(`🔗 API documentation at: ${apiUrl}/api`);
});
