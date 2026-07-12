import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const AUTH_API = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if session exists in Supabase backend on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${AUTH_API}/me`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            setUser(json.user);
          }
        }
      } catch (err) {
        // Logged out
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.message || 'Login failed.';
        setError(msg);
        return { success: false, message: msg };
      }

      setUser(json.user);
      return { success: true };
    } catch (err) {
      const msg = 'Network error communicating with server.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (name, email, password, department) => {
    setError(null);
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, department }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json.message || 'Registration failed.';
        setError(msg);
        return { success: false, message: msg };
      }

      setUser(json.user);
      return { success: true };
    } catch (err) {
      const msg = 'Network error communicating with server.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {}
    setUser(null);
  };

  const impersonate = async (email) => {
    setError(null);
    try {
      const res = await fetch(`${AUTH_API}/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setUser(json.user);
      }
    } catch (err) {
      console.error('Impersonate error:', err);
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
        impersonate,
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
