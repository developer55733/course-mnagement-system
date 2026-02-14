// Migration script for blog interactions (likes, views)
const { pool } = require('./config/database');

async function migrateBlogInteractions() {
    try {
        console.log('🔍 Starting blog interactions migration...');
        
        // Check if blog_likes table exists
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'blog_likes'
        `);
        
        if (tables.length === 0) {
            console.log('➕ Creating blog_likes table...');
            
            // Create blog_likes table
            await pool.query(`
                CREATE TABLE blog_likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    blog_id VARCHAR(255) NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    user_name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_blog_id (blog_id),
                    INDEX idx_user_id (user_id),
                    UNIQUE KEY unique_blog_user (blog_id, user_id),
                    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
                )
            `);
            
            console.log('✅ blog_likes table created successfully');
        } else {
            console.log('ℹ️ blog_likes table already exists');
        }
        
        // Check if blogs table has likes column
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'blogs' 
            AND COLUMN_NAME = 'likes'
        `);
        
        if (columns.length === 0) {
            console.log('➕ Adding likes column to blogs table...');
            await pool.query(`
                ALTER TABLE blogs 
                ADD COLUMN likes INT DEFAULT 0
            `);
            console.log('✅ likes column added to blogs table');
        } else {
            console.log('ℹ️ likes column already exists in blogs table');
        }
        
        // Check if blogs table has views column
        const [viewsColumns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'blogs' 
            AND COLUMN_NAME = 'views'
        `);
        
        if (viewsColumns.length === 0) {
            console.log('➕ Adding views column to blogs table...');
            await pool.query(`
                ALTER TABLE blogs 
                ADD COLUMN views INT DEFAULT 0
            `);
            console.log('✅ views column added to blogs table');
        } else {
            console.log('ℹ️ views column already exists in blogs table');
        }
        
        // Verify the migration
        const [likeCount] = await pool.query('SELECT COUNT(*) as count FROM blog_likes');
        const [blogCount] = await pool.query('SELECT COUNT(*) as count FROM blogs');
        
        console.log('✅ Migration completed successfully!');
        console.log('🔍 Migration summary:');
        console.log(`  - Total blogs: ${blogCount[0].count}`);
        console.log(`  - Total likes: ${likeCount[0].count}`);
        console.log('  - Blog interactions system ready');
        
        return true;
        
    } catch (error) {
        console.error('❌ Blog interactions migration failed:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateBlogInteractions()
        .then(() => {
            console.log('🎉 Blog interactions migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateBlogInteractions };
