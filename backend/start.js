#!/usr/bin/env node

// Production start script for Render deployment
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Starting Celebrity Connect Backend...');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || '5001');
console.log('🔗 Database URL provided:', !!process.env.DATABASE_URL);

// Validate required environment variables (DATABASE_URL is optional with fallback)
const requiredEnvVars = ['SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// Check if we're using SQLite fallback
const usingSQLiteFallback = process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL;

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('🔧 Please set these environment variables in Render dashboard');
  process.exit(1);
}

// Log database mode
if (usingSQLiteFallback) {
  console.log('📝 Using in-memory database (DATABASE_URL not required)');
} else {
  console.log('🔗 Using PostgreSQL database');
}

console.log('✅ All required environment variables are set');
console.log('🔄 Starting server...');

// Import and start the main server
import('./server.js').catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
