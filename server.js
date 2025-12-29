require('dotenv').config();
const express = require('express');
const path = require('path');

const config = require('./config/config');
const database = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Home page
app.get('/', (req, res) => {
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
    },
  });
});

// API routes
app.use('/api/users', userRoutes);

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
