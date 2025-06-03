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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'celebrity-connect-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for persistent sessions
  }
}));
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
    port: PORT
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
client.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log('🔧 Ready to accept requests');
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err);
    console.error('Please check your database configuration in .env file');
  });