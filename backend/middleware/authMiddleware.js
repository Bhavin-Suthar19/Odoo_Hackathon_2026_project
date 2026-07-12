/**
 * ============================================================================
 * AUTHENTICATION & SESSION MIDDLEWARE
 * ============================================================================
 * Protects backend routes by checking for a valid session token in:
 *   1. HTTP-Only Cookie (`hackathon_session`)
 *   2. Authorization Header (`Bearer <token>`)
 *
 * HOW TO USE ON PROTECTED ROUTES:
 *   const { requireAuth } = require('../middleware/authMiddleware');
 *   router.get('/protected-data', requireAuth, (req, res) => {
 *     res.json({ user: req.user });
 *   });
 * ============================================================================
 */

const requireAuth = (req, res, next) => {
  try {
    // Check cookie first (sent automatically when withCredentials: true)
    const cookieSession = req.cookies && req.cookies.hackathon_session;
    const authHeader = req.headers.authorization;

    let tokenPayload = null;

    if (cookieSession) {
      try {
        tokenPayload = JSON.parse(cookieSession);
      } catch (e) {
        tokenPayload = null;
      }
    }

    // Fallback: check Bearer token if passed in headers
    if (!tokenPayload && authHeader && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.split(' ')[1];
      try {
        tokenPayload = JSON.parse(Buffer.from(rawToken, 'base64').toString('utf8'));
      } catch (e) {
        tokenPayload = null;
      }
    }

    if (!tokenPayload) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No active session cookie or token found. Please login.',
      });
    }

    // Attach user info to req.user so backend controllers can use it
    req.user = tokenPayload;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error during session verification.',
    });
  }
};

module.exports = {
  requireAuth,
};
