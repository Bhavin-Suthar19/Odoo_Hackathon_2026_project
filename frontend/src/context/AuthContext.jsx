import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if a session exists in localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('af_current_user');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      // Load current employees from localStorage
      const empsSaved = localStorage.getItem('af_employees');
      const employees = empsSaved ? JSON.parse(empsSaved) : [];

      const foundUser = employees.find((e) => e.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        throw new Error('User not found. Try manager@company.com or priya@company.com');
      }

      if (foundUser.status === 'Inactive') {
        throw new Error('This account has been deactivated by the Admin.');
      }

      // In a real app we'd verify password. For this hackathon frontend, any password works.
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role, // 'Admin', 'Asset Manager', 'Department Head', 'Employee'
        department: foundUser.department,
        provider: 'Local-Mock',
      };

      setUser(userSession);
      localStorage.setItem('af_current_user', JSON.stringify(userSession));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const signup = async (name, email, password) => {
    setError(null);
    try {
      const empsSaved = localStorage.getItem('af_employees');
      let employees = empsSaved ? JSON.parse(empsSaved) : [];

      const exists = employees.some((e) => e.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('Email is already registered.');
      }

      // Add to employee directory in localStorage. Roles can only be assigned by Admin
      const newEmployee = {
        id: `emp-${Date.now()}`,
        name,
        email,
        role: 'Employee', // ALWAYS creates Employee account only
        department: 'Engineering', // Default department
        status: 'Active',
      };

      employees.push(newEmployee);
      localStorage.setItem('af_employees', JSON.stringify(employees));

      const userSession = {
        id: newEmployee.id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        department: newEmployee.department,
        provider: 'Local-Mock',
      };

      setUser(userSession);
      localStorage.setItem('af_current_user', JSON.stringify(userSession));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('af_current_user');
  };

  // Impersonate function for hackathon testers
  const impersonate = (email) => {
    const empsSaved = localStorage.getItem('af_employees');
    const employees = empsSaved ? JSON.parse(empsSaved) : [];
    const foundUser = employees.find((e) => e.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        department: foundUser.department,
        provider: 'Impersonation-Tool',
      };
      setUser(userSession);
      localStorage.setItem('af_current_user', JSON.stringify(userSession));
      // Force reload or trigger state update
      window.location.reload();
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
