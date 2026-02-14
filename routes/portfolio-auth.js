const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Helper function to ensure portfolio tables exist
async function ensurePortfolioTables() {
    try {
        // Check if portfolio_users table exists
        const [portfolioUsersCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_users'
        `);
        
        if (portfolioUsersCheck[0].count === 0) {
            console.log('🔍 Creating portfolio_users table (on-demand)...');
            await pool.execute(`
                CREATE TABLE portfolio_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    user_type ENUM('portfolio') DEFAULT 'portfolio',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_email (email),
                    INDEX idx_username (username),
                    INDEX idx_user_type (user_type)
                )
            `);
            console.log('✅ portfolio_users table created (on-demand)');
        }
        
        // Check and create other portfolio tables if needed
        const tables = [
            {
                name: 'portfolio_profile',
                sql: `
                    CREATE TABLE portfolio_profile (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        title VARCHAR(100),
                        bio TEXT,
                        phone VARCHAR(20),
                        location VARCHAR(100),
                        website VARCHAR(200),
                        avatar VARCHAR(500),
                        category ENUM('business', 'services', 'student', 'freelancer', 'professional', 'academic'),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_user_id (user_id)
                    )
                `
            },
            {
                name: 'portfolio_skills',
                sql: `
                    CREATE TABLE portfolio_skills (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        name VARCHAR(100) NOT NULL,
                        level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
                        category ENUM('technical', 'soft', 'language', 'tool') DEFAULT 'technical',
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_user_id (user_id),
                        INDEX idx_level (level),
                        INDEX idx_category (category)
                    )
                `
            },
            {
                name: 'portfolio_experience',
                sql: `
                    CREATE TABLE portfolio_experience (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        company VARCHAR(100) NOT NULL,
                        position VARCHAR(100) NOT NULL,
                        start_date DATE NOT NULL,
                        end_date DATE,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_user_id (user_id),
                        INDEX idx_start_date (start_date)
                    )
                `
            },
            {
                name: 'portfolio_projects',
                sql: `
                    CREATE TABLE portfolio_projects (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        technologies VARCHAR(200),
                        link VARCHAR(500),
                        image VARCHAR(500),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_user_id (user_id)
                    )
                `
            }
        ];
        
        for (const table of tables) {
            const [check] = await pool.execute(`
                SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_schema = DATABASE() AND table_name = ?
            `, [table.name]);
            
            if (check[0].count === 0) {
                console.log(`🔍 Creating ${table.name} table (on-demand)...`);
                await pool.execute(table.sql);
                console.log(`✅ ${table.name} table created (on-demand)`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error ensuring portfolio tables:', error);
        return false;
    }
}

// Portfolio Authentication Routes

// Register new portfolio user
router.post('/register', async (req, res) => {
    try {
        // Ensure portfolio tables exist before proceeding
        const tablesReady = await ensurePortfolioTables();
        if (!tablesReady) {
            return res.status(500).json({ 
                success: false, 
                error: 'Database setup failed. Please try again.' 
            });
        }
        
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
        // Ensure portfolio tables exist before proceeding
        const tablesReady = await ensurePortfolioTables();
        if (!tablesReady) {
            return res.status(500).json({ 
                success: false, 
                error: 'Database setup failed. Please try again.' 
            });
        }
        
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
