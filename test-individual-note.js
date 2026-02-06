const http = require('http');

async function testIndividualNote() {
  try {
    console.log('Testing individual note endpoint...');
    
    // Test with note ID 1 (should exist based on previous tests)
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/notes/1',
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
        try {
          const jsonData = JSON.parse(data);
          console.log('🔍 Parsed JSON:', jsonData);
        } catch (e) {
          console.log('❌ Failed to parse JSON');
        }
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

testIndividualNote();
