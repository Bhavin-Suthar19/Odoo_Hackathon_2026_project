# AssetFlow — Enterprise Asset & Resource Management

A full-stack ERP-style portal for managing organizational assets, allocations, bookings, maintenance, and audits. Built for **Odoo Hackathon 2026** with a React frontend, Express backend, and Supabase (PostgreSQL) as the cloud database.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI overview, overdue return alerts, quick actions, and recent activity |
| **Organization Setup** | Manage departments, asset categories, and employee directory (Admin only) |
| **Asset Directory** | Create, update, and browse assets with tags, specs, location, and status |
| **Allocation & Transfer** | Allocate/return assets and request or approve inter-user transfers |
| **Resource Booking** | Book shared resources (rooms, equipment) with time slots |
| **Maintenance** | Raise and track maintenance requests with priority and status |
| **Asset Audit** | Run audit cycles with checklists and discrepancy reporting |
| **Reports & Analytics** | Role-based reporting and analytics views |
| **Activity Logs** | System-wide audit trail of user actions |

### Role-Based Access

| Role | Access |
|------|--------|
| **Admin** | Full access including Organization Setup |
| **Asset Manager** | Assets, allocation, booking, maintenance, audit, reports |
| **Department Head** | Same as Asset Manager |
| **Employee** | Dashboard, assets, allocation, booking, maintenance, audit |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Axios, Lucide React, CSS (glassmorphic UI) |
| **Backend** | Node.js, Express 4, bcryptjs, cookie-parser, morgan |
| **Database** | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| **Auth** | HTTP-only session cookies + bcrypt password hashing |

**Ports**

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## Project Structure

```
Odoo_Hackathon_2026_project/
├── backend/                        # Express REST API (port 5000)
│   ├── config/supabase.js          # Supabase client configuration
│   ├── controllers/
│   │   ├── authController.js       # Register, login, logout, session
│   │   └── erpController.js        # All ERP business logic
│   ├── middleware/
│   │   ├── authMiddleware.js       # Cookie/session validation
│   │   └── errorHandler.js         # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── erpRoutes.js            # /api/erp/*
│   │   └── healthRoutes.js         # /api/health
│   ├── sql/
│   │   ├── schema.sql              # Full database schema
│   │   ├── add_password_hash.sql   # Auth migration
│   │   └── add_password_column.sql # Auth migration
│   ├── .env.example                # Environment variable template
│   └── server.js                   # Express entry point
│
├── frontend/                       # React SPA (port 5173)
│   └── src/
│       ├── api/                    # Axios client & auth API helpers
│       ├── components/             # Navbar, Modal, StatusCard, etc.
│       ├── context/                # AuthContext, DataContext
│       └── pages/                  # Dashboard, Assets, Booking, Audit, etc.
│
├── package.json                    # Root scripts (run both apps together)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ and **npm**
- A free [Supabase](https://supabase.com) cloud project

---

## Quick Start

### 1. Clone and install dependencies

From the project root (`Odoo_Hackathon_2026_project/`):

```bash
npm run install:all
```

Or install each workspace manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up Supabase database

1. Create a project at [https://supabase.com](https://supabase.com).
2. Open **SQL Editor** in the Supabase dashboard.
3. Run the schema script:

   ```
   backend/sql/schema.sql
   ```

4. Run the auth migration scripts (in order):

   ```
   backend/sql/add_password_hash.sql
   backend/sql/add_password_column.sql
   ```

### 3. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-or-service-role-key

SESSION_SECRET=hackathon_super_secret_session_key_2026
```

> Get `SUPABASE_URL` and `SUPABASE_ANON_KEY` from **Project Settings → API** in the Supabase dashboard.

### 4. Run the application

**Run frontend and backend together (recommended):**

```bash
npm run dev
```

**Run backend only:**

```bash
cd backend
npm run dev        # development (auto-restart on file changes)
# or
npm start          # production-style
```

**Run frontend only:**

```bash
cd frontend
npm run dev
```

