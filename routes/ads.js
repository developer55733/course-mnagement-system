const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get all ads
router.get('/', async (req, res) => {
  try {
    const { ad_type, position, is_active } = req.query;
    
    let query = `
      SELECT a.*, u.name as created_by_name 
      FROM ads a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (ad_type) {
      query += ' AND a.ad_type = ?';
      params.push(ad_type);
    }
    
    if (position) {
      query += ' AND a.position = ?';
      params.push(position);
    }
    
    if (is_active !== undefined) {
      query += ' AND a.is_active = ?';
      params.push(is_active === 'true');
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [ads] = await database.execute(query, params);
    
    res.json({
      success: true,
      data: ads
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ads'
    });
  }
});

// Create new ad
router.post('/', async (req, res) => {
  try {
    const { title, description, video_url, redirect_url, ad_type, position, auto_play, created_by } = req.body;
    
    if (!title || !video_url || !redirect_url || !ad_type || !position) {
      return res.status(400).json({
        success: false,
        error: 'Title, video URL, redirect URL, ad type, and position are required'
      });
    }
    
    const query = `
      INSERT INTO ads (title, description, video_url, redirect_url, ad_type, position, auto_play, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await database.execute(query, [title, description, video_url, redirect_url, ad_type, position, auto_play !== false, created_by || null]);
    
    res.json({
      success: true,
      message: 'Advertisement created successfully',
      data: {
        id: result.insertId,
        title,
        description,
        video_url,
        redirect_url,
        ad_type,
        position,
        auto_play: auto_play !== false,
        created_by
      }
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create advertisement'
    });
  }
});

// Update ad
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, video_url, redirect_url, ad_type, position, auto_play, is_active } = req.body;
    
    const query = `
      UPDATE ads 
      SET title = ?, description = ?, video_url = ?, redirect_url = ?, ad_type = ?, position = ?, auto_play = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await database.execute(query, [title, description, video_url, redirect_url, ad_type, position, auto_play !== false, is_active, id]);
    
    res.json({
      success: true,
      message: 'Advertisement updated successfully'
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update advertisement'
    });
  }
});

// Delete ad
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM ads WHERE id = ?';
    await database.execute(query, [id]);
    
    res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete advertisement'
    });
  }
});

// Get single ad
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT a.*, u.name as created_by_name 
      FROM ads a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.id = ?
    `;
    
    const [ads] = await database.execute(query, [id]);
    
    if (ads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    res.json({
      success: true,
      data: ads[0]
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertisement'
    });
  }
});

// Track ad view
router.post('/track-view', async (req, res) => {
  try {
    const { ad_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    
    if (!ad_id) {
      return res.status(400).json({
        success: false,
        error: 'Ad ID is required'
      });
    }
    
    // Insert view tracking
    const query = `
      INSERT INTO ad_views (ad_id, user_id, ip_address)
      VALUES (?, ?, ?)
    `;
    
    await database.execute(query, [ad_id, user_id || null, ip_address]);
    
    // Update ad view count
    await database.execute('UPDATE ads SET view_count = view_count + 1 WHERE id = ?', [ad_id]);
    
    res.json({
      success: true,
      message: 'Ad view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking ad view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track ad view'
    });
  }
});

// Track ad click
router.post('/track-click', async (req, res) => {
  try {
    const { ad_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    
    if (!ad_id) {
      return res.status(400).json({
        success: false,
        error: 'Ad ID is required'
      });
    }
    
    // Insert click tracking
    const query = `
      INSERT INTO ad_clicks (ad_id, user_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `;
    
    await database.execute(query, [ad_id, user_id || null, ip_address, user_agent]);
    
    // Update ad click count
    await database.execute('UPDATE ads SET click_count = click_count + 1 WHERE id = ?', [ad_id]);
    
    res.json({
      success: true,
      message: 'Ad click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking ad click:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track ad click'
    });
  }
});

// Get ad analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ad details
    const [ads] = await database.execute('SELECT * FROM ads WHERE id = ?', [id]);
    
    if (ads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    // Get view analytics
    const [views] = await database.execute(
      'SELECT COUNT(*) as total_views, DATE(viewed_at) as date FROM ad_views WHERE ad_id = ? GROUP BY DATE(viewed_at) ORDER BY date DESC LIMIT 30',
      [id]
    );
    
    // Get click analytics
    const [clicks] = await database.execute(
      'SELECT COUNT(*) as total_clicks, DATE(clicked_at) as date FROM ad_clicks WHERE ad_id = ? GROUP BY DATE(clicked_at) ORDER BY date DESC LIMIT 30',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ad: ads[0],
        views: views,
        clicks: clicks
      }
    });
  } catch (error) {
    console.error('Error fetching ad analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ad analytics'
    });
  }
});

module.exports = router;
