// SQLite fallback database configuration
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

// Initialize SQLite database
export const initSQLiteDB = async () => {
  try {
    console.log('🔧 Initializing SQLite database...');
    
    db = await open({
      filename: path.join(__dirname, '../celebrity_connect.db'),
      driver: sqlite3.Database
    });

    // Create tables
    await db.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'celebrity', 'admin')),
        full_name TEXT,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Celebrities table
      CREATE TABLE IF NOT EXISTS celebrities (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        bio TEXT,
        category TEXT,
        profile_image TEXT,
        available_for_booking BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        celebrity_id TEXT REFERENCES celebrities(id) ON DELETE CASCADE,
        date DATETIME NOT NULL,
        purpose TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        related_appointment_id TEXT,
        related_message_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert admin user if not exists
    const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
    if (!adminExists) {
      await db.run(`
        INSERT INTO users (username, email, password, role, full_name) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'admin',
        'admin@celebrityconnect.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin',
        'System Administrator'
      ]);
      console.log('✅ Admin user created in SQLite');
    }

    // Insert test user if not exists
    const testExists = await db.get('SELECT id FROM users WHERE username = ?', ['testuser']);
    if (!testExists) {
      await db.run(`
        INSERT INTO users (username, email, password, role, full_name) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'testuser',
        'test@celebrityconnect.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'user',
        'Test User'
      ]);
      console.log('✅ Test user created in SQLite');
    }

    console.log('✅ SQLite database initialized successfully');
    return db;

  } catch (error) {
    console.error('❌ SQLite initialization failed:', error);
    throw error;
  }
};

// SQLite query wrapper to match PostgreSQL client interface
export const sqliteClient = {
  query: async (text, params = []) => {
    if (!db) {
      await initSQLiteDB();
    }
    
    try {
      // Convert PostgreSQL-style queries to SQLite
      let sqliteQuery = text
        .replace(/\$(\d+)/g, '?') // Replace $1, $2, etc. with ?
        .replace(/RETURNING \*/g, '') // Remove RETURNING clause
        .replace(/uuid_generate_v4\(\)/g, 'lower(hex(randomblob(16)))') // Replace UUID function
        .replace(/CURRENT_TIMESTAMP/g, 'CURRENT_TIMESTAMP'); // Keep as is

      if (text.includes('INSERT') && text.includes('RETURNING')) {
        // Handle INSERT with RETURNING
        const result = await db.run(sqliteQuery, params);
        const insertedRow = await db.get(`SELECT * FROM ${getTableFromQuery(text)} WHERE rowid = ?`, [result.lastID]);
        return { rows: [insertedRow] };
      } else if (text.includes('UPDATE') && text.includes('RETURNING')) {
        // Handle UPDATE with RETURNING
        await db.run(sqliteQuery, params);
        const updatedRow = await db.get(`SELECT * FROM ${getTableFromQuery(text)} WHERE id = ?`, [params[params.length - 1]]);
        return { rows: [updatedRow] };
      } else if (text.includes('SELECT')) {
        // Handle SELECT
        const rows = await db.all(sqliteQuery, params);
        return { rows };
      } else {
        // Handle other queries
        const result = await db.run(sqliteQuery, params);
        return { rows: [], rowCount: result.changes };
      }
    } catch (error) {
      console.error('❌ SQLite query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }
};

// Helper function to extract table name from query
function getTableFromQuery(query) {
  const match = query.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
  return match ? match[1] : '';
}

export default sqliteClient;
