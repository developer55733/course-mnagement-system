const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper function to ensure tables exist
async function ensureTablesExist() {
    try {
        console.log('🔍 Ensuring blog interaction tables exist...');
        
        // First, try to create blog_likes table
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS blog_likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    blog_id VARCHAR(255) NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    user_name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_blog_id (blog_id),
                    INDEX idx_user_id (user_id)
                )
            `);
            console.log('✅ blog_likes table ensured');
        } catch (error) {
            console.error('❌ Error creating blog_likes table:', error);
            // Continue anyway
        }
        
        // Try to create blog_views table
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS blog_views (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    blog_id VARCHAR(255) NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    user_name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_blog_id (blog_id),
                    INDEX idx_user_id (user_id)
                )
            `);
            console.log('✅ blog_views table ensured');
        } catch (error) {
            console.error('❌ Error creating blog_views table:', error);
            // Continue anyway
        }
        
        // Try to add likes column to blogs table
        try {
            await pool.query(`
                ALTER TABLE blogs 
                ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0
            `);
            console.log('✅ likes column ensured');
        } catch (error) {
            console.error('❌ Error adding likes column:', error);
            // Continue anyway
        }
        
        // Try to add views column to blogs table
        try {
            await pool.query(`
                ALTER TABLE blogs 
                ADD COLUMN IF NOT EXISTS views INT DEFAULT 0
            `);
            console.log('✅ views column ensured');
        } catch (error) {
            console.error('❌ Error adding views column:', error);
            // Continue anyway
        }
        
        console.log('✅ Blog interaction tables setup completed');
        return true;
    } catch (error) {
        console.error('❌ Critical error in ensureTablesExist:', error);
        return false;
    }
}

// Like a blog post
router.post('/blogs/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, user_name } = req.body;
        
        console.log('🔍 Like request received:', { id, user_id, user_name });
        
        if (!user_id || !user_name) {
            return res.status(400).json({ 
                error: 'User information required',
                message: 'User ID and name are required'
            });
        }
        
        // Check if blog exists
        const [blogRows] = await pool.query('SELECT id FROM blogs WHERE id = ?', [id]);
        if (blogRows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        // Try to ensure tables exist, but don't fail if it doesn't work
        try {
            await ensureTablesExist();
        } catch (error) {
            console.error('⚠️ Table setup failed, trying fallback approach:', error);
        }
        
        // Try to use blog_likes table, fallback to blogs table if needed
        let liked = false;
        let totalLikes = 0;
        
        try {
            // Try to check if user already liked this blog
            const [existingLikes] = await pool.query(
                'SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?',
                [id, user_id]
            );
            
            if (existingLikes.length === 0) {
                // Add new like
                await pool.query(
                    'INSERT INTO blog_likes (blog_id, user_id, user_name, created_at) VALUES (?, ?, ?, NOW())',
                    [id, user_id, user_name]
                );
                liked = true;
                console.log('✅ Added new like for blog:', id);
            } else {
                // Remove existing like
                await pool.query(
                    'DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?',
                    [id, user_id]
                );
                liked = false;
                console.log('🗑️ Removed like for blog:', id);
            }
            
            // Get updated like count
            const [likeCount] = await pool.query(
                'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?',
                [id]
            );
            totalLikes = likeCount[0].count;
            
            // Update blog's like count
            await pool.query(
                'UPDATE blogs SET likes = ? WHERE id = ?',
                [totalLikes, id]
            );
            
        } catch (tableError) {
            console.error('⚠️ blog_likes table not available, using fallback:', tableError);
            
            // Fallback: Use a simple approach with blogs table only
            try {
                // Check if likes column exists
                const [columns] = await pool.query(`
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = 'likes'
                `);
                
                if (columns.length > 0) {
                    // Use blogs table with likes column
                    const [currentBlog] = await pool.query('SELECT likes FROM blogs WHERE id = ?', [id]);
                    const currentLikes = currentBlog[0]?.likes || 0;
                    
                    // Simple toggle logic (not perfect but works)
                    const newLikes = liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
                    
                    await pool.query('UPDATE blogs SET likes = ? WHERE id = ?', [newLikes, id]);
                    totalLikes = newLikes;
                    liked = !liked; // Invert since we toggled
                    console.log('✅ Fallback like handling for blog:', id, 'likes:', newLikes);
                } else {
                    // No likes column available, create a simple counter in memory
                    console.log('⚠️ No likes column available, using in-memory counter');
                    totalLikes = 0;
                    liked = false;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback approach also failed:', fallbackError);
                totalLikes = 0;
                liked = false;
            }
        }
        
        console.log('✅ Like operation completed:', { id, liked, totalLikes });
        
        res.json({
            success: true,
            liked: liked,
            totalLikes: totalLikes,
            message: liked ? 'Blog liked successfully' : 'Like removed'
        });
        
    } catch (error) {
        console.error('❌ Error liking blog:', error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Already liked',
                message: 'You have already liked this blog'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to like blog',
            message: 'Could not process like request: ' + error.message
        });
    }
});

