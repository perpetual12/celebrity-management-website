import { Router } from 'express';
import client from '../config/database.js';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('🔐 Messages auth check:');
  console.log('   - Session ID:', req.sessionID);
  console.log('   - Session exists:', !!req.session);
  console.log('   - User authenticated:', req.isAuthenticated());
  console.log('   - User in session:', !!req.user);
  console.log('   - User details:', req.user ? { id: req.user.id, username: req.user.username } : 'None');

  if (req.isAuthenticated()) {
    console.log('✅ User authenticated for messages, proceeding...');
    return next();
  }

  console.log('❌ User not authenticated for messages, returning 401');
  res.status(401).json({
    error: 'Not authenticated',
    sessionId: req.sessionID,
    hasSession: !!req.session,
    isAuthenticated: req.isAuthenticated()
  });
};

// Get all messages for the current user
router.get('/my-messages', isAuthenticated, async (req, res) => {
  try {
    console.log('📧 Fetching messages for user:', req.user.username, '(ID:', req.user.id, ')');
    let messages = [];

    if (req.user.role === 'celebrity') {
      // If user is a celebrity, get messages sent to their celebrity profile
      const celebrityResult = await client.query(
        'SELECT id FROM celebrities WHERE user_id = $1',
        [req.user.id]
      );

      if (celebrityResult.rows.length > 0) {
        const celebrityId = celebrityResult.rows[0].id;
        const messagesResult = await client.query(`
          SELECT
            m.id, m.content, m.is_read, m.created_at, m.updated_at,
            u.id as sender_id, u.username as sender_username, u.email as sender_email
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.receiver_id = $1
          ORDER BY m.created_at DESC
        `, [celebrityId]);

        messages = messagesResult.rows.map(row => ({
          id: row.id,
          content: row.content,
          isRead: row.is_read,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          sender: {
            id: row.sender_id,
            username: row.sender_username,
            email: row.sender_email
          }
        }));
      }
    } else {
      // If user is regular user, get all messages in conversations they're part of
      // This includes both messages they sent to celebrities AND replies from celebrities
      const messagesResult = await client.query(`
        SELECT
          m.id, m.content, m.is_read, m.created_at, m.updated_at,
          m.sender_id, m.receiver_id, m.celebrity_id,
          CASE
            WHEN m.sender_id = $1 THEN 'sent'
            ELSE 'received'
          END as message_type,
          -- For conversation grouping, use celebrity_id if available, otherwise try to find celebrity from sender
          COALESCE(
            m.celebrity_id,
            (SELECT id FROM celebrities WHERE user_id = m.sender_id),
            (SELECT id FROM celebrities WHERE user_id = m.receiver_id)
          ) as celebrity_id_for_conversation,
          -- Get celebrity name
          COALESCE(
            c1.name,
            c2.name,
            c3.name
          ) as celebrity_name,
          -- Get celebrity profile image
          COALESCE(
            c1.profile_image,
            c2.profile_image,
            c3.profile_image
          ) as celebrity_profile_image,
          sender_u.username as sender_username
        FROM messages m
        LEFT JOIN celebrities c1 ON m.celebrity_id = c1.id
        LEFT JOIN celebrities c2 ON m.sender_id = c2.user_id
        LEFT JOIN celebrities c3 ON m.receiver_id = c3.user_id
        LEFT JOIN users sender_u ON m.sender_id = sender_u.id
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY m.created_at DESC
      `, [req.user.id]);

      // Group messages by celebrity conversation
      const conversationMap = new Map();

      messagesResult.rows.forEach(row => {
        const celebrityId = row.celebrity_id_for_conversation;
        const celebrityName = row.celebrity_name;

        if (!conversationMap.has(celebrityId)) {
          conversationMap.set(celebrityId, {
            celebrityId,
            celebrityName,
            celebrityProfileImage: row.celebrity_profile_image,
            messages: [],
            lastMessageDate: row.created_at,
            hasUnreadReplies: false
          });
        }

        const conversation = conversationMap.get(celebrityId);
        conversation.messages.push({
          id: row.id,
          content: row.content,
          isRead: row.is_read,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          messageType: row.message_type,
          senderUsername: row.sender_username
        });

        // Check if there are unread replies from celebrity
        if (row.message_type === 'received' && !row.is_read) {
          conversation.hasUnreadReplies = true;
        }

        // Update last message date
        if (new Date(row.created_at) > new Date(conversation.lastMessageDate)) {
          conversation.lastMessageDate = row.created_at;
        }
      });

      // Convert map to array and format for frontend
      messages = Array.from(conversationMap.values()).map(conversation => ({
        id: `conversation_${conversation.celebrityId}`,
        conversationId: conversation.celebrityId,
        celebrityName: conversation.celebrityName,
        celebrityProfileImage: conversation.celebrityProfileImage,
        messages: conversation.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        lastMessageDate: conversation.lastMessageDate,
        hasUnreadReplies: conversation.hasUnreadReplies,
        // For compatibility with existing frontend
        content: conversation.messages[conversation.messages.length - 1]?.content || '',
        isRead: !conversation.hasUnreadReplies,
        createdAt: conversation.lastMessageDate,
        receiver: {
          id: conversation.celebrityId,
          name: conversation.celebrityName,
          profileImage: conversation.celebrityProfileImage
        }
      })).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    }

    console.log('📧 Returning', messages.length, 'conversations for user:', req.user.username);
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Send a message to a celebrity
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { celebrityId, content } = req.body;

    console.log('💬 Sending message:', {
      userId: req.user.id,
      username: req.user.username,
      celebrityId,
      content
    });

    // Validate required fields
    if (!celebrityId || !content) {
      return res.status(400).json({
        error: 'Missing required fields: celebrityId and content are required'
      });
    }

    // Check if celebrity exists and get their user_id
    const celebrityResult = await client.query(
      'SELECT id, user_id, name FROM celebrities WHERE id = $1',
      [celebrityId]
    );

    if (celebrityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    const celebrity = celebrityResult.rows[0];
    const celebrityUserId = celebrity.user_id;

    // Create message (user to celebrity) using correct schema
    const messageResult = await client.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, celebrityUserId, content]
    );

    console.log('✅ Message created successfully:', messageResult.rows[0]);

    // Return message with celebrity details
    res.status(201).json({
      ...messageResult.rows[0],
      Celebrity: {
        id: celebrity.id,
        name: celebrity.name
      }
    });

  } catch (err) {
    console.error('❌ Error creating message:', err);

    // Handle specific database errors
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Invalid celebrity ID or user ID' });
    }

    res.status(500).json({
      error: 'Failed to send message',
      details: err.message
    });
  }
});

