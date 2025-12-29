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

module.exports = router;
