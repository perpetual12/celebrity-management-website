import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

// Database configuration for production (Render) and development
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (production), use it
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  // Otherwise use individual environment variables (development)
  return {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
};

const client = new Client(getDatabaseConfig());

// Connect to the database with error handling
try {
  await client.connect();
  console.log('✅ Connected to PostgreSQL database');
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Production (DATABASE_URL)' : 'Development (individual vars)'}`);
} catch (error) {
  console.error('❌ Failed to connect to PostgreSQL database:', error.message);
  console.error('Database config:', getDatabaseConfig());
  console.error('Please check your database configuration.');
}

export default client;
