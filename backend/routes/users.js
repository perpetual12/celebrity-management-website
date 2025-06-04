import { Router } from 'express';
import passport from 'passport';
import client from '../config/database.js';
import bcrypt from 'bcrypt';
import { createNotification } from './notifications.js';
import upload from '../config/upload.js';
import fs from 'fs';
import path from 'path';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { username, email, password, role = 'user' } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert user into database
    const result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );

    console.log('User created successfully:', result.rows[0]);

    const newUser = result.rows[0];

    // Create welcome notification for new user (only for non-admin users)
    if (newUser.role !== 'admin') {
      try {
        await createNotification(
          newUser.id,
          'welcome',
          'Welcome to Celebrity Connect! 🎉',
          `Hi ${newUser.username}! Welcome to Celebrity Connect. Start exploring celebrities, book appointments, and send messages to connect with your favorite stars!`
        );
        console.log('Welcome notification created for new user:', newUser.username);
      } catch (notificationErr) {
        console.error('Failed to create welcome notification:', notificationErr);
        // Don't fail registration if notification creation fails
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  }
});

// Login with better error handling
router.post('/login', (req, res, next) => {
  console.log('🔐 Login attempt for user:', req.body.username);

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('❌ Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }

    if (!user) {
      console.log('❌ Login failed:', info?.message || 'Invalid credentials');
      return res.status(401).json({
        error: info?.message || 'Invalid username or password'
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('❌ Session creation error:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      console.log('✅ Login successful for user:', user.username);
      console.log('✅ Session ID:', req.sessionID);
      console.log('✅ Session created:', !!req.session);

      res.json({
        user: userWithoutPassword,
        message: 'Login successful',
        sessionId: req.sessionID
      });
    });
  })(req, res, next);
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Update user profile with file upload
router.put('/profile', upload.single('profileImage'), (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const updateProfile = async () => {
    try {
      const userId = req.user.id;
      const { username, email, fullName, bio } = req.body;

      // Validate required fields
      if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
      }

      // Check if username or email is taken by another user
      const existingUser = await client.query(
        'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
        [username, email, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username or email already taken by another user' });
      }

      // Handle profile image
      let profileImagePath = null;
      if (req.file) {
        profileImagePath = `/uploads/profiles/${req.file.filename}`;

        // Delete old profile image if it exists
        if (req.user.profile_image) {
          const oldImagePath = path.join(process.cwd(), req.user.profile_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      } else if (req.user.profile_image) {
        // Keep existing image if no new image uploaded
        profileImagePath = req.user.profile_image;
      }

      // Update user profile
      const result = await client.query(
        'UPDATE users SET username = $1, email = $2, full_name = $3, bio = $4, profile_image = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, username, email, full_name, bio, profile_image, role, created_at, updated_at',
        [username, email, fullName || null, bio || null, profileImagePath, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update the session user data
      req.user = { ...req.user, ...result.rows[0] };

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0]
      });

    } catch (err) {
      console.error('Error updating profile:', err);

      // Clean up uploaded file if there was an error
      if (req.file) {
        const filePath = path.join(process.cwd(), 'uploads/profiles', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      if (err.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'Username or email already exists' });
      } else {
        res.status(500).json({ error: 'Failed to update profile' });
      }
    }
  };

  updateProfile();
});

// Delete user account
router.delete('/delete-account', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const deleteAccount = async () => {
    try {
      const userId = req.user.id;

      // Don't allow admin accounts to be deleted this way
      if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Admin accounts cannot be deleted through this endpoint' });
      }

      // Start transaction
      await client.query('BEGIN');

      try {
        // Delete related data first (foreign key constraints)

        // Delete user's messages
        await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId]);

        // Delete user's appointments
        await client.query('DELETE FROM appointments WHERE user_id = $1', [userId]);

        // Delete user's notifications
        await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);

        // If user is a celebrity, delete celebrity profile
        if (req.user.role === 'celebrity') {
          await client.query('DELETE FROM celebrities WHERE user_id = $1', [userId]);
        }

        // Finally, delete the user account
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING username', [userId]);

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        // Commit transaction
        await client.query('COMMIT');

        // Destroy session
        req.logout((err) => {
          if (err) {
            console.error('Error during logout:', err);
          }
        });

        res.json({
          message: 'Account deleted successfully',
          deletedUser: result.rows[0].username
        });

      } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        throw error;
      }

    } catch (err) {
      console.error('Error deleting account:', err);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  };

  deleteAccount();
});

export default router;
