import express from 'express';
import client from '../config/database.js';
import pkg from 'pg';

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

      -- Insert default admin user (password: admin123) - ALWAYS ensure admin exists
      -- Using bcrypt hash for 'admin123': $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
      INSERT INTO users (username, email, password, role, full_name)
      VALUES ('admin', 'admin@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator')
      ON CONFLICT (username) DO UPDATE SET
        password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role = 'admin',
        full_name = 'System Administrator';

      -- Insert test user (password: test123) - ONLY if not exists
      INSERT INTO users (username, email, password, role, full_name)
      SELECT 'testuser', 'test@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Test User'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser');

      -- Insert sample celebrities - ONLY if they don't exist
      INSERT INTO users (username, email, password, role, full_name)
      SELECT 'tomhanks', 'tom@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'celebrity', 'Tom Hanks'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'tomhanks');

      INSERT INTO users (username, email, password, role, full_name)
      SELECT 'oprah', 'oprah@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'celebrity', 'Oprah Winfrey'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'oprah');

      INSERT INTO users (username, email, password, role, full_name)
      SELECT 'therock', 'rock@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'celebrity', 'Dwayne Johnson'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'therock');

      INSERT INTO users (username, email, password, role, full_name)
      SELECT 'taylorswift', 'taylor@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'celebrity', 'Taylor Swift'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'taylorswift');

      -- Insert celebrity profiles - ONLY if they don't exist
      INSERT INTO celebrities (user_id, name, bio, category, profile_image, available_for_booking)
      SELECT
          u.id,
          CASE
              WHEN u.username = 'tomhanks' THEN 'Tom Hanks'
              WHEN u.username = 'oprah' THEN 'Oprah Winfrey'
              WHEN u.username = 'therock' THEN 'Dwayne Johnson'
              WHEN u.username = 'taylorswift' THEN 'Taylor Swift'
          END,
          CASE
              WHEN u.username = 'tomhanks' THEN 'Academy Award-winning actor known for Forrest Gump, Cast Away, and Toy Story.'
              WHEN u.username = 'oprah' THEN 'Media mogul, talk show host, and philanthropist inspiring millions worldwide.'
              WHEN u.username = 'therock' THEN 'Actor, producer, and former professional wrestler. Known for Fast & Furious and Jumanji.'
              WHEN u.username = 'taylorswift' THEN 'Grammy Award-winning singer-songwriter and global music icon.'
          END,
          CASE
              WHEN u.username = 'tomhanks' THEN 'Actor'
              WHEN u.username = 'oprah' THEN 'Media Personality'
              WHEN u.username = 'therock' THEN 'Actor'
              WHEN u.username = 'taylorswift' THEN 'Musician'
          END,
          CASE
              WHEN u.username = 'tomhanks' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tom_Hanks_TIFF_2019.jpg/400px-Tom_Hanks_TIFF_2019.jpg'
              WHEN u.username = 'oprah' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Oprah_in_2014.jpg/400px-Oprah_in_2014.jpg'
              WHEN u.username = 'therock' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Dwayne_Johnson_2014_%28cropped%29.jpg/400px-Dwayne_Johnson_2014_%28cropped%29.jpg'
              WHEN u.username = 'taylorswift' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_4.png/400px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_4.png'
          END,
          true
      FROM users u
      WHERE u.username IN ('tomhanks', 'oprah', 'therock', 'taylorswift')
        AND NOT EXISTS (SELECT 1 FROM celebrities WHERE user_id = u.id);

      -- Create sample notifications for testuser
      INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
      SELECT
          u.id,
          'welcome',
          'Welcome to Celebrity Connect!',
          'Thank you for joining Celebrity Connect! Start exploring celebrities and book your first appointment.',
          false,
          CURRENT_TIMESTAMP
      FROM users u
      WHERE u.username = 'testuser'
        AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id AND type = 'welcome');
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

