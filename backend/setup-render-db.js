import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

// Use the Render database URL
const DATABASE_URL = 'postgresql://celebrity_connect_db_user:M8ZrcDDO4Al2CLaAPDt7zEyKYyVKhBuk@dpg-d105aaogjchc73acim80-a/celebrity_connect_db';

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const setupDatabase = async () => {
  try {
    console.log('🔗 Connecting to Render PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('🔧 Setting up database tables...');

    // Create tables
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
          celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
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

      -- Insert default admin user
      INSERT INTO users (username, email, password, role, full_name) 
      VALUES (
          'admin', 
          'admin@celebrityconnect.com', 
          '$2b$10$8K1p/a0dclxKoNqIfrHb4.FRCdmHlS02koEGjwQzjIhFJXMJW3aMi',
          'admin', 
          'System Administrator'
      ) ON CONFLICT (username) DO NOTHING;
    `;

    await client.query(createTablesSQL);
    console.log('✅ Database tables created successfully!');

    // Test the setup
    const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log(`📊 Total tables created: ${result.rows[0].table_count}`);

    const adminCheck = await client.query('SELECT username FROM users WHERE role = $1', ['admin']);
    console.log(`👤 Admin users: ${adminCheck.rows.length}`);

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

setupDatabase();
