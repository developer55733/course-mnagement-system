// Simple, working server - no complications
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'Working', timestamp: new Date().toISOString() });
});

// Simple news endpoints
app.get('/api/news', (req, res) => {
  console.log('GET /api/news called');
  res.json({ 
    success: true, 
    data: [
      { id: 1, title: 'Test News', content: 'Test content', category: 'general', priority: 'medium', created_at: new Date().toISOString() }
    ] 
  });
});

app.post('/api/news', (req, res) => {
  console.log('POST /api/news called with body:', req.body);
  const newsData = req.body;
  
  if (!newsData.title || !newsData.content) {
    return res.status(400).json({ success: false, error: 'Title and content required' });
  }
  
  const response = {
    success: true,
    message: 'News created successfully',
    data: {
      id: Date.now(),
      title: newsData.title,
      content: newsData.content,
      category: newsData.category || 'general',
      priority: newsData.priority || 'medium',
      created_at: new Date().toISOString()
    }
  };
  
  console.log('Sending response:', response);
  res.json(response);
});

// Simple ads endpoints
app.get('/api/ads', (req, res) => {
  console.log('GET /api/ads called');
  res.json({ 
    success: true, 
    data: [
      { id: 1, title: 'Test Ad', description: 'Test ad', video_url: 'https://example.com/video.mp4', redirect_url: 'https://example.com', ad_type: 'video', position: 'sidebar', created_at: new Date().toISOString() }
    ] 
  });
});

app.post('/api/ads', (req, res) => {
  console.log('POST /api/ads called with body:', req.body);
  const adData = req.body;
  
  if (!adData.title || !adData.video_url || !adData.redirect_url) {
    return res.status(400).json({ success: false, error: 'Title, video URL, and redirect URL required' });
  }
  
  const response = {
    success: true,
    message: 'Ad created successfully',
    data: {
      id: Date.now(),
      title: adData.title,
      description: adData.description || '',
      video_url: adData.video_url,
      redirect_url: adData.redirect_url,
      ad_type: adData.ad_type || 'video',
      position: adData.position || 'sidebar',
      created_at: new Date().toISOString()
    }
  };
  
  console.log('Sending response:', response);
  res.json(response);
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.hbs'));
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.send(`
    <h1>🧪 Simple Server Test</h1>
    <p>Server is working!</p>
    <p><a href="/health">Health Check</a></p>
    <p><a href="/api/news">Test News API</a></p>
    <p><a href="/api/ads">Test Ads API</a></p>
    <p><a href="/admin">Admin Panel</a></p>
    <script>
      // Test POST requests
      fetch('/api/news', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: 'Test', content: 'Test content'})
      }).then(r => r.json()).then(console.log);
      
      fetch('/api/ads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: 'Test Ad', video_url: 'http://test.com', redirect_url: 'http://test.com'})
      }).then(r => r.json()).then(console.log);
    </script>
  `);
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 SIMPLE SERVER RUNNING on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT}/test to verify`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log('✅ This is a minimal, working server');
  console.log('✅ No database, no complications, just working endpoints');
  console.log('');
});
