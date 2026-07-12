/**
 * ============================================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ============================================================================
 * Catches unhandled errors across backend routes/controllers and formats a clean
 * JSON response for the frontend.
 * ============================================================================
 */

const errorHandler = (err, req, res, next) => {
  console.error('🔥 [Backend Error]:', err.stack || err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