// Check database status and existing data
router.get('/status', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const usersResult = await client.query('SELECT username, email, role, created_at FROM users ORDER BY created_at');
    const celebritiesResult = await client.query(`
      SELECT c.name, c.category, c.available_for_booking, u.username, c.created_at
      FROM celebrities c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at
    `);

    res.json({
      database_connected: true,
      current_time: result.rows[0].current_time,
      postgres_version: result.rows[0].postgres_version,
      tables_count: parseInt(tablesResult.rows[0].table_count),
      users: usersResult.rows,
      celebrities: celebritiesResult.rows,
      summary: {
        total_users: usersResult.rows.length,
        total_celebrities: celebritiesResult.rows.length,
        admins: usersResult.rows.filter(u => u.role === 'admin').length,
        regular_users: usersResult.rows.filter(u => u.role === 'user').length,
        celebrity_users: usersResult.rows.filter(u => u.role === 'celebrity').length
      },
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

// Check session status
router.get('/session', (req, res) => {
  console.log('🔍 Session debug request:');
  console.log('   - Session ID:', req.sessionID);
  console.log('   - Session exists:', !!req.session);
  console.log('   - User authenticated:', req.isAuthenticated());
  console.log('   - User in session:', !!req.user);
  console.log('   - Has cookies:', !!req.headers.cookie);

  res.json({
    session_exists: !!req.session,
    session_id: req.sessionID,
    user_authenticated: req.isAuthenticated(),
    has_cookies: !!req.headers.cookie,
    user_info: req.user ? {
      username: req.user.username,
      role: req.user.role,
      id: req.user.id
    } : null,
    session_data: req.session ? {
      cookie: req.session.cookie,
      passport: req.session.passport
    } : null,
    cookies_received: req.headers.cookie || 'None',
    timestamp: new Date().toISOString()
  });
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

// Add sample data without affecting existing data
router.post('/add-sample-data', async (req, res) => {
  try {
    console.log('🔧 Adding sample data (preserving existing data)...');

    // Add sample celebrities only if they don't exist
    const sampleCelebrities = [
      {
        username: 'tomhanks',
        email: 'tom@celebrityconnect.com',
        fullName: 'Tom Hanks',
        name: 'Tom Hanks',
        bio: 'Academy Award-winning actor known for Forrest Gump, Cast Away, and Toy Story.',
        category: 'Actor',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tom_Hanks_TIFF_2019.jpg/400px-Tom_Hanks_TIFF_2019.jpg'
      },
      {
        username: 'oprah',
        email: 'oprah@celebrityconnect.com',
        fullName: 'Oprah Winfrey',
        name: 'Oprah Winfrey',
        bio: 'Media mogul, talk show host, and philanthropist inspiring millions worldwide.',
        category: 'Media Personality',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Oprah_in_2014.jpg/400px-Oprah_in_2014.jpg'
      }
    ];

    let addedCount = 0;

    for (const celeb of sampleCelebrities) {
      // Check if user exists
      const userExists = await client.query('SELECT id FROM users WHERE username = $1', [celeb.username]);

      if (userExists.rows.length === 0) {
        // Add user
        const userResult = await client.query(
          'INSERT INTO users (username, email, password, role, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [celeb.username, celeb.email, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'celebrity', celeb.fullName]
        );

        // Add celebrity profile
        await client.query(
          'INSERT INTO celebrities (user_id, name, bio, category, profile_image, available_for_booking) VALUES ($1, $2, $3, $4, $5, $6)',
          [userResult.rows[0].id, celeb.name, celeb.bio, celeb.category, celeb.image, true]
        );

        addedCount++;
        console.log(`✅ Added celebrity: ${celeb.name}`);
      } else {
        console.log(`⏭️ Celebrity ${celeb.name} already exists, skipping`);
      }
    }

    res.json({
      success: true,
      message: `Sample data setup completed. Added ${addedCount} new celebrities.`,
      added_celebrities: addedCount
    });

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to add sample data'
    });
  }
});

// Repair existing database data
router.post('/repair-database', async (req, res) => {
  try {
    console.log('🔧 Repairing existing database data...');
    const repairs = [];

    // 0. Add missing columns if they don't exist
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
            ALTER TABLE users ADD COLUMN bio TEXT;
          END IF;
        END $$;
      `);
      repairs.push('Ensured bio column exists in users table');
    } catch (err) {
      console.log('Bio column already exists or error:', err.message);
    }

    // 1. Fix missing full_name in users table
    const usersWithoutFullName = await client.query(`
      UPDATE users
      SET full_name = COALESCE(full_name, username)
      WHERE full_name IS NULL OR full_name = ''
      RETURNING username, full_name
    `);
    if (usersWithoutFullName.rows.length > 0) {
      repairs.push(`Fixed ${usersWithoutFullName.rows.length} users missing full_name`);
    }

    // 2. Ensure all celebrity users have celebrity profiles
    const celebrityUsersWithoutProfiles = await client.query(`
      SELECT u.id, u.username, u.full_name
      FROM users u
      WHERE u.role = 'celebrity'
      AND NOT EXISTS (SELECT 1 FROM celebrities c WHERE c.user_id = u.id)
    `);

    for (const user of celebrityUsersWithoutProfiles.rows) {
      await client.query(`
        INSERT INTO celebrities (user_id, name, bio, category, available_for_booking)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        user.id,
        user.full_name || user.username,
        `Celebrity profile for ${user.full_name || user.username}`,
        'Entertainment',
        true
      ]);
      repairs.push(`Created celebrity profile for ${user.username}`);
    }

    // 3. Fix any celebrities without proper user relationships
    const orphanedCelebrities = await client.query(`
      SELECT c.id, c.name
      FROM celebrities c
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = c.user_id)
    `);
    if (orphanedCelebrities.rows.length > 0) {
      await client.query(`DELETE FROM celebrities WHERE id = ANY($1)`,
        [orphanedCelebrities.rows.map(c => c.id)]);
      repairs.push(`Removed ${orphanedCelebrities.rows.length} orphaned celebrity profiles`);
    }

    // 4. Ensure admin user exists
    const adminExists = await client.query(`SELECT id FROM users WHERE username = 'admin'`);
    if (adminExists.rows.length === 0) {
      await client.query(`
        INSERT INTO users (username, email, password, role, full_name)
        VALUES ('admin', 'admin@celebrityconnect.com', '$2b$10$8K1p/a0dclxKoNqIfrHb4.FRCdmHlS02koEGjwQzjIhFJXMJW3aMi', 'admin', 'System Administrator')
      `);
      repairs.push('Created missing admin user');
    }

    // 5. Update any users with role 'celebrity' to ensure they have proper setup
    await client.query(`
      UPDATE users
      SET role = 'celebrity'
      WHERE id IN (SELECT user_id FROM celebrities)
      AND role != 'celebrity'
    `);

    res.json({
      success: true,
      message: 'Database repair completed',
      repairs: repairs,
      repair_count: repairs.length
    });

  } catch (error) {
    console.error('❌ Error repairing database:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to repair database'
    });
  }
});

