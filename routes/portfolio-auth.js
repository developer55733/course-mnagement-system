const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Portfolio Authentication Routes

// Register new portfolio user
router.post('/register', async (req, res) => {
    try {
        const { name, email, username, password, confirm_password } = req.body;
        
        if (!name || !email || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }
        
        if (password !== confirm_password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Passwords do not match' 
            });
        }
        
        // Check if email or username already exists
        const checkQuery = 'SELECT id FROM portfolio_users WHERE email = ? OR username = ?';
        const [existingUsers] = await pool.execute(checkQuery, [email, username]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email or username already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new portfolio user
        const insertQuery = `
            INSERT INTO portfolio_users (name, email, username, password, user_type) 
            VALUES (?, ?, ?, ?, 'portfolio')
        `;
        const [result] = await pool.execute(insertQuery, [name, email, username, hashedPassword]);
        
        // Get created user
        const selectQuery = `
            SELECT id, name, email, username, user_type, created_at 
            FROM portfolio_users WHERE id = ?
        `;
        const [users] = await pool.execute(selectQuery, [result.insertId]);
        const user = users[0];
        
        // Store user in session
        req.session.portfolioUserId = user.id;
        req.session.portfolioUser = user;
        
        res.json({
            success: true,
            message: 'Portfolio registration successful',
            user: user
        });
        
    } catch (error) {
        console.error('Portfolio registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed: ' + error.message 
        });
    }
});

// Login portfolio user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password are required' 
            });
        }
        
        // Find user by username or email
        const query = `
            SELECT id, name, email, username, password, user_type, created_at 
            FROM portfolio_users 
            WHERE username = ? OR email = ?
        `;
        const [users] = await pool.execute(query, [username, username]);
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid username or password' 
            });
        }
        
        const user = users[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid username or password' 
            });
        }
        
        // Remove password from response
        delete user.password;
        
        // Store user in session
        req.session.portfolioUserId = user.id;
        req.session.portfolioUser = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: user
        });
        
    } catch (error) {
        console.error('Portfolio login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed: ' + error.message 
        });
    }
});

// Logout portfolio user
router.post('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Logout failed' 
                });
            }
            
            res.json({
                success: true,
                message: 'Logout successful'
            });
        });
    } catch (error) {
        console.error('Portfolio logout error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Logout failed: ' + error.message 
        });
    }
});

// Get current portfolio user
router.get('/me', (req, res) => {
    try {
        if (!req.session.portfolioUser) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authenticated' 
            });
        }
        
        res.json({
            success: true,
            user: req.session.portfolioUser
        });
    } catch (error) {
        console.error('Get portfolio user error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get user: ' + error.message 
        });
    }
});

module.exports = router;
