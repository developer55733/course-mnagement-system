// Migration script for discussion replies table
// This script ensures the discussion_replies table exists on Railway database

const { query } = require('./config/database');

async function migrateDiscussionReplies() {
    try {
        console.log('🔄 Starting discussion replies migration...');

        // Check if discussion_replies table exists
        const tableCheck = await query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'discussion_replies'
        `);

        if (tableCheck[0].count > 0) {
            console.log('✅ discussion_replies table already exists');
            return true;
        }

        // Create discussion_replies table
        await query(`
            CREATE TABLE discussion_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                discussion_id INT NOT NULL,
                content TEXT NOT NULL,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_discussion_id (discussion_id),
                INDEX idx_created_by (created_by),
                INDEX idx_created_at (created_at),
                FOREIGN KEY (discussion_id) REFERENCES discussion_forum(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ discussion_replies table created successfully');

        // Check if user_sessions table exists
        const sessionCheck = await query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'user_sessions'
        `);

        if (sessionCheck[0].count === 0) {
            // Create user_sessions table
            await query(`
                CREATE TABLE user_sessions (
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
            `);
            console.log('✅ user_sessions table created successfully');
        } else {
            console.log('✅ user_sessions table already exists');
        }

        console.log('🎉 Migration completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return false;
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateDiscussionReplies()
        .then(success => {
            if (success) {
                console.log('✅ Migration completed successfully');
                process.exit(0);
            } else {
                console.log('❌ Migration failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Migration error:', error);
            process.exit(1);
        });
}

module.exports = migrateDiscussionReplies;
