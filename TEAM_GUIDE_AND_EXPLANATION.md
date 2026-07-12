# 📘 Detailed Hackathon Team Guide & Architecture Explanation

This document provides complete technical notes explaining **how the system works**, **how frontend and backend communicate**, and **how to configure Cloud Supabase**.

---

## 1. How Separation of Concerns is Handled

We separated the workspace into two independent packages:
- `backend/`: Dedicated Node.js + Express server (Port `5000`)
- `frontend/`: Dedicated React + Vite single-page application (Port `5173`)

### Why?
During a 4-person hackathon, having frontend developers edit React files in `frontend/` and backend developers edit server files in `backend/` prevents Git merge conflicts and allows parallel development.

---

## 2. API Connection, Ports & CORS

1. **Frontend Port**: `5173` (`http://localhost:5173`)
2. **Backend Port**: `5000` (`http://localhost:5000`)
3. **API Endpoints**: All API requests are prefixed with `/api`.
   - Health Check: `GET http://localhost:5000/api/health`
   - Signup: `POST http://localhost:5000/api/auth/register`
   - Login: `POST http://localhost:5000/api/auth/login`
   - Current Session Check: `GET http://localhost:5000/api/auth/me`
   - Logout: `POST http://localhost:5000/api/auth/logout`

### How Frontend Calls Backend
Inside `frontend/src/api/client.js`, we use Axios configured with:
```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // MUST BE TRUE to send/receive HTTP-only cookies
});
```

---

## 3. Cookie & Session Management (Security)

Instead of storing sensitive tokens in `localStorage` (which is vulnerable to XSS attacks), the backend sets a secure **HTTP-Only Cookie** named `hackathon_session`.

### How it works:
1. When a user submits Signup or Login (`authController.js`), the backend authenticates the user.
2. The backend calls `res.cookie('hackathon_session', JSON.stringify(userObj), { httpOnly: true })`.
3. The browser automatically saves this cookie and attaches it to every subsequent request made to `http://localhost:5000/api`.
4. Protected backend routes use `requireAuth` middleware (`backend/middleware/authMiddleware.js`) to read and verify this cookie.

---

## 4. Cloud Supabase Configuration

Instead of MongoDB, this project uses **Cloud Supabase** (PostgreSQL + Supabase Auth).

### Step-by-Step Configuration:
1. Go to your Supabase project dashboard at [https://supabase.com](https://supabase.com).
2. Open **Project Settings -> API**.
3. Open `backend/.env` and update:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-public-anon-key
   ```
4. Once updated, the backend automatically connects (`backend/config/supabase.js`), and the UI Dashboard status card will switch to **ONLINE & CONFIGURED**.

---

## 5. Adding New Features (Cheat Sheet for Developers)

### For Backend Devs (`/backend`):
1. Add a route in `backend/routes/`. Example:
   ```javascript
   router.get('/items', requireAuth, getItemsController);
   ```
2. Write the controller in `backend/controllers/`:
   ```javascript
   const { supabase } = require('../config/supabase');

   const getItemsController = async (req, res, next) => {
     const { data, error } = await supabase.from('items').select('*');
     if (error) return next(error);
     res.json({ success: true, items: data });
   };
   ```

### For Frontend Devs (`/frontend`):
1. Call your new endpoint using `apiClient`:
   ```javascript
   import apiClient from '../api/client';

   const response = await apiClient.get('/items');
   console.log(response.data.items);
   ```
2. Display it inside a stunning glassmorphic card (`className="glass-panel"`).