// Debug database connection
router.get('/database-info', async (req, res) => {
  try {
    // Get database connection info
    const dbInfo = await client.query(`
      SELECT
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port,
        version() as postgres_version
    `);

    // Get environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREVIEW: process.env.DATABASE_URL ?
        process.env.DATABASE_URL.substring(0, 20) + '...' + process.env.DATABASE_URL.slice(-20) :
        'Not set',
      DB_HOST: process.env.DB_HOST || 'Not set',
      DB_NAME: process.env.DB_NAME || 'Not set',
      DB_PORT: process.env.DB_PORT || 'Not set',
      DB_USERNAME: process.env.DB_USERNAME || 'Not set'
    };

    res.json({
      success: true,
      database_info: dbInfo.rows[0],
      environment_info: envInfo,
      connection_type: process.env.DATABASE_URL ? 'DATABASE_URL (Render Managed)' : 'Individual Environment Variables',
      message: 'Database connection information retrieved successfully',
      instructions: {
        current_database: dbInfo.rows[0].database_name,
        pgadmin_connection: 'To connect PgAdmin to this database, use the connection details shown above',
        data_sync: 'If you want to use your existing PgAdmin database, update the DATABASE_URL environment variable in Render'
      }
    });

  } catch (error) {
    console.error('❌ Error getting database info:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get database information'
    });
  }
});

