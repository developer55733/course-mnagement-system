const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Railway MySQL SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});

// Test connection with retry logic
const testConnection = async (retries = 5) => {
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
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)));
    }
  }
};

// Test connection
testConnection();

module.exports = pool;
