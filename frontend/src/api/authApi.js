/**
 * ============================================================================
 * AUTHENTICATION API SERVICES
 * ============================================================================
 * Helper functions wrapping authentication endpoints (/api/auth/*).
 * ============================================================================
 */

import apiClient from './client';

export const authApi = {
  // Register a new user
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Login existing user
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Check current session
  checkSession: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Check backend health & Supabase status
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