// Migrate data from external database (if needed)
router.post('/migrate-external-data', async (req, res) => {
  try {
    const { externalDatabaseUrl } = req.body;

    if (!externalDatabaseUrl) {
      return res.status(400).json({
        success: false,
        message: 'External database URL is required'
      });
    }

    // This would require implementing a data migration script
    // For now, just return instructions
    res.json({
      success: false,
      message: 'Data migration feature not implemented yet',
      instructions: [
        '1. Export your data from PgAdmin as SQL dump',
        '2. Import the SQL dump into the current database',
        '3. Or update DATABASE_URL in Render to point to your PgAdmin database',
        '4. Make sure your PgAdmin database is accessible from the internet'
      ],
      current_database_info: 'Use /api/setup/database-info to see current database details'
    });

  } catch (error) {
    console.error('❌ Error in migration:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to migrate data'
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    console.log('🔍 Health check: Testing database connection...');

    // Test database connection with simpler query
    const result = await client.query('SELECT NOW() as current_time');

    console.log('✅ Health check: Database query successful');
    console.log('   - Current time:', result.rows[0]?.current_time);

    // Determine database type
    const isInMemory = process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL;
    const dbType = isInMemory ? 'In-Memory Database' : 'PostgreSQL';

    res.json({
      status: 'healthy',
      database: 'connected',
      database_type: dbType,
      timestamp: result.rows[0]?.current_time || new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      connection_type: process.env.DATABASE_URL ? 'DATABASE_URL' : 'In-Memory Fallback',
      server_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.error('   - Error message:', error.message);
    console.error('   - Error code:', error.code);

    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      error_code: error.code,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      connection_type: process.env.DATABASE_URL ? 'DATABASE_URL' : 'In-Memory Fallback',
      suggestions: [
        'Check database connection',
        'Verify environment variables',
        'Check server logs for details'
      ]
    });
  }
});

// Test database connection endpoint
router.post('/test-connection', async (req, res) => {
  try {
    const { databaseUrl } = req.body;

    if (!databaseUrl) {
      return res.status(400).json({
        success: false,
        message: 'Database URL is required'
      });
    }

    // Test connection with provided URL
    const { Client } = pkg;
    const testClient = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await testClient.connect();
      const result = await testClient.query('SELECT NOW() as current_time, current_database() as db_name');
      await testClient.end();

      res.json({
        success: true,
        message: 'Database connection successful',
        database_name: result.rows[0].db_name,
        server_time: result.rows[0].current_time
      });
    } catch (testError) {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: testError.message,
        suggestions: [
          'Check if database server is accessible from internet',
          'Verify host and port in connection string',
          'Check firewall settings',
          'Verify database credentials',
          'Ensure SSL configuration is correct'
        ]
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test database connection'
    });
  }
});

// Create or reset admin user
router.post('/create-admin', async (req, res) => {
  try {
    console.log('👑 Creating/resetting admin user...');

    // Import bcrypt for password hashing
    const bcrypt = await import('bcrypt');

    // Hash the password properly
    const hashedPassword = await bcrypt.default.hash('admin123', 10);
    console.log('🔐 Generated password hash for admin123');

    // Create or update admin user
    const result = await client.query(`
      INSERT INTO users (username, email, password, role, full_name)
      VALUES ('admin', 'admin@celebrityconnect.com', $1, 'admin', 'System Administrator')
      ON CONFLICT (username) DO UPDATE SET
        password = $1,
        role = 'admin',
        full_name = 'System Administrator',
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, username, email, role, full_name, created_at
    `, [hashedPassword]);

    const adminUser = result.rows[0];
    console.log('✅ Admin user created/updated:', adminUser.username);

    res.json({
      success: true,
      message: 'Admin user created/updated successfully',
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        full_name: adminUser.full_name,
        created_at: adminUser.created_at
      },
      credentials: {
        username: 'admin',
        password: 'admin123',
        secret_key: process.env.ADMIN_SECRET_KEY || 'CELEBRITY_ADMIN_2024_SECURE',
        note: 'Use these credentials and secret key to login to admin panel'
      },
      login_requirements: {
        username: 'admin',
        password: 'admin123',
        secretKey: process.env.ADMIN_SECRET_KEY || 'CELEBRITY_ADMIN_2024_SECURE',
        note: 'All three fields are required for admin login'
      }
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create admin user'
    });
  }
});

