const http = require('http');

async function testDirectAPI() {
  try {
    console.log('Testing direct API endpoint...');
    
    // Test the exact endpoint
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/notes/public',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`🔍 Status: ${res.statusCode}`);
      console.log(`🔍 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('🔍 Response:', data);
        process.exit(0);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      process.exit(1);
    });
    
    req.end();
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testDirectAPI();
