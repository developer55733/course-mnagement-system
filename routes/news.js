const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get all news articles
router.get('/', async (req, res) => {
  try {
    const { category, priority } = req.query;
    
    let query = `
      SELECT n.*, u.name as created_by_name 
      FROM news n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.is_active = TRUE
    `;
    const params = [];
    
    if (category) {
      query += ' AND n.category = ?';
      params.push(category);
    }
    
    if (priority) {
      query += ' AND n.priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY n.priority DESC, n.created_at DESC';
    
    const [news] = await database.execute(query, params);
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

// Create new news article
router.post('/', async (req, res) => {
  try {
    const { title, content, category, priority, image_url, created_by } = req.body;
    
    if (!title || !content || !category || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, category, and priority are required'
      });
    }
    
    const query = `
      INSERT INTO news (title, content, category, priority, image_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await database.execute(query, [title, content, category, priority, image_url, created_by || null]);
    
    res.json({
      success: true,
      message: 'News article created successfully',
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
      error: 'Failed to create news article'
    });
  }
});

// Update news article
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, image_url, is_active } = req.body;
    
    const query = `
      UPDATE news 
      SET title = ?, content = ?, category = ?, priority = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await database.execute(query, [title, content, category, priority, image_url, is_active, id]);
    
    res.json({
      success: true,
      message: 'News article updated successfully'
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update news article'
    });
  }
});

// Delete news article
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM news WHERE id = ?';
    await database.execute(query, [id]);
    
    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete news article'
    });
  }
});

// Get single news article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT n.*, u.name as created_by_name 
      FROM news n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.id = ? AND n.is_active = TRUE
    `;
    
    const [news] = await database.execute(query, [id]);
    
    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }
    
    res.json({
      success: true,
      data: news[0]
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news article'
    });
  }
});

module.exports = router;
