const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all class timetable entries
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM class_timetable 
            ORDER BY day_of_week, start_time
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching class timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class timetable'
        });
    }
});

// Add new class timetable entry
router.post('/', async (req, res) => {
    try {
        const {
            module_code,
            module_name,
            lecturer_name,
            venue,
            day_of_week,
            start_time,
            end_time
        } = req.body;

        // Validate required fields
        if (!module_code || !module_name || !lecturer_name || !venue || !day_of_week || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Insert into database
        const [result] = await pool.execute(`
            INSERT INTO class_timetable 
            (module_code, module_name, lecturer_name, venue, day_of_week, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [module_code, module_name, lecturer_name, venue, day_of_week, start_time, end_time]);

        res.json({
            success: true,
            message: 'Class session added successfully',
            data: {
                id: result.insertId,
                module_code,
                module_name,
                lecturer_name,
                venue,
                day_of_week,
                start_time,
                end_time
            }
        });
    } catch (error) {
        console.error('Error adding class timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding class session'
        });
    }
});

// Delete class timetable entry
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(`
            DELETE FROM class_timetable WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class session not found'
            });
        }

        res.json({
            success: true,
            message: 'Class session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting class timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting class session'
        });
    }
});

// Update class timetable entry
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            module_code,
            module_name,
            lecturer_name,
            venue,
            day_of_week,
            start_time,
            end_time
        } = req.body;

        // Validate required fields
        if (!module_code || !module_name || !lecturer_name || !venue || !day_of_week || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const [result] = await pool.execute(`
            UPDATE class_timetable 
            SET module_code = ?, module_name = ?, lecturer_name = ?, venue = ?, 
                day_of_week = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [module_code, module_name, lecturer_name, venue, day_of_week, start_time, end_time, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Class session not found'
            });
        }

        res.json({
            success: true,
            message: 'Class session updated successfully'
        });
    } catch (error) {
        console.error('Error updating class timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating class session'
        });
    }
});

module.exports = router;
