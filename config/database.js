require('dotenv').config();

const mysql = require('mysql2/promise');



// Simple and robust Railway MySQL configuration - Force TCP proxy for reliability

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

  console.log(`   RAILWAY_TCP_PROXY_DOMAIN: ${process.env.RAILWAY_TCP_PROXY_DOMAIN || 'NOT SET'}`);

  console.log(`   RAILWAY_TCP_PROXY_PORT: ${process.env.RAILWAY_TCP_PROXY_PORT || 'NOT SET'}`);

  console.log(`   RAILWAY_PRIVATE_DOMAIN: ${process.env.RAILWAY_PRIVATE_DOMAIN || 'NOT SET'}`);

  console.log('   SSL: enabled');

  console.log('-------------------------------');



  // Force TCP proxy connection for Railway reliability

  console.log('🔗 Using direct TCP proxy connection for reliability:');

  console.log('-------------------------------');



  // Use Railway TCP proxy environment variables if available, otherwise fallback

  const user = process.env.MYSQLUSER || 'root';

  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'TBTdIyRIUxlOnTBZRSgWKVeaMfUWRvVY';

  const database = process.env.MYSQLDATABASE || 'railway';

  

  // Use Railway TCP proxy environment variables if available, otherwise fallback

  const host = process.env.RAILWAY_TCP_PROXY_DOMAIN || 'yamabiko.proxy.rlwy.net';

  const port = parseInt(process.env.RAILWAY_TCP_PROXY_PORT) || 33264;



  console.log(`   RAILWAY_TCP_PROXY_DOMAIN: ${process.env.RAILWAY_TCP_PROXY_DOMAIN || 'NOT SET'}`);

  console.log(`   RAILWAY_TCP_PROXY_PORT: ${process.env.RAILWAY_TCP_PROXY_PORT || 'NOT SET'}`);

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

    ssl: { 

      rejectUnauthorized: false,

      minVersion: 'TLSv1.2'

    },

    flags: '+MULTI_STATEMENTS',

    charset: 'utf8mb4',

    timezone: '+00:00',

    connectTimeout: 30000,

    multipleStatements: true,

    // Disable strict mode to handle AUTO_INCREMENT properly

    connectionLimit: 10,

    queueLimit: 0

  };

};



// Get the database configuration

const dbConfig = getDatabaseConfig();



// Create connection pool (will be updated if fallback is needed)

let pool = mysql.createPool(dbConfig);



// Test connection on startup only in development, not production

if (process.env.NODE_ENV !== 'production') {

  setTimeout(async () => {

    console.log('🔄 Startup database connection test...');

    await testConnectionWithFallback();

  }, 2000); // Wait 2 seconds for server to fully start

}



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

    

    // Return in mysql2 format: [rows, fields] for compatibility with models

    return [safeRows, []];

  } catch (error) {

    console.error('❌ Query failed:');

    console.error('   SQL:', sql);

    console.error('   Parameters:', params);

    console.error('   Error Code:', error.code);

    console.error('   Error Message:', error.message);

    

    // If AUTO_INCREMENT error, only recreate if it's a new table
    if (error.code === 'ER_NO_DEFAULT_FOR_FIELD' || (error.message && error.message.includes("Field 'id' doesn't have a default value"))) {
      console.log('🔄 AUTO_INCREMENT error detected, checking if this is a new table...');
      console.log(`   Error Code: ${error.code}`);
      console.log(`   Error Message: ${error.message}`);
      
      // Only recreate if it's a news or ads table (new tables)
      if (sql.includes('news') || sql.includes('ads') || sql.includes('ad_clicks') || sql.includes('ad_views')) {
        console.log('🔄 New table detected, recreating...');
        try {
          await initializeDatabase();
          console.log('✅ New tables recreated successfully, retrying query...');
          // Retry the original query
          const retryResult = await pool.query(sql, params);
          const [retryRows] = retryResult;
          const safeRetryRows = retryRows || [];
          return [safeRetryRows, []];
        } catch (initError) {
          console.error('❌ Failed to recreate new tables:', initError.message);
          throw error; // Throw original error if recreation fails
        }
      } else {
        console.log('ℹ️  Existing table detected, not recreating to preserve data');
        throw error; // Throw original error for existing tables
      }
    }

    

    // If table doesn't exist, try to create it
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('🔄 Table does not exist, attempting to create database tables...');
      try {
        await initializeDatabase();
        console.log('✅ Database tables created successfully, retrying query...');
        // Retry the original query
        const retryResult = await pool.query(sql, params);
        const [retryRows] = retryResult;
        const safeRetryRows = retryRows || [];
        return [safeRetryRows, []];
      } catch (initError) {
        console.error('❌ Failed to initialize database:', initError.message);
        throw error; // Throw original error if initialization fails
      }
    }

    

    // If connection issues, try fallback

    if (error.code === 'ECONNREFUSED' && !global.fallbackAttempted) {

      global.fallbackAttempted = true;

      console.log('🔄 Connection failed, trying TCP proxy fallback...');

      try {

        await testConnectionWithFallback();

        console.log('✅ Fallback successful, retrying query...');

        const retryResult = await pool.query(sql, params);

        const [retryRows] = retryResult;

        const safeRetryRows = retryRows || [];

        return [safeRetryRows, []];

      } catch (fallbackError) {

        console.error('❌ Fallback failed:', fallbackError.message);

        throw error;

      }

    }

    

    throw error;

  }

}



