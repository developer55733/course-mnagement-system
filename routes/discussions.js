const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Simple authentication middleware
const authenticateUser = (req, res, next) => {
  // Check for user session or token
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'];
  
  console.log('🔍 Auth middleware - Headers:', {
    authorization: authHeader,
    'x-user-id': userId,
    'content-type': req.headers['content-type']
  });
  
  if (userId && userId !== '0' && userId !== 'undefined') {
    req.user = { id: parseInt(userId) };
    console.log('✅ User authenticated via x-user-id:', req.user.id);
    return next();
  }
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Simple token validation (in production, use proper JWT)
      req.user = { id: parseInt(token) };
      console.log('✅ User authenticated via Bearer token:', req.user.id);
      return next();
    } catch (e) {
      console.log('❌ Invalid Bearer token:', e);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  }
  
  // Allow demo user for testing (remove in production)
  if (req.method === 'POST' && req.path.includes('/replies')) {
    console.log('⚠️ Allowing demo user for reply posting');
    req.user = { id: 1 }; // Default demo user
    return next();
  }
  
  // Allow read-only access without authentication
  if (req.method === 'GET') {
    console.log('ℹ️  Allowing GET request without authentication');
    return next();
  }
  
  console.log('❌ Authentication required for:', req.method, req.path);
  res.status(401).json({ success: false, error: 'Authentication required' });
};

// Get all discussion posts
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT df.*, u.name as author_name, u.email as author_email,
             COUNT(dr.id) as reply_count
      FROM discussion_forum df
      LEFT JOIN users u ON df.created_by = u.id
      LEFT JOIN discussion_replies dr ON df.id = dr.discussion_id
      GROUP BY df.id
      ORDER BY df.created_at DESC
    `;
    
    const [results] = await query(sql);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch discussions' });
  }
});

// Get single discussion with replies
router.get('/:id', async (req, res) => {
  try {
    const discussionId = req.params.id;
    
    // Get discussion details
    const discussionQuery = `
      SELECT df.*, u.name as author_name, u.email as author_email
      FROM discussion_forum df
      LEFT JOIN users u ON df.created_by = u.id
      WHERE df.id = ?
    `;
    
    // Get replies
    const repliesQuery = `
      SELECT dr.*, u.name as author_name, u.email as author_email
      FROM discussion_replies dr
      LEFT JOIN users u ON dr.created_by = u.id
      WHERE dr.discussion_id = ?
      ORDER BY dr.created_at ASC
    `;
    
    const [discussion] = await query(discussionQuery, [discussionId]);
    const [replies] = await query(repliesQuery, [discussionId]);
    
    if (discussion.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    res.json({ 
      success: true, 
      data: {
        discussion: discussion[0],
        replies: replies
      }
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch discussion' });
  }
});

// Create new discussion post
router.post('/', async (req, res) => {
  try {
    const { title, content, module, created_by } = req.body;
    
    // Check if admin is creating the discussion
    const adminSecret = req.headers['x-admin-secret'];
    const isAdmin = adminSecret === process.env.ADMIN_SECRET;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and content are required' 
      });
    }
    
    // For admin-created discussions, use admin user ID (1) or get from system
    let createdBy = created_by;
    if (isAdmin && !created_by) {
      // Use a default admin user ID or get from database
      const [adminUser] = await query('SELECT id FROM users WHERE email = ? LIMIT 1', ['admin@course.com']);
      createdBy = adminUser.length > 0 ? adminUser[0].id : 1;
    }
    
    const sql = `
      INSERT INTO discussion_forum (title, content, module_code, created_by)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await query(sql, [title, content, module || null, createdBy]);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId,
        title,
        content,
        module_code: module,
        created_by: createdBy
      }
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ success: false, error: 'Failed to create discussion' });
  }
});

