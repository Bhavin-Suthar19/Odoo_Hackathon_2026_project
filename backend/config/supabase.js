/**
 * ============================================================================
 * CLOUD SUPABASE CONNECTION CLIENT
 * ============================================================================
 * This file configures and exports the Supabase client for backend developers.
 *
 * HOW TO USE IN BACKEND CONTROLLERS:
 *   const { supabase, isSupabaseConfigured } = require('../config/supabase');
 *
 *   // Example: Querying PostgreSQL table 'users'
 *   const { data, error } = await supabase.from('users').select('*');
 *
 *   // Example: Supabase Auth
 *   const { data, error } = await supabase.auth.signUp({ email, password });
 * ============================================================================
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check whether real Cloud Supabase credentials have been configured
const isPlaceholder =
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes('demo-placeholder') ||
  supabaseUrl.includes('your-supabase-project');

let supabase = null;

if (!isPlaceholder) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Backend server doesn't persist sessions locally
      },
    });
    console.log('✅ [Supabase] Cloud Supabase client initialized successfully.');
  } catch (err) {
    console.error('❌ [Supabase] Error initializing Supabase client:', err.message);
  }
} else {
  console.log(
    '⚠️  [Supabase Note] Running in Demo/Placeholder Mode. Add your SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env to connect to live Cloud Supabase.'
  );
}

module.exports = {
  supabase,
  isSupabaseConfigured: () => !isPlaceholder && supabase !== null,
};
