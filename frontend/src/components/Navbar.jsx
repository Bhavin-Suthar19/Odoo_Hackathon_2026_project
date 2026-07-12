import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldAlert, Sun, Moon } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout, impersonate } = useAuth();
  const [isLight, setIsLight] = useState(
    () => localStorage.getItem('af_theme') === 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('af_theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  const mockUsers = [
    { name: 'Admin User', email: 'admin@company.com', role: 'Admin' },
    { name: 'Alex Mercer', email: 'manager@company.com', role: 'Asset Manager' },
    { name: 'Priya Shah', email: 'priya@company.com', role: 'Department Head' },
    { name: 'Raj Patel', email: 'raj@company.com', role: 'Employee' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-navbar)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0.8rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Logo & Title */}
        <div
          onClick={() => {
            if (user) setCurrentTab('dashboard');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: user ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>AF</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              Asset<span className="heading-gradient">Flow</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Enterprise Resource & Lifecycle ERP
            </p>
          </div>
        </div>

        {/* Impersonation Panel (Developer Assist) */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              padding: '0.35rem 0.8rem',
              borderRadius: '12px',
            }}
          >
            <ShieldAlert size={14} color="#a78bfa" style={{ animation: 'pulseGlow 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple-soft)', fontWeight: 600 }}>
              Testing Tool (Impersonate):
            </span>
            <select
              value={user.email}
              onChange={(e) => impersonate(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {mockUsers.map((mu) => (
                <option key={mu.email} value={mu.email}>
                  {mu.role} ({mu.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Session Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsLight(!isLight)}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.65rem',
              fontSize: '0.8rem',
              borderRadius: '10px',
              display: 'flex',
            }}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: 'var(--accent-purple-soft)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '0.35rem',
                }}
              >
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentTab('login')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentTab('signup')}
                className="btn btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
