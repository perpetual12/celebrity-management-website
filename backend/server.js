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
import client from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://localhost:3000'];

// Middleware
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'celebrity-connect-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for persistent sessions
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

// In production, we'll use the default MemoryStore but with proper configuration
// For a more robust solution, you could use connect-pg-simple or redis
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  Using MemoryStore for sessions in production');
  console.log('💡 For high-traffic apps, consider using connect-pg-simple or Redis');
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