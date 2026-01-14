const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'it_management_system',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  // Railway MySQL SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});

// Test connection
// Test connection - attempt once but do not terminate the process on failure
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('✗ MySQL connection failed:', err.message);
    console.warn('Continuing without DB connection — API routes will still start. Fix DB and restart server.');
    // Do not exit process: allow server to start and handle DB errors at runtime
  }
})();

module.exports = pool;
