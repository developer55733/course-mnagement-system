require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Testing Railway MySQL Connection');
console.log('=====================================');

// Test different connection configurations
const configs = [
  {
    name: 'Railway TCP Proxy (Recommended)',
    config: {
      host: 'tramway.proxy.rlwy.net',
      port: 13023,
      user: 'root',
      password: 'TBTdIyRIUxlOnTBZRSgWKVeaMfUWRvVY',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    }
  },
  {
    name: 'Railway Internal Host',
    config: {
      host: 'course-mnagement-system.railway.internal',
      port: 3306,
      user: 'root',
      password: 'TBTdIyRIUxlOnTBZRSgWKVeaMfUWRvVY',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    }
  }
];

async function testConnection(name, config) {
  console.log(`\n🔗 Testing: ${name}`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query successful:', rows[0]);
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('   Error Code:', error.code);
    console.error('   Error Message:', error.message);
    console.error('   Error Number:', error.errno);
    console.error('   SQL State:', error.sqlState);
    
    return false;
  }
}

async function runTests() {
  console.log('Environment Variables:');
  console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL || 'NOT SET');
  console.log('MYSQLHOST:', process.env.MYSQLHOST || 'NOT SET');
  console.log('MYSQLPORT:', process.env.MYSQLPORT || 'NOT SET');
  console.log('MYSQLUSER:', process.env.MYSQLUSER || 'NOT SET');
  console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET');
  console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'NOT SET');
  
  let successCount = 0;
  
  for (const { name, config } of configs) {
    const success = await testConnection(name, config);
    if (success) successCount++;
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=====================================');
  console.log(`📊 Results: ${successCount}/${configs.length} connections successful`);
  
  if (successCount === 0) {
    console.log('\n❌ All connections failed. Please check:');
    console.log('   1. Railway MySQL service is running');
    console.log('   2. Environment variables are correct');
    console.log('   3. Database credentials are valid');
    console.log('   4. Network connectivity is working');
  } else {
    console.log('\n✅ At least one connection method works!');
  }
}

runTests().catch(console.error);