// Mark a message as read
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    // Get message
    const messageResult = await client.query(
      'SELECT * FROM messages WHERE id = $1',
      [req.params.id]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messageResult.rows[0];

    // Check authorization based on user role and message direction
    let isAuthorized = false;

    if (req.user.role === 'celebrity') {
      // Celebrity can mark messages sent to their celebrity profile as read
      const celebrityResult = await client.query(
        'SELECT user_id FROM celebrities WHERE id = $1',
        [message.receiver_id]
      );

      if (celebrityResult.rows.length > 0 && celebrityResult.rows[0].user_id === req.user.id) {
        isAuthorized = true;
      }
    } else {
      // Regular user can mark messages sent to them (replies from celebrities) as read
      if (message.receiver_id === req.user.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to mark this message as read' });
    }

    // Update message as read
    const updatedResult = await client.query(
      'UPDATE messages SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark all messages in a conversation as read (for regular users viewing celebrity replies)
router.put('/conversation/:celebrityId/mark-read', isAuthenticated, async (req, res) => {
  try {
    const { celebrityId } = req.params;

    // Only regular users can use this endpoint
    if (req.user.role === 'celebrity') {
      return res.status(403).json({ error: 'This endpoint is for regular users only' });
    }

    // Mark all messages from this celebrity to this user as read
    const result = await client.query(`
      UPDATE messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE receiver_id = $1
      AND sender_id IN (
        SELECT user_id FROM celebrities WHERE id = $2
      )
      AND is_read = false
      RETURNING *
    `, [req.user.id, celebrityId]);

    res.json({
      message: 'Conversation marked as read',
      updatedMessages: result.rows
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
