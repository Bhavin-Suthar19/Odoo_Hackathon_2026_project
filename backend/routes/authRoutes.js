/**
 * ============================================================================
 * AUTHENTICATION API ROUTES (/api/auth)
 * ============================================================================
 * Backend developers can add more user-related endpoints here.
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected endpoints (Requires valid HTTP-only session cookie)
router.get('/me', requireAuth, getMe);

module.exports = router;
