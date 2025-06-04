import express from 'express';
import client from '../config/database.js';

const router = express.Router();

// Database setup endpoint - ONLY for initial setup
router.get('/database', async (req, res) => {
  try {
    console.log('🔧 Setting up database tables...');

    // Create all tables
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create Users table
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'celebrity', 'admin')),
          full_name VARCHAR(100),
          profile_image VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Celebrities table
      CREATE TABLE IF NOT EXISTS celebrities (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          bio TEXT,
          category VARCHAR(50),
          profile_image VARCHAR(500),
          available_for_booking BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
          date TIMESTAMP NOT NULL,
          purpose TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Messages table
      CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
          receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
          celebrity_id UUID REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_celebrities_user_id ON celebrities(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_celebrity_id ON appointments(celebrity_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

      -- Insert default admin user (password: admin123)
      INSERT INTO users (username, email, password, role, full_name)
      VALUES (
          'admin',
          'admin@celebrityconnect.com',
          '$2b$10$8K1p/a0dclxKoNqIfrHb4.FRCdmHlS02koEGjwQzjIhFJXMJW3aMi',
          'admin',
          'System Administrator'
      ) ON CONFLICT (username) DO NOTHING;

      -- Insert test user (password: test123)
      INSERT INTO users (username, email, password, role, full_name)
      VALUES (
          'testuser',
          'test@celebrityconnect.com',
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          'user',
          'Test User'
      ) ON CONFLICT (username) DO NOTHING;
    `;

    await client.query(createTablesSQL);

    // Check what was created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const adminResult = await client.query(`
      SELECT username, email, role 
      FROM users 
      WHERE role = 'admin'
    `);

    console.log('✅ Database setup completed successfully!');

    res.json({
      success: true,
      message: 'Database setup completed successfully!',
      tables_created: tablesResult.rows.map(row => row.table_name),
      admin_users: adminResult.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database setup failed. Check logs for details.'
    });
  }
});

// Check database status
router.get('/status', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const usersResult = await client.query('SELECT username, email, role FROM users ORDER BY created_at');

    res.json({
      database_connected: true,
      current_time: result.rows[0].current_time,
      postgres_version: result.rows[0].postgres_version,
      tables_count: parseInt(tablesResult.rows[0].table_count),
      users: usersResult.rows,
      message: 'Database is connected and ready!'
    });
  } catch (error) {
    res.status(500).json({
      database_connected: false,
      error: error.message,
      message: 'Database connection failed'
    });
  }
});

// Test login functionality
router.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Check if user exists
    const userResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      return res.json({
        success: false,
        error: 'User not found',
        debug: {
          username_provided: username,
          users_in_db: await client.query('SELECT username FROM users').then(r => r.rows.map(u => u.username))
        }
      });
    }

    const user = userResult.rows[0];

    // Test password
    const bcrypt = await import('bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);

    res.json({
      success: isMatch,
      message: isMatch ? 'Login credentials are valid' : 'Invalid password',
      debug: {
        username: user.username,
        email: user.email,
        role: user.role,
        password_match: isMatch
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Login test failed'
    });
  }
});

export default router;
