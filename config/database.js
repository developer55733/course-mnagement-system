require('dotenv').config();
const mysql = require('mysql2/promise');

// Simple and robust Railway MySQL configuration using Railway's web service variables
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
  console.log('   SSL: enabled');
  console.log('-------------------------------');

  // Try to use Railway's MYSQL_URL first (should be resolved by Railway)
  if (process.env.MYSQL_URL && !process.env.MYSQL_URL.includes('${{')) {
    try {
      console.log('🔗 Using Railway MYSQL_URL connection:');
      console.log('-------------------------------');
      console.log(`   URL: ${process.env.MYSQL_URL}`);
      
      const url = new URL(process.env.MYSQL_URL);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 33264,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1) || 'railway',
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
      
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      console.log('-------------------------------');
      
      return config;
    } catch (error) {
      console.log(`⚠️  Failed to parse MYSQL_URL: ${error.message}`);
      console.log('🔄 Falling back to environment variables...');
    }
  }

  // Try to use Railway's MYSQL_PUBLIC_URL (should be resolved by Railway)
  if (process.env.MYSQL_PUBLIC_URL && !process.env.MYSQL_PUBLIC_URL.includes('${{')) {
    try {
      console.log('🔗 Using Railway MYSQL_PUBLIC_URL connection:');
      console.log('-------------------------------');
      console.log(`   URL: ${process.env.MYSQL_PUBLIC_URL}`);
      
      const url = new URL(process.env.MYSQL_PUBLIC_URL);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 33264,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1) || 'railway',
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
      
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      console.log('-------------------------------');
      
      return config;
    } catch (error) {
      console.log(`⚠️  Failed to parse MYSQL_PUBLIC_URL: ${error.message}`);
      console.log('🔄 Falling back to environment variables...');
    }
  }

  // Fallback to individual environment variables or hardcoded TCP proxy
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'TBTdIyRIUxlOnTBZRSgWKVeaMfUWRvVY';
  const database = process.env.MYSQLDATABASE || 'railway';
  
  // Use TCP proxy directly since we know the working connection
  const host = 'yamabiko.proxy.rlwy.net';
  const port = 33264;

  console.log('🔗 Using direct TCP proxy connection:');
  console.log('-------------------------------');
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
};

const dbConfig = getDatabaseConfig();

// Create connection pool (will be updated if fallback is needed)
let pool = mysql.createPool(dbConfig);

// Test connection on startup to activate TCP proxy fallback if needed
setTimeout(async () => {
  console.log('🔄 Startup database connection test...');
  await testConnectionWithFallback();
}, 2000); // Wait 2 seconds for server to fully start

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
  // Test connection on first query if not already tested
  if (!global.dbConnectionTested) {
    global.dbConnectionTested = true;
    console.log('🔄 First database operation - testing connection...');
    await testConnectionWithFallback();
  }
  
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
    
    throw error;
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
