import { Router } from 'express';
import bcrypt from 'bcryptjs';
import client from '../config/database.js';
import { createNotification } from './notifications.js';

const router = Router();

// Admin secret key - in production, this should be in environment variables
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'CELEBRITY_ADMIN_2024_SECURE';

// Middleware to validate secret key
const validateSecretKey = (req, res, next) => {
  const { secretKey } = req.body;

  if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Invalid admin secret key' });
  }

  next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Admin login with secret key validation
router.post('/login', validateSecretKey, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change admin password with secret key validation
router.put('/change-password', isAdmin, validateSecretKey, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const userResult = await client.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await client.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard statistics
router.get('/stats', isAdmin, async (req, res) => {
  try {
    // Get total users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total celebrities
    const celebritiesResult = await client.query('SELECT COUNT(*) as count FROM celebrities');
    const totalCelebrities = parseInt(celebritiesResult.rows[0].count);

    // Get total appointments
    const appointmentsResult = await client.query('SELECT COUNT(*) as count FROM appointments');
    const totalAppointments = parseInt(appointmentsResult.rows[0].count);

    // Get total messages
    const messagesResult = await client.query('SELECT COUNT(*) as count FROM messages');
    const totalMessages = parseInt(messagesResult.rows[0].count);

    // Get pending appointments
    const pendingAppointmentsResult = await client.query(
      'SELECT COUNT(*) as count FROM appointments WHERE status = $1',
      ['pending']
    );
    const pendingAppointments = parseInt(pendingAppointmentsResult.rows[0].count);

    // Get unread messages
    const unreadMessagesResult = await client.query(
      'SELECT COUNT(*) as count FROM messages WHERE is_read = false'
    );
    const unreadMessages = parseInt(unreadMessagesResult.rows[0].count);

    res.json({
      totalUsers,
      totalCelebrities,
      totalAppointments,
      totalMessages,
      pendingAppointments,
      unreadMessages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments for admin review
router.get('/appointments', isAdmin, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        a.id, a.date, a.purpose, a.status, a.created_at,
        u.username as user_name, u.email as user_email,
        c.name as celebrity_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN celebrities c ON a.celebrity_id = c.id
      ORDER BY a.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
router.put('/appointments/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get appointment details before updating
    const appointmentDetails = await client.query(`
      SELECT
        a.id, a.user_id, a.celebrity_id, a.date, a.purpose, a.status as old_status,
        u.username as user_name,
        c.name as celebrity_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN celebrities c ON a.celebrity_id = c.id
      WHERE a.id = $1
    `, [id]);

    if (appointmentDetails.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointmentDetails.rows[0];

    // Update appointment status
    const result = await client.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Create notification for the user if status changed
    if (appointment.old_status !== status && (status === 'approved' || status === 'rejected')) {
      const notificationTitle = status === 'approved'
        ? '✅ Appointment Approved!'
        : '❌ Appointment Rejected';

      const notificationMessage = status === 'approved'
        ? `Great news! Your appointment with ${appointment.celebrity_name} on ${new Date(appointment.date).toLocaleDateString()} has been approved. Get ready for an amazing experience!`
        : `Unfortunately, your appointment with ${appointment.celebrity_name} on ${new Date(appointment.date).toLocaleDateString()} has been rejected. Please try booking another time slot.`;

      await createNotification(
        appointment.user_id,
        'appointment_status',
        notificationTitle,
        notificationMessage,
        appointment.id
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages for admin review
router.get('/messages', isAdmin, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        m.id, m.content, m.is_read, m.created_at,
        m.sender_id, m.celebrity_id,
        sender.username as sender_name, sender.email as sender_email,
        c.name as celebrity_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN celebrities c ON m.celebrity_id = c.id
      ORDER BY m.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users for admin management
router.get('/users', isAdmin, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        id, username, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role
router.put('/users/:id/role', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['user', 'celebrity', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await client.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING username', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: `User ${result.rows[0].username} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete celebrity (admin only)
router.delete('/celebrities/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Admin delete request received for celebrity ID: ${id}`);
    console.log(`🔐 Admin user: ${req.user?.username} (ID: ${req.user?.id})`);

    // Start a transaction
    await client.query('BEGIN');

    try {
      // First, get celebrity information for response
      const celebrityResult = await client.query(
        'SELECT c.name, c.user_id FROM celebrities c WHERE c.id = $1',
        [id]
      );

      console.log(`🔍 Celebrity query result: ${celebrityResult.rows.length} rows found`);

      if (celebrityResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log(`❌ Celebrity not found with ID: ${id}`);
        return res.status(404).json({ error: 'Celebrity not found' });
      }

      const celebrity = celebrityResult.rows[0];
      const userId = celebrity.user_id;

      console.log(`🗑️ Deleting celebrity: ${celebrity.name} (ID: ${id}, User ID: ${userId})`);

      // Delete related data in correct order (due to foreign key constraints)

      // 1. Delete appointments
      const appointmentsResult = await client.query('DELETE FROM appointments WHERE celebrity_id = $1', [id]);
      console.log(`   Deleted ${appointmentsResult.rowCount} appointments`);

      // 2. Delete messages where celebrity_id matches
      const messagesResult = await client.query('DELETE FROM messages WHERE celebrity_id = $1', [id]);
      console.log(`   Deleted ${messagesResult.rowCount} messages (celebrity_id)`);

      // 3. Delete messages where sender_id or receiver_id is the celebrity user
      const userMessagesResult = await client.query(
        'DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1',
        [userId]
      );
      console.log(`   Deleted ${userMessagesResult.rowCount} messages (user messages)`);

      // 4. Delete notifications related to this celebrity user
      const notificationsResult = await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      console.log(`   Deleted ${notificationsResult.rowCount} notifications`);

      // 5. Delete the celebrity profile
      const celebrityDeleteResult = await client.query('DELETE FROM celebrities WHERE id = $1', [id]);
      console.log(`   Deleted ${celebrityDeleteResult.rowCount} celebrity profile`);

      // 6. Delete the associated user account
      const userDeleteResult = await client.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log(`   Deleted ${userDeleteResult.rowCount} user account`);

      // Commit the transaction
      await client.query('COMMIT');

      console.log(`✅ Successfully deleted celebrity: ${celebrity.name}`);

      res.json({
        message: `Celebrity ${celebrity.name} and all associated data deleted successfully`,
        deletedCelebrity: celebrity.name,
        deletedData: {
          appointments: appointmentsResult.rowCount,
          messages: messagesResult.rowCount + userMessagesResult.rowCount,
          notifications: notificationsResult.rowCount,
          celebrity: celebrityDeleteResult.rowCount,
          user: userDeleteResult.rowCount
        }
      });
    } catch (innerErr) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      throw innerErr;
    }
  } catch (err) {
    console.error('❌ Error deleting celebrity:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({
      error: `Failed to delete celebrity: ${err.message}`,
      details: err.code || 'Unknown error'
    });
  }
});

// Get all celebrities for admin management
router.get('/celebrities', isAdmin, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        c.id, c.name, c.bio, c.category, c.profile_image, c.available_for_booking, c.created_at,
        u.username, u.email
      FROM celebrities c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    // Transform snake_case to camelCase for frontend compatibility
    const transformedRows = result.rows.map(row => ({
      ...row,
      profileImage: row.profile_image,
      availableForBooking: row.available_for_booking
    }));

    res.json(transformedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update celebrity availability
router.put('/celebrities/:id/availability', isAdmin, async (req, res) => {
  try {
    const { available_for_booking } = req.body;
    const { id } = req.params;

    const result = await client.query(
      'UPDATE celebrities SET available_for_booking = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [available_for_booking, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation between specific users
router.get('/conversation/:senderId/:celebrityId', isAdmin, async (req, res) => {
  try {
    const { senderId, celebrityId } = req.params;

    // Get celebrity user ID for admin replies
    const celebrityResult = await client.query(
      'SELECT user_id FROM celebrities WHERE id = $1',
      [celebrityId]
    );

    if (celebrityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    const celebrityUserId = celebrityResult.rows[0].user_id;

    // Get all messages in this conversation (both directions)
    // 1. User to celebrity (sender_id = user, celebrity_id = celebrity)
    // 2. Celebrity to user (sender_id = celebrity_user, receiver_id = user)
    const result = await client.query(`
      SELECT
        m.id, m.content, m.is_read, m.created_at,
        sender.id as sender_id, sender.username as sender_name, sender.email as sender_email, sender.role as sender_role,
        receiver.id as receiver_id, receiver.username as receiver_name, receiver.role as receiver_role
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE
        (m.sender_id = $1 AND m.celebrity_id = $2) OR
        (m.sender_id = $3 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [senderId, celebrityId, celebrityUserId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to message as admin
router.post('/reply-message', isAdmin, async (req, res) => {
  try {
    const { originalMessageId, content, recipientId, celebrityId } = req.body;

    if (!content || !recipientId || !celebrityId) {
      return res.status(400).json({ error: 'Content, recipient ID, and celebrity ID are required' });
    }

    // Get celebrity's user_id to send the reply as the celebrity
    const celebrityResult = await client.query(
      'SELECT user_id FROM celebrities WHERE id = $1',
      [celebrityId]
    );

    if (celebrityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    const celebrityUserId = celebrityResult.rows[0].user_id;

    // Create reply message from celebrity user to regular user
    // sender_id = celebrity user, receiver_id = regular user, celebrity_id = celebrity (to maintain conversation thread)
    const result = await client.query(
      'INSERT INTO messages (sender_id, receiver_id, celebrity_id, content, is_read, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [celebrityUserId, recipientId, celebrityId, content, false]
    );

    res.json({
      message: 'Reply sent successfully to user',
      reply: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.put('/messages/:id/mark-read', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      'UPDATE messages SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      message: 'Message marked as read',
      updatedMessage: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create celebrity (admin only) - creates both user and celebrity profile
router.post('/create-celebrity', isAdmin, async (req, res) => {
  try {
    const { username, email, password, name, bio, category, profileImage, availableForBooking } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name || !bio || !category) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if username or email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const userResult = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, 'celebrity']
    );

    const userId = userResult.rows[0].id;

    // Create celebrity profile
    const celebrityResult = await client.query(
      'INSERT INTO celebrities (user_id, name, bio, category, profile_image, available_for_booking) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, bio, category, profileImage || null, availableForBooking !== false]
    );

    res.status(201).json({
      message: 'Celebrity created successfully',
      user: userResult.rows[0],
      celebrity: celebrityResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
