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

// Update portfolio profile
router.put('/profile', async (req, res) => {
    try {
        const { name, title, bio, phone, location, website, category } = req.body;
        
        // Check if profile exists
        const [existing] = await pool.execute(`
            SELECT id FROM portfolio_profile WHERE user_id = ?
        `, [req.portfolioUserId]);
        
        if (existing.length > 0) {
            // Update existing profile
            await pool.execute(`
                UPDATE portfolio_profile 
                SET name = ?, title = ?, bio = ?, phone = ?, location = ?, website = ?, category = ?
                WHERE user_id = ?
            `, [name, title, bio, phone, location, website, category, req.portfolioUserId]);
        } else {
            // Create new profile
            await pool.execute(`
                INSERT INTO portfolio_profile (user_id, name, title, bio, phone, location, website, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [req.portfolioUserId, name, title, bio, phone, location, website, category]);
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update profile: ' + error.message 
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

module.exports = router;
