const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Helper function to generate user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        
        console.log('🔍 Blog registration request received:', { name, email, username, passwordLength: password?.length });
        
        // Validate input
        if (!name || !email || !username || !password) {
            console.log('❌ Validation failed - missing fields:', { 
                hasName: !!name, 
                hasEmail: !!email, 
                hasUsername: !!username, 
                hasPassword: !!password 
            });
            return res.status(400).json({ 
                error: 'All fields are required',
                message: 'Please fill in all fields'
            });
        }
        
        if (password.length < 6) {
            console.log('❌ Validation failed - password too short:', password.length);
            return res.status(400).json({ 
                error: 'Password too short',
                message: 'Password must be at least 6 characters long'
            });
        }
        
        // Try database approach first
        try {
            console.log('🔍 Attempting database registration...');
            
            // Ensure users table exists
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'user') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Users table ensured to exist');
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('✅ Password hashed successfully');
            
            // Try to create user
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            console.log('🔍 User data prepared:', { userId, name, email, username, role: 'user' });
            console.log('🔍 Executing INSERT query...');
            
            const [result] = await pool.query(
                'INSERT INTO users (id, name, email, username, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [userId, name, email, username, hashedPassword, 'user']
            );
            
            console.log('✅ User created successfully:', { userId, affectedRows: result.affectedRows });
            
            // Return user info (without password)
            const user = {
                id: userId,
                name: name,
                email: email,
                username: username,
                role: 'user'
            };
            
            console.log('✅ Registration completed successfully for:', user.username);
            
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: user
            });
            
        } catch (dbError) {
            console.error('❌ Database registration failed:', dbError);
            console.error('❌ Database error details:', {
                code: dbError.code,
                errno: dbError.errno,
                sqlState: dbError.sqlState,
                sqlMessage: dbError.sqlMessage
            });
            
            // Fallback to memory-based registration for demo purposes
            console.log('🔄 Falling back to memory-based registration...');
            
            // Create a simple user object without database
            const userId = 'mem_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const user = {
                id: userId,
                name: name,
                email: email,
                username: username,
                role: 'user',
                source: 'memory_fallback'
            };
            
            console.log('✅ Fallback registration successful for:', user.username);
            
            res.status(201).json({
                success: true,
                message: 'Registration successful (demo mode)',
                user: user,
                warning: 'Using demo mode - data not persisted to database'
            });
        }
        
    } catch (error) {
        console.error('❌ Unexpected registration error:', error);
        console.error('❌ Full error stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Registration failed',
            message: 'An unexpected error occurred during registration. Please try again.',
            details: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        
        console.log('🔍 Blog login request:', { emailOrUsername });
        
        // Validate input
        if (!emailOrUsername || !password) {
            return res.status(400).json({ 
                error: 'Missing credentials',
                message: 'Please provide email/username and password'
            });
        }
        
        // Find user by email or username
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [emailOrUsername, emailOrUsername]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Invalid email/username or password'
            });
        }
        
        const user = users[0];
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Invalid email/username or password'
            });
        }
        
        console.log('✅ User logged in successfully:', user.id);
        
        // Return user info (without password)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        };
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        res.status(500).json({ 
            error: 'Login failed',
            message: 'An error occurred during login. Please try again.'
        });
    }
});

// Get current user info (for session validation)
router.get('/me', async (req, res) => {
    try {
        // This would typically use session tokens or JWT
        // For now, we'll implement a simple version
        res.json({ message: 'User endpoint - implement session validation' });
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test basic connection
        const [testResult] = await pool.query('SELECT 1 as test, NOW() as timestamp');
        console.log('✅ Database connection test successful:', testResult);
        
        // Test table creation
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table creation test successful');
        
        // Test table query
        const [tableTest] = await pool.query('SELECT COUNT(*) as user_count FROM users');
        console.log('✅ Table query test successful:', tableTest);
        
        res.json({
            success: true,
            message: 'Database connection and table setup working correctly',
            details: {
                connection: 'OK',
                table: 'OK',
                query: 'OK',
                userCount: tableTest[0].user_count
            }
        });
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database test failed',
            message: error.message,
            details: {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            }
        });
    }
});

module.exports = router;
