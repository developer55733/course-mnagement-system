const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'railway',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  // Railway MySQL SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    require: true
  } : false,
  // Connection retry settings
  reconnect: true,
  idleTimeout: 300000,
});

// Test connection with retry logic
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log('✓ MySQL connected successfully');
      conn.release();
      return true;
    } catch (err) {
      console.error(`✗ MySQL connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) {
        console.warn('Continuing without DB connection — API routes will still start. Fix DB and restart server.');
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

// Test connection
testConnection();

module.exports = pool;
