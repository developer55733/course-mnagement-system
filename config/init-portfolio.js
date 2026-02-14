const { pool } = require('./config/database');

async function initializePortfolioTables() {
    try {
        console.log('🔍 Initializing portfolio database tables...');
        
        // Check if portfolio_users table exists
        const [portfolioUsersCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_users'
        `);
        
        if (portfolioUsersCheck[0].count === 0) {
            console.log('🔍 Creating portfolio_users table...');
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
            console.log('✅ portfolio_users table created');
        } else {
            console.log('✅ portfolio_users table already exists');
        }
        
        // Check if portfolio_profile table exists
        const [portfolioProfileCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_profile'
        `);
        
        if (portfolioProfileCheck[0].count === 0) {
            console.log('🔍 Creating portfolio_profile table...');
            await pool.execute(`
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
            `);
            console.log('✅ portfolio_profile table created');
        } else {
            console.log('✅ portfolio_profile table already exists');
        }
        
        // Check if portfolio_skills table exists
        const [portfolioSkillsCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_skills'
        `);
        
        if (portfolioSkillsCheck[0].count === 0) {
            console.log('🔍 Creating portfolio_skills table...');
            await pool.execute(`
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
            `);
            console.log('✅ portfolio_skills table created');
        } else {
            console.log('✅ portfolio_skills table already exists');
        }
        
        // Check if portfolio_experience table exists
        const [portfolioExperienceCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_experience'
        `);
        
        if (portfolioExperienceCheck[0].count === 0) {
            console.log('🔍 Creating portfolio_experience table...');
            await pool.execute(`
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
            `);
            console.log('✅ portfolio_experience table created');
        } else {
            console.log('✅ portfolio_experience table already exists');
        }
        
        // Check if portfolio_projects table exists
        const [portfolioProjectsCheck] = await pool.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'portfolio_projects'
        `);
        
        if (portfolioProjectsCheck[0].count === 0) {
            console.log('🔍 Creating portfolio_projects table...');
            await pool.execute(`
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
            `);
            console.log('✅ portfolio_projects table created');
        } else {
            console.log('✅ portfolio_projects table already exists');
        }
        
        console.log('🎉 Portfolio database initialization completed successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error initializing portfolio tables:', error);
        return false;
    }
}

module.exports = { initializePortfolioTables };
