import { Router } from 'express';
import client from '../config/database.js';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('🔐 Authentication check:');
  console.log('   - Session ID:', req.sessionID);
  console.log('   - Session exists:', !!req.session);
  console.log('   - User authenticated:', req.isAuthenticated());
  console.log('   - User in session:', !!req.user);
  console.log('   - User details:', req.user ? { id: req.user.id, username: req.user.username } : 'None');

  if (req.isAuthenticated()) {
    console.log('✅ User authenticated, proceeding...');
    return next();
  }

  console.log('❌ User not authenticated, returning 401');
  res.status(401).json({
    error: 'Not authenticated',
    sessionId: req.sessionID,
    hasSession: !!req.session,
    isAuthenticated: req.isAuthenticated()
  });
};

// Get all appointments for the current user
router.get('/my-appointments', isAuthenticated, async (req, res) => {
  try {
    console.log('📅 Fetching appointments for user:', req.user.username, '(ID:', req.user.id, ')');
    let appointments = [];

    if (req.user.role === 'celebrity') {
      // If user is a celebrity, get appointments for their celebrity profile
      const celebrityResult = await client.query(
        'SELECT id FROM celebrities WHERE user_id = $1',
        [req.user.id]
      );

      if (celebrityResult.rows.length > 0) {
        const celebrityId = celebrityResult.rows[0].id;
        const appointmentsResult = await client.query(`
          SELECT
            a.id, a.date, a.purpose, a.status, a.created_at, a.updated_at,
            u.id as user_id, u.username, u.email,
            c.id as celebrity_id, c.name as celebrity_name, c.profile_image
          FROM appointments a
          JOIN users u ON a.user_id = u.id
          JOIN celebrities c ON a.celebrity_id = c.id
          WHERE a.celebrity_id = $1
          ORDER BY a.date ASC
        `, [celebrityId]);

        appointments = appointmentsResult.rows.map(row => ({
          id: row.id,
          date: row.date,
          purpose: row.purpose,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          User: {
            id: row.user_id,
            username: row.username,
            email: row.email
          },
          Celebrity: {
            id: row.celebrity_id,
            name: row.celebrity_name,
            profileImage: row.profile_image
          }
        }));
      }
    } else {
      // If user is regular user, get their appointments with celebrities
      const appointmentsResult = await client.query(`
        SELECT
          a.id, a.date, a.purpose, a.status, a.created_at, a.updated_at,
          u.id as user_id, u.username, u.email,
          c.id as celebrity_id, c.name as celebrity_name, c.profile_image
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN celebrities c ON a.celebrity_id = c.id
        WHERE a.user_id = $1
        ORDER BY a.date ASC
      `, [req.user.id]);

      appointments = appointmentsResult.rows.map(row => ({
        id: row.id,
        date: row.date,
        purpose: row.purpose,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        User: {
          id: row.user_id,
          username: row.username,
          email: row.email
        },
        Celebrity: {
          id: row.celebrity_id,
          name: row.celebrity_name,
          profileImage: row.profile_image
        }
      }));
    }

    console.log('📅 Returning', appointments.length, 'appointments for user:', req.user.username);
    res.json(appointments);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Book an appointment with a celebrity
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { celebrityId, date, purpose } = req.body;

    console.log('📅 Booking appointment:', {
      userId: req.user.id,
      username: req.user.username,
      celebrityId,
      date,
      purpose
    });

    // Validate required fields
    if (!celebrityId || !date || !purpose) {
      return res.status(400).json({
        error: 'Missing required fields: celebrityId, date, and purpose are required'
      });
    }

    // Check if celebrity exists and is available for booking
    const celebrityResult = await client.query(
      'SELECT * FROM celebrities WHERE id = $1',
      [celebrityId]
    );

    if (celebrityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    const celebrity = celebrityResult.rows[0];

    if (!celebrity.available_for_booking) {
      return res.status(400).json({ error: 'Celebrity is not available for booking' });
    }

    // Create appointment (using the correct schema)
    const appointmentResult = await client.query(
      'INSERT INTO appointments (user_id, celebrity_id, date, purpose, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, celebrityId, date, purpose, 'pending']
    );

    console.log('✅ Appointment created successfully:', appointmentResult.rows[0]);

    // Return appointment with celebrity details
    res.status(201).json({
      ...appointmentResult.rows[0],
      Celebrity: {
        id: celebrity.id,
        name: celebrity.name,
        profile_image: celebrity.profile_image,
        category: celebrity.category
      }
    });

  } catch (err) {
    console.error('❌ Error creating appointment:', err);

    // Handle specific database errors
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Invalid celebrity ID or user ID' });
    }

    res.status(500).json({
      error: 'Failed to create appointment',
      details: err.message
    });
  }
});

// Update appointment status (ADMIN ONLY)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    // Only admins can update appointment status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required to update appointment status' });
    }

    // Get appointment
    const appointmentResult = await client.query(
      'SELECT * FROM appointments WHERE id = $1',
      [req.params.id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update appointment status
    const updatedResult = await client.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
