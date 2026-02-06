const http = require('http');

async function testServerAPI() {
  try {
    console.log('Testing server API endpoint...');
    
    // Test different possible URLs
    const urls = [
      'http://localhost:8080/api/notes/public',
      'http://localhost:4000/api/notes/public',
      'http://localhost:3000/api/notes/public',
      'http://127.0.0.1:8080/api/notes/public',
      'http://127.0.0.1:4000/api/notes/public'
    ];
    
    for (const url of urls) {
      console.log(`🔍 Testing: ${url}`);
      try {
        const response = await fetch(url);
        console.log(`✅ Success: ${url} - Status: ${response.status}`);
        const data = await response.json();
        console.log(`📊 Response:`, data);
        break;
      } catch (error) {
        console.log(`❌ Failed: ${url} - ${error.message}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testServerAPI();
