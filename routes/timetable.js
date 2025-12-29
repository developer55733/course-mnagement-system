const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// Get all timetable entries
router.get('/', timetableController.getAllTimetables);

// Get timetable entry by ID
router.get('/:id', timetableController.getTimetableById);

// Get timetable by module
router.get('/module/:module', timetableController.getTimetableByModule);

// Create new timetable entry
router.post('/', timetableController.createTimetable);

// Update timetable entry
router.put('/:id', timetableController.updateTimetable);

// Delete timetable entry
router.delete('/:id', timetableController.deleteTimetable);

module.exports = router;
