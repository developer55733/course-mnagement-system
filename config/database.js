require('dotenv').config();
const mysql = require('mysql2/promise');

// Try Railway public URL first, then fallback to private host
const getDatabaseConfig = () => {
  // If Railway public URL is available, use it
  if (process.env.MYSQL_PUBLIC_URL) {
    console.log('🔗 Using Railway Public URL for database connection');
    try {
      // Parse the public URL to extract connection details
      const url = new URL(process.env.MYSQL_PUBLIC_URL.replace('${{MYSQLUSER}}', process.env.MYSQLUSER || 'root')
                                                   .replace('${{MYSQL_ROOT_PASSWORD}}', process.env.MYSQLPASSWORD || '')
                                                   .replace('${{RAILWAY_TCP_PROXY_DOMAIN}}', process.env.RAILWAY_TCP_PROXY_DOMAIN || '')
                                                   .replace('${{RAILWAY_TCP_PROXY_PORT}}', process.env.RAILWAY_TCP_PROXY_PORT || '3306')
                                                   .replace('${{MYSQL_DATABASE}}', process.env.MYSQLDATABASE || 'railway'));
      
      return {
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Remove leading slash
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: { rejectUnauthorized: false },
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      };
    } catch (error) {
      console.log('⚠️  Failed to parse MYSQL_PUBLIC_URL, falling back to individual variables');
    }
  }
  
  // Fallback to individual variables
  console.log('🔗 Using individual environment variables for database connection');
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false },
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  };
};

const dbConfig = getDatabaseConfig();

console.log('🔗 Database Configuration:');
console.log('   Host:', dbConfig.host || 'NOT SET');
console.log('   Port:', dbConfig.port);
console.log('   User:', dbConfig.user || 'NOT SET');
console.log('   Database:', dbConfig.database);
console.log('   SSL:', 'enabled');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Function to test connection with detailed error logging and retry logic
async function testConnection(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Testing database connection... (Attempt ${attempt}/${retries})`);
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully!');
      console.log('   Connection ID:', connection.threadId);
      
      // Test a simple query
      const [rows] = await connection.query('SELECT 1 as test');
      console.log('✅ Database query test passed:', rows[0]);
      
      connection.release();
      console.log('✅ Connection released back to pool');
      
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed (Attempt ${attempt}/${retries}):`);
      console.error('   Error Code:', error.code);
      console.error('   Error Message:', error.message);
      console.error('   Error Number:', error.errno);
      console.error('   SQL State:', error.sqlState);
      
      if (error.code === 'ETIMEDOUT') {
        console.error('   Possible causes:');
        console.error('   - Network connectivity issues');
        console.error('   - Database server is overloaded');
        console.error('   - Firewall blocking connection');
        console.error('   - Wrong host or port');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   Possible causes:');
        console.error('   - Database server is not running');
        console.error('   - Wrong host or port');
        console.error('   - Firewall blocking connection');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('   Possible causes:');
        console.error('   - Wrong username or password');
        console.error('   - User does not have permission');
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.error('   Possible causes:');
        console.error('   - Database does not exist');
        console.error('   - Wrong database name');
      }
      
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  return false;
}

// Enhanced query function with error logging
async function query(sql, params = []) {
  try {
    console.log('🔍 Executing query:', sql);
    if (params.length > 0) {
      console.log('   Parameters:', params);
    }
    
    const [rows] = await pool.query(sql, params);
    console.log('✅ Query executed successfully');
    console.log('   Rows returned:', rows.length);
    
    return rows;
  } catch (error) {
    console.error('❌ Query failed:');
    console.error('   SQL:', sql);
    console.error('   Parameters:', params);
    console.error('   Error Code:', error.code);
    console.error('   Error Message:', error.message);
    console.error('   Error Number:', error.errno);
    console.error('   SQL State:', error.sqlState);
    
    throw error;
  }
}

// Test connection on startup
testConnection().then(success => {
  if (success) {
    console.log('🎉 Database is ready for use');
  } else {
    console.error('⚠️  Database connection failed - application may not work properly');
  }
});

module.exports = { 
  pool, 
  testConnection, 
  query,
  config: dbConfig
};
