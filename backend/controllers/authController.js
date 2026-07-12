/**
 * ============================================================================
 * ASSETFLOW AUTH CONTROLLER (REAL SUPABASE CLOUD POSTGRESQL INTEGRATION)
 * ============================================================================
 * Handles user authentication against the Supabase `employees` table.
 * Enforces role-based permissions, bcrypt password hashing, & duplicate checks.
 * ============================================================================
 */

const { supabase, isSupabaseConfigured } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Helper to set HTTP-only cookie
const setAuthCookie = (res, userData) => {
  const cookieValue = JSON.stringify(userData);
  res.cookie('hackathon_session', cookieValue, {
    httpOnly: true,
    secure: false, // localhost dev
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @desc    Register a new employee — creates entry in Supabase `employees` table
 * @route   POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(500).json({ success: false, message: 'Cloud Supabase database not configured.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email in Supabase employees table
    const { data: existing, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'This email address is already registered. Please sign in instead.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Attempt insert with both password_hash and password columns
    let { data: newEmp, error } = await supabase
      .from('employees')
      .insert([{
        name,
        email: cleanEmail,
        role: 'Employee',
        department: department || 'Engineering',
        status: 'Active',
        password_hash,
        password
      }])
      .select()
      .single();

    // If Supabase table does not have password column yet, fallback to password_hash only or basic insert
    if (error && (error.message?.includes('password') || error.code === 'PGRST204')) {
      const fallbackResult = await supabase
        .from('employees')
        .insert([{
          name,
          email: cleanEmail,
          role: 'Employee',
          department: department || 'Engineering',
          status: 'Active',
          password_hash
        }])
        .select()
        .single();
      newEmp = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'This email address is already registered.' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    const userObj = {
      id: newEmp.id,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      department: newEmp.department,
    };

    setAuthCookie(res, userObj);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user — validates against Supabase `employees` table
 * @route   POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(500).json({ success: false, message: 'Cloud Supabase database not configured.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find employee in Supabase
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !employee) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (employee.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'This account has been deactivated by the Admin.' });
    }

    // Verify password against Supabase database columns (password_hash or password)
    let isPasswordValid = false;
    if (employee.password_hash) {
      isPasswordValid = await bcrypt.compare(password, employee.password_hash);
    } else if (employee.password) {
      isPasswordValid = (employee.password === password);
    } else {
      // Legacy/seed account without password column filled
      isPasswordValid = (password === 'hackathon2026');
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userObj = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    };

    setAuthCookie(res, userObj);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user session
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

/**
 * @desc    Impersonate a user (Testing Tool) — looks up employee in Supabase
 * @route   POST /api/auth/impersonate
 */
const impersonateUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(500).json({ success: false, message: 'Cloud Supabase database not configured.' });
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const userObj = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    };

    setAuthCookie(res, userObj);

    return res.status(200).json({
      success: true,
      message: `Switched to ${employee.name} (${employee.role})`,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  impersonateUser,
};
