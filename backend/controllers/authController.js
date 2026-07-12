/**
 * ============================================================================
 * AUTH CONTROLLER (Signup, Login, Session Management, Cookies & Supabase)
 * ============================================================================
 * Handles user registration, login, session checking, and logout.
 *
 * BUSINESS RULES & FLOW:
 * 1. Validate incoming request body (email, password, name).
 * 2. If Cloud Supabase is configured:
 *    - Calls `supabase.auth.signUp` or `supabase.auth.signInWithPassword`.
 * 3. If Cloud Supabase credentials are still placeholders in `.env`:
 *    - Demonstrates immediate session cookie creation so Frontend devs can test right away.
 * 4. Sets a secure HTTP-Only cookie named `hackathon_session`.
 * ============================================================================
 */

const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Helper to set HTTP-only cookie
const setAuthCookie = (res, userData) => {
  const cookieValue = JSON.stringify(userData);
  res.cookie('hackathon_session', cookieValue, {
    httpOnly: true, // Prevents Javascript access (protects against XSS)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    let userObj = {
      id: 'demo-user-' + Date.now(),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      role: 'Hackathon Developer',
      provider: 'Local Demo Session (Configure Supabase in backend/.env)',
    };

    // If Cloud Supabase is active, register user with Supabase Auth
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || '',
          },
        },
      });

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      userObj = {
        id: data.user ? data.user.id : userObj.id,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        role: 'Authenticated Supabase User',
        provider: 'Cloud Supabase',
      };
    }

    // Set HTTP-Only Cookie
    setAuthCookie(res, userObj);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Session cookie set.',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email and password.',
      });
    }

    let userObj = {
      id: 'demo-user-888',
      name: email.split('@')[0],
      email: email.toLowerCase(),
      role: 'Hackathon Team Member',
      provider: 'Local Demo Session (Configure Supabase in backend/.env)',
    };

    // If Cloud Supabase is configured, authenticate via Supabase
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ success: false, message: error.message });
      }

      userObj = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
        email: data.user.email,
        role: 'Authenticated Supabase User',
        provider: 'Cloud Supabase',
      };
    }

    // Set HTTP-Only Cookie
    setAuthCookie(res, userObj);

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user from session cookie
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 */
const logoutUser = (req, res) => {
  res.clearCookie('hackathon_session', {
    httpOnly: true,
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};
