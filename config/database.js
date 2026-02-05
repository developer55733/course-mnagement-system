require('dotenv').config();
const mysql = require('mysql2/promise');

// Simple and robust Railway MySQL configuration - Force TCP proxy for reliability
const getDatabaseConfig = () => {
  console.log('🔗 Railway Database Configuration:');
  console.log('-------------------------------');
  console.log(`   MYSQLHOST: ${process.env.MYSQLHOST || 'NOT SET'}`);
  console.log(`   MYSQLPORT: ${process.env.MYSQLPORT || '3306'}`);
  console.log(`   MYSQLUSER: ${process.env.MYSQLUSER || 'root'}`);
  console.log(`   MYSQLPASSWORD: ${process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET'}`);
  console.log(`   MYSQLDATABASE: ${process.env.MYSQLDATABASE || 'railway'}`);
  console.log(`   MYSQL_URL: ${process.env.MYSQL_URL || 'NOT SET'}`);
  console.log(`   MYSQL_PUBLIC_URL: ${process.env.MYSQL_PUBLIC_URL || 'NOT SET'}`);
  console.log(`   RAILWAY_TCP_PROXY_DOMAIN: ${process.env.RAILWAY_TCP_PROXY_DOMAIN || 'NOT SET'}`);
  console.log(`   RAILWAY_TCP_PROXY_PORT: ${process.env.RAILWAY_TCP_PROXY_PORT || 'NOT SET'}`);
  console.log(`   RAILWAY_PRIVATE_DOMAIN: ${process.env.RAILWAY_PRIVATE_DOMAIN || 'NOT SET'}`);
  console.log('   SSL: enabled');
  console.log('-------------------------------');

  // Force TCP proxy connection for Railway reliability
  console.log('🔗 Using direct TCP proxy connection for reliability:');
  console.log('-------------------------------');

  // Use Railway TCP proxy environment variables if available, otherwise fallback
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'TBTdIyRIUxlOnTBZRSgWKVeaMfUWRvVY';
  const database = process.env.MYSQLDATABASE || 'railway';
  
  // Use Railway TCP proxy environment variables if available, otherwise fallback
  const host = process.env.RAILWAY_TCP_PROXY_DOMAIN || 'yamabiko.proxy.rlwy.net';
  const port = parseInt(process.env.RAILWAY_TCP_PROXY_PORT) || 33264;

  console.log(`   RAILWAY_TCP_PROXY_DOMAIN: ${process.env.RAILWAY_TCP_PROXY_DOMAIN || 'NOT SET'}`);
  console.log(`   RAILWAY_TCP_PROXY_PORT: ${process.env.RAILWAY_TCP_PROXY_PORT || 'NOT SET'}`);
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   User: ${user}`);
  console.log(`   Database: ${database}`);
  console.log('-------------------------------');

  return {
    host: host,
    port: port,
    user: user,
    password: password,
    database: database,
    ssl: { 
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    flags: '+MULTI_STATEMENTS',
    charset: 'utf8mb4',
    timezone: '+00:00',
    connectTimeout: 30000,
    multipleStatements: true,
    // Disable strict mode to handle AUTO_INCREMENT properly
    connectionLimit: 10,
    queueLimit: 0
  };
};

// Get the database configuration
const dbConfig = getDatabaseConfig();

// Create connection pool (will be updated if fallback is needed)
let pool = mysql.createPool(dbConfig);

// Test connection on startup only in development, not production
if (process.env.NODE_ENV !== 'production') {
  setTimeout(async () => {
    console.log('🔄 Startup database connection test...');
    await testConnectionWithFallback();
  }, 2000); // Wait 2 seconds for server to fully start
}

// Simple connection test with automatic fallback
async function testConnectionWithFallback() {
  console.log('🔍 Testing Database Connection...');
  
  // Try current configuration first
  try {
    console.log(`   Connecting to: ${dbConfig.host}:${dbConfig.port}`);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Test basic connection
    const result = await connection.query('SELECT 1 as test');
    const [rows] = result;
    console.log(`   ✅ Basic connection successful: ${rows && rows[0] ? rows[0].test : 'N/A'}`);
    
    // Test database operations
    try {
      const dbResult = await connection.query('SELECT DATABASE() as current_db');
      const [dbRows] = dbResult;
      console.log(`   ✅ Database operations successful: ${dbRows && dbRows[0] ? dbRows[0].current_db : 'N/A'}`);
    } catch (dbError) {
      console.log(`   ⚠️  Database operations test failed: ${dbError.message}`);
    }
    
    await connection.end();
    
    console.log(`✅ CONNECTION SUCCESSFUL!`);
    console.log(`🎉 Database ready for use`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.code} - ${error.message}`);
    
    // If internal connection fails, try TCP proxy
    if (dbConfig.host.includes('railway.internal')) {
      console.log(`🔄 Trying TCP proxy fallback...`);
      
      try {
        const tcpConfig = {
          host: 'yamabiko.proxy.rlwy.net',
          port: 33264,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          waitForConnections: true,
          connectionLimit: 5,
          queueLimit: 0,
          connectTimeout: 30000,
          idleTimeout: 600000,
          maxIdle: 5,
          ssl: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          },
          flags: '+MULTI_STATEMENTS',
          charset: 'utf8mb4'
        };
        
        console.log(`   Connecting to TCP proxy: ${tcpConfig.host}:${tcpConfig.port}`);
        
        const connection = await mysql.createConnection(tcpConfig);
        
        // Test basic connection
        const result = await connection.query('SELECT 1 as test');
        const [rows] = result;
        console.log(`   ✅ TCP Proxy connection successful: ${rows && rows[0] ? rows[0].test : 'N/A'}`);
        
        // Test database operations
        try {
          const dbResult = await connection.query('SELECT DATABASE() as current_db');
          const [dbRows] = dbResult;
          console.log(`   ✅ TCP Proxy database operations successful: ${dbRows && dbRows[0] ? dbRows[0].current_db : 'N/A'}`);
        } catch (dbError) {
          console.log(`   ⚠️  TCP Proxy database operations test failed: ${dbError.message}`);
        }
        
        await connection.end();
        
        // Update dbConfig and recreate pool with TCP proxy
        Object.assign(dbConfig, tcpConfig);
        pool = mysql.createPool(tcpConfig);
        
        console.log(`✅ TCP PROXY CONNECTION SUCCESSFUL!`);
        console.log(`🎉 Database ready for use via TCP proxy`);
        console.log(`🔄 Connection pool updated to use TCP proxy`);
        return true;
        
      } catch (tcpError) {
        console.log(`   ❌ TCP Proxy also failed: ${tcpError.code} - ${tcpError.message}`);
      }
    }
    
    return false;
  }
}

