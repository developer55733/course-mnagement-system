require('dotenv').config();
const express = require('express');
const path = require('path');

const config = require('./config/config');
const database = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/users');

// CORS middleware
const cors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-admin-secret');
  
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Home page - serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'XAMPP MySQL Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/users/health',
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

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Backend Server Started Successfully   ║
╠════════════════════════════════════════╣
║ Port: ${PORT}                              
║ Environment: ${config.env}
║ Database: ${config.db.database}@${config.db.host}:${config.db.port}
║ API: http://localhost:${PORT}
╚════════════════════════════════════════╝
  `);
});
