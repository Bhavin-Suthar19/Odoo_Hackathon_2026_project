# 🚀 Hackathon Full-Stack Starter Base (React + Express + Cloud Supabase)

Welcome team! This repository is carefully structured so that **4 developers** (e.g., 2 Frontend Devs + 2 Backend Devs) can instantly start building in parallel with **zero friction** and clean **separation of concerns**.

---

## 🏗️ Architecture & Stack Overview

- **Frontend (`/frontend`)**: React 18 + Vite + Modern Glassmorphic CSS + Axios (Port `5173`)
- **Backend (`/backend`)**: Node.js + Express 4 + REST APIs + Cookies/Sessions (Port `5000`)
- **Database & Auth**: **Cloud Supabase** (PostgreSQL + Supabase Auth SDK)

```
d:\hackothon_odoo\
├── backend/                   # BACKEND WORKSPACE (Port 5000)
│   ├── config/supabase.js     # Cloud Supabase connection client
│   ├── controllers/           # Business rules, Supabase DB calls, API response logic
│   ├── routes/                # API endpoints (/api/auth, /api/health, etc.)
│   ├── middleware/            # Auth/Cookie checks & global error handler
│   └── server.js              # Express app entrypoint & CORS/Cookie setup
└── frontend/                  # FRONTEND WORKSPACE (Port 5173)
    └── src/
        ├── api/               # API clients calling Backend Port 5000
        ├── context/           # Global Auth/Session context
        ├── components/        # Reusable UI components
        └── pages/             # Login, Signup, Dashboard pages
```

---

## ⚡ Quick Start (How to Run the Entire App)

### 1. Install Dependencies for Both Workspaces
From the root directory (`d:\hackothon_odoo`), run:
```bash
npm run install:all
```
*(Or install manually inside `/backend` and `/frontend` using `npm install`)*

### 2. Configure Cloud Supabase Credentials
1. Go to [https://supabase.com](https://supabase.com) and create a free Cloud Project.
2. Open `backend/.env.example`, copy it to `backend/.env`, and add your **Project URL** and **Anon / Service Role Key**:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-or-service-role-key
   SESSION_SECRET=super_secret_hackathon_key_2026
   FRONTEND_URL=http://localhost:5173
   ```

### 3. Start Both Frontend & Backend Concurrently
From the root directory (`d:\hackothon_odoo`), run:
```bash
npm run dev
```
- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API Base**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 👥 How the Team Should Work (Separation of Concerns)

### 🎨 Frontend Developers (`/frontend`)
- **Where to work**: Add new UI pages inside `frontend/src/pages/` and reusable components inside `frontend/src/components/`.
- **Calling Backend APIs**: 
  - Use `apiClient` defined in `frontend/src/api/client.js`.
  - It automatically points to `http://localhost:5000/api` and includes secure HTTP-only cookies (`withCredentials: true`).
  - Example:
    ```javascript
    import apiClient from '../api/client';
    
    // Call backend endpoint
    const response = await apiClient.get('/your-new-feature');
    ```

### ⚙️ Backend Developers (`/backend`)
- **Where to work**:
  1. Define a route in `backend/routes/`.
  2. Write the controller logic in `backend/controllers/` (apply business rules, query Supabase database, and return JSON response).
- **Using Cloud Supabase**:
  - Import `supabase` from `../config/supabase.js`:
    ```javascript
    const supabase = require('../config/supabase');
    
    // Query a Supabase PostgreSQL table
    const { data, error } = await supabase.from('your_table').select('*');
    ```
- **Cookies & Sessions**:
  - `authController.js` demonstrates how secure HTTP-only cookies and session tokens are set when a user logs in or signs up.

---

## 💡 Notes on How Authentication Works (Demo Included)
1. **Signup/Login**: Frontend submits email & password to `/api/auth/register` or `/api/auth/login`.
2. **Backend Processing**:
   - Validates input.
   - Registers/authenticates user in Supabase (or fallback local session if Supabase keys are not set up yet).
   - Issues a secure HTTP-only cookie (`auth_token`) so credentials stay safe from XSS.
3. **Session Check**: Frontend calls `/api/auth/me` on load to check if the session cookie is valid.


AssetFlow – Smart Asset Management System

Project Overview : - 
AssetFlow is a web-based asset management platform that helps organizations manage physical assets throughout their lifecycle. It enables administrators, managers, custodians, and employees to track assets, assign ownership, monitor maintenance, generate reports, and maintain a complete audit history.

Technology Stack : - 
Frontend: React 18 + Vite + Axios
Backend: Node.js + Express.js
Database: Supabase PostgreSQL
Authentication: Supabase Auth + HTTP-only Cookies
Styling: CSS / Tailwind / Glassmorphism (your choice)