// Enhanced query function with error logging and automatic connection test
async function query(sql, params = []) {
  try {
    console.log('🔍 Executing query:', sql);
    if (params.length > 0) {
      console.log('   Parameters:', params);
    }
    
    const result = await pool.query(sql, params);
    const [rows] = result;
    
    // Handle case where rows might be undefined
    const safeRows = rows || [];
    
    console.log('✅ Query executed successfully');
    console.log('   Rows returned:', safeRows.length);
    
    return safeRows;
  } catch (error) {
    console.error('❌ Query failed:');
    console.error('   SQL:', sql);
    console.error('   Parameters:', params);
    console.error('   Error Code:', error.code);
    console.error('   Error Message:', error.message);
    
    // If AUTO_INCREMENT error, force table recreation
    if (error.code === 'ER_NO_DEFAULT_FOR_FIELD' || (error.message && error.message.includes("Field 'id' doesn't have a default value"))) {
      console.log('🔄 AUTO_INCREMENT error detected, forcing table recreation...');
      console.log(`   Error Code: ${error.code}`);
      console.log(`   Error Message: ${error.message}`);
      try {
        await initializeDatabase();
        console.log('✅ Tables recreated successfully, retrying query...');
        // Retry the original query
        const retryResult = await pool.query(sql, params);
        const [retryRows] = retryResult;
        return retryRows || [];
      } catch (initError) {
        console.error('❌ Failed to recreate tables:', initError.message);
        throw error; // Throw original error if recreation fails
      }
    }
    
    // If table doesn't exist, try to create it
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('🔄 Table does not exist, attempting to create database tables...');
      try {
        await initializeDatabase();
        console.log('✅ Database tables created successfully, retrying query...');
        // Retry the original query
        const retryResult = await pool.query(sql, params);
        const [retryRows] = retryResult;
        return retryRows || [];
      } catch (initError) {
        console.error('❌ Failed to initialize database:', initError.message);
        throw error; // Throw original error if initialization fails
      }
    }
    
    // If connection issues, try fallback
    if (error.code === 'ECONNREFUSED' && !global.fallbackAttempted) {
      global.fallbackAttempted = true;
      console.log('🔄 Connection failed, trying TCP proxy fallback...');
      try {
        await testConnectionWithFallback();
        console.log('✅ Fallback successful, retrying query...');
        const retryResult = await pool.query(sql, params);
        const [retryRows] = retryResult;
        return retryRows || [];
      } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError.message);
        throw error;
      }
    }
    
    throw error;
  }
}

