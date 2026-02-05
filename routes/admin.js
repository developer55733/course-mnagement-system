const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { query } = require('../config/database');

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
        const result = await query(q);
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
    const result = await query(`
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      ORDER BY n.created_at DESC
    `);
    const [notes] = result;
    
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
    console.log('🔍 Creating note request body:', req.body);
    
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

    console.log('🔍 Extracted data:', { title, content: content?.substring(0, 50) + '...', module, moduleName, type, tags, visibility });

    // Validation
    if (!title || !content || !module || !moduleName) {
      console.log('❌ Validation failed:', { title: !!title, content: !!content, module: !!module, moduleName: !!moduleName });
      return res.status(400).json({
        success: false,
        error: 'Title, content, module, and module name are required'
      });
    }

    // Check if notes table exists
    try {
      await query('SELECT 1 FROM notes LIMIT 1');
      console.log('✅ Notes table exists');
    } catch (tableError) {
      console.log('❌ Notes table does not exist, creating it...');
      // Create notes table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          formatted_content TEXT,
          module_code VARCHAR(50) NOT NULL,
          module_name VARCHAR(100) NOT NULL,
          type ENUM('lecture', 'tutorial', 'assignment', 'exam', 'reference') DEFAULT 'lecture',
          tags VARCHAR(255),
          visibility ENUM('public', 'private') DEFAULT 'public',
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_module (module_code),
          INDEX idx_type (type),
          INDEX idx_visibility (visibility),
          INDEX idx_created_by (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `;
      await query(createTableQuery);
      console.log('✅ Notes table created successfully');
    }

    // Get admin user ID
    const adminResult = await query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    const [adminUsers] = adminResult;
    const createdBy = adminUsers.length > 0 ? adminUsers[0].id : 1;
    console.log('✅ Admin user ID:', createdBy);

    const insertQuery = `
      INSERT INTO notes (title, content, formatted_content, module_code, module_name, type, tags, visibility, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    console.log('🔍 Executing query with params:', [
      title,
      content?.substring(0, 50) + '...',
      formatted_content?.substring(0, 50) + '...' || content?.substring(0, 50) + '...',
      module,
      moduleName,
      type || 'lecture',
      tags,
      visibility || 'public',
      createdBy
    ]);
    
    const result = await query(insertQuery, [
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

    console.log('✅ Note created successfully with ID:', result[0]?.insertId || 'Unknown');

    res.status(201).json({
      success: true,
      data: {
        id: result[0]?.insertId || 'Unknown',
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
    console.error('❌ Error creating note:', error);
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create note: ' + error.message
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
    const existingResult = await query('SELECT * FROM notes WHERE id = ?', [id]);
    const [existingNotes] = existingResult;
    if (existingNotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    const updateQuery = `
      UPDATE notes 
      SET title = ?, content = ?, formatted_content = ?, module_code = ?, module_name = ?, type = ?, tags = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(updateQuery, [
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
    const existingResult = await query('SELECT * FROM notes WHERE id = ?', [id]);
    const [existingNotes] = existingResult;
    if (existingNotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    await query('DELETE FROM notes WHERE id = ?', [id]);

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
        await query('DELETE FROM users WHERE role != "admin"');
        result = { message: 'Non-admin users cleared successfully' };
        break;
      case 'clearModules':
        await query('DELETE FROM modules');
        result = { message: 'Modules cleared successfully' };
        break;
      case 'clearTimetable':
        await query('DELETE FROM timetable');
        result = { message: 'Timetable cleared successfully' };
        break;
      case 'clearNotes':
        await query('DELETE FROM notes');
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
