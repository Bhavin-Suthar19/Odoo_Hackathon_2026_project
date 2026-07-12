/**
 * ============================================================================
 * CENTRALIZED API CLIENT
 * ============================================================================
 * Team Note: Frontend developers should use this Axios instance for all API
 * calls to the backend. It automatically points to http://localhost:5000/api
 * and sends/receives HTTP-only cookies (withCredentials: true).
 * ============================================================================
 */

import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // CRITICAL: Ensures browser sends & saves cookies across ports
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for clear console logging during hackathon debugging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '📡 [API Error]:',
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;
