/**
 * ============================================================================
 * HEALTH CHECK ROUTE (/api/health)
 * ============================================================================
 * Frontend developers use this route to verify backend connectivity and whether
 * Cloud Supabase keys have been configured.
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { isSupabaseConfigured } = require('../config/supabase');

router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    database: {
      provider: 'Cloud Supabase (PostgreSQL + Auth)',
      configured: isSupabaseConfigured(),
      hint: isSupabaseConfigured()
        ? 'Connected to live Cloud Supabase!'
        : 'Update SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env to link your Supabase project.',
    },
    message: '🚀 Hackathon Backend API is live and ready!',
  });
});

module.exports = router;
