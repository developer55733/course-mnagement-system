require('dotenv').config();
const mysql = require('mysql2/promise');

// Simple and robust Railway MySQL configuration
const getDatabaseConfig = () => {
  console.log('🔗 Railway Database Configuration:');
  console.log('-------------------------------');
  console.log(`   MYSQLHOST: ${process.env.MYSQLHOST || 'NOT SET'}`);
  console.log(`   MYSQLPORT: ${process.env.MYSQLPORT || '3306'}`);
  console.log(`   MYSQLUSER: ${process.env.MYSQLUSER || 'root'}`);
  console.log(`   MYSQLPASSWORD: ${process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET'}`);
  console.log(`   MYSQLDATABASE: ${process.env.MYSQLDATABASE || 'railway'}`);
  console.log('   SSL: disabled');
  console.log('-------------------------------');

  const user = process.env.MYSQLUSER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQLDATABASE || 'railway';
  const host = process.env.MYSQLHOST || 'tramway.proxy.rlwy.net';
  const port = parseInt(process.env.MYSQLPORT) || 13023;

  console.log('🔗 Using database connection:');
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
};

const dbConfig = getDatabaseConfig();

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Simple connection test function
async function testConnectionWithFallback() {
  console.log('🔍 Testing Database Connection...');
  
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
    return false;
  }
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
    
    throw error;
  }
}

module.exports = { 
  pool, 
  testConnection: testConnectionWithFallback, 
  query,
  config: dbConfig
};
