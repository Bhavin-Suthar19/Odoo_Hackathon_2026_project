/**
 * ============================================================================
 * GLOBAL AUTHENTICATION CONTEXT
 * ============================================================================
 * Team Note: Use `useAuth()` custom hook in any page or component to access
 * the current user session and authentication actions.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if an HTTP-only session cookie exists on application load
  useEffect(() => {
    const verifySession = async () => {
      try {
        const data = await authApi.checkSession();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // No active session cookie found
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (name, email, password) => {
    setError(null);
    try {
      const data = await authApi.register(name, email, password);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
