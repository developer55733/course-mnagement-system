const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const adminAuth = require('../middleware/adminAuth');

// Get all lecturers
router.get('/', lecturerController.getAllLecturers);

// Get lecturer by ID
router.get('/:id', lecturerController.getLecturerById);

// Get lecturers by module
router.get('/module/:module', lecturerController.getLecturersByModule);

// Create new lecturer
router.post('/', adminAuth, lecturerController.createLecturer);

// Update lecturer
router.put('/:id', adminAuth, lecturerController.updateLecturer);

// Delete lecturer
router.delete('/:id', adminAuth, lecturerController.deleteLecturer);

// Clear all lecturers
router.delete('/clear', adminAuth, lecturerController.clearAllLecturers);

module.exports = router;
