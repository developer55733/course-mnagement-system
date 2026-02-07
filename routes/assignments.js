const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all assignments (for users)
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT a.*, u.name as posted_by_name,
             CASE WHEN a.due_date < NOW() THEN 'overdue'
                  WHEN a.due_date < DATE_ADD(NOW(), INTERVAL 24 HOUR) THEN 'due_soon'
                  ELSE 'active'
             END as urgency_status
      FROM assignments a
      LEFT JOIN users u ON a.posted_by = u.id
      WHERE a.status = 'active'
      ORDER BY a.due_date ASC
    `;
    
    const [results] = await query(sql);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// Get all assignments (for admin management)
router.get('/admin', async (req, res) => {
  try {
    const sql = `
      SELECT a.*, u.name as posted_by_name
      FROM assignments a
      LEFT JOIN users u ON a.posted_by = u.id
      ORDER BY a.created_at DESC
    `;
    
    const [results] = await query(sql);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    
    const sql = `
      SELECT a.*, u.name as posted_by_name, u.email as posted_by_email
      FROM assignments a
      LEFT JOIN users u ON a.posted_by = u.id
      WHERE a.id = ?
    `;
    
    const [results] = await query(sql, [assignmentId]);
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    res.json({ success: true, data: results[0] });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
});

// Create new assignment (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, description, module_code, module_name, due_date, posted_by } = req.body;
    
    if (!title || !description || !module_code || !module_name || !due_date || !posted_by) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    // Start transaction
    await query('START TRANSACTION');
    
    // Insert assignment
    const assignmentQuery = `
      INSERT INTO assignments (title, description, module_code, module_name, due_date, posted_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [assignmentResult] = await query(assignmentQuery, [
      title, description, module_code, module_name, due_date, posted_by
    ]);
    
    const assignmentId = assignmentResult.insertId;
    
    // Create notifications for all users
    const usersQuery = 'SELECT id FROM users WHERE role = "user"';
    const [users] = await query(usersQuery);
    
    if (users.length > 0) {
      const notificationValues = users.map(user => [assignmentId, user.id]);
      const notificationsQuery = `
        INSERT INTO assignment_notifications (assignment_id, user_id)
        VALUES ?
      `;
      
      await query(notificationsQuery, [notificationValues]);
    }
    
    await query('COMMIT');
    
    res.json({ 
      success: true, 
      data: { 
        id: assignmentId,
        title,
        description,
        module_code,
        module_name,
        due_date,
        posted_by
      }
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to create assignment' });
  }
});

// Update assignment (admin only)
router.put('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { title, description, module_code, module_name, due_date, status } = req.body;
    
    const sql = `
      UPDATE assignments 
      SET title = ?, description = ?, module_code = ?, module_name = ?, due_date = ?, status = ?
      WHERE id = ?
    `;
    
    const [result] = await query(sql, [
      title, description, module_code, module_name, due_date, status, assignmentId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    res.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to update assignment' });
  }
});

// Delete assignment (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    
    await query('DELETE FROM assignments WHERE id = ?', [assignmentId]);
    
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete assignment' });
  }
});

// Get user's assignment notifications
router.get('/notifications/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    const query = `
      SELECT an.*, a.title, a.module_name, a.due_date,
             CASE WHEN a.due_date < NOW() THEN 'overdue'
                  WHEN a.due_date < DATE_ADD(NOW(), INTERVAL 24 HOUR) THEN 'due_soon'
                  ELSE 'active'
             END as urgency_status
      FROM assignment_notifications an
      LEFT JOIN assignments a ON an.assignment_id = a.id
      WHERE an.user_id = ? AND a.status = 'active'
      ORDER BY an.created_at DESC
    `;
    
    const [results] = await query(sql, [userId]);
    
    // Get unread count
    const unreadQuery = `
      SELECT COUNT(*) as unread_count
      FROM assignment_notifications an
      LEFT JOIN assignments a ON an.assignment_id = a.id
      WHERE an.user_id = ? AND an.is_read = FALSE AND a.status = 'active'
    `;
    
    const [unreadResult] = await query(unreadQuery, [userId]);
    
    res.json({ 
      success: true, 
      data: {
        notifications: results,
        unread_count: unreadResult[0].unread_count
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:notification_id/read', async (req, res) => {
  try {
    const notificationId = req.params.notification_id;
    
    await query(
      'UPDATE assignment_notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for user
router.put('/notifications/user/:user_id/read-all', async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    await query(
      'UPDATE assignment_notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

module.exports = router;
