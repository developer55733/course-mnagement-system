const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get user notifications
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id || 1; // Get from authenticated user or default
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const unreadOnly = req.query.unread === 'true';
        
        const notifications = await Notification.getUserNotifications(userId, limit, offset, unreadOnly);
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const count = await Notification.getUnreadCount(userId);
        
        res.json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark notification as read
router.post('/:notificationId/read', async (req, res) => {
    try {
        const notificationId = parseInt(req.params.notificationId);
        const userId = req.user?.id || 1;
        
        await Notification.markAsRead(notificationId, userId);
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        
        await Notification.markAllAsRead(userId);
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
    try {
        const notificationId = parseInt(req.params.notificationId);
        const userId = req.user?.id || 1;
        
        await Notification.deleteNotification(notificationId, userId);
        
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete all notifications
router.delete('/', async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        
        await Notification.deleteAllNotifications(userId);
        
        res.json({
            success: true,
            message: 'All notifications deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get notifications by type
router.get('/type/:type', async (req, res) => {
    try {
        const type = req.params.type;
        const userId = req.user?.id || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const notifications = await Notification.getNotificationsByType(userId, type, limit, offset);
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const stats = await Notification.getNotificationStats(userId);
        
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

module.exports = router;
