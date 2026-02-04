require('dotenv').config();
const mysql = require('mysql2/promise');

// Robust Railway MySQL connection with valid MySQL2 options
const getDatabaseConfig = () => {
  console.log('🔗 Railway Database Configuration:');
  console.log('-------------------------------');
  console.log(`   Host: ${process.env.MYSQLHOST || 'NOT SET'}`);
  console.log(`   Port: ${process.env.MYSQLPORT || '3306'}`);
  console.log(`   User: ${process.env.MYSQLUSER || 'root'}`);
  console.log(`   Database: ${process.env.MYSQLDATABASE || 'railway'}`);
  console.log('   SSL: disabled');
  console.log('-------------------------------');

  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;

  // Primary: Railway MySQL connection with valid MySQL2 options
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

  // Fallback: TCP proxy connection with valid MySQL2 options
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
    connectTimeout: 10000,
    idleTimeout: 300000,
    maxIdle: 10
  };
};

const dbConfig = getDatabaseConfig();

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Railway-specific database connection testing with valid options
async function testConnectionWithFallback(retries = 2, delay = 3000) {
  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST;
  const port = parseInt(process.env.MYSQLPORT) || 3306;
  
  console.log('🔍 Testing Railway MySQL Connection...');
  
  const connectionStrategies = [];
  
  // Strategy 1: Railway MySQL with database
  if (host) {
    connectionStrategies.push({
      name: 'Railway MySQL',
      config: {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database,
        connectTimeout: 15000,
        ssl: false
      }
    });
  }
  
  // Strategy 2: TCP proxy with database
  connectionStrategies.push({
    name: 'TCP Proxy',
    config: {
      host: 'tramway.proxy.rlwy.net',
      port: 13023,
      user: user,
      password: password,
      database: database,
      connectTimeout: 15000,
      ssl: false
    }
  });
  
  // Test each strategy
  for (const strategy of connectionStrategies) {
    console.log(`🔗 Testing ${strategy.name}...`);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${retries} for ${strategy.name}`);
        
        const connection = await mysql.createConnection(strategy.config);
        
        // Test basic connection
        const [rows] = await connection.query('SELECT 1 as test');
        console.log(`   ✅ Basic connection successful: ${rows[0].test}`);
        
        // Test database operations
        try {
          const [dbRows] = await connection.query('SELECT DATABASE() as current_db');
          console.log(`   ✅ Database operations successful: ${dbRows[0].current_db}`);
          
          // Test table creation (if database exists)
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
        
        // Update global pool config to working strategy
        Object.assign(dbConfig, strategy.config);
        
        console.log(`✅ ${strategy.name} - CONNECTION SUCCESSFUL!`);
        console.log(`🎉 Database ready for use with ${strategy.name}`);
        return true;
        
      } catch (error) {
        console.log(`   ❌ ${strategy.name} failed: ${error.code} - ${error.message}`);
        
        if (attempt < retries) {
          console.log(`   ⏳ Retrying ${strategy.name} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log(`❌ ${strategy.name} - ALL ATTEMPTS FAILED`);
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
