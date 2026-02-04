require('dotenv').config();
const mysql = require('mysql2/promise');

// Alternative Railway MySQL connection strategies using Railway's actual environment variables
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
  console.log('   SSL: disabled');
  console.log('-------------------------------');

  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  
  // Try to parse MYSQL_URL first (Railway's recommended method)
  if (process.env.MYSQL_URL) {
    try {
      console.log('🔗 Using Railway MYSQL_URL connection:');
      console.log('-------------------------------');
      console.log(`   URL: ${process.env.MYSQL_URL}`);
      
      const url = new URL(process.env.MYSQL_URL);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1) || database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        idleTimeout: 300000,
        maxIdle: 10,
        ssl: false
      };
      
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      console.log('-------------------------------');
      
      return config;
    } catch (error) {
      console.log(`⚠️  Failed to parse MYSQL_URL: ${error.message}`);
    }
  }
  
  // Try to parse MYSQL_PUBLIC_URL (Railway's public proxy)
  if (process.env.MYSQL_PUBLIC_URL) {
    try {
      console.log('🔗 Using Railway MYSQL_PUBLIC_URL connection:');
      console.log('-------------------------------');
      console.log(`   URL: ${process.env.MYSQL_PUBLIC_URL}`);
      
      const url = new URL(process.env.MYSQL_PUBLIC_URL);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 13023,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1) || database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        idleTimeout: 300000,
        maxIdle: 10,
        ssl: false
      };
      
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      console.log('-------------------------------');
      
      return config;
    } catch (error) {
      console.log(`⚠️  Failed to parse MYSQL_PUBLIC_URL: ${error.message}`);
    }
  }
  
  // Fallback to direct environment variables
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;
  
  if (host) {
    console.log('🔗 Using direct environment variables:');
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
      connectTimeout: 20000,
      idleTimeout: 300000,
      maxIdle: 10,
      ssl: false
    };
  }
  
  // Last resort - hardcoded Railway proxy
  console.log('🔗 Using hardcoded Railway proxy:');
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
    connectTimeout: 20000,
    idleTimeout: 300000,
    maxIdle: 10,
    ssl: false
  };
};

const dbConfig = getDatabaseConfig();

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Enhanced connection testing with Railway URL parsing
async function testConnectionWithFallback(retries = 1, delay = 5000) {
  console.log('🔍 Testing Railway MySQL Connection...');
  
  // Test the current configuration
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`   Attempt ${attempt}/${retries} with current configuration`);
      console.log(`   Connecting to: ${dbConfig.host}:${dbConfig.port}`);
      
      const connection = await mysql.createConnection(dbConfig);
      
      // Test basic connection
      const [rows] = await connection.query('SELECT 1 as test');
      console.log(`   ✅ Basic connection successful: ${rows[0].test}`);
      
      // Test database operations
      try {
        const [dbRows] = await connection.query('SELECT DATABASE() as current_db');
        console.log(`   ✅ Database operations successful: ${dbRows[0].current_db}`);
        
        // Test table creation
        try {
          await connection.query(`
            CREATE TABLE IF NOT EXISTS connection_test (
              id INT PRIMARY KEY AUTO_INCREMENT,
              test_data VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log(`   ✅ Connection test table ready`);
          
          await connection.query('INSERT INTO connection_test (test_data) VALUES (?)', ['Railway MySQL Test']);
          const [insertRows] = await connection.query('SELECT * FROM connection_test');
          console.log(`   ✅ Database operations working: ${insertRows.length} records`);
          
          await connection.query('DELETE FROM connection_test WHERE test_data = ?', ['Railway MySQL Test']);
        } catch (tableError) {
          console.log(`   ⚠️  Table operations failed: ${tableError.message}`);
        }
      } catch (dbError) {
        console.log(`   ⚠️  Database operations test failed: ${dbError.message}`);
      }
      
      await connection.end();
      
      console.log(`✅ CONNECTION SUCCESSFUL!`);
      console.log(`🎉 Database ready for use`);
      return true;
      
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.code} - ${error.message}`);
      
      if (attempt < retries) {
        console.log(`   ⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log(`❌ ALL ATTEMPTS FAILED`);
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

// Comprehensive connection testing on startup
testConnectionWithFallback().then(success => {
  if (success) {
    console.log('🎉 DATABASE CONNECTION ESTABLISHED SUCCESSFULLY!');
    console.log(`✅ Connected to: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`✅ Database: ${dbConfig.database}`);
    console.log('🚀 Application is ready with full database functionality');
  } else {
    console.log('⚠️  ALL DATABASE CONNECTION STRATEGIES FAILED');
    console.log('💡 Application will start in limited mode without database');
    console.log('💡 Railway MySQL service may need attention in dashboard');
    console.log('💡 Check: MySQL service status, network connectivity, and service configuration');
  }
});

module.exports = { 
  pool, 
  testConnection: testConnectionWithFallback, 
  query,
  config: dbConfig
};
