import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, LogOut, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(9, 11, 16, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0.9rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Title */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
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
            <Terminal size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Hackathon<span className="heading-gradient">Core</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              MERN + Cloud Supabase Starter
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setCurrentTab('dashboard')}
            style={{
              background: currentTab === 'dashboard' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: '1px solid',
              borderColor: currentTab === 'dashboard' ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
              color: currentTab === 'dashboard' ? '#c4b5fd' : 'var(--text-secondary)',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Dashboard
          </button>

          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <ShieldCheck size={16} color="#34d399" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setCurrentTab('login')}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
              >
                Login
              </button>
              <button
                onClick={() => setCurrentTab('signup')}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
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
