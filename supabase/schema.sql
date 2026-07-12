-- ============================================================================
-- ASSETFLOW: ENTERPRISE ASSET & RESOURCE MANAGEMENT SYSTEM
-- COMPLETE SUPABASE SQL SCHEMA & SEED MIGRATION
-- ============================================================================
-- Instructions for User:
-- 1. Open your Supabase Dashboard -> SQL Editor
-- 2. Paste this entire script and click "Run"
-- 3. All tables, relationships, indexes, and initial demo data will be created!
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DEPARTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'dept-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(100) NOT NULL UNIQUE,
    head VARCHAR(100),
    head_email VARCHAR(150),
    parent VARCHAR(64) REFERENCES public.departments(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. ASSET CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'cat-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(100) NOT NULL UNIQUE,
    fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. EMPLOYEE DIRECTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'emp-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'Employee' CHECK (role IN ('Admin', 'Asset Manager', 'Department Head', 'Employee')),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assets (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'ast-' || substr(md5(random()::text), 1, 8),
    tag VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    serial VARCHAR(100),
    acquisition_date DATE DEFAULT CURRENT_DATE,
    acquisition_cost NUMERIC(12, 2) DEFAULT 0.00,
    condition VARCHAR(50) DEFAULT 'Excellent' CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
    location VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed')),
    shared BOOLEAN DEFAULT FALSE,
    specs JSONB DEFAULT '{}'::jsonb,
    current_holder VARCHAR(100),
    current_holder_email VARCHAR(150),
    expected_return_date DATE,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. ASSET HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.asset_history (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'hist-' || substr(md5(random()::text), 1, 8),
    asset_id VARCHAR(64) NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Allocation', 'Return', 'Transfer', 'Maintenance', 'Audit', 'Status Change')),
    details TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. ASSET TRANSFERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.asset_transfers (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'trsf-' || substr(md5(random()::text), 1, 8),
    asset_id VARCHAR(64) NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    asset_tag VARCHAR(30) NOT NULL,
    asset_name VARCHAR(150) NOT NULL,
    from_user VARCHAR(100) NOT NULL,
    from_email VARCHAR(150) NOT NULL,
    to_user VARCHAR(100) NOT NULL,
    to_email VARCHAR(150) NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'Approved', 'Rejected')),
    request_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. RESOURCE BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resource_bookings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'bkg-' || substr(md5(random()::text), 1, 8),
    resource_id VARCHAR(64) NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    resource_name VARCHAR(150) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
    purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. MAINTENANCE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'maint-' || substr(md5(random()::text), 1, 8),
    asset_id VARCHAR(64) NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    asset_tag VARCHAR(30) NOT NULL,
    asset_name VARCHAR(150) NOT NULL,
    issue TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved')),
    raised_by VARCHAR(100) NOT NULL,
    raised_by_email VARCHAR(150) NOT NULL,
    request_date DATE DEFAULT CURRENT_DATE,
    technician VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. AUDIT CYCLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_cycles (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'aud-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(150) NOT NULL,
    scope_dept VARCHAR(100),
    scope_location VARCHAR(150),
    assigned_auditor VARCHAR(100) NOT NULL,
    assigned_auditor_email VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')),
    checklist JSONB DEFAULT '{}'::jsonb,
    discrepancy_report JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'notif-' || substr(md5(random()::text), 1, 8),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'Alert',
    date VARCHAR(50) DEFAULT 'Today',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. ACTIVITY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'log-' || substr(md5(random()::text), 1, 8),
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_name VARCHAR(100) DEFAULT 'System',
    email VARCHAR(150) DEFAULT 'system@company.com',
    date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR FAST LOOKUPS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assets_tag ON public.assets(tag);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_holder ON public.assets(current_holder_email);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_bookings_resource_date ON public.resource_bookings(resource_id, date);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON public.maintenance_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_history_asset ON public.asset_history(asset_id);

-- ============================================================================
-- SEED DEMO DATA
-- ============================================================================

-- Seed Departments
INSERT INTO public.departments (id, name, head, head_email, parent, status)
VALUES
    ('dept-1', 'Engineering', 'Priya Shah', 'priya@company.com', NULL, 'Active'),
    ('dept-2', 'Operations', 'Raj Patel', 'raj@company.com', NULL, 'Active'),
    ('dept-3', 'HR', 'Sarah Jenkins', 'sarah@company.com', NULL, 'Active'),
    ('dept-4', 'Sales', 'Dave Chen', 'dave@company.com', 'dept-2', 'Active'),
    ('dept-5', 'Finance', 'Sophia Lopez', 'sophia@company.com', NULL, 'Active')
ON CONFLICT (name) DO NOTHING;

-- Seed Asset Categories
INSERT INTO public.asset_categories (id, name, fields)
VALUES
    ('cat-1', 'Electronics', '[{"name": "Warranty Period (months)", "type": "number", "required": true}, {"name": "Operating System", "type": "text", "required": false}]'::jsonb),
    ('cat-2', 'Furniture', '[{"name": "Material Type", "type": "text", "required": true}, {"name": "Weight Capacity (kg)", "type": "number", "required": false}]'::jsonb),
    ('cat-3', 'Vehicles', '[{"name": "Plate Number", "type": "text", "required": true}, {"name": "Fuel Type", "type": "text", "required": true}]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Seed Employee Directory
INSERT INTO public.employees (id, name, email, role, department, status)
VALUES
    ('emp-1', 'Admin User', 'admin@company.com', 'Admin', 'Operations', 'Active'),
    ('emp-2', 'Alex Mercer', 'manager@company.com', 'Asset Manager', 'Operations', 'Active'),
    ('emp-3', 'Priya Shah', 'priya@company.com', 'Department Head', 'Engineering', 'Active'),
    ('emp-4', 'Sarah Jenkins', 'sarah@company.com', 'Department Head', 'HR', 'Active'),
    ('emp-5', 'Raj Patel', 'raj@company.com', 'Employee', 'Engineering', 'Active'),
    ('emp-6', 'Dave Chen', 'dave@company.com', 'Employee', 'Sales', 'Active'),
    ('emp-7', 'Sophia Lopez', 'sophia@company.com', 'Department Head', 'Finance', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Seed Assets
INSERT INTO public.assets (id, tag, name, category, serial, acquisition_date, acquisition_cost, condition, location, status, shared, specs, current_holder, current_holder_email, expected_return_date)
VALUES
    ('ast-1', 'AF-0001', 'Dell Latitude 7420', 'Electronics', 'DELL-7420-XYZ', '2025-01-15', 1200.00, 'Excellent', 'HQ Office 101', 'Allocated', false, '{"Warranty Period (months)": 36, "Operating System": "Windows 11"}'::jsonb, 'Priya Shah', 'priya@company.com', '2026-01-20'),
    ('ast-2', 'AF-0002', 'Macbook Pro M2', 'Electronics', 'APPLE-MBP-M2', '2025-02-10', 2400.00, 'Excellent', 'HQ Office 102', 'Available', false, '{"Warranty Period (months)": 24, "Operating System": "macOS"}'::jsonb, NULL, NULL, NULL),
    ('ast-3', 'AF-0003', 'Ergonomic Mesh Chair', 'Furniture', 'HM-AERON-01', '2024-06-01', 950.00, 'Good', 'HQ Office 101', 'Allocated', false, '{"Material Type": "Mesh", "Weight Capacity (kg)": 120}'::jsonb, 'Raj Patel', 'raj@company.com', '2026-06-05'),
    ('ast-4', 'AF-0004', 'Conference Room Projector', 'Electronics', 'EPSON-PROJ-X', '2024-09-20', 600.00, 'Good', 'Conf Room B2', 'Available', true, '{"Warranty Period (months)": 12}'::jsonb, NULL, NULL, NULL),
    ('ast-5', 'AF-0005', 'Ford Transit Shuttle', 'Vehicles', 'FORD-TRANS-09', '2023-11-05', 35000.00, 'Fair', 'Garage A', 'Under Maintenance', true, '{"Plate Number": "TX-456-ABC", "Fuel Type": "Diesel"}'::jsonb, NULL, NULL, NULL),
    ('ast-6', 'AF-0006', 'iPad Air', 'Electronics', 'APPLE-IPAD-XYZ', '2025-03-01', 700.00, 'Excellent', 'HQ Office 101', 'Reserved', false, '{"Warranty Period (months)": 12, "Operating System": "iOS"}'::jsonb, 'Sarah Jenkins', 'sarah@company.com', '2026-08-15'),
    ('ast-7', 'AF-0007', 'Conference Room Table', 'Furniture', 'FURN-TAB-99', '2024-01-10', 1500.00, 'Good', 'Conf Room B2', 'Available', true, '{"Material Type": "Oak Wood"}'::jsonb, NULL, NULL, NULL),
    ('ast-8', 'AF-0008', 'Tesla Model 3', 'Vehicles', 'TESLA-M3-XYZ', '2024-05-15', 42000.00, 'Excellent', 'Garage A', 'Available', true, '{"Plate Number": "CA-789-ELE", "Fuel Type": "Electric"}'::jsonb, NULL, NULL, NULL)
ON CONFLICT (tag) DO NOTHING;

-- Seed Resource Bookings
INSERT INTO public.resource_bookings (id, resource_id, resource_name, user_name, user_email, date, start_time, end_time, status, purpose)
VALUES
    ('bkg-1', 'ast-4', 'Conference Room Projector (AF-0004)', 'Priya Shah', 'priya@company.com', '2026-07-12', '09:00', '10:00', 'Ongoing', 'Sprint Planning Meeting'),
    ('bkg-2', 'ast-8', 'Tesla Model 3 (AF-0008)', 'Sarah Jenkins', 'sarah@company.com', '2026-07-13', '14:00', '17:00', 'Upcoming', 'Client site HR visit')
ON CONFLICT (id) DO NOTHING;

-- Seed Maintenance Requests
INSERT INTO public.maintenance_requests (id, asset_id, asset_tag, asset_name, issue, priority, status, raised_by, raised_by_email, request_date, technician, notes)
VALUES
    ('maint-1', 'ast-5', 'AF-0005', 'Ford Transit Shuttle', 'Engine making strange knocking sound on start, check oil levels.', 'High', 'In Progress', 'Raj Patel', 'raj@company.com', '2026-07-10', 'Dave (Fleet Auto)', 'Oil filter replaced. Checking spark plugs next.'),
    ('maint-2', 'ast-4', 'AF-0004', 'Conference Room Projector', 'Bulb flickering, needs replacement.', 'Medium', 'Pending', 'Priya Shah', 'priya@company.com', '2026-07-12', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Audit Cycles
INSERT INTO public.audit_cycles (id, name, scope_dept, scope_location, assigned_auditor, assigned_auditor_email, start_date, end_date, status, checklist, discrepancy_report)
VALUES
    ('aud-1', 'Q3 IT Equipment Audit', 'Engineering', 'HQ Office 101', 'Sarah Jenkins', 'sarah@company.com', '2026-07-01', '2026-07-31', 'Active', '{"ast-1": "Verified", "ast-3": "Verified", "ast-6": "Damaged"}'::jsonb, '{"flaggedCount": 1, "items": [{"assetId": "ast-6", "tag": "AF-0006", "name": "iPad Air", "issue": "Marked Damaged by Auditor Sarah Jenkins"}]}'::jsonb)
ON CONFLICT (id) DO NOTHING;
