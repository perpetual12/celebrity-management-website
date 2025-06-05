import { Router } from 'express';
import client from '../config/database.js';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Get all notifications for the current user
router.get('/my-notifications', isAuthenticated, async (req, res) => {
  try {
    console.log('🔔 Fetching notifications for user:', req.user.id, req.user.username);

    const result = await client.query(`
      SELECT
        id, type, title, message, is_read, created_at, updated_at,
        related_appointment_id, related_message_id
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    console.log(`🔔 Found ${result.rows.length} notifications for user ${req.user.username}`);

    const notifications = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      relatedAppointmentId: row.related_appointment_id,
      relatedMessageId: row.related_message_id
    }));

    res.json(notifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);

    // If table doesn't exist, return empty array
    if (err.message.includes('relation "notifications" does not exist')) {
      console.log('⚠️ Notifications table does not exist, returning empty array');
      return res.json([]);
    }

    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify notification belongs to user
    const checkResult = await client.query(
      'SELECT user_id FROM notifications WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark as read
    const result = await client.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const result = await client.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = false RETURNING *',
      [req.user.id]
    );

    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to create notifications (used by other routes)
export const createNotification = async (userId, type, title, message, relatedAppointmentId = null, relatedMessageId = null) => {
  try {
    const result = await client.query(`
      INSERT INTO notifications (user_id, type, title, message, related_appointment_id, related_message_id, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, CURRENT_TIMESTAMP)
      RETURNING *
    `, [userId, type, title, message, relatedAppointmentId, relatedMessageId]);

    return result.rows[0];
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

export default router;
