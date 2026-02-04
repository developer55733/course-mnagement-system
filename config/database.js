require('dotenv').config();
const mysql = require('mysql2/promise');

// Use standard Railway MySQL environment variables
const getDatabaseConfig = () => {
  console.log('🔗 Using standard Railway MySQL environment variables');
  console.log('🔗 Environment variables check:');
  console.log('   MYSQLUSER:', process.env.MYSQLUSER || 'NOT SET');
  console.log('   MYSQLPASSWORD:', process.env.MYSQLPASSWORD || 'NOT SET');
  console.log('   MYSQLDATABASE:', process.env.MYSQLDATABASE || 'NOT SET');
  console.log('   MYSQLHOST:', process.env.MYSQLHOST || 'NOT SET');
  console.log('   MYSQLPORT:', process.env.MYSQLPORT || 'NOT SET');
  console.log('   MYSQL_ROOT_PASSWORD:', process.env.MYSQL_ROOT_PASSWORD ? 'SET' : 'NOT SET');
  
  // Use standard Railway MySQL variables
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;
  
  // Try standard Railway MySQL connection first
  if (host) {
    console.log('🔗 Using Railway MySQL connection');
    return {
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      idleTimeout: 300000,
      maxIdle: 10
    };
  }
  
  // Fallback to hardcoded TCP proxy
  console.log('🔗 Falling back to hardcoded TCP proxy connection');
  return {
    host: 'tramway.proxy.rlwy.net',
    port: 13023,
    user: user,
    password: password,
    database: database,
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
console.log('   SSL:', 'disabled');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test both private domain and TCP proxy with fallback
async function testConnectionWithFallback(retries = 3, delay = 1000) {
  // Use standard Railway MySQL variables
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;
  
  const connectionMethods = [];
  
  // Try standard Railway MySQL connection first
  if (host) {
    connectionMethods.push({
      name: 'Railway MySQL',
      config: {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
        connectTimeout: 10000
      }
    });
  }
  
  // Try hardcoded TCP proxy as fallback
  connectionMethods.push({
    name: 'TCP Proxy',
    config: {
      host: 'tramway.proxy.rlwy.net',
      port: 13023,
      user: user,
      password: password,
      database: database,
      connectTimeout: 10000
    }
  });
  
  // Try each connection method
  for (const method of connectionMethods) {
    console.log(`🔗 Testing ${method.name} connection...`);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${retries} for ${method.name}`);
        
        const connection = await mysql.createConnection(method.config);
        
        // Test query
        const [rows] = await connection.query('SELECT 1 as test');
        await connection.end();
        
        console.log(`✅ ${method.name} connection successful!`);
        console.log(`   Test result:`, rows[0]);
        
        // Update global pool config to working method
        Object.assign(dbConfig, method.config);
        
        return true;
        
      } catch (error) {
        console.error(`❌ ${method.name} connection failed (Attempt ${attempt}/${retries}):`);
        console.error(`   Error Code: ${error.code}`);
        console.error(`   Error Message: ${error.message}`);
        
        if (attempt < retries) {
          console.log(`   ⏳ Retrying ${method.name} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
    
    console.log(`❌ ${method.name} failed after ${retries} attempts`);
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

// Test connection with fallback on startup
testConnectionWithFallback().then(success => {
  if (success) {
    console.log('🎉 Database is ready for use');
    console.log('✅ Connected successfully');
    console.log(`✅ Connected to: ${dbConfig.host}:${dbConfig.port}`);
  } else {
    console.error('⚠️  All database connection methods failed - application may not work properly');
    console.error('💡 Troubleshooting steps:');
    console.error('   1. Check Railway MySQL service status');
    console.error('   2. Verify MYSQL credentials in Railway dashboard');
    console.error('   3. Ensure TCP proxy is enabled for MySQL service');
    console.error('   4. Check Railway MySQL service logs');
    console.error('   5. Try restarting MySQL service in Railway');
  }
});

module.exports = { 
  pool, 
  testConnection: testConnectionWithFallback, 
  query,
  config: dbConfig
};
