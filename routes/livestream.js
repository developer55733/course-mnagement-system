const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const router = express.Router();

// Generate unique room ID
function generateRoomId() {
    return uuidv4().substring(0, 8).toUpperCase();
}

// Create live streaming session
router.post('/create-stream', async (req, res) => {
    try {
        const { title, description, scheduled_time, duration, created_by } = req.body;
        
        const streamId = generateRoomId();
        const streamLink = `https://course-management-system.up.railway.app/stream/${streamId}`;
        
        const sql = `
            INSERT INTO live_streams (id, title, description, stream_link, scheduled_time, duration, created_by, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())
        `;
        
        await query(sql, [streamId, title, description, streamLink, scheduled_time, duration, created_by]);
        
        res.json({
            success: true,
            data: {
                streamId,
                title,
                description,
                streamLink,
                scheduled_time,
                duration,
                status: 'scheduled'
            },
            message: 'Live stream created successfully'
        });
    } catch (error) {
        console.error('Error creating stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create live stream'
        });
    }
});

// Create live meeting session
router.post('/create-meeting', async (req, res) => {
    try {
        const { title, description, scheduled_time, duration, max_participants, created_by } = req.body;
        
        const meetingId = generateRoomId();
        const meetingLink = `https://course-management-system.up.railway.app/meeting/${meetingId}`;
        
        const sql = `
            INSERT INTO live_meetings (id, title, description, meeting_link, scheduled_time, duration, max_participants, created_by, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())
        `;
        
        await query(sql, [meetingId, title, description, meetingLink, scheduled_time, duration, max_participants, created_by]);
        
        res.json({
            success: true,
            data: {
                meetingId,
                title,
                description,
                meetingLink,
                scheduled_time,
                duration,
                max_participants,
                status: 'scheduled'
            },
            message: 'Live meeting created successfully'
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create live meeting'
        });
    }
});

// Get all live streams
router.get('/streams', async (req, res) => {
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
            data: streams,
            message: 'Live streams retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch live streams'
        });
    }
});

// Get all live meetings
router.get('/meetings', async (req, res) => {
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
            data: meetings,
            message: 'Live meetings retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch live meetings'
        });
    }
});

// Join live stream
router.get('/stream/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT ls.*, u.name as created_by_name 
            FROM live_streams ls 
            LEFT JOIN users u ON ls.created_by = u.id 
            WHERE ls.id = ?
        `;
        
        const [streams] = await query(sql, [id]);
        
        if (streams.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Stream not found'
            });
        }
        
        const stream = streams[0];
        
        // Update participant count
        await query('UPDATE live_streams SET participants = participants + 1 WHERE id = ?', [id]);
        
        res.json({
            success: true,
            data: {
                ...stream,
                streamUrl: stream.stream_link,
                joinTime: new Date().toISOString()
            },
            message: 'Joined stream successfully'
        });
    } catch (error) {
        console.error('Error joining stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join stream'
        });
    }
});

// Join live meeting
router.get('/meeting/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT lm.*, u.name as created_by_name 
            FROM live_meetings lm 
            LEFT JOIN users u ON lm.created_by = u.id 
            WHERE lm.id = ?
        `;
        
        const [meetings] = await query(sql, [id]);
        
        if (meetings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }
        
        const meeting = meetings[0];
        
        // Check if meeting has reached max participants
        if (meeting.participants >= meeting.max_participants) {
            return res.status(400).json({
                success: false,
                error: 'Meeting has reached maximum participants'
            });
        }
        
        // Update participant count
        await query('UPDATE live_meetings SET participants = participants + 1 WHERE id = ?', [id]);
        
        res.json({
            success: true,
            data: {
                ...meeting,
                meetingUrl: meeting.meeting_link,
                joinTime: new Date().toISOString()
            },
            message: 'Joined meeting successfully'
        });
    } catch (error) {
        console.error('Error joining meeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join meeting'
        });
    }
});

// Start stream
router.post('/start-stream/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await query('UPDATE live_streams SET status = "live", started_at = NOW() WHERE id = ?', [id]);
        
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

// Start meeting
router.post('/start-meeting/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await query('UPDATE live_meetings SET status = "live", started_at = NOW() WHERE id = ?', [id]);
        
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

// End stream
router.post('/end-stream/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await query('UPDATE live_streams SET status = "ended", ended_at = NOW() WHERE id = ?', [id]);
        
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

// End meeting
router.post('/end-meeting/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await query('UPDATE live_meetings SET status = "ended", ended_at = NOW() WHERE id = ?', [id]);
        
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

module.exports = router;
