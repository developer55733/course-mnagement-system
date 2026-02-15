const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

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
                        name VARCHAR(100) NOT NULL,
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

// Middleware to check authentication
function authenticatePortfolio(req, res, next) {
    if (!req.session || !req.session.portfolioUserId) {
        return res.status(401).json({ 
            success: false, 
            error: 'Authentication required' 
        });
    }
    req.portfolioUserId = req.session.portfolioUserId;
    next();
}

// Apply authentication middleware to all routes
router.use(authenticatePortfolio);

// Get portfolio profile
router.get('/profile', async (req, res) => {
    try {
        const [profiles] = await pool.execute(`
            SELECT * FROM portfolio_profile WHERE user_id = ?
        `, [req.portfolioUserId]);
        
        res.json(profiles[0] || {});
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch profile: ' + error.message 
        });
    }
});

// Basic test endpoint to check if routing works
router.get('/test-basic', (req, res) => {
    console.log('🧪 Basic test endpoint hit');
    res.json({
        success: true,
        message: 'Basic test endpoint working',
        timestamp: new Date().toISOString()
    });
});

// Simple test endpoint to bypass middleware and test profile update directly
router.put('/profile-simple', async (req, res) => {
    try {
        console.log('🧪 Simple profile update test');
        console.log('📋 Request body:', req.body);
        console.log('👤 Session data:', req.session);
        
        // Get user ID from session directly
        const userId = req.session?.portfolioUserId;
        console.log('🔍 User ID from session:', userId);
        
        if (!userId) {
            console.error('❌ No user ID found in session');
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        const { name, title, bio, phone, location, website, category } = req.body;
        
        console.log('📊 Simple test data:', { name, title, bio, phone, location, website, category });
        
        // Simple test - just update name field
        const result = await pool.execute(`
            UPDATE portfolio_profile 
            SET name = ?, updated_at = NOW()
            WHERE user_id = ?
        `, [name, userId]);
        
        console.log('✅ Simple update result:', result);
        console.log('✅ Simple affected rows:', result.affectedRows);
        
        res.json({
            success: true,
            message: 'Simple profile update successful',
            affectedRows: result.affectedRows
        });
        
    } catch (error) {
        console.error('❌ Simple profile update error:', error);
        console.error('❌ Simple error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update portfolio profile
router.put('/profile', async (req, res) => {
    try {
        console.log('🔍 Profile update request received');
        console.log('📋 Request body:', req.body);
        console.log('👤 Portfolio user ID:', req.portfolioUserId);
        console.log('🔍 Request headers:', req.headers);
        console.log('🔍 Request method:', req.method);
        console.log('🔍 Request URL:', req.url);
        
        const { name, title, bio, phone, location, website, category } = req.body;
        
        console.log('📊 Extracted fields:', { name, title, bio, phone, location, website, category });
        console.log('📊 Field types:', {
            name: typeof name,
            title: typeof title,
            bio: typeof bio,
            phone: typeof phone,
            location: typeof location,
            website: typeof website,
            category: typeof category
        });
        
        // Validate required fields
        if (!name || !title || !bio || !phone || !location || !website || !category) {
            console.error('❌ Missing required fields:', { name, title, bio, phone, location, website, category });
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Check if profile exists
        console.log('🔍 Checking if profile exists for user:', req.portfolioUserId);
        const [existing] = await pool.execute(`
            SELECT id FROM portfolio_profile WHERE user_id = ?
        `, [req.portfolioUserId]);
        
        console.log('📋 Existing profile check:', existing.length > 0 ? 'Found' : 'Not found');
        console.log('📋 Existing profile data:', existing);
        
        if (existing.length > 0) {
            console.log('🔧 Updating existing profile...');
            // Update existing profile
            const result = await pool.execute(`
                UPDATE portfolio_profile 
                SET name = ?, title = ?, bio = ?, phone = ?, location = ?, website = ?, category = ?
                WHERE user_id = ?
            `, [name, title, bio, phone, location, website, category, req.portfolioUserId]);
            
            console.log('✅ Profile update result:', result);
            console.log('✅ Affected rows:', result.affectedRows);
        } else {
            console.log('🔧 Creating new profile...');
            // Create new profile
            const result = await pool.execute(`
                INSERT INTO portfolio_profile (user_id, name, title, bio, phone, location, website, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [req.portfolioUserId, name, title, bio, phone, location, website, category]);
            
            console.log('✅ Profile insert result:', result);
            console.log('✅ Insert ID:', result.insertId);
        }
        
        console.log('🔍 Sending success response');
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        console.error('❌ Full error object:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to update profile'
        });
    }
});

// Get portfolio skills
router.get('/skills', async (req, res) => {
    try {
        const [skills] = await pool.execute(`
            SELECT * FROM portfolio_skills WHERE user_id = ? ORDER BY created_at DESC
        `, [req.portfolioUserId]);
        
        res.json(skills);
    } catch (error) {
        console.error('❌ Error fetching skills:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch skills: ' + error.message 
        });
    }
});

// Add portfolio skill
router.post('/skills', async (req, res) => {
    try {
        const { name, level, category, description } = req.body;
        
        const [result] = await pool.execute(`
            INSERT INTO portfolio_skills (user_id, name, level, category, description)
            VALUES (?, ?, ?, ?, ?)
        `, [req.portfolioUserId, name, level, category, description]);
        
        res.json({
            success: true,
            message: 'Skill added successfully',
            skillId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error adding skill:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add skill: ' + error.message 
        });
    }
});

// Delete portfolio skill
router.delete('/skills/:id', async (req, res) => {
    try {
        const skillId = req.params.id;
        
        const [result] = await pool.execute(`
            DELETE FROM portfolio_skills WHERE id = ? AND user_id = ?
        `, [skillId, req.portfolioUserId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Skill not found or access denied' 
            });
        }
        
        res.json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting skill:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete skill: ' + error.message 
        });
    }
});

// Get portfolio experience
router.get('/experience', async (req, res) => {
    try {
        const [experience] = await pool.execute(`
            SELECT * FROM portfolio_experience WHERE user_id = ? ORDER BY start_date DESC
        `, [req.portfolioUserId]);
        
        res.json(experience);
    } catch (error) {
        console.error('❌ Error fetching experience:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch experience: ' + error.message 
        });
    }
});

// Add portfolio experience
router.post('/experience', async (req, res) => {
    try {
        const { company, position, start_date, end_date, description } = req.body;
        
        const [result] = await pool.execute(`
            INSERT INTO portfolio_experience (user_id, company, position, start_date, end_date, description)
            VALUES (?, ?, ?, ?, ?)
        `, [req.portfolioUserId, company, position, start_date, end_date, description]);
        
        res.json({
            success: true,
            message: 'Experience added successfully',
            experienceId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error adding experience:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add experience: ' + error.message 
        });
    }
});

// Delete portfolio experience
router.delete('/experience/:id', async (req, res) => {
    try {
        const expId = req.params.id;
        
        const [result] = await pool.execute(`
            DELETE FROM portfolio_experience WHERE id = ? AND user_id = ?
        `, [expId, req.portfolioUserId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Experience not found or access denied' 
            });
        }
        
        res.json({
            success: true,
            message: 'Experience deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting experience:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete experience: ' + error.message 
        });
    }
});

// Get portfolio projects
router.get('/projects', async (req, res) => {
    try {
        const [projects] = await pool.execute(`
            SELECT * FROM portfolio_projects WHERE user_id = ? ORDER BY created_at DESC
        `, [req.portfolioUserId]);
        
        res.json(projects);
    } catch (error) {
        console.error('❌ Error fetching projects:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch projects: ' + error.message 
        });
    }
});

// Add portfolio project
router.post('/projects', async (req, res) => {
    try {
        const { name, description, technologies, link, image } = req.body;
        
        const [result] = await pool.execute(`
            INSERT INTO portfolio_projects (user_id, name, description, technologies, link, image)
            VALUES (?, ?, ?, ?, ?)
        `, [req.portfolioUserId, name, description, technologies, link, image]);
        
        res.json({
            success: true,
            message: 'Project added successfully',
            projectId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error adding project:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add project: ' + error.message 
        });
    }
});

// Delete portfolio project
router.delete('/projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        const [result] = await pool.execute(`
            DELETE FROM portfolio_projects WHERE id = ? AND user_id = ?
        `, [projectId, req.portfolioUserId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Project not found or access denied' 
            });
        }
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting project:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete project: ' + error.message 
        });
    }
});

// Test endpoint to verify portfolio API is working
router.get('/test', async (req, res) => {
    try {
        console.log('🧪 Portfolio API test endpoint hit');
        
        // Check if user is authenticated
        if (!req.session || !req.session.portfolioUserId) {
            console.log('❌ No portfolio session found');
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        console.log('👤 Portfolio user ID from session:', req.session.portfolioUserId);
        
        // Test database connection
        const [test] = await pool.execute('SELECT 1 as test');
        console.log('✅ Database test result:', test);
        
        res.json({
            success: true,
            message: 'Portfolio API is working',
            user_id: req.session.portfolioUserId,
            database_test: test
        });
        
    } catch (error) {
        console.error('❌ Portfolio API test error:', error);
        res.status(500).json({
            success: false,
            error: 'Portfolio API test failed: ' + error.message
        });
    }
});

// Comprehensive database diagnostic endpoint
router.get('/diagnose', async (req, res) => {
    try {
        console.log('🔍 Database diagnostic started');
        
        // Check database connection
        const [test] = await pool.execute('SELECT 1 as test');
        console.log('✅ Database connection test:', test);
        
        // Check if portfolio_users table exists
        const [tableCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_users'
        `);
        
        console.log('📊 Portfolio_users table exists:', tableCheck[0].count > 0);
        
        // Check if portfolio_profile table exists
        const [profileTableCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_profile'
        `);
        
        console.log('📊 Portfolio_profile table exists:', profileTableCheck[0].count > 0);
        
        // Check if user exists in portfolio_users
        const [userCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM portfolio_users LIMIT 1
        `);
        
        console.log('📊 Portfolio_users has data:', userCheck[0].count > 0);
        
        // Check session info
        console.log('🔍 Session info:', {
            hasSession: !!req.session,
            portfolioUserId: req.session?.portfolioUserId || 'none',
            portfolioUser: req.session?.portfolioUser || 'none'
        });
        
        // Test a simple insert to portfolio_users
        if (tableCheck[0].count > 0) {
            const testUser = {
                name: 'Diagnostic User',
                email: 'test@diagnostic.com',
                username: 'diag_user',
                password: 'testpass123',
                user_type: 'portfolio'
            };
            
            const hashedPassword = await bcrypt.hash('testpass123', 10);
            
            const [insertTest] = await pool.execute(`
                INSERT INTO portfolio_users (name, email, username, password, user_type, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [testUser.name, testUser.email, testUser.username, hashedPassword, testUser.user_type]);
            
            console.log('✅ Test insert result:', insertTest);
            
            // Clean up test user
            await pool.execute('DELETE FROM portfolio_users WHERE username = ?', ['diag_user']);
        }
        
        res.json({
            success: true,
            message: 'Database diagnostic completed',
            diagnostics: {
                database_connection: test && test.length > 0,
                portfolio_users_table: tableCheck[0].count > 0,
                portfolio_profile_table: profileTableCheck[0].count > 0,
                portfolio_users_data: userCheck[0].count > 0,
                session_info: {
                    hasSession: !!req.session,
                    portfolioUserId: req.session?.portfolioUserId || 'none',
                    portfolioUser: req.session?.portfolioUser || 'none'
                },
                test_insert: insertTest && insertTest.insertId > 0
            }
        });
        
    } catch (error) {
        console.error('❌ Database diagnostic error:', error);
        res.status(500).json({
            success: false,
            error: 'Database diagnostic failed: ' + error.message
        });
    }
});

module.exports = router;
