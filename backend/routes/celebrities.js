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

// Get all celebrities with search and filter
router.get('/', async (req, res) => {
  try {
    console.log('🎭 Fetching all celebrities...');
    const { search, category, available } = req.query;

    let query = `
      SELECT
        c.id, c.name, c.bio, c.category, c.profile_image, c.available_for_booking, c.created_at, c.updated_at,
        u.username, u.email, u.full_name
      FROM celebrities c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (c.name ILIKE $${paramCount} OR c.bio ILIKE $${paramCount} OR c.category ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add category filter
    if (category) {
      paramCount++;
      query += ` AND c.category = $${paramCount}`;
      params.push(category);
    }

    // Add availability filter
    if (available !== undefined) {
      paramCount++;
      query += ` AND c.available_for_booking = $${paramCount}`;
      params.push(available === 'true');
    }

    query += ` ORDER BY c.created_at DESC`;

    console.log('🎭 Executing query:', query);
    console.log('🎭 Query params:', params);

    const result = await client.query(query, params);
    console.log(`🎭 Found ${result.rows.length} celebrities in database`);

    // Transform snake_case to camelCase for frontend compatibility
    const transformedRows = result.rows.map(row => ({
      ...row,
      profileImage: row.profile_image,
      availableForBooking: row.available_for_booking,
      fullName: row.full_name
    }));

    console.log('🎭 Returning celebrities:', transformedRows.map(c => ({ id: c.id, name: c.name, username: c.username })));
    res.json(transformedRows);
  } catch (err) {
    console.error('❌ Error fetching celebrities:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get celebrity by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        c.id, c.name, c.bio, c.category, c.profile_image, c.available_for_booking, c.created_at, c.updated_at,
        u.username, u.email
      FROM celebrities c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    // Transform snake_case to camelCase for frontend compatibility
    const celebrity = {
      ...result.rows[0],
      profileImage: result.rows[0].profile_image,
      availableForBooking: result.rows[0].available_for_booking
    };

    res.json(celebrity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create celebrity profile (ADMIN ONLY)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Only admins can create celebrity profiles
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Celebrity accounts can only be created by administrators. Please contact support if you would like to become a celebrity on our platform.'
      });
    }

    // Check if user is already a celebrity
    const existingResult = await client.query(
      'SELECT id FROM celebrities WHERE user_id = $1',
      [req.user.id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Celebrity profile already exists' });
    }

    const { name, bio, category, profileImage } = req.body;

    // Create celebrity profile
    const celebrityResult = await client.query(
      'INSERT INTO celebrities (user_id, name, bio, category, profile_image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, bio, category, profileImage]
    );

    // Update user role to celebrity
    await client.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['celebrity', req.user.id]
    );

    res.status(201).json(celebrityResult.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update celebrity profile
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    // Get celebrity profile
    const celebrityResult = await client.query(
      'SELECT * FROM celebrities WHERE id = $1',
      [req.params.id]
    );

    if (celebrityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Celebrity not found' });
    }

    const celebrity = celebrityResult.rows[0];

    // Check if user owns this profile or is admin
    if (celebrity.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, bio, category, profileImage, availableForBooking } = req.body;

    // Update celebrity profile
    const updatedResult = await client.query(
      'UPDATE celebrities SET name = $1, bio = $2, category = $3, profile_image = $4, available_for_booking = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, bio, category, profileImage, availableForBooking, req.params.id]
    );

    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;