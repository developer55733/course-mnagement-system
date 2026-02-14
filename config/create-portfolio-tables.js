const { pool } = require('./config/database');

async function createPortfolioTables() {
    try {
        console.log('🔍 Creating portfolio tables...');
        
        // Create portfolio_users table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS portfolio_users (
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

        // Create portfolio_profile table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS portfolio_profile (
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
                FOREIGN KEY (user_id) REFERENCES portfolio_users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            )
        `);
        console.log('✅ portfolio_profile table created');

        // Create portfolio_skills table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS portfolio_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
                category ENUM('technical', 'soft', 'language', 'tool') DEFAULT 'technical',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES portfolio_users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_level (level),
                INDEX idx_category (category)
            )
        `);
        console.log('✅ portfolio_skills table created');

        // Create portfolio_experience table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS portfolio_experience (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                company VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES portfolio_users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_start_date (start_date)
            )
        `);
        console.log('✅ portfolio_experience table created');

        // Create portfolio_projects table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS portfolio_projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                technologies VARCHAR(200),
                link VARCHAR(500),
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES portfolio_users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            )
        `);
        console.log('✅ portfolio_projects table created');

        console.log('🎉 All portfolio tables created successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating portfolio tables:', error);
        return false;
    }
}

module.exports = { createPortfolioTables };
