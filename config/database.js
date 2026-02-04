require('dotenv').config();
const mysql = require('mysql2/promise');

// Use standard Railway MySQL environment variables
const getDatabaseConfig = () => {
  console.log('🔗 Railway Database Configuration:');
  console.log('-------------------------------');
  console.log(`   Host: ${process.env.MYSQLHOST || 'NOT SET'}`);
  console.log(`   Port: ${process.env.MYSQLPORT || '3306'}`);
  console.log(`   User: ${process.env.MYSQLUSER || 'root'}`);
  console.log(`   Database: ${process.env.MYSQLDATABASE || 'railway'}`);
  console.log('   SSL: disabled');
  console.log('-------------------------------');

  // Use standard Railway MySQL variables
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;

  // Try standard Railway MySQL connection first
  if (host) {
    console.log('🔗 Using Railway MySQL connection:');
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
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      idleTimeout: 300000,
      maxIdle: 10
    };
  }

  // Fallback to hardcoded TCP proxy
  console.log('🔗 Falling back to TCP proxy connection:');
  console.log('-------------------------------');
  console.log('   Host: tramway.proxy.rlwy.net');
  console.log('   Port: 13023');
  console.log(`   User: ${user}`);
  console.log(`   Database: ${database}`);
  console.log('-------------------------------');

  return {
    host: 'tramway.proxy.rlwy.net',
    port: 13023,
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
    idleTimeout: 300000,
    maxIdle: 10
  };
};

const dbConfig = getDatabaseConfig();

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection with fallback
async function testConnectionWithFallback(retries = 1, delay = 500) {
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;
  
  console.log('🔍 Testing Database Connection...');
  
  const connectionMethods = [];
  
  // Try Railway MySQL connection
  if (host) {
    connectionMethods.push({
      name: 'Railway MySQL',
      config: {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
        connectTimeout: 5000
      }
    });
  }
  
  // Try TCP proxy fallback
  connectionMethods.push({
    name: 'TCP Proxy',
    config: {
      host: 'tramway.proxy.rlwy.net',
      port: 13023,
      user: user,
      password: password,
      database: database,
      connectTimeout: 5000
    }
  });
  
  // Test each method
  for (const method of connectionMethods) {
    console.log(`🔗 Testing ${method.name}...`);
    
    try {
      const connection = await mysql.createConnection(method.config);
      const [rows] = await connection.query('SELECT 1 as test');
      await connection.end();
      
      console.log(`✅ ${method.name} connected successfully!`);
      Object.assign(dbConfig, method.config);
      return true;
      
    } catch (error) {
      console.log(`❌ ${method.name} failed: ${error.code}`);
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
testConnectionWithFallback().then(success => {
  if (success) {
    console.log('🎉 Database connected successfully!');
    console.log(`✅ Connected to: ${dbConfig.host}:${dbConfig.port}`);
  } else {
    console.log('⚠️  Database connection failed');
    console.log('💡 Application will start but database features will be unavailable');
    console.log('💡 To fix: Check Railway MySQL service status and restart if needed');
  }
});

module.exports = { 
  pool, 
  testConnection: testConnectionWithFallback, 
  query,
  config: dbConfig
};
