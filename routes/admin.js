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
      settings: 'SELECT COUNT(*) AS count FROM settings'
    };

    const results = {};
    for (const [key, q] of Object.entries(queries)) {
      try {
        const [rows] = await pool.query(q);
        results[key] = rows[0]?.count || 0;
      } catch (e) {
        results[key] = 0;
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
