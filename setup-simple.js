const { query } = require('./config/database');

async function setupLivestreamingTables() {
    try {
        console.log('🔧 Setting up live streaming and meeting tables...');
        
        // Live Streams Table
        await query(`
            CREATE TABLE IF NOT EXISTS live_streams (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                scheduled_time DATETIME,
                started_at DATETIME,
                ended_at DATETIME,
                join_link TEXT NOT NULL,
                created_by INT,
                is_public BOOLEAN DEFAULT 1,
                status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
                participants INT DEFAULT 0,
                max_participants INT DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        
        // Live Meetings Table
        await query(`
            CREATE TABLE IF NOT EXISTS live_meetings (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                scheduled_time DATETIME,
                duration INT DEFAULT 60,
                started_at DATETIME,
                ended_at DATETIME,
                join_link TEXT NOT NULL,
                host_link TEXT NOT NULL,
                created_by INT,
                is_public BOOLEAN DEFAULT 1,
                password_required BOOLEAN DEFAULT 0,
                password VARCHAR(255),
                status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
                participants INT DEFAULT 0,
                max_participants INT DEFAULT 50,
                recording_enabled BOOLEAN DEFAULT 0,
                chat_enabled BOOLEAN DEFAULT 1,
                screen_share_enabled BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        
        console.log('✅ Basic tables created successfully!');
        console.log('📊 Tables created:');
        console.log('  - live_streams');
        console.log('  - live_meetings');
        
    } catch (error) {
        console.error('❌ Error setting up tables:', error);
        throw error;
    }
}

// Run the setup
setupLivestreamingTables().then(() => {
    console.log('🎉 Live streaming database setup completed!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
});
