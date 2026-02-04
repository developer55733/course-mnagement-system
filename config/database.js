require('dotenv').config();
const mysql = require('mysql2/promise');

// Use Railway TCP proxy directly - only working method
const getDatabaseConfig = () => {
  // Railway TCP proxy configuration
  const proxyHost = 'tramway.proxy.rlwy.net';
  const proxyPort = '13023';
  
  console.log('🔗 Using Railway TCP proxy for database connection');
  return {
    host: proxyHost,
    port: parseInt(proxyPort),
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
console.log('   SSL:', 'disabled (TCP proxy)');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Simple TCP proxy connection test
async function testTCPProxyConnection(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Testing TCP Proxy connection... (Attempt ${attempt}/${retries})`);
      
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectTimeout: 10000
      });
      
      // Test query
      const [rows] = await connection.query('SELECT 1 as test');
      await connection.end();
      
      console.log('✅ TCP Proxy connection successful!');
      console.log('   Test result:', rows[0]);
      
      return true;
      
    } catch (error) {
      console.error(`❌ TCP Proxy connection failed (Attempt ${attempt}/${retries}):`);
      console.error(`   Error Code: ${error.code}`);
      console.error(`   Error Message: ${error.message}`);
      
      if (attempt < retries) {
        console.log(`⏳ Retrying TCP Proxy in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
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

// Test TCP Proxy connection on startup
testTCPProxyConnection().then(success => {
  if (success) {
    console.log('🎉 Database is ready for use');
    console.log('✅ Connected via TCP Proxy');
    console.log(`✅ Connected to: ${dbConfig.host}:${dbConfig.port}`);
  } else {
    console.error('⚠️  TCP Proxy connection failed - application may not work properly');
    console.error('💡 Check Railway MySQL service status and credentials');
  }
});

module.exports = { 
  pool, 
  testConnection: testTCPProxyConnection, 
  query,
  config: dbConfig
};
