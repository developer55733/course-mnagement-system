require('dotenv').config();
const mysql = require('mysql2/promise');

// Use Railway private domain as specified
const getDatabaseConfig = () => {
  // Use Railway private domain (MYSQLHOST) and port 3306
  const host = process.env.MYSQLHOST;
  const port = process.env.MYSQLPORT || '3306';
  
  if (!host) {
    console.error('❌ MYSQLHOST environment variable is not set!');
    process.exit(1);
  }
  
  console.log('🔗 Using Railway private domain for database connection');
  return {
    host: host,
    port: parseInt(port),
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    idleTimeout: 300000,
    maxIdle: 10
  };
};

const dbConfig = getDatabaseConfig();

console.log('🔗 Database Configuration:');
console.log('   Host:', dbConfig.host || 'NOT SET');
console.log('   Port:', dbConfig.port);
console.log('   User:', dbConfig.user || 'NOT SET');
console.log('   Database:', dbConfig.database);
console.log('   SSL:', 'disabled (Railway private domain)');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Function to test connection with detailed error logging and retry logic
async function testConnection(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Testing database connection... (Attempt ${attempt}/${retries})`);
      
      // Create a fresh connection for each attempt
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectTimeout: 10000
      });
      
      console.log('✅ Database connected successfully!');
      console.log('   Connection ID:', connection.threadId);
      
      // Test a simple query
      const [rows] = await connection.query('SELECT 1 as test');
      console.log('✅ Database query test passed:', rows[0]);
      
      await connection.end();
      console.log('✅ Connection closed successfully');
      
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
      } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('   Possible causes:');
        console.error('   - Network interruption');
        console.error('   - Database server restarted');
        console.error('   - Connection timeout');
        console.error('   - SSL handshake issues');
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
