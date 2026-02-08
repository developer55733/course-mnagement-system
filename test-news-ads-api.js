const http = require('http');

async function testNewsAdsAPI() {
  try {
    console.log('Testing News and Ads API endpoints...');
    
    // Test 1: GET /api/news
    console.log('\n🔍 Testing GET /api/news');
    await testEndpoint('/api/news', 'GET');
    
    // Test 2: POST /api/news
    console.log('\n🔍 Testing POST /api/news');
    const newsData = JSON.stringify({
      title: 'Test News Article',
      content: 'This is a test news article for API testing.',
      category: 'general',
      priority: 'medium',
      image_url: null
    });
    await testEndpoint('/api/news', 'POST', newsData);
    
    // Test 3: GET /api/ads
    console.log('\n🔍 Testing GET /api/ads');
    await testEndpoint('/api/ads', 'GET');
    
    // Test 4: POST /api/ads
    console.log('\n🔍 Testing POST /api/ads');
    const adsData = JSON.stringify({
      title: 'Test Advertisement',
      description: 'This is a test advertisement for API testing.',
      video_url: 'https://example.com/test-video.mp4',
      redirect_url: 'https://example.com',
      ad_type: 'video',
      position: 'sidebar',
      auto_play: true
    });
    await testEndpoint('/api/ads', 'POST', adsData);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

function testEndpoint(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`, res.headers);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response: ${responseData}`);
        console.log(`   ✅ ${method} ${path} completed`);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`   ❌ Request error for ${method} ${path}:`, error.message);
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

testNewsAdsAPI();
