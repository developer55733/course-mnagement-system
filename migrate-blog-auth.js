// Migration script for blog authentication system
const { pool } = require('./config/database');

async function migrateBlogAuth() {
    try {
        console.log('🔍 Starting blog authentication migration...');
        
        // Check if users table exists
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users'
        `);
        
        if (tables.length === 0) {
            console.log('➕ Creating users table...');
            
            // Create users table
            await pool.query(`
                CREATE TABLE users (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'user') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_email (email),
                    INDEX idx_username (username),
                    INDEX idx_role (role)
                )
            `);
            
            console.log('✅ Users table created successfully');
        } else {
            console.log('ℹ️ Users table already exists');
        }
        
        // Create demo user if it doesn't exist
        const [demoUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            ['demo']
        );
        
        if (demoUsers.length === 0) {
            console.log('➕ Creating demo user...');
            
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('demo', 10);
            
            await pool.query(`
                INSERT INTO users (id, name, email, username, password, role) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                'demo-user-' + Date.now(),
                'Demo User',
                'demo@example.com',
                'demo',
                hashedPassword,
                'user'
            ]);
            
            console.log('✅ Demo user created (username: demo, password: demo)');
        } else {
            console.log('ℹ️ Demo user already exists');
        }
        
        // Verify the migration
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Migration completed successfully! Total users: ${userCount[0].count}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Blog auth migration failed:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateBlogAuth()
        .then(() => {
            console.log('🎉 Blog authentication migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateBlogAuth };
