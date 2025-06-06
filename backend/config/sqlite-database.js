// SQLite fallback database configuration
let sqlite3, open;
try {
  const sqliteModule = await import('sqlite3');
  const sqliteOpenModule = await import('sqlite');
  sqlite3 = sqliteModule.default;
  open = sqliteOpenModule.open;
} catch (error) {
  console.log('⚠️ SQLite modules not available, using in-memory fallback');
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let inMemoryData = {
  users: [
    {
      id: 'admin-id-123',
      username: 'admin',
      email: 'admin@celebrityconnect.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'admin',
      full_name: 'System Administrator',
      profile_image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'test-user-id-456',
      username: 'testuser',
      email: 'test@celebrityconnect.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'user',
      full_name: 'Test User',
      profile_image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'celeb-user-1',
      username: 'tomhanks',
      email: 'tomhanks@celebrityconnect.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'celebrity',
      full_name: 'Tom Hanks',
      profile_image: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Tom_Hanks_TIFF_2019.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'celeb-user-2',
      username: 'taylorswift',
      email: 'taylorswift@celebrityconnect.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'celebrity',
      full_name: 'Taylor Swift',
      profile_image: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'celeb-user-3',
      username: 'oprahwinfrey',
      email: 'oprahwinfrey@celebrityconnect.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'celebrity',
      full_name: 'Oprah Winfrey',
      profile_image: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Oprah_in_2014.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  celebrities: [
    {
      id: 'celeb-1',
      user_id: 'celeb-user-1',
      name: 'Tom Hanks',
      bio: 'Academy Award-winning actor known for Forrest Gump, Cast Away, and Toy Story.',
      category: 'Actor',
      profile_image: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Tom_Hanks_TIFF_2019.jpg',
      available_for_booking: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'celeb-2',
      user_id: 'celeb-user-2',
      name: 'Taylor Swift',
      bio: 'Grammy Award-winning singer-songwriter and global superstar.',
      category: 'Musician',
      profile_image: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png',
      available_for_booking: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'celeb-3',
      user_id: 'celeb-user-3',
      name: 'Oprah Winfrey',
      bio: 'Media mogul, philanthropist, and influential talk show host.',
      category: 'TV Host',
      profile_image: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Oprah_in_2014.jpg',
      available_for_booking: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  appointments: [],
  messages: [],
  notifications: [
    {
      id: 'notif-1',
      user_id: 'test-user-id-456',
      type: 'welcome',
      title: 'Welcome to Celebrity Connect! 🌟',
      message: 'Welcome to Celebrity Connect! We\'re thrilled to have you join our platform where you can connect with your favorite celebrities.',
      is_read: false,
      related_appointment_id: null,
      related_message_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Initialize SQLite database
export const initSQLiteDB = async () => {
  try {
    console.log('🔧 Initializing database...');

    if (!sqlite3 || !open) {
      console.log('📝 Using in-memory database (SQLite not available)');
      return true;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

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

// Database client that works with SQLite or in-memory fallback
export const sqliteClient = {
  query: async (text, params = []) => {
    try {
      // If SQLite is available, use it
      if (db) {
        return await querySQLite(text, params);
      } else {
        // Use in-memory fallback
        return await queryInMemory(text, params);
      }
    } catch (error) {
      console.error('❌ Database query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }
};

// SQLite query handler
async function querySQLite(text, params) {
  // Convert PostgreSQL-style queries to SQLite
  let sqliteQuery = text
    .replace(/\$(\d+)/g, '?') // Replace $1, $2, etc. with ?
    .replace(/RETURNING \*/g, '') // Remove RETURNING clause
    .replace(/uuid_generate_v4\(\)/g, 'lower(hex(randomblob(16)))') // Replace UUID function
    .replace(/CURRENT_TIMESTAMP/g, 'CURRENT_TIMESTAMP') // Keep as is
    .replace(/NOW\(\)/g, 'datetime("now")') // Replace NOW() with SQLite equivalent
    .replace(/version\(\)/g, '"SQLite Database v1.0"'); // Replace version() function

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
}

// In-memory query handler
async function queryInMemory(text, params) {
  console.log('📝 In-memory query:', text.substring(0, 100));
  console.log('📝 Query params:', params);

  // Handle database connection test queries
  if (text.includes('NOW()') || text.includes('version()') || text.includes('current_time')) {
    return {
      rows: [{
        current_time: new Date().toISOString(),
        postgres_version: 'In-Memory Database v1.0',
        db_name: 'celebrity_connect_memory'
      }]
    };
  }

  // Handle table existence checks
  if (text.includes('information_schema.tables')) {
    const tables = ['users', 'celebrities', 'appointments', 'messages', 'notifications'];
    return { rows: tables.map(name => ({ table_name: name })) };
  }

  // Enhanced in-memory query handling with better pattern matching
  const queryLower = text.toLowerCase();

  // Handle SELECT queries
  if (queryLower.includes('select')) {

    // Users table queries
    if (queryLower.includes('from users') || queryLower.includes('users where')) {
      if (queryLower.includes('where username')) {
        const username = params[0];
        const user = inMemoryData.users.find(u => u.username === username);
        console.log(`📝 User lookup for username '${username}':`, user ? 'Found' : 'Not found');
        return { rows: user ? [user] : [] };
      } else if (queryLower.includes('where role')) {
        const role = params[0];
        const users = inMemoryData.users.filter(u => u.role === role);
        console.log(`📝 Users with role '${role}':`, users.length);
        return { rows: users };
      } else if (queryLower.includes('where id')) {
        const userId = params[0];
        const user = inMemoryData.users.find(u => u.id === userId);
        return { rows: user ? [user] : [] };
      } else {
        console.log('📝 Returning all users:', inMemoryData.users.length);
        return { rows: inMemoryData.users };
      }
    }

    // Celebrities table queries
    else if (queryLower.includes('from celebrities') || queryLower.includes('celebrities where')) {
      if (queryLower.includes('where id')) {
        const celebId = params[0];
        const celebrity = inMemoryData.celebrities.find(c => c.id === celebId);
        console.log(`📝 Celebrity lookup for id '${celebId}':`, celebrity ? 'Found' : 'Not found');
        return { rows: celebrity ? [celebrity] : [] };
      } else if (queryLower.includes('limit')) {
        // Handle LIMIT queries
        const limitMatch = text.match(/limit\s+(\d+)/i);
        const limit = limitMatch ? parseInt(limitMatch[1]) : inMemoryData.celebrities.length;
        console.log(`📝 Returning ${limit} celebrities out of ${inMemoryData.celebrities.length}`);
        return { rows: inMemoryData.celebrities.slice(0, limit) };
      } else {
        console.log('📝 Returning all celebrities:', inMemoryData.celebrities.length);
        return { rows: inMemoryData.celebrities };
      }
    }

    // Appointments table queries
    else if (queryLower.includes('from appointments') || queryLower.includes('appointments where')) {
      if (queryLower.includes('where user_id')) {
        const userId = params[0];
        const appointments = inMemoryData.appointments.filter(a => a.user_id === userId);
        console.log(`📝 Appointments for user '${userId}':`, appointments.length);
        return { rows: appointments };
      } else {
        console.log('📝 Returning all appointments:', inMemoryData.appointments.length);
        return { rows: inMemoryData.appointments };
      }
    }

    // Messages table queries
    else if (queryLower.includes('from messages') || queryLower.includes('messages where')) {
      if (queryLower.includes('where sender_id') || queryLower.includes('where receiver_id')) {
        const userId = params[0];
        const messages = inMemoryData.messages.filter(m =>
          m.sender_id === userId || m.receiver_id === userId
        );
        console.log(`📝 Messages for user '${userId}':`, messages.length);
        return { rows: messages };
      } else {
        console.log('📝 Returning all messages:', inMemoryData.messages.length);
        return { rows: inMemoryData.messages };
      }
    }

    // Notifications table queries
    else if (queryLower.includes('from notifications') || queryLower.includes('notifications where')) {
      if (queryLower.includes('where user_id')) {
        const userId = params[0];
        const notifications = inMemoryData.notifications.filter(n => n.user_id === userId);
        console.log(`📝 Notifications for user '${userId}':`, notifications.length);
        return { rows: notifications };
      } else {
        console.log('📝 Returning all notifications:', inMemoryData.notifications.length);
        return { rows: inMemoryData.notifications };
      }
    }

    // COUNT queries
    else if (queryLower.includes('count(*)')) {
      const table = getTableFromQuery(text);
      const count = inMemoryData[table] ? inMemoryData[table].length : 0;
      console.log(`📝 Count for table '${table}':`, count);
      return { rows: [{ count: count.toString() }] };
    }
  }

  // Handle INSERT queries
  else if (queryLower.includes('insert')) {
    const table = getTableFromQuery(text);
    if (inMemoryData[table]) {
      const newId = 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const newItem = {
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add specific fields based on table
      if (table === 'users') {
        newItem.role = 'user';
        newItem.profile_image = null;
      } else if (table === 'appointments') {
        newItem.status = 'pending';
      } else if (table === 'messages') {
        newItem.is_read = false;
      } else if (table === 'notifications') {
        newItem.is_read = false;
        newItem.type = 'general';
      }

      inMemoryData[table].push(newItem);
      console.log(`📝 Inserted new ${table} record:`, newId);
      return { rows: [newItem] };
    }
    return { rows: [] };
  }

  // Default response for unhandled queries
  console.log('⚠️ Unhandled query, returning empty result:', text.substring(0, 100));
  return { rows: [] };
}

// Helper function to extract table name from query
function getTableFromQuery(query) {
  const match = query.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
  return match ? match[1] : '';
}

export default sqliteClient;
