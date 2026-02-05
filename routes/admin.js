const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const pool = require('../config/database');

// Render admin UI - Protected (only for authenticated admin users)
router.get('/', adminAuth, (req, res) => {
  res.render('admin', { title: 'Admin Panel' });
});

// Return summary info (protected)
router.get('/info', adminAuth, async (req, res) => {
  try {
    const queries = {
      users: 'SELECT COUNT(*) AS count FROM users',
      lecturers: 'SELECT COUNT(*) AS count FROM lecturers',
      modules: 'SELECT COUNT(*) AS count FROM modules',
      timetable: 'SELECT COUNT(*) AS count FROM timetable',
      settings: 'SELECT COUNT(*) AS count FROM settings',
      notes: 'SELECT COUNT(*) AS count FROM notes'
    };

    const results = {};
    for (const [key, q] of Object.entries(queries)) {
      try {
        const result = await pool.query(q);
        const [rows] = result;
        results[key] = (rows && rows[0]) ? rows[0].count : 0;
      } catch (e) {
        results[key] = 0;
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all notes for admin
router.get('/notes', adminAuth, async (req, res) => {
  try {
    const query = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      ORDER BY n.created_at DESC
    `;
    const [notes] = await pool.execute(query);
    
    res.json({
      success: true,
      data: notes,
      message: 'Notes retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
});

// Create new note (admin only)
router.post('/notes', adminAuth, async (req, res) => {
  try {
    const {
      title,
      content,
      formatted_content,
      module,
      moduleName,
      type,
      tags,
      visibility
    } = req.body;

    // Validation
    if (!title || !content || !module || !moduleName) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, module, and module name are required'
      });
    }

    // Get admin user ID
    const [adminUsers] = await pool.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    const createdBy = adminUsers.length > 0 ? adminUsers[0].id : 1;

    const query = `
      INSERT INTO notes (title, content, formatted_content, module_code, module_name, type, tags, visibility, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      title,
      content,
      formatted_content || content,
      module,
      moduleName,
      type || 'lecture',
      tags,
      visibility || 'public',
      createdBy
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        title,
        content,
        formatted_content: formatted_content || content,
        module_code: module,
        module_name: moduleName,
        type: type || 'lecture',
        tags,
        visibility: visibility || 'public',
        created_by: createdBy
      },
      message: 'Note created successfully'
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create note'
    });
  }
});

// Update note (admin only)
router.put('/notes/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      formatted_content,
      module,
      moduleName,
      type,
      tags,
      visibility
    } = req.body;

    // Check if note exists
    const [existingNotes] = await pool.execute('SELECT * FROM notes WHERE id = ?', [id]);
    if (existingNotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    const query = `
      UPDATE notes 
      SET title = ?, content = ?, formatted_content = ?, module_code = ?, module_name = ?, type = ?, tags = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await pool.execute(query, [
      title,
      content,
      formatted_content || content,
      module,
      moduleName,
      type,
      tags,
      visibility,
      id
    ]);

    res.json({
      success: true,
      message: 'Note updated successfully'
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update note'
    });
  }
});

// Delete note (admin only)
router.delete('/notes/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const [existingNotes] = await pool.execute('SELECT * FROM notes WHERE id = ?', [id]);
    if (existingNotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    await pool.execute('DELETE FROM notes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note'
    });
  }
});

// Admin action endpoint
router.post('/action', adminAuth, async (req, res) => {
  try {
    const { actionType, actionParam } = req.body;
    
    if (!actionType) {
      return res.status(400).json({ success: false, error: 'Action type required' });
    }

    let result;
    switch (actionType) {
      case 'clearUsers':
        await pool.query('DELETE FROM users WHERE role != "admin"');
        result = { message: 'Non-admin users cleared successfully' };
        break;
      case 'clearModules':
        await pool.query('DELETE FROM modules');
        result = { message: 'Modules cleared successfully' };
        break;
      case 'clearTimetable':
        await pool.query('DELETE FROM timetable');
        result = { message: 'Timetable cleared successfully' };
        break;
      case 'clearNotes':
        await pool.query('DELETE FROM notes');
        result = { message: 'Notes cleared successfully' };
        break;
      case 'backup':
        result = { message: 'Backup functionality not implemented yet' };
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action type' });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