### 5. Verify it works

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- API root: [http://localhost:5000](http://localhost:5000)

---

## API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status and Supabase connection check |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new employee |
| `POST` | `/api/auth/login` | Login with email and password |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current session user (protected) |
| `POST` | `/api/auth/impersonate` | Switch to a demo user (testing) |

### ERP

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/erp/data` | Fetch all master data (departments, assets, bookings, etc.) |
| `POST` | `/api/erp/departments` | Create department |
| `PUT` | `/api/erp/departments/:id` | Update department |
| `PUT` | `/api/erp/departments/:id/toggle` | Toggle department status |
| `POST` | `/api/erp/categories` | Create asset category |
| `PUT` | `/api/erp/categories/:id` | Update category |
| `POST` | `/api/erp/employees` | Create employee |
| `PUT` | `/api/erp/employees/role` | Update employee role |
| `PUT` | `/api/erp/employees/:email/toggle` | Toggle employee status |
| `POST` | `/api/erp/assets` | Create asset |
| `PUT` | `/api/erp/assets/:id` | Update asset |
| `POST` | `/api/erp/assets/:id/allocate` | Allocate asset to user |
| `POST` | `/api/erp/assets/:id/return` | Return allocated asset |
| `POST` | `/api/erp/transfers` | Request asset transfer |
| `PUT` | `/api/erp/transfers/:id/approve` | Approve transfer |
| `PUT` | `/api/erp/transfers/:id/reject` | Reject transfer |
| `POST` | `/api/erp/bookings` | Book a shared resource |
| `PUT` | `/api/erp/bookings/:id/cancel` | Cancel booking |
| `POST` | `/api/erp/maintenances` | Raise maintenance request |
| `PUT` | `/api/erp/maintenances/:id/status` | Update maintenance status |
| `POST` | `/api/erp/audits` | Create audit cycle |
| `PUT` | `/api/erp/audits/:id/checklist` | Update audit checklist |
| `PUT` | `/api/erp/audits/:id/close` | Close audit cycle |

---

## Database Schema

The Supabase PostgreSQL schema includes 11 tables:

| Table | Purpose |
|-------|---------|
| `departments` | Organizational departments |
| `asset_categories` | Asset type definitions with custom fields |
| `employees` | User directory with roles and auth credentials |
| `assets` | Asset inventory with status, location, and holder |
| `asset_history` | Per-asset change history |
| `asset_transfers` | Inter-user transfer requests |
| `resource_bookings` | Shared resource time-slot bookings |
| `maintenance_requests` | Maintenance tickets |
| `audit_cycles` | Audit campaigns with checklists |
| `notifications` | In-app notifications |
| `activity_logs` | System-wide action audit trail |

Full DDL is in `backend/sql/schema.sql`.

---

## Authentication Flow

1. **Register / Login** — Frontend sends credentials to `/api/auth/register` or `/api/auth/login`.
2. **Backend** — Validates input, checks the `employees` table in Supabase, verifies bcrypt password hash, and sets an HTTP-only cookie (`hackathon_session`).
3. **Session check** — On app load, the frontend calls `/api/auth/me` to restore the session.
4. **Logout** — Clears the session cookie via `/api/auth/logout`.

Cookies are sent automatically because the Axios client uses `withCredentials: true`.

---

## Development Guide

### Frontend developers (`/frontend`)

- Add pages in `frontend/src/pages/`
- Add reusable UI in `frontend/src/components/`
- Use the shared API client for all backend calls:

```javascript
import apiClient from '../api/client';

const response = await apiClient.get('/erp/data');
```

### Backend developers (`/backend`)

1. Define routes in `backend/routes/`
2. Implement logic in `backend/controllers/`
3. Query Supabase via the shared client:

```javascript
const { supabase } = require('../config/supabase');

const { data, error } = await supabase.from('assets').select('*');
```

### Available npm scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install root, backend, and frontend dependencies |
| `npm run dev` | Start backend + frontend concurrently |
| `npm run dev:backend` | Start backend only (with file watch) |
| `npm run dev:frontend` | Start frontend only |
| `cd backend && npm start` | Start backend (no watch) |
| `cd frontend && npm run build` | Build frontend for production |
| `cd frontend && npm run preview` | Preview production build |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cloud Supabase database not configured` | Fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `backend/.env` |
| `Route not found` | Ensure backend is running on port 5000 |
| CORS / cookie issues | Confirm `FRONTEND_URL` matches your frontend origin (`http://localhost:5173`) |
| Login fails after signup | Run `add_password_hash.sql` and `add_password_column.sql` in Supabase |
| Empty dashboard data | Run `schema.sql` and verify Supabase tables exist |


