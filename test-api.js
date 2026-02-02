// Simple API testing script for Railway deployment
// Run this to verify all endpoints are working

const API_BASE = process.env.RAILWAY_PUBLIC_URL || 'http://localhost:8080';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`${method} ${endpoint} - Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('---');
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`${method} ${endpoint} - Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Course Management System API');
  console.log(`🌐 Base URL: ${API_BASE}`);
  console.log('='.repeat(50));
  
  // Test basic endpoints
  await testEndpoint('/api');
  await testEndpoint('/api/users/health');
  
  // Test user endpoints
  console.log('👤 Testing User Endpoints:');
  await testEndpoint('/api/users');
  
  // Test login with default credentials
  console.log('🔐 Testing Authentication:');
  await testEndpoint('/api/users/login', 'POST', {
    email: 'john@student.edu',
    password: 'password123'
  });
  
  // Test admin login
  await testEndpoint('/api/users/admin-login', 'POST', {
    email: 'admin@system.edu',
    password: 'admin123',
    adminSecret: 'admin123'
  });
  
  // Test other endpoints
  console.log('📚 Testing Other Endpoints:');
  await testEndpoint('/api/modules');
  await testEndpoint('/api/lecturers');
  await testEndpoint('/api/timetable');
  await testEndpoint('/api/settings');
  
  console.log('✅ API Testing Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint, runTests };
