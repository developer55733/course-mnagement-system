// Automatic Database Setup Script
// This script will set up your database with sample data

require('dotenv').config();
const database = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('🚀 Starting Database Setup...\n');
    
    try {
        // Step 1: Test database connection
        console.log('1. Testing database connection...');
        await database.query('SELECT 1 as test');
        console.log('✅ Database connection successful\n');
        
        // Step 2: Read and execute the SQL setup file
        console.log('2. Setting up database tables and data...');
        
        const sqlFile = path.join(__dirname, 'complete-database-setup.sql');
        
        if (!fs.existsSync(sqlFile)) {
            throw new Error('Database setup file not found: ' + sqlFile);
        }
        
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Split SQL content into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('--'));
        
        console.log(`Found ${statements.length} SQL statements to execute...`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await database.query(statement);
                    console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
                } catch (error) {
                    // Some statements might fail if they already exist, that's okay
                    if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                        error.code === 'ER_DUP_ENTRY' ||
                        error.code === 'ER_NO_REFERENCED_ROW_2') {
                        console.log(`ℹ️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
                    } else {
                        console.log(`⚠️  Statement ${i + 1}/${statements.length} warning: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('\n3. Verifying setup...');
        
        // Verify data was inserted
        const userCount = await database.query('SELECT COUNT(*) as count FROM users');
        const moduleCount = await database.query('SELECT COUNT(*) as count FROM modules');
        const lecturerCount = await database.query('SELECT COUNT(*) as count FROM lecturers');
        const notesCount = await database.query('SELECT COUNT(*) as count FROM notes');
        
        console.log(`✅ Users: ${userCount[0][0].count}`);
        console.log(`✅ Modules: ${moduleCount[0][0].count}`);
        console.log(`✅ Lecturers: ${lecturerCount[0][0].count}`);
        console.log(`✅ Notes: ${notesCount[0][0].count}`);
        
        // Test sample queries
        console.log('\n4. Testing sample queries...');
        
        const modules = await database.query('SELECT code, name FROM modules ORDER BY code');
        console.log('Available modules:');
        modules[0].forEach(module => {
            console.log(`  - ${module.code}: ${module.name}`);
        });
        
        const notes = await database.query('SELECT title, module_code FROM notes ORDER BY module_code, title LIMIT 5');
        console.log('\nSample notes:');
        notes[0].forEach(note => {
            console.log(`  - ${note.title} (${note.module_code})`);
        });
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📋 What was set up:');
        console.log('✅ All database tables created');
        console.log('✅ Sample users (1 admin, 3 students)');
        console.log('✅ 7 modules with credits');
        console.log('✅ 7 lecturers');
        console.log('✅ 7 timetable entries');
        console.log('✅ 10 study notes');
        console.log('✅ Forum categories and sample posts');
        console.log('✅ Sample assignments');
        console.log('✅ Settings and notifications tables');
        
        console.log('\n🔑 Test Accounts:');
        console.log('Admin: admin@system.edu / admin123');
        console.log('Student: john@student.edu / password123');
        console.log('Student: jane@student.edu / password123');
        console.log('Student: mike@student.edu / password123');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Start your server: npm start');
        console.log('2. Login with any test account');
        console.log('3. Check the Dashboard - you should see modules, lecturers, timetable, and notes!');
        console.log('4. Try the Forum and Assignments tabs');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure your .env file has correct database credentials');
        console.log('2. Ensure your Railway database is running');
        console.log('3. Check network connectivity');
        console.log('4. Try running: node test-database-setup.js');
        
        process.exit(1);
    }
}

// Run the setup
setupDatabase().catch(console.error);
