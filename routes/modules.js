const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const adminAuth = require('../middleware/adminAuth');

// Get all modules
router.get('/', moduleController.getAllModules);

// Get module by ID
router.get('/:id', moduleController.getModuleById);

// Get module by code
router.get('/code/:code', moduleController.getModuleByCode);

// Create new module
router.post('/', adminAuth, moduleController.createModule);

// Update module
router.put('/:id', adminAuth, moduleController.updateModule);

// Delete module
router.delete('/:id', adminAuth, moduleController.deleteModule);

// Clear all modules
router.delete('/clear', adminAuth, moduleController.clearAllModules);

module.exports = router;
