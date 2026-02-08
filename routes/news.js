const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all news
router.get('/', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT n.*, u.name as created_by_name 
      FROM news n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.is_active = TRUE 
      ORDER BY n.priority DESC, n.created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news'
    });
  }
});

// POST create news
router.post('/', async (req, res) => {
  try {
    const { title, content, category, priority, image_url, created_by } = req.body;
    
    // Validate required fields
    if (!title || !content || !category || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, category, and priority are required'
      });
    }
    
    // Insert news
    const [result] = await query(`
      INSERT INTO news (title, content, category, priority, image_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, content, category, priority, image_url || null, created_by || null]);
    
    res.json({
      success: true,
      message: 'News created successfully',
      data: {
        id: result.insertId,
        title,
        content,
        category,
        priority,
        image_url,
        created_by
      }
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create news'
    });
  }
});

// PUT update news
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, image_url, is_active } = req.body;
    
    // Update news
    await query(`
      UPDATE news 
      SET title = ?, content = ?, category = ?, priority = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `, [title, content, category, priority, image_url || null, is_active, id]);
    
    res.json({
      success: true,
      message: 'News updated successfully'
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news'
    });
  }
});

// DELETE news
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting is_active to false
    await query(`
      UPDATE news SET is_active = FALSE WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news'
    });
  }
});

// GET news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const [rows] = await query(`
      SELECT n.*, u.name as created_by_name 
      FROM news n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.category = ? AND n.is_active = TRUE 
      ORDER BY n.priority DESC, n.created_at DESC
    `, [category]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news by category'
    });
  }
});

// DELETE news
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await query('DELETE FROM news WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news article'
    });
  }
});

// PUT toggle news status
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await query(`
      UPDATE news 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'News status updated successfully'
    });
  } catch (error) {
    console.error('Error toggling news status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news status'
    });
  }
});

// POST track news view
router.post('/track-view', async (req, res) => {
  try {
    const { news_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    
    // Insert news view
    await query(`
      INSERT INTO news_views (news_id, user_id, ip_address, user_agent, viewed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [news_id, user_id || null, ip_address, user_agent]);
    
    // Update view count
    await query(`
      UPDATE news SET view_count = view_count + 1 WHERE id = ?
    `, [news_id]);
    
    res.json({
      success: true,
      message: 'News view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking news view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track news view'
    });
  }
});

// GET news analytics
router.get('/analytics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get news details
    const [newsRows] = await query(`
      SELECT * FROM news WHERE id = ?
    `, [id]);
    
    if (newsRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    const news = newsRows[0];
    
    // Get view count
    const [viewRows] = await query(`
      SELECT COUNT(*) as total_views FROM news_views WHERE news_id = ?
    `, [id]);
    
    // Get daily views (last 7 days)
    const [dailyViewsRows] = await query(`
      SELECT DATE(viewed_at) as date, COUNT(*) as views
      FROM news_views 
      WHERE news_id = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
    `, [id]);
    
    res.json({
      success: true,
      data: {
        news,
        analytics: {
          total_views: viewRows[0].total_views,
          daily_views: dailyViewsRows
        }
      }
    });
  } catch (error) {
    console.error('Error fetching news analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news analytics'
    });
  }
});

module.exports = router;
