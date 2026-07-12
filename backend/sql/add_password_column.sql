-- ============================================================================
-- SQL MIGRATION: Add Password Columns to Supabase Employees Table
-- ============================================================================
-- Run this script in your Supabase SQL Editor to add the password columns.

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Optional: Set default seed account passwords if needed
UPDATE public.employees 
SET password = 'hackathon2026' 
WHERE password IS NULL AND password_hash IS NULL;
