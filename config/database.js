require('dotenv').config();
const mysql = require('mysql2/promise');

// Simple and robust Railway MySQL configuration using Railway's MySQL service
const getDatabaseConfig = () => {
  console.log('🔗 Railway Database Configuration:');
  console.log('-------------------------------');
  console.log(`   MYSQLHOST: ${process.env.MYSQLHOST || 'NOT SET'}`);
  console.log(`   MYSQLPORT: ${process.env.MYSQLPORT || '3306'}`);
  console.log(`   MYSQLUSER: ${process.env.MYSQLUSER || 'root'}`);
  console.log(`   MYSQLPASSWORD: ${process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET'}`);
  console.log(`   MYSQLDATABASE: ${process.env.MYSQLDATABASE || 'railway'}`);
  console.log(`   MySQL.MYSQL_URL: ${process.env.MYSQL_URL || 'NOT SET'}`);
  console.log('   SSL: enabled');
  console.log('-------------------------------');

  // Try to use Railway's MySQL service URL first
  if (process.env.MYSQL_URL) {
    try {
      console.log('🔗 Using Railway MySQL.MYSQL_URL connection:');
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
      console.log(`⚠️  Failed to parse MySQL.MYSQL_URL: ${error.message}`);
      console.log('🔄 Falling back to environment variables...');
    }
  }

  // Fallback to individual environment variables
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST || 'yamabiko.proxy.rlwy.net';
  const port = parseInt(process.env.MYSQLPORT) || 33264;

  console.log('🔗 Using environment variable fallback:');
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
    const [rows] = await connection.query('SELECT 1 as test');
    console.log(`   ✅ Basic connection successful: ${rows[0].test}`);
    
    // Test database operations
    try {
      const [dbRows] = await connection.query('SELECT DATABASE() as current_db');
      console.log(`   ✅ Database operations successful: ${dbRows[0].current_db}`);
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
        const [rows] = await connection.query('SELECT 1 as test');
        console.log(`   ✅ TCP Proxy connection successful: ${rows[0].test}`);
        
        // Test database operations
        try {
          const [dbRows] = await connection.query('SELECT DATABASE() as current_db');
          console.log(`   ✅ TCP Proxy database operations successful: ${dbRows[0].current_db}`);
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
