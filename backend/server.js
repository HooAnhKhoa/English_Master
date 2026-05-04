require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { sequelize, testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize express app
const app = express();

// Test database connection
testConnection();

// Initialize ranking cron jobs
const rankingService = require('./services/rankingService');
rankingService.initializeCronJobs();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://100.90.68.89:3000',
      'http://100.90.68.89:5000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static('public/uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, require('./routes/auth.routes'));
app.use(`/api/${API_VERSION}/users`, require('./routes/user.routes'));
app.use(`/api/${API_VERSION}/topics`, require('./routes/topic.routes'));
app.use(`/api/${API_VERSION}/vocabularies`, require('./routes/vocabulary.routes'));
app.use(`/api/${API_VERSION}/lessons`, require('./routes/lesson.routes'));
app.use(`/api/${API_VERSION}/exercises`, require('./routes/exercise.routes'));
app.use(`/api/${API_VERSION}/progress`, require('./routes/progress.routes'));
app.use(`/api/${API_VERSION}/ai`, require('./routes/aiRoutes'));
app.use(`/api/${API_VERSION}/videos`, require('./routes/video.routes'));
app.use(`/api/${API_VERSION}/rankings`, require('./routes/ranking.routes'));
app.use(`/api/${API_VERSION}/badges`, require('./routes/badge.routes'));
app.use(`/api/${API_VERSION}/xp`, require('./routes/xp.routes'));
app.use(`/api/${API_VERSION}/dictionary`, require('./routes/dictionary.routes'));
app.use(`/api/${API_VERSION}/notifications`, require('./routes/notification.routes'));
app.use(`/api/${API_VERSION}/vocab`, require('./routes/vocab.routes'));
app.use(`/api/${API_VERSION}/review`, require('./routes/review.routes'));
app.use(`/api/${API_VERSION}/admin`, require('./routes/admin.routes'));

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/${API_VERSION}`);
});

// Socket.IO setup
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('✅ New socket connection:', socket.id);

  // Join user room
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = { app, io };