// Quick setup endpoint - creates everything needed
router.post('/quick-setup', async (req, res) => {
  try {
    console.log('🚀 Running quick setup...');
    const results = [];

    // 1. Create tables
    try {
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
      `);
      results.push('✅ Users table created');
    } catch (err) {
      results.push(`⚠️ Users table: ${err.message}`);
    }

    // 2. Create admin user
    try {
      const adminResult = await client.query(`
        INSERT INTO users (username, email, password, role, full_name)
        VALUES ('admin', 'admin@celebrityconnect.com', '$2b$10$8K1p/a0dclxKoNqIfrHb4.FRCdmHlS02koEGjwQzjIhFJXMJW3aMi', 'admin', 'System Administrator')
        ON CONFLICT (username) DO UPDATE SET
          password = '$2b$10$8K1p/a0dclxKoNqIfrHb4.FRCdmHlS02koEGjwQzjIhFJXMJW3aMi',
          role = 'admin'
        RETURNING username
      `);
      results.push(`✅ Admin user: ${adminResult.rows[0].username}`);
    } catch (err) {
      results.push(`❌ Admin user: ${err.message}`);
    }

    // 3. Create test user
    try {
      const testResult = await client.query(`
        INSERT INTO users (username, email, password, role, full_name)
        VALUES ('testuser', 'test@celebrityconnect.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Test User')
        ON CONFLICT (username) DO NOTHING
        RETURNING username
      `);
      if (testResult.rows.length > 0) {
        results.push(`✅ Test user: ${testResult.rows[0].username}`);
      } else {
        results.push('⏭️ Test user already exists');
      }
    } catch (err) {
      results.push(`❌ Test user: ${err.message}`);
    }

    res.json({
      success: true,
      message: 'Quick setup completed',
      results: results,
      admin_credentials: {
        username: 'admin',
        password: 'admin123'
      },
      test_credentials: {
        username: 'testuser',
        password: 'test123'
      }
    });

  } catch (error) {
    console.error('❌ Quick setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Quick setup failed'
    });
  }
});

// Test appointment booking
router.post('/test-appointment', async (req, res) => {
  try {
    // Get test user and celebrity
    const testUser = await client.query('SELECT * FROM users WHERE username = $1', ['testuser']);
    const testCelebrity = await client.query('SELECT * FROM celebrities LIMIT 1');

    if (testUser.rows.length === 0) {
      return res.status(404).json({ error: 'Test user not found' });
    }

    if (testCelebrity.rows.length === 0) {
      return res.status(404).json({ error: 'No celebrities found' });
    }

    const user = testUser.rows[0];
    const celebrity = testCelebrity.rows[0];

    // Create test appointment
    const appointmentResult = await client.query(
      'INSERT INTO appointments (user_id, celebrity_id, date, purpose, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, celebrity.id, new Date(Date.now() + 24 * 60 * 60 * 1000), 'Test appointment booking', 'pending']
    );

    res.json({
      success: true,
      message: 'Test appointment created successfully',
      appointment: appointmentResult.rows[0],
      user: { id: user.id, username: user.username },
      celebrity: { id: celebrity.id, name: celebrity.name }
    });

  } catch (error) {
    console.error('❌ Test appointment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create test appointment'
    });
  }
});

// Test message sending
router.post('/test-message', async (req, res) => {
  try {
    // Get test user and celebrity
    const testUser = await client.query('SELECT * FROM users WHERE username = $1', ['testuser']);
    const testCelebrity = await client.query('SELECT * FROM celebrities LIMIT 1');

    if (testUser.rows.length === 0) {
      return res.status(404).json({ error: 'Test user not found' });
    }

    if (testCelebrity.rows.length === 0) {
      return res.status(404).json({ error: 'No celebrities found' });
    }

    const user = testUser.rows[0];
    const celebrity = testCelebrity.rows[0];

    // Create test message
    const messageResult = await client.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [user.id, celebrity.user_id, 'Test message from user to celebrity']
    );

    res.json({
      success: true,
      message: 'Test message created successfully',
      messageData: messageResult.rows[0],
      user: { id: user.id, username: user.username },
      celebrity: { id: celebrity.id, name: celebrity.name, user_id: celebrity.user_id }
    });

  } catch (error) {
    console.error('❌ Test message error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create test message'
    });
  }
});

// Check admin user specifically
router.get('/check-admin', async (req, res) => {
  try {
    console.log('👑 Checking admin user...');

    // Check if admin user exists
    const adminResult = await client.query(
      'SELECT id, username, email, role, full_name, created_at FROM users WHERE username = $1',
      ['admin']
    );

    if (adminResult.rows.length === 0) {
      return res.json({
        admin_exists: false,
        message: 'Admin user does not exist',
        suggestion: 'Run /api/setup/create-admin to create admin user'
      });
    }

    const admin = adminResult.rows[0];

    // Check password hash
    const passwordResult = await client.query(
      'SELECT password FROM users WHERE username = $1',
      ['admin']
    );

    res.json({
      admin_exists: true,
      admin_info: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name,
        created_at: admin.created_at
      },
      password_hash_preview: passwordResult.rows[0].password.substring(0, 20) + '...',
      expected_credentials: {
        username: 'admin',
        password: 'admin123',
        secret_key: 'celebrity-admin-2024'
      },
      message: 'Admin user found in database'
    });

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
    res.status(500).json({
      admin_exists: false,
      error: error.message,
      message: 'Failed to check admin user'
    });
  }
});

// Test admin login credentials
router.post('/test-admin-login', async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;

    console.log('🧪 Testing admin login credentials...');
    console.log('   - Username:', username);
    console.log('   - Password provided:', !!password);
    console.log('   - Secret key provided:', !!secretKey);

    // Check admin user exists
    const adminResult = await client.query(
      'SELECT id, username, email, role, password FROM users WHERE username = $1',
      [username || 'admin']
    );

    if (adminResult.rows.length === 0) {
      return res.json({
        success: false,
        error: 'Admin user not found',
        suggestion: 'Run /api/setup/create-admin first'
      });
    }

    const admin = adminResult.rows[0];

    // Check role
    if (admin.role !== 'admin') {
      return res.json({
        success: false,
        error: 'User is not an admin',
        user_role: admin.role
      });
    }

    // Check secret key
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || 'CELEBRITY_ADMIN_2024_SECURE';
    if (secretKey !== expectedSecretKey) {
      return res.json({
        success: false,
        error: 'Invalid secret key',
        expected_secret_key: expectedSecretKey,
        provided_secret_key: secretKey
      });
    }

    // Check password
    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.default.compare(password || 'admin123', admin.password);

    if (!isValidPassword) {
      return res.json({
        success: false,
        error: 'Invalid password',
        password_hash_preview: admin.password.substring(0, 20) + '...',
        suggestion: 'Password should be "admin123"'
      });
    }

    res.json({
      success: true,
      message: 'Admin login credentials are valid',
      admin_info: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      credentials_tested: {
        username: username || 'admin',
        password: 'admin123',
        secret_key: expectedSecretKey
      }
    });

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test admin login'
    });
  }
});

// Debug current authentication state
router.get('/debug-auth', async (req, res) => {
  try {
    console.log('🔍 Debug Auth Request:');
    console.log('   - Session ID:', req.sessionID);
    console.log('   - Session exists:', !!req.session);
    console.log('   - User authenticated:', req.isAuthenticated());
    console.log('   - User in session:', !!req.user);
    console.log('   - User details:', req.user);
    console.log('   - Session data:', req.session);
    console.log('   - Cookies:', req.headers.cookie);

    // Check what users exist in database
    const usersResult = await client.query('SELECT id, username, role, email FROM users ORDER BY created_at');

    // Check admin user specifically
    const adminResult = await client.query('SELECT * FROM users WHERE role = $1', ['admin']);

    res.json({
      session: {
        id: req.sessionID,
        exists: !!req.session,
        authenticated: req.isAuthenticated(),
        user: req.user || null,
        data: req.session || null
      },
      cookies: req.headers.cookie || 'None',
      database: {
        total_users: usersResult.rows.length,
        users: usersResult.rows,
        admin_users: adminResult.rows
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug auth error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to debug authentication'
    });
  }
});

// Force complete setup - creates everything from scratch
router.post('/force-setup', async (req, res) => {
  try {
    console.log('🚀 FORCE SETUP: Starting complete database setup...');
    const results = [];

    // Import bcrypt
    const bcrypt = await import('bcrypt');

    // 1. Create all tables
    console.log('📋 Creating tables...');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
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

      -- Celebrities table
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

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
        date TIMESTAMP NOT NULL,
        purpose TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_appointment_id UUID,
        related_message_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    results.push('✅ All tables created');

    // 2. Delete existing admin user if exists
    await client.query('DELETE FROM users WHERE username = $1', ['admin']);
    results.push('🗑️ Removed existing admin user');

    // 3. Create fresh admin user
    const adminPassword = await bcrypt.default.hash('admin123', 10);
    const adminResult = await client.query(`
      INSERT INTO users (username, email, password, role, full_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role, created_at
    `, ['admin', 'admin@celebrityconnect.com', adminPassword, 'admin', 'System Administrator']);

    const admin = adminResult.rows[0];
    results.push(`✅ Admin user created: ${admin.username} (${admin.id})`);

    // 4. Create test user if doesn't exist
    const testPassword = await bcrypt.default.hash('test123', 10);
    const testResult = await client.query(`
      INSERT INTO users (username, email, password, role, full_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username
    `, ['testuser', 'test@celebrityconnect.com', testPassword, 'user', 'Test User']);

    if (testResult.rows.length > 0) {
      results.push(`✅ Test user created: ${testResult.rows[0].username}`);
    } else {
      results.push('⏭️ Test user already exists');
    }

    // 5. Create sample celebrities
    const celebrities = [
      { name: 'Tom Hanks', bio: 'Academy Award-winning actor', category: 'Actor' },
      { name: 'Taylor Swift', bio: 'Grammy Award-winning singer', category: 'Musician' },
      { name: 'Oprah Winfrey', bio: 'Media mogul and philanthropist', category: 'TV Host' }
    ];

    for (const celeb of celebrities) {
      // Create user for celebrity
      const celebPassword = await bcrypt.default.hash('celeb123', 10);
      const celebUserResult = await client.query(`
        INSERT INTO users (username, email, password, role, full_name)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO NOTHING
        RETURNING id, username
      `, [
        celeb.name.toLowerCase().replace(' ', ''),
        `${celeb.name.toLowerCase().replace(' ', '')}@celebrityconnect.com`,
        celebPassword,
        'celebrity',
        celeb.name
      ]);

      if (celebUserResult.rows.length > 0) {
        // Create celebrity profile
        await client.query(`
          INSERT INTO celebrities (user_id, name, bio, category, available_for_booking)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [celebUserResult.rows[0].id, celeb.name, celeb.bio, celeb.category, true]);

        results.push(`✅ Celebrity created: ${celeb.name}`);
      }
    }

    res.json({
      success: true,
      message: 'Force setup completed successfully',
      results: results,
      admin_credentials: {
        username: 'admin',
        password: 'admin123',
        secret_key: process.env.ADMIN_SECRET_KEY || 'CELEBRITY_ADMIN_2024_SECURE'
      },
      test_credentials: {
        username: 'testuser',
        password: 'test123'
      }
    });

  } catch (error) {
    console.error('❌ Force setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Force setup failed'
    });
  }
});

