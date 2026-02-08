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

        console.log('🎉 All new database tables initialized successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error initializing database tables:', error);
        return false;
    }
}

module.exports = initializeDatabase;
