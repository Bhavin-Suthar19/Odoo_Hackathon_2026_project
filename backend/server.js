/**
 * ============================================================================
 * HACKATHON BACKEND SERVER ENTRY POINT
 * ============================================================================
 * Team Note:
 * - Runs on Port 5000 by default.
 * - Configured with CORS allowing credentials (cookies) from Frontend (Port 5173).
 * - Connects to Cloud Supabase in config/supabase.js.
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// HTTP Request logging
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse HTTP-Only cookies sent by the frontend
app.use(cookieParser());

// CORS configuration: Allow requests & HTTP-only cookies from Frontend Port
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // IMPORTANT: Enables sending and receiving cookies across ports
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ============================================================================
// API ROUTES
// ============================================================================

// System health and Supabase connection check endpoint
app.use('/api/health', healthRoutes);

// Authentication & Demo user endpoints
app.use('/api/auth', authRoutes);

// Root informative endpoint
app.get('/', (req, res) => {
  res.send({
    service: 'Hackathon Backend API',
    version: '1.0.0',
    documentation: 'See README.md in the project root.',
    endpoints: ['/api/health', '/api/auth/register', '/api/auth/login', '/api/auth/me'],
  });
});

// 404 Route Not Found handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// ============================================================================
// SERVER LAUNCH
// ============================================================================

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 [Backend] Server listening on http://localhost:${PORT}`);
  console.log(`📡 [CORS] Allowed Frontend URL: ${FRONTEND_URL}`);
  console.log('====================================================');
});
