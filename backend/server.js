import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import './config/passport.js';
import usersRoutes from './routes/users.js';
import celebritiesRoutes from './routes/celebrities.js';
import appointmentsRoutes from './routes/appointments.js';
import messagesRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import notificationsRoutes from './routes/notifications.js';
import tmdbRoutes from './routes/tmdb.js';
import setupRoutes from './routes/setup.js';
import client from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://localhost:3000'];

console.log('🌐 CORS allowed origins:', allowedOrigins);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // For development, allow any localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // For Render deployments, allow .onrender.com domains
    if (origin.includes('.onrender.com')) {
      return callback(null, true);
    }

    console.log('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Session configuration - Simple and reliable
const isProduction = process.env.NODE_ENV === 'production';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'celebrity-connect-secret',
  resave: false,
  saveUninitialized: false,
  name: 'celebrity-connect-session',
  cookie: {
    secure: false, // Keep false for now - works better with Render
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours (shorter for testing)
    sameSite: 'lax'
  }
};

console.log('🔐 Session configuration:');
console.log('   - Environment:', process.env.NODE_ENV || 'development');
console.log('   - Secure cookies:', sessionConfig.cookie.secure);
console.log('   - SameSite:', sessionConfig.cookie.sameSite);
console.log('   - Session secret length:', sessionConfig.secret.length);
console.log('   - Max age (hours):', sessionConfig.cookie.maxAge / (60 * 60 * 1000));

// Suppress the MemoryStore warning for now
if (isProduction) {
  console.log('📝 Note: Using MemoryStore (fine for small-scale deployment)');
  console.log('💡 The MemoryStore warning can be ignored for testing/small apps');
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Celebrity Connect Backend is running!',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/celebrities', celebritiesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/setup', setupRoutes);

// Test database connection and start server
console.log('🔍 Testing database connection...');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Database URL provided:', !!process.env.DATABASE_URL);

client.query('SELECT NOW() as current_time, version() as postgres_version')
  .then((result) => {
    console.log('✅ Database connected successfully');
    console.log('⏰ Database time:', result.rows[0].current_time);
    console.log('🗄️ PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log('🔧 Ready to accept requests');
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('🔍 Error details:', err);
    console.error('🔧 Database config check:');
    console.error('   - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.error('   - NODE_ENV:', process.env.NODE_ENV);

    // Still start the server even if database fails (for debugging)
    console.log('⚠️  Starting server without database connection for debugging...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (DATABASE DISCONNECTED)`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  });