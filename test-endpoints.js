// Test script to verify debug server endpoints
const axios = require('axios');

async function testEndpoints() {
  console.log('🧪 Testing debug server endpoints...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');
    
    // Test GET news endpoint
    console.log('2. Testing GET /api/news...');
    const newsResponse = await axios.get(`${baseURL}/api/news`);
    console.log('✅ GET news:', newsResponse.data);
    console.log('');
    
    // Test GET ads endpoint
    console.log('3. Testing GET /api/ads...');
    const adsResponse = await axios.get(`${baseURL}/api/ads`);
    console.log('✅ GET ads:', adsResponse.data);
    console.log('');
    
    // Test POST news endpoint
    console.log('4. Testing POST /api/news...');
    const newsData = {
      title: 'Test News Article',
      content: 'This is a test news article for debugging.',
      category: 'general',
      priority: 'medium',
      is_active: true
    };
    const createNewsResponse = await axios.post(`${baseURL}/api/news`, newsData);
    console.log('✅ POST news:', createNewsResponse.data);
    console.log('');
    
    // Test POST ads endpoint
    console.log('5. Testing POST /api/ads...');
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
    const createAdResponse = await axios.post(`${baseURL}/api/ads`, adData);
    console.log('✅ POST ads:', createAdResponse.data);
    console.log('');
    
    console.log('🎉 All endpoints are working correctly!');
    console.log('\n📝 Now you can test the admin panel at:');
    console.log(`   Admin Panel: ${baseURL}/admin`);
    console.log('   Use your admin secret to login and try creating news/ads.');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints();
