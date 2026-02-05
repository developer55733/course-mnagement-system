const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all notes (for admin)
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      ORDER BY n.created_at DESC
    `;
    const [notes] = await query(sql);
    
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

// Get public notes (for users)
router.get('/public', async (req, res) => {
  try {
    const sql = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.visibility = 'public'
      ORDER BY n.created_at DESC
    `;
    const [notes] = await query(sql);
    
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

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.id = ?
    `;
    const [notes] = await query(sql, [id]);
    
    if (notes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      data: notes[0],
      message: 'Note retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note'
    });
  }
});

// Create new note
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      formatted_content,
      module_code,
      module_name,
      type,
      tags,
      visibility,
      created_by
    } = req.body;

    // Validation
    if (!title || !content || !module_code || !module_name) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, module code, and module name are required'
      });
    }

    // Default values
    const noteType = type || 'lecture';
    const noteVisibility = visibility || 'public';
    const createdBy = created_by || 1; // Default to admin user if not specified

    const sql = `
      INSERT INTO notes (title, content, formatted_content, module_code, module_name, type, tags, visibility, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await query(sql, [
      title,
      content,
      formatted_content || content,
      module_code,
      module_name,
      noteType,
      tags,
      noteVisibility,
      createdBy
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        title,
        content,
        formatted_content: formatted_content || content,
        module_code,
        module_name,
        type: noteType,
        tags,
        visibility: noteVisibility,
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

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      formatted_content,
      module_code,
      module_name,
      type,
      tags,
      visibility
    } = req.body;

    // Check if note exists
    const [existingNotes] = await query('SELECT * FROM notes WHERE id = ?', [id]);
    if (existingNotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    const sql = `
      UPDATE notes 
      SET title = ?, content = ?, formatted_content = ?, module_code = ?, module_name = ?, type = ?, tags = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(sql, [
      title,
      content,
      formatted_content || content,
      module_code,
      module_name,
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

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const [existingNotes] = await query('SELECT * FROM notes WHERE id = ?', [id]);
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

// Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const { query: searchQuery } = req.params;
    const sql = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE (n.title LIKE ? OR n.content LIKE ? OR n.module_name LIKE ? OR n.tags LIKE ?)
      ORDER BY n.created_at DESC
    `;
    const searchPattern = `%${searchQuery}%`;
    
    const [notes] = await query(sql, [
      searchPattern, searchPattern, searchPattern, searchPattern
    ]);
    
    res.json({
      success: true,
      data: notes,
      message: 'Notes search completed successfully'
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search notes'
    });
  }
});

// Get notes by module
router.get('/module/:moduleCode', async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const sql = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.module_code = ? AND n.visibility = 'public'
      ORDER BY n.created_at DESC
    `;
    
    const [notes] = await query(sql, [moduleCode]);
    
    res.json({
      success: true,
      data: notes,
      message: 'Module notes retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching module notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module notes'
    });
  }
});

module.exports = router;
