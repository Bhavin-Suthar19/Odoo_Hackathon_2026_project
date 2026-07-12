const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  impersonateUser,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/impersonate', impersonateUser);

// Protected endpoints
router.get('/me', requireAuth, getMe);

module.exports = router;
