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
    
    // Transform results to handle admin posts
    const transformedResults = results.map(discussion => ({
      ...discussion,
      author: discussion.author || discussion.author_name || 'Admin',
      module: discussion.module_code
    }));
    
    res.json({ success: true, data: transformedResults });
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
    
    // Transform discussion data
    const transformedDiscussion = {
      ...discussion[0],
      author: discussion[0].author || discussion[0].author_name || 'Admin',
      module: discussion[0].module_code
    };
    
    res.json({ 
      success: true, 
      data: {
        discussion: transformedDiscussion,
        replies: replies
      }
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch discussion' });
  }
});

// Create new discussion post (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, content, module, author, author_role } = req.body;
    
    // Check if user is admin
    const adminSecret = req.headers['x-admin-secret'];
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required to create discussions' 
      });
    }
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and content are required' 
      });
    }
    
    const sql = `
      INSERT INTO discussion_forum (title, content, module_code, created_by, author, author_role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // For admin posts, we'll use a special admin user ID or NULL
    const adminUserId = null; // You can set this to a specific admin user ID if needed
    
    const [result] = await query(sql, [title, content, module || null, adminUserId, author || 'Admin', author_role || 'admin']);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId,
        title,
        content,
        module,
        author: author || 'Admin',
        author_role: author_role || 'admin',
        created_at: new Date()
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

// Delete discussion (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const discussionId = req.params.id;
    
    // Check if user is admin
    const adminSecret = req.headers['x-admin-secret'];
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required to delete discussions' 
      });
    }
    
    // Check if discussion exists
    const [discussion] = await query('SELECT id FROM discussion_forum WHERE id = ?', [discussionId]);
    
    if (discussion.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    await query('DELETE FROM discussion_forum WHERE id = ?', [discussionId]);
    
    res.json({ success: true, message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ success: false, error: 'Failed to delete discussion' });
  }
});

module.exports = router;
