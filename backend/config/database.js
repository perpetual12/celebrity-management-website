import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

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

const client = new Client(getDatabaseConfig());

// Connect to the database with error handling and retry logic
const connectWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempting database connection (attempt ${i + 1}/${retries})...`);
      await client.connect();
      console.log('✅ Connected to PostgreSQL database successfully!');
      console.log(`🔗 Connection type: ${process.env.DATABASE_URL ? 'DATABASE_URL' : 'Individual environment variables'}`);

      // Test the connection
      const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
      console.log(`📊 Connected to database: ${result.rows[0].db_name}`);
      console.log(`⏰ Server time: ${result.rows[0].current_time}`);

      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);

      if (i === retries - 1) {
        console.error('🚨 All database connection attempts failed!');
        console.error('Database config used:', JSON.stringify(getDatabaseConfig(), null, 2));
        console.error('Common issues:');
        console.error('1. Database server not accessible from internet');
        console.error('2. Incorrect host/port in DATABASE_URL');
        console.error('3. Firewall blocking connection');
        console.error('4. Database credentials incorrect');
        console.error('5. SSL configuration mismatch');

        // Don't throw error, let the app start but log the issue
        return false;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Attempt connection
const connected = await connectWithRetry();

export default client;
