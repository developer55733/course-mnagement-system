// Dynamic database configuration
// Automatically switches between MySQL and SQLite based on environment

const mysql = require('mysql2/promise');
const sqliteDB = require('./database-sqlite');

let dbInstance = null;

// Determine which database to use
const useSQLite = process.env.DB_TYPE === 'sqlite' || !process.env.DB_HOST;

if (useSQLite) {
  console.log('🗄️  Using SQLite database');
  dbInstance = sqliteDB;
} else {
  console.log('🗄️  Using MySQL database');
  
  // MySQL configuration
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  });

  // Test MySQL connection
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
          console.warn('⚠️  MySQL failed, falling back to SQLite');
          // Fallback to SQLite
          dbInstance = sqliteDB;
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)));
      }
    }
  };

  testConnection();
  dbInstance = pool;
}

// Export unified interface
module.exports = dbInstance;