// Initialize database tables - only create new tables, don't recreate existing ones
async function initializeDatabase() {
  // Only create the new news and ads tables, don't recreate existing tables
  console.log('🔄 Creating new news and ads tables...');
  
  const createNewTables = [
    `CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      category ENUM('general', 'academic', 'events', 'announcements') DEFAULT 'general',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      view_count INT DEFAULT 0,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_priority (priority),
      INDEX idx_is_active (is_active),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE IF NOT EXISTS ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      video_url VARCHAR(500),
      image_url VARCHAR(500),
      redirect_url VARCHAR(500) NOT NULL,
      ad_type ENUM('video', 'banner', 'popup') DEFAULT 'video',
      position ENUM('top', 'sidebar', 'bottom', 'popup') DEFAULT 'sidebar',
      is_active BOOLEAN DEFAULT TRUE,
      auto_play BOOLEAN DEFAULT TRUE,
      click_count INT DEFAULT 0,
      view_count INT DEFAULT 0,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ad_type (ad_type),
      INDEX idx_position (position),
      INDEX idx_is_active (is_active),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE IF NOT EXISTS ad_clicks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_id INT NOT NULL,
      user_id INT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ad (ad_id),
      INDEX idx_user (user_id),
      INDEX idx_clicked_at (clicked_at),
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE IF NOT EXISTS ad_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad_id INT NOT NULL,
      user_id INT,
      ip_address VARCHAR(45),
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ad (ad_id),
      INDEX idx_user (user_id),
      INDEX idx_viewed_at (viewed_at),
      FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE IF NOT EXISTS news_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      news_id INT NOT NULL,
      user_id INT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_news (news_id),
      INDEX idx_user (user_id),
      INDEX idx_viewed_at (viewed_at),
      FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE IF NOT EXISTS discussion_forum (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      module_code VARCHAR(20),
      created_by INT,
      author VARCHAR(100),
      author_role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_module_code (module_code),
      INDEX idx_created_at (created_at),
      INDEX idx_author_role (author_role),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    
    `CREATE TABLE IF NOT EXISTS discussion_replies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      discussion_id INT NOT NULL,
      content TEXT NOT NULL,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_discussion_id (discussion_id),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (discussion_id) REFERENCES discussion_forum(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of createNewTables) {
    try {
      await pool.query(sql);
      console.log('✅ New table created successfully');
    } catch (error) {
      console.log('⚠️  Table creation warning:', error.message);
    }
  }

  console.log('✅ News and ads tables initialized successfully');
}



// Recreate tables to fix AUTO_INCREMENT issues

async function recreateTablesWithAutoIncrement() {

  const tables = ['users', 'modules', 'lecturers', 'timetable', 'settings', 'notes', 'class_timetable', 'news', 'ads', 'ad_clicks', 'ad_views', 'news_views', 'discussion_forum', 'discussion_replies'];

  

  for (const tableName of tables) {

    try {

      console.log(`🔄 Checking table ${tableName}...`);

      

      // Force drop table to ensure clean recreation with proper AUTO_INCREMENT

      await pool.query(`DROP TABLE IF EXISTS ${tableName}`);

      console.log(`✅ Dropped table ${tableName} for clean recreation`);

      

    } catch (error) {

      // Table doesn't exist, which is fine

      console.log(`ℹ️  Table ${tableName} doesn't exist yet, will create new`);

    }

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

