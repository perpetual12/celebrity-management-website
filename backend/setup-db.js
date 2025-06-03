import client from './config/database.js';
import bcrypt from 'bcrypt';

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // Drop existing tables if they exist
    await client.query('DROP TABLE IF EXISTS messages CASCADE');
    await client.query('DROP TABLE IF EXISTS appointments CASCADE');
    await client.query('DROP TABLE IF EXISTS celebrities CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('Existing tables dropped');

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'celebrity', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create celebrities table
    await client.query(`
      CREATE TABLE celebrities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        category VARCHAR(255),
        profile_image VARCHAR(500),
        available_for_booking BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Celebrities table created');

    // Create appointments table
    await client.query(`
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
        date TIMESTAMP NOT NULL,
        purpose TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Appointments table created');

    // Create messages table
    await client.query(`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
        celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Messages table created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
      ['admin', 'admin@example.com', adminPassword, 'admin']
    );
    console.log('Admin user created');

    // Create regular users
    const userPassword = await bcrypt.hash('user123', 10);
    const user1Result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['john', 'john@example.com', userPassword, 'user']
    );

    const user2Result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['jane', 'jane@example.com', userPassword, 'user']
    );
    console.log('Regular users created');

    // Create celebrity users
    const celebPassword = await bcrypt.hash('celeb123', 10);
    const celeb1Result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['tomcruise', 'tom@example.com', celebPassword, 'celebrity']
    );

    const celeb2Result = await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['taylorswift', 'taylor@example.com', celebPassword, 'celebrity']
    );
    console.log('Celebrity users created');

    // Create celebrity profiles
    const celebrity1Result = await client.query(
      'INSERT INTO celebrities (user_id, name, bio, category, profile_image, available_for_booking) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        celeb1Result.rows[0].id,
        'Tom Cruise',
        'American actor and producer. One of the world\'s highest-paid actors.',
        'Actor',
        'https://example.com/tom-cruise.jpg',
        true
      ]
    );

    const celebrity2Result = await client.query(
      'INSERT INTO celebrities (user_id, name, bio, category, profile_image, available_for_booking) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        celeb2Result.rows[0].id,
        'Taylor Swift',
        'American singer-songwriter. Her discography spans multiple genres.',
        'Musician',
        'https://example.com/taylor-swift.jpg',
        true
      ]
    );
    console.log('Celebrity profiles created');

    // Create sample appointments
    await client.query(
      'INSERT INTO appointments (user_id, celebrity_id, date, purpose, status) VALUES ($1, $2, $3, $4, $5)',
      [
        user1Result.rows[0].id,
        celebrity1Result.rows[0].id,
        '2024-02-15 14:00:00',
        'Meet and greet session',
        'approved'
      ]
    );

    await client.query(
      'INSERT INTO appointments (user_id, celebrity_id, date, purpose, status) VALUES ($1, $2, $3, $4, $5)',
      [
        user2Result.rows[0].id,
        celebrity2Result.rows[0].id,
        '2024-02-20 16:00:00',
        'Photo session',
        'pending'
      ]
    );
    console.log('Sample appointments created');

    // Create sample messages
    await client.query(
      'INSERT INTO messages (sender_id, receiver_id, celebrity_id, content, is_read) VALUES ($1, $2, $3, $4, $5)',
      [
        user1Result.rows[0].id,
        celeb1Result.rows[0].id,
        celebrity1Result.rows[0].id,
        'Hi Tom! I\'m a huge fan of your movies. Would love to meet you!',
        false
      ]
    );

    await client.query(
      'INSERT INTO messages (sender_id, receiver_id, celebrity_id, content, is_read) VALUES ($1, $2, $3, $4, $5)',
      [
        user2Result.rows[0].id,
        celeb2Result.rows[0].id,
        celebrity2Result.rows[0].id,
        'Hello Taylor! Your music has been such an inspiration to me.',
        true
      ]
    );
    console.log('Sample messages created');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
};

setupDatabase();
