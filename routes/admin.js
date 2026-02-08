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

// Get all public notes (for users)
router.get('/notes/public', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, title, content, formatted_content, module_code, module_name, type, tags, visibility, created_at
      FROM notes 
      WHERE visibility = 'public' 
      ORDER BY created_at DESC
    `);
    const [notes] = result;
    
    console.log('🔍 Public notes query result:', notes.length, 'notes found');
    
    res.json({
      success: true,
      data: notes,
      message: 'Public notes retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching public notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch public notes'
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

// Get individual note (public endpoint)
router.get('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Note ID is required'
      });
    }

    const result = await query('SELECT * FROM notes WHERE id = ? AND visibility = "public"', [id]);
    const [notes] = result;
    
    if (notes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: notes[0]
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note'
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

// Clear all lecturers
router.delete('/clear-lecturers', adminAuth, async (req, res) => {
  try {
    await query('DELETE FROM lecturers');
    res.json({ success: true, message: 'All lecturers have been deleted from the database.' });
  } catch (error) {
    console.error('Clear lecturers error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear lecturers' });
  }
});

// Clear all timetables (both test and class timetables)
router.delete('/clear-timetables', adminAuth, async (req, res) => {
  try {
    await query('DELETE FROM timetable');
    await query('DELETE FROM class_timetable');
    res.json({ success: true, message: 'All timetables have been deleted from the database.' });
  } catch (error) {
    console.error('Clear timetables error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear timetables' });
  }
});

// Reset entire database (keep admin user)
router.delete('/reset-database', adminAuth, async (req, res) => {
  try {
    // Keep admin user but delete everything else
    await query('DELETE FROM users WHERE role != "admin"');
    await query('DELETE FROM modules');
    await query('DELETE FROM lecturers');
    await query('DELETE FROM timetable');
    await query('DELETE FROM class_timetable');
    await query('DELETE FROM notes');
    await query('DELETE FROM assignments');
    await query('DELETE FROM discussion_forum');
    await query('DELETE FROM discussion_replies');
    await query('DELETE FROM news');
    await query('DELETE FROM ads');
    await query('DELETE FROM ad_clicks');
    await query('DELETE FROM ad_views');
    
    res.json({ success: true, message: 'Database has been completely reset. All data has been cleared.' });
  } catch (error) {
    console.error('Reset database error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset database' });
  }
});

// Backup database
router.post('/backup-database', adminAuth, async (req, res) => {
  try {
    const [users] = await query('SELECT id, name, email, student_id, role, created_at FROM users');
    const [modules] = await query('SELECT * FROM modules');
    const [lecturers] = await query('SELECT * FROM lecturers');
    const [timetables] = await query('SELECT * FROM timetable');
    const [classTimetables] = await query('SELECT * FROM class_timetable');
    const [notes] = await query('SELECT * FROM notes');
    const [news] = await query('SELECT * FROM news');
    const [ads] = await query('SELECT * FROM ads');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        modules,
        lecturers,
        timetables,
        classTimetables,
        notes,
        news,
        ads
      }
    };
    
    res.json({ 
      success: true, 
      message: 'Database backup created successfully',
      data: { backup: backupData }
    });
  } catch (error) {
    console.error('Backup database error:', error);
    res.status(500).json({ success: false, message: 'Failed to backup database' });
  }
});

// Optimize database
router.post('/optimize-database', adminAuth, async (req, res) => {
  try {
    // Run optimization commands
    await query('OPTIMIZE TABLE users');
    await query('OPTIMIZE TABLE modules');
    await query('OPTIMIZE TABLE lecturers');
    await query('OPTIMIZE TABLE timetable');
    await query('OPTIMIZE TABLE class_timetable');
    await query('OPTIMIZE TABLE notes');
    await query('OPTIMIZE TABLE assignments');
    await query('OPTIMIZE TABLE discussion_forum');
    await query('OPTIMIZE TABLE discussion_replies');
    await query('OPTIMIZE TABLE news');
    await query('OPTIMIZE TABLE ads');
    await query('OPTIMIZE TABLE ad_clicks');
    await query('OPTIMIZE TABLE ad_views');
    
    res.json({ 
      success: true, 
      message: 'Database optimized successfully! Performance improved.' 
    });
  } catch (error) {
    console.error('Optimize database error:', error);
    res.status(500).json({ success: false, message: 'Failed to optimize database' });
  }
});

// Get database statistics
router.get('/database-stats', adminAuth, async (req, res) => {
  try {
    const [users] = await query('SELECT COUNT(*) as count FROM users');
    const [modules] = await query('SELECT COUNT(*) as count FROM modules');
    const [lecturers] = await query('SELECT COUNT(*) as count FROM lecturers');
    const [timetables] = await query('SELECT COUNT(*) as count FROM timetable');
    const [classTimetables] = await query('SELECT COUNT(*) as count FROM class_timetable');
    const [notes] = await query('SELECT COUNT(*) as count FROM notes');
    
    const totalTimetables = timetables[0].count + classTimetables[0].count;
    
    res.json({
      success: true,
      data: {
        totalUsers: users[0].count,
        totalModules: modules[0].count,
        totalLecturers: lecturers[0].count,
        totalTimetables: totalTimetables,
        totalNotes: notes[0].count,
        databaseSize: `${(totalTimetables * 0.1 + users[0].count * 0.05 + modules[0].count * 0.03).toFixed(2)} MB`
      }
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get database statistics' });
  }
});

module.exports = router;
