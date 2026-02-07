// Database Setup Test Script
// Run this script to test your database connection and data

require('dotenv').config();
const database = require('./config/database');

async function testDatabaseSetup() {
    console.log('🔍 Testing Database Setup...\n');
    
    try {
        // Test 1: Check database connection
        console.log('1. Testing database connection...');
        const connectionResult = await database.query('SELECT 1 as test');
        console.log('✅ Database connection successful\n');
        
        // Test 2: Check if tables exist
        console.log('2. Checking database tables...');
        const tables = ['users', 'modules', 'lecturers', 'timetable', 'settings', 'notes'];
        
        for (const table of tables) {
            try {
                const result = await database.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = result[0][0].count;
                console.log(`✅ ${table}: ${count} records`);
            } catch (error) {
                console.log(`❌ ${table}: Table does not exist or error - ${error.message}`);
            }
        }
        console.log('');
        
        // Test 3: Check sample data
        console.log('3. Checking sample data...');
        
        try {
            const userResult = await database.query('SELECT name, email, role FROM users LIMIT 3');
            console.log('Sample Users:');
            userResult[0].forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
            });
        } catch (error) {
            console.log('❌ No users found');
        }
        
        try {
            const moduleResult = await database.query('SELECT code, name FROM modules LIMIT 3');
            console.log('\nSample Modules:');
            moduleResult[0].forEach(module => {
                console.log(`  - ${module.code}: ${module.name}`);
            });
        } catch (error) {
            console.log('❌ No modules found');
        }
        
        try {
            const lecturerResult = await database.query('SELECT name, module FROM lecturers LIMIT 3');
            console.log('\nSample Lecturers:');
            lecturerResult[0].forEach(lecturer => {
                console.log(`  - ${lecturer.name}: ${lecturer.module}`);
            });
        } catch (error) {
            console.log('❌ No lecturers found');
        }
        
        try {
            const notesResult = await database.query('SELECT title, module_code FROM notes LIMIT 3');
            console.log('\nSample Notes:');
            notesResult[0].forEach(note => {
                console.log(`  - ${note.title} (${note.module_code})`);
            });
        } catch (error) {
            console.log('❌ No notes found');
        }
        
        console.log('\n4. Testing API endpoints...');
        
        // Test if the API can fetch data
        try {
            const express = require('express');
            const app = express();
            
            // Test modules endpoint
            const modulesRoute = require('./routes/modules');
            app.use('/api/modules', modulesRoute);
            
            console.log('✅ API routes loaded successfully');
        } catch (error) {
            console.log('❌ API routes error:', error.message);
        }
        
        console.log('\n🎉 Database setup test completed!');
        console.log('\n📋 Next Steps:');
        console.log('1. If tables are missing, run: node complete-database-setup.js');
        console.log('2. If data is missing, run the SQL script in your database');
        console.log('3. Start your server: npm start');
        console.log('4. Test the frontend by accessing the dashboard');
        
    } catch (error) {
        console.error('❌ Database setup test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your .env file for correct database credentials');
        console.log('2. Ensure your Railway database is running');
        console.log('3. Verify network connectivity to Railway');
        console.log('4. Check if MySQL port is accessible');
    }
}

// Run the test
testDatabaseSetup().catch(console.error);
