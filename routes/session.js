const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Create secure session storage table if not exists
const createSessionTable = async () => {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                user_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                INDEX idx_session_id (session_id),
                INDEX idx_user_id (user_id),
                INDEX idx_expires_at (expires_at),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await query(sql);
        console.log('✅ User sessions table ready');
    } catch (error) {
        console.error('❌ Error creating sessions table:', error);
    }
};

// Initialize table on module load
createSessionTable();

// Generate secure session ID
function generateSessionId() {
    return require('crypto').randomBytes(32).toString('hex');
}

// Create or update session
router.post('/create', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        
        if (!userId || !userData) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID and data are required' 
            });
        }

        // Generate session ID
        const sessionId = generateSessionId();
        
        // Set expiration to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        // Clean up old sessions for this user
        await query('DELETE FROM user_sessions WHERE user_id = ? OR expires_at < NOW()', [userId]);
        
        // Insert new session
        const sql = `
            INSERT INTO user_sessions (session_id, user_id, user_data, expires_at)
            VALUES (?, ?, ?, ?)
        `;
        
        await query(sql, [sessionId, userId, JSON.stringify(userData), expiresAt]);
        
        // Set secure HTTP-only cookie
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({
            success: true,
            sessionId: sessionId,
            expiresAt: expiresAt
        });
        
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create session' 
        });
    }
});

// Get session data
router.get('/get', async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
        
        if (!sessionId) {
            return res.status(401).json({ 
                success: false, 
                error: 'No session found' 
            });
        }

        const sql = `
            SELECT user_id, user_data, expires_at
            FROM user_sessions
            WHERE session_id = ? AND expires_at > NOW()
        `;
        
        const [sessions] = await query(sql, [sessionId]);
        
        if (sessions.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Session expired or invalid' 
            });
        }

        const session = sessions[0];
        
        res.json({
            success: true,
            data: {
                userId: session.user_id,
                userData: JSON.parse(session.user_data),
                expiresAt: session.expires_at
            }
        });
        
    } catch (error) {
        console.error('Error getting session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get session' 
        });
    }
});

// Update session data
router.put('/update', async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
        const { userData } = req.body;
        
        if (!sessionId || !userData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Session ID and data are required' 
            });
        }

        const sql = `
            UPDATE user_sessions
            SET user_data = ?, updated_at = NOW()
            WHERE session_id = ? AND expires_at > NOW()
        `;
        
        const [result] = await query(sql, [JSON.stringify(userData), sessionId]);
        
        if (result.affectedRows === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Session expired or invalid' 
            });
        }

        res.json({
            success: true,
            message: 'Session updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update session' 
        });
    }
});

// Destroy session
router.delete('/destroy', async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
        
        if (!sessionId) {
            return res.status(400).json({ 
                success: false, 
                error: 'No session found' 
            });
        }

        await query('DELETE FROM user_sessions WHERE session_id = ?', [sessionId]);
        
        // Clear cookie
        res.clearCookie('sessionId');
        
        res.json({
            success: true,
            message: 'Session destroyed successfully'
        });
        
    } catch (error) {
        console.error('Error destroying session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to destroy session' 
        });
    }
});

// Clean up expired sessions (run periodically)
router.post('/cleanup', async (req, res) => {
    try {
        const [result] = await query('DELETE FROM user_sessions WHERE expires_at < NOW()');
        
        res.json({
            success: true,
            message: `Cleaned up ${result.affectedRows} expired sessions`
        });
        
    } catch (error) {
        console.error('Error cleaning up sessions:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to cleanup sessions' 
        });
    }
});

module.exports = router;
