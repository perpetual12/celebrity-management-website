import pkg from 'pg';
import dotenv from 'dotenv';
import { sqliteClient, initSQLiteDB } from './sqlite-database.js';

const { Client } = pkg;
dotenv.config();

// Use SQLite as fallback when PostgreSQL fails
const USE_SQLITE = process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL;
console.log('🔧 Database mode:', USE_SQLITE ? 'SQLite' : 'PostgreSQL');

// Database configuration for production (Render) and development
const getDatabaseConfig = () => {
  console.log('🔧 Configuring database connection...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // If DATABASE_URL is provided, use it
  if (process.env.DATABASE_URL) {
    console.log('📡 Using DATABASE_URL connection');
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');

    // Check if it's a Supabase connection
    const isSupabase = process.env.DATABASE_URL.includes('supabase.co');
    console.log('🔍 Supabase connection detected:', isSupabase);

    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Supabase and most cloud databases
      },
      connectionTimeoutMillis: 15000, // 15 seconds for cloud databases
      idleTimeoutMillis: 30000, // 30 seconds
      max: 10, // Maximum number of clients in the pool
      min: 1, // Minimum number of clients in the pool
    };
  }

  // Otherwise use individual environment variables (development)
  console.log('🔧 Using individual environment variables');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);

  return {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  };
};

// Create client based on database mode
let client;

if (USE_SQLITE) {
  console.log('🔧 Using SQLite database');
  client = sqliteClient;

  // Initialize SQLite database
  try {
    await initSQLiteDB();
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ SQLite initialization failed:', error);
  }
} else {
  console.log('🔧 Using PostgreSQL database');
  client = new Client(getDatabaseConfig());

  // Connect to PostgreSQL with retry logic
  const connectWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Attempting PostgreSQL connection (attempt ${i + 1}/${retries})...`);
        await client.connect();
        console.log('✅ Connected to PostgreSQL database successfully!');

        // Test the connection
        const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
        console.log(`📊 Connected to database: ${result.rows[0].db_name}`);
        console.log(`⏰ Server time: ${result.rows[0].current_time}`);

        return true;
      } catch (error) {
        console.error(`❌ PostgreSQL connection attempt ${i + 1} failed:`, error.message);

        if (i === retries - 1) {
          console.error('🚨 All PostgreSQL connection attempts failed!');
          console.error('🔄 Falling back to SQLite...');

          // Fallback to SQLite
          client = sqliteClient;
          await initSQLiteDB();
          console.log('✅ Fallback to SQLite successful');
          return true;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  // Attempt PostgreSQL connection
  await connectWithRetry();
}

export default client;
