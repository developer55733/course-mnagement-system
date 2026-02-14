// Migration script to add blog ownership columns
const { pool } = require('./config/database');

async function migrateBlogOwnership() {
    try {
        console.log('🔍 Starting blog ownership migration...');
        
        // Check if created_by column exists
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'blogs' 
            AND COLUMN_NAME IN ('created_by', 'created_by_name')
        `);
        
        const existingColumns = columns.map(col => col.COLUMN_NAME);
        console.log('🔍 Existing columns:', existingColumns);
        
        // Add created_by column if it doesn't exist
        if (!existingColumns.includes('created_by')) {
            console.log('➕ Adding created_by column...');
            await pool.query(`
                ALTER TABLE blogs 
                ADD COLUMN created_by VARCHAR(50) DEFAULT 'anonymous'
            `);
            console.log('✅ created_by column added');
        } else {
            console.log('ℹ️ created_by column already exists');
        }
        
        // Add created_by_name column if it doesn't exist
        if (!existingColumns.includes('created_by_name')) {
            console.log('➕ Adding created_by_name column...');
            await pool.query(`
                ALTER TABLE blogs 
                ADD COLUMN created_by_name VARCHAR(255) DEFAULT 'Anonymous'
            `);
            console.log('✅ created_by_name column added');
        } else {
            console.log('ℹ️ created_by_name column already exists');
        }
        
        // Add index for created_by if it doesn't exist
        try {
            await pool.query(`
                CREATE INDEX idx_created_by ON blogs (created_by)
            `);
            console.log('✅ idx_created_by index added');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ idx_created_by index already exists');
            } else {
                console.log('⚠️ Could not create index:', error.message);
            }
        }
        
        // Update existing blogs to have default ownership
        const [updateResult] = await pool.query(`
            UPDATE blogs 
            SET created_by = 'anonymous', created_by_name = 'Anonymous' 
            WHERE created_by IS NULL OR created_by = ''
        `);
        
        if (updateResult.affectedRows > 0) {
            console.log(`✅ Updated ${updateResult.affectedRows} existing blogs with default ownership`);
        }
        
        // Verify the migration
        const [verify] = await pool.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'blogs' 
            AND COLUMN_NAME IN ('created_by', 'created_by_name')
        `);
        
        console.log('✅ Migration completed successfully!');
        console.log('🔍 Updated blog table structure:');
        verify.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (DEFAULT: ${col.COLUMN_DEFAULT})`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateBlogOwnership()
        .then(() => {
            console.log('🎉 Blog ownership migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateBlogOwnership };
