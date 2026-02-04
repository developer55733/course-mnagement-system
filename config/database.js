require('dotenv').config();
const mysql = require('mysql2/promise');

// Fallback strategy: try private domain, then TCP proxy, then public URL
const getDatabaseConfig = () => {
  // Method 1: Railway private domain (MYSQLHOST) - preferred
  const privateHost = process.env.MYSQLHOST;
  const privatePort = process.env.MYSQLPORT || '3306';
  
  if (privateHost) {
    console.log('🔗 Attempting Railway private domain connection');
    return {
      host: privateHost,
      port: parseInt(privatePort),
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE || 'railway',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      idleTimeout: 300000,
      maxIdle: 10,
      _method: 'private_domain'
    };
  }
  
  // Method 2: Railway TCP proxy - fallback
  const proxyHost = 'tramway.proxy.rlwy.net';
  const proxyPort = '13023';
  
  console.log('🔗 Falling back to Railway TCP proxy connection');
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
    maxIdle: 10,
    _method: 'tcp_proxy'
  };
};

const dbConfig = getDatabaseConfig();

console.log('🔗 Database Configuration:');
console.log('   Host:', dbConfig.host || 'NOT SET');
console.log('   Port:', dbConfig.port);
console.log('   User:', dbConfig.user || 'NOT SET');
console.log('   Database:', dbConfig.database);
console.log('   Method:', dbConfig._method || 'unknown');
console.log('   SSL:', 'disabled');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Function to test connection with fallback methods
async function testConnectionWithFallback(retries = 3, delay = 1000) {
  const methods = [
    {
      name: 'Private Domain',
      config: {
        host: process.env.MYSQLHOST,
        port: parseInt(process.env.MYSQLPORT || '3306'),
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway',
        connectTimeout: 10000
      }
    },
    {
      name: 'TCP Proxy',
      config: {
        host: 'tramway.proxy.rlwy.net',
        port: 13023,
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway',
        connectTimeout: 10000
      }
    }
  ];

  for (const method of methods) {
    if (!method.config.host) {
      console.log(`⚠️  Skipping ${method.name} - host not available`);
      continue;
    }

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
        dbConfig._method = method.name.toLowerCase().replace(' ', '_');
        
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

// Test connection on startup with fallback methods
testConnectionWithFallback().then(success => {
  if (success) {
    console.log('🎉 Database is ready for use');
    console.log(`✅ Using connection method: ${dbConfig._method}`);
    console.log(`✅ Connected to: ${dbConfig.host}:${dbConfig.port}`);
  } else {
    console.error('⚠️  All database connection methods failed - application may not work properly');
  }
});

module.exports = { 
  pool, 
  testConnection: testConnectionWithFallback, 
  query,
  config: dbConfig
};