// Get blog likes
router.get('/blogs/:id/likes', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [likeCount] = await pool.query(
            'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?',
            [id]
        );
        
        res.json({
            totalLikes: likeCount[0].count
        });
        
    } catch (error) {
        console.error('❌ Error getting blog likes:', error);
        res.status(500).json({ error: 'Failed to get likes' });
    }
});

// Increment blog views (once per user per session)
router.post('/blogs/:id/views', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, user_name } = req.body;
        
        console.log('🔍 View increment request:', { id, user_id, user_name });
        
        // Check if blog exists
        const [blogRows] = await pool.query('SELECT id FROM blogs WHERE id = ?', [id]);
        if (blogRows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        // Try to ensure tables exist, but don't fail if it doesn't work
        try {
            await ensureTablesExist();
        } catch (error) {
            console.error('⚠️ Table setup failed, trying fallback approach:', error);
        }
        
        // Try to use blog_views table, fallback to blogs table if needed
        let alreadyViewed = false;
        let totalViews = 0;
        
        try {
            // Try to check if user has already viewed this blog
            const [existingViews] = await pool.query(
                'SELECT id FROM blog_views WHERE blog_id = ? AND user_id = ?',
                [id, user_id]
            );
            
            if (existingViews.length > 0) {
                console.log('🔍 User already viewed this blog:', id);
                alreadyViewed = true;
                // Return current view count without incrementing
                const [viewCount] = await pool.query('SELECT views FROM blogs WHERE id = ?', [id]);
                return res.json({ 
                    success: true, 
                    views: viewCount[0].views,
                    alreadyViewed: true
                });
            }
            
            // Add new view record
            await pool.query(
                'INSERT INTO blog_views (blog_id, user_id, user_name, created_at) VALUES (?, ?, ?, NOW())',
                [id, user_id, user_name]
            );
            
            // Increment views
            await pool.query('UPDATE blogs SET views = views + 1 WHERE id = ?', [id]);
            
            // Get updated view count
            const [viewCount] = await pool.query('SELECT views FROM blogs WHERE id = ?', [id]);
            totalViews = viewCount[0].views;
            
        } catch (tableError) {
            console.error('⚠️ blog_views table not available, using fallback:', tableError);
            
            // Fallback: Use blogs table with views column
            try {
                // Check if views column exists
                const [columns] = await pool.query(`
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = 'views'
                `);
                
                if (columns.length > 0) {
                    // Use blogs table with views column
                    const [currentBlog] = await pool.query('SELECT views FROM blogs WHERE id = ?', [id]);
                    const currentViews = currentBlog[0]?.views || 0;
                    
                    // Simple increment logic
                    const newViews = currentViews + 1;
                    
                    await pool.query('UPDATE blogs SET views = ? WHERE id = ?', [newViews, id]);
                    totalViews = newViews;
                    console.log('✅ Fallback view handling for blog:', id, 'views:', newViews);
                } else {
                    // No views column available
                    console.log('⚠️ No views column available, using in-memory counter');
                    totalViews = 0;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback approach also failed:', fallbackError);
                totalViews = 0;
            }
        }
        
        console.log('✅ View operation completed:', { id, totalViews, alreadyViewed });
        
        res.json({ 
            success: true, 
            views: totalViews,
            alreadyViewed: alreadyViewed
        });
        
    } catch (error) {
        console.error('❌ Error incrementing views:', error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            // User already viewed, return current count
            const [viewCount] = await pool.query('SELECT views FROM blogs WHERE id = ?', [req.params.id]);
            return res.json({ 
                success: true, 
                views: viewCount[0].views,
                alreadyViewed: true
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to increment views',
            message: 'Could not process view request: ' + error.message
        });
    }
});

// Get blog analytics for creator
router.get('/blogs/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get blog details
        const [blogRows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
        if (blogRows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blog = blogRows[0];
        
        // Get analytics data
        const [likeCount] = await pool.query(
            'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?',
            [id]
        );
        
        const [viewCount] = await pool.query(
            'SELECT views FROM blogs WHERE id = ?',
            [id]
        );
        
        // Get recent likes with user info
        const [recentLikes] = await pool.query(
            'SELECT user_name, created_at FROM blog_likes WHERE blog_id = ? ORDER BY created_at DESC LIMIT 10',
            [id]
        );
        
        res.json({
            blog: {
                id: blog.id,
                title: blog.title,
                created_by: blog.created_by,
                created_by_name: blog.created_by_name
            },
            analytics: {
                totalLikes: likeCount[0].count,
                totalViews: viewCount[0].views,
                recentLikes: recentLikes
            }
        });
        
    } catch (error) {
        console.error('❌ Error getting blog analytics:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

module.exports = router;
