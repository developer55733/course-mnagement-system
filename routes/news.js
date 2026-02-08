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

module.exports = router;
