import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

const client = new Client({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the database with error handling
try {
  await client.connect();
  console.log('Connected to PostgreSQL database');
} catch (error) {
  console.error('Failed to connect to PostgreSQL database:', error.message);
  console.error('Please ensure PostgreSQL is running and the database exists.');
  console.error('Check your .env file for correct database credentials.');
}

export default client;
