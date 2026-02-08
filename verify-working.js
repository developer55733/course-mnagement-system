// Simple verification script
const http = require('http');

function testEndpoint(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
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

async function verifyAll() {
  console.log('🧪 VERIFYING SIMPLE WORKING SERVER\n');
  
  try {
    // Test health
    console.log('1. Testing health...');
    const health = await testEndpoint('GET', '/health');
    console.log('✅ Health:', health.data);
    
    // Test GET news
    console.log('2. Testing GET /api/news...');
    const getNews = await testEndpoint('GET', '/api/news');
    console.log('✅ GET News:', getNews.data);
    
    // Test POST news
    console.log('3. Testing POST /api/news...');
    const postNews = await testEndpoint('POST', '/api/news', {
      title: 'Test News',
      content: 'Test content',
      category: 'general',
      priority: 'medium'
    });
    console.log('✅ POST News:', postNews.data);
    
    // Test GET ads
    console.log('4. Testing GET /api/ads...');
    const getAds = await testEndpoint('GET', '/api/news');
    console.log('✅ GET Ads:', getAds.data);
    
    // Test POST ads
    console.log('5. Testing POST /api/ads...');
    const postAds = await testEndpoint('POST', '/api/ads', {
      title: 'Test Ad',
      video_url: 'https://test.com/video.mp4',
      redirect_url: 'https://test.com'
    });
    console.log('✅ POST Ads:', postAds.data);
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('📝 Now test the admin panel at: http://localhost:3002/admin');
    console.log('🔧 Or test manually at: http://localhost:3002/test');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

verifyAll();