// Test database connection with detailed error reporting
router.get('/test-db-connection', async (req, res) => {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection with simpler query
    const startTime = Date.now();
    const result = await client.query('SELECT NOW() as current_time');
    const connectionTime = Date.now() - startTime;

    console.log('✅ Database connection successful');
    console.log('   - Connection time:', connectionTime + 'ms');
    console.log('   - Current time:', result.rows[0]?.current_time);

    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Tables found:', tables);

    // Test user count
    let userCount = 0;
    let adminCount = 0;

    if (tables.includes('users')) {
      const userResult = await client.query('SELECT COUNT(*) as count FROM users');
      userCount = parseInt(userResult.rows[0].count);

      const adminResult = await client.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
      adminCount = parseInt(adminResult.rows[0].count);
    }

    res.json({
      success: true,
      connection: {
        status: 'connected',
        time_ms: connectionTime,
        database_type: process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL ? 'In-Memory' : 'PostgreSQL',
        current_time: result.rows[0]?.current_time || new Date().toISOString()
      },
      database: {
        tables_found: tables,
        total_tables: tables.length,
        has_users_table: tables.includes('users'),
        has_celebrities_table: tables.includes('celebrities'),
        has_appointments_table: tables.includes('appointments'),
        has_messages_table: tables.includes('messages'),
        has_notifications_table: tables.includes('notifications')
      },
      data: {
        total_users: userCount,
        admin_users: adminCount,
        setup_needed: userCount === 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position
      },
      connection_string_info: {
        has_database_url: !!process.env.DATABASE_URL,
        url_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'Not set',
        is_supabase: process.env.DATABASE_URL ? process.env.DATABASE_URL.includes('supabase.co') : false,
        is_neon: process.env.DATABASE_URL ? process.env.DATABASE_URL.includes('neon.tech') : false
      },
      suggestions: [
        'Check if DATABASE_URL is correctly formatted',
        'Verify database credentials are correct',
        'Ensure database server is accessible',
        'Check if SSL is required (add ?sslmode=require to URL)',
        'Verify the database exists and is not paused'
      ],
      timestamp: new Date().toISOString()
    });
  }
});

