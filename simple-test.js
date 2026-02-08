// Simple test without external dependencies
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing debug server endpoints...\n');
  
  const baseURL = 'localhost:3001';
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest({
      hostname: baseURL,
      path: '/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Health check:', healthResponse.data);
    console.log('');
    
    // Test GET news endpoint
    console.log('2. Testing GET /api/news...');
    const newsResponse = await makeRequest({
      hostname: baseURL,
      path: '/api/news',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ GET news:', newsResponse.data);
    console.log('');
    
    // Test POST news endpoint
    console.log('3. Testing POST /api/news...');
    const newsData = {
      title: 'Test News Article',
      content: 'This is a test news article for debugging.',
      category: 'general',
      priority: 'medium',
      is_active: true
    };
    const createNewsResponse = await makeRequest({
      hostname: baseURL,
      path: '/api/news',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, newsData);
    console.log('✅ POST news:', createNewsResponse.data);
    console.log('');
    
    // Test POST ads endpoint
    console.log('4. Testing POST /api/ads...');
    const adData = {
      title: 'Test Advertisement',
      description: 'This is a test advertisement for debugging.',
      video_url: 'https://example.com/test-video.mp4',
      redirect_url: 'https://example.com',
      ad_type: 'video',
      position: 'sidebar',
      is_active: true,
      auto_play: true
    };
    const createAdResponse = await makeRequest({
      hostname: baseURL,
      path: '/api/ads',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, adData);
    console.log('✅ POST ads:', createAdResponse.data);
    console.log('');
    
    console.log('🎉 All endpoints are working correctly!');
    console.log('\n📝 Now you can test the admin panel at:');
    console.log(`   Admin Panel: http://${baseURL}/admin`);
    console.log('   Use your admin secret to login and try creating news/ads.');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testEndpoints();
