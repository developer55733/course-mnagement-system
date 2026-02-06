const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const router = express.Router();

// Create a new live stream
router.post('/create', async (req, res) => {
    try {
        const { title, description, scheduled_time, is_public } = req.body;
        const streamId = uuidv4();
        const joinLink = `https://course-management-system.up.railway.app/stream/join/${streamId}`;
        
        const sql = `
            INSERT INTO live_streams (id, title, description, scheduled_time, join_link, created_by, is_public, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `;
        
        await query(sql, [streamId, title, description, scheduled_time, joinLink, req.user?.id || 1, is_public ? 1 : 0]);
        
        res.json({
            success: true,
            data: {
                id: streamId,
                title,
                description,
                scheduled_time,
                join_link: joinLink,
                is_public
            }
        });
    } catch (error) {
        console.error('Error creating stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create stream'
        });
    }
});

// Get all streams
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT ls.*, u.name as created_by_name 
            FROM live_streams ls 
            LEFT JOIN users u ON ls.created_by = u.id 
            ORDER BY ls.created_at DESC
        `;
        const [streams] = await query(sql);
        
        res.json({
            success: true,
            data: streams
        });
    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch streams'
        });
    }
});

// Get stream by ID
router.get('/:id', async (req, res) => {
    try {
        const sql = `
            SELECT ls.*, u.name as created_by_name 
            FROM live_streams ls 
            LEFT JOIN users u ON ls.created_by = u.id 
            WHERE ls.id = ?
        `;
        const [streams] = await query(sql, [req.params.id]);
        
        if (streams.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Stream not found'
            });
        }
        
        res.json({
            success: true,
            data: streams[0]
        });
    } catch (error) {
        console.error('Error fetching stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stream'
        });
    }
});

// Join stream
router.get('/join/:id', async (req, res) => {
    try {
        const streamId = req.params.id;
        
        const sql = `
            SELECT * FROM live_streams 
            WHERE id = ? AND status IN ('scheduled', 'live')
        `;
        const [streams] = await query(sql, [streamId]);
        
        if (streams.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Stream not found or not active'
            });
        }
        
        const stream = streams[0];
        
        // Update participant count
        await query(
            'UPDATE live_streams SET participants = participants + 1 WHERE id = ?',
            [streamId]
        );
        
        res.json({
            success: true,
            data: {
                stream: stream,
                participant_id: uuidv4(),
                join_time: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error joining stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join stream'
        });
    }
});

// Start stream
router.post('/:id/start', async (req, res) => {
    try {
        const streamId = req.params.id;
        
        await query(
            'UPDATE live_streams SET status = ?, started_at = ? WHERE id = ?',
            ['live', new Date(), streamId]
        );
        
        res.json({
            success: true,
            message: 'Stream started successfully'
        });
    } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start stream'
        });
    }
});

// End stream
router.post('/:id/end', async (req, res) => {
    try {
        const streamId = req.params.id;
        
        await query(
            'UPDATE live_streams SET status = ?, ended_at = ? WHERE id = ?',
            ['ended', new Date(), streamId]
        );
        
        res.json({
            success: true,
            message: 'Stream ended successfully'
        });
    } catch (error) {
        console.error('Error ending stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end stream'
        });
    }
});

// Delete stream
router.delete('/:id', async (req, res) => {
    try {
        const streamId = req.params.id;
        
        await query('DELETE FROM live_streams WHERE id = ?', [streamId]);
        
        res.json({
            success: true,
            message: 'Stream deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete stream'
        });
    }
});

module.exports = router;
