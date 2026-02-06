const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const router = express.Router();

// Create a new live meeting
router.post('/create', async (req, res) => {
    try {
        const { title, description, scheduled_time, duration, is_public, password_required } = req.body;
        const meetingId = uuidv4();
        const joinLink = `https://course-management-system.up.railway.app/meeting/join/${meetingId}`;
        const hostLink = `https://course-management-system.up.railway.app/meeting/host/${meetingId}`;
        
        const sql = `
            INSERT INTO live_meetings (id, title, description, scheduled_time, duration, join_link, host_link, created_by, is_public, password_required, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `;
        
        await query(sql, [
            meetingId, title, description, scheduled_time, duration, 
            joinLink, hostLink, req.user?.id || 1, is_public ? 1 : 0, password_required ? 1 : 0
        ]);
        
        res.json({
            success: true,
            data: {
                id: meetingId,
                title,
                description,
                scheduled_time,
                duration,
                join_link: joinLink,
                host_link: hostLink,
                is_public,
                password_required
            }
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create meeting'
        });
    }
});

// Get all meetings
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT lm.*, u.name as created_by_name 
            FROM live_meetings lm 
            LEFT JOIN users u ON lm.created_by = u.id 
            ORDER BY lm.created_at DESC
        `;
        const [meetings] = await query(sql);
        
        res.json({
            success: true,
            data: meetings
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meetings'
        });
    }
});

// Get meeting by ID
router.get('/:id', async (req, res) => {
    try {
        const sql = `
            SELECT lm.*, u.name as created_by_name 
            FROM live_meetings lm 
            LEFT JOIN users u ON lm.created_by = u.id 
            WHERE lm.id = ?
        `;
        const [meetings] = await query(sql, [req.params.id]);
        
        if (meetings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }
        
        res.json({
            success: true,
            data: meetings[0]
        });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch meeting'
        });
    }
});

// Join meeting as participant
router.get('/join/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        
        const sql = `
            SELECT * FROM live_meetings 
            WHERE id = ? AND status IN ('scheduled', 'live')
        `;
        const [meetings] = await query(sql, [meetingId]);
        
        if (meetings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found or not active'
            });
        }
        
        const meeting = meetings[0];
        const participantId = uuidv4();
        
        // Add participant to meeting
        await query(
            'INSERT INTO meeting_participants (id, meeting_id, joined_at, role) VALUES (?, ?, ?, ?)',
            [participantId, meetingId, new Date(), 'participant']
        );
        
        // Update participant count
        await query(
            'UPDATE live_meetings SET participants = participants + 1 WHERE id = ?',
            [meetingId]
        );
        
        res.json({
            success: true,
            data: {
                meeting: meeting,
                participant_id: participantId,
                join_time: new Date().toISOString(),
                role: 'participant'
            }
        });
    } catch (error) {
        console.error('Error joining meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join meeting'
        });
    }
});

// Host meeting
router.get('/host/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        
        const sql = `
            SELECT * FROM live_meetings 
            WHERE id = ? AND status IN ('scheduled', 'live')
        `;
        const [meetings] = await query(sql, [meetingId]);
        
        if (meetings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found or not active'
            });
        }
        
        const meeting = meetings[0];
        const hostId = uuidv4();
        
        // Add host to meeting
        await query(
            'INSERT INTO meeting_participants (id, meeting_id, joined_at, role) VALUES (?, ?, ?, ?)',
            [hostId, meetingId, new Date(), 'host']
        );
        
        res.json({
            success: true,
            data: {
                meeting: meeting,
                participant_id: hostId,
                join_time: new Date().toISOString(),
                role: 'host',
                is_host: true
            }
        });
    } catch (error) {
        console.error('Error hosting meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to host meeting'
        });
    }
});

// Start meeting
router.post('/:id/start', async (req, res) => {
    try {
        const meetingId = req.params.id;
        
        await query(
            'UPDATE live_meetings SET status = ?, started_at = ? WHERE id = ?',
            ['live', new Date(), meetingId]
        );
        
        res.json({
            success: true,
            message: 'Meeting started successfully'
        });
    } catch (error) {
        console.error('Error starting meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start meeting'
        });
    }
});

// End meeting
router.post('/:id/end', async (req, res) => {
    try {
        const meetingId = req.params.id;
        
        await query(
            'UPDATE live_meetings SET status = ?, ended_at = ? WHERE id = ?',
            ['ended', new Date(), meetingId]
        );
        
        res.json({
            success: true,
            message: 'Meeting ended successfully'
        });
    } catch (error) {
        console.error('Error ending meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end meeting'
        });
    }
});

// Get meeting participants
router.get('/:id/participants', async (req, res) => {
    try {
        const sql = `
            SELECT mp.*, u.name as user_name 
            FROM meeting_participants mp 
            LEFT JOIN users u ON mp.user_id = u.id 
            WHERE mp.meeting_id = ?
            ORDER BY mp.joined_at ASC
        `;
        const [participants] = await query(sql, [req.params.id]);
        
        res.json({
            success: true,
            data: participants
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch participants'
        });
    }
});

// Delete meeting
router.delete('/:id', async (req, res) => {
    try {
        const meetingId = req.params.id;
        
        await query('DELETE FROM live_meetings WHERE id = ?', [meetingId]);
        await query('DELETE FROM meeting_participants WHERE meeting_id = ?', [meetingId]);
        
        res.json({
            success: true,
            message: 'Meeting deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete meeting'
        });
    }
});

module.exports = router;
