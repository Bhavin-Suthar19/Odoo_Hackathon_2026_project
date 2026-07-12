-- ============================================================================
-- MIGRATION: ADD PASSWORD_HASH TO EMPLOYEES TABLE
-- ============================================================================
-- Run this query in your Supabase SQL Editor:
-- ============================================================================

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password_hash TEXT;
