// Quick server startup script for debugging
require('dotenv').config();

console.log('🚀 Starting server for debugging...');
console.log('📊 Environment variables:');
console.log('   PORT:', process.env.PORT || '8080');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    database: 'Not connected (debug mode)',
    timestamp: new Date().toISOString(),
    available_routes: ['/api/news', '/api/ads', '/health']
  });
});

// Mock news endpoint for testing
app.get('/api/news', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Test News Article',
        content: 'This is a test news article for debugging.',
        category: 'general',
        priority: 'medium',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Mock ads endpoint for testing
app.get('/api/ads', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Test Advertisement',
        description: 'This is a test advertisement for debugging.',
        video_url: 'https://example.com/test-video.mp4',
        redirect_url: 'https://example.com',
        ad_type: 'video',
        position: 'sidebar',
        is_active: true,
        auto_play: true,
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Mock news creation endpoint
app.post('/api/news', (req, res) => {
  console.log('📝 Received news creation request:', req.body);
  res.json({
    success: true,
    message: 'News created successfully (debug mode)',
    data: {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString()
    }
  });
});

// Mock ads creation endpoint
app.post('/api/ads', (req, res) => {
  console.log('📺 Received ad creation request:', req.body);
  res.json({
    success: true,
    message: 'Ad created successfully (debug mode)',
    data: {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString()
    }
  });
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.hbs'));
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Debug server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`🔧 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📝 This is a debug server with mock endpoints.');
  console.log('🔧 Use this to test the admin panel interface.');
  console.log('');
});
