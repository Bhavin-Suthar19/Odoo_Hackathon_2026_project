-- ============================================================================
-- ASSETFLOW: ENTERPRISE ASSET & RESOURCE MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL SCHEMA & SEED MIGRATION
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'dept-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(100) NOT NULL UNIQUE,
    head VARCHAR(100),
    head_email VARCHAR(150),
    parent VARCHAR(64) REFERENCES public.departments(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Asset Categories
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'cat-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(100) NOT NULL UNIQUE,
    fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Employee Directory
CREATE TABLE IF NOT EXISTS public.employees (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'emp-' || substr(md5(random()::text), 1, 8),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'Employee' CHECK (role IN ('Admin', 'Asset Manager', 'Department Head', 'Employee')),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Assets
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

-- 5. Asset History
CREATE TABLE IF NOT EXISTS public.asset_history (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'hist-' || substr(md5(random()::text), 1, 8),
    asset_id VARCHAR(64) NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Asset Transfers
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

-- 7. Resource Bookings
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

-- 8. Maintenance Requests
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

-- 9. Audit Cycles
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

-- 10. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'notif-' || substr(md5(random()::text), 1, 8),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'Alert',
    date VARCHAR(50) DEFAULT 'Today',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'log-' || substr(md5(random()::text), 1, 8),
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_name VARCHAR(100) DEFAULT 'System',
    email VARCHAR(150) DEFAULT 'system@company.com',
    date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
