const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

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
router.post('/:id/replies', async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { content, created_by } = req.body;
    
    if (!content || !created_by) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content and created_by are required' 
      });
    }
    
    // Check if discussion exists
    const [discussion] = await query('SELECT id FROM discussion_forum WHERE id = ?', [discussionId]);
    
    if (discussion.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    const sql = `
      INSERT INTO discussion_replies (discussion_id, content, created_by)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await query(sql, [discussionId, content, created_by]);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId,
        discussion_id: discussionId,
        content,
        created_by
      }
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, error: 'Failed to add reply' });
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

module.exports = router;
