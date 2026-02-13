const express = require('express');
const router = express.Router();
const db = require('../config/database');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Send email notification
async function sendEmailNotification(userEmail, subject, message) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                        <h2>IT Course Management System</h2>
                        <p>Notification Alert</p>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <h3>${subject}</h3>
                        <p>${message}</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 14px;">
                            This is an automated notification from the IT Course Management System.<br>
                            Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Create notification
async function createNotification(userId, type, title, message, relatedId = null, relatedType = null) {
    try {
        // Insert notification into database
        const [result] = await db.query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, type, title, message, relatedId, relatedType]
        );

        // Get user's notification preferences
        const [preferences] = await db.query(
            `SELECT email_notifications, session_reminders, new_content_notifications, 
                    assignment_notifications, discussion_notifications, test_notifications 
             FROM notification_preferences WHERE user_id = ?`,
            [userId]
        );

        // Get user email
        const [user] = await db.query(
            `SELECT email FROM users WHERE id = ?`,
            [userId]
        );

        if (user.length > 0 && preferences.length > 0) {
            const pref = preferences[0];
            const userEmail = user[0].email;

            // Check if user wants email notifications for this type
            let shouldSendEmail = false;
            switch (type) {
                case 'session_reminder':
                    shouldSendEmail = pref.email_notifications && pref.session_reminders;
                    break;
                case 'new_content':
                    shouldSendEmail = pref.email_notifications && pref.new_content_notifications;
                    break;
                case 'assignment_due':
                    shouldSendEmail = pref.email_notifications && pref.assignment_notifications;
                    break;
                case 'discussion_reply':
                    shouldSendEmail = pref.email_notifications && pref.discussion_notifications;
                    break;
                case 'test_reminder':
                    shouldSendEmail = pref.email_notifications && pref.test_notifications;
                    break;
            }

            if (shouldSendEmail) {
                await sendEmailNotification(userEmail, title, message);
                
                // Mark email as sent
                await db.query(
                    `UPDATE notifications SET email_sent = TRUE WHERE id = ?`,
                    [result.insertId]
                );
            }
        }

        return result.insertId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

// Get user notifications
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
            [notificationId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Get unread notification count
router.get('/unread/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [result] = await db.query(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );

        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Create scheduled session
router.post('/schedule-session', async (req, res) => {
    try {
        const { title, description, sessionType, startTime, endTime, relatedId, relatedType, allUsers, createdBy } = req.body;

        const [result] = await db.query(
            `INSERT INTO scheduled_sessions 
             (title, description, session_type, start_time, end_time, related_id, related_type, all_users, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, sessionType, startTime, endTime, relatedId, relatedType, allUsers, createdBy]
        );

        // Notify all users if it's for everyone
        if (allUsers) {
            const [users] = await db.query(`SELECT id FROM users WHERE role != 'admin'`);
            
            for (const user of users) {
                await createNotification(
                    user.id,
                    'new_content',
                    `New ${sessionType} Scheduled`,
                    `${title} has been scheduled for ${new Date(startTime).toLocaleString()}`,
                    result.insertId,
                    'scheduled_session'
                );
            }
        }

        res.json({ success: true, sessionId: result.insertId });
    } catch (error) {
        console.error('Error scheduling session:', error);
        res.status(500).json({ error: 'Failed to schedule session' });
    }
});

// Get upcoming sessions for reminders
router.get('/upcoming-sessions', async (req, res) => {
    try {
        const [sessions] = await db.query(
            `SELECT * FROM scheduled_sessions 
             WHERE start_time > NOW() 
             ORDER BY start_time ASC 
             LIMIT 20`
        );

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming sessions' });
    }
});

// Update notification preferences
router.put('/preferences/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { 
            emailNotifications, sessionReminders, newContentNotifications,
            assignmentNotifications, discussionNotifications, testNotifications, reminderMinutes 
        } = req.body;

        await db.query(
            `INSERT INTO notification_preferences 
             (user_id, email_notifications, session_reminders, new_content_notifications, 
              assignment_notifications, discussion_notifications, test_notifications, reminder_minutes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             email_notifications = VALUES(email_notifications),
             session_reminders = VALUES(session_reminders),
             new_content_notifications = VALUES(new_content_notifications),
             assignment_notifications = VALUES(assignment_notifications),
             discussion_notifications = VALUES(discussion_notifications),
             test_notifications = VALUES(test_notifications),
             reminder_minutes = VALUES(reminder_minutes)`,
            [userId, emailNotifications, sessionReminders, newContentNotifications,
             assignmentNotifications, discussionNotifications, testNotifications, reminderMinutes]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Get notification preferences
router.get('/preferences/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [preferences] = await db.query(
            `SELECT * FROM notification_preferences WHERE user_id = ?`,
            [userId]
        );

        if (preferences.length === 0) {
            // Create default preferences
            await db.query(
                `INSERT INTO notification_preferences (user_id) VALUES (?)`,
                [userId]
            );
            
            const [defaultPrefs] = await db.query(
                `SELECT * FROM notification_preferences WHERE user_id = ?`,
                [userId]
            );
            res.json(defaultPrefs[0]);
        } else {
            res.json(preferences[0]);
        }
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Process session reminders (this would be called by a cron job)
router.post('/process-reminders', async (req, res) => {
    try {
        const [sessions] = await db.query(
            `SELECT ss.*, u.email 
             FROM scheduled_sessions ss
             JOIN users u ON ss.created_by = u.id
             WHERE ss.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 20 MINUTE)
             AND ss.id NOT IN (
                 SELECT related_id FROM notifications 
                 WHERE type = 'session_reminder' 
                 AND related_type = 'scheduled_session'
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
             )`
        );

        for (const session of sessions) {
            // Get all users who should receive this reminder
            const [users] = session.all_users 
                ? await db.query(`SELECT id, email FROM users WHERE role != 'admin'`)
                : await db.query(`SELECT id, email FROM users WHERE id = ?`, [session.created_by]);

            for (const user of users) {
                await createNotification(
                    user.id,
                    'session_reminder',
                    `Session Reminder: ${session.title}`,
                    `Your ${session.session_type} "${session.title}" is starting in 20 minutes!`,
                    session.id,
                    'scheduled_session'
                );
            }
        }

        res.json({ success: true, processed: sessions.length });
    } catch (error) {
        console.error('Error processing reminders:', error);
        res.status(500).json({ error: 'Failed to process reminders' });
    }
});

// Notify when new content is added
router.post('/notify-new-content', async (req, res) => {
    try {
        const { contentType, contentTitle, contentId, createdBy, allUsers = true } = req.body;

        if (allUsers) {
            const [users] = await db.query(`SELECT id FROM users WHERE role != 'admin'`);
            
            for (const user of users) {
                await createNotification(
                    user.id,
                    'new_content',
                    `New ${contentType} Added`,
                    `A new ${contentType} "${contentTitle}" has been added to the system.`,
                    contentId,
                    contentType.toLowerCase()
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error notifying new content:', error);
        res.status(500).json({ error: 'Failed to notify new content' });
    }
});

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.sendEmailNotification = sendEmailNotification;
