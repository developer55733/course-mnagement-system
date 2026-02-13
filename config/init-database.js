// Database initialization script for Railway deployment
// This script will automatically create the new tables if they don't exist

const { pool } = require('./database');

async function initializeDatabase() {
    console.log('🔄 Initializing database tables...');
    
    try {
        // Create discussion forum table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS discussion_forum (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                module_code VARCHAR(50),
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_module (module_code),
                INDEX idx_created_by (created_by),
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ discussion_forum table created/verified');

        // Create discussion replies table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS discussion_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                discussion_id INT NOT NULL,
                content TEXT NOT NULL,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_discussion (discussion_id),
                INDEX idx_created_by (created_by),
                FOREIGN KEY (discussion_id) REFERENCES discussion_forum(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ discussion_replies table created/verified');

        // Create assignments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                module_code VARCHAR(50) NOT NULL,
                module_name VARCHAR(100) NOT NULL,
                due_date DATETIME NOT NULL,
                posted_by INT NOT NULL,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_module (module_code),
                INDEX idx_due_date (due_date),
                INDEX idx_status (status),
                INDEX idx_posted_by (posted_by),
                FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ assignments table created/verified');

        // Create assignment notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assignment_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                user_id INT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_assignment (assignment_id),
                INDEX idx_user (user_id),
                INDEX idx_is_read (is_read),
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ assignment_notifications table created/verified');

        // Create blogs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) DEFAULT 'other',
                excerpt TEXT,
                content LONGTEXT,
                tags JSON,
                featured_image VARCHAR(500),
                status ENUM('draft', 'published') DEFAULT 'draft',
                views INT DEFAULT 0,
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_category (category),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('✅ blogs table created/verified');

        // Create portfolio profile table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolio_profile (
                id INT PRIMARY KEY DEFAULT 1,
                name VARCHAR(255),
                title VARCHAR(255),
                bio TEXT,
                email VARCHAR(255),
                phone VARCHAR(50),
                location VARCHAR(255),
                website VARCHAR(500),
                avatar VARCHAR(500),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ portfolio_profile table created/verified');

        // Create portfolio skills table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolio_skills (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
                category VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_level (level),
                INDEX idx_category (category)
            )
        `);
        console.log('✅ portfolio_skills table created/verified');

        // Create portfolio experience table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolio_experience (
                id VARCHAR(255) PRIMARY KEY,
                company VARCHAR(255),
                position VARCHAR(255),
                start_date DATE,
                end_date DATE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_start_date (start_date),
                INDEX idx_company (company)
            )
        `);
        console.log('✅ portfolio_experience table created/verified');

        // Create portfolio projects table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolio_projects (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                technologies VARCHAR(500),
                link VARCHAR(500),
                image VARCHAR(500),
                status ENUM('active', 'completed', 'archived') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('✅ portfolio_projects table created/verified');

        // Create portfolio CV table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolio_cv (
                id INT PRIMARY KEY DEFAULT 1,
                education JSON,
                certifications JSON,
                languages JSON,
                references JSON,
                summary TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ portfolio_cv table created/verified');

        // Create notifications table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type ENUM('session_reminder', 'new_content', 'assignment_due', 'discussion_reply', 'test_reminder', 'module_update') NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                related_id INT,
                related_type VARCHAR(50),
                is_read BOOLEAN DEFAULT FALSE,
                email_sent BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_type (type),
                INDEX idx_is_read (is_read),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ notifications table created/verified');

        // Create notification preferences table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notification_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                email_notifications BOOLEAN DEFAULT TRUE,
                session_reminders BOOLEAN DEFAULT TRUE,
                new_content_notifications BOOLEAN DEFAULT TRUE,
                assignment_notifications BOOLEAN DEFAULT TRUE,
                discussion_notifications BOOLEAN DEFAULT TRUE,
                test_notifications BOOLEAN DEFAULT TRUE,
                reminder_minutes INT DEFAULT 20,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ notification_preferences table created/verified');

        // Create scheduled sessions table for reminders
        await db.query(`
            CREATE TABLE IF NOT EXISTS scheduled_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                session_type ENUM('class', 'discussion', 'assignment', 'test', 'module', 'study_notes') NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME,
                related_id INT,
                related_type VARCHAR(50),
                all_users BOOLEAN DEFAULT FALSE,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_start_time (start_time),
                INDEX idx_session_type (session_type),
                INDEX idx_created_by (created_by),
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ scheduled_sessions table created/verified');

        console.log('🎉 All new database tables initialized successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error initializing database tables:', error);
        return false;
    }
}

module.exports = initializeDatabase;
