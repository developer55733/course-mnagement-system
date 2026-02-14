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
        
        // Ensure users table exists
        try {
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
        } catch (tableError) {
            console.error('❌ Error ensuring users table exists:', tableError);
            return res.status(500).json({ 
                error: 'Database setup failed',
                message: 'Could not set up user table. Please try again later.',
                details: tableError.message
            });
        }
        
        // Hash password
        let hashedPassword;
        try {
            console.log('🔍 Hashing password...');
            hashedPassword = await bcrypt.hash(password, 10);
            console.log('✅ Password hashed successfully');
        } catch (hashError) {
            console.error('❌ Error hashing password:', hashError);
            return res.status(500).json({ 
                error: 'Password processing failed',
                message: 'Could not process password. Please try again.'
            });
        }
        
        // Try to create user (will fail if email/username already exists)
        try {
            console.log('🔍 Creating new user...');
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
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
            
        } catch (createError) {
            console.error('❌ Error creating user:', createError);
            
            // Check if it's a duplicate error
            if (createError.code === 'ER_DUP_ENTRY') {
                console.log('❌ Duplicate entry error');
                return res.status(409).json({ 
                    error: 'User already exists',
                    message: 'A user with this email or username already exists'
                });
            }
            
            console.error('❌ SQL Error details:', {
                code: createError.code,
                errno: createError.errno,
                sqlState: createError.sqlState,
                sqlMessage: createError.sqlMessage
            });
            
            return res.status(500).json({ 
                error: 'User creation failed',
                message: 'Could not create user account. Please try again.',
                details: createError.message
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

module.exports = router;
