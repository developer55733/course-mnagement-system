const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all ads
router.get('/', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT a.*, u.name as created_by_name 
      FROM ads a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.is_active = TRUE 
      ORDER BY a.created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads'
    });
  }
});

// POST create ad
router.post('/', async (req, res) => {
  try {
    const { title, description, video_url, redirect_url, ad_type, position, auto_play, created_by } = req.body;
    
    // Validate required fields
    if (!title || !video_url || !redirect_url || !ad_type || !position) {
      return res.status(400).json({
        success: false,
        message: 'Title, video URL, redirect URL, ad type, and position are required'
      });
    }
    
    // Insert ad
    const [result] = await query(`
      INSERT INTO ads (title, description, video_url, redirect_url, ad_type, position, auto_play, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description || null, video_url, redirect_url, ad_type, position, auto_play || true, created_by || null]);
    
    res.json({
      success: true,
      message: 'Ad created successfully',
      data: {
        id: result.insertId,
        title,
        description,
        video_url,
        redirect_url,
        ad_type,
        position,
        auto_play,
        created_by
      }
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ad'
    });
  }
});

// PUT update ad
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, video_url, redirect_url, ad_type, position, auto_play, is_active } = req.body;
    
    // Update ad
    await query(`
      UPDATE ads 
      SET title = ?, description = ?, video_url = ?, redirect_url = ?, ad_type = ?, position = ?, auto_play = ?, is_active = ?
      WHERE id = ?
    `, [title, description || null, video_url, redirect_url, ad_type, position, auto_play || true, is_active, id]);
    
    res.json({
      success: true,
      message: 'Ad updated successfully'
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ad'
    });
  }
});

// DELETE ad
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting is_active to false
    await query(`
      UPDATE ads SET is_active = FALSE WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad'
    });
  }
});

// GET ads by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const [rows] = await query(`
      SELECT a.*, u.name as created_by_name 
      FROM ads a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.ad_type = ? AND a.is_active = TRUE 
      ORDER BY a.created_at DESC
    `, [type]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching ads by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads by type'
    });
  }
});

// GET ads by position
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    
    const [rows] = await query(`
      SELECT a.*, u.name as created_by_name 
      FROM ads a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.position = ? AND a.is_active = TRUE 
      ORDER BY a.created_at DESC
    `, [position]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching ads by position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads by position'
    });
  }
});

// POST track ad view
router.post('/track-view', async (req, res) => {
  try {
    const { ad_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    
    // Insert ad view
    await query(`
      INSERT INTO ad_views (ad_id, user_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `, [ad_id, user_id || null, ip_address, user_agent]);
    
    // Update view count
    await query(`
      UPDATE ads SET view_count = view_count + 1 WHERE id = ?
    `, [ad_id]);
    
    res.json({
      success: true,
      message: 'Ad view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking ad view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track ad view'
    });
  }
});

// POST track ad click
router.post('/track-click', async (req, res) => {
  try {
    const { ad_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    
    // Insert ad click
    await query(`
      INSERT INTO ad_clicks (ad_id, user_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `, [ad_id, user_id || null, ip_address, user_agent]);
    
    // Update click count
    await query(`
      UPDATE ads SET click_count = click_count + 1 WHERE id = ?
    `, [ad_id]);
    
    res.json({
      success: true,
      message: 'Ad click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking ad click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track ad click'
    });
  }
});

// GET ad analytics
router.get('/analytics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ad details
    const [adRows] = await query(`
      SELECT * FROM ads WHERE id = ?
    `, [id]);
    
    if (adRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    const ad = adRows[0];
    
    // Get view count
    const [viewRows] = await query(`
      SELECT COUNT(*) as total_views FROM ad_views WHERE ad_id = ?
    `, [id]);
    
    // Get click count
    const [clickRows] = await query(`
      SELECT COUNT(*) as total_clicks FROM ad_clicks WHERE ad_id = ?
    `, [id]);
    
    // Get daily views (last 7 days)
    const [dailyViewsRows] = await query(`
      SELECT DATE(viewed_at) as date, COUNT(*) as views
      FROM ad_views 
      WHERE ad_id = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
    `, [id]);
    
    // Get daily clicks (last 7 days)
    const [dailyClicksRows] = await query(`
      SELECT DATE(clicked_at) as date, COUNT(*) as clicks
      FROM ad_clicks 
      WHERE ad_id = ? AND clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `, [id]);
    
    res.json({
      success: true,
      data: {
        ad,
        analytics: {
          total_views: viewRows[0].total_views,
          total_clicks: clickRows[0].total_clicks,
          click_through_rate: viewRows[0].total_views > 0 ? 
            ((clickRows[0].total_clicks / viewRows[0].total_views) * 100).toFixed(2) + '%' : '0%',
          daily_views: dailyViewsRows,
          daily_clicks: dailyClicksRows
        }
      }
    });
  } catch (error) {
    console.error('Error fetching ad analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ad analytics'
    });
  }
});

// DELETE ad
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await query('DELETE FROM ads WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad'
    });
  }
});

// PUT toggle ad status
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await query(`
      UPDATE ads 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ad status updated successfully'
    });
  } catch (error) {
    console.error('Error toggling ad status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ad status'
    });
  }
});

module.exports = router;
