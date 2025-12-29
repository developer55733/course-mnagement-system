const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const adminAuth = require('../middleware/adminAuth');

// Get settings
router.get('/', settingsController.getSettings);

// Update settings
router.put('/', adminAuth, settingsController.updateSettings);

module.exports = router;
