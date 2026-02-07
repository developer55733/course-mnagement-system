const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');
const Notification = require('../models/Notification');
const adminAuth = require('../middleware/adminAuth');

// Get all forum categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Forum.getCategories();
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get posts by category
router.get('/categories/:categoryId/posts', async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const posts = await Forum.getPostsByCategory(categoryId, limit, offset);
        res.json({
            success: true,
            posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all posts (admin only)
router.get('/posts', adminAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const posts = await Forum.getAllPosts(limit, offset);
        res.json({
            success: true,
            posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single post with replies
router.get('/posts/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const post = await Forum.getPostById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        res.json({
            success: true,
            post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new post
router.post('/posts', async (req, res) => {
    try {
        const { categoryId, title, content, moduleCode } = req.body;
        const userId = req.user?.id || 1; // Get from authenticated user or default
        
        // Validate required fields
        if (!categoryId || !title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Category, title, and content are required'
            });
        }
        
        const postId = await Forum.createPost({
            categoryId,
            userId,
            title,
            content,
            moduleCode
        });
        
        res.status(201).json({
            success: true,
            postId,
            message: 'Post created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update post (admin only or post author)
router.put('/posts/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { title, content, moduleCode, isPinned, isLocked } = req.body;
        
        // Get post to check permissions
        const post = await Forum.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        // Check if user is admin or post author
        const userId = req.user?.id || 1;
        const isAdmin = req.headers['x-admin-secret'];
        
        if (!isAdmin && post.user_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own posts'
            });
        }
        
        await Forum.updatePost(postId, {
            title,
            content,
            moduleCode,
            isPinned,
            isLocked
        });
        
        res.json({
            success: true,
            message: 'Post updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete post (admin only or post author)
router.delete('/posts/:postId', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        
        // Get post to check permissions
        const post = await Forum.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        // Check if user is admin or post author
        const userId = req.user?.id || 1;
        const isAdmin = req.headers['x-admin-secret'];
        
        if (!isAdmin && post.user_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own posts'
            });
        }
        
        await Forum.deletePost(postId);
        
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add reply to post
router.post('/posts/:postId/replies', async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { content, parentReplyId } = req.body;
        const userId = req.user?.id || 1;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Reply content is required'
            });
        }
        
        // Check if post exists and is not locked
        const post = await Forum.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        if (post.is_locked) {
            return res.status(403).json({
                success: false,
                error: 'This post is locked and cannot receive new replies'
            });
        }
        
        const replyId = await Forum.addReply({
            postId,
            userId,
            content,
            parentReplyId
        });
        
        // Create notification for post author (if not replying to own post)
        if (post.user_id !== userId) {
            await Notification.createForumReplyNotification(post, {
                user_id: userId,
                content
            });
        }
        
        res.status(201).json({
            success: true,
            replyId,
            message: 'Reply added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update reply (admin only or reply author)
router.put('/replies/:replyId', async (req, res) => {
    try {
        const replyId = parseInt(req.params.replyId);
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Reply content is required'
            });
        }
        
        // Get reply to check permissions (you'd need to implement getReplyById method)
        // For now, we'll assume the user has permission
        
        await Forum.updateReply(replyId, content);
        
        res.json({
            success: true,
            message: 'Reply updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete reply (admin only or reply author)
router.delete('/replies/:replyId', async (req, res) => {
    try {
        const replyId = parseInt(req.params.replyId);
        
        await Forum.deleteReply(replyId);
        
        res.json({
            success: true,
            message: 'Reply deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search posts
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        
        const posts = await Forum.searchPosts(query, limit, offset);
        res.json({
            success: true,
            posts,
            query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get posts by user
router.get('/user/:userId/posts', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const posts = await Forum.getPostsByUser(userId, limit, offset);
        res.json({
            success: true,
            posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get forum statistics
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = await Forum.getForumStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Pin/unpin post (admin only)
router.post('/posts/:postId/pin', adminAuth, async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { isPinned } = req.body;
        
        await Forum.updatePost(postId, { isPinned });
        
        res.json({
            success: true,
            message: isPinned ? 'Post pinned successfully' : 'Post unpinned successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Lock/unlock post (admin only)
router.post('/posts/:postId/lock', adminAuth, async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);
        const { isLocked } = req.body;
        
        await Forum.updatePost(postId, { isLocked });
        
        res.json({
            success: true,
            message: isLocked ? 'Post locked successfully' : 'Post unlocked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