// Add reply to discussion
router.post('/:id/replies', authenticateUser, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { content, user_name } = req.body;
    
    console.log('🔍 Reply route - Request received');
    console.log('🔍 Reply route - Discussion ID:', discussionId);
    console.log('🔍 Reply route - Content:', content);
    console.log('🔍 Reply route - Request body:', req.body);
    console.log('🔍 Reply route - Authenticated user:', req.user);
    console.log('🔍 Reply route - Request headers:', req.headers);
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reply content is required' 
      });
    }
    
    // Use authenticated user ID
    const createdBy = req.user ? req.user.id : null;
    
    console.log('🔍 Reply route - Created by:', createdBy);
    
    if (!createdBy) {
      console.log('❌ Reply route - No authenticated user found');
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }
    
    // Use proper database schema - only existing fields
    const sql = `
      INSERT INTO discussion_replies (discussion_id, content, created_by)
      VALUES (?, ?, ?)
    `;
    
    console.log('🔍 Reply route - Executing SQL:', sql);
    console.log('🔍 Reply route - SQL params:', [discussionId, content, createdBy]);
    
    const [result] = await query(sql, [
      discussionId, 
      content, 
      createdBy
    ]);
    
    console.log('✅ Reply inserted with ID:', result.insertId);
    
    // Get the complete reply with user info
    const replyQuery = `
      SELECT dr.*, u.name as author_name, u.email as author_email
      FROM discussion_replies dr
      LEFT JOIN users u ON dr.created_by = u.id
      WHERE dr.id = ?
    `;
    
    // Use user name from request as primary source for new replies
    const reply = {
      id: result.insertId,
      discussion_id: discussionId,
      content,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      author_name: user_name || 'Anonymous' // Always use request user name
    };
    
    // Try to get database user info as fallback
    try {
      const [replyData] = await query(replyQuery, [result.insertId]);
      if (replyData && replyData[0] && replyData[0].author_name) {
        reply.author_name = replyData[0].author_name;
      }
    } catch (dbError) {
      console.log('⚠️ Could not fetch user from database, using request name');
    }
    
    res.json({ 
      success: true, 
      data: reply
    });
  } catch (error) {
    console.error('❌ Error adding reply:', error);
    console.error('❌ SQL Error Details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add reply',
      details: error.message 
    });
  }
});

// Delete discussion (admin only or author)
router.delete('/:id', async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { user_id, user_role } = req.body;
    
    // Check if admin is deleting the discussion
    const adminSecret = req.headers['x-admin-secret'];
    const isAdmin = adminSecret === process.env.ADMIN_SECRET;
    
    // Get discussion to check ownership
    const [discussion] = await query('SELECT * FROM discussion_forum WHERE id = ?', [discussionId]);
    
    if (discussion.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Discussion not found' 
      });
    }
    
    // Check if user is author or admin
    const isAuthor = discussion[0].created_by == user_id;
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to delete this discussion' 
      });
    }
    
    await query('DELETE FROM discussion_forum WHERE id = ?', [discussionId]);
    
    res.json({ success: true, message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ success: false, error: 'Failed to delete discussion' });
  }
});

// Get current user from session
router.get('/current-user', async (req, res) => {
  try {
    // Check if user is logged in via session
    if (req.session && req.session.userId) {
      const sql = 'SELECT id, name, email FROM users WHERE id = ?';
      const [users] = await query(sql, [req.session.userId]);
      
      if (users.length > 0) {
        res.json({ 
          success: true, 
          data: {
            id: users[0].id,
            name: users[0].name,
            email: users[0].email
          }
        });
      } else {
        res.json({ success: false, error: 'User not found' });
      }
    } else {
      res.json({ success: false, error: 'Not logged in' });
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, error: 'Failed to get current user' });
  }
});

// Get available modules
router.get('/modules', async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT module_code, module_name 
      FROM modules 
      WHERE is_active = TRUE 
      ORDER BY module_code
    `;
    
    const [modules] = await query(sql);
    res.json({ success: true, data: modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch modules' });
  }
});

module.exports = router;