// Simple health check without database dependency
router.get('/simple-health', (req, res) => {
  console.log('🔍 Simple health check (no database)');

  res.json({
    status: 'healthy',
    server: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database_mode: process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL ? 'In-Memory' : 'PostgreSQL',
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Debug endpoint to check in-memory data
router.get('/debug-data', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking in-memory data...');

    // Get all users
    const usersResult = await client.query('SELECT id, username, role, email, full_name FROM users');
    console.log('📝 Users found:', usersResult.rows.length);

    // Get all celebrities
    const celebritiesResult = await client.query('SELECT id, name, category, available_for_booking FROM celebrities');
    console.log('📝 Celebrities found:', celebritiesResult.rows.length);

    // Get admin user specifically
    const adminResult = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    console.log('📝 Admin user found:', adminResult.rows.length > 0);

    // Get test user specifically
    const testResult = await client.query('SELECT * FROM users WHERE username = $1', ['testuser']);
    console.log('📝 Test user found:', testResult.rows.length > 0);

    res.json({
      success: true,
      data: {
        users: {
          total: usersResult.rows.length,
          list: usersResult.rows
        },
        celebrities: {
          total: celebritiesResult.rows.length,
          list: celebritiesResult.rows
        },
        admin_user: adminResult.rows[0] || null,
        test_user: testResult.rows[0] || null
      },
      database_type: process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL ? 'In-Memory' : 'PostgreSQL',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug data error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get debug data'
    });
  }
});

// Test all data fetching endpoints
router.get('/test-data-fetching', async (req, res) => {
  try {
    console.log('🔍 Testing all data fetching...');
    const results = {};

    // Test users
    try {
      const usersResult = await client.query('SELECT * FROM users');
      results.users = {
        success: true,
        count: usersResult.rows.length,
        data: usersResult.rows
      };
    } catch (error) {
      results.users = { success: false, error: error.message };
    }

    // Test celebrities
    try {
      const celebritiesResult = await client.query('SELECT * FROM celebrities');
      results.celebrities = {
        success: true,
        count: celebritiesResult.rows.length,
        data: celebritiesResult.rows
      };
    } catch (error) {
      results.celebrities = { success: false, error: error.message };
    }

    // Test appointments
    try {
      const appointmentsResult = await client.query('SELECT * FROM appointments');
      results.appointments = {
        success: true,
        count: appointmentsResult.rows.length,
        data: appointmentsResult.rows
      };
    } catch (error) {
      results.appointments = { success: false, error: error.message };
    }

    // Test messages
    try {
      const messagesResult = await client.query('SELECT * FROM messages');
      results.messages = {
        success: true,
        count: messagesResult.rows.length,
        data: messagesResult.rows
      };
    } catch (error) {
      results.messages = { success: false, error: error.message };
    }

    // Test notifications
    try {
      const notificationsResult = await client.query('SELECT * FROM notifications');
      results.notifications = {
        success: true,
        count: notificationsResult.rows.length,
        data: notificationsResult.rows
      };
    } catch (error) {
      results.notifications = { success: false, error: error.message };
    }

    res.json({
      success: true,
      message: 'Data fetching test completed',
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Data fetching test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test data fetching'
    });
  }
});

export default router;