// Initialize database tables
async function initializeDatabase() {
  // First try to recreate tables to fix AUTO_INCREMENT issues
  await recreateTablesWithAutoIncrement();
  
  const createTables = [
    `CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      student_id VARCHAR(50) UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE lecturers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      module VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE timetable (
      id INT AUTO_INCREMENT PRIMARY KEY,
      test VARCHAR(100) NOT NULL,
      module VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      venue VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      academic_year VARCHAR(20),
      semester INT,
      institution_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of createTables) {
    try {
      await pool.query(sql);
      console.log('✅ Table created successfully');
    } catch (error) {
      console.log('⚠️  Table creation warning:', error.message);
    }
  }
  
  // Insert default data if tables are empty
  try {
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = userResult[0];
    if (userCount && userCount[0] && userCount[0].count === 0) {
      console.log('🔄 Inserting default data...');
      
      // Insert default users
      await pool.query(
        `INSERT INTO users (name, email, student_id, password, role) VALUES 
         ('Admin User', 'admin@system.edu', 'ADMIN001', '$2b$10$sqG0niYZXluB1zwBdD4CMO23Tc1VJ5BOh3y8mjHia7l65bENYwEOe', 'admin')`
      );
      
      // Insert default modules
      await pool.query(
        `INSERT INTO modules (code, name) VALUES 
         ('IT101', 'Introduction to Programming'),
         ('IT102', 'Web Development Fundamentals')`
      );
      
      console.log('✅ Default data inserted successfully');
    }
  } catch (error) {
    console.log('⚠️  Default data insertion warning:', error.message);
  }
}

// Recreate tables to fix AUTO_INCREMENT issues
async function recreateTablesWithAutoIncrement() {
  const tables = ['users', 'modules', 'lecturers', 'timetable', 'settings'];
  
  for (const tableName of tables) {
    try {
      console.log(`🔄 Checking table ${tableName}...`);
      
      // Force drop table to ensure clean recreation with proper AUTO_INCREMENT
      await pool.query(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`✅ Dropped table ${tableName} for clean recreation`);
      
    } catch (error) {
      // Table doesn't exist, which is fine
      console.log(`ℹ️  Table ${tableName} doesn't exist yet, will create new`);
    }
  }
}

// Function to get current pool (updated after fallback)
function getPool() {
  return pool;
}

module.exports = { 
  pool: getPool(), 
  testConnection: testConnectionWithFallback, 
  query,
  config: dbConfig
};
