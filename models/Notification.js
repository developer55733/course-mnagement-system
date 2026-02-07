const database = require('../config/database');

class Notification {
    // Create notification
    static async createNotification(notificationData) {
        try {
            const { userId, title, message, type = 'system', relatedId = null } = notificationData;
            
            const [result] = await database.query(`
                INSERT INTO notifications (user_id, title, message, type, related_id)
                VALUES (?, ?, ?, ?, ?)
            `, [userId, title, message, type, relatedId]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error creating notification: ' + error.message);
        }
    }

    // Create bulk notifications for multiple users
    static async createBulkNotifications(users, title, message, type = 'system', relatedId = null) {
        try {
            const values = users.map(userId => [userId, title, message, type, relatedId]);
            
            await database.query(`
                INSERT INTO notifications (user_id, title, message, type, related_id)
                VALUES ?
            `, [values]);

            return users.length;
        } catch (error) {
            throw new Error('Error creating bulk notifications: ' + error.message);
        }
    }

    // Get user notifications
    static async getUserNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
        try {
            let query = `
                SELECT * FROM notifications 
                WHERE user_id = ?
            `;
            const params = [userId];

            if (unreadOnly) {
                query += ' AND is_read = FALSE';
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await database.query(query, params);
            return rows;
        } catch (error) {
            throw new Error('Error fetching notifications: ' + error.message);
        }
    }

    // Get unread notification count
    static async getUnreadCount(userId) {
        try {
            const [rows] = await database.query(
                'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
                [userId]
            );
            return rows[0].count;
        } catch (error) {
            throw new Error('Error fetching unread count: ' + error.message);
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        try {
            await database.query(
                'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
                [notificationId, userId]
            );
            return true;
        } catch (error) {
            throw new Error('Error marking notification as read: ' + error.message);
        }
    }

    // Mark all notifications as read for user
    static async markAllAsRead(userId) {
        try {
            await database.query(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
                [userId]
            );
            return true;
        } catch (error) {
            throw new Error('Error marking all notifications as read: ' + error.message);
        }
    }

    // Delete notification
    static async deleteNotification(notificationId, userId) {
        try {
            await database.query(
                'DELETE FROM notifications WHERE id = ? AND user_id = ?',
                [notificationId, userId]
            );
            return true;
        } catch (error) {
            throw new Error('Error deleting notification: ' + error.message);
        }
    }

    // Delete all notifications for user
    static async deleteAllNotifications(userId) {
        try {
            await database.query(
                'DELETE FROM notifications WHERE user_id = ?',
                [userId]
            );
            return true;
        } catch (error) {
            throw new Error('Error deleting all notifications: ' + error.message);
        }
    }

    // Get notifications by type
    static async getNotificationsByType(userId, type, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT * FROM notifications 
                WHERE user_id = ? AND type = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `, [userId, type, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching notifications by type: ' + error.message);
        }
    }

    // Create assignment notification for all students
    static async createAssignmentNotification(assignmentData) {
        try {
            // Get all student users
            const [students] = await database.query(
                'SELECT id FROM users WHERE role = "student"'
            );

            if (students.length === 0) {
                return 0;
            }

            const studentIds = students.map(s => s.id);
            const title = 'New Assignment Posted';
            const message = `New assignment "${assignmentData.title}" for ${assignmentData.moduleCode} is now available. Due: ${new Date(assignmentData.dueDate).toLocaleDateString()}`;

            return await this.createBulkNotifications(
                studentIds,
                title,
                message,
                'assignment',
                assignmentData.id
            );
        } catch (error) {
            throw new Error('Error creating assignment notification: ' + error.message);
        }
    }

    // Create assignment reminder notification
    static async createAssignmentReminder(assignmentData, studentIds) {
        try {
            const title = 'Assignment Due Soon';
            const message = `Reminder: Assignment "${assignmentData.title}" for ${assignmentData.moduleCode} is due on ${new Date(assignmentData.dueDate).toLocaleDateString()}`;

            return await this.createBulkNotifications(
                studentIds,
                title,
                message,
                'reminder',
                assignmentData.id
            );
        } catch (error) {
            throw new Error('Error creating assignment reminder: ' + error.message);
        }
    }

    // Create forum reply notification
    static async createForumReplyNotification(postData, replyData) {
        try {
            // Notify the original post author
            if (postData.user_id !== replyData.user_id) {
                const title = 'New Reply to Your Forum Post';
                const message = `Someone replied to your post "${postData.title}" in the discussion forum.`;

                await this.createNotification({
                    userId: postData.user_id,
                    title,
                    message,
                    type: 'forum',
                    relatedId: postData.id
                });
            }

            return true;
        } catch (error) {
            throw new Error('Error creating forum reply notification: ' + error.message);
        }
    }

    // Create grade notification
    static async createGradeNotification(submissionData, assignmentData) {
        try {
            const title = 'Assignment Graded';
            const message = `Your submission for "${assignmentData.title}" has been graded. Score: ${submissionData.marks_obtained}/${assignmentData.max_marks}`;

            return await this.createNotification({
                userId: submissionData.student_id,
                title,
                message,
                type: 'grade',
                relatedId: assignmentData.id
            });
        } catch (error) {
            throw new Error('Error creating grade notification: ' + error.message);
        }
    }

    // Clean up old notifications (older than 30 days)
    static async cleanupOldNotifications() {
        try {
            const [result] = await database.query(
                'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
            );
            return result.affectedRows;
        } catch (error) {
            throw new Error('Error cleaning up old notifications: ' + error.message);
        }
    }

    // Get notification statistics
    static async getNotificationStats(userId = null) {
        try {
            let query = `
                SELECT 
                    type,
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread
                FROM notifications
            `;
            
            const params = [];
            
            if (userId) {
                query += ' WHERE user_id = ?';
                params.push(userId);
            }
            
            query += ' GROUP BY type';
            
            const [rows] = await database.query(query, params);
            return rows;
        } catch (error) {
            throw new Error('Error fetching notification statistics: ' + error.message);
        }
    }
}

module.exports = Notification;
